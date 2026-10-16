// Área do administrador: visão geral, usuários, turmas e moderação.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { db, diaLocal, diasAtras, PASTA_DADOS } from '../db.js';
import { exigirPapel, gerarHash, conferirSenha, encerrarSessoesDoUsuario, inteiro } from '../auth.js';
import { registrar, ultimosRegistros } from '../registro.js';
import { SERIES_ATIVAS, SERIE_POR_ID, serieEmUso } from '../conteudo/index.js';
import { concederGanho } from '../regras.js';
import { buscarUsuario } from '../consultas.js';
import { estaOnline, totalOnline, notificar, desconectarUsuario } from '../tempoReal.js';
import { fazerCopia, resumoDasCopias } from '../copias.js';
import { limitar, HORA } from '../limites.js';
import { sobreAInstalacao } from '../termos.js';

const rotas = Router();
rotas.use(exigirPapel('admin'));

const contar = (sql, ...params) => db.prepare(sql).get(...params).n;

/** Anota no registro de auditoria uma ação do administrador sobre outra conta. */
const anotar = (req, acao, alvo, detalhe = null) => registrar(acao, { usuarioId: req.usuario.id, alvoId: alvo?.id ?? null, ip: req.ip, detalhe });

let avisosEmCache = { ate: 0, avisos: [] };

/** Pendências de segurança que só o administrador resolve (senha inicial em uso, contas de demonstração). */
async function avisosDeSeguranca() {
  if (Date.now() < avisosEmCache.ate) return avisosEmCache.avisos;
  const avisos = [];
  const arquivo = path.join(PASTA_DADOS, 'admin-inicial.txt');
  if (fs.existsSync(arquivo)) {
    const senha = /Senha: (\S+)/.exec(fs.readFileSync(arquivo, 'utf8'))?.[1];
    const admin = db.prepare("SELECT senha_hash FROM usuarios WHERE usuario = 'admin'").get();
    const emUso = !!senha && !!admin && (await conferirSenha(senha, admin.senha_hash));
    avisos.push(
      emUso
        ? 'A conta "admin" ainda usa a senha inicial, que está gravada no arquivo admin-inicial.txt da pasta de dados. Troque a senha em Configurações e apague o arquivo.'
        : 'O arquivo admin-inicial.txt (com a senha inicial do administrador) ainda está na pasta de dados. Ele não é mais necessário: apague-o.',
    );
  }
  if (fs.existsSync(path.join(PASTA_DADOS, 'contas-demo.txt')) && db.prepare("SELECT 1 FROM usuarios WHERE usuario = 'prof.marina'").get()) {
    avisos.push('As contas de demonstração estão ativas e todas usam a mesma senha. Exclua-as antes de abrir a plataforma para alunos de verdade.');
  }
  if (!sobreAInstalacao().responsavel) {
    avisos.push('Os Termos de uso e a Política de privacidade ainda não dizem quem responde por esta instalação. Defina as variáveis EDUCAHUB_RESPONSAVEL e EDUCAHUB_CONTATO e revise os textos: eles são um modelo, não substituem orientação jurídica.');
  }
  avisosEmCache = { ate: Date.now() + 60 * 1000, avisos };
  return avisos;
}

function formatarUsuario(u) {
  return {
    id: u.id,
    papel: u.papel,
    status: u.status,
    nome: u.nome,
    usuario: u.usuario,
    email: u.email,
    serie: u.papel === 'aluno' ? serieEmUso(u.serie) : u.serie,
    serieNome: SERIE_POR_ID[u.papel === 'aluno' ? serieEmUso(u.serie) : u.serie]?.nome ?? null,
    instituicao: u.instituicao,
    disciplinas: u.disciplinas,
    xp: u.xp,
    moedas: u.moedas,
    sequencia: u.sequencia,
    criadoEm: u.criado_em,
    vistoEm: u.visto_em,
    online: estaOnline(u.id),
  };
}

