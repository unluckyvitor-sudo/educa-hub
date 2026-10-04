import { lazy, Suspense } from 'react';
import type { PropsDoGato } from './avatar';

// O gato usa o Three.js, que sozinho é mais da metade do código da plataforma. Carregado à parte,
// a página aparece primeiro (formulário de entrada, painel) e o gato chega logo em seguida.
const Gato3d = lazy(() => import('./GatoVivo3d').then((m) => ({ default: m.GatoVivo })));

/** Gato 3D animado em tempo real. Use poucos por página; para listas, prefira <Retrato>. */
export function GatoVivo(props: PropsDoGato) {
  return (
    <Suspense fallback={<div className={props.className} aria-hidden="true" />}>
      <Gato3d {...props} />
    </Suspense>
  );
}
