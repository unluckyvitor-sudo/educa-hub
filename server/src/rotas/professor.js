// Área do professor: turmas, acompanhamento dos alunos e missões.
import crypto from 'node:crypto';
import { Router } from 'express';
import { db, diaLocal, diasAtras, inicioDaSemana } from '../db.js';
import { exigirPapel, resumoPublico, texto, inteiro, ErroDeEntrada } from '../auth.js';
import { MATERIAS, SERIE_POR_ID, serieValida, materiasDaSerie } from '../conteudo/index.js';
import { tituloDoTopico, dificuldadesDe } from '../acervo.js';
import { andamentoNaMissao, LIMITE_RECOMPENSA_PROFESSOR } from '../regras.js';
import { buscarUsuario, professorDoAluno, estatisticasDoAluno } from '../consultas.js';
import { estaOnline, notificar } from '../tempoReal.js';
import { montarRanking } from './social.js';
import { limitar, HORA } from '../limites.js';
import { progressoDoAluno } from './aprender.js';

const rotas = Router();
rotas.use(exigirPapel('professor', 'admin'));

const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem letras e números que se confundem

function gerarCodigo() {
  for (;;) {
    const codigo = Array.from(crypto.randomBytes(6), (b) => ALFABETO_CODIGO[b % ALFABETO_CODIGO.length]).join('');
    if (!db.prepare('SELECT 1 FROM turmas WHERE codigo = ?').get(codigo)) return codigo;
  }
}

/** Turma do professor logado (administradores acessam qualquer turma). */
function turmaDoProfessor(req, id = req.params.id) {
  const turma = db.prepare('SELECT * FROM turmas WHERE id = ?').get(Number(id));
  if (!turma || (turma.professor_id !== req.usuario.id && req.usuario.papel !== 'admin')) {
    throw new ErroDeEntrada('Turma não encontrada.');
  }
  return turma;
}

const formatarTurma = (t) => ({
  id: t.id,
  nome: t.nome,
  serie: t.serie,
  serieNome: SERIE_POR_ID[t.serie]?.nome,
  descricao: t.descricao,
  codigo: t.codigo,
  criadoEm: t.criado_em,
});

function membrosDaTurma(turmaId) {
  return db
    .prepare('SELECT u.* FROM turma_membros tm JOIN usuarios u ON u.id = tm.aluno_id WHERE tm.turma_id = ? ORDER BY u.nome')
    .all(turmaId);
}

function formatarAtividade(a) {
  return {
    id: a.id,
    alunoId: a.usuario_id,
    aluno: a.aluno,
    materia: MATERIAS[a.materia] ?? null,
    titulo: a.missao ?? tituloDoTopico(a.topico_id) ?? (a.modo === 'revisao' ? 'Caderno de erros' : 'Atividade'),
    modo: a.modo,
    acertos: a.acertos,
    total: a.total,
    quando: a.criado_em,
  };
}

function atividadesRecentes(filtro, params, limite) {
  return db
    .prepare(
      `SELECT a.*, u.nome AS aluno, m.titulo AS missao FROM atividades a
       JOIN usuarios u ON u.id = a.usuario_id LEFT JOIN missoes m ON m.id = a.missao_id
       WHERE ${filtro} ORDER BY a.id DESC LIMIT ?`,
    )
    .all(...params, limite)
    .map(formatarAtividade);
}

const ALUNOS_DO_PROFESSOR = 'SELECT tm.aluno_id FROM turma_membros tm JOIN turmas t ON t.id = tm.turma_id WHERE t.professor_id = ?';

