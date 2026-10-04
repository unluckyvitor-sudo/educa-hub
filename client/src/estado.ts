// Estado global: sessão do usuário, avisos na tela e notificações.
import { create } from 'zustand';
import { api, definirAoPerderSessao } from './api';
import type { Notificacao, ResumoSuporte, Usuario } from './tipos';

export interface Aviso {
  id: number;
  texto: string;
  tipo: 'info' | 'sucesso' | 'erro';
}

interface Estado {
  usuario: Usuario | null;
  /** Verdadeiro até a primeira consulta de sessão terminar. */
  carregando: boolean;
  avisos: Aviso[];
  notificacoes: Notificacao[];
  /** Respostas novas nos meus chamados e pedidos esperando por mim (avisos do menu). */
  suporte: ResumoSuporte;

  carregarSessao: () => Promise<void>;
  definirUsuario: (usuario: Usuario | null) => void;
  /** Busca de novo os dados do usuário (XP, moedas, sequência) depois de um jogo ou compra. */
  atualizarUsuario: () => Promise<void>;
  avisar: (texto: string, tipo?: Aviso['tipo']) => void;
  fecharAviso: (id: number) => void;
  carregarNotificacoes: () => Promise<void>;
  receberNotificacao: (n: Notificacao) => void;
  marcarNotificacoesLidas: () => void;
  carregarSuporte: () => Promise<void>;
}

const SUPORTE_VAZIO: ResumoSuporte = { respostasNovas: 0, paraAtender: 0, feedbacksNovos: 0 };

let proximoAviso = 1;

export const useEstado = create<Estado>((set, get) => ({
  usuario: null,
  carregando: true,
  avisos: [],
  notificacoes: [],
  suporte: SUPORTE_VAZIO,

  async carregarSessao() {
    try {
      const { usuario } = await api<{ usuario: Usuario }>('/eu');
      set({ usuario, carregando: false });
    } catch {
      set({ usuario: null, carregando: false });
    }
  },

  definirUsuario: (usuario) => set({ usuario, ...(usuario ? {} : { notificacoes: [], suporte: SUPORTE_VAZIO }) }),

  async atualizarUsuario() {
    try {
      const { usuario } = await api<{ usuario: Usuario }>('/eu');
      set({ usuario });
    } catch {
      // Mantém os dados atuais; a próxima navegação tenta de novo.
    }
  },

  avisar(texto, tipo = 'info') {
    const id = proximoAviso++;
    set({ avisos: [...get().avisos, { id, texto, tipo }] });
    setTimeout(() => get().fecharAviso(id), 4500);
  },

  fecharAviso: (id) => set({ avisos: get().avisos.filter((a) => a.id !== id) }),

  async carregarNotificacoes() {
    try {
      const { notificacoes } = await api<{ notificacoes: Notificacao[] }>('/notificacoes');
      set({ notificacoes });
    } catch {
      // Sem notificações por enquanto.
    }
  },

  receberNotificacao(n) {
    set({ notificacoes: [n, ...get().notificacoes].slice(0, 30) });
    get().avisar(n.texto);
  },

  marcarNotificacoesLidas() {
    if (!get().notificacoes.some((n) => !n.lida)) return;
    set({ notificacoes: get().notificacoes.map((n) => ({ ...n, lida: 1 })) });
    api('/notificacoes/lidas', { metodo: 'POST' }).catch(() => {});
  },

  async carregarSuporte() {
    try {
      set({ suporte: await api<ResumoSuporte>('/suporte/resumo') });
    } catch {
      // Os avisos do menu ficam como estão.
    }
  },
}));

export const avisar = (texto: string, tipo?: Aviso['tipo']) => useEstado.getState().avisar(texto, tipo);

// Sessão encerrada no servidor: volta para a tela de entrada em vez de mostrar erros em cada página.
definirAoPerderSessao(() => {
  const { usuario, definirUsuario } = useEstado.getState();
  if (!usuario) return;
  definirUsuario(null);
  avisar('Sua sessão terminou. Entre de novo para continuar.');
});
