import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { useEstado } from '../estado';
import { coresDaMateria } from '../visual';
import { Carregando, ErroDeCarga, Modal, Vazio, VideoDoResumo, useCarregar } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { IconeMateria } from '../componentes/IconeMateria';
import type { Catalogo } from '../tipos';

interface TopicoDaBiblioteca {
  id: string;
  titulo: string;
  resumo: string;
  video?: string | null;
  // Só para quem edita o conteúdo (professores e administradores):
  questoes?: number;
  extra?: boolean;
  rascunho?: boolean;
  publico?: boolean;
  meu?: boolean;
}

interface Dados {
  serie: string;
  materias: { id: string; nome: string; topicos: TopicoDaBiblioteca[] }[];
}

const semAcento = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function NovoTopico({ serie, materia, aoFechar }: { serie: string; materia: { id: string; nome: string }; aoFechar: () => void }) {
  const navegar = useNavigate();
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { id } = await api<{ id: string }>('/conteudo/topicos', { corpo: { serie, materia: materia.id, titulo, resumo } });
      navegar(`/conteudo/${id}`);
    } catch (falha) {
      setErro(mensagemDoErro(falha));
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={criar} className="coluna" style={{ gap: 14 }}>
      <h2>Novo tópico de {materia.nome}</h2>
      <label className="campo">
        <span>Título</span>
        <input className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} placeholder="ex.: Potenciação" required autoFocus />
      </label>
      <label className="campo">
        <span>Resumo para a Biblioteca (o que o aluno lê antes de jogar)</span>
        <textarea className="entrada" rows={6} value={resumo} onChange={(e) => setResumo(e.target.value)} maxLength={1200} />
      </label>
      <p className="pequeno suave">Depois de criar, acrescente as questões. O tópico aparece para os alunos quando tiver pelo menos 4.</p>
      {erro && <div className="erro-form">{erro}</div>}
      <div className="modal-acoes">
        <button type="button" className="botao claro" onClick={aoFechar}>
          Cancelar
        </button>
        <button className="botao" disabled={enviando}>
          {enviando ? 'Criando...' : 'Criar e ir para as questões'}
        </button>
      </div>
    </form>
  );
}

/**
 * Biblioteca: resumos de estudo de cada tópico do nível do aluno.
 * Professores e administradores consultam qualquer nível e, daqui, criam tópicos e questões.
 */
