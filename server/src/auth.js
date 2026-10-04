import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { db } from './db.js';
import { SERIE_POR_ID } from './conteudo/index.js';
import { AVATAR_PADRAO } from './loja.js';
import { infoNivel, sequenciaAtual, jogouHoje } from './regras.js';
import { limiteAtingido, contarUso, zerarLimite, MINUTO } from './limites.js';
import { pendenciasDeTermos } from './termos.js';

const scrypt = promisify(crypto.scrypt);
const COOKIE = 'eh_sessao';
const DURACAO_MS = 30 * 24 * 60 * 60 * 1000;

export async function gerarHash(senha) {
  const sal = crypto.randomBytes(16);
  const chave = await scrypt(senha, sal, 64);
  return `scrypt$${sal.toString('hex')}$${chave.toString('hex')}`;
}

export async function conferirSenha(senha, hash) {
  const [, salHex, chaveHex] = String(hash).split('$');
  if (!salHex || !chaveHex) return false;
  const esperada = Buffer.from(chaveHex, 'hex');
  const chave = await scrypt(senha, Buffer.from(salHex, 'hex'), 64);
  return chave.length === esperada.length && crypto.timingSafeEqual(chave, esperada);
}

// Quando o usuário não existe, o login confere a senha contra este hash de mentira:
// assim a resposta demora o mesmo tempo e não revela quais nomes de usuário existem.
const hashDeMentira = gerarHash(crypto.randomBytes(16).toString('hex'));

/** Confere usuário e senha gastando o mesmo tempo quer a conta exista, quer não. */
export async function conferirLogin(conta, senha) {
  if (typeof senha !== 'string') return false;
  const confere = await conferirSenha(senha, conta ? conta.senha_hash : await hashDeMentira);
  return !!conta && confere;
}

const hashDoToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export function criarSessao(req, res, usuarioId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + DURACAO_MS);
  db.prepare('INSERT INTO sessoes (token_hash, usuario_id, expira_em) VALUES (?, ?, ?)').run(
    hashDoToken(token), usuarioId, expira.toISOString(),
  );
  // Em HTTPS o cookie só trafega por conexão segura.
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: req.secure, expires: expira, path: '/' });
}

export function encerrarSessao(req, res) {
  const token = lerCookie(req.headers.cookie);
  if (token) db.prepare('DELETE FROM sessoes WHERE token_hash = ?').run(hashDoToken(token));
  res.clearCookie(COOKIE, { path: '/' });
}

export function encerrarSessoesDoUsuario(usuarioId) {
  db.prepare('DELETE FROM sessoes WHERE usuario_id = ?').run(usuarioId);
}

/** Encerra as sessões do usuário em outros aparelhos, mantendo a desta requisição (troca de senha). */
export function encerrarOutrasSessoes(req, usuarioId) {
  const token = lerCookie(req.headers.cookie);
  db.prepare('DELETE FROM sessoes WHERE usuario_id = ? AND token_hash != ?').run(usuarioId, token ? hashDoToken(token) : '');
}

export function limparSessoesVencidas() {
  db.prepare('DELETE FROM sessoes WHERE expira_em <= ?').run(new Date().toISOString());
}

function lerCookie(cabecalho) {
  for (const parte of String(cabecalho || '').split(';')) {
    const [nome, ...resto] = parte.trim().split('=');
    // O token é sempre hexadecimal; qualquer outra coisa é descartada sem ir ao banco.
    if (nome === COOKIE) return /^[0-9a-f]{64}$/.test(resto.join('=')) ? resto.join('=') : null;
  }
  return null;
}

