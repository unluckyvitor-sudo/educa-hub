import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useEstado } from '../estado';
import { mensagemDoErro } from '../api';

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="carregando">
      <div className="centro">
        <i style={{ display: 'block', margin: '0 auto 10px' }} />
        {texto}
      </div>
    </div>
  );
}

export function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="vazio">
      <strong>{titulo}</strong>
      {children}
    </div>
  );
}

interface ModalProps {
  aberto: boolean;
  aoFechar?: () => void;
  largo?: boolean;
  children: ReactNode;
}

export function Modal({ aberto, aoFechar, largo, children }: ModalProps) {
  useEffect(() => {
    if (!aberto || !aoFechar) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberto, aoFechar]);

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <motion.div className="modal-fundo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && aoFechar?.()}>
          <motion.div
            className={`modal ${largo ? 'largo' : ''}`}
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.86, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Avisos() {
  const avisos = useEstado((e) => e.avisos);
  const fechar = useEstado((e) => e.fecharAviso);
  return createPortal(
    <div className="avisos" role="status">
      <AnimatePresence>
        {avisos.map((a) => (
          <motion.div key={a.id} className={`aviso ${a.tipo}`} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} onClick={() => fechar(a.id)}>
            {a.texto}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

/** Medidor circular de progresso, como o do painel inicial. */
export function Rosca({ percentual, tamanho = 148, cor = '#5b5ff0' }: { percentual: number; tamanho?: number; cor?: string }) {
  const raio = 54;
  const volta = 2 * Math.PI * raio;
  return (
    <div className="rosca" style={{ width: tamanho, height: tamanho }}>
      <svg viewBox="0 0 140 140" width={tamanho} height={tamanho}>
        <circle cx="70" cy="70" r={raio} fill="none" stroke="#dcdcf7" strokeWidth="13" />
        <motion.circle
          cx="70"
          cy="70"
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={volta}
          initial={{ strokeDashoffset: volta }}
          animate={{ strokeDashoffset: volta * (1 - Math.min(percentual, 100) / 100) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <strong>{Math.round(percentual)}%</strong>
    </div>
  );
}

/**
 * Carrega dados de uma rota ao montar o componente.
 * Devolve os dados, o erro (se houver) e uma função para recarregar.
 */
export function useCarregar<T>(buscar: () => Promise<T>, dependencias: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    buscar()
      .then((d) => ativo && (setDados(d), setErro(null)))
      .catch((e) => ativo && setErro(mensagemDoErro(e)));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, versao]);

  return { dados, erro, recarregar: () => setVersao((v) => v + 1), definir: setDados };
}

export function ErroDeCarga({ erro }: { erro: string }) {
  return (
    <div className="vazio">
      <strong>Ops!</strong>
      {erro}
    </div>
  );
}
