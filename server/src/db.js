import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// O banco fica fora da pasta do projeto por padrão: pastas sincronizadas (OneDrive)
// travam o arquivo do SQLite. Defina EDUCAHUB_DADOS para usar outro local.
export const PASTA_DADOS =
  process.env.EDUCAHUB_DADOS ||
  (process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'EducaHub')
    : path.join(os.homedir(), '.educahub'));

fs.mkdirSync(PASTA_DADOS, { recursive: true });

export const db = new DatabaseSync(path.join(PASTA_DADOS, 'educahub.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY,
  papel TEXT NOT NULL CHECK (papel IN ('aluno', 'professor', 'admin')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'bloqueado')),
  nome TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  email TEXT,
  senha_hash TEXT NOT NULL,
  serie TEXT,
  curso TEXT,
  instituicao TEXT,
  nascimento TEXT,
  bio TEXT,
  disciplinas TEXT,
  formacao TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  moedas INTEGER NOT NULL DEFAULT 0,
  sequencia INTEGER NOT NULL DEFAULT 0,
  maior_sequencia INTEGER NOT NULL DEFAULT 0,
  ultimo_dia_ativo TEXT,
  avatar_json TEXT NOT NULL DEFAULT '{}',
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  visto_em TEXT
);

CREATE TABLE IF NOT EXISTS sessoes (
  token_hash TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventario (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  obtido_em TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, item_id)
);

CREATE TABLE IF NOT EXISTS amizades (
  id INTEGER PRIMARY KEY,
  de_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  para_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (de_id, para_id)
);

CREATE TABLE IF NOT EXISTS turmas (
  id INTEGER PRIMARY KEY,
  professor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  serie TEXT NOT NULL,
  descricao TEXT,
  codigo TEXT NOT NULL UNIQUE,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS turma_membros (
  turma_id INTEGER NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  aluno_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  entrou_em TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (turma_id, aluno_id)
);

CREATE TABLE IF NOT EXISTS missoes (
  id INTEGER PRIMARY KEY,
  turma_id INTEGER NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  professor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  periodo TEXT NOT NULL CHECK (periodo IN ('diaria', 'semanal')),
  tipo TEXT NOT NULL CHECK (tipo IN ('atividades', 'acertos', 'quiz')),
  materia TEXT,
  meta INTEGER NOT NULL DEFAULT 1,
  recompensa_xp INTEGER NOT NULL DEFAULT 0,
  recompensa_moedas INTEGER NOT NULL DEFAULT 0,
  questoes_json TEXT,
  inicio TEXT NOT NULL,
  fim TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS atividades (
  id INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  materia TEXT,
  topico_id TEXT,
  missao_id INTEGER REFERENCES missoes(id) ON DELETE SET NULL,
  modo TEXT NOT NULL,
  acertos INTEGER NOT NULL,
  total INTEGER NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  moedas INTEGER NOT NULL DEFAULT 0,
  duracao_s INTEGER NOT NULL DEFAULT 0,
  dia TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_atividades_usuario ON atividades (usuario_id, dia);

CREATE TABLE IF NOT EXISTS ganhos (
  id INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  moedas INTEGER NOT NULL DEFAULT 0,
  origem TEXT NOT NULL,
  dia TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ganhos_usuario ON ganhos (usuario_id, dia);

CREATE TABLE IF NOT EXISTS resgates (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  periodo TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (usuario_id, chave, periodo)
);

CREATE TABLE IF NOT EXISTS duelos (
  id INTEGER PRIMARY KEY,
  jogador1_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  jogador2_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('amigo', 'aleatorio', 'treino')),
  serie TEXT NOT NULL,
  materia TEXT,
  pontos1 INTEGER NOT NULL DEFAULT 0,
  pontos2 INTEGER NOT NULL DEFAULT 0,
  vencedor_id INTEGER,
  dia TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY,
  duelo_ref TEXT,
  de_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  para_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  texto TEXT NOT NULL,
  link TEXT,
  lida INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes (usuario_id, lida);

-- Suporte: cada chamado é uma conversa entre quem pediu ajuda e quem atende.
-- responsavel_id é o professor que atende (dúvida de um aluno da turma dele); NULL = equipe da plataforma.
-- AUTOINCREMENT: o número de um chamado excluído nunca é reaproveitado (links antigos não caem em outra conversa).
CREATE TABLE IF NOT EXISTS chamados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  responsavel_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL,
  assunto TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'respondido', 'resolvido')),
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
  novas_para_usuario INTEGER NOT NULL DEFAULT 0,
  novas_para_atendente INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chamados_usuario ON chamados (usuario_id);
CREATE INDEX IF NOT EXISTS idx_chamados_atendimento ON chamados (responsavel_id, status);

CREATE TABLE IF NOT EXISTS chamado_mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id INTEGER NOT NULL REFERENCES chamados(id) ON DELETE CASCADE,
  autor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  do_atendente INTEGER NOT NULL DEFAULT 0,
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chamado_mensagens ON chamado_mensagens (chamado_id);

CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('elogio', 'sugestao', 'problema')),
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  texto TEXT,
  pagina TEXT,
  lido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Registro de auditoria. Sem chaves estrangeiras e com os nomes copiados no momento do evento:
-- o histórico continua correto mesmo se a conta for excluída (e o número dela, reaproveitado).
CREATE TABLE IF NOT EXISTS auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  acao TEXT NOT NULL,
  usuario_id INTEGER,
  usuario_nome TEXT,
  alvo_id INTEGER,
  alvo_nome TEXT,
  ip TEXT,
  detalhe TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

/** Executa a função dentro de uma transação. */
export function transacao(fn) {
  db.exec('BEGIN');
  try {
    const resultado = fn();
    db.exec('COMMIT');
    return resultado;
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}

/** Data local no formato AAAA-MM-DD. */
export function diaLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function diasAtras(n, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() - n);
  return diaLocal(d);
}

/** Segunda-feira da semana atual (AAAA-MM-DD). */
export function inicioDaSemana(base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return diaLocal(d);
}

export function fimDaSemana(base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  return diaLocal(d);
}
