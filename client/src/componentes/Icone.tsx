import type { CSSProperties, ReactNode } from 'react';

// Ícones de linha (24×24). Cada entrada é o conteúdo do <svg>.
const TRACOS: Record<string, ReactNode> = {
  inicio: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor" />,
  livro: <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.500-.5 6.500 0 8.500 1.500 2-1.500 5-2 8.500-1.500V5C17 4.500 14 5 12 6.500zm0 0v13" />,
  trofeu: <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 5.500H5V7a3 3 0 0 0 3 3m8-4.500h3V7a3 3 0 0 1-3 3m-4 3v4m-3.500 3h7M10 17h4v3h-4z" />,
  grafico: <path d="M5 20v-6a1.500 1.500 0 0 1 3 0v6zm5.500 0V6a1.500 1.500 0 0 1 3 0v14zm5.500 0v-9a1.500 1.500 0 0 1 3 0v9z" />,
  pasta: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 3h18" />,
  engrenagem: (
    <>
      <path d="M12.220 2h-.44a2 2 0 0 0-2 2v.180a2 2 0 0 1-1 1.730l-.43.250a2 2 0 0 1-2 0l-.15-.080a2 2 0 0 0-2.730.730l-.22.380a2 2 0 0 0 .730 2.730l.15.100a2 2 0 0 1 1 1.720v.510a2 2 0 0 1-1 1.740l-.15.090a2 2 0 0 0-.730 2.730l.22.380a2 2 0 0 0 2.730.730l.15-.080a2 2 0 0 1 2 0l.43.250a2 2 0 0 1 1 1.730V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.180a2 2 0 0 1 1-1.730l.43-.250a2 2 0 0 1 2 0l.15.080a2 2 0 0 0 2.730-.730l.22-.390a2 2 0 0 0-.730-2.730l-.15-.080a2 2 0 0 1-1-1.740v-.500a2 2 0 0 1 1-1.740l.15-.090a2 2 0 0 0 .730-2.730l-.22-.380a2 2 0 0 0-2.730-.730l-.15.080a2 2 0 0 1-2 0l-.43-.250a2 2 0 0 1-1-1.730V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.500-3.500" />
    </>
  ),
  sino: <path d="M6 9a6 6 0 0 1 12 0c0 6 2.500 7.500 2.500 7.500h-17S6 15 6 9zm4 11a2 2 0 0 0 4 0" />,
  seta: <path d="M5 12h14m-6-6 6 6-6 6" />,
  voltar: <path d="M19 12H5m6-6-6 6 6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  usuarios: <path d="M16 20v-1.500a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.500 11a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7zM21 20v-1.500a4 4 0 0 0-3-3.850M15.500 4.200a3.500 3.500 0 0 1 0 6.600" />,
  usuario: <path d="M19 20v-1.500a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4V20m7-9a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7z" />,
  sair: <path d="M9 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3m7 12 4-4-4-4m4 4H9" />,
  sacola: <path d="M5 8h14l-1 12H6zm4 0V6.500a3 3 0 0 1 6 0V8" />,
  espadas: <path d="M4 4l9.500 9.500M4 4v3m0-3h3m13 0-9.500 9.500M20 4v3m0-3h-3M5 19l2.500-2.500M19 19l-2.500-2.500M6 15l3 3m9-3-3 3" />,
  check: <path d="M5 12.500 9.500 17 19 7.500" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  cadeado: <path d="M6 11h12v9H6zm2.500 0V8a3.500 3.500 0 0 1 7 0v3" />,
  mais: <path d="M12 5v14m-7-7h14" />,
  copiar: <path d="M9 9h10v11H9zM5 15V4h10" />,
  lixeira: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13m-8 4v5m4-5v5" />,
  editar: <path d="m4 20 1-4L16 5l3 3L8 19zm10-13 3 3" />,
  relogio: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  estrela: <path d="m12 3.500 2.600 5.400 5.900.800-4.300 4.100 1 5.900L12 16.900l-5.200 2.800 1-5.900-4.300-4.100 5.900-.800z" />,
  coracao: <path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.600A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />,
  jogar: <path d="M8 5.500v13l11-6.500z" fill="currentColor" />,
  enviar: <path d="m4 12 16-8-6 16-3-7z" />,
  escudo: <path d="m12 3 7 3v5c0 5-3.500 8.500-7 10-3.500-1.500-7-5-7-10V6z" />,
  alvo: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  raio: <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  cartas: <path d="M4 7h9v13H4zm5-3h11v13h-7" />,
  vf: <path d="m3 13 3 3 5-6m4 0 5 5m0-5-5 5" />,
  chapeu: <path d="m2 9 10-5 10 5-10 5zm4 2v5c2 2 10 2 12 0v-5m4-2v6" />,
  olho: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  painel: <path d="M4 4h7v7H4zm9 0h7v4h-7zm0 6h7v10h-7zM4 13h7v7H4z" />,
  mensagem: <path d="M4 5h16v11H9l-5 4z" />,
  presente: <path d="M4 10h16v10H4zM3 7h18v3H3zm9 0v13m0-13c-2-4-6-3-5 0m5 0c2-4 6-3 5 0" />,
  calendario: <path d="M4 6h16v14H4zm0 4h16M8 3v4m8-4v4" />,
  camiseta: <path d="M8 4 3 7l2 4 2-1v10h10V10l2 1 2-4-5-3a4 4 0 0 1-8 0z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8v.010" />
    </>
  ),
  atualizar: <path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5" />,
};

export type NomeIcone = keyof typeof TRACOS;

interface Props {
  nome: string;
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icone({ nome, tamanho = 24, className, style }: Props) {
  return (
    <svg
      className={className}
      style={style}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRACOS[nome]}
    </svg>
  );
}

/** Moeda da loja. */
export function Moeda({ tamanho = 22 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10.500" fill="#ffc93c" stroke="#d98900" strokeWidth="1.500" />
      <circle cx="12" cy="12" r="7" fill="#ffdd75" />
      <path d="M12 16.500c-2-1.300-4.500-3-4.500-5.200a2.300 2.300 0 0 1 4.500-.700 2.300 2.300 0 0 1 4.500.700c0 2.200-2.500 3.900-4.500 5.200z" fill="#d98900" />
    </svg>
  );
}

/** Chama da sequência de dias. Fica cinza quando o aluno ainda não jogou hoje. */
export function Chama({ tamanho = 22, apagada = false }: { tamanho?: number; apagada?: boolean }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c1 4 6.500 6 6.500 12.500a6.500 6.500 0 0 1-13 0c0-2.800 1.300-4.300 2.700-5.800.2 2.300 1.300 3.300 2.300 3.300C10 9 9.500 6 12 2z" fill={apagada ? '#c5c8de' : '#ff7a1a'} />
      <path d="M12 12c.6 2 3 2.800 3 5.200a3 3 0 0 1-6 0c0-1.300.6-2 1.300-2.700.1 1 .6 1.500 1 1.500.2-1.300-.3-2.500.7-4z" fill={apagada ? '#e3e5f2' : '#ffd23c'} />
    </svg>
  );
}

/** Estrela de experiência (XP). */
export function Xp({ tamanho = 22 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2.500 2.900 6 6.600.900-4.800 4.600 1.200 6.500L12 17.400l-5.900 3.100 1.200-6.500-4.800-4.600 6.600-.900z" fill="#7c5cff" stroke="#4f27b8" strokeWidth="1.300" strokeLinejoin="round" />
    </svg>
  );
}
