import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar } from '../../estado';
import { haQuantoTempo } from '../../visual';
import { Carregando, ErroDeCarga, Modal, useCarregar } from '../../componentes/comuns';
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
  const { dados, erro, recarregar } = useCarregar(() => api<Dados>(`/prof/alunos/${alunoId}`), [alunoId]);
  const [senhaNova, setSenhaNova] = useState<string | null>(null);

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} aoTentar={recarregar} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;
  const { aluno } = dados;
  const primeiroNome = aluno.nome.split(' ')[0];

  // Aluno que esqueceu a senha: o professor gera uma temporária e entrega a ele.
  const redefinirSenha = async () => {
    if (!window.confirm(`Gerar uma senha nova para ${aluno.nome}? A senha atual deixa de funcionar e ${primeiroNome} é desconectado dos aparelhos em que estiver.`)) return;
    try {
      const r = await api<{ senhaTemporaria: string }>(`/prof/alunos/${aluno.id}/senha`, { metodo: 'POST' });
      setSenhaNova(r.senhaTemporaria);
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

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
          <button className="botao claro" onClick={() => void redefinirSenha()} title="Para quando o aluno esquece a senha">
            <Icone nome="cadeado" tamanho={18} /> Redefinir senha
          </button>
          <Link className="botao claro" to={`/perfil/${aluno.id}`}>
            <Icone nome="usuario" tamanho={18} /> Ver perfil
          </Link>
        </div>
      </div>
      <VisaoProgresso progresso={dados.progresso} />

      <Modal aberto={!!senhaNova} aoFechar={() => setSenhaNova(null)}>
        {senhaNova && (
          <div className="centro">
            <h2>Senha nova de {primeiroNome}</h2>
            <p className="suave">Entregue a {primeiroNome} e peça que troque por uma só dele em Configurações. Esta senha não será mostrada de novo.</p>
            <button
              className="turma-codigo"
              style={{ margin: '18px auto' }}
              onClick={() => void navigator.clipboard?.writeText(senhaNova).then(() => avisar('Senha copiada.', 'sucesso'))}
              title="Copiar a senha"
            >
              <span>@{aluno.usuario}</span>
              <strong>{senhaNova}</strong>
              <Icone nome="copiar" tamanho={18} />
            </button>
            <div className="modal-acoes" style={{ justifyContent: 'center' }}>
              <button className="botao" onClick={() => setSenhaNova(null)}>
                Pronto, já anotei
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
