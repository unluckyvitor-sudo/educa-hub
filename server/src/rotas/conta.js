// Cadastro, login e perfil do próprio usuário.
import { Router } from 'express';
import { db } from '../db.js';
import {
  gerarHash, conferirSenha, conferirLogin, criarSessao, encerrarSessao, encerrarOutrasSessoes, exigirLogin, perfilProprio, resumoPublico, avatarDe,
  loginBloqueado, registrarFalhaLogin, limparFalhasLogin, texto, ErroDeEntrada,
} from '../auth.js';
import { serieValida, SERIE_POR_ID } from '../conteudo/index.js';
import { ITEM_POR_ID, TIPOS_ITEM, TIPOS_OPCIONAIS } from '../loja.js';
import { buscarUsuario, saoAmigos, colegasDeTurma, estatisticasDoAluno, professorDoAluno } from '../consultas.js';
import { estaOnline } from '../tempoReal.js';
import { limitar, dentroDoLimite, MINUTO, HORA } from '../limites.js';
import { registrar } from '../registro.js';
import { filtrarTexto, temPalavraBloqueada, usuarioReservado, nomeReservado } from '../moderacao.js';
import { lerAceite, sobreAInstalacao, VERSAO_DOS_TERMOS } from '../termos.js';

const rotas = Router();
const MOEDAS_INICIAIS = 50;
const USUARIO_VALIDO = /^[a-z0-9._@-]{3,40}$/;

/**
 * Deixa o nome de usuário em um formato único: minúsculas, sem acentos e com pontos no lugar dos espaços.
 * Assim "João Vítor" e "joao.vitor" são o mesmo usuário, tanto no cadastro quanto no login.
 */
function normalizarUsuario(valor) {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.');
}

function lerUsuario(valor) {
  const usuario = normalizarUsuario(valor);
  if (usuario.length < 3) throw new ErroDeEntrada('O nome de usuário precisa ter pelo menos 3 caracteres.');
  if (usuario.length > 40) throw new ErroDeEntrada('O nome de usuário pode ter no máximo 40 caracteres.');
  if (!USUARIO_VALIDO.test(usuario)) {
    const proibidos = [...new Set(usuario.replace(/[a-z0-9._@-]/g, ''))].join(' ');
    throw new ErroDeEntrada(`O nome de usuário não pode ter estes caracteres: ${proibidos}  Use letras, números, ponto, hífen ou sublinhado.`);
  }
  if (usuarioReservado(usuario)) throw new ErroDeEntrada('Este nome de usuário é reservado para a equipe da plataforma. Escolha outro.');
  return usuario;
}

function lerNascimento(valor) {
  const data = texto(valor, 'Data de nascimento', { max: 10, opcional: true });
  if (!data) return null;
  const d = new Date(`${data}T00:00:00Z`);
  // A data precisa existir de verdade (nada de 31 de fevereiro) e não pode estar no futuro.
  const existe = /^\d{4}-\d{2}-\d{2}$/.test(data) && !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
  if (!existe || d.getUTCFullYear() < 1900 || d > new Date()) throw new ErroDeEntrada('Data de nascimento inválida.');
  return data;
}

function lerSenha(valor) {
  if (typeof valor !== 'string' || valor.length < 6 || valor.length > 72) {
    throw new ErroDeEntrada('A senha deve ter de 6 a 72 caracteres.');
  }
  return valor;
}

