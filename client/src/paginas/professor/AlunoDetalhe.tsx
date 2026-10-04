import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import { haQuantoTempo } from '../../visual';
import { Carregando, ErroDeCarga, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import { VisaoProgresso } from '../../componentes/VisaoProgresso';
import type { Progresso, ResumoUsuario } from '../../tipos';

interface Dados {
  aluno: ResumoUsuario & { email: string | null; instituicao: string | null; online: boolean; vistoEm: string | null };
  progresso: Progresso;
}

/** Desempenho detalhado de um aluno, visto pelo professor da turma (ou pelo administrador). */
export function AlunoDetalhe() {
  const { alunoId } = useParams();
  const navegar = useNavigate();
  const { dados, erro } = useCarregar(() => api<Dados>(`/prof/alunos/${alunoId}`), [alunoId]);

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;
  const { aluno } = dados;

  return (
    <div className="pagina">
      <button className="voltar" onClick={() => navegar(-1)}>
        <Icone nome="voltar" tamanho={20} /> Voltar
      </button>
      <div className="pagina-cabecalho">
        <Retrato avatar={aluno.avatar} tamanho={92} online={aluno.online} />
        <div>
          <h1>{aluno.nome}</h1>
          <p className="subtitulo">
            @{aluno.usuario} · {aluno.serieNome}
            {aluno.instituicao ? ` · ${aluno.instituicao}` : ''} · {aluno.online ? 'online agora' : `visto ${haQuantoTempo(aluno.vistoEm)}`}
          </p>
        </div>
        <div className="acoes">
          <Link className="botao claro" to={`/perfil/${aluno.id}`}>
            <Icone nome="usuario" tamanho={18} /> Ver perfil
          </Link>
        </div>
      </div>
      <VisaoProgresso progresso={dados.progresso} />
    </div>
  );
}
