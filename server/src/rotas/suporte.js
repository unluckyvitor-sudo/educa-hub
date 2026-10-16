// Suporte: chamados de ajuda (uma conversa entre quem pede e quem atende) e feedbacks sobre a plataforma.
// Um chamado vai para a equipe da plataforma (administradores) ou, se o aluno preferir, para um professor das turmas dele.
import { Router } from 'express';
import { db, transacao } from '../db.js';
import { exigirLogin, exigirPapel, texto, inteiro, ErroDeEntrada } from '../auth.js';
import { SERIE_POR_ID, comSerieEmUso } from '../conteudo/index.js';
import { buscarUsuario } from '../consultas.js';
import { notificar, enviarPara } from '../tempoReal.js';
import { limitar, MINUTO, HORA } from '../limites.js';
import { registrar } from '../registro.js';

const rotas = Router();

export const CATEGORIAS = {
  duvida: 'Como usar a plataforma',
  conteudo: 'Dúvida sobre a matéria',
  problema: 'Algo não está funcionando',
  conta: 'Minha conta e acesso',
  questao: 'Questão ou conteúdo com erro',
  comportamento: 'Comportamento de outra pessoa',
  outro: 'Outro assunto',
};
const STATUS = ['aberto', 'respondido', 'resolvido'];
const MAX_CHAMADOS_ABERTOS = 5;
const EQUIPE = 'Equipe EducaHub';

const idsDosAdmins = () => db.prepare("SELECT id FROM usuarios WHERE papel = 'admin' AND status = 'ativo'").all().map((r) => r.id);

/** Professores ativos das turmas do aluno, para quem ele pode enviar uma dúvida. */
function professoresDoAluno(alunoId) {
  return db
    .prepare(
      `SELECT p.id, p.nome, GROUP_CONCAT(t.nome, ', ') AS turmas
       FROM turma_membros tm JOIN turmas t ON t.id = tm.turma_id JOIN usuarios p ON p.id = t.professor_id
       WHERE tm.aluno_id = ? AND p.status = 'ativo' AND p.papel = 'professor' GROUP BY p.id ORDER BY p.nome`,
    )
    .all(alunoId);
}

/** Quem atende o chamado: o professor responsável ou, sem ele, todos os administradores. */
const atendentesDe = (chamado) => (chamado.responsavel_id ? [chamado.responsavel_id] : idsDosAdmins());

/**
 * Papel do usuário na conversa: 'autor' (quem pediu ajuda), 'atendente' (quem responde)
 * ou null (sem acesso). Administradores atendem qualquer chamado, inclusive os enviados a professores.
 */
function papelNoChamado(chamado, usuario) {
  if (chamado.usuario_id === usuario.id) return 'autor';
  if (usuario.status !== 'ativo') return null;
  if (usuario.papel === 'admin' || (usuario.papel === 'professor' && chamado.responsavel_id === usuario.id)) return 'atendente';
  return null;
}

/** Busca o chamado e confere o acesso. Quem não participa recebe o mesmo "não encontrado" de um id inexistente. */
function chamadoDoPedido(req) {
  const id = Number(req.params.id);
  const chamado = Number.isInteger(id) ? db.prepare('SELECT * FROM chamados WHERE id = ?').get(id) : null;
  const papel = chamado && papelNoChamado(chamado, req.usuario);
  if (!papel) throw new ErroDeEntrada('Chamado não encontrado.');
  return { chamado, papel };
}

function resumoDoChamado(c) {
  return {
    id: c.id,
    categoria: c.categoria,
    categoriaNome: CATEGORIAS[c.categoria] ?? 'Outro assunto',
    assunto: c.assunto,
    status: c.status,
    avaliacao: c.avaliacao,
    atendente: c.responsavel_nome ?? EQUIPE,
    paraProfessor: c.responsavel_id != null,
    criadoEm: c.criado_em,
    atualizadoEm: c.atualizado_em,
    ultimaMensagem: c.ultima ?? null,
  };
}

