// Tempo real (Socket.IO): presença online, notificações e duelos 1 contra 1.
import crypto from 'node:crypto';
import { Server } from 'socket.io';
import { db, diaLocal } from './db.js';
import { usuarioDoCookie, resumoPublico } from './auth.js';
import { buscarUsuario, idsDosAmigos, idsDosProfessores, saoAmigos } from './consultas.js';
import { embaralhar, MATERIAS } from './conteudo/index.js';
import { questoesPublicas, registrarResposta as anotarNoAcervo } from './acervo.js';
import { concederGanho, registrarDiaAtivo, RECOMPENSA_DUELO } from './regras.js';
import { dentroDoLimite } from './limites.js';
import { filtrarTexto } from './moderacao.js';

let io = null;
const conexoes = new Map(); // usuarioId → quantidade de sockets abertos

export const estaOnline = (usuarioId) => conexoes.has(usuarioId);
export const totalOnline = () => conexoes.size;

export function enviarPara(usuarioId, evento, dados) {
  io?.to(`u:${usuarioId}`).emit(evento, dados);
}

/** Grava uma notificação e a entrega na hora se o usuário estiver conectado. */
export function notificar(usuarioId, { tipo, texto, link = null }) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO notificacoes (usuario_id, tipo, texto, link) VALUES (?, ?, ?, ?)')
    .run(usuarioId, tipo, texto, link);
  enviarPara(usuarioId, 'notificacao', { id: Number(lastInsertRowid), tipo, texto, link, lida: 0 });
}

function avisarPresenca(usuarioId, online) {
  for (const id of new Set([...idsDosAmigos(usuarioId), ...idsDosProfessores(usuarioId)])) {
    enviarPara(id, 'presenca', { usuarioId, online });
  }
}

// ───────────── Duelos ─────────────

const TOTAL_QUESTOES = 5;
const TEMPO_QUESTAO_S = 15;
const PAUSA_MS = 3800;
const EMOTES = ['ola', 'boa', 'uau', 'risos', 'pensando', 'gg'];
const BOT = {
  id: 0,
  nome: 'Mestre Bigodes',
  usuario: 'mestre.bigodes',
  nivel: 7,
  avatar: { pelagem: 'cinza', roupa: 'moletom-azul', cabeca: 'chapeu-mago', rosto: 'oculos-redondos', pescoco: null, costas: null, mao: 'varinha', fundo: 'espaco' },
  bot: true,
};
// A partir deste número de duelos no dia, as recompensas caem (evita ganhar XP e moedas em série).
const DUELOS_COM_RECOMPENSA_CHEIA = 12;
const FATOR_ALEM_DO_LIMITE = 0.25;

const duelos = new Map(); // id → duelo
const dueloDoUsuario = new Map(); // usuarioId → id do duelo
const fila = new Map(); // "serie|materia" → usuarioId aguardando oponente
const convites = new Map(); // id → { de, para, materia, timer }

function sortearQuestoes(serie, materia) {
  return embaralhar(questoesPublicas(serie, materia))
    .slice(0, TOTAL_QUESTOES)
    .map((q) => {
      const alternativas = embaralhar([q.correta, ...q.erradas]);
      return {
        id: q.id,
        enunciado: q.enunciado,
        alternativas,
        correta: alternativas.indexOf(q.correta),
        explicacao: q.explicacao,
        materia: MATERIAS[q.materia],
      };
    });
}

function sairDaFila(usuarioId) {
  for (const [chave, id] of fila) if (id === usuarioId) fila.delete(chave);
}

function emitirAoDuelo(duelo, evento, dados) {
  for (const j of duelo.jogadores) if (!j.bot) enviarPara(j.id, evento, dados);
}

