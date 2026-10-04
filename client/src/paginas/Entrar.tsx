import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { useEstado } from '../estado';
import { GatoVivo } from '../gato/GatoVivo';
import { AVATAR_PADRAO, type Animacao } from '../gato/modelo';
import { Logo } from '../componentes/Logo';
import { Coroa, Coracao, EstrelaRabisco, Seta } from '../componentes/Rabiscos';
import type { Papel, Usuario } from '../tipos';

/** Moldura das telas de entrada e cadastro: painel azul-noite com o gato e o formulário ao lado. */
export function TelaDeAcesso({ animacao, fala, children }: { animacao: Animacao; fala: string; children: ReactNode }) {
  return (
    <div className="acesso">
      <section className="acesso-palco" aria-hidden="true">
        <Logo claro altura={54} />
        <Coroa className="rb rb-1" cor="#7c4dff" tamanho={78} />
        <EstrelaRabisco className="rb rb-2" cor="#ffc93c" tamanho={64} />
        <Coracao className="rb rb-3" cor="#ff4f9a" tamanho={58} />
        <Seta className="rb rb-4" cor="#7c4dff" tamanho={90} />
        <div className="acesso-fala">{fala}</div>
        <GatoVivo className="acesso-gato" avatar={AVATAR_PADRAO} animacao={animacao} seguirMouse />
        <svg className="acesso-onda" viewBox="0 0 600 140" preserveAspectRatio="none">
          <path d="M0 60c90-40 190-30 290 10s210 40 310-10v80H0z" fill="#8f86ee" />
          <path d="M0 92c100-30 200-18 300 12s200 22 300-8v44H0z" fill="#c9c6fb" />
        </svg>
      </section>
      <section className="acesso-form">{children}</section>
    </div>
  );
}

export function SeletorDePapel({ papel, aoMudar }: { papel: Papel; aoMudar: (p: Papel) => void }) {
  return (
    <div className="papeis" role="tablist" aria-label="Tipo de conta">
      {(['aluno', 'professor'] as const).map((p) => (
        <button key={p} type="button" role="tab" aria-selected={papel === p} className={papel === p ? 'ativo' : ''} onClick={() => aoMudar(p)}>
          {p === 'aluno' ? 'Sou aluno' : 'Sou professor'}
        </button>
      ))}
    </div>
  );
}

export function Entrar() {
  const definirUsuario = useEstado((e) => e.definirUsuario);
  const [papel, setPapel] = useState<Papel>('aluno');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [digitando, setDigitando] = useState(false);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resposta = await api<{ usuario: Usuario }>('/auth/entrar', { corpo: { usuario, senha, papel } });
      definirUsuario(resposta.usuario);
    } catch (falha) {
      setErro(mensagemDoErro(falha));
      setEnviando(false);
    }
  };

  const animacao: Animacao = erro ? 'triste' : digitando ? 'pensar' : 'acenar';
  const fala = erro ? 'Ops... vamos tentar de novo?' : digitando ? 'Hmm, deixa eu ver...' : 'Oi! Que bom ver você por aqui!';

  return (
    <TelaDeAcesso animacao={animacao} fala={fala}>
      <form className="acesso-cartao" onSubmit={entrar}>
        <h1>Bem-vindo de volta!</h1>
        <p className="subtitulo">Entre para continuar sua aventura de aprendizado.</p>
        <SeletorDePapel papel={papel} aoMudar={setPapel} />
        <label className="campo">
          <span>Usuário</span>
          <input className="entrada" value={usuario} onChange={(e) => (setUsuario(e.target.value), setErro(null))} autoComplete="username" autoFocus required />
        </label>
        <label className="campo">
          <span>Senha</span>
          <input
            className="entrada"
            type="password"
            value={senha}
            onChange={(e) => (setSenha(e.target.value), setErro(null))}
            onFocus={() => setDigitando(true)}
            onBlur={() => setDigitando(false)}
            autoComplete="current-password"
            required
          />
        </label>
        {erro && <div className="erro-form">{erro}</div>}
        <button className="botao grande largo" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="centro suave">
          Ainda não tem conta?{' '}
          <Link className="link" to="/cadastro">
            Criar conta
          </Link>
        </p>
        <p className="centro pequeno suave">Administradores entram por aqui com o usuário de administrador.</p>
      </form>
    </TelaDeAcesso>
  );
}
