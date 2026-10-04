import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api, mensagemDoErro } from '../api';
import { avisar } from '../estado';
import { tocar } from '../sons';
import { Icone } from '../componentes/Icone';

export interface ItemDeJogo {
  enunciado: string;
  /** Presente no quiz de múltipla escolha. */
  alternativas?: string[];
  /** Presente no verdadeiro ou falso: a resposta proposta. */
  afirmacao?: string;
  revisao: boolean;
}

interface Retorno {
  acertou: boolean;
  gabarito: number | boolean;
  correta: string;
  explicacao: string | null;
}

interface Props {
  partida: string;
  itens: ItemDeJogo[];
  tempo: number;
  aoResponder: (acertou: boolean) => void;
  aoTerminar: () => void;
}

const LETRAS = ['A', 'B', 'C', 'D'];

/** Quiz de múltipla escolha e Verdadeiro ou Falso: uma questão por vez, com tempo e correção imediata. */
export function Quiz({ partida, itens, tempo, aoResponder, aoTerminar }: Props) {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<number | boolean | null | undefined>(undefined);
  const [retorno, setRetorno] = useState<Retorno | null>(null);
  const [restante, setRestante] = useState(tempo);
  const [acertos, setAcertos] = useState(0);
  const [sequencia, setSequencia] = useState(0);
  const enviando = useRef(false);
  const item = itens[indice];
  const vf = item.afirmacao !== undefined;

  const responder = useCallback(
    async (resposta: number | boolean | null) => {
      if (enviando.current) return;
      enviando.current = true;
      setEscolha(resposta);
      try {
        const r = await api<Retorno>(`/jogos/${partida}/responder`, { corpo: { indice, resposta } });
        setRetorno(r);
        setAcertos((a) => a + (r.acertou ? 1 : 0));
        setSequencia((s) => (r.acertou ? s + 1 : 0));
        tocar(r.acertou ? 'acerto' : 'erro');
        aoResponder(r.acertou);
      } catch (erro) {
        avisar(mensagemDoErro(erro), 'erro');
        enviando.current = false;
        setEscolha(undefined);
      }
    },
    [partida, indice, aoResponder],
  );

  const avancar = useCallback(() => {
    if (indice + 1 >= itens.length) return aoTerminar();
    enviando.current = false;
    setIndice(indice + 1);
    setEscolha(undefined);
    setRetorno(null);
    setRestante(tempo);
  }, [indice, itens.length, tempo, aoTerminar]);

  // Cronômetro da questão
  useEffect(() => {
    if (escolha !== undefined) return;
    const inicio = Date.now();
    const relogio = window.setInterval(() => {
      const falta = tempo - (Date.now() - inicio) / 1000;
      setRestante(Math.max(0, falta));
      if (falta <= 0) {
        window.clearInterval(relogio);
        void responder(null);
      }
    }, 100);
    return () => window.clearInterval(relogio);
  }, [indice, escolha, tempo, responder]);

  // Atalhos: 1–4 ou A–D para responder; V/F no verdadeiro ou falso.
  // (Enter continua para a próxima questão porque o botão "Continuar" recebe o foco.)
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (escolha !== undefined) return;
      if (vf) {
        if (k === 'v') void responder(true);
        if (k === 'f') void responder(false);
        return;
      }
      const n = '1234'.includes(k) ? Number(k) - 1 : 'abcd'.indexOf(k);
      if (n >= 0 && n < (item.alternativas?.length ?? 0)) void responder(n);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [escolha, vf, item, responder]);

  const classeDaAlternativa = (valor: number | boolean) => {
    if (!retorno) return escolha === valor ? 'escolhida' : '';
    if (retorno.gabarito === valor) return 'certa';
    if (escolha === valor) return 'errada';
    return 'apagada';
  };

  return (
    <div className="quiz">
      <div className="quiz-topo">
        <div className="quiz-passos">
          {itens.map((_, i) => (
            <i key={i} className={i < indice ? 'feito' : i === indice ? 'atual' : ''} />
          ))}
        </div>
        <span className="etiqueta verde">
          <Icone nome="check" tamanho={14} /> {acertos}
        </span>
        {sequencia >= 2 && (
          <motion.span key={sequencia} className="etiqueta amarela" initial={{ scale: 1.6 }} animate={{ scale: 1 }}>
            {sequencia} seguidas!
          </motion.span>
        )}
      </div>

      <div className={`quiz-tempo ${restante < tempo * 0.25 ? 'urgente' : ''}`}>
        <i style={{ width: `${(restante / tempo) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={indice} className="quiz-cartao" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.22 }}>
          <div className="linha quebra" style={{ gap: 8 }}>
            <span className="etiqueta">
              Questão {indice + 1} de {itens.length}
            </span>
            {item.revisao && <span className="etiqueta cinza">Revisão</span>}
          </div>
          <h2 className="quiz-enunciado">{item.enunciado}</h2>

          {vf ? (
            <>
              <div className="vf-afirmacao">
                <small>Resposta proposta</small>
                {item.afirmacao}
              </div>
              <div className="vf-botoes">
                <button className={`vf-botao verdadeiro ${classeDaAlternativa(true)}`} disabled={escolha !== undefined} onClick={() => void responder(true)}>
                  <Icone nome="check" tamanho={30} /> Verdadeiro
                </button>
                <button className={`vf-botao falso ${classeDaAlternativa(false)}`} disabled={escolha !== undefined} onClick={() => void responder(false)}>
                  <Icone nome="x" tamanho={30} /> Falso
                </button>
              </div>
            </>
          ) : (
            <div className="alternativas">
              {item.alternativas!.map((texto, i) => (
                <button key={i} className={`alternativa a${i} ${classeDaAlternativa(i)}`} disabled={escolha !== undefined} onClick={() => void responder(i)}>
                  <span className="alternativa-letra">{LETRAS[i]}</span>
                  <span className="cresce">{texto}</span>
                  {retorno && retorno.gabarito === i && <Icone nome="check" tamanho={24} />}
                  {retorno && escolha === i && retorno.gabarito !== i && <Icone nome="x" tamanho={24} />}
                </button>
              ))}
            </div>
          )}

          {retorno && (
            <motion.div className={`quiz-retorno ${retorno.acertou ? 'acerto' : 'erro'}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="cresce">
                <strong>{retorno.acertou ? 'Isso mesmo!' : escolha === null ? 'O tempo acabou!' : 'Não foi dessa vez.'}</strong>
                {!retorno.acertou && <p>Resposta certa: {retorno.correta}</p>}
                {retorno.explicacao && <p>{retorno.explicacao}</p>}
              </div>
              <button className={`botao ${retorno.acertou ? 'verde' : ''}`} onClick={avancar} autoFocus>
                {indice + 1 >= itens.length ? 'Ver resultado' : 'Continuar'} <Icone nome="seta" tamanho={18} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
