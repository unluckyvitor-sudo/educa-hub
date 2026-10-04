// Conexão em tempo real (Socket.IO): notificações, presença e o estado do duelo em andamento.
import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import { useEstado, avisar } from './estado';
import type { AvatarConfig } from './gato/modelo';
import type { Notificacao, ResultadoSequencia } from './tipos';

export interface Oponente {
  id: number;
  nome: string;
  usuario: string;
  nivel: number;
  avatar: AvatarConfig;
  bot?: boolean;
}

export interface PerguntaDuelo {
  indice: number;
  total: number;
  enunciado: string;
  alternativas: string[];
  materia: string;
  tempo: number;
  recebidaEm: number;
}

interface LinhaPlacar {
  id: number;
  resposta: number | null;
  acertou: boolean;
  ganho: number;
  pontos: number;
}

export interface FimDuelo {
  desfecho: 'vitoria' | 'empate' | 'derrota';
  abandono: boolean;
  placar: { id: number; pontos: number; acertos: number }[];
  recompensa: { xp: number; moedas: number };
  subiuNivel: boolean;
  nivel: number;
  sequencia: ResultadoSequencia | null;
}

interface EstadoDuelo {
  fase: 'ocioso' | 'buscando' | 'convidando' | 'inicio' | 'pergunta' | 'resultado' | 'fim';
  convite: { conviteId: string; de: Oponente; materia: string } | null;
  info: { id: string; tipo: string; materia: string; total: number; tempo: number; chatLivre: boolean; oponente: Oponente } | null;
  pergunta: PerguntaDuelo | null;
  minhaResposta: number | null;
  oponenteRespondeu: boolean;
  resultado: { indice: number; correta: number; explicacao: string | null; placar: LinhaPlacar[] } | null;
  pontos: Record<number, number>;
  fim: FimDuelo | null;
  mensagens: { de: number; texto: string }[];
  emote: { de: number; emote: string; n: number } | null;
  aguardando: string | null;

  buscar: (materia: string | null) => void;
  treinar: (materia: string | null) => void;
  convidar: (amigoId: number, materia: string | null) => void;
  cancelarBusca: () => void;
  responderConvite: (aceitar: boolean) => void;
  responder: (alternativa: number) => void;
  enviarMensagem: (texto: string) => void;
  enviarEmote: (emote: string) => void;
  desistir: () => void;
  encerrar: () => void;
}

let socket: Socket | null = null;
const emitir = (evento: string, dados: unknown = {}) => socket?.emit(evento, dados);

const INICIAL = {
  fase: 'ocioso' as const,
  info: null,
  pergunta: null,
  minhaResposta: null,
  oponenteRespondeu: false,
  resultado: null,
  pontos: {},
  fim: null,
  mensagens: [],
  emote: null,
  aguardando: null,
};

export const useDuelo = create<EstadoDuelo>((set, get) => ({
  ...INICIAL,
  convite: null,

  buscar(materia) {
    set({ ...INICIAL, fase: 'buscando' });
    emitir('duelo:buscar', { materia });
  },
  treinar(materia) {
    emitir('duelo:cancelarBusca');
    set({ ...INICIAL, fase: 'buscando' });
    emitir('duelo:treino', { materia });
  },
  convidar(amigoId, materia) {
    set({ ...INICIAL, fase: 'convidando' });
    emitir('duelo:convidar', { amigoId, materia });
  },
  cancelarBusca() {
    emitir('duelo:cancelarBusca');
    set({ ...INICIAL });
  },
  responderConvite(aceitar) {
    const convite = get().convite;
    if (!convite) return;
    emitir('duelo:responderConvite', { conviteId: convite.conviteId, aceitar });
    set({ convite: null });
  },
  responder(alternativa) {
    const { pergunta, minhaResposta, fase } = get();
    if (!pergunta || minhaResposta !== null || fase !== 'pergunta') return;
    set({ minhaResposta: alternativa });
    emitir('duelo:responder', { indice: pergunta.indice, resposta: alternativa });
  },
  enviarMensagem: (texto) => emitir('duelo:chat', { texto }),
  enviarEmote: (emote) => emitir('duelo:emote', { emote }),
  desistir: () => emitir('duelo:sair'),
  encerrar: () => set({ ...INICIAL }),
}));

