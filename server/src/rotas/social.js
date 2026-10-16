// Amigos, rankings, missões, sequência, loja, turmas (visão do aluno) e notificações.
import { Router } from 'express';
import { db, inicioDaSemana } from '../db.js';
import { exigirLogin, exigirPapel, resumoPublico, avatarDe } from '../auth.js';
import { SERIE_POR_ID, SERIES_INATIVAS, serieEmUso } from '../conteudo/index.js';
import { ITENS, ITEM_POR_ID } from '../loja.js';
import { listarMissoes, resgatarMissao, infoSequencia } from '../regras.js';
import { buscarUsuario, idsDosAmigos } from '../consultas.js';
import { estaOnline, notificar } from '../tempoReal.js';
import { limitar, MINUTO } from '../limites.js';

const rotas = Router();
const aluno = exigirPapel('aluno');

// ───────────── Amigos ─────────────

rotas.get('/amigos', aluno, (req, res) => {
  const eu = req.usuario.id;
  const linhas = db
    .prepare(
      `SELECT u.*, a.id AS amizade_id, a.status AS amizade_status, a.de_id FROM amizades a
       JOIN usuarios u ON u.id = CASE WHEN a.de_id = ? THEN a.para_id ELSE a.de_id END
       WHERE (a.de_id = ? OR a.para_id = ?) AND u.status = 'ativo'`,
    )
    .all(eu, eu, eu);
  const formatar = (l) => {
    const publico = resumoPublico(l);
    return { ...publico, amizadeId: l.amizade_id, online: estaOnline(l.id), mesmoNivel: publico.serie === req.usuario.serie };
  };
  res.json({
    amigos: linhas.filter((l) => l.amizade_status === 'aceita').map(formatar).sort((a, b) => b.online - a.online || b.xp - a.xp),
    recebidos: linhas.filter((l) => l.amizade_status === 'pendente' && l.de_id !== eu).map(formatar),
    enviados: linhas.filter((l) => l.amizade_status === 'pendente' && l.de_id === eu).map(formatar),
  });
});

const MAX_PEDIDOS_PENDENTES = 30;

rotas.post('/amigos', aluno, limitar('amizade', 20, 10 * MINUTO), (req, res) => {
  const eu = req.usuario;
  const alvo = buscarUsuario(Number(req.body?.usuarioId));
  if (!alvo || alvo.papel !== 'aluno' || alvo.status !== 'ativo' || alvo.id === eu.id) {
    return res.status(400).json({ erro: 'Não foi possível enviar o pedido.' });
  }
  // Teto de pedidos em aberto: ninguém enche de notificações quem não o conhece.
  const pendentes = db.prepare("SELECT COUNT(*) AS n FROM amizades WHERE de_id = ? AND status = 'pendente'").get(eu.id).n;
  if (pendentes >= MAX_PEDIDOS_PENDENTES) {
    return res.status(400).json({ erro: 'Você tem muitos pedidos de amizade aguardando resposta. Espere alguns serem aceitos.' });
  }
  const existente = db
    .prepare('SELECT * FROM amizades WHERE (de_id = ? AND para_id = ?) OR (de_id = ? AND para_id = ?)')
    .get(eu.id, alvo.id, alvo.id, eu.id);
  if (existente?.status === 'aceita') return res.status(409).json({ erro: 'Vocês já são amigos.' });
  if (existente?.de_id === eu.id) return res.status(409).json({ erro: 'Você já enviou um pedido para esta pessoa.' });
  if (existente) {
    // A outra pessoa já tinha pedido: aceitar direto.
    db.prepare("UPDATE amizades SET status = 'aceita' WHERE id = ?").run(existente.id);
    notificar(alvo.id, { tipo: 'amizade', texto: `${eu.nome} aceitou seu pedido de amizade!`, link: '/amigos' });
    return res.json({ status: 'amigos' });
  }
  db.prepare('INSERT INTO amizades (de_id, para_id) VALUES (?, ?)').run(eu.id, alvo.id);
  notificar(alvo.id, { tipo: 'amizade', texto: `${eu.nome} quer ser seu amigo.`, link: '/amigos' });
  res.status(201).json({ status: 'enviado' });
});

rotas.post('/amigos/:amizadeId/aceitar', aluno, (req, res) => {
  const amizade = db.prepare("SELECT * FROM amizades WHERE id = ? AND para_id = ? AND status = 'pendente'").get(Number(req.params.amizadeId), req.usuario.id);
  if (!amizade) return res.status(404).json({ erro: 'Pedido não encontrado.' });
  db.prepare("UPDATE amizades SET status = 'aceita' WHERE id = ?").run(amizade.id);
  notificar(amizade.de_id, { tipo: 'amizade', texto: `${req.usuario.nome} aceitou seu pedido de amizade!`, link: '/amigos' });
  res.json({ ok: true });
});

