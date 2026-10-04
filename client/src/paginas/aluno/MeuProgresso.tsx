import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { VisaoProgresso } from '../../componentes/VisaoProgresso';
import type { CadernoDeErros, Progresso } from '../../tipos';

/** O que o aluno errou e ainda não acertou duas vezes seguidas, com o atalho para revisar. */
function Caderno() {
  const { dados } = useCarregar(() => api<CadernoDeErros>('/erros'));
  if (!dados) return null;

  return (
    <section className="cartao">
      <div className="cartao-titulo">
        <Icone nome="atualizar" tamanho={28} style={{ color: '#ff4f9a' }} />
        <h2>Caderno de erros</h2>
        {dados.total > 0 && <span className="etiqueta rosa">{dados.total}</span>}
        {dados.total > 0 && (
          <Link className="botao rosa pequeno acao" to="/jogar/revisao">
            <Icone nome="jogar" tamanho={16} /> Revisar agora
          </Link>
        )}
      </div>
      {dados.total === 0 ? (
        <p className="suave">Nada para revisar. Tudo o que você errar nos jogos e nos duelos aparece aqui, para treinar até dominar.</p>
      ) : (
        <>
          <p className="suave pequeno" style={{ marginBottom: 12 }}>
            Cada questão sai do caderno quando você acerta {dados.paraDominar} vezes seguidas.
          </p>
          <div className="chips" style={{ marginBottom: 14 }}>
            {dados.porMateria.map((m) => (
              <span key={m.id} className="etiqueta">
                {m.nome} · {m.total}
              </span>
            ))}
          </div>
          <ul className="caderno-lista">
            {dados.questoes.slice(0, 8).map((q) => (
              <li key={q.id}>
                <span className="cresce">
                  <strong>{q.enunciado}</strong>
                  <span className="suave pequeno">{[q.materia, q.topico].filter(Boolean).join(' · ')}</span>
                </span>
                <span className="caderno-passos" title={`${q.acertosSeguidos} de ${dados.paraDominar} acertos seguidos`}>
                  {Array.from({ length: dados.paraDominar }, (_, i) => (
                    <i key={i} className={i < q.acertosSeguidos ? 'feito' : ''} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          {dados.total > 8 && <p className="suave pequeno" style={{ marginTop: 10 }}>e mais {dados.total - 8}.</p>}
        </>
      )}
    </section>
  );
}

export function MeuProgresso() {
  const { dados, erro, recarregar } = useCarregar(() => api<Progresso>('/progresso'));
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Meu progresso</h1>
          <p className="subtitulo">Acompanhe sua evolução, seus pontos fortes e onde vale a pena treinar mais.</p>
        </div>
      </div>
      {erro ? (
        <ErroDeCarga erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <div className="coluna" style={{ gap: 20 }}>
          <Caderno />
          <VisaoProgresso progresso={dados} />
        </div>
      )}
    </div>
  );
}
