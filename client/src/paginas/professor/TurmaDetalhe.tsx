import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar, useEstado } from '../../estado';
import { EVENTO_PRESENCA } from '../../tempoReal';
import { formatarDia, haQuantoTempo } from '../../visual';
import { Carregando, ErroDeCarga, Modal, Vazio, useCarregar } from '../../componentes/comuns';
import { ListaRanking, Recompensa } from '../../componentes/Gamificacao';
import { Icone, Chama } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import { ListaDeAtividades } from '../../componentes/VisaoProgresso';
import { EditarMissao, FormMissao } from './FormMissao';
import { FormAoVivo } from '../AoVivo';
import { useAoVivo } from '../../aoVivo';
import { copiarCodigo } from './Turmas';
import type { AtividadeRecente, Dificuldade, Estatisticas, MissaoProfessor, PosicaoRanking, ResumoUsuario, Turma } from '../../tipos';

interface Membro extends ResumoUsuario {
  online: boolean;
  vistoEm: string | null;
  ultimoDiaAtivo: string | null;
  xpSemana: number;
  estatisticas: Estatisticas;
}

interface Dados {
  turma: Turma;
  membros: Membro[];
  missoes: MissaoProfessor[];
  materias: { id: string; nome: string }[];
  recentes: AtividadeRecente[];
  ranking: { semana: PosicaoRanking[]; total: PosicaoRanking[] };
}

type Aba = 'alunos' | 'ranking' | 'missoes' | 'atividade' | 'dificuldades';

/** Questões em que a turma mais erra — o que vale retomar em sala. */
function Dificuldades({ turmaId }: { turmaId: number }) {
  const { dados, erro } = useCarregar(() => api<{ questoes: Dificuldade[] }>(`/prof/turmas/${turmaId}/dificuldades`), [turmaId]);
  if (erro) return <ErroDeCarga erro={erro} />;
  if (!dados) return <Carregando />;
  if (!dados.questoes.length) {
    return <Vazio titulo="Ainda sem dados suficientes">Quando os alunos responderem mais questões nos jogos e duelos, as que eles mais erram aparecem aqui.</Vazio>;
  }
  return (
    <ol className="dificuldades">
      {dados.questoes.map((q) => (
        <li key={q.id}>
          <div className="cresce">
            <strong>{q.enunciado}</strong>
            <span className="suave pequeno">
              {[q.materia, q.topico].filter(Boolean).join(' · ')} · resposta certa: <b>{q.correta}</b>
            </span>
            <div className="linha" style={{ marginTop: 6 }}>
              <div className="barra cresce">
                <i style={{ width: `${q.taxa}%`, background: q.taxa >= 60 ? '#ef4b6c' : '#ffab1a' }} />
              </div>
              <span className="pequeno forte">{q.taxa}% de erro</span>
            </div>
          </div>
          <span className="suave pequeno dificuldade-lado">
            {q.erros} {q.erros === 1 ? 'erro' : 'erros'} em {q.respostas} respostas
            <br />
            {q.alunos} {q.alunos === 1 ? 'aluno' : 'alunos'}
          </span>
        </li>
      ))}
    </ol>
  );
}
const TIPOS: Record<MissaoProfessor['tipo'], string> = { atividades: 'atividades', acertos: 'acertos', quiz: 'Quiz' };

