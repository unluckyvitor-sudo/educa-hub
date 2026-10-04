// Conteúdo por nível, jogos (quiz, verdadeiro ou falso, memória) e progresso do aluno.
import crypto from 'node:crypto';
import { Router } from 'express';
import { db, diaLocal, diasAtras } from '../db.js';
import { exigirLogin, ErroDeEntrada } from '../auth.js';
import { ETAPAS, SERIES, MATERIAS, MODOS, embaralhar, serieValida } from '../conteudo/index.js';
import {
  materiasPara, topicosPara, topicoPara, tituloDoTopico, visaoDe,
  registrarResposta, errosPendentes, resumoDosErros, ultimasRespostas,
} from '../acervo.js';
import { recompensaAtividade, concederGanho, registrarDiaAtivo, infoNivel, infoSequencia } from '../regras.js';
import { buscarUsuario, estatisticasDoAluno } from '../consultas.js';
import { limitar, MINUTO } from '../limites.js';

const rotas = Router();
const NOTA_MINIMA = 0.6; // fração de acertos para a atividade contar como concluída
const TEMPO_QUIZ_S = 25;
const TEMPO_VF_S = 12;
const QUESTOES_POR_JOGO = 6; // do próprio tópico; as de revisão entram além dessas
const QUESTOES_POR_REVISAO = 8; // caderno de erros

/** Série cujo conteúdo o usuário enxerga (professores e admin podem escolher via ?serie=). */
function serieDoPedido(req) {
  if (req.usuario.papel === 'aluno') return req.usuario.serie;
  return serieValida(req.query.serie) ? req.query.serie : 'F6';
}

/** Melhor aproveitamento do aluno por tópico e modo: { "F6.matematica.1": { quiz: 0.75 } } */
function melhoresResultados(usuarioId) {
  const mapa = {};
  const linhas = db
    .prepare(
      `SELECT topico_id, modo, MAX(acertos * 1.0 / total) AS melhor FROM atividades
       WHERE usuario_id = ? AND topico_id IS NOT NULL AND total > 0 GROUP BY topico_id, modo`,
    )
    .all(usuarioId);
  for (const l of linhas) (mapa[l.topico_id] ??= {})[l.modo] = l.melhor;
  return mapa;
}

const concluidasNoTopico = (resultados, topicoId) =>
  MODOS.filter((modo) => (resultados[topicoId]?.[modo] ?? 0) >= NOTA_MINIMA).length;

rotas.get('/catalogo', (_req, res) => {
  res.json({ etapas: ETAPAS, series: SERIES, materias: MATERIAS });
});

rotas.get('/materias', exigirLogin, (req, res) => {
  const serie = serieDoPedido(req);
  const resultados = melhoresResultados(req.usuario.id);
  const materias = materiasPara(serie, visaoDe(req.usuario)).map((m) => ({
    id: m.id,
    nome: m.nome,
    topicos: m.topicos.length,
    total: m.topicos.length * MODOS.length,
    concluidas: m.topicos.reduce((soma, t) => soma + concluidasNoTopico(resultados, t.id), 0),
  }));
  res.json({
    serie,
    materias,
    total: materias.reduce((soma, m) => soma + m.total, 0),
    concluidas: materias.reduce((soma, m) => soma + m.concluidas, 0),
    // Questões esperando revisão no caderno de erros.
    erros: req.usuario.papel === 'aluno' ? db.prepare('SELECT COUNT(*) AS n FROM erros WHERE usuario_id = ?').get(req.usuario.id).n : 0,
  });
});

rotas.get('/materias/:id', exigirLogin, (req, res) => {
  const serie = serieDoPedido(req);
  const lista = topicosPara(serie, req.params.id, visaoDe(req.usuario));
  if (!lista.length) return res.status(404).json({ erro: 'Matéria não encontrada para o seu nível.' });
  const resultados = melhoresResultados(req.usuario.id);
  res.json({
    materia: { id: req.params.id, nome: MATERIAS[req.params.id] },
    topicos: lista.map((t) => ({
      id: t.id,
      titulo: t.titulo,
      resumo: t.resumo,
      questoes: t.questoes.length,
      extra: !!t.extra,
      modos: Object.fromEntries(MODOS.map((modo) => [modo, Math.round((resultados[t.id]?.[modo] ?? 0) * 100)])),
      concluidas: concluidasNoTopico(resultados, t.id),
    })),
  });
});

