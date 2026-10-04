// Quiz ao vivo: o professor conduz uma rodada de perguntas e a turma inteira responde ao mesmo tempo, cada um no seu aparelho.
// A sessão fica em memória. Os comandos chegam por HTTP (com as mesmas validações do resto da API) e
// o estado é empurrado para cada participante pelo canal de tempo real.
import crypto from 'node:crypto';
import { Router } from 'express';
import { db, diaLocal } from '../db.js';
import { exigirLogin, exigirPapel, resumoPublico, inteiro, ErroDeEntrada } from '../auth.js';
import { MATERIAS, embaralhar } from '../conteudo/index.js';
import { topicoPara, topicosPara, visaoDe, registrarResposta } from '../acervo.js';
import { concederGanho, registrarDiaAtivo } from '../regras.js';
import { buscarUsuario } from '../consultas.js';
import { enviarPara } from '../tempoReal.js';
import { limitar, MINUTO, HORA } from '../limites.js';

const rotas = Router();
const sessoes = new Map(); // id → sessão

const TEMPO_S = 20;
const MIN_QUESTOES = 3;
const MAX_QUESTOES = 15;
const VALIDADE_MS = 60 * 60 * 1000; // sessão parada por uma hora é descartada
const RECOMPENSAS_POR_DIA = 3; // além disso o aluno ainda joga, mas não ganha XP nem moedas
const BONUS_DO_PODIO = [20, 12, 8];

const membrosDaTurma = (turmaId) => db.prepare('SELECT aluno_id FROM turma_membros WHERE turma_id = ?').all(turmaId).map((m) => m.aluno_id);
const emAndamentoNaTurma = (turmaId) => [...sessoes.values()].find((s) => s.turmaId === turmaId && s.fase !== 'fim');

/** Sessão que interessa ao usuário: a que o professor conduz, ou a da turma do aluno (em que ele está ou pode entrar). */
function sessaoDoUsuario(usuario) {
  const todas = [...sessoes.values()];
  if (usuario.papel !== 'aluno') return todas.find((s) => s.professorId === usuario.id) ?? null;
  const minhas = new Set(db.prepare('SELECT turma_id FROM turma_membros WHERE aluno_id = ?').all(usuario.id).map((t) => t.turma_id));
  return (
    todas.find((s) => s.fase !== 'fim' && s.participantes.has(usuario.id)) ??
    todas.find((s) => s.fase !== 'fim' && minhas.has(s.turmaId)) ??
    todas.find((s) => s.participantes.has(usuario.id)) ??
    null
  );
}

function classificacao(s) {
  return [...s.participantes.values()].sort((a, b) => b.pontos - a.pontos || b.acertos - a.acertos || a.nome.localeCompare(b.nome));
}

const cartao = (p) => ({ id: p.id, nome: p.nome, avatar: p.avatar, pontos: p.pontos, acertos: p.acertos });

/** O que cada pessoa enxerga da sessão. O gabarito só sai depois que a pergunta fecha, inclusive na tela do professor (que costuma estar projetada). */
function estadoPara(s, usuarioId) {
  const conduz = usuarioId === s.professorId;
  const eu = s.participantes.get(usuarioId);
  const q = s.indice >= 0 ? s.questoes[s.indice] : null;
  const ordem = classificacao(s);
  const estado = {
    id: s.id,
    titulo: s.titulo,
    materia: s.materia,
    materiaNome: MATERIAS[s.materia] ?? null,
    turma: s.turmaNome,
    professor: s.professorNome,
    fase: s.fase,
    indice: s.indice,
    total: s.questoes.length,
    tempo: TEMPO_S,
    conduz,
    participando: !!eu,
    participantes: s.participantes.size,
    sala: s.fase === 'sala' ? ordem.map(cartao) : null,
    pergunta: null,
    resultado: null,
    podio: null,
    eu: eu ? { pontos: eu.pontos, acertos: eu.acertos, posicao: ordem.indexOf(eu) + 1, recompensa: eu.recompensa ?? null } : null,
  };
  if (q && (s.fase === 'pergunta' || s.fase === 'resultado')) {
    const dada = eu?.respostas.get(s.indice);
    estado.pergunta = {
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      restanteMs: s.fase === 'pergunta' ? Math.max(0, s.fimDaPergunta - Date.now()) : 0,
      minhaResposta: dada ? dada.resposta : null,
      responderam: ordem.filter((p) => p.respostas.has(s.indice)).length,
    };
    if (s.fase === 'resultado') {
      estado.resultado = {
        correta: q.correta,
        explicacao: q.explicacao,
        distribuicao: q.alternativas.map((_, i) => ordem.filter((p) => p.respostas.get(s.indice)?.resposta === i).length),
        acertei: dada?.resposta === q.correta,
        ganho: dada?.ganho ?? 0,
      };
    }
  }
  if (s.fase === 'resultado' || s.fase === 'fim') estado.podio = ordem.slice(0, conduz || s.fase === 'fim' ? 40 : 5).map(cartao);
  return estado;
}

