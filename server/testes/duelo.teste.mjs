// Teste de ponta a ponta do duelo entre dois alunos (com o servidor rodando):
//   node testes/duelo.teste.mjs <senha-das-contas-demo>
// Usa as contas de demonstração "bruno" e "carla" (amigos, mesma série).
import { io } from 'socket.io-client';

const BASE = process.env.EDUCAHUB_URL || 'http://localhost:3001';
const senha = process.argv[2];
if (!senha) {
  console.error('Informe a senha das contas de demonstração.');
  process.exit(1);
}

async function entrar(usuario) {
  const r = await fetch(`${BASE}/api/auth/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'educahub' },
    body: JSON.stringify({ usuario, senha, papel: 'aluno' }),
  });
  if (!r.ok) throw new Error(`Login de ${usuario} falhou: ${r.status}`);
  const cookie = r.headers.getSetCookie()[0].split(';')[0];
  const { usuario: dados } = await r.json();
  const socket = io(BASE, { extraHeaders: { cookie }, transports: ['websocket'] });
  await new Promise((ok, erro) => {
    socket.once('connect', ok);
    socket.once('connect_error', erro);
  });
  return { ...dados, cookie, socket };
}

const esperar = (socket, evento, ms = 25000) =>
  new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error(`Tempo esgotado esperando "${evento}"`)), ms);
    socket.once(evento, (dados) => {
      clearTimeout(t);
      ok(dados);
    });
  });

const bruno = await entrar('bruno');
const carla = await entrar('carla');
const verificar = (condicao, texto) => {
  if (!condicao) throw new Error(`FALHOU: ${texto}`);
  console.log(`ok — ${texto}`);
};

// Convite entre amigos
const conviteRecebido = esperar(carla.socket, 'duelo:convite');
bruno.socket.emit('duelo:convidar', { amigoId: carla.id, materia: 'matematica' });
const convite = await conviteRecebido;
verificar(convite.de.id === bruno.id && convite.materia === 'Matemática', 'Carla recebeu o convite de Bruno para Matemática');

const inicios = [esperar(bruno.socket, 'duelo:inicio'), esperar(carla.socket, 'duelo:inicio')];
carla.socket.emit('duelo:responderConvite', { conviteId: convite.conviteId, aceitar: true });
const [inicioB, inicioC] = await Promise.all(inicios);
verificar(inicioB.oponente.id === carla.id && inicioC.oponente.id === bruno.id, 'duelo começou para os dois');
verificar(inicioB.chatLivre === true, 'chat livre entre amigos');

// Chat (com filtro de palavrões)
const chegou = esperar(bruno.socket, 'duelo:chat');
carla.socket.emit('duelo:chat', { texto: 'boa sorte, seu idiota!' });
const mensagem = await chegou;
verificar(mensagem.de === carla.id && !mensagem.texto.includes('idiota'), `mensagem entregue e filtrada: "${mensagem.texto}"`);

// Cinco perguntas: Bruno responde sempre a alternativa 0, Carla não responde a primeira (tempo esgota) e depois responde 1.
let ultimoPlacar;
for (let i = 0; i < inicioB.total; i++) {
  const [p] = await Promise.all([esperar(bruno.socket, 'duelo:pergunta'), i === 0 ? null : null]);
  verificar(p.indice === i && p.alternativas.length === 4 && p.correta === undefined, `pergunta ${i + 1} chegou sem gabarito`);
  const resultado = esperar(bruno.socket, 'duelo:resultado');
  bruno.socket.emit('duelo:responder', { indice: i, resposta: 0 });
  if (i > 0) carla.socket.emit('duelo:responder', { indice: i, resposta: 1 });
  const r = await resultado;
  ultimoPlacar = r.placar;
  const linhaB = r.placar.find((l) => l.id === bruno.id);
  verificar(linhaB.acertou === (r.correta === 0), `resultado ${i + 1} coerente (correta: ${r.correta}, Bruno +${linhaB.ganho})`);
}

const [fimB, fimC] = await Promise.all([esperar(bruno.socket, 'duelo:fim'), esperar(carla.socket, 'duelo:fim')]);
const pontos = Object.fromEntries(ultimoPlacar.map((l) => [l.id, l.pontos]));
const esperado = pontos[bruno.id] === pontos[carla.id] ? 'empate' : pontos[bruno.id] > pontos[carla.id] ? 'vitoria' : 'derrota';
verificar(fimB.desfecho === esperado, `desfecho de Bruno: ${fimB.desfecho} (${pontos[bruno.id]} × ${pontos[carla.id]})`);
verificar(fimB.recompensa.xp > 0 && fimC.recompensa.xp > 0, `recompensas entregues (Bruno +${fimB.recompensa.xp} XP, Carla +${fimC.recompensa.xp} XP)`);

// Busca aleatória: os dois entram na fila da mesma série e são pareados.
const pareados = [esperar(bruno.socket, 'duelo:inicio'), esperar(carla.socket, 'duelo:inicio')];
bruno.socket.emit('duelo:buscar', { materia: null });
carla.socket.emit('duelo:buscar', { materia: null });
await Promise.all(pareados);
verificar(true, 'pareamento pela fila funcionou');

// Abandono: Carla sai antes da primeira pergunta e Bruno vence, mas sem recompensa
// (senão dois alunos combinados ganhariam XP e moedas em série, um desistindo para o outro).
const fimPorAbandono = esperar(bruno.socket, 'duelo:fim');
carla.socket.emit('duelo:sair');
const abandono = await fimPorAbandono;
verificar(abandono.abandono && abandono.desfecho === 'vitoria', 'vitória por abandono do oponente');
verificar(abandono.recompensa.xp === 0 && abandono.recompensa.moedas === 0 && abandono.sequencia === null, 'abandono antes da primeira pergunta não rende recompensa nem conta o dia');

// ── Queda de conexão ──
const parear = async () => {
  const inicios = [esperar(bruno.socket, 'duelo:inicio'), esperar(carla.socket, 'duelo:inicio')];
  bruno.socket.emit('duelo:buscar', { materia: null });
  carla.socket.emit('duelo:buscar', { materia: null });
  await Promise.all(inicios);
  return esperar(bruno.socket, 'duelo:pergunta'); // a primeira pergunta chega alguns segundos depois do início
};
const reconectar = () => {
  carla.socket = io(BASE, { extraHeaders: { cookie: carla.cookie }, transports: ['websocket'] });
  return carla.socket;
};

// Carla cai no meio da pergunta e volta: o duelo continua de onde estava.
await (await parear());
const ausente = esperar(bruno.socket, 'duelo:oponenteAusente');
carla.socket.close();
verificar((await ausente).segundos > 0, 'quando a conexão de Carla cai, Bruno é avisado e o duelo não acaba');
const voltou = esperar(bruno.socket, 'duelo:oponenteVoltou');
const retomada = await esperar(reconectar(), 'duelo:retomar');
verificar(
  retomada.info.oponente.id === bruno.id && retomada.pergunta?.indice === 0 && retomada.pergunta.decorridoMs > 0 && retomada.pergunta.correta === undefined,
  'ao voltar, Carla recebe o duelo na pergunta em andamento (sem o gabarito)',
);
await voltou;
verificar(true, 'Bruno é avisado de que ela voltou');
const resultadoDepois = esperar(carla.socket, 'duelo:resultado');
bruno.socket.emit('duelo:responder', { indice: 0, resposta: 0 });
carla.socket.emit('duelo:responder', { indice: 0, resposta: 1 });
verificar((await resultadoDepois).placar.length === 2, 'o duelo segue normalmente depois da volta');
const fimDoRetomado = esperar(bruno.socket, 'duelo:fim');
carla.socket.emit('duelo:sair');
await fimDoRetomado;

// Carla cai e não volta: depois do prazo de tolerância, conta como abandono.
await (await parear());
const fimPorAusencia = esperar(bruno.socket, 'duelo:fim', 45000);
const desde = Date.now();
carla.socket.close();
const ausencia = await fimPorAusencia;
verificar(ausencia.abandono && ausencia.desfecho === 'vitoria' && Date.now() - desde > 5000, `quem não volta dentro do prazo perde por abandono (${Math.round((Date.now() - desde) / 1000)} s depois)`);
verificar((await esperar(reconectar(), 'duelo:nenhum')) !== undefined, 'quem volta tarde demais é avisado de que não há mais duelo');

bruno.socket.close();
carla.socket.close();
console.log('\nTodos os testes de duelo passaram.');
