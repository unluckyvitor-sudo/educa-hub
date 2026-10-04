import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GatoVivo } from '../gato/GatoVivo';
import { AVATAR_PADRAO, type Animacao } from '../gato/avatar';
import { Coroa } from './Rabiscos';

const REACOES: { animacao: Animacao; fala: string }[] = [
  { animacao: 'acenar', fala: 'Miau! Vamos aprender algo novo hoje?' },
  { animacao: 'comemorar', fala: 'Você consegue! Eu acredito em você!' },
  { animacao: 'dancar', fala: 'Estudar jogando é muito mais divertido!' },
  { animacao: 'pensar', fala: 'Sabia que errar também ensina?' },
  { animacao: 'surpreso', fala: 'Uau! Você clicou em mim!' },
  { animacao: 'acenar', fala: 'Jogue todo dia para manter sua sequência!' },
];

/** O gato mascote do painel: acompanha o mouse e reage a cliques com falas. */
export function Mascote({ falaInicial }: { falaInicial?: string }) {
  const [animacao, setAnimacao] = useState<Animacao>('acenar');
  const [fala, setFala] = useState<string | null>(falaInicial ?? null);
  const proxima = useRef(0);
  const relogio = useRef<number | undefined>(undefined);

  const agendarDescanso = (ms: number) => {
    window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(() => {
      setAnimacao('parado');
      setFala(null);
    }, ms);
  };

  useEffect(() => {
    agendarDescanso(falaInicial ? 5200 : 2600);
    return () => window.clearTimeout(relogio.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reagir = () => {
    const reacao = REACOES[proxima.current++ % REACOES.length];
    setAnimacao(reacao.animacao);
    setFala(reacao.fala);
    agendarDescanso(3600);
  };

  return (
    <div className="mascote">
      <svg className="mascote-brilhos" viewBox="0 0 360 330" fill="none" strokeWidth="9" strokeLinecap="round" aria-hidden="true">
        <path d="M34 96l18 20M12 150l26 8" stroke="#ffc93c" />
        <path d="M20 206l26-6M30 240l22-16" stroke="#ff4f9a" />
        <path d="M330 196l-24 8M344 232l-26 2" stroke="#2f8bff" />
      </svg>
      <Coroa className="mascote-coroa" cor="#5b3df0" tamanho={84} />
      <AnimatePresence>
        {fala && (
          <motion.div className="mascote-fala" key={fala} initial={{ opacity: 0, scale: 0.7, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 420, damping: 24 }}>
            {fala}
          </motion.div>
        )}
      </AnimatePresence>
      <GatoVivo className="mascote-gato" avatar={AVATAR_PADRAO} animacao={animacao} enquadramento="busto" seguirMouse onClick={reagir} />
    </div>
  );
}
