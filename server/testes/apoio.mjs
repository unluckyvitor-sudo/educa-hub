// Apoio aos testes de ponta a ponta: login, chamadas à API e conexão em tempo real.
// Os testes rodam contra o servidor ligado, com as contas de demonstração (npm run seed).
import { io } from 'socket.io-client';

export const BASE = process.env.EDUCAHUB_URL || 'http://localhost:3001';

/** Senha das contas de demonstração (1º argumento) e, opcionalmente, a do administrador (2º argumento). */
export function lerSenhas() {
  const [demo, admin = null] = process.argv.slice(2);
  if (!demo) {
    console.error('Uso: node testes/<arquivo>.teste.mjs <senha-das-contas-demo> [senha-do-admin]');
    process.exit(1);
  }
  return { demo, admin };
}

export function verificar(condicao, texto) {
  if (!condicao) throw new Error(`FALHOU: ${texto}`);
  console.log(`ok — ${texto}`);
}

/** Entra com a conta e devolve funções para chamar a API como ela. */
export async function entrar(usuario, senha) {
  const r = await fetch(`${BASE}/api/auth/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'educahub' },
    body: JSON.stringify({ usuario, senha }),
  });
  if (!r.ok) throw new Error(`Login de ${usuario} falhou: ${r.status}`);
  const cookie = r.headers.getSetCookie()[0].split(';')[0];
  const { usuario: dados } = await r.json();
  return { ...dados, cookie, ...clienteDe(cookie) };
}

export function clienteDe(cookie) {
  const chamar = async (metodo, caminho, corpo, cabecalhos = { 'X-Requested-With': 'educahub' }) => {
    const r = await fetch(`${BASE}/api${caminho}`, {
      method: metodo,
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...cabecalhos, ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
    return { status: r.status, dados: await r.json().catch(() => null), cabecalhos: r.headers };
  };
  return {
    chamar,
    get: (caminho) => chamar('GET', caminho),
    post: (caminho, corpo = {}) => chamar('POST', caminho, corpo),
    put: (caminho, corpo = {}) => chamar('PUT', caminho, corpo),
    apagar: (caminho) => chamar('DELETE', caminho),
  };
}

export async function conectar(cookie) {
  const socket = io(BASE, { extraHeaders: { cookie }, transports: ['websocket'] });
  await new Promise((ok, erro) => {
    socket.once('connect', ok);
    socket.once('connect_error', erro);
  });
  return socket;
}

export const esperar = (socket, evento, ms = 25000) =>
  new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error(`Tempo esgotado esperando "${evento}"`)), ms);
    socket.once(evento, (dados) => {
      clearTimeout(t);
      ok(dados);
    });
  });

export const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