function lerDadosDePerfil(corpo, papel) {
  const dados = {
    nome: texto(corpo.nome, 'Nome', { min: 2, max: 60 }),
    email: texto(corpo.email, 'E-mail', { max: 120, opcional: true }),
    instituicao: texto(corpo.instituicao, 'Instituição', { max: 100, opcional: true }),
    bio: texto(corpo.bio, 'Sobre mim', { max: 300, opcional: true }),
    nascimento: lerNascimento(corpo.nascimento),
    curso: texto(corpo.curso, 'Curso', { max: 80, opcional: true }),
    disciplinas: texto(corpo.disciplinas, 'Disciplinas', { max: 200, opcional: true }),
    formacao: texto(corpo.formacao, 'Formação', { max: 200, opcional: true }),
    serie: null,
  };
  if (dados.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) throw new ErroDeEntrada('E-mail inválido.');
  // O nome aparece para todo mundo (rankings, duelos): sem palavrões e sem se passar pela equipe.
  if (temPalavraBloqueada(dados.nome)) throw new ErroDeEntrada('Escolha um nome sem palavras ofensivas.');
  if (papel !== 'admin' && nomeReservado(dados.nome)) throw new ErroDeEntrada('Este nome é reservado para a equipe da plataforma. Use o seu nome.');
  if (dados.bio) dados.bio = filtrarTexto(dados.bio);
  if (papel === 'aluno') {
    if (!serieValida(corpo.serie)) throw new ErroDeEntrada('Escolha o seu nível de ensino.');
    dados.serie = corpo.serie;
  }
  return dados;
}

rotas.post('/auth/cadastro', limitar('cadastro', 120, HORA, 'Muitos cadastros a partir desta rede. Tente de novo mais tarde.'), async (req, res) => {
  const corpo = req.body ?? {};
  const papel = corpo.papel === 'professor' ? 'professor' : 'aluno';
  const usuario = lerUsuario(corpo.usuario);
  const senha = lerSenha(corpo.senha);
  const d = lerDadosDePerfil(corpo, papel);
  const responsavel = lerAceite(corpo, { papel, nascimento: d.nascimento });

  if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(usuario)) {
    return res.status(409).json({ erro: 'Este nome de usuário já está em uso.' });
  }
  const agora = new Date().toISOString();
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO usuarios (papel, status, nome, usuario, email, senha_hash, serie, curso, instituicao, nascimento, bio, disciplinas, formacao, moedas,
         termos_versao, termos_em, responsavel, consentimento_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      papel, papel === 'professor' ? 'pendente' : 'ativo', d.nome, usuario, d.email, await gerarHash(senha),
      d.serie, d.curso, d.instituicao, d.nascimento, d.bio, d.disciplinas, d.formacao, papel === 'aluno' ? MOEDAS_INICIAIS : 0,
      VERSAO_DOS_TERMOS, agora, responsavel, responsavel ? agora : null,
    );
  registrar('conta.criada', { usuarioId: Number(lastInsertRowid), ip: req.ip, detalhe: papel });
  criarSessao(req, res, Number(lastInsertRowid));
  res.status(201).json({ usuario: perfilProprio(buscarUsuario(Number(lastInsertRowid))) });
});

rotas.post('/auth/entrar', async (req, res) => {
  const corpo = req.body ?? {};
  const usuario = normalizarUsuario(corpo.usuario).slice(0, 60);
  if (loginBloqueado(req.ip, usuario)) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
  }
  const conta = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);
  if (!(await conferirLogin(conta, corpo.senha))) {
    registrarFalhaLogin(req.ip, usuario);
    // O registro também tem teto, para um ataque não encher o banco.
    if (dentroDoLimite(`registro-login|${req.ip}`, 30, 10 * MINUTO)) {
      registrar('login.falha', { alvoId: conta?.id ?? null, ip: req.ip, detalhe: usuario });
    }
    return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
  }
  if (conta.status === 'bloqueado') return res.status(403).json({ erro: 'Esta conta está bloqueada. Fale com o administrador.' });
  if (conta.papel !== 'admin' && corpo.papel && corpo.papel !== conta.papel) {
    const certo = conta.papel === 'professor' ? 'Professor' : 'Aluno';
    return res.status(403).json({ erro: `Esta conta é de ${certo.toLowerCase()}. Entre pela opção "${certo}".` });
  }
  limparFalhasLogin(req.ip, usuario);
  registrar('login.ok', { usuarioId: conta.id, ip: req.ip });
  criarSessao(req, res, conta.id);
  res.json({ usuario: perfilProprio(conta) });
});

