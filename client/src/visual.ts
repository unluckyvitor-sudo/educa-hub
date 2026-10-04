// Identidade visual por matéria, fundos de retrato, raridades e modos de jogo.
import type { Modo, Raridade, TipoItem } from './tipos';

export interface CoresMateria {
  /** Fundo claro do cartão (dois tons do degradê). */
  claro: string;
  claro2: string;
  /** Cor do botão de seta e detalhes. */
  botao: string;
  /** Cor forte para textos e barras. */
  forte: string;
}

const COR = (claro: string, claro2: string, botao: string, forte: string): CoresMateria => ({ claro, claro2, botao, forte });

export const CORES_MATERIA: Record<string, CoresMateria> = {
  portugues: COR('#ffe3f0', '#ffcbe2', '#ff9cc8', '#e0307a'),
  matematica: COR('#d9eeff', '#c2e2ff', '#86c4ff', '#1c6fe0'),
  ciencias: COR('#fff4d3', '#ffe8ab', '#ffd15c', '#d98900'),
  geografia: COR('#dff8de', '#c6f0c6', '#86dd92', '#1c9856'),
  historia: COR('#ebe2ff', '#dccdfd', '#b99dff', '#6d3fe0'),
  ingles: COR('#dcedff', '#c8e2ff', '#8cc4ff', '#2563d9'),
  artes: COR('#ffe3d6', '#ffd0bd', '#ff9f83', '#e0502c'),
  fisica: COR('#d8f6fb', '#bdeef6', '#6fd6e6', '#0b8ea3'),
  quimica: COR('#eaf9d3', '#d8f2b0', '#a6dc55', '#4f8a0b'),
  biologia: COR('#d9f6e6', '#bfeed6', '#6fd9a6', '#0f8f63'),
  filosofia: COR('#ece4ff', '#ddd0ff', '#b39cff', '#5b34d6'),
  sociologia: COR('#ffecd4', '#ffdcb0', '#ffb561', '#d96a00'),
  calculo: COR('#d9eeff', '#c2e2ff', '#86c4ff', '#1c6fe0'),
  algebra: COR('#e3e6ff', '#cfd4ff', '#9aa3ff', '#3f48d6'),
  fisicageral: COR('#d8f6fb', '#bdeef6', '#6fd6e6', '#0b8ea3'),
  estatistica: COR('#d6f7f1', '#b8efe5', '#62d9c5', '#0b8f7c'),
  programacao: COR('#e1f7dc', '#c9efc0', '#86dd7a', '#2a8a1c'),
  anatomia: COR('#ffe6ea', '#ffd0d8', '#ff9bab', '#d92b4b'),
  fisiologia: COR('#ffe1e1', '#ffcaca', '#ff9292', '#d62828'),
  bioquimica: COR('#eaf9d3', '#d8f2b0', '#a6dc55', '#4f8a0b'),
  genetica: COR('#ebe2ff', '#dccdfd', '#b99dff', '#6d3fe0'),
  farmacologia: COR('#d6f7f1', '#b8efe5', '#62d9c5', '#0b8f7c'),
  direito: COR('#fff0d6', '#ffe2b0', '#ffc061', '#b86e00'),
  psicologia: COR('#ffe3f0', '#ffcbe2', '#ff9cc8', '#e0307a'),
  pedagogia: COR('#fff4d3', '#ffe8ab', '#ffd15c', '#d98900'),
};

export const coresDaMateria = (id: string | null | undefined): CoresMateria => CORES_MATERIA[id ?? ''] ?? CORES_MATERIA.historia;

export const FUNDOS: Record<string, string> = {
  lilas: 'linear-gradient(160deg, #c7b8ff, #7c5cff)',
  ceu: 'linear-gradient(160deg, #b5e3ff, #4aa8ff)',
  'por-do-sol': 'linear-gradient(160deg, #ffd07a, #ff5e8a)',
  floresta: 'linear-gradient(160deg, #c2f0b5, #2fa36b)',
  doce: 'linear-gradient(160deg, #ffc9e8, #b79bff)',
  espaco: 'radial-gradient(circle at 20% 25%, #fff 0 1.5px, transparent 2px), radial-gradient(circle at 75% 18%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 60% 70%, #ffe27a 0 1.5px, transparent 2px), radial-gradient(circle at 30% 80%, #fff 0 1px, transparent 1.5px), linear-gradient(160deg, #1b1446, #5b2bbf)',
  'neon-fundo': 'linear-gradient(160deg, #00e5ff, #ff2bd6)',
};

export const fundoDoAvatar = (id: string | null | undefined) => FUNDOS[id ?? ''] ?? FUNDOS.lilas;

export const RARIDADES: Record<Raridade, { nome: string; cor: string }> = {
  comum: { nome: 'Comum', cor: '#8a90b8' },
  raro: { nome: 'Raro', cor: '#2f8bff' },
  epico: { nome: 'Épico', cor: '#a44dff' },
  lendario: { nome: 'Lendário', cor: '#ff9d0a' },
};

export const TIPOS_ITEM: { id: TipoItem; nome: string; opcional: boolean }[] = [
  { id: 'pelagem', nome: 'Pelagem', opcional: false },
  { id: 'roupa', nome: 'Roupa', opcional: false },
  { id: 'cabeca', nome: 'Cabeça', opcional: true },
  { id: 'rosto', nome: 'Rosto', opcional: true },
  { id: 'pescoco', nome: 'Pescoço', opcional: true },
  { id: 'costas', nome: 'Costas', opcional: true },
  { id: 'mao', nome: 'Mão', opcional: true },
  { id: 'fundo', nome: 'Fundo', opcional: false },
];

export const MODOS: Record<Modo, { nome: string; descricao: string; cor: string }> = {
  quiz: { nome: 'Quiz Relâmpago', descricao: 'Responda antes que o tempo acabe', cor: '#5b5ff0' },
  vf: { nome: 'Verdadeiro ou Falso', descricao: 'Decida rápido: certo ou errado?', cor: '#ff4f9a' },
  memoria: { nome: 'Jogo da Memória', descricao: 'Ligue cada pergunta à sua resposta', cor: '#12b886' },
};

export const EMOTES: Record<string, string> = {
  ola: 'Olá!',
  boa: 'Boa jogada!',
  uau: 'Uau!',
  risos: 'Hahaha',
  pensando: 'Hmm...',
  gg: 'Bom jogo!',
};

const FORMATO_DIA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const FORMATO_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

/** Data de hoje no fuso local, no mesmo formato AAAA-MM-DD usado pelo servidor. */
export function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2026-10-01" → data local (sem deslocamento de fuso). */
export const dataDoDia = (dia: string) => new Date(`${dia}T12:00:00`);
export const formatarDia = (dia: string) => FORMATO_DIA.format(dataDoDia(dia));
export const diaDaSemana = (dia: string) => FORMATO_SEMANA.format(dataDoDia(dia)).replace('.', '');

/** Tempo relativo a partir de uma data UTC do banco ("2026-10-01 14:03:00"). */
export function haQuantoTempo(quando: string | null | undefined) {
  if (!quando) return 'nunca';
  const data = new Date(quando.includes('T') ? quando : `${quando.replace(' ', 'T')}Z`);
  const minutos = Math.max(0, Math.round((Date.now() - data.getTime()) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
}
