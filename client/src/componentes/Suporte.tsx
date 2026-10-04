// Peças comuns às telas de suporte: situação do chamado, nota em estrelas e a linha de um chamado na lista.
import { Link } from 'react-router-dom';
import { haQuantoTempo } from '../visual';
import { Icone } from './Icone';
import type { Chamado, StatusChamado } from '../tipos';

const SITUACOES: Record<StatusChamado, { autor: [string, string]; atendente: [string, string] }> = {
  aberto: { autor: ['Aguardando resposta', 'amarela'], atendente: ['Aguardando você', 'rosa'] },
  respondido: { autor: ['Respondido', 'verde'], atendente: ['Respondido', 'verde'] },
  resolvido: { autor: ['Resolvido', 'cinza'], atendente: ['Resolvido', 'cinza'] },
};

/** Etiqueta com a situação do chamado, do ponto de vista de quem pediu ajuda ou de quem atende. */
export function Situacao({ status, visao }: { status: StatusChamado; visao: 'autor' | 'atendente' }) {
  const [rotulo, cor] = SITUACOES[status][visao];
  return <span className={`etiqueta ${cor}`}>{rotulo}</span>;
}

const NOTAS = ['Muito ruim', 'Ruim', 'Mais ou menos', 'Bom', 'Excelente'];

/** Nota de 1 a 5 estrelas. Com `aoEscolher`, vira um seletor; sem ele, só mostra a nota. */
export function Estrelas({ nota, aoEscolher, tamanho = 26 }: { nota: number | null; aoEscolher?: (nota: number) => void; tamanho?: number }) {
  return (
    <span className={`estrelas ${aoEscolher ? 'clicavel' : ''}`} role={aoEscolher ? 'radiogroup' : 'img'} aria-label={nota ? `Nota ${nota} de 5` : 'Sem nota'}>
      {[1, 2, 3, 4, 5].map((n) =>
        aoEscolher ? (
          <button key={n} type="button" className={nota != null && n <= nota ? 'cheia' : ''} onClick={() => aoEscolher(n)} role="radio" aria-checked={nota === n} aria-label={`${n} — ${NOTAS[n - 1]}`} title={NOTAS[n - 1]}>
            <Icone nome="estrela" tamanho={tamanho} />
          </button>
        ) : (
          <i key={n} className={nota != null && n <= nota ? 'cheia' : ''}>
            <Icone nome="estrela" tamanho={tamanho} />
          </i>
        ),
      )}
    </span>
  );
}

/** Um chamado na lista: assunto, situação, trecho da última mensagem e aviso de mensagens novas. */
export function LinhaChamado({ chamado, visao, para, mostrarDestino = false }: { chamado: Chamado; visao: 'autor' | 'atendente'; para: string; mostrarDestino?: boolean }) {
  return (
    <Link to={para} className={`chamado-linha ${chamado.novas > 0 ? 'com-novas' : ''}`}>
      <span className="chamado-icone">
        <Icone nome="mensagem" tamanho={24} />
        {chamado.novas > 0 && <b>{chamado.novas}</b>}
      </span>
      <span className="cresce chamado-texto">
        <strong>{chamado.assunto}</strong>
        <span className="suave pequeno">
          {visao === 'atendente' && chamado.autor ? `${chamado.autor.nome} · ` : ''}
          {chamado.categoriaNome}
          {visao === 'autor' ? ` · ${chamado.atendente}` : mostrarDestino && chamado.paraProfessor ? ` · para Prof. ${chamado.atendente}` : ''}
        </span>
        {chamado.ultimaMensagem && <span className="chamado-trecho">{chamado.ultimaMensagem}</span>}
      </span>
      <span className="chamado-lado">
        <Situacao status={chamado.status} visao={visao} />
        <small className="suave">{haQuantoTempo(chamado.atualizadoEm)}</small>
      </span>
    </Link>
  );
}