function criarDuelo({ tipo, serie, materia, jogadores }) {
  const questoes = sortearQuestoes(serie, materia);
  if (questoes.length === 0) return null;
  const duelo = {
    id: crypto.randomUUID(),
    tipo,
    serie,
    materia,
    questoes,
    indice: -1,
    fase: 'inicio',
    timers: [],
    jogadores: jogadores.map((j) => ({ ...j, pontos: 0, acertos: 0, rodada: null })),
  };
  duelos.set(duelo.id, duelo);
  for (const j of duelo.jogadores) {
    if (j.bot) continue;
    sairDaFila(j.id);
    dueloDoUsuario.set(j.id, duelo.id);
  }
  for (const j of duelo.jogadores) {
    if (j.bot) continue;
    const oponente = duelo.jogadores.find((o) => o.id !== j.id);
    enviarPara(j.id, 'duelo:inicio', {
      id: duelo.id,
      tipo,
      materia: materia ? MATERIAS[materia] : 'Todas as matérias',
      total: questoes.length,
      tempo: TEMPO_QUESTAO_S,
      chatLivre: tipo === 'amigo',
      oponente: { id: oponente.id, nome: oponente.nome, usuario: oponente.usuario, nivel: oponente.nivel, avatar: oponente.avatar, bot: !!oponente.bot },
    });
  }
  agendar(duelo, () => proximaPergunta(duelo), 4200);
  return duelo;
}

function agendar(duelo, fn, ms) {
  const t = setTimeout(() => {
    try {
      fn();
    } catch (falha) {
      console.error('Erro em um duelo:', falha);
      cancelarDuelo(duelo);
    }
  }, ms);
  duelo.timers.push(t);
  return t;
}

/** Encerra um duelo que deu erro, sem placar nem recompensa. */
function cancelarDuelo(duelo) {
  duelos.delete(duelo.id);
  duelo.timers.forEach(clearTimeout);
  for (const j of duelo.jogadores) {
    if (j.bot) continue;
    dueloDoUsuario.delete(j.id);
    enviarPara(j.id, 'duelo:erro', { texto: 'O duelo foi interrompido por um erro. Tente de novo.' });
  }
}

function proximaPergunta(duelo) {
  if (!duelos.has(duelo.id)) return;
  duelo.indice += 1;
  if (duelo.indice >= duelo.questoes.length) return finalizar(duelo);
  duelo.fase = 'pergunta';
  duelo.inicioPergunta = Date.now();
  for (const j of duelo.jogadores) j.rodada = null;
  const q = duelo.questoes[duelo.indice];
  emitirAoDuelo(duelo, 'duelo:pergunta', {
    indice: duelo.indice,
    total: duelo.questoes.length,
    enunciado: q.enunciado,
    alternativas: q.alternativas,
    materia: q.materia,
    tempo: TEMPO_QUESTAO_S,
  });
  duelo.prazo = agendar(duelo, () => fecharPergunta(duelo), TEMPO_QUESTAO_S * 1000 + 800);

  const bot = duelo.jogadores.find((j) => j.bot);
  if (bot) {
    const indice = duelo.indice;
    agendar(duelo, () => {
      if (duelo.indice !== indice) return;
      const acerta = Math.random() < 0.62;
      const erradas = q.alternativas.map((_, i) => i).filter((i) => i !== q.correta);
      registrarResposta(duelo, bot, acerta ? q.correta : erradas[Math.floor(Math.random() * erradas.length)]);
    }, 3000 + Math.random() * 7000);
  }
}

function registrarResposta(duelo, jogador, resposta) {
  if (duelo.fase !== 'pergunta' || jogador.rodada) return;
  jogador.rodada = { resposta, ms: Date.now() - duelo.inicioPergunta };
  for (const o of duelo.jogadores) if (o !== jogador && !o.bot) enviarPara(o.id, 'duelo:oponenteRespondeu', {});
  if (duelo.jogadores.every((j) => j.rodada)) {
    clearTimeout(duelo.prazo);
    fecharPergunta(duelo);
  }
}

function fecharPergunta(duelo) {
  if (duelo.fase !== 'pergunta') return;
  duelo.fase = 'resultado';
  const q = duelo.questoes[duelo.indice];
  const placar = duelo.jogadores.map((j) => {
    const acertou = j.rodada?.resposta === q.correta;
    const restante = Math.max(0, TEMPO_QUESTAO_S * 1000 - (j.rodada?.ms ?? Infinity));
    const ganho = acertou ? 100 + Math.round((50 * restante) / (TEMPO_QUESTAO_S * 1000)) : 0;
    j.pontos += ganho;
    if (acertou) j.acertos += 1;
    if (!j.bot) anotarNoAcervo(j.id, q.id, acertou); // caderno de erros e dificuldades da turma
    return { id: j.id, resposta: j.rodada?.resposta ?? null, acertou, ganho, pontos: j.pontos };
  });
  emitirAoDuelo(duelo, 'duelo:resultado', { indice: duelo.indice, correta: q.correta, explicacao: q.explicacao, placar });
  agendar(duelo, () => proximaPergunta(duelo), PAUSA_MS);
}