const SELECAO = `SELECT c.*, r.nome AS responsavel_nome,
  (SELECT texto FROM chamado_mensagens WHERE chamado_id = c.id ORDER BY id DESC LIMIT 1) AS ultima
  FROM chamados c LEFT JOIN usuarios r ON r.id = c.responsavel_id`;

/** Avisa a outra ponta da conversa: notificação no sino e atualização da tela, se ela estiver aberta. */
function avisarParticipantes(chamado, paraIds, textoDoAviso, link) {
  for (const id of paraIds) {
    notificar(id, { tipo: 'suporte', texto: textoDoAviso, link });
    enviarPara(id, 'suporte:atualizado', { chamadoId: chamado.id });
  }
}

// ───────────── Quem pede ajuda ─────────────

rotas.get('/suporte/opcoes', exigirLogin, (req, res) => {
  res.json({
    categorias: Object.entries(CATEGORIAS).map(([id, nome]) => ({ id, nome })),
    professores: req.usuario.papel === 'aluno' ? professoresDoAluno(req.usuario.id) : [],
  });
});

rotas.get('/suporte/chamados', exigirLogin, (req, res) => {
  const chamados = db
    .prepare(`${SELECAO} WHERE c.usuario_id = ? ORDER BY c.status = 'resolvido', c.atualizado_em DESC, c.id DESC LIMIT 100`)
    .all(req.usuario.id)
    .map((c) => ({ ...resumoDoChamado(c), novas: c.novas_para_usuario }));
  res.json({ chamados });
});

rotas.post('/suporte/chamados', exigirLogin, limitar('chamado', 10, HORA, 'Você abriu muitos chamados em pouco tempo. Aguarde um pouco.'), (req, res) => {
  const corpo = req.body ?? {};
  const eu = req.usuario;
  const categoria = Object.hasOwn(CATEGORIAS, corpo.categoria) ? corpo.categoria : null;
  if (!categoria) throw new ErroDeEntrada('Escolha o tipo de ajuda.');
  const assunto = texto(corpo.assunto, 'Assunto', { min: 3, max: 100 });
  const mensagem = texto(corpo.mensagem, 'Mensagem', { min: 5, max: 2000 });

  // Um aluno só escreve para professores das turmas em que está.
  let responsavelId = null;
  if (corpo.professorId != null) {
    const professor = professoresDoAluno(eu.id).find((p) => p.id === Number(corpo.professorId));
    if (eu.papel !== 'aluno' || !professor) throw new ErroDeEntrada('Este professor não está nas suas turmas.');
    responsavelId = professor.id;
  }

  const abertos = db.prepare("SELECT COUNT(*) AS n FROM chamados WHERE usuario_id = ? AND status != 'resolvido'").get(eu.id).n;
  if (abertos >= MAX_CHAMADOS_ABERTOS) {
    throw new ErroDeEntrada(`Você já tem ${MAX_CHAMADOS_ABERTOS} chamados em andamento. Continue a conversa em um deles ou marque algum como resolvido.`);
  }

  const id = transacao(() => {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO chamados (usuario_id, responsavel_id, categoria, assunto, novas_para_atendente) VALUES (?, ?, ?, ?, 1)')
      .run(eu.id, responsavelId, categoria, assunto);
    db.prepare('INSERT INTO chamado_mensagens (chamado_id, autor_id, do_atendente, texto) VALUES (?, ?, 0, ?)').run(lastInsertRowid, eu.id, mensagem);
    return Number(lastInsertRowid);
  });
  const chamado = db.prepare('SELECT * FROM chamados WHERE id = ?').get(id);
  avisarParticipantes(chamado, atendentesDe(chamado), `${eu.nome} pediu ajuda: ${assunto}`, `/atendimento/${id}`);
  res.status(201).json({ id });
});

