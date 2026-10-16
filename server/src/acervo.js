// Acervo: o conteúdo dos arquivos (server/src/conteudo) somado ao que professores e administradores criam pela interface,
// e o registro das respostas de cada aluno (caderno de erros e dificuldades da turma).
import { db, diaLocal } from './db.js';
import { MODOS, MATERIAS, materiasDaSerie, serieValida, topicoPorId as topicoDoArquivo } from './conteudo/index.js';
import { idsDosProfessores } from './consultas.js';

/** Um tópico criado pela interface só aparece para os alunos quando tem questões suficientes para os três jogos. */
export const MINIMO_DE_QUESTOES = 4;

// ───────────── Conteúdo extra (em memória, recarregado a cada alteração) ─────────────

let extras = null;

export function invalidarAcervo() {
  extras = null;
}

function carregarExtras() {
  if (extras) return extras;
  const topicos = new Map(); // "x12" → tópico extra
  const porTopico = new Map(); // id do tópico → questões extras
  const questoes = new Map(); // "q7" → questão extra

  for (const t of db.prepare('SELECT * FROM topicos_extras ORDER BY id').all()) {
    topicos.set(`x${t.id}`, { id: `x${t.id}`, serie: t.serie, materia: t.materia, titulo: t.titulo, resumo: t.resumo, autorId: t.autor_id, publico: !!t.publico, extra: true });
  }
  for (const q of db.prepare('SELECT * FROM questoes_extras ORDER BY id').all()) {
    const topico = topicos.get(q.topico_id) ?? topicoDoArquivo(q.topico_id);
    if (!topico) continue; // tópico removido
    const questao = {
      id: `q${q.id}`,
      topicoId: q.topico_id,
      materia: topico.materia,
      enunciado: q.enunciado,
      correta: q.correta,
      erradas: JSON.parse(q.erradas_json),
      explicacao: q.explicacao ?? null,
      autorId: q.autor_id,
      publico: !!q.publico,
      extra: true,
    };
    questoes.set(questao.id, questao);
    if (!porTopico.has(q.topico_id)) porTopico.set(q.topico_id, []);
    porTopico.get(q.topico_id).push(questao);
  }
  extras = { topicos, porTopico, questoes };
  return extras;
}

// ───────────── Quem enxerga o quê ─────────────

/**
 * Visão de um usuário sobre o conteúdo extra. O administrador vê tudo; o professor, o público e o que ele criou;
 * o aluno, o público e o que os professores das turmas dele criaram. Sem usuário (duelos), só o público.
 */
export function visaoDe(usuario) {
  if (!usuario) return { tudo: false, autores: new Set(), editor: false };
  if (usuario.papel === 'admin') return { tudo: true, autores: new Set(), editor: true };
  if (usuario.papel === 'professor') return { tudo: false, autores: new Set([usuario.id]), editor: true };
  return { tudo: false, autores: new Set(idsDosProfessores(usuario.id)), editor: false };
}

const VISAO_PUBLICA = visaoDe(null);
const enxerga = (item, visao) => item.publico || visao.tudo || visao.autores.has(item.autorId);

function questoesVisiveis(topicoId, visao) {
  return (carregarExtras().porTopico.get(topicoId) ?? []).filter((q) => enxerga(q, visao));
}

/** Tópico com as questões que a visão alcança; null quando não existe ou não é visível. */
function montarTopico(topico, visao) {
  if (!topico) return null;
  if (topico.extra) {
    if (!enxerga(topico, visao)) return null;
    const questoes = questoesVisiveis(topico.id, visao);
    // Alunos só recebem tópicos prontos; quem edita vê também os rascunhos.
    if (!visao.editor && questoes.length < MINIMO_DE_QUESTOES) return null;
    return { ...topico, questoes, rascunho: questoes.length < MINIMO_DE_QUESTOES };
  }
  return { ...topico, questoes: [...topico.questoes, ...questoesVisiveis(topico.id, visao)] };
}

export function materiasPara(serie, visao = VISAO_PUBLICA) {
  const doNivel = [...carregarExtras().topicos.values()].filter((t) => t.serie === serie);
  return materiasDaSerie(serie).map((m) => ({
    id: m.id,
    nome: m.nome,
    topicos: [...m.topicos, ...doNivel.filter((t) => t.materia === m.id)].map((t) => montarTopico(t, visao)).filter(Boolean),
  }));
}

