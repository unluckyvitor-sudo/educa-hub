import { useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useEstado } from '../estado';
import { coresDaMateria } from '../visual';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { IconeMateria } from '../componentes/IconeMateria';
import type { Catalogo } from '../tipos';

interface Dados {
  serie: string;
  materias: { id: string; nome: string; topicos: { id: string; titulo: string; resumo: string }[] }[];
}

const semAcento = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Biblioteca: resumos de estudo de cada tópico do nível do aluno. Professores podem consultar qualquer nível. */
export function Biblioteca() {
  const usuario = useEstado((e) => e.usuario)!;
  const aluno = usuario.papel === 'aluno';
  const [parametros, setParametros] = useSearchParams();
  const busca = parametros.get('q') ?? '';
  const [serie, setSerie] = useState('F6');
  const { dados: catalogo } = useCarregar(() => (aluno ? Promise.resolve(null) : api<Catalogo>('/catalogo')));
  const { dados, erro } = useCarregar(() => api<Dados>(`/biblioteca${aluno ? '' : `?serie=${serie}`}`), [serie]);

  const termo = semAcento(busca.trim());
  const materias = (dados?.materias ?? [])
    .map((m) => ({
      ...m,
      topicos: termo ? m.topicos.filter((t) => semAcento(`${m.nome} ${t.titulo} ${t.resumo}`).includes(termo)) : m.topicos,
    }))
    .filter((m) => m.topicos.length);

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Biblioteca</h1>
          <p className="subtitulo">Resumos para estudar antes de jogar{aluno ? ` — ${usuario.serieNome}` : ''}.</p>
        </div>
      </div>

      <div className="linha quebra" style={{ marginBottom: 20 }}>
        <label className="busca" style={{ margin: 0, width: 'min(460px, 100%)' }}>
          <Icone nome="busca" tamanho={24} />
          <input value={busca} onChange={(e) => setParametros(e.target.value ? { q: e.target.value } : {}, { replace: true })} placeholder="Buscar um assunto..." aria-label="Buscar na biblioteca" />
        </label>
        {catalogo && (
          <select className="entrada" style={{ width: 'auto' }} value={serie} onChange={(e) => setSerie(e.target.value)} aria-label="Nível de ensino">
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
        <ErroDeCarga erro={erro} />
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
                  {aluno && (
                    <Link className="link acao" to={`/materias/${m.id}`}>
                      Jogar esta matéria
                    </Link>
                  )}
                </div>
                <div className="grade-2">
                  {m.topicos.map((t) => (
                    <article key={t.id} className="resumo">
                      <h3>{t.titulo}</h3>
                      <p>{t.resumo}</p>
                      {aluno && (
                        <Link className="botao pequeno claro" to={`/jogar/${t.id}/quiz`}>
                          <Icone nome="raio" tamanho={16} /> Testar o que aprendi
                        </Link>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