rotas.get('/resumo', (req, res) => {
  const eu = req.usuario.id;
  const alunos = db.prepare(`SELECT * FROM usuarios WHERE id IN (${ALUNOS_DO_PROFESSOR}) ORDER BY nome`).all(eu);
  const hoje = diaLocal();
  res.json({
    turmas: db.prepare('SELECT COUNT(*) AS n FROM turmas WHERE professor_id = ?').get(eu).n,
    alunos: alunos.length,
    online: alunos.filter((a) => estaOnline(a.id)).map(resumoPublico),
    atividadesHoje: db.prepare(`SELECT COUNT(*) AS n FROM atividades WHERE dia = ? AND usuario_id IN (${ALUNOS_DO_PROFESSOR})`).get(hoje, eu).n,
    ativosNaSemana: db
      .prepare(`SELECT COUNT(DISTINCT usuario_id) AS n FROM atividades WHERE dia >= ? AND usuario_id IN (${ALUNOS_DO_PROFESSOR})`)
      .get(inicioDaSemana(), eu).n,
    missoesAtivas: db.prepare('SELECT COUNT(*) AS n FROM missoes WHERE professor_id = ? AND fim >= ?').get(eu, hoje).n,
    destaques: montarRanking({ filtro: `u.id IN (${ALUNOS_DO_PROFESSOR})`, params: [eu], periodo: 'semana', limite: 5 }).ranking,
    recentes: atividadesRecentes(`a.usuario_id IN (${ALUNOS_DO_PROFESSOR})`, [eu], 12),
  });
});

rotas.get('/turmas', (req, res) => {
  const turmas = db.prepare('SELECT * FROM turmas WHERE professor_id = ? ORDER BY nome').all(req.usuario.id).map((t) => {
    const membros = membrosDaTurma(t.id);
    return { ...formatarTurma(t), membros: membros.length, online: membros.filter((m) => estaOnline(m.id)).length };
  });
  res.json({ turmas });
});

rotas.post('/turmas', (req, res) => {
  const corpo = req.body ?? {};
  const nome = texto(corpo.nome, 'Nome da turma', { min: 2, max: 60 });
  const descricao = texto(corpo.descricao, 'Descrição', { max: 200, opcional: true });
  if (!serieValida(corpo.serie)) throw new ErroDeEntrada('Escolha o nível de ensino da turma.');
  const { lastInsertRowid } = db
    .prepare('INSERT INTO turmas (professor_id, nome, serie, descricao, codigo) VALUES (?, ?, ?, ?, ?)')
    .run(req.usuario.id, nome, corpo.serie, descricao, gerarCodigo());
  res.status(201).json({ turma: formatarTurma(db.prepare('SELECT * FROM turmas WHERE id = ?').get(lastInsertRowid)) });
});

rotas.put('/turmas/:id', (req, res) => {
  const turma = turmaDoProfessor(req);
  const nome = texto(req.body?.nome, 'Nome da turma', { min: 2, max: 60 });
  const descricao = texto(req.body?.descricao, 'Descrição', { max: 200, opcional: true });
  db.prepare('UPDATE turmas SET nome = ?, descricao = ? WHERE id = ?').run(nome, descricao, turma.id);
  res.json({ ok: true });
});

rotas.post('/turmas/:id/codigo', (req, res) => {
  const turma = turmaDoProfessor(req);
  const codigo = gerarCodigo();
  db.prepare('UPDATE turmas SET codigo = ? WHERE id = ?').run(codigo, turma.id);
  res.json({ codigo });
});

rotas.delete('/turmas/:id', (req, res) => {
  db.prepare('DELETE FROM turmas WHERE id = ?').run(turmaDoProfessor(req).id);
  res.json({ ok: true });
});