rotas.post('/auth/sair', (req, res) => {
  encerrarSessao(req, res);
  res.json({ ok: true });
});

rotas.get('/eu', exigirLogin, (req, res) => {
  res.json({ usuario: perfilProprio(req.usuario) });
});

// Quem responde por esta instalação e a versão dos termos (público: as páginas de termos abrem sem login).
rotas.get('/sobre', (_req, res) => res.json(sobreAInstalacao()));

// Aceite dos termos por contas que já existiam (ou depois de uma nova versão dos textos).
rotas.post('/eu/termos', exigirLogin, limitar('termos', 20, HORA), (req, res) => {
  const corpo = req.body ?? {};
  const u = req.usuario;
  const nascimento = u.papel === 'aluno' ? (u.nascimento ?? lerNascimento(corpo.nascimento)) : u.nascimento;
  const responsavel = lerAceite(corpo, { papel: u.papel, nascimento });
  const agora = new Date().toISOString();
  db.prepare('UPDATE usuarios SET termos_versao = ?, termos_em = ?, nascimento = ?, responsavel = ?, consentimento_em = ? WHERE id = ?').run(
    VERSAO_DOS_TERMOS, agora, nascimento, responsavel ?? u.responsavel ?? null, responsavel ? agora : (u.consentimento_em ?? null), u.id,
  );
  registrar('conta.termos', { usuarioId: u.id, ip: req.ip, detalhe: VERSAO_DOS_TERMOS });
  res.json({ usuario: perfilProprio(buscarUsuario(u.id)) });
});

rotas.put('/eu', exigirLogin, (req, res) => {
  const d = lerDadosDePerfil(req.body ?? {}, req.usuario.papel);
  if (req.usuario.papel === 'aluno' && d.serie !== req.usuario.serie) {
    // As turmas reúnem só alunos do mesmo nível: quem muda de nível sai antes das turmas do nível antigo.
    const turma = db
      .prepare('SELECT t.nome FROM turma_membros tm JOIN turmas t ON t.id = tm.turma_id WHERE tm.aluno_id = ? AND t.serie != ? LIMIT 1')
      .get(req.usuario.id, d.serie);
    if (turma) {
      return res.status(400).json({ erro: `Você participa da turma "${turma.nome}", que é de outro nível. Saia dela em "Minhas turmas" antes de mudar de nível.` });
    }
  }
  // A data de nascimento do aluno define se é preciso a autorização do responsável: depois de informada, não fica em branco.
  if (req.usuario.papel === 'aluno' && req.usuario.nascimento && !d.nascimento) d.nascimento = req.usuario.nascimento;
  db.prepare(
    `UPDATE usuarios SET nome = ?, email = ?, instituicao = ?, bio = ?, nascimento = ?, curso = ?, disciplinas = ?, formacao = ?, serie = ?
     WHERE id = ?`,
  ).run(d.nome, d.email, d.instituicao, d.bio, d.nascimento, d.curso, d.disciplinas, d.formacao, d.serie, req.usuario.id);
  res.json({ usuario: perfilProprio(buscarUsuario(req.usuario.id)) });
});

rotas.put('/eu/senha', exigirLogin, limitar('senha', 6, 10 * MINUTO), async (req, res) => {
  const { atual, nova } = req.body ?? {};
  if (typeof atual !== 'string' || !(await conferirSenha(atual, req.usuario.senha_hash))) {
    return res.status(400).json({ erro: 'A senha atual está incorreta.' });
  }
  db.prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?').run(await gerarHash(lerSenha(nova)), req.usuario.id);
  // Quem estiver com a conta aberta em outro aparelho (inclusive um invasor) precisa entrar de novo.
  encerrarOutrasSessoes(req, req.usuario.id);
  registrar('senha.alterada', { usuarioId: req.usuario.id, ip: req.ip });
  res.json({ ok: true });
});