rotas.get('/resumo', async (_req, res) => {
  const hoje = diaLocal();
  const porDia = Object.fromEntries(
    db.prepare('SELECT dia, COUNT(*) AS n FROM atividades WHERE dia >= ? GROUP BY dia').all(diasAtras(13)).map((r) => [r.dia, r.n]),
  );
  const porSerie = {};
  for (const r of db.prepare("SELECT serie, COUNT(*) AS n FROM usuarios WHERE papel = 'aluno' GROUP BY serie").all()) {
    porSerie[serieEmUso(r.serie)] = (porSerie[serieEmUso(r.serie)] ?? 0) + r.n;
  }
  res.json({
    alunos: contar("SELECT COUNT(*) AS n FROM usuarios WHERE papel = 'aluno'"),
    professores: contar("SELECT COUNT(*) AS n FROM usuarios WHERE papel = 'professor' AND status = 'ativo'"),
    pendentes: db.prepare("SELECT * FROM usuarios WHERE papel = 'professor' AND status = 'pendente' ORDER BY id DESC").all().map(formatarUsuario),
    turmas: contar('SELECT COUNT(*) AS n FROM turmas'),
    online: totalOnline(),
    atividadesHoje: contar('SELECT COUNT(*) AS n FROM atividades WHERE dia = ?', hoje),
    duelosHoje: contar('SELECT COUNT(*) AS n FROM duelos WHERE dia = ?', hoje),
    novosNaSemana: contar("SELECT COUNT(*) AS n FROM usuarios WHERE criado_em >= datetime('now', '-7 days')"),
    chamadosAbertos: contar("SELECT COUNT(*) AS n FROM chamados WHERE responsavel_id IS NULL AND status = 'aberto'"),
    feedbacksNovos: contar('SELECT COUNT(*) AS n FROM feedbacks WHERE lido = 0'),
    avisos: await avisosDeSeguranca(),
    copias: resumoDasCopias(),
    atividadesPorDia: Array.from({ length: 14 }, (_, i) => {
      const dia = diasAtras(13 - i);
      return { dia, total: porDia[dia] ?? 0 };
    }),
    alunosPorSerie: SERIES_ATIVAS.map((s) => ({ serie: s.id, nome: s.nome, total: porSerie[s.id] ?? 0 })),
  });
});

// Cópia de segurança sob demanda (antes de uma mudança grande, por exemplo). A diária é automática.
rotas.post('/copias', limitar('copia', 12, HORA, 'Muitas cópias em pouco tempo. Aguarde um pouco.'), (req, res) => {
  const copia = fazerCopia();
  registrar('admin.copia', { usuarioId: req.usuario.id, ip: req.ip, detalhe: copia.nome });
  res.status(201).json({ copias: resumoDasCopias() });
});

