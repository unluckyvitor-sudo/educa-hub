import { useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { coresDaMateria, MODOS } from '../../visual';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { IconeMateria } from '../../componentes/IconeMateria';
import type { Modo, Topico } from '../../tipos';

const ICONE_MODO: Record<Modo, string> = { quiz: 'raio', vf: 'vf', memoria: 'cartas' };

function CartaoTopico({ topico, numero }: { topico: Topico; numero: number }) {
  const [aberto, setAberto] = useState(false);
  return (
    <article className="topico">
      <header className="topico-cabecalho">
        <span className="topico-numero">{numero}</span>
        <div className="cresce">
          <h3>{topico.titulo}</h3>
          <div className="topico-estrelas" aria-label={`${topico.concluidas} de 3 jogos concluídos`}>
            {[0, 1, 2].map((i) => (
              <Icone key={i} nome="estrela" tamanho={20} className={i < topico.concluidas ? 'cheia' : ''} />
            ))}
          </div>
        </div>
        <button className="botao claro pequeno" onClick={() => setAberto(!aberto)} aria-expanded={aberto}>
          <Icone nome="livro" tamanho={16} /> {aberto ? 'Fechar resumo' : 'Ler resumo'}
        </button>
      </header>
      {aberto && <p className="topico-resumo">{topico.resumo}</p>}
      <div className="modos">
        {(Object.keys(MODOS) as Modo[]).map((modo) => {
          const melhor = topico.modos[modo];
          return (
            <Link key={modo} to={`/jogar/${topico.id}/${modo}`} className="modo" style={{ '--cor': MODOS[modo].cor } as CSSProperties}>
              <span className="modo-icone">
                <Icone nome={ICONE_MODO[modo]} tamanho={26} />
              </span>
              <span className="cresce">
                <strong>{MODOS[modo].nome}</strong>
                <small>{melhor > 0 ? `Melhor resultado: ${melhor}%` : MODOS[modo].descricao}</small>
              </span>
              {melhor >= 60 ? <Icone nome="check" tamanho={22} className="modo-feito" /> : <Icone nome="jogar" tamanho={20} />}
            </Link>
          );
        })}
      </div>
    </article>
  );
}

export function Materia() {
  const { materiaId = '' } = useParams();
  const { dados, erro } = useCarregar(() => api<{ materia: { id: string; nome: string }; topicos: Topico[] }>(`/materias/${materiaId}`), [materiaId]);
  const cores = coresDaMateria(materiaId);

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;

  const total = dados.topicos.length * 3;
  const concluidas = dados.topicos.reduce((soma, t) => soma + t.concluidas, 0);

  return (
    <div className="pagina">
      <Link to="/materias" className="voltar">
        <Icone nome="voltar" tamanho={20} /> Minhas matérias
      </Link>
      <section className="materia-topo" style={{ background: `linear-gradient(120deg, ${cores.claro}, ${cores.claro2})` }}>
        <IconeMateria materia={materiaId} tamanho={120} />
        <div className="cresce">
          <h1>{dados.materia.nome}</h1>
          <p>
            {concluidas} de {total} atividades concluídas
          </p>
          <div className="barra" style={{ maxWidth: 420, marginTop: 10, background: 'rgba(255,255,255,0.7)' }}>
            <i style={{ width: `${total ? (concluidas / total) * 100 : 0}%`, background: cores.forte }} />
          </div>
        </div>
      </section>
      <div className="coluna" style={{ marginTop: 22 }}>
        {dados.topicos.map((t, i) => (
          <CartaoTopico key={t.id} topico={t} numero={i + 1} />
        ))}
      </div>
    </div>
  );
}