rotas.get('/suporte/chamados/:id', exigirLogin, (req, res) => {
  const { chamado, papel } = chamadoDoPedido(req);
  const eu = req.usuario;
  // Abrir a conversa zera o contador de mensagens novas de quem abriu.
  // (Um administrador que só acompanha a conversa de um professor não zera o contador dele.)
  if (papel === 'autor') db.prepare('UPDATE chamados SET novas_para_usuario = 0 WHERE id = ?').run(chamado.id);
  else if (!chamado.responsavel_id || chamado.responsavel_id === eu.id) db.prepare('UPDATE chamados SET novas_para_atendente = 0 WHERE id = ?').run(chamado.id);

  const completo = db.prepare(`${SELECAO} WHERE c.id = ?`).get(chamado.id);
  const autor = buscarUsuario(chamado.usuario_id);
  const mensagens = db
    .prepare(
      `SELECT m.id, m.texto, m.do_atendente, m.autor_id, m.criado_em, u.nome, u.papel
       FROM chamado_mensagens m LEFT JOIN usuarios u ON u.id = m.autor_id WHERE m.chamado_id = ? ORDER BY m.id`,
    )
    .all(chamado.id)
    .map((m) => ({
      id: m.id,
      texto: m.texto,
      doAtendente: !!m.do_atendente,
      minha: m.autor_id === eu.id,
      // Quem pede ajuda não vê o nome do administrador: a resposta vem da equipe.
      autor: !m.do_atendente ? (m.nome ?? 'Conta excluída') : m.papel === 'professor' ? `Prof. ${m.nome}` : papel === 'atendente' && m.nome ? `${m.nome} (equipe)` : EQUIPE,
      criadoEm: m.criado_em,
    }));

  res.json({
    chamado: { ...resumoDoChamado(completo), novas: 0 },
    papel,
    mensagens,
    // Quem atende precisa saber com quem está falando.
    autor:
      papel === 'atendente' && autor
        ? { id: autor.id, nome: autor.nome, usuario: autor.usuario, papel: autor.papel, status: autor.status, serieNome: SERIE_POR_ID[comSerieEmUso(autor).serie]?.nome ?? null }
        : null,
  });
});

rotas.post('/suporte/chamados/:id/mensagens', exigirLogin, limitar('chamado-mensagem', 30, 10 * MINUTO), (req, res) => {
  const { chamado, papel } = chamadoDoPedido(req);
  const mensagem = texto(req.body?.texto, 'Mensagem', { min: 1, max: 2000 });
  const eu = req.usuario;

  transacao(() => {
    db.prepare('INSERT INTO chamado_mensagens (chamado_id, autor_id, do_atendente, texto) VALUES (?, ?, ?, ?)').run(chamado.id, eu.id, papel === 'atendente' ? 1 : 0, mensagem);
    // Resposta de quem atende deixa o chamado "respondido"; mensagem de quem pediu reabre o chamado.
    if (papel === 'atendente') {
      db.prepare("UPDATE chamados SET status = 'respondido', novas_para_usuario = novas_para_usuario + 1, atualizado_em = datetime('now') WHERE id = ?").run(chamado.id);
    } else {
      db.prepare("UPDATE chamados SET status = 'aberto', avaliacao = NULL, novas_para_atendente = novas_para_atendente + 1, atualizado_em = datetime('now') WHERE id = ?").run(chamado.id);
    }
  });

  if (papel === 'atendente') {
    avisarParticipantes(chamado, [chamado.usuario_id], `Você recebeu uma resposta em "${chamado.assunto}".`, `/ajuda/chamados/${chamado.id}`);
    // Outros administradores com a conversa aberta também veem a resposta.
    for (const id of atendentesDe(chamado)) if (id !== eu.id) enviarPara(id, 'suporte:atualizado', { chamadoId: chamado.id });
  } else {
    avisarParticipantes(chamado, atendentesDe(chamado), `${eu.nome} respondeu em "${chamado.assunto}".`, `/atendimento/${chamado.id}`);
  }
  res.status(201).json({ ok: true });
});

