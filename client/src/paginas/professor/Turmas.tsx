import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar } from '../../estado';
import { Carregando, ErroDeCarga, Modal, Vazio, useCarregar } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { SeletorDeNivel } from '../Cadastro';
import type { Catalogo, Turma } from '../../tipos';

export function copiarCodigo(codigo: string) {
  navigator.clipboard
    .writeText(codigo)
    .then(() => avisar(`Código ${codigo} copiado!`, 'sucesso'))
    .catch(() => avisar(`Código da turma: ${codigo}`));
}

function NovaTurma({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const navegar = useNavigate();
  const { dados: catalogo } = useCarregar(() => api<Catalogo>('/catalogo'));
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [serie, setSerie] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    if (!serie) return setErro('Escolha o nível de ensino da turma.');
    try {
      const r = await api<{ turma: Turma }>('/prof/turmas', { corpo: { nome, descricao, serie } });
      avisar('Turma criada! Compartilhe o código com os alunos.', 'sucesso');
      navegar(`/turmas/${r.turma.id}`);
    } catch (falha) {
      setErro(mensagemDoErro(falha));
    }
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar}>
      <form className="coluna" onSubmit={criar}>
        <div>
          <h2>Nova turma</h2>
          <p className="suave">Só entram alunos do mesmo nível de ensino e que tenham o código da turma.</p>
        </div>
        <label className="campo">
          <span>Nome da turma</span>
          <input className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex.: 6º Ano A, Cálculo I — Noite" maxLength={60} required autoFocus />
        </label>
        <div className="campo">
          <span>Nível de ensino (ano, série ou área do curso)</span>
          {catalogo && <SeletorDeNivel catalogo={catalogo} serie={serie} aoMudar={(s) => (setSerie(s), setErro(null))} />}
        </div>
        <label className="campo">
          <span>Descrição (opcional)</span>
          <input className="entrada" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="ex.: Turma da manhã, curso de Engenharia Civil" maxLength={200} />
        </label>
        {erro && <div className="erro-form">{erro}</div>}
        <div className="modal-acoes">
          <button type="button" className="botao claro" onClick={aoFechar}>
            Cancelar
          </button>
          <button className="botao">Criar turma</button>
        </div>
      </form>
    </Modal>
  );
}

export function Turmas() {
  const { dados, erro, recarregar } = useCarregar(() => api<{ turmas: Turma[] }>('/prof/turmas'));
  const [criando, setCriando] = useState(false);

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Minhas turmas</h1>
          <p className="subtitulo">Organize os alunos de cada sala, ano ou curso e acompanhe o desempenho deles.</p>
        </div>
        <div className="acoes">
          <button className="botao" onClick={() => setCriando(true)}>
            <Icone nome="mais" tamanho={18} /> Nova turma
          </button>
        </div>
      </div>

      {erro ? (
        <ErroDeCarga erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : dados.turmas.length === 0 ? (
        <section className="cartao">
          <Vazio titulo="Você ainda não tem turmas">Crie uma turma e compartilhe o código com seus alunos para começar.</Vazio>
        </section>
      ) : (
        <div className="grade-3">
          {dados.turmas.map((t) => (
            <article key={t.id} className="cartao turma">
              <Link to={`/turmas/${t.id}`} className="turma-corpo">
                <span className="etiqueta rosa">{t.serieNome}</span>
                <h2>{t.nome}</h2>
                {t.descricao && <p className="suave pequeno">{t.descricao}</p>}
                <div className="linha" style={{ marginTop: 12 }}>
                  <span className="valor">
                    <Icone nome="usuarios" tamanho={18} /> {t.membros}
                  </span>
                  <span className="valor" style={{ color: '#128a57' }}>
                    <span className="pulso" /> {t.online} online
                  </span>
                </div>
              </Link>
              <button className="turma-codigo" onClick={() => copiarCodigo(t.codigo)} title="Copiar código da turma">
                <span>Código</span>
                <strong>{t.codigo}</strong>
                <Icone nome="copiar" tamanho={18} />
              </button>
            </article>
          ))}
        </div>
      )}
      <NovaTurma aberto={criando} aoFechar={() => setCriando(false)} />
    </div>
  );
}
