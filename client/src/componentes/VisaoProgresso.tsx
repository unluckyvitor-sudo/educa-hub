// Painel de desempenho de um aluno — usado em "Meu progresso" e na visão do professor.
import type { CSSProperties, ReactNode } from 'react';
import { coresDaMateria, formatarDia, diaDaSemana, haQuantoTempo, MODOS } from '../visual';
import { Rosca } from './comuns';
import { CartaoSequencia } from './Gamificacao';
import { Icone, Xp } from './Icone';
import { IconeMateria } from './IconeMateria';
import type { AtividadeRecente, Progresso } from '../tipos';

export function Indicador({ icone, valor, rotulo, cor = '#5b5ff0' }: { icone: ReactNode; valor: ReactNode; rotulo: string; cor?: string }) {
  return (
    <div className="indicador" style={{ '--cor': cor } as CSSProperties}>
      <span className="indicador-icone">{icone}</span>
      <div>
        <strong>{valor}</strong>
        <span>{rotulo}</span>
      </div>
    </div>
  );
}

/** Gráfico de barras simples: um valor por dia. */
export function BarrasPorDia({ dias, unidade }: { dias: { dia: string; valor: number }[]; unidade: string }) {
  const maximo = Math.max(1, ...dias.map((d) => d.valor));
  return (
    <div className="grafico" role="img" aria-label={`${unidade} por dia nos últimos ${dias.length} dias`}>
      {dias.map((d) => (
        <div key={d.dia} className="grafico-coluna" title={`${formatarDia(d.dia)}: ${d.valor} ${unidade}`}>
          <span className="grafico-valor">{d.valor > 0 ? d.valor : ''}</span>
          <i style={{ height: `${Math.max(d.valor ? 6 : 2, (d.valor / maximo) * 100)}%` }} className={d.valor ? '' : 'vazia'} />
          <small>{diaDaSemana(d.dia).slice(0, 3)}</small>
        </div>
      ))}
    </div>
  );
}

export function ListaDeAtividades({ atividades, comAluno = false }: { atividades: AtividadeRecente[]; comAluno?: boolean }) {
  if (!atividades.length) return <div className="vazio">Nenhuma atividade registrada ainda.</div>;
  return (
    <ul className="atividades">
      {atividades.map((a) => {
        const fracao = a.total ? a.acertos / a.total : 0;
        return (
          <li key={a.id}>
            <span className={`atividade-nota ${fracao >= 0.9 ? 'otima' : fracao >= 0.6 ? 'boa' : 'fraca'}`}>
              {a.acertos}/{a.total}
            </span>
            <div className="cresce">
              <strong>
                {comAluno && a.aluno ? `${a.aluno} — ` : ''}
                {a.titulo}
              </strong>
              <span className="suave pequeno">
                {a.materia ? `${a.materia} · ` : ''}
                {a.modo === 'revisao' ? 'Caderno de erros' : (MODOS[a.modo]?.nome ?? a.modo)} · {haQuantoTempo(a.quando)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function VisaoProgresso({ progresso }: { progresso: Progresso }) {
  const { nivel, estatisticas: e } = progresso;
  const percentual = progresso.total ? (progresso.concluidas / progresso.total) * 100 : 0;

  return (
    <div className="coluna" style={{ gap: 20 }}>
      <div className="grade-2">
        <section className="cartao lavanda nivel-cartao">
          <Rosca percentual={percentual} tamanho={132} />
          <div className="cresce">
            <span className="etiqueta">Nível {nivel.nivel}</span>
            <h2>{nivel.titulo}</h2>
            <div className="linha" style={{ marginTop: 10 }}>
              <div className="barra cresce">
                <i style={{ width: `${(nivel.xpNoNivel / nivel.xpParaProximo) * 100}%` }} />
              </div>
              <span className="valor pequeno">
                <Xp tamanho={16} /> {nivel.xpNoNivel}/{nivel.xpParaProximo}
              </span>
            </div>
            <p className="suave pequeno" style={{ marginTop: 6 }}>
              {progresso.concluidas} de {progresso.total} atividades concluídas · {progresso.xp} XP no total
            </p>
          </div>
        </section>
        <div className="indicadores">
          <Indicador icone={<Icone nome="jogar" />} valor={e.atividades} rotulo="atividades feitas" />
          <Indicador icone={<Icone nome="alvo" />} valor={`${e.aproveitamento}%`} rotulo="de aproveitamento" cor="#22b573" />
          <Indicador icone={<Icone nome="espadas" />} valor={`${e.vitorias}/${e.duelos}`} rotulo="duelos vencidos" cor="#ff4f9a" />
          <Indicador icone={<Icone nome="trofeu" />} valor={progresso.sequencia.maior} rotulo="maior sequência" cor="#ff8a1a" />
        </div>
      </div>

      <div className="grade-2">
        <section className="cartao">
          <div className="cartao-titulo">
            <h2>Experiência por dia</h2>
          </div>
          <BarrasPorDia dias={progresso.xpPorDia.map((d) => ({ dia: d.dia, valor: d.xp }))} unidade="XP" />
        </section>
        <section className="cartao">
          <div className="cartao-titulo">
            <h2>Sequência de dias</h2>
          </div>
          <CartaoSequencia sequencia={progresso.sequencia} compacto />
        </section>
      </div>

      <div className="grade-2">
        <section className="cartao">
          <div className="cartao-titulo">
            <h2>Por matéria</h2>
          </div>
          <div className="coluna" style={{ gap: 14 }}>
            {progresso.materias.map((m) => {
              const cores = coresDaMateria(m.id);
              return (
                <div key={m.id} className="linha">
                  <span className="materia-mini" style={{ background: cores.claro2 }}>
                    <IconeMateria materia={m.id} tamanho={34} />
                  </span>
                  <div className="cresce">
                    <div className="linha entre">
                      <strong>{m.nome}</strong>
                      <span className="pequeno suave">
                        {m.concluidas}/{m.total}
                        {m.aproveitamento !== null && ` · ${m.aproveitamento}% de acertos`}
                      </span>
                    </div>
                    <div className="barra" style={{ marginTop: 5 }}>
                      <i style={{ width: `${m.total ? (m.concluidas / m.total) * 100 : 0}%`, background: cores.forte }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="cartao">
          <div className="cartao-titulo">
            <h2>Atividades recentes</h2>
          </div>
          <ListaDeAtividades atividades={progresso.recentes} />
        </section>
      </div>
    </div>
  );
}