rotas.get('/biblioteca', exigirLogin, (req, res) => {
  const serie = serieDoPedido(req);
  const visao = visaoDe(req.usuario);
  res.json({
    serie,
    materias: materiasPara(serie, visao).map((m) => ({
      id: m.id,
      nome: m.nome,
      topicos: m.topicos.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        resumo: t.resumo,
        // Para quem edita o conteúdo (professores e administradores):
        ...(visao.editor && { questoes: t.questoes.length, extra: !!t.extra, rascunho: !!t.rascunho, publico: t.extra ? t.publico : true, meu: t.autorId === req.usuario.id }),
      })),
    })),
  });
});

// Caderno de erros do aluno: o que ele errou e ainda não acertou duas vezes seguidas.
rotas.get('/erros', exigirLogin, (req, res) => {
  if (req.usuario.papel !== 'aluno') return res.status(400).json({ erro: 'Apenas alunos têm caderno de erros.' });
  res.json(resumoDosErros(req.usuario.id));
});

// ───────────── Jogos ─────────────
// A partida fica em memória no servidor; o cliente nunca recebe o gabarito antes de responder.

const partidas = new Map();
const VALIDADE_MS = 40 * 60 * 1000;
const MAX_PARTIDAS_POR_USUARIO = 3; // abas abertas ao mesmo tempo; as mais antigas são descartadas
setInterval(() => {
  const limite = Date.now() - VALIDADE_MS;
  for (const [id, p] of partidas) if (p.inicio < limite) partidas.delete(id);
}, 5 * 60 * 1000).unref();

/**
 * Questões do tópico mais duas de revisão de outros tópicos da mesma matéria.
 * Quando o tópico tem mais questões do que cabem em um jogo, entram primeiro as que o aluno
 * errou na última vez e as que ele ainda não viu.
 */
function questoesDoTopico(topico, usuario) {
  const visao = visaoDe(usuario);
  const ultimas = ultimasRespostas(usuario.id, topico.questoes.map((q) => q.id));
  const ordem = (q) => (!ultimas.has(q.id) ? 1 : ultimas.get(q.id) ? 2 : 0);
  const doTopico = embaralhar(topico.questoes).sort((a, b) => ordem(a) - ordem(b)).slice(0, QUESTOES_POR_JOGO);
  const revisao = embaralhar(
    topicosPara(topico.serie, topico.materia, visao).filter((t) => t.id !== topico.id).flatMap((t) => t.questoes),
  ).slice(0, 2);
  return [...embaralhar(doTopico), ...revisao.map((q) => ({ ...q, revisao: true }))];
}

function questoesDaMissao(missao) {
  return JSON.parse(missao.questoes_json || '[]').map((q, i) => ({
    id: `m${missao.id}.${i}`,
    enunciado: q.enunciado,
    correta: q.alternativas[q.correta],
    erradas: q.alternativas.filter((_, j) => j !== q.correta),
    explicacao: q.explicacao ?? null,
  }));
}

function montarItens(modo, questoes) {
  if (modo === 'vf') {
    return questoes.map((q) => {
      const verdadeira = Math.random() < 0.5;
      const mostrada = verdadeira ? q.correta : q.erradas[Math.floor(Math.random() * q.erradas.length)];
      return { questaoId: q.id, enunciado: q.enunciado, afirmacao: mostrada, gabarito: verdadeira, correta: q.correta, explicacao: q.explicacao, revisao: !!q.revisao, resposta: undefined };
    });
  }
  return questoes.map((q) => {
    const alternativas = embaralhar([q.correta, ...q.erradas]);
    return { questaoId: q.id, enunciado: q.enunciado, alternativas, gabarito: alternativas.indexOf(q.correta), correta: q.correta, explicacao: q.explicacao, revisao: !!q.revisao, resposta: undefined };
  });
}

function montarCartas(questoes) {
  return embaralhar(
    questoes.flatMap((q, par) => [
      { id: crypto.randomBytes(6).toString('hex'), par, tipo: 'pergunta', texto: q.enunciado },
      { id: crypto.randomBytes(6).toString('hex'), par, tipo: 'resposta', texto: q.correta },
    ]),
  );
}

