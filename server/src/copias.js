// Cópias de segurança do banco: uma por dia (automática) e sob demanda (painel do administrador ou "npm run backup").
import fs from 'node:fs';
import path from 'node:path';
import { db, PASTA_DADOS, diaLocal } from './db.js';

// Por padrão ficam ao lado do banco. Para protegê-las de um defeito no disco, aponte EDUCAHUB_COPIAS
// para outro lugar (pen drive, outra unidade ou uma pasta sincronizada: a cópia pronta é um arquivo comum).
export const PASTA_COPIAS = process.env.EDUCAHUB_COPIAS || path.join(PASTA_DADOS, 'copias');
const MANTER = 14;
const NOME = /^educahub-(\d{4}-\d{2}-\d{2})_\d{6}\.db$/;

const doisDigitos = (n) => String(n).padStart(2, '0');

export function listarCopias() {
  if (!fs.existsSync(PASTA_COPIAS)) return [];
  return fs
    .readdirSync(PASTA_COPIAS)
    .filter((nome) => NOME.test(nome))
    .sort()
    .reverse()
    .map((nome) => {
      const info = fs.statSync(path.join(PASTA_COPIAS, nome));
      return { nome, dia: NOME.exec(nome)[1], tamanho: info.size, criadaEm: info.mtime.toISOString() };
    });
}

/** Grava uma cópia íntegra do banco (funciona com o servidor em uso) e descarta as mais antigas. */
export function fazerCopia() {
  fs.mkdirSync(PASTA_COPIAS, { recursive: true });
  const agora = new Date();
  const hora = `${doisDigitos(agora.getHours())}${doisDigitos(agora.getMinutes())}${doisDigitos(agora.getSeconds())}`;
  const destino = path.join(PASTA_COPIAS, `educahub-${diaLocal(agora)}_${hora}.db`);
  if (fs.existsSync(destino)) fs.rmSync(destino);
  db.exec(`VACUUM INTO '${destino.replaceAll("'", "''")}'`);
  for (const antiga of listarCopias().slice(MANTER)) fs.rmSync(path.join(PASTA_COPIAS, antiga.nome));
  return listarCopias()[0];
}

/** Garante a cópia do dia. Uma falha aqui (disco cheio, pasta removida) não pode derrubar o servidor. */
export function copiaDiaria() {
  try {
    if (listarCopias()[0]?.dia !== diaLocal()) fazerCopia();
  } catch (erro) {
    console.error('Não foi possível fazer a cópia de segurança diária:', erro.message);
  }
}

export function resumoDasCopias() {
  const copias = listarCopias();
  return { ultima: copias[0] ?? null, total: copias.length, pasta: PASTA_COPIAS, manter: MANTER };
}