export function topicosPara(serie, materia, visao = VISAO_PUBLICA) {
  return materiasPara(serie, visao).find((m) => m.id === materia)?.topicos ?? [];
}

export function topicoPara(id, visao = VISAO_PUBLICA) {
  return montarTopico(carregarExtras().topicos.get(id) ?? topicoDoArquivo(id), visao);
}

export function totalAtividadesPara(serie, visao = VISAO_PUBLICA) {
  return materiasPara(serie, visao).reduce((soma, m) => soma + m.topicos.length * MODOS.length, 0);
}

/** Questões públicas de uma série (duelos: os dois jogadores precisam poder ver as mesmas questões). */
export function questoesPublicas(serie, materia = null) {
  return materiasPara(serie)
    .filter((m) => !materia || m.id === materia)
    .flatMap((m) => m.topicos.flatMap((t) => t.questoes));
}

/** Título de um tópico para históricos, sem regra de visibilidade (a atividade já foi feita). */
export function tituloDoTopico(id) {
  return (carregarExtras().topicos.get(id) ?? topicoDoArquivo(id))?.titulo ?? null;
}

const TITULO_POR_MODO = { revisao: 'Caderno de erros', aovivo: 'Quiz ao vivo' };

/** Nome de uma atividade no histórico (linha de `atividades`, com o título da missão em `missao` quando houver). */
export function tituloDaAtividade(a) {
  return a.missao ?? tituloDoTopico(a.topico_id) ?? TITULO_POR_MODO[a.modo] ?? 'Atividade';
}

/** Tópico de arquivo ou extra, sem regra de visibilidade nem questões montadas (uso do editor). */
export function topicoBruto(id) {
  return carregarExtras().topicos.get(id) ?? topicoDoArquivo(id);
}

/** Uma questão qualquer pelo id ("F6.matematica.1.3" ou "q7"); null quando foi removida. */
export function questaoPorId(id) {
  if (typeof id !== 'string') return null;
  if (id.startsWith('q')) return carregarExtras().questoes.get(id) ?? null;
  const corte = id.lastIndexOf('.');
  return topicoDoArquivo(id.slice(0, corte))?.questoes.find((q) => q.id === id) ?? null;
}

// ───────────── Respostas e caderno de erros ─────────────

/** Quantos acertos seguidos tiram uma questão do caderno de erros. */
export const ACERTOS_PARA_DOMINAR = 2;

/**
 * Anota a resposta de um aluno a uma questão do acervo e atualiza o caderno de erros.
 * Nunca lança erro: uma falha aqui não pode interromper um jogo ou um duelo.
 */
export function registrarResposta(usuarioId, questaoId, acertou) {
  if (!questaoId) return;
  try {
    db.prepare('INSERT INTO respostas (usuario_id, questao_id, acertou, dia) VALUES (?, ?, ?, ?)').run(usuarioId, questaoId, acertou ? 1 : 0, diaLocal());
    if (!acertou) {
      db.prepare(
        `INSERT INTO erros (usuario_id, questao_id) VALUES (?, ?)
         ON CONFLICT (usuario_id, questao_id) DO UPDATE SET vezes = vezes + 1, acertos_seguidos = 0, atualizado_em = datetime('now')`,
      ).run(usuarioId, questaoId);
      return;
    }
    const pendente = db.prepare('SELECT acertos_seguidos FROM erros WHERE usuario_id = ? AND questao_id = ?').get(usuarioId, questaoId);
    if (!pendente) return;
    if (pendente.acertos_seguidos + 1 >= ACERTOS_PARA_DOMINAR) {
      db.prepare('DELETE FROM erros WHERE usuario_id = ? AND questao_id = ?').run(usuarioId, questaoId);
    } else {
      db.prepare("UPDATE erros SET acertos_seguidos = acertos_seguidos + 1, atualizado_em = datetime('now') WHERE usuario_id = ? AND questao_id = ?").run(usuarioId, questaoId);
    }
  } catch (falha) {
    console.error('Não foi possível registrar a resposta:', falha.message);
  }
}

