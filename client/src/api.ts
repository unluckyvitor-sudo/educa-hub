export class ErroApi extends Error {
  constructor(
    mensagem: string,
    readonly status: number,
  ) {
    super(mensagem);
  }
}

/** Chama a API do EducaHub. Lança ErroApi com a mensagem do servidor quando a resposta não é 2xx. */
export async function api<T = unknown>(caminho: string, opcoes: { metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE'; corpo?: unknown } = {}): Promise<T> {
  const { metodo = opcoes.corpo === undefined ? 'GET' : 'POST', corpo } = opcoes;
  let resposta: Response;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: {
        'X-Requested-With': 'educahub',
        ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi('Sem conexão com o servidor. Verifique se ele está ligado.', 0);
  }
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ErroApi(dados?.erro ?? 'Algo deu errado. Tente de novo.', resposta.status);
  return dados as T;
}

export const mensagemDoErro = (erro: unknown) => (erro instanceof Error ? erro.message : 'Algo deu errado. Tente de novo.');
