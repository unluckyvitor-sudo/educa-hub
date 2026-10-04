import { useEffect, useState } from 'react';
import type { AvatarConfig } from '../gato/modelo';
import { chaveDoAvatar, pedirRetrato, retratoPronto } from '../gato/cena';
import { fundoDoAvatar } from '../visual';

interface Props {
  avatar: AvatarConfig;
  tamanho?: number;
  /** Mostra a bolinha de presença (verde = online). */
  online?: boolean;
  className?: string;
}

/** Retrato estático do avatar (imagem gerada uma vez e guardada em cache). */
export function Retrato({ avatar, tamanho = 46, online, className = '' }: Props) {
  const chave = chaveDoAvatar(avatar);
  const [imagem, setImagem] = useState(() => retratoPronto(avatar));

  useEffect(() => {
    const pronta = retratoPronto(avatar);
    if (pronta) {
      setImagem(pronta);
      return;
    }
    let ativo = true;
    pedirRetrato(avatar, (url) => ativo && setImagem(url));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return (
    <span className={`retrato ${className}`} style={{ width: tamanho, height: tamanho, background: fundoDoAvatar(avatar.fundo) }}>
      {imagem && <img src={imagem} alt="" />}
      {online !== undefined && <i className={`ponto ${online ? 'on' : ''}`} />}
    </span>
  );
}
