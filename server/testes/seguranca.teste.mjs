// Testes de segurança de ponta a ponta (com o servidor rodando e as contas de demonstração criadas):
//   node testes/seguranca.teste.mjs <senha-das-contas-demo> [senha-do-admin]
// Cada bloco tenta de novo um ataque que já funcionou e confere que agora ele é recusado.
import crypto from 'node:crypto';
import { BASE, lerSenhas, verificar, entrar, clienteDe, conectar, pausa } from './apoio.mjs';

const senhas = lerSenhas();
const diego = await entrar('diego', senhas.demo);
const heitor = await entrar('heitor', senhas.demo);
const anonimo = clienteDe(null);

// ───────── Cabeçalhos e proteção contra requisições de outros sites ─────────
{
  const r = await anonimo.get('/catalogo');
  verificar(r.cabecalhos.get('content-security-policy')?.includes("frame-ancestors 'none'"), 'política de conteúdo (CSP) presente');
  verificar(r.cabecalhos.get('x-frame-options') === 'DENY' && r.cabecalhos.get('x-content-type-options') === 'nosniff', 'cabeçalhos contra clickjacking e troca de tipo');
  verificar(!r.cabecalhos.get('x-powered-by'), 'o servidor não anuncia a tecnologia usada');
  const semCabecalho = await diego.chamar('POST', '/notificacoes/lidas', {}, {});
  verificar(semCabecalho.status === 403, 'escrita sem o cabeçalho da plataforma é recusada (CSRF)');
}

// ───────── Jogos: índice e resposta validados, nada de terminar sem jogar ─────────
{
  const partida = (await diego.post('/jogos/iniciar', { topicoId: 'F6.matematica.1', modo: 'quiz' })).dados;
  const poluir = await diego.post(`/jogos/${partida.partida}/responder`, { indice: '__proto__', resposta: { gabarito: 'POLUIDO' } });
  verificar(poluir.status === 400, 'índice "__proto__" recusado (poluição de protótipo)');
  const outra = (await heitor.post('/jogos/iniciar', { topicoId: 'F6.matematica.1', modo: 'quiz' })).dados;
  const leitura = await heitor.post(`/jogos/${outra.partida}/responder`, { indice: 'resposta', resposta: 0 });
  verificar(leitura.status === 400 && leitura.dados.gabarito === undefined, 'nenhum valor vazou para outro usuário');
  for (const [indice, resposta] of [[99, 0], [-1, 0], [1.5, 0], [0, 'a'], [0, 9], [0, {}]]) {
    const r = await diego.post(`/jogos/${partida.partida}/responder`, { indice, resposta });
    if (r.status !== 400) throw new Error(`FALHOU: índice ${indice} / resposta ${JSON.stringify(resposta)} deveria ser recusado`);
  }
  verificar(true, 'índices fora da lista e respostas de tipo errado são recusados');
  const alheia = await heitor.post(`/jogos/${partida.partida}/responder`, { indice: 0, resposta: 0 });
  verificar(alheia.status === 400, 'ninguém responde a partida de outra pessoa');

  const antes = (await heitor.get('/missoes')).dados.missoes.find((m) => m.chave === 'd-atividades').progresso;
  const vazia = (await heitor.post('/jogos/iniciar', { topicoId: 'F6.matematica.2', modo: 'vf' })).dados;
  const fim = await heitor.post(`/jogos/${vazia.partida}/finalizar`);
  const depois = (await heitor.get('/missoes')).dados.missoes.find((m) => m.chave === 'd-atividades').progresso;
  verificar(fim.status === 400 && depois === antes, 'terminar sem responder é recusado e não conta para as missões');

  // Tudo respondido com "tempo esgotado": termina, mas sem acertos não conta para missões nem sequência.
  for (let i = 0; i < vazia.itens.length; i++) await heitor.post(`/jogos/${vazia.partida}/responder`, { indice: i, resposta: null });
  const semAcertos = await heitor.post(`/jogos/${vazia.partida}/finalizar`);
  const aindaIgual = (await heitor.get('/missoes')).dados.missoes.find((m) => m.chave === 'd-atividades').progresso;
  verificar(semAcertos.status === 200 && semAcertos.dados.xp === 0 && semAcertos.dados.sequencia === null && aindaIgual === antes, 'atividade sem nenhum acerto não rende pontos, sequência nem missão');
}

// ───────── Tempo real: dados malformados não derrubam o servidor ─────────
{
  const socket = await conectar(diego.cookie);
  const eventos = ['duelo:buscar', 'duelo:treino', 'duelo:convidar', 'duelo:responderConvite', 'duelo:responder', 'duelo:chat', 'duelo:emote', 'duelo:cancelarBusca', 'duelo:sair'];
  for (const evento of eventos) for (const dados of [null, 'texto', 42, [], [null], { amigoId: {} }, { texto: { a: 1 } }]) socket.emit(evento, dados);
  socket.emit('duelo:cancelarBusca');
  await pausa(1200);
  const vivo = await anonimo.get('/catalogo').then((r) => r.status, () => 0);
  verificar(vivo === 200, 'eventos com dados nulos ou malformados não derrubam o servidor');
  socket.close();

  const deFora = await fetch(`${BASE}/socket.io/?EIO=4&transport=polling`, { headers: { Cookie: diego.cookie, Origin: 'https://site-malicioso.example' } });
  verificar(deFora.status === 403, 'conexão em tempo real vinda de outro site é recusada');
}