export function CartaoMissaoProfessor({ missao, aoExcluir }: { missao: MissaoProfessor; aoExcluir: () => void }) {
  const [editando, setEditando] = useState(false);
  const excluir = async () => {
    if (!window.confirm(`Excluir a missão "${missao.titulo}"?`)) return;
    try {
      await api(`/prof/missoes/${missao.id}`, { metodo: 'DELETE' });
      aoExcluir();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };
  const percentual = missao.participantes ? (missao.concluiram / missao.participantes) * 100 : 0;

  return (
    <div className={`missao professor ${missao.ativa ? '' : 'feita'}`}>
      <span className="missao-icone">
        <Icone nome={missao.tipo === 'quiz' ? 'raio' : 'alvo'} />
      </span>
      <div className="cresce">
        <div className="linha quebra" style={{ gap: 8 }}>
          <strong className="missao-titulo">{missao.titulo}</strong>
          {missao.turma && <span className="etiqueta rosa">{missao.turma}</span>}
          <span className={`etiqueta ${missao.ativa ? 'verde' : 'cinza'}`}>{missao.ativa ? `Até ${formatarDia(missao.fim)}` : 'Encerrada'}</span>
          {missao.materiaNome && <span className="etiqueta">{missao.materiaNome}</span>}
        </div>
        <p className="suave pequeno">
          {missao.tipo === 'quiz' ? `Quiz com ${missao.questoes} questões` : `Meta: ${missao.meta} ${TIPOS[missao.tipo]}`}
          {missao.descricao ? ` — ${missao.descricao}` : ''}
        </p>
        <div className="linha" style={{ marginTop: 8 }}>
          <div className="barra cresce">
            <i style={{ width: `${percentual}%` }} />
          </div>
          <span className="pequeno forte">
            {missao.concluiram}/{missao.participantes} concluíram
          </span>
        </div>
      </div>
      <div className="missao-lado">
        <Recompensa xp={missao.xp} moedas={missao.moedas} />
        <div className="linha" style={{ gap: 2 }}>
          <button className="botao-icone" onClick={() => setEditando(true)} aria-label={`Editar missão ${missao.titulo}`} title="Editar título, descrição e prazo">
            <Icone nome="editar" tamanho={18} />
          </button>
          <button className="botao-icone" onClick={excluir} aria-label={`Excluir missão ${missao.titulo}`} title="Excluir missão">
            <Icone nome="lixeira" tamanho={18} />
          </button>
        </div>
      </div>
      <Modal aberto={editando} aoFechar={() => setEditando(false)}>
        {editando && <EditarMissao missao={missao} aoFechar={() => setEditando(false)} aoSalvar={aoExcluir} />}
      </Modal>
    </div>
  );
}

export function TurmaDetalhe() {
  const { turmaId } = useParams();
  const navegar = useNavigate();
  const admin = useEstado((e) => e.usuario!.papel === 'admin');
  const { dados, erro, recarregar } = useCarregar(() => api<Dados>(`/prof/turmas/${turmaId}`), [turmaId]);
  const [aba, setAba] = useState<Aba>('alunos');
  const [periodo, setPeriodo] = useState<'semana' | 'total'>('semana');
  const [novaMissao, setNovaMissao] = useState(false);
  const [abrirAoVivo, setAbrirAoVivo] = useState(false);
  const aoVivo = useAoVivo((s) => s.sessao);

  useEffect(() => {
    window.addEventListener(EVENTO_PRESENCA, recarregar);
    return () => window.removeEventListener(EVENTO_PRESENCA, recarregar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;
  const { turma, membros } = dados;

  const acao = async (fazer: () => Promise<unknown>, sucesso?: string) => {
    try {
      await fazer();
      if (sucesso) avisar(sucesso, 'sucesso');
      recarregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const remover = (m: Membro) => window.confirm(`Remover ${m.nome} da turma?`) && void acao(() => api(`/prof/turmas/${turma.id}/membros/${m.id}`, { metodo: 'DELETE' }), `${m.nome.split(' ')[0]} saiu da turma.`);

  const excluirTurma = async () => {
    if (!window.confirm(`Excluir a turma "${turma.nome}"? As missões dela também serão apagadas. Os alunos não perdem pontos.`)) return;
    try {
      await api(`/prof/turmas/${turma.id}`, { metodo: 'DELETE' });
      navegar('/turmas');
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const online = membros.filter((m) => m.online).length;

  return (
    <div className="pagina">
      <Link to="/turmas" className="voltar">
        <Icone nome="voltar" tamanho={20} /> {admin ? 'Turmas' : 'Minhas turmas'}
      </Link>
      <div className="pagina-cabecalho">
        <div>
          <span className="etiqueta rosa">{turma.serieNome}</span>
          <h1>{turma.nome}</h1>
          <p className="subtitulo">
            {turma.descricao ? `${turma.descricao} · ` : ''}
            {membros.length} {membros.length === 1 ? 'aluno' : 'alunos'} · {online} online
          </p>
        </div>
        <div className="acoes">
          {!admin &&
            (aoVivo?.conduz ? (
              <Link className="botao rosa" to="/aovivo">
                <Icone nome="jogar" tamanho={18} /> Voltar ao quiz ao vivo
              </Link>
            ) : (
              <button className="botao rosa" onClick={() => setAbrirAoVivo(true)} disabled={membros.length === 0} title={membros.length === 0 ? 'A turma ainda não tem alunos' : 'Conduzir um quiz com a turma toda ao mesmo tempo'}>
                <Icone nome="raio" tamanho={18} /> Quiz ao vivo
              </button>
            ))}
          <button className="turma-codigo linha-unica" onClick={() => copiarCodigo(turma.codigo)} title="Copiar código da turma">
            <span>Código</span>
            <strong>{turma.codigo}</strong>
            <Icone nome="copiar" tamanho={18} />
          </button>
          <button className="botao-icone" title="Gerar um novo código (o antigo deixa de funcionar)" aria-label="Gerar novo código" onClick={() => window.confirm('Gerar um novo código? O código atual deixará de funcionar.') && void acao(() => api(`/prof/turmas/${turma.id}/codigo`, { metodo: 'POST' }), 'Novo código gerado.')}>
            <Icone nome="atualizar" tamanho={20} />
          </button>
          <button className="botao-icone" title="Excluir turma" aria-label="Excluir turma" onClick={excluirTurma}>
            <Icone nome="lixeira" tamanho={20} />
          </button>
        </div>
      </div>

      <div className="linha entre quebra" style={{ marginBottom: 18 }}>
        <div className="abas">
          {(
            [
              ['alunos', 'Alunos'],
              ['ranking', 'Ranking'],
              ['missoes', 'Missões'],
              ['atividade', 'Atividade'],
              ['dificuldades', 'Dificuldades'],
            ] as const
          ).map(([id, nome]) => (
            <button key={id} className={aba === id ? 'ativa' : ''} onClick={() => setAba(id)}>
              {nome}
            </button>
          ))}
        </div>
        {aba === 'missoes' && (
          <button className="botao rosa" onClick={() => setNovaMissao(true)}>
            <Icone nome="mais" tamanho={18} /> Nova missão
          </button>
        )}
        {aba === 'ranking' && (
          <div className="abas">
            <button className={periodo === 'semana' ? 'ativa' : ''} onClick={() => setPeriodo('semana')}>
              Esta semana
            </button>
            <button className={periodo === 'total' ? 'ativa' : ''} onClick={() => setPeriodo('total')}>
              Desde sempre
            </button>
          </div>
        )}
      </div>

      <section className="cartao">
        {aba === 'alunos' &&
          (membros.length === 0 ? (
            <Vazio titulo="Nenhum aluno ainda">
              Compartilhe o código <strong>{turma.codigo}</strong>: os alunos de {turma.serieNome} entram em Configurações → Minhas turmas.
            </Vazio>
          ) : (
            <div className="tabela-rolagem">
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Situação</th>
                    <th>Nível</th>
                    <th>XP na semana</th>
                    <th>Atividades</th>
                    <th>Acertos</th>
                    <th>Sequência</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {membros.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <Link to={`/alunos/${m.id}`} className="pessoa">
                          <Retrato avatar={m.avatar} tamanho={42} online={m.online} />
                          <span>
                            <span className="pessoa-nome" style={{ display: 'block' }}>{m.nome}</span>
                            <span className="pessoa-sub">@{m.usuario}</span>
                          </span>
                        </Link>
                      </td>
                      <td>{m.online ? <span className="etiqueta verde">Online</span> : <span className="suave pequeno">{m.vistoEm ? `Visto ${haQuantoTempo(m.vistoEm)}` : "Ainda não entrou"}</span>}</td>
                      <td className="forte">{m.nivel}</td>
                      <td className="forte">{m.xpSemana}</td>
                      <td>{m.estatisticas.atividades}</td>
                      <td>
                        <span className={`etiqueta ${m.estatisticas.aproveitamento >= 70 ? 'verde' : m.estatisticas.aproveitamento >= 50 ? 'amarela' : m.estatisticas.questoes ? 'vermelha' : 'cinza'}`}>
                          {m.estatisticas.questoes ? `${m.estatisticas.aproveitamento}%` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="valor">
                          <Chama tamanho={18} apagada={m.sequencia === 0} /> {m.sequencia}
                        </span>
                      </td>
                      <td>
                        <div className="linha" style={{ gap: 2, justifyContent: 'flex-end' }}>
                          <Link className="botao-icone" to={`/alunos/${m.id}`} title="Ver desempenho" aria-label={`Ver desempenho de ${m.nome}`}>
                            <Icone nome="grafico" tamanho={18} />
                          </Link>
                          <button className="botao-icone" onClick={() => remover(m)} title="Remover da turma" aria-label={`Remover ${m.nome} da turma`}>
                            <Icone nome="x" tamanho={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {aba === 'ranking' && <ListaRanking ranking={dados.ranking[periodo]} vazio="A turma ainda não tem alunos." />}

        {aba === 'missoes' &&
          (dados.missoes.length === 0 ? (
            <Vazio titulo="Nenhuma missão proposta">Crie uma missão diária ou semanal para motivar a turma.</Vazio>
          ) : (
            <div className="coluna" style={{ gap: 12 }}>
              {dados.missoes.map((m) => (
                <CartaoMissaoProfessor key={m.id} missao={m} aoExcluir={recarregar} />
              ))}
            </div>
          ))}

        {aba === 'atividade' && <ListaDeAtividades atividades={dados.recentes} comAluno />}

        {aba === 'dificuldades' && <Dificuldades turmaId={turma.id} />}
      </section>

      <FormAoVivo aberto={abrirAoVivo} aoFechar={() => setAbrirAoVivo(false)} turma={turma} materias={dados.materias} />
      <FormMissao aberto={novaMissao} aoFechar={() => setNovaMissao(false)} aoCriar={recarregar} turmas={[turma]} turmaFixa={turma.id} materias={dados.materias} />
    </div>
  );
}