function publicar(s, ids = [s.professorId, ...s.participantes.keys()]) {
  s.movidaEm = Date.now();
  for (const id of ids) enviarPara(id, 'aovivo:estado', estadoPara(s, id));
}

function descartar(s) {
  clearTimeout(s.prazo);
  sessoes.delete(s.id);
  for (const id of new Set([s.professorId, ...s.participantes.keys(), ...membrosDaTurma(s.turmaId)])) enviarPara(id, 'aovivo:encerrado', { id: s.id });
}

function fecharPergunta(s) {
  if (s.fase !== 'pergunta') return;
  clearTimeout(s.prazo);
  const q = s.questoes[s.indice];
  for (const p of s.participantes.values()) {
    const dada = p.respostas.get(s.indice);
    if (!dada) continue; // quem não respondeu não pontua, e a questão não vai para o caderno de erros dele
    const acertou = dada.resposta === q.correta;
    dada.ganho = acertou ? 100 + Math.round((50 * Math.max(0, TEMPO_S * 1000 - dada.ms)) / (TEMPO_S * 1000)) : 0;
    p.pontos += dada.ganho;
    if (acertou) p.acertos += 1;
    registrarResposta(p.id, q.id, acertou);
  }
  s.fase = 'resultado';
  publicar(s);
}

function proximaPergunta(s) {
  if (s.indice + 1 >= s.questoes.length) return finalizar(s);
  s.indice += 1;
  s.fase = 'pergunta';
  s.inicioDaPergunta = Date.now();
  s.fimDaPergunta = s.inicioDaPergunta + TEMPO_S * 1000;
  clearTimeout(s.prazo);
  // Um erro dentro de um temporizador derrubaria o servidor inteiro: por isso o try/catch.
  s.prazo = setTimeout(() => {
    try {
      fecharPergunta(s);
    } catch (falha) {
      console.error('Erro ao fechar uma pergunta do quiz ao vivo:', falha);
    }
  }, TEMPO_S * 1000 + 400);
  publicar(s);
}

function finalizar(s) {
  clearTimeout(s.prazo);
  s.fase = 'fim';
  const ordem = classificacao(s);
  const hoje = diaLocal();
  ordem.forEach((p, posicao) => {
    if (!p.respostas.size) return; // entrou na sala mas não respondeu nada
    try {
      const jaRecebidas = db.prepare("SELECT COUNT(*) AS n FROM ganhos WHERE usuario_id = ? AND origem = 'aovivo' AND dia = ?").get(p.id, hoje).n;
      const rende = jaRecebidas < RECOMPENSAS_POR_DIA;
      const bonus = ordem.length >= 3 ? (BONUS_DO_PODIO[posicao] ?? 0) : 0;
      const recompensa = rende ? { xp: 10 + 5 * p.acertos + bonus, moedas: 4 + 2 * p.acertos } : { xp: 0, moedas: 0 };
      db.prepare(
        `INSERT INTO atividades (usuario_id, materia, topico_id, modo, acertos, total, xp, moedas, duracao_s, dia)
         VALUES (?, ?, ?, 'aovivo', ?, ?, ?, ?, ?, ?)`,
      ).run(p.id, s.materia, s.topicoId, p.acertos, s.questoes.length, recompensa.xp, recompensa.moedas, Math.round((Date.now() - s.criadaEm) / 1000), hoje);
      const nivel = rende ? concederGanho(p.id, recompensa, 'aovivo') : { subiuNivel: false };
      const sequencia = p.acertos > 0 ? registrarDiaAtivo(p.id) : null;
      p.recompensa = { ...recompensa, ...nivel, sequencia };
    } catch (falha) {
      console.error('Não foi possível gravar o resultado do quiz ao vivo:', falha.message);
    }
  });
  publicar(s);
}

