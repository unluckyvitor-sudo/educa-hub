// Entrega dos arquivos do cliente (client/dist) em produção: texto comprimido e cache longo para o que tem o conteúdo no nome.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import express from 'express';

const TEXTO = new Set(['.js', '.css', '.html', '.svg', '.json', '.txt', '.map']);
const UM_ANO = 'public, max-age=31536000, immutable';

/** Comprime uma vez cada arquivo (por versão) e guarda na memória: o JavaScript cai para cerca de um quarto do tamanho. */
function criarCompressor(pasta) {
  const prontos = new Map(); // "caminho|codificação" → { carimbo, corpo }

  return (req, res, proximo) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return proximo();
    const aceita = String(req.headers['accept-encoding'] ?? '');
    const codificacao = /\bbr\b/.test(aceita) ? 'br' : /\bgzip\b/.test(aceita) ? 'gzip' : null;
    let relativo;
    try {
      relativo = decodeURIComponent(req.path);
    } catch {
      return proximo();
    }
    const arquivo = path.join(pasta, relativo);
    // Só arquivos de texto dentro da pasta do cliente (nada de "../").
    if (!codificacao || !TEXTO.has(path.extname(arquivo)) || !arquivo.startsWith(pasta + path.sep)) return proximo();

    let info;
    try {
      info = fs.statSync(arquivo);
    } catch {
      return proximo();
    }
    if (!info.isFile()) return proximo();

    const chave = `${arquivo}|${codificacao}`;
    const carimbo = `${info.size}-${info.mtimeMs}`;
    let pronto = prontos.get(chave);
    if (pronto?.carimbo !== carimbo) {
      const original = fs.readFileSync(arquivo);
      const corpo =
        codificacao === 'br'
          ? zlib.brotliCompressSync(original, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: original.length } })
          : zlib.gzipSync(original, { level: 8 });
      pronto = { carimbo, corpo };
      prontos.set(chave, pronto);
    }

    res.type(path.extname(arquivo));
    res.set('Content-Encoding', codificacao);
    res.set('Vary', 'Accept-Encoding');
    res.set('Cache-Control', relativo.startsWith('/assets/') ? UM_ANO : 'no-cache');
    res.set('ETag', `"${carimbo}-${codificacao}"`);
    if (req.headers['if-none-match'] === `"${carimbo}-${codificacao}"`) return res.status(304).end();
    res.send(pronto.corpo);
  };
}

/** Liga a entrega do cliente ao app: arquivos, compressão e a página única para qualquer rota da interface. */
export function servirCliente(app, pasta) {
  const comprimir = criarCompressor(pasta);
  app.use(comprimir);
  app.use(
    express.static(pasta, {
      index: false,
      setHeaders: (res, arquivo) => {
        // Em /assets o nome do arquivo muda quando o conteúdo muda: o navegador pode guardar para sempre.
        res.set('Cache-Control', arquivo.includes(`${path.sep}assets${path.sep}`) ? UM_ANO : 'no-cache');
      },
    }),
  );
  // Qualquer outro endereço é uma rota da interface: recebe a página única (sempre a versão mais nova).
  app.get('/{*caminho}', (req, res, proximo) => {
    req.url = '/index.html';
    comprimir(req, res, () => {
      res.set('Cache-Control', 'no-cache');
      res.sendFile(path.join(pasta, 'index.html'), (erro) => erro && proximo(erro));
    });
  });
}
