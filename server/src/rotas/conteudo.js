// Editor de conteúdo: professores e administradores criam tópicos e questões além do que vem nos arquivos.
// O que o administrador cria vale para todos os alunos do nível; o que o professor cria vale para as turmas dele,
// até o administrador publicar para todos.
import { Router } from 'express';
import { db, transacao } from '../db.js';
import { exigirPapel, texto, ErroDeEntrada } from '../auth.js';
import { MATERIAS, SERIE_POR_ID, serieValida, materiasDaSerie } from '../conteudo/index.js';
import { invalidarAcervo, topicoBruto, topicoPara, visaoDe, questaoPorId, MINIMO_DE_QUESTOES } from '../acervo.js';
import { registrar } from '../registro.js';
import { limitar, HORA } from '../limites.js';

const rotas = Router();
rotas.use(exigirPapel('professor', 'admin'));

const escrita = limitar('conteudo', 300, HORA, 'Muitas alterações em pouco tempo. Aguarde um pouco.');
const MAX_TOPICOS_POR_AUTOR = 80;
const MAX_QUESTOES_POR_TOPICO = 60;

const ehAdmin = (req) => req.usuario.papel === 'admin';
const podeEditar = (req, item) => !!item.extra && (ehAdmin(req) || item.autorId === req.usuario.id);
const nomeDe = (id) => (id ? db.prepare('SELECT nome FROM usuarios WHERE id = ?').get(id)?.nome ?? null : null);

/** Tópico que o usuário enxerga; lança erro quando não existe (ou é de outro professor). */
function topicoDoPedido(req) {
  const topico = topicoPara(req.params.id, visaoDe(req.usuario));
  if (!topico) throw new ErroDeEntrada('Tópico não encontrado.');
  return topico;
}

function lerQuestao(corpo) {
  const enunciado = texto(corpo?.enunciado, 'Enunciado', { min: 3, max: 300 });
  const correta = texto(corpo?.correta, 'Resposta certa', { min: 1, max: 160 });
  const erradas = Array.isArray(corpo?.erradas) ? corpo.erradas.map((e, i) => texto(e, `Resposta errada ${i + 1}`, { min: 1, max: 160 })) : [];
  if (erradas.length !== 3) throw new ErroDeEntrada('Informe três respostas erradas.');
  if (new Set([correta, ...erradas].map((a) => a.toLowerCase())).size !== 4) throw new ErroDeEntrada('As quatro respostas precisam ser diferentes entre si.');
  return { enunciado, correta, erradas, explicacao: texto(corpo?.explicacao, 'Explicação', { max: 300, opcional: true }) };
}

const formatarQuestao = (req, q) => ({
  id: q.id,
  enunciado: q.enunciado,
  correta: q.correta,
  erradas: q.erradas,
  explicacao: q.explicacao,
  extra: !!q.extra,
  publico: q.extra ? q.publico : true,
  editavel: podeEditar(req, q),
  autor: q.extra ? nomeDe(q.autorId) : null,
});

rotas.get('/topicos/:id', (req, res) => {
  const t = topicoDoPedido(req);
  res.json({
    topico: {
      id: t.id,
      serie: t.serie,
      serieNome: SERIE_POR_ID[t.serie]?.nome ?? t.serie,
      materia: t.materia,
      materiaNome: MATERIAS[t.materia],
      titulo: t.titulo,
      resumo: t.resumo,
      extra: !!t.extra,
      rascunho: !!t.rascunho,
      publico: t.extra ? t.publico : true,
      editavel: podeEditar(req, t),
      autor: t.extra ? nomeDe(t.autorId) : null,
    },
    minimo: MINIMO_DE_QUESTOES,
    maximo: MAX_QUESTOES_POR_TOPICO,
    podePublicar: ehAdmin(req),
    questoes: t.questoes.map((q) => formatarQuestao(req, q)),
  });
});

rotas.post('/topicos', escrita, (req, res) => {
  const corpo = req.body ?? {};
  if (!serieValida(corpo.serie)) throw new ErroDeEntrada('Escolha o nível de ensino do tópico.');
  if (!materiasDaSerie(corpo.serie).some((m) => m.id === corpo.materia)) throw new ErroDeEntrada('Matéria inválida para este nível.');
  const meus = db.prepare('SELECT COUNT(*) AS n FROM topicos_extras WHERE autor_id = ?').get(req.usuario.id).n;
  if (!ehAdmin(req) && meus >= MAX_TOPICOS_POR_AUTOR) throw new ErroDeEntrada(`Você já criou ${MAX_TOPICOS_POR_AUTOR} tópicos. Exclua algum para criar outro.`);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO topicos_extras (serie, materia, titulo, resumo, autor_id, publico) VALUES (?, ?, ?, ?, ?, ?)')
    .run(
      corpo.serie, corpo.materia,
      texto(corpo.titulo, 'Título', { min: 3, max: 80 }),
      texto(corpo.resumo, 'Resumo', { max: 1200, opcional: true }) ?? '',
      req.usuario.id, ehAdmin(req) ? 1 : 0,
    );
  invalidarAcervo();
  res.status(201).json({ id: `x${lastInsertRowid}` });
});

