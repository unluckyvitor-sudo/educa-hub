import type { ReactNode } from 'react';

// Ilustrações das matérias em estilo de adesivo: cores vivas e contorno azul-noite.
const N = '#1a1c44';

const DESENHOS: Record<string, ReactNode> = {
  portugues: (
    <>
      <path d="M48 30c-8-7-20-9-30-7v40c10-2 22 0 30 7 8-7 20-9 30-7V23c-10-2-22 0-30 7z" fill="#ff6fae" />
      <path d="M48 37c-6-4.500-14-6-23-5v27c9-1 17 .500 23 5 6-4.500 14-6 23-5V32c-9-1-17 .500-23 5z" fill="#fff" />
      <path d="M48 37v27" />
      <path d="M31 40c4 0 8 1 11 2.500M31 47c4 0 8 1 11 2.500M31 54c4 0 8 1 11 2.500M65 40c-4 0-8 1-11 2.500M65 47c-4 0-8 1-11 2.500M65 54c-4 0-8 1-11 2.500" stroke="#ff6fae" strokeWidth="2.500" fill="none" />
    </>
  ),
  matematica: (
    <>
      <rect x="17" y="17" width="62" height="62" rx="13" fill="#3aa0ff" />
      <g stroke="none" fill="#fff">
        <rect x="24" y="24" width="22" height="22" rx="5" />
        <rect x="50" y="24" width="22" height="22" rx="5" />
        <rect x="24" y="50" width="22" height="22" rx="5" />
        <rect x="50" y="50" width="22" height="22" rx="5" />
      </g>
      <path d="M35 29.500v11M29.500 35h11M55.500 35h11M31 57l8 8m0-8-8 8M55.500 61h11" stroke="#1c6fe0" fill="none" />
      <g stroke="none" fill="#1c6fe0">
        <circle cx="61" cy="55.500" r="1.900" />
        <circle cx="61" cy="66.500" r="1.900" />
      </g>
    </>
  ),
  ciencias: (
    <>
      <path d="M43 17v19L26 67a7.500 7.500 0 0 0 6.500 11h31A7.500 7.500 0 0 0 70 67L53 36V17" fill="#fff8e1" />
      <path d="M34 53h28l8.500 15a6.500 6.500 0 0 1-5.500 9.500H31A6.500 6.500 0 0 1 25.500 68z" fill="#ffb829" stroke="none" />
      <path d="M43 17v19L26 67a7.500 7.500 0 0 0 6.500 11h31A7.500 7.500 0 0 0 70 67L53 36V17M39 17h18" fill="none" />
      <g stroke="none" fill="#fff">
        <circle cx="42" cy="65" r="3.200" />
        <circle cx="53" cy="70" r="2.200" />
        <circle cx="56" cy="61" r="2.600" />
      </g>
    </>
  ),
  geografia: (
    <>
      <path d="M48 66v10M35 80h26" />
      <circle cx="48" cy="42" r="25" fill="#3aa0ff" />
      <g stroke="none" fill="#4ccf6b">
        <path d="M36 21c6 2 10 6 8 11s-9 4-11 9c-2 4 1 9-3 11-5-6-7-14-4-21 2-4 6-8 10-10z" />
        <path d="M58 29c6 1 11 6 13 12-3 3-8 1-10 5s1 9-3 12c-4 0-6-5-5-10 1-4-2-6-1-10 1-4 3-7 6-9z" />
        <path d="M40 58c3-2 7-1 9 2-1 3-3 5-6 6-3-2-4-5-3-8z" />
      </g>
      <circle cx="48" cy="42" r="25" fill="none" />
    </>
  ),
  historia: (
    <>
      <path d="M30 19h37a8 8 0 0 1 8 8v42H38V27a8 8 0 0 0-8-8z" fill="#cdb9ff" />
      <path d="M30 19a8 8 0 0 0-8 8v7h16v-7a8 8 0 0 0-8-8z" fill="#9a78f5" />
      <path d="M38 69h45v2a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8z" fill="#9a78f5" />
      <path d="M47 33h19M47 43h19M47 53h13" stroke="#6d3fe0" fill="none" />
    </>
  ),
  ingles: (
    <>
      <clipPath id="bandeira">
        <rect x="14" y="26" width="68" height="44" rx="9" />
      </clipPath>
      <g clipPath="url(#bandeira)" stroke="none">
        <rect x="14" y="26" width="68" height="44" fill="#2152c9" />
        <path d="M14 26l68 44M82 26 14 70" stroke="#fff" strokeWidth="10" />
        <path d="M14 26l68 44M82 26 14 70" stroke="#e8324f" strokeWidth="4" />
        <path d="M48 26v44M14 48h68" stroke="#fff" strokeWidth="15" />
        <path d="M48 26v44M14 48h68" stroke="#e8324f" strokeWidth="8" />
      </g>
      <rect x="14" y="26" width="68" height="44" rx="9" fill="none" />
    </>
  ),
  artes: (
    <>
      <path d="M46 18c-18 0-31 12-31 28 0 14 11 26 25 26 5 0 7-3 6-7-1-4 1-8 6-8h8c10 0 18-6 18-15 0-14-14-24-32-24z" fill="#ffe6cf" />
      <g stroke={N} strokeWidth="2.500">
        <circle cx="31" cy="41" r="5.500" fill="#ff5a5a" />
        <circle cx="44" cy="30" r="5.500" fill="#ffc93c" />
        <circle cx="60" cy="33" r="5.500" fill="#4ccf6b" />
        <circle cx="30" cy="56" r="5.500" fill="#3aa0ff" />
      </g>
      <path d="M61 62 82 28" strokeWidth="9" />
      <path d="M61 62 82 28" stroke="#b9794a" strokeWidth="4" />
      <path d="M64 56c-6-1-11 4-10 11 5 1 12-2 13-8z" fill="#7c5cff" />
    </>
  ),
  fisica: (
    <>
      <g fill="none" stroke="#0b8ea3" strokeWidth="4">
        <ellipse cx="48" cy="48" rx="32" ry="12" />
        <ellipse cx="48" cy="48" rx="32" ry="12" transform="rotate(60 48 48)" />
        <ellipse cx="48" cy="48" rx="32" ry="12" transform="rotate(120 48 48)" />
      </g>
      <circle cx="48" cy="48" r="8" fill="#ffc93c" />
      <g strokeWidth="2.500" fill="#ff5a8f">
        <circle cx="80" cy="48" r="4.500" />
        <circle cx="32" cy="20.500" r="4.500" />
        <circle cx="32" cy="75.500" r="4.500" />
      </g>
    </>
  ),
  quimica: (
    <>
      <path d="M43 17v17a23 23 0 1 0 10 0V17" fill="#f6ffe6" />
      <path d="M26.500 58a22 22 0 0 0 43 0c-7-4-14 3-21 0s-15-4-22 0z" fill="#8fd42f" stroke="none" />
      <path d="M43 17v17a23 23 0 1 0 10 0V17M39 17h18" fill="none" />
      <g strokeWidth="2.500" fill="#8fd42f">
        <circle cx="66" cy="20" r="4" />
        <circle cx="75" cy="30" r="2.800" />
      </g>
    </>
  ),
  biologia: (
    <>
      <path d="M48 82V44" />
      <path d="M48 54c-2-15-13-23-30-23 0 17 11 28 30 23z" fill="#34c77b" />
      <path d="M48 44c2-15 13-23 30-23 0 17-11 28-30 23z" fill="#74e6ac" />
      <path d="M48 54c-6-7-13-12-22-16M48 44c6-7 13-12 22-16" strokeWidth="2.500" fill="none" />
      <path d="M32 82h32" />
    </>
  ),
  filosofia: (
    <>
      <path d="M48 13a23 23 0 0 0-14 41c2 1.800 3.500 4 3.500 6.500V63h21v-2.500c0-2.500 1.500-4.700 3.500-6.500A23 23 0 0 0 48 13z" fill="#ffd84d" />
      <rect x="37.500" y="63" width="21" height="12" rx="4" fill="#b39cff" />
      <path d="M43 81h10M41 46l7-9 7 9M48 37v26" fill="none" strokeWidth="2.800" />
    </>
  ),
  sociologia: (
    <>
      <circle cx="25" cy="38" r="9" fill="#ffb561" />
      <path d="M9 70a16 16 0 0 1 32 0z" fill="#ffb561" />
      <circle cx="71" cy="38" r="9" fill="#ff8fc0" />
      <path d="M55 70a16 16 0 0 1 32 0z" fill="#ff8fc0" />
      <circle cx="48" cy="34" r="11.500" fill="#86c4ff" />
      <path d="M27 77a21 21 0 0 1 42 0z" fill="#86c4ff" />
    </>
  ),
  calculo: (
    <>
      <rect x="16" y="16" width="64" height="64" rx="14" fill="#3aa0ff" />
      <path d="M60 30c-9-5-12 1-12 10v16c0 9-3 15-12 10" stroke="#fff" strokeWidth="6" fill="none" />
      <path d="M62 52v10m-5-5h10" stroke="#fff" strokeWidth="3" fill="none" />
    </>
  ),
  algebra: (
    <>
      <rect x="16" y="16" width="64" height="64" rx="14" fill="#7d86ff" />
      <path d="M31 27h-6v42h6M65 27h6v42h-6" stroke="#fff" strokeWidth="4" fill="none" />
      <g stroke="none" fill="#fff">
        {[36, 48, 60].flatMap((x) => [36, 48, 60].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={x === y ? 4.200 : 2.800} />))}
      </g>
    </>
  ),
  fisicageral: (
    <>
      <path d="M25 20h15v28a8 8 0 0 0 16 0V20h15v28a23 23 0 0 1-46 0z" fill="#ff5a5a" />
      <path d="M25 20h15v11H25zM56 20h15v11H56z" fill="#eef1fa" />
      <path d="M17 76l-5 5M48 80v7M79 76l5 5" stroke="#0b8ea3" fill="none" />
    </>
  ),
  estatistica: (
    <>
      <rect x="19" y="50" width="15" height="27" rx="4" fill="#62d9c5" />
      <rect x="40.500" y="34" width="15" height="43" rx="4" fill="#3aa0ff" />
      <rect x="62" y="19" width="15" height="58" rx="4" fill="#ff6fae" />
      <path d="M12 80h72" />
    </>
  ),
  programacao: (
    <>
      <path d="M48 68v10M36 80h24" />
      <rect x="13" y="18" width="70" height="50" rx="9" fill="#2a2f5a" />
      <path d="M36 34l-10 9 10 9M60 34l10 9-10 9M53 30l-10 26" stroke="#86ee7a" strokeWidth="4.500" fill="none" />
    </>
  ),
  anatomia: (
    <g transform="rotate(-38 48 48)">
      <path d="M30 40a9 9 0 1 0-9 8 9 9 0 1 0 9 8h36a9 9 0 1 0 9-8 9 9 0 1 0-9-8z" fill="#fff" />
    </g>
  ),
  fisiologia: (
    <>
      <path d="M48 79S17 61 17 38a15.500 15.500 0 0 1 31-6 15.500 15.500 0 0 1 31 6c0 23-31 41-31 41z" fill="#ff5a6e" />
      <path d="M22 49h13l5-11 8 22 6-15 4 4h16" stroke="#fff" fill="none" />
    </>
  ),
  bioquimica: (
    <>
      <path d="m48 22 22 13v26L48 74 26 61V35z" fill="#f1fbdf" />
      <g strokeWidth="2.800">
        <circle cx="48" cy="22" r="7.500" fill="#8fd42f" />
        <circle cx="70" cy="35" r="7.500" fill="#3aa0ff" />
        <circle cx="70" cy="61" r="7.500" fill="#8fd42f" />
        <circle cx="48" cy="74" r="7.500" fill="#3aa0ff" />
        <circle cx="26" cy="61" r="7.500" fill="#8fd42f" />
        <circle cx="26" cy="35" r="7.500" fill="#3aa0ff" />
      </g>
    </>
  ),
  genetica: (
    <>
      <path d="M38 25h20M41 40h14M41 56h14M38 71h20" strokeWidth="3" />
      <g fill="none">
        <path d="M33 13c0 17 30 18 30 35S33 66 33 83" strokeWidth="10" />
        <path d="M33 13c0 17 30 18 30 35S33 66 33 83" stroke="#9a78f5" strokeWidth="5" />
        <path d="M63 13c0 17-30 18-30 35s30 18 30 35" strokeWidth="10" />
        <path d="M63 13c0 17-30 18-30 35s30 18 30 35" stroke="#ff6fae" strokeWidth="5" />
      </g>
    </>
  ),
  farmacologia: (
    <g transform="rotate(-40 48 48)">
      <rect x="16" y="33" width="64" height="30" rx="15" fill="#fff" />
      <path d="M48 33h17a15 15 0 0 1 0 30H48z" fill="#3fd0b9" />
      <path d="M26 42h10" stroke="#cfd4ea" strokeWidth="3" />
    </g>
  ),
  direito: (
    <>
      <path d="M48 20v56M33 80h30M21 29h54" />
      <path d="M21 29 10 52a11 8 0 0 0 22 0z" fill="#ffc061" />
      <path d="M75 29 64 52a11 8 0 0 0 22 0z" fill="#ffc061" />
      <circle cx="48" cy="19" r="5" fill="#ffc061" />
    </>
  ),
  psicologia: (
    <>
      <path d="M46 19c-8-4-18 0-19 9-7 2-10 10-6 17-4 6-1 15 7 16 2 8 12 11 18 6z" fill="#ff9cc8" />
      <path d="M50 19c8-4 18 0 19 9 7 2 10 10 6 17 4 6 1 15-7 16-2 8-12 11-18 6z" fill="#ff78b3" />
      <path d="M33 34c4 0 7 3 7 7M30 51c5-2 9 1 10 5M63 34c-4 0-7 3-7 7M66 51c-5-2-9 1-10 5" strokeWidth="2.800" fill="none" />
    </>
  ),
  pedagogia: (
    <>
      <rect x="18" y="68" width="60" height="13" rx="4.500" fill="#ffd15c" />
      <path d="M48 31c-6-6-21-4-21 11 0 13 9 23 16 23 3 0 3-1.500 5-1.500s2 1.500 5 1.500c7 0 16-10 16-23 0-15-15-17-21-11z" fill="#ff5a5a" />
      <path d="M48 31c0-6 2-10 6-13" fill="none" />
      <path d="M53 22c4-5 10-6 14-2-2 5-9 7-14 2z" fill="#4ccf6b" strokeWidth="2.500" />
    </>
  ),
};

export function IconeMateria({ materia, tamanho = 96 }: { materia: string; tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 96 96" stroke={N} strokeWidth={3.500} strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">
      {DESENHOS[materia] ?? DESENHOS.historia}
    </svg>
  );
}