function buscarPartida(req) {
  const partida = partidas.get(req.params.partida);
  if (!partida || partida.usuarioId !== req.usuario.id) throw new ErroDeEntrada('Partida não encontrada. Comece um novo jogo.');
  if (partida.finalizada) throw new ErroDeEntrada('Esta partida já terminou.');
  return partida;
}

rotas.post('/jogos/iniciar', exigirLogin, limitar('jogo', 40, MINUTO), (req, res) => {
  const { topicoId, missaoId, modo, revisao } = req.body ?? {};
  let questoes;
  let contexto;

  if (revisao === true) {
    // Caderno de erros: um quiz com as questões pendentes, das mais antigas para as mais novas.
    if (req.usuario.papel !== 'aluno') return res.status(400).json({ erro: 'Apenas alunos têm caderno de erros.' });
    const pendentes = errosPendentes(req.usuario.id);
    if (!pendentes.length) return res.status(404).json({ erro: 'Seu caderno de erros está vazio. Continue jogando!' });
    questoes = embaralhar(pendentes.slice(0, QUESTOES_POR_REVISAO).map((p) => p.questao));
    contexto = { revisao: true, materia: null, titulo: 'Caderno de erros', modo: 'quiz' };
  } else if (missaoId != null) {
    const missao = db
      .prepare(
        `SELECT m.* FROM missoes m JOIN turma_membros tm ON tm.turma_id = m.turma_id
         WHERE m.id = ? AND tm.aluno_id = ? AND m.tipo = 'quiz' AND m.inicio <= ? AND m.fim >= ?`,
      )
      .get(Number(missaoId), req.usuario.id, diaLocal(), diaLocal());
    if (!missao) return res.status(404).json({ erro: 'Este desafio não está disponível.' });
    questoes = embaralhar(questoesDaMissao(missao));
    contexto = { missaoId: missao.id, materia: missao.materia, titulo: missao.titulo, modo: 'quiz' };
  } else {
    const topico = topicoPara(topicoId, visaoDe(req.usuario));
    if (!topico || !MODOS.includes(modo)) return res.status(400).json({ erro: 'Jogo inválido.' });
    if (req.usuario.papel === 'aluno' && topico.serie !== req.usuario.serie) {
      return res.status(403).json({ erro: 'Este conteúdo não é do seu nível de ensino.' });
    }
    if (!topico.questoes.length) return res.status(400).json({ erro: 'Este tópico ainda não tem questões.' });
    questoes = questoesDoTopico(topico, req.usuario);
    contexto = { topicoId: topico.id, materia: topico.materia, titulo: topico.titulo, modo };
  }

  const partida = {
    id: crypto.randomUUID(),
    usuarioId: req.usuario.id,
    inicio: Date.now(),
    finalizada: false,
    ...contexto,
  };
  const publico = { partida: partida.id, modo: partida.modo, titulo: partida.titulo, materia: partida.materia, materiaNome: MATERIAS[partida.materia] ?? null, revisao: !!partida.revisao };

  if (partida.modo === 'memoria') {
    partida.cartas = montarCartas(questoes);
    partida.explicacoes = questoes.map((q) => q.explicacao);
    partida.encontrados = new Set();
    partida.erros = 0;
    publico.cartas = partida.cartas.map(({ id, tipo, texto: t }) => ({ id, tipo, texto: t }));
  } else {
    partida.itens = montarItens(partida.modo, questoes);
    publico.tempo = partida.modo === 'vf' ? TEMPO_VF_S : TEMPO_QUIZ_S;
    publico.itens = partida.itens.map((it) =>
      partida.modo === 'vf'
        ? { enunciado: it.enunciado, afirmacao: it.afirmacao, revisao: it.revisao }
        : { enunciado: it.enunciado, alternativas: it.alternativas, revisao: it.revisao },
    );
  }
  // Sem este teto, alguém poderia abrir partidas sem parar e esgotar a memória do servidor.
  const minhas = [...partidas.values()].filter((p) => p.usuarioId === req.usuario.id).sort((x, y) => x.inicio - y.inicio);
  while (minhas.length >= MAX_PARTIDAS_POR_USUARIO) partidas.delete(minhas.shift().id);
  partidas.set(partida.id, partida);
  res.json(publico);
});

