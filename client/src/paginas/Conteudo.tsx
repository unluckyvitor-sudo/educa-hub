import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { avisar } from '../estado';
import { Carregando, ErroDeCarga, Modal, Vazio, useCarregar } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';

interface QuestaoDoEditor {
  id: string;
  enunciado: string;
  correta: string;
  erradas: string[];
  explicacao: string | null;
  /** Criada pela interface (as demais vêm com a plataforma e não podem ser alteradas). */
  extra: boolean;
  publico: boolean;
  editavel: boolean;
  autor: string | null;
}

interface Dados {
  topico: {
    id: string;
    serie: string;
    serieNome: string;
    materia: string;
    materiaNome: string;
    titulo: string;
    resumo: string;
    extra: boolean;
    rascunho: boolean;
    publico: boolean;
    editavel: boolean;
    autor: string | null;
  };
  minimo: number;
  maximo: number;
  podePublicar: boolean;
  questoes: QuestaoDoEditor[];
}

/** Etiqueta que diz de onde veio um tópico ou questão e quem enxerga. */
function Origem({ item }: { item: { extra: boolean; publico: boolean; autor: string | null } }) {
  if (!item.extra) return <span className="etiqueta cinza">Do EducaHub</span>;
  return (
    <>
      <span className="etiqueta">Por {item.autor ?? 'conta removida'}</span>
      <span className={`etiqueta ${item.publico ? 'verde' : 'amarela'}`}>{item.publico ? 'Para todos do nível' : 'Só para as turmas do autor'}</span>
    </>
  );
}

function FormQuestao({ topicoId, questao, aoFechar, aoSalvar }: { topicoId: string; questao: QuestaoDoEditor | null; aoFechar: () => void; aoSalvar: () => void }) {
  const [enunciado, setEnunciado] = useState(questao?.enunciado ?? '');
  const [correta, setCorreta] = useState(questao?.correta ?? '');
  const [erradas, setErradas] = useState(questao?.erradas ?? ['', '', '']);
  const [explicacao, setExplicacao] = useState(questao?.explicacao ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const salvar = async (e: FormEvent, outra = false) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const corpo = { enunciado, correta, erradas, explicacao };
      if (questao) await api(`/conteudo/questoes/${questao.id}`, { metodo: 'PUT', corpo });
      else await api(`/conteudo/topicos/${topicoId}/questoes`, { corpo });
      aoSalvar();
      if (outra) {
        setEnunciado('');
        setCorreta('');
        setErradas(['', '', '']);
        setExplicacao('');
        avisar('Questão salva. Pode escrever a próxima.', 'sucesso');
      } else {
        aoFechar();
      }
    } catch (falha) {
      setErro(mensagemDoErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={salvar} className="coluna" style={{ gap: 14 }}>
      <h2>{questao ? 'Editar questão' : 'Nova questão'}</h2>
      <label className="campo">
        <span>Enunciado</span>
        <textarea className="entrada" rows={2} value={enunciado} onChange={(e) => setEnunciado(e.target.value)} maxLength={300} required autoFocus />
      </label>
      <label className="campo">
        <span>Resposta certa</span>
        <input className="entrada certa" value={correta} onChange={(e) => setCorreta(e.target.value)} maxLength={160} required />
      </label>
      <div className="campo">
        <span>Três respostas erradas (plausíveis, para a questão não ficar fácil demais)</span>
        <div className="coluna" style={{ gap: 8 }}>
          {erradas.map((valor, i) => (
            <input key={i} className="entrada" value={valor} onChange={(e) => setErradas(erradas.map((x, j) => (j === i ? e.target.value : x)))} maxLength={160} required aria-label={`Resposta errada ${i + 1}`} placeholder={`Errada ${i + 1}`} />
          ))}
        </div>
      </div>
      <label className="campo">
        <span>Explicação (opcional — aparece depois que o aluno responde)</span>
        <textarea className="entrada" rows={2} value={explicacao} onChange={(e) => setExplicacao(e.target.value)} maxLength={300} />
      </label>
      {erro && <div className="erro-form">{erro}</div>}
      <div className="modal-acoes">
        <button type="button" className="botao claro" onClick={aoFechar}>
          Cancelar
        </button>
        {!questao && (
          <button type="button" className="botao claro" disabled={enviando} onClick={(e) => void salvar(e, true)}>
            Salvar e criar outra
          </button>
        )}
        <button className="botao" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

function FormTopico({ topico, aoFechar, aoSalvar }: { topico: Dados['topico']; aoFechar: () => void; aoSalvar: () => void }) {
  const [titulo, setTitulo] = useState(topico.titulo);
  const [resumo, setResumo] = useState(topico.resumo);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api(`/conteudo/topicos/${topico.id}`, { metodo: 'PUT', corpo: { titulo, resumo } });
      aoSalvar();
      aoFechar();
    } catch (falha) {
      setErro(mensagemDoErro(falha));
    }
  };

  return (
    <form onSubmit={salvar} className="coluna" style={{ gap: 14 }}>
      <h2>Editar tópico</h2>
      <label className="campo">
        <span>Título</span>
        <input className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} required autoFocus />
      </label>
      <label className="campo">
        <span>Resumo para a Biblioteca (o que o aluno lê antes de jogar)</span>
        <textarea className="entrada" rows={6} value={resumo} onChange={(e) => setResumo(e.target.value)} maxLength={1200} />
      </label>
      {erro && <div className="erro-form">{erro}</div>}
      <div className="modal-acoes">
        <button type="button" className="botao claro" onClick={aoFechar}>
          Cancelar
        </button>
        <button className="botao">Salvar</button>
      </div>
    </form>
  );
}