export function Biblioteca() {
  const usuario = useEstado((e) => e.usuario)!;
  const aluno = usuario.papel === 'aluno';
  const [parametros, setParametros] = useSearchParams();
  const busca = parametros.get('q') ?? '';
  // Sem nível na URL, o servidor escolhe o primeiro em uso nesta instalação.
  const pedida = parametros.get('serie') ?? '';
  const [novoEm, setNovoEm] = useState<{ id: string; nome: string } | null>(null);
  const { dados: catalogo } = useCarregar(() => (aluno ? Promise.resolve(null) : api<Catalogo>('/catalogo')));
  const { dados, erro, recarregar } = useCarregar(() => api<Dados>(`/biblioteca${aluno || !pedida ? '' : `?serie=${pedida}`}`), [pedida]);
  // Um nível fora de uso na URL (link antigo) dá lugar ao que o servidor escolheu.
  const serie = catalogo?.series.some((s) => s.id === pedida) ? pedida : dados?.serie || pedida;

  const mudar = (campo: 'q' | 'serie', valor: string) => {
    const novos = new URLSearchParams(parametros);
    if (valor) novos.set(campo, valor);
    else novos.delete(campo);
    setParametros(novos, { replace: true });
  };

  const termo = semAcento(busca.trim());
  const materias = (dados?.materias ?? [])
    .map((m) => ({
      ...m,
      topicos: termo ? m.topicos.filter((t) => semAcento(`${m.nome} ${t.titulo} ${t.resumo}`).includes(termo)) : m.topicos,
    }))
    // Quem edita vê todas as matérias (para poder criar o primeiro tópico de uma), menos durante a busca.
    .filter((m) => m.topicos.length || (!aluno && !termo));

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Biblioteca</h1>
          <p className="subtitulo">
            {aluno ? `Resumos para estudar antes de jogar — ${usuario.serieNome}.` : 'Resumos e questões de cada nível. Crie tópicos e acrescente questões para os seus alunos.'}
          </p>
        </div>
      </div>

      <div className="linha quebra" style={{ marginBottom: 20 }}>
        <label className="busca" style={{ margin: 0, width: 'min(460px, 100%)' }}>
          <Icone nome="busca" tamanho={24} />
          <input value={busca} onChange={(e) => mudar('q', e.target.value)} placeholder="Buscar um assunto..." aria-label="Buscar na biblioteca" />
        </label>
        {catalogo && (
          <select className="entrada" style={{ width: 'auto' }} value={serie} onChange={(e) => mudar('serie', e.target.value)} aria-label="Nível de ensino">
            {catalogo.etapas.map((etapa) => (
              <optgroup key={etapa.id} label={etapa.nome}>
                {catalogo.series
                  .filter((s) => s.etapa === etapa.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      {erro ? (
        <ErroDeCarga erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : materias.length === 0 ? (
        <Vazio titulo="Nada encontrado">Tente outra palavra, como "frações" ou "verbos".</Vazio>
      ) : (
        <div className="coluna" style={{ gap: 22 }}>
          {materias.map((m) => {
            const cores = coresDaMateria(m.id);
            return (
              <section key={m.id} className="cartao estante" style={{ '--claro': cores.claro, '--forte': cores.forte } as CSSProperties}>
                <div className="cartao-titulo">
                  <span className="materia-mini" style={{ background: cores.claro2 }}>
                    <IconeMateria materia={m.id} tamanho={38} />
                  </span>
                  <h2>{m.nome}</h2>
                  {aluno ? (
                    <Link className="link acao" to={`/materias/${m.id}`}>
                      Jogar esta matéria
                    </Link>
                  ) : (
                    <button className="botao claro pequeno acao" onClick={() => setNovoEm({ id: m.id, nome: m.nome })}>
                      <Icone nome="mais" tamanho={16} /> Novo tópico
                    </button>
                  )}
                </div>
                <div className="grade-2">
                  {m.topicos.map((t) => (
                    <article key={t.id} className="resumo">
                      <h3>{t.titulo}</h3>
                      <p>{t.resumo || <span className="suave">Sem resumo ainda.</span>}</p>
                      {t.video && <VideoDoResumo src={t.video} titulo={t.titulo} />}
                      {aluno ? (
                        <Link className="botao pequeno claro" to={`/jogar/${t.id}/quiz`}>
                          <Icone nome="raio" tamanho={16} /> Testar o que aprendi
                        </Link>
                      ) : (
                        <div className="linha quebra" style={{ gap: 8 }}>
                          <Link className="botao pequeno claro" to={`/conteudo/${t.id}`}>
                            <Icone nome="editar" tamanho={16} /> {t.questoes} {t.questoes === 1 ? 'questão' : 'questões'}
                          </Link>
                          {t.rascunho && <span className="etiqueta amarela">Rascunho</span>}
                          {t.extra && !t.rascunho && <span className={`etiqueta ${t.publico ? 'verde' : ''}`}>{t.publico ? 'Criado aqui · para todos' : t.meu ? 'Só para as suas turmas' : 'Só para as turmas do autor'}</span>}
                        </div>
                      )}
                    </article>
                  ))}
                  {m.topicos.length === 0 && <p className="suave">Nenhum tópico nesta matéria ainda.</p>}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Modal aberto={!!novoEm} aoFechar={() => setNovoEm(null)} largo>
        {novoEm && <NovoTopico serie={serie} materia={novoEm} aoFechar={() => setNovoEm(null)} />}
      </Modal>
    </div>
  );
}