/**
 * Questões pendentes no caderno de erros do aluno, das mais antigas para as mais novas. As que sumiram do acervo são
 * descartadas; as de um nível fora de uso nesta instalação (EDUCAHUB_SERIES) ficam guardadas, mas não aparecem.
 */
export function errosPendentes(usuarioId) {
  const pendentes = [];
  for (const linha of db.prepare('SELECT * FROM erros WHERE usuario_id = ? ORDER BY atualizado_em, questao_id').all(usuarioId)) {
    const questao = questaoPorId(linha.questao_id);
    if (!questao) {
      db.prepare('DELETE FROM erros WHERE usuario_id = ? AND questao_id = ?').run(usuarioId, linha.questao_id);
      continue;
    }
    if (!serieValida(topicoBruto(questao.topicoId)?.serie)) continue;
    pendentes.push({ questao, vezes: linha.vezes, acertosSeguidos: linha.acertos_seguidos });
  }
  return pendentes;
}

/** Quantas questões esperam revisão no caderno de erros. */
export function totalNoCaderno(usuarioId) {
  return errosPendentes(usuarioId).length;
}

/** Resumo do caderno de erros para as telas do aluno. */
export function resumoDosErros(usuarioId) {
  const pendentes = errosPendentes(usuarioId);
  const porMateria = new Map();
  for (const { questao } of pendentes) porMateria.set(questao.materia, (porMateria.get(questao.materia) ?? 0) + 1);
  return {
    total: pendentes.length,
    paraDominar: ACERTOS_PARA_DOMINAR,
    porMateria: [...porMateria.entries()].map(([id, total]) => ({ id, nome: MATERIAS[id] ?? id, total })).sort((a, b) => b.total - a.total),
    questoes: pendentes.slice(0, 40).map(({ questao, vezes, acertosSeguidos }) => ({
      id: questao.id,
      enunciado: questao.enunciado,
      materia: MATERIAS[questao.materia] ?? null,
      materiaId: questao.materia,
      topico: tituloDoTopico(questao.topicoId),
      vezes,
      acertosSeguidos,
    })),
  };
}

/** Questões respondidas pelo aluno, dentre as informadas: { id → acertou na última vez }. */
export function ultimasRespostas(usuarioId, ids) {
  if (!ids.length) return new Map();
  const marcas = ids.map(() => '?').join(', ');
  const linhas = db
    .prepare(`SELECT questao_id, acertou FROM respostas WHERE usuario_id = ? AND questao_id IN (${marcas}) ORDER BY id`)
    .all(usuarioId, ...ids);
  return new Map(linhas.map((l) => [l.questao_id, !!l.acertou]));
}

/** Questões em que um grupo de alunos mais erra (mínimo de respostas para a taxa fazer sentido). */
export function dificuldadesDe(alunoIds, { minimo = 3, limite = 12 } = {}) {
  if (!alunoIds.length) return [];
  const marcas = alunoIds.map(() => '?').join(', ');
  return db
    .prepare(
      `SELECT questao_id, COUNT(*) AS respostas, SUM(1 - acertou) AS erros, COUNT(DISTINCT usuario_id) AS alunos
       FROM respostas WHERE usuario_id IN (${marcas}) GROUP BY questao_id
       HAVING respostas >= ? AND erros > 0 ORDER BY erros * 1.0 / respostas DESC, erros DESC LIMIT 60`,
    )
    .all(...alunoIds, minimo)
    .map((l) => ({ ...l, questao: questaoPorId(l.questao_id) }))
    .filter((l) => l.questao && serieValida(topicoBruto(l.questao.topicoId)?.serie))
    .slice(0, limite)
    .map((l) => ({
      id: l.questao_id,
      enunciado: l.questao.enunciado,
      correta: l.questao.correta,
      materia: MATERIAS[l.questao.materia] ?? null,
      materiaId: l.questao.materia,
      topico: tituloDoTopico(l.questao.topicoId),
      respostas: l.respostas,
      erros: l.erros,
      alunos: l.alunos,
      taxa: Math.round((l.erros / l.respostas) * 100),
    }));
}
