// O que as telas precisam saber do gato sem carregar o motor 3D (Three.js): a configuração do avatar,
// os nomes das animações e as propriedades do componente. O desenho em si fica em modelo.ts e cena.ts.

export interface AvatarConfig {
  pelagem: string;
  roupa: string;
  cabeca: string | null;
  rosto: string | null;
  pescoco: string | null;
  costas: string | null;
  mao: string | null;
  fundo: string;
}

export const AVATAR_PADRAO: AvatarConfig = {
  pelagem: 'smoking',
  roupa: 'moletom-roxo',
  cabeca: null,
  rosto: null,
  pescoco: null,
  costas: null,
  mao: 'livro',
  fundo: 'lilas',
};

export type Animacao = 'parado' | 'acenar' | 'comemorar' | 'triste' | 'pensar' | 'dancar' | 'surpreso';

export type Enquadramento = 'corpo' | 'busto' | 'retrato';

/** Identifica uma aparência (o fundo não entra: ele é desenhado fora do retrato). */
export function chaveDoAvatar(avatar: AvatarConfig) {
  return [avatar.pelagem, avatar.roupa, avatar.cabeca, avatar.rosto, avatar.pescoco, avatar.costas, avatar.mao].join('|');
}

export interface PropsDoGato {
  avatar: AvatarConfig;
  animacao?: Animacao;
  enquadramento?: Enquadramento;
  /** A cabeça acompanha o ponteiro do mouse. */
  seguirMouse?: boolean;
  /** Permite girar o gato arrastando (usado no provador de roupas). */
  girarArrastando?: boolean;
  /** Ângulo do gato em radianos (0 = de frente). */
  giro?: number;
  className?: string;
  onClick?: () => void;
}