rotas.put('/topicos/:id', escrita, (req, res) => {
  const t = topicoDoPedido(req);
  if (!podeEditar(req, t)) throw new ErroDeEntrada('Este tópico não pode ser alterado por você.');
  const numero = Number(t.id.slice(1));
  db.prepare('UPDATE topicos_extras SET titulo = ?, resumo = ? WHERE id = ?').run(
    texto(req.body?.titulo, 'Título', { min: 3, max: 80 }),
    texto(req.body?.resumo, 'Resumo', { max: 1200, opcional: true }) ?? '',
    numero,
  );
  // Publicar (ou recolher) um tópico leva junto as questões dele.
  if (ehAdmin(req) && typeof req.body?.publico === 'boolean') {
    const publico = req.body.publico ? 1 : 0;
    transacao(() => {
      db.prepare('UPDATE topicos_extras SET publico = ? WHERE id = ?').run(publico, numero);
      db.prepare('UPDATE questoes_extras SET publico = ? WHERE topico_id = ?').run(publico, t.id);
    });
    registrar(publico ? 'conteudo.publicado' : 'conteudo.recolhido', { usuarioId: req.usuario.id, alvoId: t.autorId, ip: req.ip, detalhe: `tópico ${t.id}: ${t.titulo}` });
  }
  invalidarAcervo();
  res.json({ ok: true });
});

rotas.delete('/topicos/:id', escrita, (req, res) => {
  const t = topicoDoPedido(req);
  if (!podeEditar(req, t)) throw new ErroDeEntrada('Este tópico não pode ser excluído por você.');
  transacao(() => {
    for (const q of db.prepare('SELECT id FROM questoes_extras WHERE topico_id = ?').all(t.id)) {
      db.prepare('DELETE FROM erros WHERE questao_id = ?').run(`q${q.id}`);
    }
    db.prepare('DELETE FROM questoes_extras WHERE topico_id = ?').run(t.id);
    db.prepare('DELETE FROM topicos_extras WHERE id = ?').run(Number(t.id.slice(1)));
  });
  invalidarAcervo();
  res.json({ ok: true });
});

rotas.post('/topicos/:id/questoes', escrita, (req, res) => {
  const t = topicoDoPedido(req);
  // Em um tópico criado por outro professor só o autor (ou o administrador) acrescenta questões.
  if (t.extra && !t.publico && !podeEditar(req, t)) throw new ErroDeEntrada('Este tópico não pode ser alterado por você.');
  const extras = db.prepare('SELECT COUNT(*) AS n FROM questoes_extras WHERE topico_id = ?').get(t.id).n;
  if (extras >= MAX_QUESTOES_POR_TOPICO) throw new ErroDeEntrada(`Este tópico já tem ${MAX_QUESTOES_POR_TOPICO} questões criadas. Exclua alguma para criar outra.`);
  const q = lerQuestao(req.body);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO questoes_extras (topico_id, autor_id, publico, enunciado, correta, erradas_json, explicacao) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(t.id, req.usuario.id, ehAdmin(req) ? 1 : 0, q.enunciado, q.correta, JSON.stringify(q.erradas), q.explicacao);
  invalidarAcervo();
  res.status(201).json({ id: `q${lastInsertRowid}` });
});

/** Questão criada pela interface que o usuário pode alterar; lança erro nos outros casos. */
function questaoEditavel(req) {
  const q = /^q\d+$/.test(req.params.id) ? questaoPorId(req.params.id) : null;
  if (!q || !podeEditar(req, q)) throw new ErroDeEntrada('Questão não encontrada.');
  return q;
}

rotas.put('/questoes/:id', escrita, (req, res) => {
  const atual = questaoEditavel(req);
  const numero = Number(atual.id.slice(1));
  const q = lerQuestao(req.body);
  db.prepare('UPDATE questoes_extras SET enunciado = ?, correta = ?, erradas_json = ?, explicacao = ? WHERE id = ?').run(
    q.enunciado, q.correta, JSON.stringify(q.erradas), q.explicacao, numero,
  );
  if (ehAdmin(req) && typeof req.body?.publico === 'boolean') {
    db.prepare('UPDATE questoes_extras SET publico = ? WHERE id = ?').run(req.body.publico ? 1 : 0, numero);
    registrar(req.body.publico ? 'conteudo.publicado' : 'conteudo.recolhido', { usuarioId: req.usuario.id, alvoId: atual.autorId, ip: req.ip, detalhe: `questão ${atual.id} de ${topicoBruto(atual.topicoId)?.titulo ?? atual.topicoId}` });
  }
  invalidarAcervo();
  res.json({ ok: true });
});

rotas.delete('/questoes/:id', escrita, (req, res) => {
  const q = questaoEditavel(req);
  transacao(() => {
    db.prepare('DELETE FROM erros WHERE questao_id = ?').run(q.id);
    db.prepare('DELETE FROM questoes_extras WHERE id = ?').run(Number(q.id.slice(1)));
  });
  invalidarAcervo();
  res.json({ ok: true });
});

export default rotas;
