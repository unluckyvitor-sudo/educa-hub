// Limites de uso em memória: freiam força bruta, spam e abuso sem depender de serviços externos.
// Cada chave ("login|ip|usuario", "chamado|u12"...) tem um contador que zera ao fim da janela.

const contadores = new Map(); // chave → { n, ate }

function contadorDe(chave) {
  const c = contadores.get(chave);
  if (c && Date.now() <= c.ate) return c;
  contadores.delete(chave);
  return null;
}

/** O limite da chave já foi atingido? (não conta um uso) */
export function limiteAtingido(chave, max) {
  return (contadorDe(chave)?.n ?? 0) >= max;
}

/** Conta um uso da chave dentro da janela. */
export function contarUso(chave, janelaMs) {
  const c = contadorDe(chave);
  if (c) c.n += 1;
  else contadores.set(chave, { n: 1, ate: Date.now() + janelaMs });
}

/** Conta um uso e devolve false quando ele passa do limite da janela. */
export function dentroDoLimite(chave, max, janelaMs) {
  if (limiteAtingido(chave, max)) return false;
  contarUso(chave, janelaMs);
  return true;
}

export function zerarLimite(chave) {
  contadores.delete(chave);
}

// Sem esta limpeza, um atacante encheria a memória variando as chaves.
setInterval(() => {
  const agora = Date.now();
  for (const [chave, c] of contadores) if (agora > c.ate) contadores.delete(chave);
}, 60 * 1000).unref();

/**
 * Middleware: no máximo `max` chamadas por janela, por usuário logado (ou por IP, para quem não entrou).
 * O limite por usuário não atrapalha uma sala inteira que usa a mesma rede.
 */
export const limitar = (nome, max, janelaMs, mensagem = 'Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.') =>
  (req, res, proximo) => {
    const quem = req.usuario ? `u${req.usuario.id}` : `ip${req.ip}`;
    if (!dentroDoLimite(`${nome}|${quem}`, max, janelaMs)) return res.status(429).json({ erro: mensagem });
    proximo();
  };

export const MINUTO = 60 * 1000;
export const HORA = 60 * MINUTO;