function finalizar(duelo, abandonoDe = null) {
  if (!duelos.delete(duelo.id)) return;
  duelo.timers.forEach(clearTimeout);
  const [a, b] = duelo.jogadores;
  let vencedor = null;
  if (abandonoDe != null) vencedor = duelo.jogadores.find((j) => j.id !== abandonoDe);
  else if (a.pontos !== b.pontos) vencedor = a.pontos > b.pontos ? a : b;

  // Quanto do duelo aconteceu de fato. Quando alguém desiste, quem fica recebe na proporção das
  // perguntas disputadas: desistir logo no início não entrega uma vitória inteira ao outro jogador.
  const total = duelo.questoes.length;
  const rodadas = Math.min(total, duelo.fase === 'resultado' ? duelo.indice + 1 : Math.max(duelo.indice, 0));
  const jogado = abandonoDe == null ? 1 : rodadas / total;

  const humanos = duelo.jogadores.filter((j) => !j.bot);
  const duelosHoje = db.prepare('SELECT COUNT(*) AS n FROM duelos WHERE dia = ? AND (jogador1_id = ? OR jogador2_id = ?)');
  const jaJogados = Object.fromEntries(humanos.map((j) => [j.id, duelosHoje.get(diaLocal(), j.id, j.id).n]));

  // Um duelo abandonado antes da primeira pergunta não entra no histórico nem nas missões.
  if (rodadas > 0) {
    try {
      db.prepare(
        `INSERT INTO duelos (jogador1_id, jogador2_id, tipo, serie, materia, pontos1, pontos2, vencedor_id, dia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(a.id, b.bot ? null : b.id, duelo.tipo, duelo.serie, duelo.materia, a.pontos, b.pontos, vencedor && !vencedor.bot ? vencedor.id : null, diaLocal());
    } catch (falha) {
      // Acontece se a conta de um dos jogadores foi excluída durante o duelo.
      console.error('Não foi possível gravar o duelo:', falha.message);
    }
  }

  for (const j of humanos) {
    dueloDoUsuario.delete(j.id);
    const desfecho = !vencedor ? 'empate' : vencedor.id === j.id ? 'vitoria' : 'derrota';
    const base = RECOMPENSA_DUELO[desfecho];
    // Treino contra o bot rende metade; quem abandona não ganha nada; depois de muitos duelos no dia, rende menos.
    const fator =
      j.id === abandonoDe
        ? 0
        : (duelo.tipo === 'treino' ? 0.5 : 1) * jogado * (jaJogados[j.id] >= DUELOS_COM_RECOMPENSA_CHEIA ? FATOR_ALEM_DO_LIMITE : 1);
    const recompensa = { xp: Math.round(base.xp * fator), moedas: Math.round(base.moedas * fator) };
    const nivel = concederGanho(j.id, recompensa, 'duelo');
    const sequencia = j.id === abandonoDe || rodadas === 0 ? null : registrarDiaAtivo(j.id);
    enviarPara(j.id, 'duelo:fim', {
      desfecho,
      abandono: abandonoDe != null,
      placar: duelo.jogadores.map((p) => ({ id: p.id, pontos: p.pontos, acertos: p.acertos })),
      recompensa,
      subiuNivel: nivel.subiuNivel,
      nivel: nivel.nivel,
      sequencia,
    });
  }
}

function jogadorDe(usuario) {
  const r = resumoPublico(usuario);
  return { id: r.id, nome: r.nome, usuario: r.usuario, nivel: r.nivel, avatar: r.avatar };
}

function materiaValida(materia, serie) {
  if (!materia) return null;
  return questoesPublicas(serie, materia).length > 0 ? materia : null;
}

function registrarEventosDeDuelo(socket, usuarioId) {
  const erro = (texto) => socket.emit('duelo:erro', { texto });
  const alunoAtual = () => {
    const u = buscarUsuario(usuarioId);
    return u && u.papel === 'aluno' && u.status === 'ativo' && u.serie ? u : null;
  };
  const dueloAtual = () => duelos.get(dueloDoUsuario.get(usuarioId));

  /**
   * Registra um evento vindo do navegador. Tudo o que chega é tratado como não confiável:
   * os dados precisam ser um objeto, há um teto de frequência por usuário e um erro
   * no tratamento nunca derruba o servidor.
   */
  const ao = (evento, tratar, { max = 20, janelaMs = 10_000 } = {}) => {
    socket.on(evento, (dados) => {
      if (!dentroDoLimite(`ws|${evento}|${usuarioId}`, max, janelaMs)) return;
      try {
        tratar(dados !== null && typeof dados === 'object' && !Array.isArray(dados) ? dados : {});
      } catch (falha) {
        console.error(`Erro no evento ${evento}:`, falha);
        erro('Algo deu errado. Tente de novo.');
      }
    });
  };

  ao('duelo:buscar', ({ materia }) => {
    const u = alunoAtual();
    if (!u) return erro('Apenas alunos podem duelar.');
    if (dueloAtual()) return erro('Você já está em um duelo.');
    const mat = materiaValida(materia, u.serie);
    const chave = `${u.serie}|${mat ?? 'todas'}`;
    const esperando = fila.get(chave);
    if (esperando && esperando !== usuarioId && estaOnline(esperando)) {
      const oponente = buscarUsuario(esperando);
      fila.delete(chave);
      if (oponente) {
        const tipo = saoAmigos(usuarioId, esperando) ? 'amigo' : 'aleatorio';
        return void criarDuelo({ tipo, serie: u.serie, materia: mat, jogadores: [jogadorDe(oponente), jogadorDe(u)] });
      }
    }
    sairDaFila(usuarioId);
    fila.set(chave, usuarioId);
    socket.emit('duelo:buscando', {});
  }, { max: 10 });

  ao('duelo:cancelarBusca', () => sairDaFila(usuarioId));

  ao('duelo:treino', ({ materia }) => {
    const u = alunoAtual();
    if (!u) return erro('Apenas alunos podem duelar.');
    if (dueloAtual()) return erro('Você já está em um duelo.');
    const duelo = criarDuelo({ tipo: 'treino', serie: u.serie, materia: materiaValida(materia, u.serie), jogadores: [jogadorDe(u), { ...BOT }] });
    if (!duelo) erro('Ainda não há questões para o seu nível.');
  }, { max: 6 });

  ao('duelo:convidar', ({ amigoId, materia }) => {
    const u = alunoAtual();
    const amigo = buscarUsuario(Number(amigoId));
    if (!u || !amigo) return erro('Não foi possível enviar o convite.');
    if (!saoAmigos(usuarioId, amigo.id)) return erro('Vocês ainda não são amigos.');
    if (amigo.serie !== u.serie) return erro('Duelos são entre alunos do mesmo nível de ensino.');
    if (!estaOnline(amigo.id)) return erro(`${amigo.nome} não está online agora.`);
    if (dueloDoUsuario.has(amigo.id)) return erro(`${amigo.nome} já está em um duelo.`);
    if (dueloAtual()) return erro('Você já está em um duelo.');
    // Um convite por vez: ninguém enche a tela do amigo de convites.
    for (const c of convites.values()) if (c.de === usuarioId) return erro('Espere a resposta do convite que você já enviou.');
    const id = crypto.randomUUID();
    const mat = materiaValida(materia, u.serie);
    const timer = setTimeout(() => {
      if (convites.delete(id)) {
        socket.emit('duelo:conviteRecusado', { nome: amigo.nome, expirou: true });
        enviarPara(amigo.id, 'duelo:conviteCancelado', { conviteId: id });
      }
    }, 30000);
    convites.set(id, { de: usuarioId, para: amigo.id, materia: mat, timer });
    enviarPara(amigo.id, 'duelo:convite', {
      conviteId: id,
      de: jogadorDe(u),
      materia: mat ? MATERIAS[mat] : 'Todas as matérias',
    });
    socket.emit('duelo:conviteEnviado', { conviteId: id, nome: amigo.nome });
  }, { max: 6, janelaMs: 60_000 });

  ao('duelo:responderConvite', ({ conviteId, aceitar }) => {
    const convite = convites.get(conviteId);
    if (!convite || convite.para !== usuarioId) return;
    convites.delete(conviteId);
    clearTimeout(convite.timer);
    const eu = alunoAtual();
    const desafiante = buscarUsuario(convite.de);
    if (!aceitar || !eu || !desafiante) {
      return enviarPara(convite.de, 'duelo:conviteRecusado', { nome: eu?.nome ?? 'Seu amigo' });
    }
    if (!estaOnline(convite.de) || dueloDoUsuario.has(convite.de) || dueloAtual() || eu.serie !== desafiante.serie) {
      return erro('Este convite não está mais disponível.');
    }
    criarDuelo({ tipo: 'amigo', serie: eu.serie, materia: convite.materia, jogadores: [jogadorDe(desafiante), jogadorDe(eu)] });
  });

  ao('duelo:responder', ({ indice, resposta }) => {
    const duelo = dueloAtual();
    if (!duelo || duelo.indice !== indice || !Number.isInteger(resposta)) return;
    registrarResposta(duelo, duelo.jogadores.find((j) => j.id === usuarioId), resposta);
  });

  ao('duelo:chat', ({ texto }) => {
    const duelo = dueloAtual();
    if (!duelo || duelo.tipo !== 'amigo' || typeof texto !== 'string') return;
    const limpo = filtrarTexto(texto.trim().slice(0, 200));
    if (!limpo) return;
    const oponente = duelo.jogadores.find((j) => j.id !== usuarioId);
    db.prepare('INSERT INTO mensagens (duelo_ref, de_id, para_id, texto) VALUES (?, ?, ?, ?)').run(duelo.id, usuarioId, oponente.id, limpo);
    emitirAoDuelo(duelo, 'duelo:chat', { de: usuarioId, texto: limpo });
  }, { max: 8 });

  ao('duelo:emote', ({ emote }) => {
    const duelo = dueloAtual();
    if (duelo && EMOTES.includes(emote)) emitirAoDuelo(duelo, 'duelo:emote', { de: usuarioId, emote });
  }, { max: 10 });

  ao('duelo:sair', () => {
    const duelo = dueloAtual();
    if (duelo) finalizar(duelo, usuarioId);
  });
}

function aoDesconectar(usuarioId) {
  sairDaFila(usuarioId);
  for (const [id, convite] of convites) {
    if (convite.de !== usuarioId && convite.para !== usuarioId) continue;
    clearTimeout(convite.timer);
    convites.delete(id);
    if (convite.de === usuarioId) enviarPara(convite.para, 'duelo:conviteCancelado', { conviteId: id });
  }
  const duelo = duelos.get(dueloDoUsuario.get(usuarioId));
  if (duelo) finalizar(duelo, usuarioId);
}

export function iniciarTempoReal(servidorHttp) {
  io = new Server(servidorHttp, {
    serveClient: false,
    maxHttpBufferSize: 20_000, // os eventos são pequenos; mensagens gigantes são recusadas
    // Só páginas servidas por este mesmo endereço abrem a conexão: um site de terceiros não usa a sessão do aluno.
    allowRequest: (req, decidir) => {
      const origem = req.headers.origin;
      let mesmoSite = !origem;
      try {
        mesmoSite ||= new URL(origem).host === req.headers.host;
      } catch {
        mesmoSite = false;
      }
      decidir(null, mesmoSite);
    },
  });

  io.use((socket, proximo) => {
    const usuario = usuarioDoCookie(socket.handshake.headers.cookie);
    if (!usuario || usuario.status === 'bloqueado') return proximo(new Error('nao-autenticado'));
    socket.data.usuarioId = usuario.id;
    proximo();
  });

  io.on('connection', (socket) => {
    const { usuarioId } = socket.data;
    socket.join(`u:${usuarioId}`);
    const abertos = (conexoes.get(usuarioId) ?? 0) + 1;
    conexoes.set(usuarioId, abertos);
    if (abertos === 1) avisarPresenca(usuarioId, true);

    registrarEventosDeDuelo(socket, usuarioId);

    socket.on('disconnect', () => {
      const restantes = (conexoes.get(usuarioId) ?? 1) - 1;
      if (restantes > 0) return void conexoes.set(usuarioId, restantes);
      conexoes.delete(usuarioId);
      try {
        db.prepare("UPDATE usuarios SET visto_em = datetime('now') WHERE id = ?").run(usuarioId);
        avisarPresenca(usuarioId, false);
        aoDesconectar(usuarioId);
      } catch (falha) {
        console.error('Erro ao encerrar a conexão de um usuário:', falha);
      }
    });
  });
}

/** Derruba as conexões de um usuário (conta bloqueada ou senha redefinida). */
export function desconectarUsuario(usuarioId) {
  io?.in(`u:${usuarioId}`).disconnectSockets(true);
}
