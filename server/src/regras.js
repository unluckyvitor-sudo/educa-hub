// Regras de gamificação: níveis, ganhos de XP/moedas, sequência de dias e missões.
import { db, diaLocal, diasAtras, inicioDaSemana, fimDaSemana } from './db.js';
import { ITEM_POR_ID, MARCOS_SEQUENCIA } from './loja.js';
import { MATERIAS } from './conteudo/index.js';

const TITULOS = [
  'Filhote Curioso',
  'Gatinho Aprendiz',
  'Explorador de Telhados',
  'Gato Estudioso',
  'Caçador de Respostas',
  'Mestre Felino',
  'Sábio Bigodudo',
  'Lenda do Miau',
];

export function nivelDeXp(xp) {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function xpDoNivel(nivel) {
  return 50 * (nivel - 1) ** 2;
}

export function infoNivel(xp) {
  const nivel = nivelDeXp(xp);
  const base = xpDoNivel(nivel);
  const proximo = xpDoNivel(nivel + 1);
  return {
    nivel,
    titulo: TITULOS[Math.min(Math.floor((nivel - 1) / 3), TITULOS.length - 1)],
    xpNoNivel: xp - base,
    xpParaProximo: proximo - base,
  };
}

/** Soma XP e moedas ao usuário e registra o ganho (usado nos rankings por período). */
export function concederGanho(usuarioId, { xp = 0, moedas = 0 }, origem) {
  const antes = db.prepare('SELECT xp FROM usuarios WHERE id = ?').get(usuarioId);
  if (!antes) return { subiuNivel: false, nivel: 1 };
  db.prepare('UPDATE usuarios SET xp = xp + ?, moedas = moedas + ? WHERE id = ?').run(xp, moedas, usuarioId);
  db.prepare('INSERT INTO ganhos (usuario_id, xp, moedas, origem, dia) VALUES (?, ?, ?, ?, ?)').run(
    usuarioId, xp, moedas, origem, diaLocal(),
  );
  const nivelAntes = nivelDeXp(antes.xp);
  const nivel = nivelDeXp(antes.xp + xp);
  return { subiuNivel: nivel > nivelAntes, nivel };
}

/** Sequência vigente: zera se o usuário ficou um dia inteiro sem jogar. */
export function sequenciaAtual(usuario) {
  const dia = usuario.ultimo_dia_ativo;
  return dia === diaLocal() || dia === diasAtras(1) ? usuario.sequencia : 0;
}

export function jogouHoje(usuario) {
  return usuario.ultimo_dia_ativo === diaLocal();
}

/**
 * Marca o dia como jogado, atualiza a sequência e entrega recompensas de marcos.
 * Retorna a sequência nova e os marcos alcançados agora.
 */
export function registrarDiaAtivo(usuarioId) {
  const u = db.prepare('SELECT sequencia, maior_sequencia, ultimo_dia_ativo FROM usuarios WHERE id = ?').get(usuarioId);
  if (!u) return { sequencia: 0, aumentou: false, marcos: [] }; // conta excluída no meio de um jogo
  const hoje = diaLocal();
  if (u.ultimo_dia_ativo === hoje) return { sequencia: u.sequencia, aumentou: false, marcos: [] };

  const sequencia = u.ultimo_dia_ativo === diasAtras(1) ? u.sequencia + 1 : 1;
  db.prepare('UPDATE usuarios SET sequencia = ?, maior_sequencia = ?, ultimo_dia_ativo = ? WHERE id = ?').run(
    sequencia, Math.max(sequencia, u.maior_sequencia), hoje, usuarioId,
  );

  const marcos = [];
  const marco = MARCOS_SEQUENCIA.find((m) => m.dias === sequencia);
  if (marco) {
    const novo = db
      .prepare("INSERT OR IGNORE INTO resgates (usuario_id, chave, periodo) VALUES (?, ?, 'unico')")
      .run(usuarioId, `marco-${marco.dias}`);
    if (novo.changes) {
      concederGanho(usuarioId, { moedas: marco.moedas }, 'sequencia');
      if (marco.item) {
        db.prepare('INSERT OR IGNORE INTO inventario (usuario_id, item_id) VALUES (?, ?)').run(usuarioId, marco.item);
      }
      marcos.push({ dias: marco.dias, moedas: marco.moedas, item: marco.item ? ITEM_POR_ID[marco.item] : null });
    }
  }
  return { sequencia, aumentou: true, marcos };
}

export function infoSequencia(usuario) {
  const resgatados = new Set(
    db
      .prepare("SELECT chave FROM resgates WHERE usuario_id = ? AND chave LIKE 'marco-%'")
      .all(usuario.id)
      .map((r) => Number(r.chave.slice(6))),
  );
  const dias = db
    .prepare('SELECT DISTINCT dia FROM atividades WHERE usuario_id = ? AND dia >= ? UNION SELECT DISTINCT dia FROM duelos WHERE (jogador1_id = ? OR jogador2_id = ?) AND dia >= ?')
    .all(usuario.id, diasAtras(6), usuario.id, usuario.id, diasAtras(6))
    .map((r) => r.dia);
  return {
    atual: sequenciaAtual(usuario),
    maior: usuario.maior_sequencia,
    jogouHoje: jogouHoje(usuario),
    ultimosDias: Array.from({ length: 7 }, (_, i) => {
      const dia = diasAtras(6 - i);
      return { dia, jogou: dias.includes(dia) };
    }),
    marcos: MARCOS_SEQUENCIA.map((m) => ({
      dias: m.dias,
      moedas: m.moedas,
      item: m.item ? ITEM_POR_ID[m.item] : null,
      alcancado: resgatados.has(m.dias),
    })),
  };
}

/** XP e moedas de uma atividade; repetir o mesmo jogo rende menos. */
export function recompensaAtividade(usuarioId, { topicoId, missaoId, modo, revisao = false, acertos, total }) {
  if (revisao) {
    // Caderno de erros: as questões se repetem, então rende menos que um jogo novo — e quase nada depois de três revisões no dia.
    const feitas = db.prepare("SELECT COUNT(*) AS n FROM atividades WHERE usuario_id = ? AND modo = 'revisao' AND dia = ?").get(usuarioId, diaLocal()).n;
    const fator = feitas < 3 ? 1 : 0.2;
    return { xp: Math.round(acertos * 5 * fator), moedas: Math.round(acertos * fator) };
  }
  const perfeito = total > 0 && acertos === total;
  let xp = acertos * 10 + (perfeito ? 20 : 0);
  let moedas = acertos * 2 + (perfeito ? 5 : 0);
  if (missaoId) {
    // Desafio do professor: o gabarito aparece na primeira tentativa, então refazer quase não rende.
    const tentativas = db.prepare('SELECT COUNT(*) AS n FROM atividades WHERE usuario_id = ? AND missao_id = ?').get(usuarioId, missaoId).n;
    const fator = tentativas === 0 ? 1 : tentativas === 1 ? 0.3 : 0;
    xp = Math.round(xp * fator);
    moedas = Math.round(moedas * fator);
  } else if (topicoId) {
    const repeticoes = db
      .prepare('SELECT COUNT(*) AS n FROM atividades WHERE usuario_id = ? AND topico_id = ? AND modo = ? AND dia = ?')
      .get(usuarioId, topicoId, modo, diaLocal()).n;
    const fator = repeticoes === 0 ? 1 : repeticoes === 1 ? 0.5 : 0.2;
    xp = Math.round(xp * fator);
    moedas = Math.round(moedas * fator);
  }
  return { xp, moedas };
}

export const RECOMPENSA_DUELO = {
  vitoria: { xp: 40, moedas: 25 },
  empate: { xp: 25, moedas: 12 },
  derrota: { xp: 15, moedas: 5 },
};

// ───────────── Missões ─────────────

export const MISSOES_SISTEMA = [
  { chave: 'd-atividades', periodo: 'diaria', titulo: 'Aquecimento', descricao: 'Complete 2 atividades', tipo: 'atividades', meta: 2, xp: 20, moedas: 15 },
  { chave: 'd-acertos', periodo: 'diaria', titulo: 'Mira certeira', descricao: 'Acerte 10 questões', tipo: 'acertos', meta: 10, xp: 25, moedas: 15 },
  { chave: 'd-duelo', periodo: 'diaria', titulo: 'Hora do duelo', descricao: 'Jogue 1 duelo', tipo: 'duelos', meta: 1, xp: 20, moedas: 20 },
  { chave: 's-atividades', periodo: 'semanal', titulo: 'Maratonista', descricao: 'Complete 12 atividades na semana', tipo: 'atividades', meta: 12, xp: 120, moedas: 80 },
  { chave: 's-perfeitas', periodo: 'semanal', titulo: 'Gabaritou!', descricao: 'Termine 3 atividades sem errar', tipo: 'perfeitas', meta: 3, xp: 100, moedas: 70 },
  { chave: 's-materias', periodo: 'semanal', titulo: 'Explorador', descricao: 'Estude 4 matérias diferentes', tipo: 'materias', meta: 4, xp: 90, moedas: 60 },
];

export const LIMITE_RECOMPENSA_PROFESSOR = { xp: 300, moedas: 200 };

function intervaloDoPeriodo(periodo) {
  const hoje = diaLocal();
  return periodo === 'diaria'
    ? { chave: hoje, inicio: hoje, fim: hoje }
    : { chave: `S${inicioDaSemana()}`, inicio: inicioDaSemana(), fim: fimDaSemana() };
}

function medirProgresso(usuarioId, { tipo, materia = null, missaoId = null }, inicio, fim) {
  const filtroMateria = materia ? 'AND materia = ?' : '';
  const params = materia ? [usuarioId, inicio, fim, materia] : [usuarioId, inicio, fim];
  const base = `FROM atividades WHERE usuario_id = ? AND dia BETWEEN ? AND ? ${filtroMateria}`;
  switch (tipo) {
    // Uma atividade conta quando teve pelo menos um acerto.
    case 'atividades':
      return db.prepare(`SELECT COUNT(*) AS n ${base} AND acertos > 0`).get(...params).n;
    case 'acertos':
      return db.prepare(`SELECT COALESCE(SUM(acertos), 0) AS n ${base}`).get(...params).n;
    case 'perfeitas':
      return db.prepare(`SELECT COUNT(*) AS n ${base} AND acertos = total AND total >= 3`).get(...params).n;
    case 'materias':
      return db.prepare(`SELECT COUNT(DISTINCT materia) AS n ${base} AND materia IS NOT NULL AND acertos > 0`).get(...params).n;
    case 'duelos':
      return db
        .prepare('SELECT COUNT(*) AS n FROM duelos WHERE (jogador1_id = ? OR jogador2_id = ?) AND dia BETWEEN ? AND ?')
        .get(usuarioId, usuarioId, inicio, fim).n;
    case 'quiz':
      return db.prepare('SELECT COUNT(*) AS n FROM atividades WHERE usuario_id = ? AND missao_id = ?').get(usuarioId, missaoId).n;
    default:
      return 0;
  }
}

function foiResgatada(usuarioId, chave, periodo) {
  return !!db.prepare('SELECT 1 FROM resgates WHERE usuario_id = ? AND chave = ? AND periodo = ?').get(usuarioId, chave, periodo);
}

function missaoDeProfessor(usuarioId, m) {
  const progresso = medirProgresso(usuarioId, { tipo: m.tipo, materia: m.materia, missaoId: m.id }, m.inicio, m.fim);
  const meta = m.tipo === 'quiz' ? 1 : m.meta;
  return {
    chave: `prof-${m.id}`,
    chavePeriodo: 'unico',
    origem: 'professor',
    missaoId: m.id,
    titulo: m.titulo,
    descricao: m.descricao,
    periodo: m.periodo,
    tipo: m.tipo,
    materia: m.materia,
    materiaNome: m.materia ? MATERIAS[m.materia] : null,
    meta,
    progresso: Math.min(progresso, meta),
    concluida: progresso >= meta,
    resgatada: foiResgatada(usuarioId, `prof-${m.id}`, 'unico'),
    xp: m.recompensa_xp,
    moedas: m.recompensa_moedas,
    fim: m.fim,
    turma: m.turma_nome,
    professor: m.professor_nome,
    totalQuestoes: m.tipo === 'quiz' ? JSON.parse(m.questoes_json || '[]').length : null,
  };
}

/** Andamento de um aluno em uma missão de professor (linha da tabela missoes). */
export function andamentoNaMissao(usuarioId, missao) {
  const { progresso, meta, concluida } = missaoDeProfessor(usuarioId, missao);
  return { progresso, meta, concluida };
}

/** Missões do aluno: as do sistema (diárias e semanais) e as criadas pelos professores das turmas dele. */
export function listarMissoes(usuarioId) {
  const doSistema = MISSOES_SISTEMA.map((m) => {
    const { chave: chavePeriodo, inicio, fim } = intervaloDoPeriodo(m.periodo);
    const progresso = medirProgresso(usuarioId, m, inicio, fim);
    return {
      chave: m.chave,
      chavePeriodo,
      origem: 'sistema',
      titulo: m.titulo,
      descricao: m.descricao,
      periodo: m.periodo,
      tipo: m.tipo,
      meta: m.meta,
      progresso: Math.min(progresso, m.meta),
      concluida: progresso >= m.meta,
      resgatada: foiResgatada(usuarioId, m.chave, chavePeriodo),
      xp: m.xp,
      moedas: m.moedas,
      fim,
    };
  });

  const hoje = diaLocal();
  const dosProfessores = db
    .prepare(
      `SELECT m.*, t.nome AS turma_nome, p.nome AS professor_nome
       FROM missoes m
       JOIN turma_membros tm ON tm.turma_id = m.turma_id AND tm.aluno_id = ?
       JOIN turmas t ON t.id = m.turma_id
       JOIN usuarios p ON p.id = m.professor_id
       WHERE m.inicio <= ? AND m.fim >= ?
       ORDER BY m.fim`,
    )
    .all(usuarioId, hoje, hoje)
    .map((m) => missaoDeProfessor(usuarioId, m));

  return [...dosProfessores, ...doSistema];
}

/** Entrega a recompensa de uma missão concluída. Retorna null se não puder resgatar. */
export function resgatarMissao(usuarioId, chave) {
  const missao = listarMissoes(usuarioId).find((m) => m.chave === chave);
  if (!missao || !missao.concluida || missao.resgatada) return null;
  const novo = db
    .prepare('INSERT OR IGNORE INTO resgates (usuario_id, chave, periodo) VALUES (?, ?, ?)')
    .run(usuarioId, missao.chave, missao.chavePeriodo);
  if (!novo.changes) return null;
  const nivel = concederGanho(usuarioId, { xp: missao.xp, moedas: missao.moedas }, 'missao');
  return { xp: missao.xp, moedas: missao.moedas, ...nivel };
}