/** Editor de um tópico: professores e administradores acrescentam questões e criam tópicos próprios. */
export function Conteudo() {
  const { topicoId } = useParams();
  const navegar = useNavigate();
  const { dados, erro, recarregar } = useCarregar(() => api<Dados>(`/conteudo/topicos/${topicoId}`), [topicoId]);
  const [questao, setQuestao] = useState<QuestaoDoEditor | 'nova' | null>(null);
  const [editandoTopico, setEditandoTopico] = useState(false);

  if (erro) return <div className="pagina"><ErroDeCarga erro={erro} aoTentar={recarregar} /></div>;
  if (!dados) return <div className="pagina"><Carregando /></div>;
  const { topico, questoes } = dados;
  const voltar = `/biblioteca?serie=${topico.serie}`;
  const faltam = Math.max(0, dados.minimo - questoes.length);

  const acao = async (fazer: () => Promise<unknown>, sucesso: string, depois = recarregar) => {
    try {
      await fazer();
      avisar(sucesso, 'sucesso');
      depois();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const excluirTopico = () =>
    window.confirm(`Excluir o tópico "${topico.titulo}" e as questões dele? Os alunos deixam de vê-lo.`) &&
    void acao(() => api(`/conteudo/topicos/${topico.id}`, { metodo: 'DELETE' }), 'Tópico excluído.', () => navegar(voltar));

  const publicarTopico = (publico: boolean) =>
    void acao(
      () => api(`/conteudo/topicos/${topico.id}`, { metodo: 'PUT', corpo: { titulo: topico.titulo, resumo: topico.resumo, publico } }),
      publico ? 'Tópico publicado para todos os alunos do nível.' : 'O tópico voltou a aparecer só para as turmas do autor.',
    );

  const publicarQuestao = (q: QuestaoDoEditor, publico: boolean) =>
    void acao(
      () => api(`/conteudo/questoes/${q.id}`, { metodo: 'PUT', corpo: { enunciado: q.enunciado, correta: q.correta, erradas: q.erradas, explicacao: q.explicacao ?? '', publico } }),
      publico ? 'Questão publicada para todos os alunos do nível.' : 'A questão voltou a aparecer só para as turmas do autor.',
    );

  return (
    <div className="pagina">
      <Link to={voltar} className="voltar">
        <Icone nome="voltar" tamanho={20} /> Biblioteca
      </Link>
      <div className="pagina-cabecalho">
        <div>
          <div className="linha quebra" style={{ gap: 8 }}>
            <span className="etiqueta rosa">{topico.serieNome}</span>
            <span className="etiqueta acao">{topico.materiaNome}</span>
            <Origem item={topico} />
          </div>
          <h1>{topico.titulo}</h1>
          <p className="subtitulo" style={{ maxWidth: 760 }}>{topico.resumo || 'Sem resumo ainda.'}</p>
        </div>
        <div className="acoes">
          {dados.podePublicar && topico.extra && (
            <button className="botao claro pequeno" onClick={() => publicarTopico(!topico.publico)}>
              {topico.publico ? 'Recolher' : 'Publicar para todos'}
            </button>
          )}
          {topico.editavel && (
            <>
              <button className="botao-icone" title="Editar título e resumo" aria-label="Editar tópico" onClick={() => setEditandoTopico(true)}>
                <Icone nome="editar" tamanho={20} />
              </button>
              <button className="botao-icone" title="Excluir tópico" aria-label="Excluir tópico" onClick={excluirTopico}>
                <Icone nome="lixeira" tamanho={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {topico.rascunho && (
        <div className="cartao aviso-rascunho">
          <Icone nome="info" tamanho={24} />
          <span>
            <strong>Rascunho.</strong> {faltam === 1 ? 'Falta 1 questão' : `Faltam ${faltam} questões`} para este tópico aparecer para os alunos (o mínimo é {dados.minimo}, para os três jogos funcionarem).
          </span>
        </div>
      )}

      <section className="cartao">
        <div className="cartao-titulo">
          <Icone nome="raio" tamanho={26} style={{ color: '#5b5ff0' }} />
          <h2>Questões</h2>
          <span className="etiqueta">{questoes.length}</span>
          <button className="botao rosa pequeno acao" onClick={() => setQuestao('nova')}>
            <Icone nome="mais" tamanho={16} /> Nova questão
          </button>
        </div>
        {questoes.length === 0 ? (
          <Vazio titulo="Nenhuma questão ainda">Crie a primeira: enunciado, a resposta certa e três erradas.</Vazio>
        ) : (
          <ol className="questoes-editor">
            {questoes.map((q) => (
              <li key={q.id} className={q.extra ? 'extra' : ''}>
                <div className="cresce">
                  <strong>{q.enunciado}</strong>
                  <ul className="questao-respostas">
                    <li className="certa">
                      <Icone nome="check" tamanho={16} /> {q.correta}
                    </li>
                    {q.erradas.map((e) => (
                      <li key={e}>
                        <Icone nome="x" tamanho={14} /> {e}
                      </li>
                    ))}
                  </ul>
                  {q.explicacao && <p className="suave pequeno">Explicação: {q.explicacao}</p>}
                  <div className="linha quebra" style={{ gap: 6, marginTop: 6 }}>
                    <Origem item={q} />
                  </div>
                </div>
                <div className="linha" style={{ gap: 2, alignSelf: 'flex-start' }}>
                  {dados.podePublicar && q.extra && (
                    <button className="botao claro pequeno" onClick={() => publicarQuestao(q, !q.publico)}>
                      {q.publico ? 'Recolher' : 'Publicar'}
                    </button>
                  )}
                  {q.editavel && (
                    <>
                      <button className="botao-icone" title="Editar questão" aria-label={`Editar a questão: ${q.enunciado}`} onClick={() => setQuestao(q)}>
                        <Icone nome="editar" tamanho={18} />
                      </button>
                      <button
                        className="botao-icone"
                        title="Excluir questão"
                        aria-label={`Excluir a questão: ${q.enunciado}`}
                        onClick={() => window.confirm('Excluir esta questão?') && void acao(() => api(`/conteudo/questoes/${q.id}`, { metodo: 'DELETE' }), 'Questão excluída.')}
                      >
                        <Icone nome="lixeira" tamanho={18} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Modal aberto={questao !== null} aoFechar={() => setQuestao(null)} largo>
        {questao !== null && <FormQuestao key={questao === 'nova' ? 'nova' : questao.id} topicoId={topico.id} questao={questao === 'nova' ? null : questao} aoFechar={() => setQuestao(null)} aoSalvar={recarregar} />}
      </Modal>
      <Modal aberto={editandoTopico} aoFechar={() => setEditandoTopico(false)} largo>
        {editandoTopico && <FormTopico topico={topico} aoFechar={() => setEditandoTopico(false)} aoSalvar={recarregar} />}
      </Modal>
    </div>
  );
}
