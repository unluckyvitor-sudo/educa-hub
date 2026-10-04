// Feedbacks enviados por alunos e professores: nota média, distribuição e os comentários.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensagemDoErro } from '../../api';
import { avisar, useEstado } from '../../estado';
import { EVENTO_SUPORTE } from '../../tempoReal';
import { haQuantoTempo } from '../../visual';
import { Carregando, ErroDeCarga, Vazio } from '../../componentes/comuns';
import { Icone } from '../../componentes/Icone';
import { Estrelas } from '../../componentes/Suporte';
import { Indicador } from '../../componentes/VisaoProgresso';
import type { Papel } from '../../tipos';

type Tipo = 'elogio' | 'sugestao' | 'problema';

interface Feedback {
  id: number;
  tipo: Tipo;
  nota: number | null;
  texto: string | null;
  pagina: string | null;
  lido: boolean;
  criadoEm: string;
  usuarioId: number;
  nome: string;
  usuario: string;
  papel: Papel;
}

interface Dados {
  feedbacks: Feedback[];
  resumo: {
    total: number;
    novos: number;
    media: number | null;
    porNota: { nota: number; total: number }[];
    porTipo: Record<Tipo, number>;
    atendimento: { total: number; media: number | null };
  };
}

const TIPOS: Record<Tipo, [string, string]> = {
  elogio: ['Elogio', 'verde'],
  sugestao: ['Sugestão', ''],
  problema: ['Problema', 'vermelha'],
};
const PAPEIS = { aluno: 'aluno', professor: 'professor', admin: 'administrador' };

export function Feedbacks() {
  const carregarSuporte = useEstado((e) => e.carregarSuporte);
  const [tipo, setTipo] = useState('');
  const [lido, setLido] = useState('');
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const recarregar = () => setVersao((v) => v + 1);

  useEffect(() => {
    let ativo = true;
    api<Dados>(`/admin/feedbacks?${new URLSearchParams({ tipo, lido })}`)
      .then((r) => ativo && (setDados(r), setErro(null)))
      .catch((falha) => ativo && setErro(mensagemDoErro(falha)));
    return () => {
      ativo = false;
    };
  }, [tipo, lido, versao]);

  useEffect(() => {
    window.addEventListener(EVENTO_SUPORTE, recarregar);
    return () => window.removeEventListener(EVENTO_SUPORTE, recarregar);
  }, []);

  const acao = async (fazer: () => Promise<unknown>) => {
    try {
      await fazer();
      recarregar();
      void carregarSuporte();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const excluir = (f: Feedback) => {
    if (window.confirm(`Excluir o feedback de ${f.nome}?`)) void acao(() => api(`/admin/feedbacks/${f.id}`, { metodo: 'DELETE' }));
  };

  const maior = Math.max(1, ...(dados?.resumo.porNota.map((n) => n.total) ?? [1]));

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Feedbacks</h1>
          <p className="subtitulo">O que alunos e professores acham da plataforma.</p>
        </div>
        {dados && dados.resumo.novos > 0 && (
          <button className="botao claro acoes" onClick={() => void acao(() => api('/admin/feedbacks/lidos', { metodo: 'POST' }))}>
            <Icone nome="check" tamanho={18} /> Marcar todos como lidos
          </button>
        )}
      </div>

      {erro ? (
        <ErroDeCarga erro={erro} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <div className="coluna" style={{ gap: 20 }}>
          <div className="grade-2">
            <section className="cartao">
              <div className="cartao-titulo">
                <h2>Nota da plataforma</h2>
              </div>
              <div className="linha quebra" style={{ gap: 24 }}>
                <div className="centro">
                  <div className="feedback-media">{dados.resumo.media?.toLocaleString('pt-BR') ?? '—'}</div>
                  <Estrelas nota={dados.resumo.media == null ? null : Math.round(dados.resumo.media)} tamanho={22} />
                </div>
                <div className="coluna cresce" style={{ gap: 6, minWidth: 180 }}>
                  {[...dados.resumo.porNota].reverse().map((n) => (
                    <div key={n.nota} className="linha pequeno">
                      <span className="forte" style={{ width: 14 }}>
                        {n.nota}
                      </span>
                      <div className="barra cresce">
                        <i style={{ width: `${(n.total / maior) * 100}%` }} />
                      </div>
                      <span className="forte" style={{ width: 28, textAlign: 'right' }}>
                        {n.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <div className="indicadores">
              <Indicador icone={<Icone nome="coracao" />} valor={dados.resumo.porTipo.elogio} rotulo="elogios" cor="#22b573" />
              <Indicador icone={<Icone nome="raio" />} valor={dados.resumo.porTipo.sugestao} rotulo="sugestões" />
              <Indicador icone={<Icone nome="info" />} valor={dados.resumo.porTipo.problema} rotulo="problemas" cor="#ef4444" />
              <Indicador icone={<Icone nome="mensagem" />} valor={dados.resumo.atendimento.media?.toLocaleString('pt-BR') ?? '—'} rotulo={`nota do suporte (${dados.resumo.atendimento.total} ${dados.resumo.atendimento.total === 1 ? 'avaliação' : 'avaliações'})`} cor="#ff4f9a" />
            </div>
          </div>

          <div className="linha quebra">
            <div className="chips">
              {(
                [
                  ['', 'Todos'],
                  ['elogio', 'Elogios'],
                  ['sugestao', 'Sugestões'],
                  ['problema', 'Problemas'],
                ] as const
              ).map(([id, nome]) => (
                <button key={id} className={`chip ${tipo === id ? 'ativo' : ''}`} onClick={() => setTipo(id)}>
                  {nome}
                </button>
              ))}
            </div>
            <select className="entrada" style={{ width: 'auto' }} value={lido} onChange={(e) => setLido(e.target.value)} aria-label="Filtrar por leitura">
              <option value="">Lidos e novos</option>
              <option value="0">Só os novos</option>
              <option value="1">Só os lidos</option>
            </select>
          </div>

          <section className="cartao">
            {dados.feedbacks.length === 0 ? (
              <Vazio titulo="Nenhum feedback por aqui">Alunos e professores enviam feedbacks em Ajuda e suporte › Feedback.</Vazio>
            ) : (
              <div className="feedbacks">
                {dados.feedbacks.map((f) => (
                  <article key={f.id} className={`feedback ${f.lido ? '' : 'novo'}`}>
                    <div className="linha quebra" style={{ gap: 10 }}>
                      <span className={`etiqueta ${TIPOS[f.tipo][1]}`}>{TIPOS[f.tipo][0]}</span>
                      {f.nota != null && <Estrelas nota={f.nota} tamanho={18} />}
                      <span className="cresce suave pequeno">
                        <Link className="link" to={`/perfil/${f.usuarioId}`}>
                          {f.nome}
                        </Link>{' '}
                        ({PAPEIS[f.papel]}) · {haQuantoTempo(f.criadoEm)}
                      </span>
                      <button className="botao-icone" title={f.lido ? 'Marcar como novo' : 'Marcar como lido'} aria-label={f.lido ? 'Marcar como novo' : 'Marcar como lido'} onClick={() => void acao(() => api(`/admin/feedbacks/${f.id}`, { metodo: 'PUT', corpo: { lido: !f.lido } }))}>
                        <Icone nome={f.lido ? 'olho' : 'check'} tamanho={18} />
                      </button>
                      <button className="botao-icone" title="Excluir feedback" aria-label={`Excluir feedback de ${f.nome}`} onClick={() => excluir(f)}>
                        <Icone nome="lixeira" tamanho={18} />
                      </button>
                    </div>
                    {f.texto && <p>{f.texto}</p>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