rotas.post('/suporte/chamados/:id/status', exigirLogin, limitar('chamado-status', 30, 10 * MINUTO), (req, res) => {
  const { chamado, papel } = chamadoDoPedido(req);
  const status = req.body?.status;
  // Quem pediu ajuda pode encerrar ou reabrir; quem atende também pode marcar como respondido.
  const permitidos = papel === 'atendente' ? STATUS : ['aberto', 'resolvido'];
  if (!permitidos.includes(status)) throw new ErroDeEntrada('Situação inválida.');
  if (status === chamado.status) return res.json({ ok: true });

  db.prepare(`UPDATE chamados SET status = ?, atualizado_em = datetime('now')${status === 'resolvido' ? '' : ', avaliacao = NULL'} WHERE id = ?`).run(status, chamado.id);
  if (papel === 'atendente') {
    const aviso = status === 'resolvido' ? `Seu chamado "${chamado.assunto}" foi marcado como resolvido. Conte como foi o atendimento!` : `Seu chamado "${chamado.assunto}" foi reaberto.`;
    if (status !== 'respondido') avisarParticipantes(chamado, [chamado.usuario_id], aviso, `/ajuda/chamados/${chamado.id}`);
  } else {
    for (const id of atendentesDe(chamado)) enviarPara(id, 'suporte:atualizado', { chamadoId: chamado.id });
  }
  res.json({ ok: true });
});

rotas.post('/suporte/chamados/:id/avaliacao', exigirLogin, (req, res) => {
  const { chamado, papel } = chamadoDoPedido(req);
  if (papel !== 'autor') throw new ErroDeEntrada('Só quem pediu ajuda avalia o atendimento.');
  if (chamado.status !== 'resolvido') throw new ErroDeEntrada('Avalie o atendimento depois que o chamado for resolvido.');
  db.prepare('UPDATE chamados SET avaliacao = ? WHERE id = ?').run(inteiro(req.body?.nota, 'Nota', { min: 1, max: 5 }), chamado.id);
  for (const id of atendentesDe(chamado)) enviarPara(id, 'suporte:atualizado', { chamadoId: chamado.id });
  res.json({ ok: true });
});

/** O administrador pode apagar um chamado inteiro (spam, teste, dados pessoais enviados por engano). */
rotas.delete('/suporte/chamados/:id', exigirPapel('admin'), (req, res) => {
  const { chamado } = chamadoDoPedido(req);
  db.prepare('DELETE FROM chamados WHERE id = ?').run(chamado.id);
  registrar('admin.chamado-excluido', { usuarioId: req.usuario.id, alvoId: chamado.usuario_id, ip: req.ip, detalhe: chamado.assunto });
  for (const id of [chamado.usuario_id, ...atendentesDe(chamado)]) enviarPara(id, 'suporte:atualizado', { chamadoId: chamado.id });
  res.json({ ok: true });
});

// ───────────── Quem atende ─────────────

