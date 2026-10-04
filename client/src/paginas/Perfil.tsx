import { Link, useParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { avisar, useEstado } from '../estado';
import { GatoVivo } from '../gato/GatoVivo';
import type { AvatarConfig } from '../gato/modelo';
import { fundoDoAvatar } from '../visual';
import { Carregando, ErroDeCarga, useCarregar } from '../componentes/comuns';
import { Icone, Chama, Xp } from '../componentes/Icone';
import { Indicador } from '../componentes/VisaoProgresso';
import type { Estatisticas, Papel } from '../tipos';

interface PerfilPublico {
  id: number;
  papel: Papel;
  nome: string;
  usuario: string;
  serieNome: string | null;
  avatar: AvatarConfig;
  xp: number;
  nivel: number;
  sequencia: number;
  maiorSequencia: number;
  instituicao: string | null;
  curso: string | null;
  bio: string | null;
  disciplinas: string | null;
  formacao: string | null;
  email?: string | null;
  nascimento?: string | null;
  criadoEm: string;
  online: boolean;
  estatisticas: Estatisticas | null;
  amizade: 'eu' | 'nenhuma' | 'amigos' | 'enviado' | 'recebido';
}

const PAPEIS: Record<Papel, string> = { aluno: 'Aluno', professor: 'Professor', admin: 'Administrador' };

function Linha({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  if (!valor) return null;
  return (
    <div className="dado">
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

export function Perfil() {
  const { usuarioId } = useParams();
  const eu = useEstado((e) => e.usuario)!;
  const { dados, erro, recarregar } = useCarregar(() => api<{ perfil: PerfilPublico }>(`/usuarios/${usuarioId}`), [usuarioId]);

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} aoTentar={recarregar} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;
  const p = dados.perfil;

  const pedirAmizade = async () => {
    try {
      await api('/amigos', { corpo: { usuarioId: p.id } });
      avisar(p.amizade === 'recebido' ? 'Agora vocês são amigos!' : 'Pedido de amizade enviado!', 'sucesso');
      recarregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  return (
    <div className="pagina">
      <section className="perfil-topo">
        <div className="perfil-avatar" style={{ background: fundoDoAvatar(p.avatar.fundo) }}>
          <GatoVivo className="perfil-gato" avatar={p.avatar} animacao="acenar" enquadramento="retrato" />
        </div>
        <div className="cresce">
          <div className="linha quebra" style={{ gap: 8 }}>
            <span className="etiqueta">{PAPEIS[p.papel]}</span>
            {p.serieNome && <span className="etiqueta rosa">{p.serieNome}</span>}
            <span className={`etiqueta ${p.online ? 'verde' : 'cinza'}`}>{p.online ? 'Online' : 'Offline'}</span>
          </div>
          <h1>{p.nome}</h1>
          <p className="suave">@{p.usuario}</p>
          {p.bio && <p className="perfil-bio">{p.bio}</p>}
          <div className="linha quebra" style={{ marginTop: 14 }}>
            {p.amizade === 'eu' ? (
              <>
                <Link className="botao claro" to="/configuracoes">
                  <Icone nome="editar" tamanho={18} /> Editar perfil
                </Link>
                {p.papel === 'aluno' && (
                  <Link className="botao" to="/avatar">
                    <Icone nome="camiseta" tamanho={18} /> Personalizar avatar
                  </Link>
                )}
              </>
            ) : eu.papel === 'aluno' && p.papel === 'aluno' ? (
              p.amizade === 'amigos' ? (
                <span className="etiqueta verde">
                  <Icone nome="check" tamanho={14} /> Vocês são amigos
                </span>
              ) : p.amizade === 'enviado' ? (
                <span className="etiqueta amarela">Pedido enviado</span>
              ) : (
                <button className="botao" onClick={pedirAmizade}>
                  <Icone nome="mais" tamanho={18} /> {p.amizade === 'recebido' ? 'Aceitar amizade' : 'Adicionar aos amigos'}
                </button>
              )
            ) : null}
            {eu.papel !== 'aluno' && p.papel === 'aluno' && (
              <Link className="botao" to={`/alunos/${p.id}`}>
                <Icone nome="grafico" tamanho={18} /> Ver desempenho
              </Link>
            )}
          </div>
        </div>
      </section>

      {p.papel === 'aluno' && p.estatisticas && (
        <div className="indicadores" style={{ marginTop: 22 }}>
          <Indicador icone={<Xp />} valor={p.xp} rotulo={`XP · nível ${p.nivel}`} />
          <Indicador icone={<Chama />} valor={p.sequencia} rotulo={`dias de sequência (recorde ${p.maiorSequencia})`} cor="#ff8a1a" />
          <Indicador icone={<Icone nome="jogar" />} valor={p.estatisticas.atividades} rotulo="atividades feitas" cor="#22b573" />
          <Indicador icone={<Icone nome="espadas" />} valor={`${p.estatisticas.vitorias}/${p.estatisticas.duelos}`} rotulo="duelos vencidos" cor="#ff4f9a" />
        </div>
      )}

      <section className="cartao" style={{ marginTop: 22 }}>
        <div className="cartao-titulo">
          <h2>Informações</h2>
        </div>
        <div className="dados">
          <Linha rotulo="Instituição" valor={p.instituicao} />
          <Linha rotulo="Nível de ensino" valor={p.serieNome} />
          <Linha rotulo="Curso" valor={p.curso} />
          <Linha rotulo="Disciplinas" valor={p.disciplinas} />
          <Linha rotulo="Formação" valor={p.formacao} />
          <Linha rotulo="E-mail" valor={p.email} />
          <Linha rotulo="Nascimento" valor={p.nascimento ? new Date(`${p.nascimento}T12:00:00`).toLocaleDateString('pt-BR') : null} />
          <Linha rotulo="No EducaHub desde" valor={new Date(`${p.criadoEm.replace(' ', 'T')}Z`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} />
        </div>
      </section>
    </div>
  );
}
