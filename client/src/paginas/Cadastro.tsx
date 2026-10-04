import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { useEstado } from '../estado';
import { useCarregar } from '../componentes/comuns';
import { SeletorDePapel, TelaDeAcesso } from './Entrar';
import type { Catalogo, Papel, Usuario } from '../tipos';

/** Escolha do nível de ensino: primeiro a etapa, depois a série (ou área, no superior). */
export function SeletorDeNivel({ catalogo, serie, aoMudar }: { catalogo: Catalogo; serie: string; aoMudar: (serie: string) => void }) {
  const etapaAtual = catalogo.series.find((s) => s.id === serie)?.etapa ?? '';
  const [etapa, setEtapa] = useState(etapaAtual);
  const series = catalogo.series.filter((s) => s.etapa === etapa);

  return (
    <div className="coluna" style={{ gap: 10 }}>
      <div className="chips">
        {catalogo.etapas.map((e) => (
          <button
            key={e.id}
            type="button"
            className={`chip ${etapa === e.id ? 'ativo' : ''}`}
            onClick={() => {
              setEtapa(e.id);
              aoMudar('');
            }}
          >
            {e.nome}
          </button>
        ))}
      </div>
      {etapa && (
        <div className="chips">
          {series.map((s) => (
            <button key={s.id} type="button" className={`chip rosa ${serie === s.id ? 'ativo' : ''}`} onClick={() => aoMudar(s.id)}>
              {s.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Cadastro() {
  const definirUsuario = useEstado((e) => e.definirUsuario);
  const { dados: catalogo } = useCarregar(() => api<Catalogo>('/catalogo'));
  const [papel, setPapel] = useState<Papel>('aluno');
  const [campos, setCampos] = useState({ nome: '', usuario: '', senha: '', instituicao: '', curso: '', disciplinas: '' });
  const [serie, setSerie] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const mudar = (campo: keyof typeof campos) => (e: { target: { value: string } }) => {
    setCampos({ ...campos, [campo]: e.target.value });
    setErro(null);
  };

  const cadastrar = async (e: FormEvent) => {
    e.preventDefault();
    if (papel === 'aluno' && !serie) return setErro('Escolha em que ano ou área você está estudando.');
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await api<{ usuario: Usuario }>('/auth/cadastro', { corpo: { ...campos, papel, serie } });
      definirUsuario(resposta.usuario);
    } catch (falha) {
      setErro(mensagemDoErro(falha));
      setEnviando(false);
    }
  };

  const superior = serie.startsWith('U');
  // Mesmo ajuste que o servidor faz: minúsculas, sem acentos e pontos no lugar dos espaços.
  const usuarioFinal = campos.usuario
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '.');

  return (
    <TelaDeAcesso animacao={erro ? 'triste' : serie ? 'comemorar' : 'acenar'} fala={erro ? 'Quase lá! Confira os campos.' : serie ? 'Oba! Vamos estudar juntos!' : 'Prazer! Como você se chama?'}>
      <form className="acesso-cartao" onSubmit={cadastrar}>
        <h1>Criar conta</h1>
        <p className="subtitulo">É rapidinho. Depois você personaliza seu gato!</p>
        <SeletorDePapel papel={papel} aoMudar={setPapel} />

        <label className="campo">
          <span>Nome completo</span>
          <input className="entrada" value={campos.nome} onChange={mudar('nome')} autoComplete="name" maxLength={60} required />
        </label>
        <div className="grade-campos">
          <label className="campo">
            <span>Nome de usuário</span>
            <input className="entrada" value={campos.usuario} onChange={mudar('usuario')} autoComplete="username" placeholder="ex.: ana.clara" maxLength={40} required />
            {usuarioFinal && usuarioFinal !== campos.usuario && (
              <small className="suave">
                Você vai entrar com: <strong>{usuarioFinal}</strong>
              </small>
            )}
          </label>
          <label className="campo">
            <span>Senha (mínimo 6 caracteres)</span>
            <input className="entrada" type="password" value={campos.senha} onChange={mudar('senha')} autoComplete="new-password" minLength={6} required />
          </label>
        </div>
        <label className="campo">
          <span>Escola ou instituição (opcional)</span>
          <input className="entrada" value={campos.instituicao} onChange={mudar('instituicao')} maxLength={100} />
        </label>

        {papel === 'aluno' ? (
          <div className="campo">
            <span>O que você está estudando?</span>
            {catalogo ? <SeletorDeNivel catalogo={catalogo} serie={serie} aoMudar={setSerie} /> : <span className="suave">Carregando níveis...</span>}
            {superior && <input className="entrada" value={campos.curso} onChange={mudar('curso')} placeholder="Qual é o seu curso? (ex.: Engenharia Civil)" maxLength={80} />}
          </div>
        ) : (
          <>
            <label className="campo">
              <span>Disciplinas que você leciona</span>
              <input className="entrada" value={campos.disciplinas} onChange={mudar('disciplinas')} placeholder="ex.: Matemática e Ciências" maxLength={200} />
            </label>
            <p className="pequeno suave">Contas de professor passam por aprovação do administrador antes de liberar as turmas.</p>
          </>
        )}

        {erro && <div className="erro-form">{erro}</div>}
        <button className="botao rosa grande largo" disabled={enviando}>
          {enviando ? 'Criando...' : 'Criar minha conta'}
        </button>
        <p className="centro suave">
          Já tem conta?{' '}
          <Link className="link" to="/entrar">
            Entrar
          </Link>
        </p>
      </form>
    </TelaDeAcesso>
  );
}
