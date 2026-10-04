import { Link } from 'react-router-dom';
import { api } from '../api';
import { useEstado } from '../estado';
import { desconectarTempoReal } from '../tempoReal';
import { TelaDeAcesso } from './Entrar';

/** Tela do professor cuja conta ainda não foi aprovada pelo administrador. */
export function Aguardando() {
  const usuario = useEstado((e) => e.usuario)!;
  const atualizar = useEstado((e) => e.atualizarUsuario);
  const definirUsuario = useEstado((e) => e.definirUsuario);
  const respostasNovas = useEstado((e) => e.suporte.respostasNovas);

  const sair = async () => {
    await api('/auth/sair', { metodo: 'POST' }).catch(() => {});
    desconectarTempoReal();
    definirUsuario(null);
  };

  return (
    <TelaDeAcesso animacao="pensar" fala="Estou conferindo seus dados...">
      <div className="acesso-cartao">
        <h1>Quase lá, {usuario.nome.split(' ')[0]}!</h1>
        <p className="subtitulo">
          Sua conta de professor foi criada e está aguardando a aprovação do administrador da plataforma. Assim que for aprovada, você poderá criar turmas, propor missões e acompanhar seus alunos.
        </p>
        <button className="botao largo" onClick={() => void atualizar()}>
          Verificar de novo
        </button>
        <Link className="botao claro largo" to="/ajuda?aba=chamados">
          Falar com o suporte
          {respostasNovas > 0 && <b className="contador">{respostasNovas}</b>}
        </Link>
        <button className="botao claro largo" onClick={sair}>
          Sair
        </button>
      </div>
    </TelaDeAcesso>
  );
}
