import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { avisar, useEstado } from '../estado';
import { alternarSom, somLigado, tocar } from '../sons';
import { useCarregar } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { SeletorDeNivel } from './Cadastro';
import type { Catalogo, Usuario } from '../tipos';

interface MinhaTurma {
  id: number;
  nome: string;
  serieNome: string;
  professor: string;
  membros: number;
}

function DadosDoPerfil() {
  const usuario = useEstado((e) => e.usuario)!;
  const definirUsuario = useEstado((e) => e.definirUsuario);
  const { dados: catalogo } = useCarregar(() => api<Catalogo>('/catalogo'));
  const [campos, setCampos] = useState({
    nome: usuario.nome,
    email: usuario.email ?? '',
    nascimento: usuario.nascimento ?? '',
    instituicao: usuario.instituicao ?? '',
    bio: usuario.bio ?? '',
    curso: usuario.curso ?? '',
    disciplinas: usuario.disciplinas ?? '',
    formacao: usuario.formacao ?? '',
  });
  const [serie, setSerie] = useState(usuario.serie ?? '');
  const [salvando, setSalvando] = useState(false);
  const aluno = usuario.papel === 'aluno';

  const mudar = (campo: keyof typeof campos) => (e: { target: { value: string } }) => setCampos({ ...campos, [campo]: e.target.value });

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (aluno && !serie) return avisar('Escolha o seu nível de ensino.', 'erro');
    setSalvando(true);
    try {
      const r = await api<{ usuario: Usuario }>('/eu', { metodo: 'PUT', corpo: { ...campos, serie } });
      definirUsuario(r.usuario);
      avisar('Perfil atualizado!', 'sucesso');
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form className="cartao coluna" onSubmit={salvar}>
      <div className="cartao-titulo" style={{ marginBottom: 0 }}>
        <Icone nome="usuario" tamanho={28} style={{ color: '#5b5ff0' }} />
        <h2>Meus dados</h2>
      </div>
      <div className="grade-campos">
        <label className="campo">
          <span>Nome completo</span>
          <input className="entrada" value={campos.nome} onChange={mudar('nome')} maxLength={60} required />
        </label>
        <label className="campo">
          <span>Usuário</span>
          <input className="entrada" value={`@${usuario.usuario}`} disabled />
        </label>
        <label className="campo">
          <span>E-mail</span>
          <input className="entrada" type="email" value={campos.email} onChange={mudar('email')} maxLength={120} />
        </label>
        <label className="campo">
          <span>Data de nascimento</span>
          <input className="entrada" type="date" value={campos.nascimento} onChange={mudar('nascimento')} />
        </label>
        <label className="campo">
          <span>Escola ou instituição</span>
          <input className="entrada" value={campos.instituicao} onChange={mudar('instituicao')} maxLength={100} />
        </label>
        {!aluno && (
          <>
            <label className="campo">
              <span>Disciplinas que leciona</span>
              <input className="entrada" value={campos.disciplinas} onChange={mudar('disciplinas')} maxLength={200} />
            </label>
            <label className="campo">
              <span>Formação</span>
              <input className="entrada" value={campos.formacao} onChange={mudar('formacao')} maxLength={200} />
            </label>
          </>
        )}
      </div>
      <label className="campo">
        <span>Sobre mim</span>
        <textarea className="entrada" value={campos.bio} onChange={mudar('bio')} maxLength={300} placeholder="Conte um pouco sobre você..." />
      </label>
      {aluno && (
        <div className="campo">
          <span>Nível que estou estudando (define as matérias e os conteúdos que aparecem para você)</span>
          {catalogo && <SeletorDeNivel catalogo={catalogo} serie={serie} aoMudar={setSerie} />}
          {serie.startsWith('U') && <input className="entrada" value={campos.curso} onChange={mudar('curso')} placeholder="Qual é o seu curso?" maxLength={80} />}
        </div>
      )}
      <div>
        <button className="botao" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}

function MinhasTurmas() {
  const { dados, recarregar } = useCarregar(() => api<{ turmas: MinhaTurma[] }>('/turmas/minhas'));
  const [codigo, setCodigo] = useState('');

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const r = await api<{ turma: { nome: string } }>('/turmas/entrar', { corpo: { codigo } });
      avisar(`Você entrou na turma ${r.turma.nome}!`, 'sucesso');
      setCodigo('');
      recarregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const sair = async (turma: MinhaTurma) => {
    if (!window.confirm(`Sair da turma ${turma.nome}?`)) return;
    await api(`/turmas/${turma.id}/sair`, { metodo: 'DELETE' }).catch((falha) => avisar(mensagemDoErro(falha), 'erro'));
    recarregar();
  };

  return (
    <section className="cartao coluna">
      <div className="cartao-titulo" style={{ marginBottom: 0 }}>
        <Icone nome="chapeu" tamanho={28} style={{ color: '#ff4f9a' }} />
        <h2>Minhas turmas</h2>
      </div>
      {dados?.turmas.map((t) => (
        <div key={t.id} className="linha">
          <div className="cresce">
            <strong>{t.nome}</strong>
            <div className="suave pequeno">
              {t.serieNome} · Prof. {t.professor} · {t.membros} {t.membros === 1 ? 'aluno' : 'alunos'}
            </div>
          </div>
          <button className="botao claro pequeno" onClick={() => void sair(t)}>
            Sair
          </button>
        </div>
      ))}
      {dados?.turmas.length === 0 && <p className="suave">Você ainda não participa de nenhuma turma.</p>}
      <form className="linha" onSubmit={entrar}>
        <input className="entrada" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Código da turma (ex.: GATO6A)" maxLength={10} required aria-label="Código da turma" />
        <button className="botao rosa">Entrar na turma</button>
      </form>
      <p className="suave pequeno">Peça o código ao seu professor. Ao entrar, você recebe as missões da turma e aparece no ranking dela.</p>
    </section>
  );
}

function TrocarSenha() {
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');

  const trocar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api('/eu/senha', { metodo: 'PUT', corpo: { atual, nova } });
      avisar('Senha alterada!', 'sucesso');
      setAtual('');
      setNova('');
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  return (
    <form className="cartao coluna" onSubmit={trocar}>
      <div className="cartao-titulo" style={{ marginBottom: 0 }}>
        <Icone nome="cadeado" tamanho={28} style={{ color: '#22b573' }} />
        <h2>Senha</h2>
      </div>
      <div className="grade-campos">
        <label className="campo">
          <span>Senha atual</span>
          <input className="entrada" type="password" value={atual} onChange={(e) => setAtual(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className="campo">
          <span>Nova senha (mínimo 6 caracteres)</span>
          <input className="entrada" type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" minLength={6} required />
        </label>
      </div>
      <div>
        <button className="botao verde">Alterar senha</button>
      </div>
    </form>
  );
}

function Preferencias() {
  const [som, setSom] = useState(somLigado());
  return (
    <section className="cartao coluna">
      <div className="cartao-titulo" style={{ marginBottom: 0 }}>
        <Icone nome="engrenagem" tamanho={28} style={{ color: '#ffab1a' }} />
        <h2>Preferências</h2>
      </div>
      <label className="linha" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={som}
          onChange={(e) => {
            alternarSom(e.target.checked);
            setSom(e.target.checked);
            if (e.target.checked) tocar('acerto');
          }}
          style={{ width: 22, height: 22 }}
        />
        <span>
          <strong>Efeitos sonoros</strong>
          <span className="suave pequeno" style={{ display: 'block' }}>Sons de acerto, erro e vitória durante os jogos.</span>
        </span>
      </label>
    </section>
  );
}

function AjudaESuporte() {
  return (
    <section className="cartao linha quebra">
      <Icone nome="info" tamanho={28} style={{ color: '#2f8bff' }} />
      <div className="cresce">
        <h2 style={{ fontSize: 22 }}>Ajuda e suporte</h2>
        <p className="suave">Perguntas frequentes, conversa com o suporte e espaço para o seu feedback.</p>
      </div>
      <Link className="botao claro" to="/ajuda">
        Abrir a ajuda
      </Link>
    </section>
  );
}

export function Configuracoes() {
  const papel = useEstado((e) => e.usuario!.papel);
  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Configurações</h1>
          <p className="subtitulo">Seus dados, seu nível de ensino e suas preferências.</p>
        </div>
      </div>
      <div className="coluna" style={{ gap: 20, maxWidth: 900 }}>
        <DadosDoPerfil />
        {papel === 'aluno' && <MinhasTurmas />}
        <TrocarSenha />
        <Preferencias />
        <AjudaESuporte />
      </div>
    </div>
  );
}