// ───────── Cadastro: nomes reservados e limites de login ─────────
{
  const base = { senha: crypto.randomBytes(9).toString('base64url'), papel: 'aluno', serie: 'F6' };
  const reservado = await anonimo.post('/auth/cadastro', { ...base, usuario: 'admin.suporte', nome: 'Fulano de Tal' });
  verificar(reservado.status === 400, 'nome de usuário "admin.suporte" é reservado');
  const impostor = await anonimo.post('/auth/cadastro', { ...base, usuario: `t${crypto.randomBytes(4).toString('hex')}`, nome: 'Suporte EducaHub' });
  verificar(impostor.status === 400, 'ninguém se cadastra com o nome "Suporte EducaHub"');
  const nascimento = await anonimo.post('/auth/cadastro', { ...base, usuario: `t${crypto.randomBytes(4).toString('hex')}`, nome: 'Fulano de Tal', nascimento: '2015-02-31' });
  verificar(nascimento.status === 400, 'data de nascimento que não existe é recusada');

  const fantasma = `fantasma.${crypto.randomBytes(3).toString('hex')}`;
  let ultima;
  for (let i = 0; i < 9; i++) ultima = await anonimo.post('/auth/entrar', { usuario: fantasma, senha: 'senha-errada' });
  verificar(ultima.status === 429, 'depois de 8 senhas erradas o login é bloqueado por alguns minutos');
}

// ───────── Acesso: cada papel só alcança o que é seu ─────────
{
  for (const caminho of ['/admin/usuarios', '/admin/auditoria', '/admin/feedbacks', '/prof/turmas', '/suporte/atendimento']) {
    const r = await diego.get(caminho);
    if (r.status !== 403) throw new Error(`FALHOU: aluno alcançou ${caminho} (${r.status})`);
  }
  verificar(true, 'aluno não alcança as áreas de professor, administrador e atendimento');
  for (const caminho of ['/eu', '/suporte/chamados', '/suporte/resumo', '/notificacoes']) {
    const r = await anonimo.get(caminho);
    if (r.status !== 401) throw new Error(`FALHOU: ${caminho} respondeu ${r.status} sem login`);
  }
  verificar(true, 'sem login, nenhuma rota pessoal responde');
}

// ───────── Com a senha do administrador: sessões e privacidade ─────────
if (senhas.admin) {
  const admin = await entrar('admin', senhas.admin);
  const oculto = await diego.get(`/usuarios/${admin.id}`);
  verificar(oculto.status === 404, 'o perfil do administrador não aparece para alunos');

  // Conta temporária: trocar a senha encerra a sessão aberta em outro aparelho.
  const usuario = `teste.${crypto.randomBytes(4).toString('hex')}`;
  const senha = crypto.randomBytes(9).toString('base64url');
  const cadastro = await anonimo.post('/auth/cadastro', { usuario, senha, nome: 'Conta de Teste', papel: 'aluno', serie: 'F6' });
  verificar(cadastro.status === 201, 'conta temporária criada');
  try {
    const aparelho1 = await entrar(usuario, senha);
    const aparelho2 = await entrar(usuario, senha);
    const novaSenha = crypto.randomBytes(9).toString('base64url');
    const troca = await aparelho1.put('/eu/senha', { atual: senha, nova: novaSenha });
    verificar(troca.status === 200, 'senha trocada no primeiro aparelho');
    verificar((await aparelho2.get('/eu')).status === 401, 'a sessão do outro aparelho foi encerrada');
    verificar((await aparelho1.get('/eu')).status === 200, 'a sessão de quem trocou a senha continua valendo');

    const registros = (await admin.get('/admin/auditoria')).dados.registros;
    verificar(registros.some((r) => r.acao === 'senha.alterada' && r.usuarioId === cadastro.dados.usuario.id), 'a troca de senha ficou no registro de auditoria');
    verificar(registros.some((r) => r.acao === 'login.falha'), 'tentativas de login erradas ficam no registro de auditoria');
  } finally {
    await admin.apagar(`/admin/usuarios/${cadastro.dados.usuario.id}`);
  }
  verificar((await admin.get(`/usuarios/${cadastro.dados.usuario.id}`)).status === 404, 'conta temporária excluída');
} else {
  console.log('(sem a senha do administrador: testes de sessão e auditoria pulados)');
}

console.log('\nTodos os testes de segurança passaram.');
