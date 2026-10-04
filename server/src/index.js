import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { db, PASTA_DADOS } from './db.js';
import { carregarUsuario, gerarHash, limparSessoesVencidas, ErroDeEntrada } from './auth.js';
import { iniciarTempoReal } from './tempoReal.js';
import { limitar, MINUTO, HORA } from './limites.js';
import { limparRegistrosAntigos } from './registro.js';
import rotasConta from './rotas/conta.js';
import rotasAprender from './rotas/aprender.js';
import rotasSocial from './rotas/social.js';
import rotasProfessor from './rotas/professor.js';
import rotasAdmin from './rotas/admin.js';
import rotasSuporte from './rotas/suporte.js';

const PORTA = Number(process.env.PORT) || 3001;
const PASTA_CLIENTE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'client', 'dist');

/** Na primeira execução, cria a conta de administrador com uma senha aleatória gravada em arquivo local. */
async function garantirAdministrador() {
  if (db.prepare("SELECT 1 FROM usuarios WHERE papel = 'admin'").get()) return;
  const senha = crypto.randomBytes(9).toString('base64url');
  db.prepare("INSERT INTO usuarios (papel, nome, usuario, senha_hash) VALUES ('admin', 'Administrador', 'admin', ?)").run(await gerarHash(senha));
  const arquivo = path.join(PASTA_DADOS, 'admin-inicial.txt');
  fs.writeFileSync(
    arquivo,
    `EDUCA HUB — acesso de administrador\n\nUsuário: admin\nSenha: ${senha}\n\nTroque a senha em Configurações (ou com "npm run admin:senha") e apague este arquivo.\n`,
  );
  console.log(`Conta de administrador criada. Credenciais em: ${arquivo}`);
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');

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
app.use('/api/admin', rotasAdmin);
app.use('/api', (_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

if (fs.existsSync(PASTA_CLIENTE)) {
  app.use(express.static(PASTA_CLIENTE));
  app.get('/{*caminho}', (_req, res) => res.sendFile(path.join(PASTA_CLIENTE, 'index.html')));
}

app.use((erro, _req, res, _proximo) => {
  if (erro instanceof ErroDeEntrada) return res.status(400).json({ erro: erro.message });
  if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Dados inválidos.' });
  console.error(erro);
  res.status(500).json({ erro: 'Algo deu errado no servidor. Tente de novo.' });
});

const servidor = http.createServer(app);
iniciarTempoReal(servidor);

await garantirAdministrador();

// Faxina periódica: sessões vencidas e registros de auditoria antigos.
const faxina = () => {
  limparSessoesVencidas();
  limparRegistrosAntigos();
};
faxina();
setInterval(faxina, 6 * HORA).unref();

servidor.listen(PORTA, () => {
  console.log(`EDUCA HUB — servidor em http://localhost:${PORTA}`);
});
