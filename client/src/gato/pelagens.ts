// Aparência de cada pelagem (skin) e de cada roupa do gato.

export interface Pelagem {
  base: number;
  /** Focinho, bochechas e peito. */
  clara: number;
  /** Orelhas, pernas e cauda (diferem da base no siamês). */
  pontas: number;
  patas: number;
  orelha: number;
  nariz: number;
  iris: number;
  bigodes: number;
  pontaCauda: number;
  estampa?: 'listras' | 'manchas' | 'galaxia' | 'arcoiris' | 'robo' | 'ouro' | 'neon';
}

export const PELAGENS: Record<string, Pelagem> = {
  smoking: { base: 0x2a2b45, clara: 0xffffff, pontas: 0x2a2b45, patas: 0xffffff, orelha: 0xff8fa8, nariz: 0xff6f91, iris: 0x4cc259, bigodes: 0xffffff, pontaCauda: 0xffffff },
  laranja: { base: 0xf79a3e, clara: 0xfff1dc, pontas: 0xf79a3e, patas: 0xfff1dc, orelha: 0xffb3a1, nariz: 0xf2707f, iris: 0x4cc259, bigodes: 0xffffff, pontaCauda: 0xfff1dc, estampa: 'listras' },
  cinza: { base: 0x8f96ad, clara: 0xf1f3f9, pontas: 0x8f96ad, patas: 0xf1f3f9, orelha: 0xffa9b8, nariz: 0xf2707f, iris: 0xf5b82e, bigodes: 0xffffff, pontaCauda: 0x8f96ad },
  branco: { base: 0xf6f7ff, clara: 0xffffff, pontas: 0xf6f7ff, patas: 0xffffff, orelha: 0xffb6c6, nariz: 0xff8fa8, iris: 0x3fa0ff, bigodes: 0x9aa3c2, pontaCauda: 0xffffff },
  siames: { base: 0xf4e4cf, clara: 0xfdf6ec, pontas: 0x6d4b3b, patas: 0x6d4b3b, orelha: 0x8c6452, nariz: 0x4a3229, iris: 0x3fa0ff, bigodes: 0xffffff, pontaCauda: 0x6d4b3b },
  tricolor: { base: 0xfdfbf6, clara: 0xffffff, pontas: 0xf79a3e, patas: 0xffffff, orelha: 0xffb3a1, nariz: 0xf2707f, iris: 0x4cc259, bigodes: 0x9aa3c2, pontaCauda: 0x2a2b45, estampa: 'manchas' },
  chiclete: { base: 0xff86c8, clara: 0xffe6f4, pontas: 0xff86c8, patas: 0xffe6f4, orelha: 0xffd0ea, nariz: 0xd6338a, iris: 0x7a4dff, bigodes: 0xffffff, pontaCauda: 0xffe6f4 },
  neon: { base: 0x1f6bff, clara: 0x8fe9ff, pontas: 0x1f6bff, patas: 0x8fe9ff, orelha: 0x8fe9ff, nariz: 0xff3fd0, iris: 0xfff06b, bigodes: 0x8fe9ff, pontaCauda: 0x8fe9ff, estampa: 'neon' },
  galaxia: { base: 0x4a25a8, clara: 0xc4acff, pontas: 0x4a25a8, patas: 0xc4acff, orelha: 0xff8fe0, nariz: 0xff8fe0, iris: 0xffd84d, bigodes: 0xffffff, pontaCauda: 0xff8fe0, estampa: 'galaxia' },
  robo: { base: 0xc3cbdc, clara: 0xe9eef8, pontas: 0x7d879f, patas: 0x7d879f, orelha: 0x5ee6ff, nariz: 0x5ee6ff, iris: 0x5ee6ff, bigodes: 0x7d879f, pontaCauda: 0x5ee6ff, estampa: 'robo' },
  arcoiris: { base: 0xffffff, clara: 0xffffff, pontas: 0xffffff, patas: 0xffffff, orelha: 0xff8fa8, nariz: 0xff6f91, iris: 0x7a4dff, bigodes: 0xffffff, pontaCauda: 0xffffff, estampa: 'arcoiris' },
  dourado: { base: 0xffc72e, clara: 0xfff0b8, pontas: 0xffc72e, patas: 0xfff0b8, orelha: 0xffe58a, nariz: 0xb8791a, iris: 0x38a6ff, bigodes: 0xfff0b8, pontaCauda: 0xfff0b8, estampa: 'ouro' },
};

export interface Roupa {
  tipo: 'moletom' | 'jaleco' | 'uniforme' | 'heroi';
  cor: number;
  detalhe: number;
}

export const ROUPAS: Record<string, Roupa> = {
  'moletom-roxo': { tipo: 'moletom', cor: 0x6d3fe0, detalhe: 0x4f27b8 },
  'moletom-azul': { tipo: 'moletom', cor: 0x2f7df6, detalhe: 0x1c5fd1 },
  'moletom-rosa': { tipo: 'moletom', cor: 0xff5fa8, detalhe: 0xe03d8a },
  'moletom-verde': { tipo: 'moletom', cor: 0x2fbf71, detalhe: 0x1c9856 },
  'moletom-vermelho': { tipo: 'moletom', cor: 0xef4444, detalhe: 0xc42a2a },
  'moletom-amarelo': { tipo: 'moletom', cor: 0xffc233, detalhe: 0xe59f00 },
  'moletom-preto': { tipo: 'moletom', cor: 0x33364b, detalhe: 0x1b1d2b },
  jaleco: { tipo: 'jaleco', cor: 0xffffff, detalhe: 0xcfd8ea },
  uniforme: { tipo: 'uniforme', cor: 0xffd60a, detalhe: 0x1c9856 },
  heroi: { tipo: 'heroi', cor: 0xe11d48, detalhe: 0xffc233 },
};
