import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useEstado } from '../../estado';
import { EVENTO_PRESENCA } from '../../tempoReal';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../../componentes/comuns';
import { ListaRanking } from '../../componentes/Gamificacao';
import { Icone } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import { Indicador, ListaDeAtividades } from '../../componentes/VisaoProgresso';
import { Saudacao } from '../aluno/Inicio';
import type { AtividadeRecente, PosicaoRanking, ResumoUsuario } from '../../tipos';

interface Resumo {
  turmas: number;
  alunos: number;
  online: ResumoUsuario[];
  atividadesHoje: number;
  ativosNaSemana: number;
  missoesAtivas: number;
  destaques: PosicaoRanking[];
  recentes: AtividadeRecente[];
}

export function PainelProfessor() {
  const usuario = useEstado((e) => e.usuario)!;
  const { dados, erro, recarregar } = useCarregar(() => api<Resumo>('/prof/resumo'));

  // Atualiza quando um aluno entra ou sai, e também a cada meio minuto.
  useEffect(() => {
    window.addEventListener(EVENTO_PRESENCA, recarregar);
    const relogio = window.setInterval(recarregar, 30000);
    return () => {
      window.removeEventListener(EVENTO_PRESENCA, recarregar);
      window.clearInterval(relogio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Saudacao nome={usuario.nome.split(' ')[0]} legenda={usuario.disciplinas ? `Professor(a) de ${usuario.disciplinas}` : 'Painel do professor'} />
      <div className="pagina">
        {erro ? (
          <ErroDeCarga erro={erro} />
        ) : !dados ? (
          <Carregando />
        ) : (
          <div className="coluna" style={{ gap: 20 }}>
            <div className="indicadores largos">
              <Indicador icone={<Icone nome="chapeu" />} valor={dados.turmas} rotulo={dados.turmas === 1 ? 'turma' : 'turmas'} />
              <Indicador icone={<Icone nome="usuarios" />} valor={dados.alunos} rotulo="alunos" cor="#2f8bff" />
              <Indicador icone={<Icone nome="olho" />} valor={dados.online.length} rotulo="online agora" cor="#22b573" />
              <Indicador icone={<Icone nome="jogar" />} valor={dados.atividadesHoje} rotulo="atividades hoje" cor="#ff4f9a" />
              <Indicador icone={<Icone nome="calendario" />} valor={dados.ativosNaSemana} rotulo="ativos na semana" cor="#ff8a1a" />
              <Indicador icone={<Icone nome="alvo" />} valor={dados.missoesAtivas} rotulo="missões ativas" cor="#7c4dff" />
            </div>

            {dados.turmas === 0 && (
              <section className="cartao lavanda">
                <Vazio titulo="Comece criando sua primeira turma">
                  Reúna os alunos de cada sala, ano ou curso com um código de acesso.
                  <div style={{ marginTop: 14 }}>
                    <Link className="botao" to="/turmas">
                      <Icone nome="mais" tamanho={18} /> Criar turma
                    </Link>
                  </div>
                </Vazio>
              </section>
            )}

            <div className="grade-2">
              <section className="cartao">
                <div className="cartao-titulo">
                  <span className="pulso" />
                  <h2>Online agora</h2>
                  <span className="etiqueta verde acao">{dados.online.length}</span>
                </div>
                {dados.online.length === 0 ? (
                  <p className="suave">Nenhum aluno conectado neste momento.</p>
                ) : (
                  <div className="online-grade">
                    {dados.online.map((a) => (
                      <Link key={a.id} to={`/alunos/${a.id}`} className="online-item" title={`${a.nome} — ver desempenho`}>
                        <Retrato avatar={a.avatar} tamanho={58} online />
                        <span>{a.nome.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="cartao">
                <div className="cartao-titulo">
                  <Icone nome="trofeu" tamanho={28} style={{ color: '#ffab1a' }} />
                  <h2>Destaques da semana</h2>
                  <Link className="link acao" to="/turmas">
                    Ver turmas
                  </Link>
                </div>
                <ListaRanking ranking={dados.destaques} vazio="Seus alunos ainda não pontuaram nesta semana." />
              </section>
            </div>

            <section className="cartao">
              <div className="cartao-titulo">
                <Icone nome="relogio" tamanho={28} style={{ color: '#5b5ff0' }} />
                <h2>Atividade recente dos alunos</h2>
              </div>
              <ListaDeAtividades atividades={dados.recentes} comAluno />
            </section>
          </div>
        )}
      </div>
    </>
  );
}