setInterval(() => {
  const limite = Date.now() - VALIDADE_MS;
  for (const s of sessoes.values()) if (s.movidaEm < limite) descartar(s);
}, 5 * MINUTO).unref();

// ───────────── Rotas ─────────────

rotas.get('/atual', exigirLogin, (req, res) => {
  const s = sessaoDoUsuario(req.usuario);
  res.json({ sessao: s ? estadoPara(s, req.usuario.id) : null });
});

rotas.post('/', exigirPapel('professor'), limitar('aovivo', 20, HORA, 'Muitos quizzes ao vivo em pouco tempo. Aguarde um pouco.'), (req, res) => {
  const corpo = req.body ?? {};
  const turma = db.prepare('SELECT * FROM turmas WHERE id = ? AND professor_id = ?').get(Number(corpo.turmaId), req.usuario.id);
  if (!turma) throw new ErroDeEntrada('Turma não encontrada.');
  if (emAndamentoNaTurma(turma.id)) throw new ErroDeEntrada('Esta turma já tem um quiz ao vivo em andamento.');
  const alunos = membrosDaTurma(turma.id);
  if (!alunos.length) throw new ErroDeEntrada('A turma ainda não tem alunos.');

  const visao = visaoDe(req.usuario);
  let fonte;
  let titulo;
  let materia;
  let topicoId = null;
  if (corpo.topicoId) {
    const topico = topicoPara(corpo.topicoId, visao);
    if (!topico || topico.serie !== turma.serie) throw new ErroDeEntrada('Tópico não encontrado para o nível desta turma.');
    ({ questoes: fonte, titulo, materia } = topico);
    topicoId = topico.id;
  } else {
    const topicos = topicosPara(turma.serie, corpo.materia, visao);
    if (!topicos.length) throw new ErroDeEntrada('Escolha a matéria do quiz.');
    fonte = topicos.flatMap((t) => t.questoes);
    materia = corpo.materia;
    titulo = `${MATERIAS[materia]} — revisão geral`;
  }
  if (fonte.length < MIN_QUESTOES) throw new ErroDeEntrada(`São necessárias pelo menos ${MIN_QUESTOES} questões. Acrescente questões ao tópico na Biblioteca.`);
  const quantidade = inteiro(corpo.quantidade ?? 8, 'Quantidade de questões', { min: MIN_QUESTOES, max: MAX_QUESTOES });

  // Um quiz por professor de cada vez: o anterior, já terminado, sai de cena.
  for (const antiga of [...sessoes.values()].filter((s) => s.professorId === req.usuario.id)) {
    if (antiga.fase !== 'fim') throw new ErroDeEntrada('Você já tem um quiz ao vivo em andamento. Encerre-o antes de começar outro.');
    descartar(antiga);
  }

  const s = {
    id: crypto.randomUUID(),
    turmaId: turma.id,
    turmaNome: turma.nome,
    professorId: req.usuario.id,
    professorNome: req.usuario.nome,
    titulo,
    materia,
    topicoId,
    questoes: embaralhar(fonte).slice(0, quantidade).map((q) => {
      const alternativas = embaralhar([q.correta, ...q.erradas]);
      return { id: q.id, enunciado: q.enunciado, alternativas, correta: alternativas.indexOf(q.correta), explicacao: q.explicacao ?? null };
    }),
    fase: 'sala',
    indice: -1,
    inicioDaPergunta: 0,
    fimDaPergunta: 0,
    prazo: null,
    participantes: new Map(),
    criadaEm: Date.now(),
    movidaEm: Date.now(),
  };
  sessoes.set(s.id, s);
  for (const id of alunos) enviarPara(id, 'aovivo:convite', estadoPara(s, id));
  res.status(201).json({ sessao: estadoPara(s, req.usuario.id) });
});