/** Fila de atendimento: do professor (dúvidas dos alunos dele) ou da equipe (administradores). */
rotas.get('/suporte/atendimento', exigirPapel('professor', 'admin'), (req, res) => {
  const eu = req.usuario;
  const filtros = [];
  const params = [];
  if (eu.papel === 'professor') {
    filtros.push('c.responsavel_id = ?');
    params.push(eu.id);
  } else {
    // Administradores veem a fila da equipe ou, para acompanhamento, as conversas entre alunos e professores.
    filtros.push(req.query.fila === 'professores' ? 'c.responsavel_id IS NOT NULL' : 'c.responsavel_id IS NULL');
  }
  if (STATUS.includes(req.query.status)) {
    filtros.push('c.status = ?');
    params.push(req.query.status);
  }
  if (Object.hasOwn(CATEGORIAS, String(req.query.categoria ?? ''))) {
    filtros.push('c.categoria = ?');
    params.push(req.query.categoria);
  }
  const q = String(req.query.q ?? '').trim().toLowerCase().replace(/[%_]/g, '').slice(0, 60);
  if (q) {
    filtros.push('(lower(c.assunto) LIKE ? OR lower(a.nome) LIKE ? OR a.usuario LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const chamados = db
    .prepare(
      `SELECT c.*, r.nome AS responsavel_nome, a.nome AS autor_nome, a.usuario AS autor_usuario, a.papel AS autor_papel,
              (SELECT texto FROM chamado_mensagens WHERE chamado_id = c.id ORDER BY id DESC LIMIT 1) AS ultima
       FROM chamados c JOIN usuarios a ON a.id = c.usuario_id LEFT JOIN usuarios r ON r.id = c.responsavel_id
       WHERE ${filtros.join(' AND ')}
       ORDER BY CASE c.status WHEN 'aberto' THEN 0 WHEN 'respondido' THEN 1 ELSE 2 END, c.atualizado_em DESC, c.id DESC LIMIT 200`,
    )
    .all(...params)
    .map((c) => ({
      ...resumoDoChamado(c),
      novas: c.novas_para_atendente,
      autor: { id: c.usuario_id, nome: c.autor_nome, usuario: c.autor_usuario, papel: c.autor_papel },
    }));
  res.json({ chamados, categorias: Object.entries(CATEGORIAS).map(([id, nome]) => ({ id, nome })) });
});

/** Números para os avisos do menu: respostas novas nos meus chamados e pedidos esperando por mim. */
rotas.get('/suporte/resumo', exigirLogin, (req, res) => {
  const eu = req.usuario;
  const contar = (sql, ...params) => db.prepare(sql).get(...params).n;
  const atende = eu.status === 'ativo' && eu.papel !== 'aluno';
  res.json({
    respostasNovas: contar('SELECT COUNT(*) AS n FROM chamados WHERE usuario_id = ? AND novas_para_usuario > 0', eu.id),
    paraAtender: !atende
      ? 0
      : eu.papel === 'admin'
        ? contar("SELECT COUNT(*) AS n FROM chamados WHERE responsavel_id IS NULL AND status = 'aberto'")
        : contar("SELECT COUNT(*) AS n FROM chamados WHERE responsavel_id = ? AND status = 'aberto'", eu.id),
    feedbacksNovos: eu.papel === 'admin' && atende ? contar('SELECT COUNT(*) AS n FROM feedbacks WHERE lido = 0') : 0,
  });
});

// ───────────── Feedbacks ─────────────

const TIPOS_DE_FEEDBACK = ['elogio', 'sugestao', 'problema'];

rotas.post('/feedback', exigirLogin, limitar('feedback', 6, 24 * HORA, 'Você já enviou vários feedbacks hoje. Obrigado! Volte amanhã para enviar mais.'), (req, res) => {
  const corpo = req.body ?? {};
  if (!TIPOS_DE_FEEDBACK.includes(corpo.tipo)) throw new ErroDeEntrada('Escolha o tipo de feedback.');
  const nota = corpo.nota == null ? null : inteiro(corpo.nota, 'Nota', { min: 1, max: 5 });
  const comentario = texto(corpo.texto, 'Comentário', { max: 1000, opcional: true });
  if (nota == null && !comentario) throw new ErroDeEntrada('Dê uma nota ou escreva um comentário.');
  // A página de onde veio o feedback ajuda a entender o contexto; só caminhos internos são aceitos.
  const pagina = typeof corpo.pagina === 'string' && /^\/[\w\-./]{0,80}$/.test(corpo.pagina) ? corpo.pagina : null;
  db.prepare('INSERT INTO feedbacks (usuario_id, tipo, nota, texto, pagina) VALUES (?, ?, ?, ?, ?)').run(req.usuario.id, corpo.tipo, nota, comentario, pagina);
  for (const id of idsDosAdmins()) enviarPara(id, 'suporte:atualizado', { feedback: true });
  res.status(201).json({ ok: true });
});

export default rotas;