rotas.post('/jogos/:partida/responder', exigirLogin, (req, res) => {
  const partida = buscarPartida(req);
  const { indice, resposta = null } = req.body ?? {};
  // O índice precisa ser um número dentro da lista: um texto como "__proto__" alcançaria o protótipo dos arrays.
  if (!partida.itens || !Number.isInteger(indice) || indice < 0 || indice >= partida.itens.length) {
    return res.status(400).json({ erro: 'Questão inválida.' });
  }
  const item = partida.itens[indice];
  // Resposta: número da alternativa (quiz), verdadeiro ou falso, ou null quando o tempo acaba.
  const valida =
    resposta === null ||
    (partida.modo === 'vf' ? typeof resposta === 'boolean' : Number.isInteger(resposta) && resposta >= 0 && resposta < item.alternativas.length);
  if (!valida) return res.status(400).json({ erro: 'Resposta inválida.' });
  if (item.resposta === undefined) {
    item.resposta = resposta;
    // Só as questões do acervo entram no caderno de erros (as dos desafios de professor somem com a missão).
    if (req.usuario.papel === 'aluno' && !partida.missaoId) registrarResposta(req.usuario.id, item.questaoId, resposta === item.gabarito);
  }
  res.json({
    acertou: item.resposta === item.gabarito,
    gabarito: item.gabarito,
    correta: item.correta,
    explicacao: item.explicacao,
  });
});

rotas.post('/jogos/:partida/par', exigirLogin, (req, res) => {
  const partida = buscarPartida(req);
  const a = partida.cartas?.find((c) => c.id === req.body?.a);
  const b = partida.cartas?.find((c) => c.id === req.body?.b);
  if (!a || !b || a === b) return res.status(400).json({ erro: 'Cartas inválidas.' });
  const formouPar = a.par === b.par;
  if (formouPar) partida.encontrados.add(a.par);
  else partida.erros += 1;
  res.json({ par: formouPar, explicacao: formouPar ? partida.explicacoes[a.par] : null });
});