rotas.get('/turmas/:id', (req, res) => {
  const turma = turmaDoProfessor(req);
  const semana = inicioDaSemana();
  const xpSemana = Object.fromEntries(
    db
      .prepare('SELECT usuario_id, SUM(xp) AS xp FROM ganhos WHERE dia >= ? AND usuario_id IN (SELECT aluno_id FROM turma_membros WHERE turma_id = ?) GROUP BY usuario_id')
      .all(semana, turma.id)
      .map((r) => [r.usuario_id, r.xp]),
  );
  const brutos = membrosDaTurma(turma.id);
  const membros = brutos.map((m) => ({
    ...resumoPublico(m),
    online: estaOnline(m.id),
    vistoEm: m.visto_em,
    ultimoDiaAtivo: m.ultimo_dia_ativo,
    xpSemana: xpSemana[m.id] ?? 0,
    estatisticas: estatisticasDoAluno(m.id),
  }));
  const hoje = diaLocal();
  const missoes = db.prepare('SELECT * FROM missoes WHERE turma_id = ? ORDER BY fim DESC, id DESC LIMIT 30').all(turma.id).map((m) => ({
    ...formatarMissao(m),
    ativa: m.fim >= hoje,
    concluiram: brutos.filter((a) => andamentoNaMissao(a.id, m).concluida).length,
    participantes: brutos.length,
  }));
  res.json({
    turma: formatarTurma(turma),
    membros,
    missoes,
    materias: materiasDaSerie(turma.serie).map((m) => ({ id: m.id, nome: m.nome })),
    recentes: atividadesRecentes('a.usuario_id IN (SELECT aluno_id FROM turma_membros WHERE turma_id = ?)', [turma.id], 30),
    ranking: {
      semana: montarRanking({ filtro: 'u.id IN (SELECT aluno_id FROM turma_membros WHERE turma_id = ?)', params: [turma.id], periodo: 'semana' }).ranking,
      total: montarRanking({ filtro: 'u.id IN (SELECT aluno_id FROM turma_membros WHERE turma_id = ?)', params: [turma.id], periodo: 'total' }).ranking,
    },
  });
});

// Questões em que a turma mais erra: mostra ao professor o que vale retomar em sala.
rotas.get('/turmas/:id/dificuldades', (req, res) => {
  const turma = turmaDoProfessor(req);
  res.json({ questoes: dificuldadesDe(membrosDaTurma(turma.id).map((m) => m.id)) });
});

rotas.delete('/turmas/:id/membros/:alunoId', (req, res) => {
  const turma = turmaDoProfessor(req);
  db.prepare('DELETE FROM turma_membros WHERE turma_id = ? AND aluno_id = ?').run(turma.id, Number(req.params.alunoId));
  res.json({ ok: true });
});

rotas.get('/alunos/:id', (req, res) => {
  const aluno = buscarUsuario(Number(req.params.id));
  const permitido = aluno && aluno.papel === 'aluno' && (req.usuario.papel === 'admin' || professorDoAluno(req.usuario.id, aluno.id));
  if (!permitido) return res.status(404).json({ erro: 'Aluno não encontrado nas suas turmas.' });
  res.json({
    aluno: { ...resumoPublico(aluno), email: aluno.email, instituicao: aluno.instituicao, online: estaOnline(aluno.id), vistoEm: aluno.visto_em },
    progresso: progressoDoAluno(aluno),
  });
});

// ───────────── Missões ─────────────

function formatarMissao(m) {
  return {
    id: m.id,
    turmaId: m.turma_id,
    titulo: m.titulo,
    descricao: m.descricao,
    periodo: m.periodo,
    tipo: m.tipo,
    materia: m.materia,
    materiaNome: MATERIAS[m.materia] ?? null,
    meta: m.meta,
    xp: m.recompensa_xp,
    moedas: m.recompensa_moedas,
    questoes: m.tipo === 'quiz' ? JSON.parse(m.questoes_json || '[]').length : null,
    inicio: m.inicio,
    fim: m.fim,
  };
}

function lerQuestoes(lista) {
  if (!Array.isArray(lista) || lista.length < 1 || lista.length > 20) {
    throw new ErroDeEntrada('O desafio precisa ter de 1 a 20 questões.');
  }
  return lista.map((q, i) => {
    const n = i + 1;
    const alternativas = Array.isArray(q?.alternativas) ? q.alternativas.map((a) => texto(a, `Alternativa da questão ${n}`, { min: 1, max: 160 })) : [];
    if (alternativas.length !== 4) throw new ErroDeEntrada(`A questão ${n} precisa de 4 alternativas.`);
    if (new Set(alternativas.map((a) => a.toLowerCase())).size !== 4) throw new ErroDeEntrada(`A questão ${n} tem alternativas repetidas.`);
    return {
      enunciado: texto(q.enunciado, `Enunciado da questão ${n}`, { min: 3, max: 300 }),
      alternativas,
      correta: inteiro(q.correta, `Resposta correta da questão ${n}`, { min: 0, max: 3 }),
      explicacao: texto(q.explicacao, 'Explicação', { max: 300, opcional: true }),
    };
  });
}

