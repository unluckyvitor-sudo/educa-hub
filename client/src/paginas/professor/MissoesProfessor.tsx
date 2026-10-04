import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { FormMissao } from './FormMissao';
import { CartaoMissaoProfessor } from './TurmaDetalhe';
import type { MissaoProfessor, Turma } from '../../tipos';

export function MissoesProfessor() {
  const { dados, erro, recarregar } = useCarregar(async () => {
    const [missoes, turmas] = await Promise.all([api<{ missoes: MissaoProfessor[] }>('/prof/missoes'), api<{ turmas: Turma[] }>('/prof/turmas')]);
    return { missoes: missoes.missoes, turmas: turmas.turmas };
  });
  const [criando, setCriando] = useState(false);

  const ativas = dados?.missoes.filter((m) => m.ativa) ?? [];
  const encerradas = dados?.missoes.filter((m) => !m.ativa) ?? [];

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Missões</h1>
          <p className="subtitulo">Proponha desafios diários ou semanais e veja quem já concluiu.</p>
        </div>
        {dados && dados.turmas.length > 0 && (
          <div className="acoes">
            <button className="botao rosa" onClick={() => setCriando(true)}>
              <Icone nome="mais" tamanho={18} /> Nova missão
            </button>
          </div>
        )}
      </div>

      {erro ? (
        <ErroDeCarga erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : dados.turmas.length === 0 ? (
        <section className="cartao">
          <Vazio titulo="Crie uma turma primeiro">
            As missões são enviadas para os alunos de uma turma.{' '}
            <Link className="link" to="/turmas">
              Ir para Minhas turmas
            </Link>
          </Vazio>
        </section>
      ) : (
        <div className="coluna" style={{ gap: 20 }}>
          <section className="cartao">
            <div className="cartao-titulo">
              <h2>Em andamento</h2>
              <span className="etiqueta verde">{ativas.length}</span>
            </div>
            {ativas.length === 0 ? (
              <Vazio titulo="Nenhuma missão ativa">Que tal propor um desafio para esta semana?</Vazio>
            ) : (
              <div className="coluna" style={{ gap: 12 }}>
                {ativas.map((m) => (
                  <CartaoMissaoProfessor key={m.id} missao={m} aoExcluir={recarregar} />
                ))}
              </div>
            )}
          </section>
          {encerradas.length > 0 && (
            <section className="cartao">
              <div className="cartao-titulo">
                <h2>Encerradas nos últimos 30 dias</h2>
              </div>
              <div className="coluna" style={{ gap: 12 }}>
                {encerradas.map((m) => (
                  <CartaoMissaoProfessor key={m.id} missao={m} aoExcluir={recarregar} />
                ))}
              </div>
            </section>
          )}
          <FormMissao aberto={criando} aoFechar={() => setCriando(false)} aoCriar={recarregar} turmas={dados.turmas} />
        </div>
      )}
    </div>
  );
}
