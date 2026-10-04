import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar, useEstado } from '../../estado';
import { haQuantoTempo } from '../../visual';
import { Carregando, Modal, Vazio } from '../../componentes/comuns';
import { Icone, Moeda } from '../../componentes/Icone';
import type { UsuarioAdmin } from './PainelAdmin';

const PAPEIS = { aluno: 'Aluno', professor: 'Professor', admin: 'Admin' };
const CLASSE_STATUS = { ativo: 'verde', pendente: 'amarela', bloqueado: 'vermelha' };

export function UsuariosAdmin() {
  const euId = useEstado((e) => e.usuario!.id);
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [parametros] = useSearchParams();
  const [busca, setBusca] = useState(parametros.get('q') ?? '');
  const [papel, setPapel] = useState('');
  const [status, setStatus] = useState('');
  const [versao, setVersao] = useState(0);
  const [senhaNova, setSenhaNova] = useState<{ usuario: UsuarioAdmin; senha: string } | null>(null);
  const [moedas, setMoedas] = useState<{ usuario: UsuarioAdmin; quantidade: number } | null>(null);

  useEffect(() => {
    const relogio = window.setTimeout(() => {
      const consulta = new URLSearchParams({ q: busca, papel, status });
      api<{ usuarios: UsuarioAdmin[] }>(`/admin/usuarios?${consulta}`)
        .then((r) => setUsuarios(r.usuarios))
        .catch((falha) => avisar(mensagemDoErro(falha), 'erro'));
    }, 250);
    return () => window.clearTimeout(relogio);
  }, [busca, papel, status, versao]);

  const acao = async (fazer: () => Promise<unknown>, sucesso: string) => {
    try {
      await fazer();
      avisar(sucesso, 'sucesso');
      setVersao((v) => v + 1);
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const mudar = (u: UsuarioAdmin, corpo: object, sucesso: string) => acao(() => api(`/admin/usuarios/${u.id}`, { metodo: 'PUT', corpo }), sucesso);

  const redefinirSenha = async (u: UsuarioAdmin) => {
    if (!window.confirm(`Redefinir a senha de ${u.nome}? A pessoa será desconectada e precisará da senha temporária.`)) return;
    try {
      const r = await api<{ senhaTemporaria: string }>(`/admin/usuarios/${u.id}/senha`, { metodo: 'POST' });
      setSenhaNova({ usuario: u, senha: r.senhaTemporaria });
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const excluir = (u: UsuarioAdmin) => {
    if (!window.confirm(`Excluir definitivamente a conta de ${u.nome} (@${u.usuario})? Todo o progresso será apagado. Esta ação não pode ser desfeita.`)) return;
    void acao(() => api(`/admin/usuarios/${u.id}`, { metodo: 'DELETE' }), 'Conta excluída.');
  };

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Usuários</h1>
          <p className="subtitulo">Aprove professores, bloqueie contas, ajuste moedas e redefina senhas.</p>
        </div>
      </div>

      <div className="linha quebra" style={{ marginBottom: 18 }}>
        <label className="busca" style={{ margin: 0, width: 'min(420px, 100%)' }}>
          <Icone nome="busca" tamanho={24} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, usuário ou e-mail" aria-label="Buscar usuários" />
        </label>
        <select className="entrada" style={{ width: 'auto' }} value={papel} onChange={(e) => setPapel(e.target.value)} aria-label="Filtrar por tipo de conta">
          <option value="">Todos os tipos</option>
          <option value="aluno">Alunos</option>
          <option value="professor">Professores</option>
          <option value="admin">Administradores</option>
        </select>
        <select className="entrada" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por situação">
          <option value="">Todas as situações</option>
          <option value="ativo">Ativos</option>
          <option value="pendente">Pendentes</option>
          <option value="bloqueado">Bloqueados</option>
        </select>
      </div>

      <section className="cartao">
        {!usuarios ? (
          <Carregando />
        ) : usuarios.length === 0 ? (
          <Vazio titulo="Nenhum usuário encontrado" />
        ) : (
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Tipo</th>
                  <th>Situação</th>
                  <th>Nível / instituição</th>
                  <th>XP</th>
                  <th>Moedas</th>
                  <th>Visto</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link to={`/perfil/${u.id}`}>
                        <span className="pessoa-nome" style={{ display: 'block' }}>{u.nome}</span>
                        <span className="pessoa-sub">
                          @{u.usuario}
                          {u.email ? ` · ${u.email}` : ''}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className={`etiqueta ${u.papel === 'admin' ? 'rosa' : u.papel === 'professor' ? '' : 'cinza'}`}>{PAPEIS[u.papel]}</span>
                    </td>
                    <td>
                      <span className={`etiqueta ${CLASSE_STATUS[u.status]}`}>{u.status}</span>
                    </td>
                    <td className="pequeno">{u.serieNome ?? u.instituicao ?? '—'}</td>
                    <td className="forte">{u.papel === 'aluno' ? u.xp : '—'}</td>
                    <td>
                      {u.papel === 'aluno' ? (
                        <button className="valor" onClick={() => setMoedas({ usuario: u, quantidade: 100 })} title="Dar ou retirar moedas">
                          <Moeda tamanho={18} /> {u.moedas}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="pequeno suave">{u.online ? <span className="etiqueta verde">Online</span> : haQuantoTempo(u.vistoEm)}</td>
                    <td>
                      {u.id === euId ? (
                        <span className="suave pequeno">Sua conta</span>
                      ) : (
                      <div className="linha" style={{ gap: 2 }}>
                        {u.status === 'pendente' && (
                          <button className="botao verde pequeno" onClick={() => void mudar(u, { status: 'ativo' }, `${u.nome} foi aprovado(a).`)}>
                            Aprovar
                          </button>
                        )}
                        {u.status === 'bloqueado' ? (
                          <button className="botao-icone" title="Desbloquear conta" aria-label={`Desbloquear ${u.nome}`} onClick={() => void mudar(u, { status: 'ativo' }, 'Conta desbloqueada.')}>
                            <Icone nome="check" tamanho={18} />
                          </button>
                        ) : (
                          u.papel !== 'admin' && (
                            <button className="botao-icone" title="Bloquear conta" aria-label={`Bloquear ${u.nome}`} onClick={() => window.confirm(`Bloquear a conta de ${u.nome}?`) && void mudar(u, { status: 'bloqueado' }, 'Conta bloqueada.')}>
                              <Icone nome="cadeado" tamanho={18} />
                            </button>
                          )
                        )}
                        {u.papel === 'professor' && u.status === 'ativo' && (
                          <button className="botao-icone" title="Tornar administrador" aria-label={`Tornar ${u.nome} administrador`} onClick={() => window.confirm(`Dar acesso de administrador a ${u.nome}?`) && void mudar(u, { papel: 'admin' }, `${u.nome} agora é administrador(a).`)}>
                            <Icone nome="escudo" tamanho={18} />
                          </button>
                        )}
                        <button className="botao-icone" title="Redefinir senha" aria-label={`Redefinir senha de ${u.nome}`} onClick={() => void redefinirSenha(u)}>
                          <Icone nome="atualizar" tamanho={18} />
                        </button>
                        <button className="botao-icone" title="Excluir conta" aria-label={`Excluir conta de ${u.nome}`} onClick={() => excluir(u)}>
                          <Icone nome="lixeira" tamanho={18} />
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal aberto={!!senhaNova} aoFechar={() => setSenhaNova(null)}>
        {senhaNova && (
          <div className="coluna">
            <h2>Senha temporária</h2>
            <p>
              Entregue esta senha para <strong>{senhaNova.usuario.nome}</strong> (@{senhaNova.usuario.usuario}). Ela só aparece agora.
            </p>
            <div className="senha-temporaria">{senhaNova.senha}</div>
            <p className="suave pequeno">Peça para a pessoa trocar a senha em Configurações depois de entrar.</p>
            <div className="modal-acoes">
              <button className="botao" onClick={() => setSenhaNova(null)}>
                Entendi
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal aberto={!!moedas} aoFechar={() => setMoedas(null)}>
        {moedas && (
          <form
            className="coluna"
            onSubmit={(e) => {
              e.preventDefault();
              void acao(() => api(`/admin/usuarios/${moedas.usuario.id}/moedas`, { corpo: { quantidade: moedas.quantidade } }), 'Saldo atualizado.');
              setMoedas(null);
            }}
          >
            <h2>Moedas de {moedas.usuario.nome.split(' ')[0]}</h2>
            <p className="suave">Saldo atual: {moedas.usuario.moedas}. Use um número negativo para retirar.</p>
            <label className="campo">
              <span>Quantidade</span>
              <input className="entrada" type="number" value={moedas.quantidade} onChange={(e) => setMoedas({ ...moedas, quantidade: Number(e.target.value) })} autoFocus required />
            </label>
            <div className="modal-acoes">
              <button type="button" className="botao claro" onClick={() => setMoedas(null)}>
                Cancelar
              </button>
              <button className="botao amarelo">Aplicar</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
