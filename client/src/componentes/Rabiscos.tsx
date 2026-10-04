import type { CSSProperties } from 'react';

// Rabiscos decorativos desenhados à mão (coroa, seta, coração, estrela, faíscas).
interface Props {
  cor?: string;
  tamanho?: number;
  className?: string;
  style?: CSSProperties;
}

const base = (tamanho: number, cor: string, className?: string, style?: CSSProperties) => ({
  width: tamanho,
  height: tamanho,
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: cor,
  strokeWidth: 3.500,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  style,
  'aria-hidden': true,
});

export function Coroa({ cor = '#7c4dff', tamanho = 64, className, style }: Props) {
  return (
    <svg {...base(tamanho, cor, className, style)}>
      <path d="M10 22c2 9 3 18 5 27 11-3 23-4 35-3 1-10 3-19 6-28-5 5-9 10-13 16-3-7-6-13-10-19-3 7-6 13-9 19-5-4-9-8-14-12z" />
    </svg>
  );
}

export function Seta({ cor = '#7c4dff', tamanho = 64, className, style }: Props) {
  return (
    <svg {...base(tamanho, cor, className, style)} fill={cor}>
      <path d="M6 54c14-8 26-19 37-32l-13 2c-2 0-2-3 0-4l24-8c2 0 3 1 3 3l-5 24c-1 2-4 2-4 0l1-13C38 38 24 50 9 58c-3 1-5-2-3-4z" stroke="none" />
    </svg>
  );
}

export function Coracao({ cor = '#7c4dff', tamanho = 64, className, style }: Props) {
  return (
    <svg {...base(tamanho, cor, className, style)}>
      <path d="M30 54C19 44 9 34 11 22c2-9 13-11 18 0 3-11 15-13 20-4 5 11-7 25-19 36z" />
    </svg>
  );
}

export function EstrelaRabisco({ cor = '#5b5ff0', tamanho = 64, className, style }: Props) {
  return (
    <svg {...base(tamanho, cor, className, style)}>
      <path d="M33 8c2 7 4 13 7 19 6 1 12 3 18 6-6 3-11 7-15 12 1 6 1 12 0 18-5-4-10-8-16-10-5 3-10 6-14 10 1-7 3-13 6-19-4-4-8-9-12-13 6-1 12-1 18-1 3-7 5-14 8-22z" />
    </svg>
  );
}

/** Três tracinhos de destaque, como os que cercam os ícones das matérias. */
export function Faiscas({ cor = '#2f8bff', tamanho = 40, className, style }: Props) {
  return (
    <svg {...base(tamanho, cor, className, style)} strokeWidth={5}>
      <path d="M12 14l14 9M8 34h16M13 54l13-8" />
    </svg>
  );
}

/** Pinceladas largas usadas no fundo do cabeçalho. */
export function Pinceladas({ cor = '#d8d2fb', className, style }: Omit<Props, 'tamanho'>) {
  return (
    <svg className={className} style={style} width="150" height="180" viewBox="0 0 150 180" fill="none" stroke={cor} strokeWidth="16" strokeLinecap="round" aria-hidden="true">
      <path d="M40 150 110 20M76 160l62-108M10 120l44-76" />
    </svg>
  );
}