/** Sessão do endereço; lança erro quando não existe. */
function sessaoDoPedido(req) {
  const s = sessoes.get(req.params.id);
  if (!s) throw new ErroDeEntrada('Este quiz ao vivo já foi encerrado.');
  return s;
}

function sessaoConduzida(req) {
  const s = sessaoDoPedido(req);
  if (s.professorId !== req.usuario.id) throw new ErroDeEntrada('Só quem criou o quiz pode conduzi-lo.');
  return s;
}

rotas.post('/:id/entrar', exigirPapel('aluno'), limitar('aovivo-entrar', 30, MINUTO), (req, res) => {
  const s = sessaoDoPedido(req);
  if (s.fase === 'fim') throw new ErroDeEntrada('Este quiz já terminou.');
  if (!membrosDaTurma(s.turmaId).includes(req.usuario.id)) throw new ErroDeEntrada('Este quiz é de uma turma em que você não está.');
  if (!s.participantes.has(req.usuario.id)) {
    const publico = resumoPublico(buscarUsuario(req.usuario.id));
    s.participantes.set(req.usuario.id, { id: publico.id, nome: publico.nome, avatar: publico.avatar, pontos: 0, acertos: 0, respostas: new Map(), recompensa: null });
    // Na sala todos veem quem chegou; com o quiz em andamento, só o professor precisa saber.
    publicar(s, s.fase === 'sala' ? undefined : [s.professorId]);
  }
  res.json({ sessao: estadoPara(s, req.usuario.id) });
});

// Um botão só para o professor: começa, fecha a pergunta antes do tempo, passa para a próxima e, no fim, mostra o pódio.
rotas.post('/:id/avancar', exigirPapel('professor'), limitar('aovivo-avancar', 120, MINUTO), (req, res) => {
  const s = sessaoConduzida(req);
  if (s.fase === 'sala') {
    if (!s.participantes.size) throw new ErroDeEntrada('Espere pelo menos um aluno entrar na sala.');
    proximaPergunta(s);
  } else if (s.fase === 'pergunta') {
    fecharPergunta(s);
  } else if (s.fase === 'resultado') {
    proximaPergunta(s);
  }
  res.json({ sessao: estadoPara(s, req.usuario.id) });
});

// Encerrar: no meio do quiz, vale o que já foi respondido; na sala (ou depois do pódio), a sessão só é fechada.
rotas.post('/:id/encerrar', exigirPapel('professor'), (req, res) => {
  const s = sessaoConduzida(req);
  if (s.fase === 'pergunta') fecharPergunta(s);
  if (s.fase === 'resultado') {
    finalizar(s);
    return res.json({ sessao: estadoPara(s, req.usuario.id) });
  }
  descartar(s);
  res.json({ sessao: null });
});

rotas.post('/:id/responder', exigirPapel('aluno'), limitar('aovivo-responder', 120, MINUTO), (req, res) => {
  const s = sessaoDoPedido(req);
  const eu = s.participantes.get(req.usuario.id);
  if (!eu) throw new ErroDeEntrada('Entre na sala antes de responder.');
  const { indice, resposta } = req.body ?? {};
  if (s.fase !== 'pergunta' || indice !== s.indice) throw new ErroDeEntrada('O tempo desta pergunta já acabou.');
  if (!Number.isInteger(resposta) || resposta < 0 || resposta >= s.questoes[s.indice].alternativas.length) throw new ErroDeEntrada('Resposta inválida.');
  if (!eu.respostas.has(s.indice)) {
    eu.respostas.set(s.indice, { resposta, ms: Date.now() - s.inicioDaPergunta, ganho: 0 });
    if ([...s.participantes.values()].every((p) => p.respostas.has(s.indice))) fecharPergunta(s);
    else publicar(s, [s.professorId]);
  }
  res.json({ sessao: estadoPara(s, req.usuario.id) });
});

export default rotas;