rotas.get('/usuarios', (req, res) => {
  const filtros = ['1 = 1'];
  const params = [];
  const q = String(req.query.q ?? '').trim().toLowerCase().replace(/[%_]/g, '');
  if (q) {
    filtros.push("(usuario LIKE ? OR lower(nome) LIKE ? OR lower(COALESCE(email, '')) LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (['aluno', 'professor', 'admin'].includes(req.query.papel)) {
    filtros.push('papel = ?');
    params.push(req.query.papel);
  }
  if (['ativo', 'pendente', 'bloqueado'].includes(req.query.status)) {
    filtros.push('status = ?');
    params.push(req.query.status);
  }
  const usuarios = db.prepare(`SELECT * FROM usuarios WHERE ${filtros.join(' AND ')} ORDER BY id DESC LIMIT 200`).all(...params);
  res.json({ usuarios: usuarios.map(formatarUsuario) });
});

/** Usuário alvo de uma ação administrativa; o administrador não altera a própria conta por aqui. */
function alvoDaAcao(req, res) {
  const alvo = buscarUsuario(Number(req.params.id));
  if (!alvo) {
    res.status(404).json({ erro: 'Usuário não encontrado.' });
    return null;
  }
  if (alvo.id === req.usuario.id) {
    res.status(400).json({ erro: 'Use Configurações para alterar a sua própria conta.' });
    return null;
  }
  return alvo;
}

rotas.put('/usuarios/:id', (req, res) => {
  const alvo = alvoDaAcao(req, res);
  if (!alvo) return;
  const { status, papel } = req.body ?? {};
  if (status != null) {
    if (!['ativo', 'pendente', 'bloqueado'].includes(status)) return res.status(400).json({ erro: 'Status inválido.' });
    db.prepare('UPDATE usuarios SET status = ? WHERE id = ?').run(status, alvo.id);
    if (status !== alvo.status) anotar(req, 'admin.situacao', alvo, `${alvo.status} → ${status}`);
    if (status === 'bloqueado') {
      encerrarSessoesDoUsuario(alvo.id);
      desconectarUsuario(alvo.id);
    }
    if (status === 'ativo' && alvo.status === 'pendente') {
      notificar(alvo.id, { tipo: 'conta', texto: 'Sua conta de professor foi aprovada. Bem-vindo(a)!', link: '/' });
    }
  }
  if (papel != null) {
    if (!['aluno', 'professor', 'admin'].includes(papel)) return res.status(400).json({ erro: 'Papel inválido.' });
    if (papel === 'aluno' && !alvo.serie) return res.status(400).json({ erro: 'Esta conta não tem nível de ensino definido.' });
    db.prepare('UPDATE usuarios SET papel = ? WHERE id = ?').run(papel, alvo.id);
    if (papel !== alvo.papel) anotar(req, 'admin.papel', alvo, `${alvo.papel} → ${papel}`);
  }
  res.json({ usuario: formatarUsuario(buscarUsuario(alvo.id)) });
});

rotas.post('/usuarios/:id/moedas', (req, res) => {
  const alvo = alvoDaAcao(req, res);
  if (!alvo) return;
  const quantidade = inteiro(req.body?.quantidade, 'Quantidade', { min: -100000, max: 100000 });
  if (alvo.moedas + quantidade < 0) return res.status(400).json({ erro: 'O saldo não pode ficar negativo.' });
  concederGanho(alvo.id, { moedas: quantidade }, 'admin');
  anotar(req, 'admin.moedas', alvo, quantidade > 0 ? `+${quantidade}` : String(quantidade));
  if (quantidade > 0) notificar(alvo.id, { tipo: 'moedas', texto: `Você recebeu ${quantidade} moedas da administração!`, link: '/avatar' });
  res.json({ usuario: formatarUsuario(buscarUsuario(alvo.id)) });
});

rotas.post('/usuarios/:id/senha', async (req, res) => {
  const alvo = alvoDaAcao(req, res);
  if (!alvo) return;
  const senhaTemporaria = crypto.randomBytes(6).toString('base64url');
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(await gerarHash(senhaTemporaria), alvo.id);
  encerrarSessoesDoUsuario(alvo.id);
  desconectarUsuario(alvo.id);
  anotar(req, 'admin.senha', alvo);
  res.json({ senhaTemporaria });
});

rotas.delete('/usuarios/:id', (req, res) => {
  const alvo = alvoDaAcao(req, res);
  if (!alvo) return;
  desconectarUsuario(alvo.id);
  anotar(req, 'admin.exclusao', alvo, alvo.papel); // antes de apagar, para o registro guardar o nome da conta
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(alvo.id);
  res.json({ ok: true });
});

rotas.get('/turmas', (_req, res) => {
  const turmas = db
    .prepare(
      `SELECT t.*, p.nome AS professor, (SELECT COUNT(*) FROM turma_membros WHERE turma_id = t.id) AS membros
       FROM turmas t JOIN usuarios p ON p.id = t.professor_id ORDER BY t.id DESC`,
    )
    .all()
    .map((t) => ({ id: t.id, nome: t.nome, serieNome: SERIE_POR_ID[serieEmUso(t.serie)]?.nome, descricao: t.descricao, codigo: t.codigo, professor: t.professor, membros: t.membros, criadoEm: t.criado_em }));
  res.json({ turmas });
});

rotas.get('/mensagens', (_req, res) => {
  const mensagens = db
    .prepare(
      `SELECT m.id, m.texto, m.criado_em, d.nome AS de, d.id AS de_id, p.nome AS para
       FROM mensagens m JOIN usuarios d ON d.id = m.de_id JOIN usuarios p ON p.id = m.para_id
       ORDER BY m.id DESC LIMIT 150`,
    )
    .all();
  res.json({ mensagens });
});

rotas.get('/auditoria', (_req, res) => {
  res.json({ registros: ultimosRegistros(300) });
});

// ───────────── Feedbacks ─────────────

rotas.get('/feedbacks', (req, res) => {
  const filtros = ['1 = 1'];
  const params = [];
  if (['elogio', 'sugestao', 'problema'].includes(req.query.tipo)) {
    filtros.push('f.tipo = ?');
    params.push(req.query.tipo);
  }
  if (req.query.lido === '0' || req.query.lido === '1') {
    filtros.push('f.lido = ?');
    params.push(Number(req.query.lido));
  }
  const feedbacks = db
    .prepare(
      `SELECT f.id, f.tipo, f.nota, f.texto, f.pagina, f.lido, f.criado_em AS criadoEm,
              u.id AS usuarioId, u.nome, u.usuario, u.papel
       FROM feedbacks f JOIN usuarios u ON u.id = f.usuario_id
       WHERE ${filtros.join(' AND ')} ORDER BY f.id DESC LIMIT 300`,
    )
    .all(...params)
    .map((f) => ({ ...f, lido: !!f.lido }));
  const porNota = Object.fromEntries(db.prepare('SELECT nota, COUNT(*) AS n FROM feedbacks WHERE nota IS NOT NULL GROUP BY nota').all().map((r) => [r.nota, r.n]));
  const porTipo = Object.fromEntries(db.prepare('SELECT tipo, COUNT(*) AS n FROM feedbacks GROUP BY tipo').all().map((r) => [r.tipo, r.n]));
  const geral = db.prepare('SELECT COUNT(*) AS total, AVG(nota) AS media, SUM(lido = 0) AS novos FROM feedbacks').get();
  const atendimento = db.prepare('SELECT COUNT(avaliacao) AS total, AVG(avaliacao) AS media FROM chamados').get();
  res.json({
    feedbacks,
    resumo: {
      total: geral.total,
      novos: geral.novos ?? 0,
      media: geral.media == null ? null : Math.round(geral.media * 10) / 10,
      porNota: [1, 2, 3, 4, 5].map((nota) => ({ nota, total: porNota[nota] ?? 0 })),
      porTipo: { elogio: porTipo.elogio ?? 0, sugestao: porTipo.sugestao ?? 0, problema: porTipo.problema ?? 0 },
      // Nota que os usuários deram aos atendimentos do suporte.
      atendimento: { total: atendimento.total, media: atendimento.media == null ? null : Math.round(atendimento.media * 10) / 10 },
    },
  });
});

rotas.post('/feedbacks/lidos', (_req, res) => {
  db.prepare('UPDATE feedbacks SET lido = 1 WHERE lido = 0').run();
  res.json({ ok: true });
});

rotas.put('/feedbacks/:id', (req, res) => {
  db.prepare('UPDATE feedbacks SET lido = ? WHERE id = ?').run(req.body?.lido ? 1 : 0, Number(req.params.id));
  res.json({ ok: true });
});

rotas.delete('/feedbacks/:id', (req, res) => {
  db.prepare('DELETE FROM feedbacks WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

export default rotas;