/** Avisa componentes interessados (listas de amigos, turmas) que alguém entrou ou saiu. */
export const EVENTO_PRESENCA = 'educahub:presenca';
/** Avisa as telas de suporte que um chamado mudou (mensagem nova, situação) ou que chegou um feedback. */
export const EVENTO_SUPORTE = 'educahub:suporte';

export function conectarTempoReal() {
  if (socket) return;
  socket = io({ transports: ['websocket', 'polling'] });
  const duelo = useDuelo;

  socket.on('notificacao', (n: Notificacao) => useEstado.getState().receberNotificacao(n));
  socket.on('presenca', (dados: { usuarioId: number; online: boolean }) => {
    window.dispatchEvent(new CustomEvent(EVENTO_PRESENCA, { detail: dados }));
  });

  socket.on('suporte:atualizado', (dados: { chamadoId?: number; feedback?: boolean }) => {
    window.dispatchEvent(new CustomEvent(EVENTO_SUPORTE, { detail: dados }));
    void useEstado.getState().carregarSuporte();
  });

  socket.on('duelo:erro', ({ texto }: { texto: string }) => {
    avisar(texto, 'erro');
    if (['buscando', 'convidando'].includes(duelo.getState().fase)) duelo.setState({ ...INICIAL });
  });
  socket.on('duelo:conviteEnviado', ({ nome }: { nome: string }) => duelo.setState({ aguardando: nome }));
  socket.on('duelo:conviteRecusado', ({ nome, expirou }: { nome: string; expirou?: boolean }) => {
    avisar(expirou ? `${nome} não respondeu ao convite.` : `${nome} não pode duelar agora.`);
    if (duelo.getState().fase === 'convidando') duelo.setState({ ...INICIAL });
  });
  socket.on('duelo:convite', (convite: EstadoDuelo['convite']) => duelo.setState({ convite }));
  socket.on('duelo:conviteCancelado', () => duelo.setState({ convite: null }));

  socket.on('duelo:inicio', (info: NonNullable<EstadoDuelo['info']>) => {
    duelo.setState({ ...INICIAL, convite: null, fase: 'inicio', info });
  });
  socket.on('duelo:pergunta', (p: Omit<PerguntaDuelo, 'recebidaEm'>) => {
    duelo.setState({ fase: 'pergunta', pergunta: { ...p, recebidaEm: Date.now() }, minhaResposta: null, oponenteRespondeu: false, resultado: null });
  });
  socket.on('duelo:oponenteRespondeu', () => duelo.setState({ oponenteRespondeu: true }));
  socket.on('duelo:resultado', (resultado: NonNullable<EstadoDuelo['resultado']>) => {
    duelo.setState({ fase: 'resultado', resultado, pontos: Object.fromEntries(resultado.placar.map((l) => [l.id, l.pontos])) });
  });
  socket.on('duelo:fim', (fim: FimDuelo) => {
    duelo.setState({ fase: 'fim', fim, pontos: Object.fromEntries(fim.placar.map((l) => [l.id, l.pontos])) });
    void useEstado.getState().atualizarUsuario();
  });
  socket.on('duelo:chat', (m: { de: number; texto: string }) => duelo.setState({ mensagens: [...duelo.getState().mensagens, m].slice(-40) }));
  socket.on('duelo:emote', (e: { de: number; emote: string }) => duelo.setState({ emote: { ...e, n: Date.now() } }));
}

export function desconectarTempoReal() {
  socket?.disconnect();
  socket = null;
  useDuelo.setState({ ...INICIAL, convite: null });
}