rotas.post('/jogos/:partida/finalizar', exigirLogin, (req, res) => {
  const partida = buscarPartida(req);
  // Só termina quem jogou até o fim; senão, iniciar e finalizar em seguida contaria como atividade feita.
  const completa =
    partida.modo === 'memoria' ? partida.encontrados.size === partida.cartas.length / 2 : partida.itens.every((it) => it.resposta !== undefined);
  if (!completa) {
    throw new ErroDeEntrada(partida.modo === 'memoria' ? 'Encontre todos os pares antes de terminar.' : 'Responda todas as questões antes de terminar.');
  }
  partida.finalizada = true;
  partidas.delete(partida.id);

  let acertos;
  let total;
  if (partida.modo === 'memoria') {
    total = partida.cartas.length / 2;
    // Cada três tentativas erradas custam um ponto.
    acertos = Math.max(partida.encontrados.size ? 1 : 0, partida.encontrados.size - Math.floor(partida.erros / 3));
  } else {
    total = partida.itens.length;
    acertos = partida.itens.filter((it) => it.resposta === it.gabarito).length;
  }

  // O que o aluno errou, com a resposta certa, para rever no fim do jogo (no jogo da memória não há erro por questão).
  const erradas = (partida.itens ?? [])
    .filter((it) => it.resposta !== it.gabarito)
    .map((it) => ({ enunciado: it.enunciado, correta: it.correta, explicacao: it.explicacao ?? null }));
  const modoRegistrado = partida.revisao ? 'revisao' : partida.modo;
  const resultado = { acertos, total, modo: partida.modo, xp: 0, moedas: 0, subiuNivel: false, sequencia: null, erradas, noCaderno: 0 };
  if (req.usuario.papel !== 'aluno') return res.json(resultado); // professores jogam só para conhecer o conteúdo

  const recompensa = recompensaAtividade(req.usuario.id, {
    topicoId: partida.topicoId, missaoId: partida.missaoId, modo: partida.modo, revisao: !!partida.revisao, acertos, total,
  });
  resultado.noCaderno = db.prepare('SELECT COUNT(*) AS n FROM erros WHERE usuario_id = ?').get(req.usuario.id).n;
  db.prepare(
    `INSERT INTO atividades (usuario_id, materia, topico_id, missao_id, modo, acertos, total, xp, moedas, duracao_s, dia)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    req.usuario.id, partida.materia ?? null, partida.topicoId ?? null, partida.missaoId ?? null, modoRegistrado,
    acertos, total, recompensa.xp, recompensa.moedas, Math.round((Date.now() - partida.inicio) / 1000), diaLocal(),
  );
  const nivel = concederGanho(req.usuario.id, recompensa, 'atividade');
  // O dia só conta para a sequência quando houve pelo menos um acerto.
  res.json({ ...resultado, ...recompensa, ...nivel, sequencia: acertos > 0 ? registrarDiaAtivo(req.usuario.id) : null });
});

// ───────────── Progresso ─────────────

export function progressoDoAluno(aluno) {
  const resultados = melhoresResultados(aluno.id);
  const porMateria = db
    .prepare(
      `SELECT materia, COUNT(*) AS atividades, SUM(acertos) AS acertos, SUM(total) AS questoes
       FROM atividades WHERE usuario_id = ? AND materia IS NOT NULL GROUP BY materia`,
    )
    .all(aluno.id);
  const desempenho = Object.fromEntries(porMateria.map((m) => [m.materia, m]));
  const materias = materiasPara(aluno.serie, visaoDe(aluno)).map((m) => {
    const d = desempenho[m.id];
    return {
      id: m.id,
      nome: m.nome,
      total: m.topicos.length * MODOS.length,
      concluidas: m.topicos.reduce((soma, t) => soma + concluidasNoTopico(resultados, t.id), 0),
      atividades: d?.atividades ?? 0,
      aproveitamento: d?.questoes ? Math.round((d.acertos / d.questoes) * 100) : null,
    };
  });
  const xpPorDia = Object.fromEntries(
    db
      .prepare('SELECT dia, SUM(xp) AS xp FROM ganhos WHERE usuario_id = ? AND dia >= ? GROUP BY dia')
      .all(aluno.id, diasAtras(13))
      .map((r) => [r.dia, r.xp]),
  );
  const recentes = db
    .prepare(
      `SELECT a.id, a.materia, a.topico_id, a.modo, a.acertos, a.total, a.xp, a.criado_em, m.titulo AS missao
       FROM atividades a LEFT JOIN missoes m ON m.id = a.missao_id
       WHERE a.usuario_id = ? ORDER BY a.id DESC LIMIT 12`,
    )
    .all(aluno.id)
    .map((a) => ({
      id: a.id,
      materia: MATERIAS[a.materia] ?? null,
      materiaId: a.materia,
      titulo: a.missao ?? tituloDoTopico(a.topico_id) ?? (a.modo === 'revisao' ? 'Caderno de erros' : 'Atividade'),
      modo: a.modo,
      acertos: a.acertos,
      total: a.total,
      xp: a.xp,
      quando: a.criado_em,
    }));
  return {
    nivel: infoNivel(aluno.xp),
    xp: aluno.xp,
    moedas: aluno.moedas,
    total: materias.reduce((soma, m) => soma + m.total, 0),
    concluidas: materias.reduce((soma, m) => soma + m.concluidas, 0),
    erros: db.prepare('SELECT COUNT(*) AS n FROM erros WHERE usuario_id = ?').get(aluno.id).n,
    estatisticas: estatisticasDoAluno(aluno.id),
    sequencia: infoSequencia(aluno),
    materias,
    xpPorDia: Array.from({ length: 14 }, (_, i) => {
      const dia = diasAtras(13 - i);
      return { dia, xp: xpPorDia[dia] ?? 0 };
    }),
    recentes,
  };
}

rotas.get('/progresso', exigirLogin, (req, res) => {
  if (req.usuario.papel !== 'aluno') return res.status(400).json({ erro: 'Apenas alunos têm progresso.' });
  res.json(progressoDoAluno(buscarUsuario(req.usuario.id)));
});

export default rotas;
