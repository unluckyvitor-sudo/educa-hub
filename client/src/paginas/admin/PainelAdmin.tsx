import { Link } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar, useEstado } from '../../estado';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { BarrasPorDia, Indicador } from '../../componentes/VisaoProgresso';
import { Saudacao } from '../aluno/Inicio';

export interface UsuarioAdmin {
  id: number;
  papel: 'aluno' | 'professor' | 'admin';
  status: 'ativo' | 'pendente' | 'bloqueado';
  nome: string;
  usuario: string;
  email: string | null;
  serieNome: string | null;
  instituicao: string | null;
  disciplinas: string | null;
  xp: number;
  moedas: number;
  sequencia: number;
  criadoEm: string;
  vistoEm: string | null;
  online: boolean;
}

interface Resumo {
  alunos: number;
  professores: number;
  pendentes: UsuarioAdmin[];
  turmas: number;
  online: number;
  atividadesHoje: number;
  duelosHoje: number;
  novosNaSemana: number;
  chamadosAbertos: number;
  feedbacksNovos: number;
  /** Pendências de segurança que só o administrador resolve. */
  avisos: string[];
  atividadesPorDia: { dia: string; total: number }[];
  alunosPorSerie: { serie: string; nome: string; total: number }[];
}

export function PainelAdmin() {
  const usuario = useEstado((e) => e.usuario)!;
  const { dados, erro, recarregar } = useCarregar(() => api<Resumo>('/admin/resumo'));

  const decidir = async (professor: UsuarioAdmin, status: 'ativo' | 'bloqueado') => {
    try {
      await api(`/admin/usuarios/${professor.id}`, { metodo: 'PUT', corpo: { status } });
      avisar(status === 'ativo' ? `${professor.nome} foi aprovado(a).` : `Cadastro de ${professor.nome} recusado.`, status === 'ativo' ? 'sucesso' : 'info');
      recarregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const maiorSerie = Math.max(1, ...(dados?.alunosPorSerie.map((s) => s.total) ?? [1]));

  return (
    <>
      <Saudacao nome={usuario.nome.split(' ')[0]} legenda="Administração da plataforma" />
      <div className="pagina">
        {erro ? (
          <ErroDeCarga erro={erro} />
        ) : !dados ? (
          <Carregando />
        ) : (
          <div className="coluna" style={{ gap: 20 }}>
            <div className="indicadores largos">
              <Indicador icone={<Icone nome="usuarios" />} valor={dados.alunos} rotulo="alunos" />
              <Indicador icone={<Icone nome="chapeu" />} valor={dados.professores} rotulo="professores" cor="#ff4f9a" />
              <Indicador icone={<Icone nome="pasta" />} valor={dados.turmas} rotulo="turmas" cor="#2f8bff" />
              <Indicador icone={<Icone nome="olho" />} valor={dados.online} rotulo="online agora" cor="#22b573" />
              <Indicador icone={<Icone nome="jogar" />} valor={dados.atividadesHoje} rotulo="atividades hoje" cor="#ff8a1a" />
              <Indicador icone={<Icone nome="espadas" />} valor={dados.duelosHoje} rotulo="duelos hoje" cor="#7c4dff" />
            </div>

            {dados.avisos.length > 0 && (
              <section className="cartao aviso-seguranca">
                <div className="cartao-titulo">
                  <Icone nome="escudo" tamanho={28} />
                  <h2>Pendências de segurança</h2>
                </div>
                <ul>
                  {dados.avisos.map((aviso) => (
                    <li key={aviso}>{aviso}</li>
                  ))}
                </ul>
              </section>
            )}

            {(dados.chamadosAbertos > 0 || dados.feedbacksNovos > 0) && (
              <section className="cartao linha quebra" style={{ borderColor: '#ffc1dc', background: '#fff5fa' }}>
                <Icone nome="mensagem" tamanho={28} style={{ color: '#ff4f9a' }} />
                <span className="cresce forte">
                  {[
                    dados.chamadosAbertos > 0 && `${dados.chamadosAbertos} ${dados.chamadosAbertos === 1 ? 'pedido de ajuda aguardando' : 'pedidos de ajuda aguardando'} resposta`,
                    dados.feedbacksNovos > 0 && `${dados.feedbacksNovos} ${dados.feedbacksNovos === 1 ? 'feedback novo' : 'feedbacks novos'}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {dados.chamadosAbertos > 0 && (
                  <Link className="botao rosa pequeno" to="/atendimento">
                    Abrir o suporte
                  </Link>
                )}
                {dados.feedbacksNovos > 0 && (
                  <Link className="botao claro pequeno" to="/feedbacks">
                    Ver feedbacks
                  </Link>
                )}
              </section>
            )}

            {dados.pendentes.length > 0 && (
              <section className="cartao" style={{ borderColor: '#ffd15c', background: '#fffbea' }}>
                <div className="cartao-titulo">
                  <Icone nome="escudo" tamanho={28} style={{ color: '#d98900' }} />
                  <h2>Professores aguardando aprovação</h2>
                  <span className="etiqueta amarela acao">{dados.pendentes.length}</span>
                </div>
                <div className="coluna" style={{ gap: 12 }}>
                  {dados.pendentes.map((p) => (
                    <div key={p.id} className="linha quebra">
                      <div className="cresce">
                        <strong>{p.nome}</strong> <span className="suave">@{p.usuario}</span>
                        <div className="suave pequeno">{[p.instituicao, p.disciplinas, p.email].filter(Boolean).join(' · ') || 'Sem dados adicionais'}</div>
                      </div>
                      <button className="botao verde pequeno" onClick={() => void decidir(p, 'ativo')}>
                        <Icone nome="check" tamanho={16} /> Aprovar
                      </button>
                      <button className="botao claro pequeno" onClick={() => void decidir(p, 'bloqueado')}>
                        Recusar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grade-2">
              <section className="cartao">
                <div className="cartao-titulo">
                  <h2>Atividades por dia</h2>
                  <span className="etiqueta acao">{dados.novosNaSemana} contas novas na semana</span>
                </div>
                <BarrasPorDia dias={dados.atividadesPorDia.map((d) => ({ dia: d.dia, valor: d.total }))} unidade="atividades" />
              </section>
              <section className="cartao">
                <div className="cartao-titulo">
                  <h2>Alunos por nível</h2>
                  <Link className="link acao" to="/usuarios">
                    Ver usuários
                  </Link>
                </div>
                <div className="coluna" style={{ gap: 7 }}>
                  {dados.alunosPorSerie.map((s) => (
                    <div key={s.serie} className="linha pequeno">
                      <span style={{ width: 150 }} className="forte">
                        {s.nome}
                      </span>
                      <div className="barra cresce">
                        <i style={{ width: `${(s.total / maiorSerie) * 100}%` }} />
                      </div>
                      <span className="forte" style={{ width: 28, textAlign: 'right' }}>
                        {s.total}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