/** Usuário dono do cookie de sessão (ou null). Serve tanto para HTTP quanto para o socket. */
export function usuarioDoCookie(cabecalho) {
  const token = lerCookie(cabecalho);
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT u.* FROM sessoes s JOIN usuarios u ON u.id = s.usuario_id
         WHERE s.token_hash = ? AND s.expira_em > ?`,
      )
      .get(hashDoToken(token), new Date().toISOString()) ?? null
  );
}

export function carregarUsuario(req, _res, next) {
  req.usuario = usuarioDoCookie(req.headers.cookie);
  next();
}

export function exigirLogin(req, res, next) {
  if (!req.usuario) return res.status(401).json({ erro: 'Faça login para continuar.' });
  if (req.usuario.status === 'bloqueado') return res.status(403).json({ erro: 'Esta conta está bloqueada.' });
  next();
}

export const exigirPapel = (...papeis) => (req, res, next) => {
  exigirLogin(req, res, () => {
    if (!papeis.includes(req.usuario.papel)) return res.status(403).json({ erro: 'Você não tem acesso a esta área.' });
    if (req.usuario.status !== 'ativo') {
      return res.status(403).json({ erro: 'Sua conta de professor aguarda aprovação do administrador.' });
    }
    next();
  });
};

// Limite de tentativas de login: por IP + usuário (força bruta em uma conta)
// e por IP sozinho (alguém testando uma senha em muitas contas).
const MAX_TENTATIVAS = 8;
const MAX_TENTATIVAS_POR_IP = 150; // folgado: uma sala inteira pode entrar pela mesma rede
const JANELA_MS = 10 * MINUTO;

const chavesDeLogin = (ip, usuario) => [`login|${ip}|${usuario}`, `login-ip|${ip}`];

export function loginBloqueado(ip, usuario) {
  const [daConta, doIp] = chavesDeLogin(ip, usuario);
  return limiteAtingido(daConta, MAX_TENTATIVAS) || limiteAtingido(doIp, MAX_TENTATIVAS_POR_IP);
}

export function registrarFalhaLogin(ip, usuario) {
  for (const chave of chavesDeLogin(ip, usuario)) contarUso(chave, JANELA_MS);
}

export function limparFalhasLogin(ip, usuario) {
  zerarLimite(chavesDeLogin(ip, usuario)[0]);
}

export function avatarDe(usuario) {
  try {
    return { ...AVATAR_PADRAO, ...JSON.parse(usuario.avatar_json || '{}') };
  } catch {
    return { ...AVATAR_PADRAO };
  }
}

/** Dados que qualquer usuário logado pode ver sobre outro. */
export function resumoPublico(u) {
  return {
    id: u.id,
    papel: u.papel,
    nome: u.nome,
    usuario: u.usuario,
    serie: u.serie,
    serieNome: SERIE_POR_ID[u.serie]?.nome ?? null,
    avatar: avatarDe(u),
    xp: u.xp,
    nivel: infoNivel(u.xp).nivel,
    sequencia: sequenciaAtual(u),
  };
}

/** Dados completos do próprio usuário. */
export function perfilProprio(u) {
  return {
    ...resumoPublico(u),
    status: u.status,
    email: u.email,
    etapa: SERIE_POR_ID[u.serie]?.etapa ?? null,
    curso: u.curso,
    instituicao: u.instituicao,
    nascimento: u.nascimento,
    bio: u.bio,
    disciplinas: u.disciplinas,
    formacao: u.formacao,
    moedas: u.moedas,
    maiorSequencia: u.maior_sequencia,
    jogouHoje: jogouHoje(u),
    nivelInfo: infoNivel(u.xp),
    criadoEm: u.criado_em,
    responsavel: u.responsavel ?? null,
    // O que falta aceitar ou informar para a conta ficar em dia com os termos; null quando está tudo certo.
    pendencias: pendenciasDeTermos(u),
  };
}

// ───────────── Validação de entrada ─────────────

export class ErroDeEntrada extends Error {}

/** Lê um campo de texto do corpo da requisição, validando tamanho. */
export function texto(valor, rotulo, { min = 0, max = 200, opcional = false } = {}) {
  if (valor == null || valor === '') {
    if (opcional || min === 0) return null;
    throw new ErroDeEntrada(`Preencha o campo ${rotulo}.`);
  }
  if (typeof valor !== 'string') throw new ErroDeEntrada(`Campo ${rotulo} inválido.`);
  const limpo = valor.trim();
  if (limpo.length < min) throw new ErroDeEntrada(`${rotulo} precisa ter pelo menos ${min} caracteres.`);
  if (limpo.length > max) throw new ErroDeEntrada(`${rotulo} pode ter no máximo ${max} caracteres.`);
  return limpo || null;
}

export function inteiro(valor, rotulo, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n < min || n > max) throw new ErroDeEntrada(`${rotulo} deve ser um número entre ${min} e ${max}.`);
  return n;
}