rotas.delete('/amigos/:amizadeId', aluno, (req, res) => {
  db.prepare('DELETE FROM amizades WHERE id = ? AND (de_id = ? OR para_id = ?)').run(Number(req.params.amizadeId), req.usuario.id, req.usuario.id);
  res.json({ ok: true });
});

// ───────────── Rankings ─────────────

/** Ranking de XP (total ou da semana) entre os alunos de um conjunto. */
export function montarRanking({ filtro, params, periodo, euId = null, limite = 50 }) {
  const sql =
    periodo === 'semana'
      ? `SELECT u.*, COALESCE(SUM(g.xp), 0) AS pontos FROM usuarios u
         LEFT JOIN ganhos g ON g.usuario_id = u.id AND g.dia >= ?
         WHERE u.papel = 'aluno' AND u.status = 'ativo' AND ${filtro}
         GROUP BY u.id ORDER BY pontos DESC, u.xp DESC, u.id`
      : `SELECT u.*, u.xp AS pontos FROM usuarios u
         WHERE u.papel = 'aluno' AND u.status = 'ativo' AND ${filtro}
         ORDER BY pontos DESC, u.id`;
  const todos = db.prepare(sql).all(...(periodo === 'semana' ? [inicioDaSemana(), ...params] : params));
  const posicoes = todos.map((u, i) => ({ ...resumoPublico(u), posicao: i + 1, pontos: u.pontos, online: estaOnline(u.id), eu: u.id === euId }));
  return { ranking: posicoes.slice(0, limite), eu: posicoes.find((p) => p.eu) ?? null, participantes: posicoes.length };
}

rotas.get('/ranking', exigirLogin, (req, res) => {
  const eu = req.usuario;
  const periodo = req.query.periodo === 'total' ? 'total' : 'semana';
  const escopo = String(req.query.escopo ?? 'serie');
  let filtro;
  let params;
  let titulo;

  if (escopo === 'turma') {
    const turmaId = Number(req.query.turmaId);
    const turma = db.prepare('SELECT * FROM turmas WHERE id = ?').get(turmaId);
    const membro = turma && db.prepare('SELECT 1 FROM turma_membros WHERE turma_id = ? AND aluno_id = ?').get(turmaId, eu.id);
    if (!turma || !(membro || turma.professor_id === eu.id || eu.papel === 'admin')) {
      return res.status(403).json({ erro: 'Você não participa desta turma.' });
    }
    filtro = 'u.id IN (SELECT aluno_id FROM turma_membros WHERE turma_id = ?)';
    params = [turmaId];
    titulo = turma.nome;
  } else if (escopo === 'amigos') {
    const ids = [eu.id, ...idsDosAmigos(eu.id)];
    filtro = `u.id IN (${ids.map(() => '?').join(',')})`;
    params = ids;
    titulo = 'Amigos';
  } else if (escopo === 'geral') {
    filtro = '1 = 1';
    params = [];
    titulo = 'Todos os níveis';
  } else {
    const serie = eu.serie ?? serieEmUso(String(req.query.serie ?? ''));
    // Quem está em um nível fora de uso conta no nível que vale para ele (o primeiro ativo).
    params = serie === serieEmUso(SERIES_INATIVAS[0]) ? [serie, ...SERIES_INATIVAS] : [serie];
    filtro = `u.serie IN (${params.map(() => '?').join(',')})`;
    titulo = SERIE_POR_ID[serie]?.nome ?? 'Nível';
  }
  res.json({ titulo, periodo, escopo, ...montarRanking({ filtro, params, periodo, euId: eu.id }) });
});

// ───────────── Missões e sequência ─────────────

rotas.get('/missoes', aluno, (req, res) => {
  res.json({ missoes: listarMissoes(req.usuario.id), sequencia: infoSequencia(req.usuario) });
});

rotas.post('/missoes/resgatar', aluno, (req, res) => {
  const recompensa = resgatarMissao(req.usuario.id, String(req.body?.chave ?? ''));
  if (!recompensa) return res.status(400).json({ erro: 'Esta missão ainda não pode ser resgatada.' });
  res.json({ recompensa });
});

// ───────────── Loja ─────────────