rotas.get('/missoes', (req, res) => {
  const hoje = diaLocal();
  const missoes = db
    .prepare('SELECT m.*, t.nome AS turma FROM missoes m JOIN turmas t ON t.id = m.turma_id WHERE m.professor_id = ? AND m.fim >= ? ORDER BY m.fim DESC, m.id DESC')
    .all(req.usuario.id, diasAtras(30))
    .map((m) => {
      const membros = membrosDaTurma(m.turma_id);
      return {
        ...formatarMissao(m),
        turma: m.turma,
        ativa: m.fim >= hoje,
        concluiram: membros.filter((a) => andamentoNaMissao(a.id, m).concluida).length,
        participantes: membros.length,
      };
    });
  res.json({ missoes, limites: LIMITE_RECOMPENSA_PROFESSOR });
});

const MAX_MISSOES_ATIVAS_POR_TURMA = 12;

rotas.post('/missoes', limitar('missao', 30, HORA), (req, res) => {
  const corpo = req.body ?? {};
  const turma = turmaDoProfessor(req, corpo.turmaId);
  // Cada missão entrega XP e moedas: o teto evita inflar o ranking de uma turma com missões em série.
  const ativas = db.prepare('SELECT COUNT(*) AS n FROM missoes WHERE turma_id = ? AND fim >= ?').get(turma.id, diaLocal()).n;
  if (ativas >= MAX_MISSOES_ATIVAS_POR_TURMA) {
    throw new ErroDeEntrada(`Esta turma já tem ${MAX_MISSOES_ATIVAS_POR_TURMA} missões ativas. Exclua uma ou espere alguma terminar.`);
  }
  const tipo = ['atividades', 'acertos', 'quiz'].includes(corpo.tipo) ? corpo.tipo : null;
  if (!tipo) throw new ErroDeEntrada('Tipo de missão inválido.');
  const periodo = corpo.periodo === 'semanal' ? 'semanal' : 'diaria';
  const materia = corpo.materia && materiasDaSerie(turma.serie).some((m) => m.id === corpo.materia) ? corpo.materia : null;
  const questoes = tipo === 'quiz' ? lerQuestoes(corpo.questoes) : null;
  const hoje = diaLocal();
  const fim = periodo === 'diaria' ? hoje : diasAtras(-6);

  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO missoes (turma_id, professor_id, titulo, descricao, periodo, tipo, materia, meta, recompensa_xp, recompensa_moedas, questoes_json, inicio, fim)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      turma.id, req.usuario.id,
      texto(corpo.titulo, 'Título', { min: 3, max: 60 }),
      texto(corpo.descricao, 'Descrição', { max: 200, opcional: true }),
      periodo, tipo, materia,
      tipo === 'quiz' ? 1 : inteiro(corpo.meta, 'Meta', { min: 1, max: 200 }),
      inteiro(corpo.xp ?? 0, 'XP', { min: 0, max: LIMITE_RECOMPENSA_PROFESSOR.xp }),
      inteiro(corpo.moedas ?? 0, 'Moedas', { min: 0, max: LIMITE_RECOMPENSA_PROFESSOR.moedas }),
      questoes ? JSON.stringify(questoes) : null,
      hoje, fim,
    );
  const missao = db.prepare('SELECT * FROM missoes WHERE id = ?').get(lastInsertRowid);
  for (const m of membrosDaTurma(turma.id)) {
    notificar(m.id, { tipo: 'missao', texto: `Nova missão de ${req.usuario.nome}: ${missao.titulo}`, link: '/desafios' });
  }
  res.status(201).json({ missao: formatarMissao(missao) });
});

rotas.delete('/missoes/:missaoId', (req, res) => {
  const missao = db.prepare('SELECT * FROM missoes WHERE id = ?').get(Number(req.params.missaoId));
  if (!missao || (missao.professor_id !== req.usuario.id && req.usuario.papel !== 'admin')) {
    return res.status(404).json({ erro: 'Missão não encontrada.' });
  }
  db.prepare('DELETE FROM missoes WHERE id = ?').run(missao.id);
  res.json({ ok: true });
});

export default rotas;
