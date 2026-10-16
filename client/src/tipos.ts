import type { AvatarConfig } from './gato/modelo';

export type Papel = 'aluno' | 'professor' | 'admin';
export type Modo = 'quiz' | 'vf' | 'memoria';
export type TipoItem = 'pelagem' | 'roupa' | 'cabeca' | 'rosto' | 'pescoco' | 'costas' | 'mao' | 'fundo';
export type Raridade = 'comum' | 'raro' | 'epico' | 'lendario';

export interface NivelInfo {
  nivel: number;
  titulo: string;
  xpNoNivel: number;
  xpParaProximo: number;
}

export interface ResumoUsuario {
  id: number;
  papel: Papel;
  nome: string;
  usuario: string;
  serie: string | null;
  serieNome: string | null;
  avatar: AvatarConfig;
  xp: number;
  nivel: number;
  sequencia: number;
}

export interface Usuario extends ResumoUsuario {
  status: 'ativo' | 'pendente' | 'bloqueado';
  email: string | null;
  etapa: string | null;
  curso: string | null;
  instituicao: string | null;
  nascimento: string | null;
  bio: string | null;
  disciplinas: string | null;
  formacao: string | null;
  moedas: number;
  maiorSequencia: number;
  jogouHoje: boolean;
  nivelInfo: NivelInfo;
  criadoEm: string;
  /** Responsável que autorizou o uso (alunos menores de idade). */
  responsavel: string | null;
  /** O que falta aceitar ou informar para a conta ficar em dia com os termos; null quando está tudo certo. */
  pendencias: { termos: boolean; nascimento: boolean; responsavel: boolean } | null;
}

export interface Catalogo {
  etapas: { id: string; nome: string }[];
  series: { id: string; nome: string; etapa: string }[];
  materias: Record<string, string>;
}

export interface MateriaResumo {
  id: string;
  nome: string;
  topicos: number;
  total: number;
  concluidas: number;
}

export interface Topico {
  id: string;
  titulo: string;
  resumo: string;
  /** Vídeo-aula que acompanha o resumo (endereço no próprio site). */
  video?: string | null;
  questoes: number;
  /** Criado por um professor ou administrador pela interface. */
  extra?: boolean;
  modos: Record<Modo, number>;
  concluidas: number;
}

export interface ItemLoja {
  id: string;
  tipo: TipoItem;
  nome: string;
  raridade: Raridade;
  preco?: number;
  padrao?: boolean;
  marco?: number;
  possui: boolean;
}

export interface Marco {
  dias: number;
  moedas: number;
  item: ItemLoja | null;
  alcancado?: boolean;
}

export interface InfoSequencia {
  atual: number;
  maior: number;
  jogouHoje: boolean;
  ultimosDias: { dia: string; jogou: boolean }[];
  marcos: Marco[];
}

export interface ResultadoSequencia {
  sequencia: number;
  aumentou: boolean;
  marcos: Marco[];
}

export interface Missao {
  chave: string;
  origem: 'sistema' | 'professor';
  missaoId?: number;
  titulo: string;
  descricao: string | null;
  periodo: 'diaria' | 'semanal';
  tipo: string;
  materia?: string | null;
  materiaNome?: string | null;
  meta: number;
  progresso: number;
  concluida: boolean;
  resgatada: boolean;
  xp: number;
  moedas: number;
  fim: string;
  turma?: string;
  professor?: string;
  totalQuestoes?: number | null;
}

export interface PosicaoRanking extends ResumoUsuario {
  posicao: number;
  pontos: number;
  online: boolean;
  eu: boolean;
}

export interface Amigo extends ResumoUsuario {
  amizadeId: number;
  online: boolean;
  mesmoNivel: boolean;
}

export interface Estatisticas {
  atividades: number;
  acertos: number;
  questoes: number;
  aproveitamento: number;
  duelos: number;
  vitorias: number;
}

export interface AtividadeRecente {
  id: number;
  alunoId?: number;
  aluno?: string;
  materia: string | null;
  materiaId?: string | null;
  titulo: string;
  modo: Modo | 'revisao' | 'aovivo';
  acertos: number;
  total: number;
  xp?: number;
  quando: string;
}

export interface Progresso {
  nivel: NivelInfo;
  xp: number;
  moedas: number;
  total: number;
  concluidas: number;
  /** Questões esperando revisão no caderno de erros. */
  erros: number;
  estatisticas: Estatisticas;
  sequencia: InfoSequencia;
  materias: { id: string; nome: string; total: number; concluidas: number; atividades: number; aproveitamento: number | null }[];
  xpPorDia: { dia: string; xp: number }[];
  recentes: AtividadeRecente[];
}

export interface Notificacao {
  id: number;
  tipo: string;
  texto: string;
  link: string | null;
  lida: number;
  criado_em?: string;
}

export interface Turma {
  id: number;
  nome: string;
  serie: string;
  serieNome: string;
  descricao: string | null;
  codigo: string;
  criadoEm: string;
  membros?: number;
  online?: number;
}

export interface MissaoProfessor {
  id: number;
  turmaId: number;
  turma?: string;
  titulo: string;
  descricao: string | null;
  periodo: 'diaria' | 'semanal';
  tipo: 'atividades' | 'acertos' | 'quiz';
  materia: string | null;
  materiaNome: string | null;
  meta: number;
  xp: number;
  moedas: number;
  questoes: number | null;
  inicio: string;
  fim: string;
  ativa: boolean;
  concluiram: number;
  participantes: number;
}

export type StatusChamado = 'aberto' | 'respondido' | 'resolvido';

/** Pedido de ajuda: uma conversa entre quem pediu e quem atende (equipe ou professor). */
export interface Chamado {
  id: number;
  categoria: string;
  categoriaNome: string;
  assunto: string;
  status: StatusChamado;
  avaliacao: number | null;
  atendente: string;
  paraProfessor: boolean;
  criadoEm: string;
  atualizadoEm: string;
  ultimaMensagem: string | null;
  /** Mensagens que quem está vendo ainda não leu. */
  novas: number;
  autor?: { id: number; nome: string; usuario: string; papel: Papel };
}

export interface MensagemChamado {
  id: number;
  texto: string;
  doAtendente: boolean;
  minha: boolean;
  autor: string;
  criadoEm: string;
}

/** Contadores dos avisos do menu. */
export interface ResumoSuporte {
  respostasNovas: number;
  paraAtender: number;
  feedbacksNovos: number;
}

export interface ResultadoJogo {
  acertos: number;
  total: number;
  modo: Modo;
  xp: number;
  moedas: number;
  subiuNivel: boolean;
  nivel?: number;
  sequencia: ResultadoSequencia | null;
  /** O que foi respondido errado nesta partida, com a resposta certa. */
  erradas: QuestaoErrada[];
  /** Quantas questões estão no caderno de erros depois desta partida. */
  noCaderno: number;
}

export interface QuestaoErrada {
  enunciado: string;
  correta: string;
  explicacao: string | null;
}

export interface CadernoDeErros {
  total: number;
  /** Acertos seguidos que tiram uma questão do caderno. */
  paraDominar: number;
  porMateria: { id: string; nome: string; total: number }[];
  questoes: { id: string; enunciado: string; materia: string | null; materiaId: string; topico: string | null; vezes: number; acertosSeguidos: number }[];
}

export interface Dificuldade {
  id: string;
  enunciado: string;
  correta: string;
  materia: string | null;
  materiaId: string;
  topico: string | null;
  respostas: number;
  erros: number;
  alunos: number;
  taxa: number;
}
