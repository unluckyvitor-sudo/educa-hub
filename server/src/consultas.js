// Consultas reutilizadas por várias rotas e pelo módulo de tempo real.
import { db } from './db.js';
import { comSerieEmUso } from './conteudo/niveis.js';

export function buscarUsuario(id) {
  return comSerieEmUso(db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) ?? null);
}

export function idsDosAmigos(usuarioId) {
  return db
    .prepare(
      `SELECT CASE WHEN de_id = ? THEN para_id ELSE de_id END AS id
       FROM amizades WHERE status = 'aceita' AND (de_id = ? OR para_id = ?)`,
    )
    .all(usuarioId, usuarioId, usuarioId)
    .map((r) => r.id);
}

export function saoAmigos(a, b) {
  return !!db
    .prepare(
      `SELECT 1 FROM amizades WHERE status = 'aceita'
       AND ((de_id = ? AND para_id = ?) OR (de_id = ? AND para_id = ?))`,
    )
    .get(a, b, b, a);
}

/** Professores das turmas em que o aluno está. */
export function idsDosProfessores(alunoId) {
  return db
    .prepare(
      `SELECT DISTINCT t.professor_id AS id FROM turma_membros tm
       JOIN turmas t ON t.id = tm.turma_id WHERE tm.aluno_id = ?`,
    )
    .all(alunoId)
    .map((r) => r.id);
}

/** O professor leciona para este aluno em alguma turma? */
export function professorDoAluno(professorId, alunoId) {
  return !!db
    .prepare(
      `SELECT 1 FROM turma_membros tm JOIN turmas t ON t.id = tm.turma_id
       WHERE t.professor_id = ? AND tm.aluno_id = ?`,
    )
    .get(professorId, alunoId);
}

/** Os dois alunos estão juntos em alguma turma? */
export function colegasDeTurma(a, b) {
  return !!db
    .prepare('SELECT 1 FROM turma_membros x JOIN turma_membros y ON y.turma_id = x.turma_id WHERE x.aluno_id = ? AND y.aluno_id = ?')
    .get(a, b);
}

/** Estatísticas de jogo de um aluno. */
export function estatisticasDoAluno(alunoId) {
  const a = db
    .prepare(
      `SELECT COUNT(*) AS atividades, COALESCE(SUM(acertos), 0) AS acertos, COALESCE(SUM(total), 0) AS questoes
       FROM atividades WHERE usuario_id = ?`,
    )
    .get(alunoId);
  const d = db
    .prepare(
      `SELECT COUNT(*) AS duelos, COALESCE(SUM(vencedor_id = ?), 0) AS vitorias
       FROM duelos WHERE jogador1_id = ? OR jogador2_id = ?`,
    )
    .get(alunoId, alunoId, alunoId);
  return {
    atividades: a.atividades,
    acertos: a.acertos,
    questoes: a.questoes,
    aproveitamento: a.questoes ? Math.round((a.acertos / a.questoes) * 100) : 0,
    duelos: d.duelos,
    vitorias: d.vitorias,
  };
}
