// Quiz ao vivo: estado da sessão em andamento (a que o professor conduz ou a da turma do aluno).
import { create } from 'zustand';
import { api, mensagemDoErro } from './api';
import { avisar, useEstado } from './estado';
import type { AvatarConfig } from './gato/modelo';

export interface CartaoAoVivo {
  id: number;
  nome: string;
  avatar: AvatarConfig;
  pontos: number;
  acertos: number;
}

export interface SessaoAoVivo {
  id: string;
  titulo: string;
  materia: string;
  materiaNome: string | null;
  turma: string;
  professor: string;
  fase: 'sala' | 'pergunta' | 'resultado' | 'fim';
  indice: number;
  total: number;
  tempo: number;
  /** Verdadeiro para o professor que criou o quiz. */
  conduz: boolean;
  participando: boolean;
  participantes: number;
  sala: CartaoAoVivo[] | null;
  pergunta: { enunciado: string; alternativas: string[]; restanteMs: number; minhaResposta: number | null; responderam: number } | null;
  /** Só chega depois que a pergunta fecha. */
  resultado: { correta: number; explicacao: string | null; distribuicao: number[]; acertei: boolean; ganho: number } | null;
  podio: CartaoAoVivo[] | null;
  eu: { pontos: number; acertos: number; posicao: number; recompensa: { xp: number; moedas: number; subiuNivel?: boolean; nivel?: number } | null } | null;
  /** Momento em que este estado chegou, para o cronômetro. */
  recebidaEm: number;
}

type DoServidor = Omit<SessaoAoVivo, 'recebidaEm'> | null;

interface EstadoAoVivo {
  sessao: SessaoAoVivo | null;
  /** Convite que o aluno fechou: não insistir com a mesma sessão. */
  dispensado: string | null;
  carregar: () => Promise<void>;
  receber: (sessao: DoServidor) => void;
  encerrada: (id: string) => void;
  criar: (corpo: { turmaId: number; materia: string; topicoId?: string; quantidade: number }) => Promise<boolean>;
  entrar: () => Promise<boolean>;
  avancar: () => Promise<void>;
  encerrar: () => Promise<void>;
  responder: (alternativa: number) => Promise<void>;
  dispensar: () => void;
}

export const useAoVivo = create<EstadoAoVivo>((set, get) => {
  /** Envia um comando da sessão atual e guarda o estado que volta. */
  const comando = async (acao: string, corpo: unknown = {}) => {
    const { sessao } = get();
    if (!sessao) return false;
    try {
      const r = await api<{ sessao: DoServidor }>(`/aovivo/${sessao.id}/${acao}`, { corpo });
      get().receber(r.sessao);
      return true;
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
      return false;
    }
  };

  return {
    sessao: null,
    dispensado: null,

    async carregar() {
      try {
        const r = await api<{ sessao: DoServidor }>('/aovivo/atual');
        get().receber(r.sessao);
      } catch {
        // sem conexão: o estado chega de novo quando o tempo real reconectar
      }
    },

    receber(sessao) {
      const anterior = get().sessao;
      set({ sessao: sessao ? { ...sessao, recebidaEm: Date.now() } : null });
      // Ao chegar o pódio, os pontos e as moedas do aluno mudaram.
      if (sessao?.fase === 'fim' && anterior?.fase !== 'fim' && sessao.participando) void useEstado.getState().atualizarUsuario();
    },

    encerrada(id) {
      const { sessao } = get();
      // Quem está olhando o pódio continua com ele na tela depois que o professor fecha a sessão.
      if (sessao?.id === id && !(sessao.fase === 'fim' && sessao.participando)) set({ sessao: null });
    },

    async criar(corpo) {
      try {
        const r = await api<{ sessao: DoServidor }>('/aovivo', { corpo });
        get().receber(r.sessao);
        return true;
      } catch (falha) {
        avisar(mensagemDoErro(falha), 'erro');
        return false;
      }
    },

    entrar: () => comando('entrar'),
    avancar: async () => void (await comando('avancar')),
    encerrar: async () => void (await comando('encerrar')),

    async responder(alternativa) {
      const { sessao } = get();
      if (!sessao?.pergunta || sessao.fase !== 'pergunta' || sessao.pergunta.minhaResposta !== null) return;
      // Marca na hora, para o toque responder mesmo com a rede lenta; o servidor confirma em seguida.
      set({ sessao: { ...sessao, pergunta: { ...sessao.pergunta, minhaResposta: alternativa } } });
      await comando('responder', { indice: sessao.indice, resposta: alternativa });
    },

    dispensar: () => set({ dispensado: get().sessao?.id ?? null }),
  };
});