rotas.get('/loja', exigirLogin, (req, res) => {
  const possui = new Set(db.prepare('SELECT item_id FROM inventario WHERE usuario_id = ?').all(req.usuario.id).map((r) => r.item_id));
  res.json({
    moedas: req.usuario.moedas,
    avatar: avatarDe(req.usuario),
    itens: ITENS.map((i) => ({ ...i, possui: !!i.padrao || possui.has(i.id) })),
  });
});

rotas.post('/loja/comprar', aluno, (req, res) => {
  const item = ITEM_POR_ID[req.body?.itemId];
  if (!item || !item.preco) return res.status(400).json({ erro: 'Este item não está à venda.' });
  const eu = buscarUsuario(req.usuario.id);
  if (db.prepare('SELECT 1 FROM inventario WHERE usuario_id = ? AND item_id = ?').get(eu.id, item.id)) {
    return res.status(409).json({ erro: 'Você já tem este item.' });
  }
  // O débito só acontece se o saldo for suficiente no momento da escrita.
  const debito = db.prepare('UPDATE usuarios SET moedas = moedas - ? WHERE id = ? AND moedas >= ?').run(item.preco, eu.id, item.preco);
  if (!debito.changes) return res.status(400).json({ erro: `Faltam ${item.preco - eu.moedas} moedas para comprar "${item.nome}".` });
  db.prepare('INSERT INTO inventario (usuario_id, item_id) VALUES (?, ?)').run(eu.id, item.id);
  res.json({ moedas: eu.moedas - item.preco, item });
});

// ───────────── Turmas (aluno) ─────────────

rotas.get('/turmas/minhas', aluno, (req, res) => {
  const turmas = db
    .prepare(
      `SELECT t.id, t.nome, t.serie, t.descricao, p.nome AS professor,
              (SELECT COUNT(*) FROM turma_membros WHERE turma_id = t.id) AS membros
       FROM turma_membros tm JOIN turmas t ON t.id = tm.turma_id JOIN usuarios p ON p.id = t.professor_id
       WHERE tm.aluno_id = ? ORDER BY t.nome`,
    )
    .all(req.usuario.id)
    .map((t) => ({ ...t, serie: serieEmUso(t.serie), serieNome: SERIE_POR_ID[serieEmUso(t.serie)]?.nome }));
  res.json({ turmas });
});

// O teto de tentativas impede adivinhar códigos de turma por tentativa e erro.
rotas.post('/turmas/entrar', aluno, limitar('turma', 10, 10 * MINUTO, 'Muitas tentativas de código. Confira o código com seu professor e tente de novo em alguns minutos.'), (req, res) => {
  const codigo = String(req.body?.codigo ?? '').trim().toUpperCase();
  const turma = db.prepare('SELECT * FROM turmas WHERE codigo = ?').get(codigo);
  if (!turma) return res.status(404).json({ erro: 'Código de turma não encontrado. Confira com seu professor.' });
  if (serieEmUso(turma.serie) !== req.usuario.serie) {
    return res.status(400).json({
      erro: `Esta turma é de ${SERIE_POR_ID[serieEmUso(turma.serie)]?.nome}, e o seu perfil está em ${SERIE_POR_ID[req.usuario.serie]?.nome}. Ajuste seu nível em Configurações se necessário.`,
    });
  }
  const novo = db.prepare('INSERT OR IGNORE INTO turma_membros (turma_id, aluno_id) VALUES (?, ?)').run(turma.id, req.usuario.id);
  if (novo.changes) {
    notificar(turma.professor_id, { tipo: 'turma', texto: `${req.usuario.nome} entrou na turma ${turma.nome}.`, link: `/turmas/${turma.id}` });
  }
  res.json({ turma: { id: turma.id, nome: turma.nome } });
});

rotas.delete('/turmas/:id/sair', aluno, (req, res) => {
  db.prepare('DELETE FROM turma_membros WHERE turma_id = ? AND aluno_id = ?').run(Number(req.params.id), req.usuario.id);
  res.json({ ok: true });
});

// ───────────── Notificações ─────────────

rotas.get('/notificacoes', exigirLogin, (req, res) => {
  res.json({
    notificacoes: db
      .prepare('SELECT id, tipo, texto, link, lida, criado_em FROM notificacoes WHERE usuario_id = ? ORDER BY id DESC LIMIT 30')
      .all(req.usuario.id),
  });
});

rotas.post('/notificacoes/lidas', exigirLogin, (req, res) => {
  db.prepare('UPDATE notificacoes SET lida = 1 WHERE usuario_id = ? AND lida = 0').run(req.usuario.id);
  res.json({ ok: true });
});

export default rotas;