rotas.put('/eu/avatar', exigirLogin, (req, res) => {
  const pedido = req.body?.avatar ?? {};
  const possui = new Set(
    db.prepare('SELECT item_id FROM inventario WHERE usuario_id = ?').all(req.usuario.id).map((r) => r.item_id),
  );
  const avatar = {};
  for (const tipo of TIPOS_ITEM) {
    const id = pedido[tipo] ?? null;
    if (id === null) {
      if (!TIPOS_OPCIONAIS.includes(tipo)) throw new ErroDeEntrada('Avatar incompleto.');
      avatar[tipo] = null;
      continue;
    }
    const item = ITEM_POR_ID[id];
    if (!item || item.tipo !== tipo) throw new ErroDeEntrada('Item de avatar inválido.');
    if (!item.padrao && !possui.has(id)) return res.status(403).json({ erro: `Você ainda não tem o item "${item.nome}".` });
    avatar[tipo] = id;
  }
  db.prepare('UPDATE usuarios SET avatar_json = ? WHERE id = ?').run(JSON.stringify(avatar), req.usuario.id);
  res.json({ avatar });
});

rotas.get('/usuarios/buscar', exigirLogin, (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase();
  if (q.length < 2) return res.json({ usuarios: [] });
  const termo = `%${q.replace(/[%_]/g, '')}%`;
  const usuarios = db
    .prepare(
      `SELECT * FROM usuarios WHERE papel = 'aluno' AND status = 'ativo' AND id != ?
       AND (usuario LIKE ? OR lower(nome) LIKE ?) ORDER BY xp DESC LIMIT 12`,
    )
    .all(req.usuario.id, termo, termo)
    .map(resumoPublico);
  res.json({ usuarios });
});

rotas.get('/usuarios/:id', exigirLogin, (req, res) => {
  const alvo = buscarUsuario(Number(req.params.id));
  const eu = req.usuario;
  const proprio = alvo?.id === eu.id;
  // Contas de administrador só aparecem para administradores.
  if (!alvo || alvo.status === 'bloqueado' || (alvo.papel === 'admin' && eu.papel !== 'admin' && !proprio)) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  const amizade = db
    .prepare('SELECT * FROM amizades WHERE (de_id = ? AND para_id = ?) OR (de_id = ? AND para_id = ?)')
    .get(eu.id, alvo.id, alvo.id, eu.id);
  // Dados de contato só para o próprio usuário, administradores e professores do aluno.
  const verContato = proprio || eu.papel === 'admin' || (eu.papel === 'professor' && professorDoAluno(eu.id, alvo.id));
  // Escola e curso de um aluno só aparecem para quem convive com ele: amigos, colegas de turma e professores.
  const verEscola = verContato || alvo.papel !== 'aluno' || saoAmigos(eu.id, alvo.id) || colegasDeTurma(eu.id, alvo.id);
  res.json({
    perfil: {
      ...resumoPublico(alvo),
      etapa: SERIE_POR_ID[alvo.serie]?.etapa ?? null,
      instituicao: verEscola ? alvo.instituicao : null,
      curso: verEscola ? alvo.curso : null,
      bio: alvo.bio,
      disciplinas: alvo.disciplinas,
      formacao: alvo.formacao,
      maiorSequencia: alvo.maior_sequencia,
      criadoEm: alvo.criado_em,
      email: verContato ? alvo.email : undefined,
      nascimento: verContato ? alvo.nascimento : undefined,
      online: estaOnline(alvo.id),
      estatisticas: alvo.papel === 'aluno' ? estatisticasDoAluno(alvo.id) : null,
      amizade: proprio ? 'eu' : !amizade ? 'nenhuma' : amizade.status === 'aceita' ? 'amigos' : amizade.de_id === eu.id ? 'enviado' : 'recebido',
      avatar: avatarDe(alvo),
      mesmoNivel: saoAmigos(eu.id, alvo.id) && alvo.serie === eu.serie,
    },
  });
});

export default rotas;
