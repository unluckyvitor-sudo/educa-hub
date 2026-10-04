// Fila de atendimento: os pedidos de ajuda que chegam para a equipe (administradores)
// ou as dúvidas que os alunos enviam ao professor.
import { useEffect, useState } from 'react';
import { api, mensagemDoErro } from '../api';
import { useEstado } from '../estado';
import { EVENTO_SUPORTE } from '../tempoReal';
import { Carregando, ErroDeCarga, Vazio } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { LinhaChamado } from '../componentes/Suporte';
import type { Chamado } from '../tipos';

interface Fila {
  chamados: Chamado[];
  categorias: { id: string; nome: string }[];
}

const SITUACOES = [
  ['', 'Todos'],
  ['aberto', 'Aguardando você'],
  ['respondido', 'Respondidos'],
  ['resolvido', 'Resolvidos'],
] as const;

export function Atendimento() {
  const admin = useEstado((e) => e.usuario!.papel === 'admin');
  const [fila, setFila] = useState<'equipe' | 'professores'>('equipe');
  const [status, setStatus] = useState('');
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState<Fila | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    const relogio = window.setTimeout(() => {
      api<Fila>(`/suporte/atendimento?${new URLSearchParams({ fila, status, categoria, q: busca })}`)
        .then((r) => ativo && (setDados(r), setErro(null)))
        .catch((falha) => ativo && setErro(mensagemDoErro(falha)));
    }, 200);
    return () => {
      ativo = false;
      window.clearTimeout(relogio);
    };
  }, [fila, status, categoria, busca, versao]);

  // Chegou pedido ou resposta: a fila se atualiza sozinha.
  useEffect(() => {
    const aoMudar = () => setVersao((v) => v + 1);
    window.addEventListener(EVENTO_SUPORTE, aoMudar);
    return () => window.removeEventListener(EVENTO_SUPORTE, aoMudar);
  }, []);

  const acompanhando = admin && fila === 'professores';

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>{admin ? 'Suporte' : 'Dúvidas dos alunos'}</h1>
          <p className="subtitulo">
            {admin
              ? 'Pedidos de ajuda de alunos e professores. Responda por aqui: a pessoa é avisada na hora.'
              : 'Perguntas que os alunos das suas turmas enviaram para você. A administração pode acompanhar estas conversas.'}
          </p>
        </div>
        {admin && (
          <div className="abas acoes">
            <button className={fila === 'equipe' ? 'ativa' : ''} onClick={() => setFila('equipe')}>
              Fila da equipe
            </button>
            <button className={fila === 'professores' ? 'ativa' : ''} onClick={() => setFila('professores')}>
              Alunos e professores
            </button>
          </div>
        )}
      </div>

      <div className="linha quebra" style={{ marginBottom: 18 }}>
        <div className="chips">
          {SITUACOES.map(([id, nome]) => (
            <button key={id} className={`chip ${status === id ? 'ativo' : ''}`} onClick={() => setStatus(id)}>
              {id === 'aberto' && acompanhando ? 'Aguardando o professor' : nome}
            </button>
          ))}
        </div>
        <select className="entrada" style={{ width: 'auto' }} value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Filtrar por tipo de ajuda">
          <option value="">Todos os tipos</option>
          {dados?.categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        <label className="busca" style={{ margin: 0, width: 'min(320px, 100%)', height: 48 }}>
          <Icone nome="busca" tamanho={22} />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Assunto ou pessoa" aria-label="Buscar chamados" />
        </label>
      </div>

      <section className="cartao">
        {erro ? (
          <ErroDeCarga erro={erro} />
        ) : !dados ? (
          <Carregando />
        ) : dados.chamados.length === 0 ? (
          <Vazio titulo={status || categoria || busca ? 'Nenhum chamado com esses filtros' : 'Nenhum pedido de ajuda por aqui'}>
            {acompanhando ? 'As dúvidas que os alunos enviam aos professores aparecem aqui.' : admin ? 'Quando alguém pedir ajuda, o pedido aparece nesta fila e o sininho avisa.' : 'Quando um aluno das suas turmas escrever para você, a pergunta aparece aqui.'}
          </Vazio>
        ) : (
          <div className="chamados">
            {dados.chamados.map((c) => (
              <LinhaChamado key={c.id} chamado={acompanhando ? { ...c, novas: 0 } : c} visao="atendente" para={`/atendimento/${c.id}`} mostrarDestino={acompanhando} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
