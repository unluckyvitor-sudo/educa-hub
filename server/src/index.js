import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { db, PASTA_DADOS } from './db.js';
import { carregarUsuario, gerarHash, conferirSenha, encerrarSessoesDoUsuario, limparSessoesVencidas, ErroDeEntrada } from './auth.js';
import { iniciarTempoReal } from './tempoReal.js';
import { limitar, MINUTO, HORA } from './limites.js';
import { limparRegistrosAntigos } from './registro.js';
import { copiaDiaria } from './copias.js';
import { servirCliente } from './estaticos.js';
import rotasConta from './rotas/conta.js';
import rotasAprender from './rotas/aprender.js';
import rotasSocial from './rotas/social.js';
import rotasProfessor from './rotas/professor.js';
import rotasAdmin from './rotas/admin.js';
import rotasSuporte from './rotas/suporte.js';
import rotasConteudo from './rotas/conteudo.js';
import rotasAoVivo from './rotas/aoVivo.js';

const PORTA = Number(process.env.PORT) || 3001;
const PASTA_CLIENTE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'client', 'dist');

/** Troca a senha sorteada, se ainda estiver em uso, pela de EDUCAHUB_ADMIN_SENHA e apaga o arquivo que a guardava. */
async function trocarSenhaSorteada(nova, arquivo) {
  const sorteada = /Senha: (\S+)/.exec(fs.readFileSync(arquivo, 'utf8'))?.[1];
  const admin = db.prepare("SELECT id, senha_hash FROM usuarios WHERE usuario = 'admin' AND papel = 'admin'").get();
  if (!sorteada || !admin || !(await conferirSenha(sorteada, admin.senha_hash))) return;
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(await gerarHash(nova), admin.id);
  encerrarSessoesDoUsuario(admin.id);
  fs.rmSync(arquivo);
  console.log('A senha inicial do administrador passou a ser a de EDUCAHUB_ADMIN_SENHA. Troque-a em Configurações depois do primeiro acesso.');
}

/**
 * Garante a conta de administrador. Sem EDUCAHUB_ADMIN_SENHA, a senha inicial é sorteada e gravada em um arquivo da
 * pasta de dados. Em uma hospedagem não dá para abrir esse arquivo: lá a senha vem da variável, que pode ser definida
 * antes ou depois de o servidor ligar pela primeira vez (ela vale enquanto a senha sorteada não tiver sido trocada).
 */
async function garantirAdministrador() {
  let definida = process.env.EDUCAHUB_ADMIN_SENHA || null;
  if (definida && definida.length < 10) {
    console.error('EDUCAHUB_ADMIN_SENHA foi ignorada: precisa ter pelo menos 10 caracteres.');
    definida = null;
  }
  const arquivo = path.join(PASTA_DADOS, 'admin-inicial.txt');
  if (db.prepare("SELECT 1 FROM usuarios WHERE papel = 'admin'").get()) {
    if (definida && fs.existsSync(arquivo)) await trocarSenhaSorteada(definida, arquivo);
    return;
  }
  if (definida) {
    db.prepare("INSERT INTO usuarios (papel, nome, usuario, senha_hash) VALUES ('admin', 'Administrador', 'admin', ?)").run(await gerarHash(definida));
    console.log('Conta de administrador criada com a senha de EDUCAHUB_ADMIN_SENHA. Troque-a em Configurações depois do primeiro acesso.');
    return;
  }
  const senha = crypto.randomBytes(9).toString('base64url');
  db.prepare("INSERT INTO usuarios (papel, nome, usuario, senha_hash) VALUES ('admin', 'Administrador', 'admin', ?)").run(await gerarHash(senha));
  fs.writeFileSync(
    arquivo,
    `EDUCA HUB — acesso de administrador\n\nUsuário: admin\nSenha: ${senha}\n\nTroque a senha em Configurações (ou com "npm run admin:senha") e apague este arquivo.\n`,
  );
  console.log(`Conta de administrador criada. Credenciais em: ${arquivo}`);
}

const app = express();
app.disable('x-powered-by');
// Atrás do proxy de uma hospedagem (que termina o HTTPS e repassa o IP de quem acessa), defina EDUCAHUB_PROXY=1:
// sem isso o servidor não saberia que a conexão é segura nem distinguiria um visitante do outro.
app.set('trust proxy', Number(process.env.EDUCAHUB_PROXY) || process.env.EDUCAHUB_PROXY || 'loopback');

// Só o próprio site pode carregar scripts, estilos e conexões; nada de fora roda nas páginas da plataforma.
const POLITICA_DE_CONTEUDO = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // o React e as animações escrevem estilos nos elementos
  "img-src 'self' data: blob:", // retratos do gato são gerados no navegador
  "font-src 'self'",
  "connect-src 'self' ws: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

app.use((req, res, proximo) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'same-origin');
  res.set('X-Frame-Options', 'DENY'); // a plataforma não abre dentro de outro site (clickjacking)
  res.set('Content-Security-Policy', POLITICA_DE_CONTEUDO);
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=15552000');
  proximo();
});
app.use(express.json({ limit: '200kb' }));

// Além do cookie SameSite, toda escrita exige um cabeçalho que formulários de outros sites não conseguem enviar.
app.use('/api', (req, res, proximo) => {
  const leitura = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (!leitura && req.get('X-Requested-With') !== 'educahub') return res.status(403).json({ erro: 'Requisição recusada.' });
  proximo();
});

app.use('/api', carregarUsuario);
// Teto de requisições: por usuário logado (uma sala inteira pode dividir o mesmo IP) ou por IP para quem não entrou.
app.use('/api', limitar('api', 600, MINUTO, 'Muitas requisições em pouco tempo. Aguarde um instante.'));
app.use('/api', rotasConta);
app.use('/api', rotasAprender);
app.use('/api', rotasSocial);
app.use('/api', rotasSuporte);
app.use('/api/prof', rotasProfessor);
app.use('/api/conteudo', rotasConteudo);
app.use('/api/aovivo', rotasAoVivo);
app.use('/api/admin', rotasAdmin);
app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

if (fs.existsSync(PASTA_CLIENTE)) servirCliente(app, PASTA_CLIENTE);

app.use((erro, _req, res, _proximo) => {
  if (erro instanceof ErroDeEntrada) return res.status(400).json({ erro: erro.message });
  if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Dados inválidos.' });
  console.error(erro);
  res.status(500).json({ erro: 'Algo deu errado no servidor. Tente de novo.' });
});

const servidor = http.createServer(app);
iniciarTempoReal(servidor);

await garantirAdministrador();

// Faxina periódica: sessões vencidas, registros de auditoria antigos e a cópia de segurança do dia.
const faxina = () => {
  limparSessoesVencidas();
  limparRegistrosAntigos();
  copiaDiaria();
};
faxina();
setInterval(faxina, 6 * HORA).unref();

servidor.listen(PORTA, () => {
  console.log(`EDUCA HUB — servidor em http://localhost:${PORTA}`);
});

// Uma hospedagem encerra o processo com SIGTERM a cada nova publicação: fecha o banco e sai, sem esperar ser derrubado.
process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
