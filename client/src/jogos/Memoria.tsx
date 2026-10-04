import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { api, mensagemDoErro } from '../api';
import { avisar } from '../estado';
import { tocar } from '../sons';

export interface Carta {
  id: string;
  tipo: 'pergunta' | 'resposta';
  texto: string;
}

interface Props {
  partida: string;
  cartas: Carta[];
  aoResponder: (acertou: boolean) => void;
  aoTerminar: () => void;
}

/** Jogo da memória: cada par é formado por uma pergunta (carta azul) e sua resposta (carta rosa). */
export function Memoria({ partida, cartas, aoResponder, aoTerminar }: Props) {
  const [viradas, setViradas] = useState<string[]>([]);
  const [achadas, setAchadas] = useState<Set<string>>(new Set());
  const [tentativas, setTentativas] = useState(0);
  const [dica, setDica] = useState<string | null>(null);
  const [tremer, setTremer] = useState<string | null>(null);
  const ocupado = useRef(false);

  const virar = async (carta: Carta) => {
    if (ocupado.current || achadas.has(carta.id) || viradas.includes(carta.id)) return;
    const primeira = cartas.find((c) => c.id === viradas[0]);
    // A segunda carta precisa ser do outro tipo: pergunta com resposta.
    if (primeira && primeira.tipo === carta.tipo) {
      setTremer(carta.id);
      setTimeout(() => setTremer(null), 400);
      return;
    }
    tocar('virar');
    if (!primeira) return setViradas([carta.id]);

    ocupado.current = true;
    setViradas([primeira.id, carta.id]);
    setTentativas((t) => t + 1);
    try {
      const { par, explicacao } = await api<{ par: boolean; explicacao: string | null }>(`/jogos/${partida}/par`, { corpo: { a: primeira.id, b: carta.id } });
      aoResponder(par);
      tocar(par ? 'acerto' : 'erro');
      if (par) {
        const novas = new Set(achadas).add(primeira.id).add(carta.id);
        setAchadas(novas);
        setViradas([]);
        setDica(explicacao);
        ocupado.current = false;
        if (novas.size === cartas.length) setTimeout(aoTerminar, 900);
      } else {
        setTimeout(() => {
          setViradas([]);
          ocupado.current = false;
        }, 1100);
      }
    } catch (erro) {
      avisar(mensagemDoErro(erro), 'erro');
      setViradas([]);
      ocupado.current = false;
    }
  };

  return (
    <div className="memoria">
      <div className="quiz-topo">
        <span className="etiqueta verde">
          Pares: {achadas.size / 2} de {cartas.length / 2}
        </span>
        <span className="etiqueta cinza">Tentativas: {tentativas}</span>
        <span className="suave pequeno">Vire uma carta azul (pergunta) e uma rosa (resposta).</span>
      </div>
      <div className="memoria-grade">
        {cartas.map((carta, i) => {
          const aberta = viradas.includes(carta.id) || achadas.has(carta.id);
          return (
            <motion.button
              key={carta.id}
              className={`carta ${carta.tipo} ${aberta ? 'aberta' : ''} ${achadas.has(carta.id) ? 'achada' : ''} ${tremer === carta.id ? 'tremer' : ''}`}
              onClick={() => void virar(carta)}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.035, type: 'spring', stiffness: 300, damping: 20 }}
              aria-label={aberta ? carta.texto : `Carta de ${carta.tipo} fechada`}
            >
              <span className="carta-miolo">
                <span className="carta-verso">{carta.tipo === 'pergunta' ? '?' : '!'}</span>
                <span className="carta-frente">{carta.texto}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
      {dica && <div className="quiz-retorno acerto">{dica}</div>}
    </div>
  );
}
