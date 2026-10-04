// A conversa de um chamado. Serve a quem pediu ajuda (/ajuda/chamados/:id) e a quem atende (/atendimento/:id).
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { avisar, useEstado } from '../estado';
import { EVENTO_SUPORTE } from '../tempoReal';
import { haQuantoTempo } from '../visual';
import { Carregando, ErroDeCarga } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { Estrelas, Situacao } from '../componentes/Suporte';
import type { Chamado as DadosDoChamado, MensagemChamado, Papel, StatusChamado } from '../tipos';

interface Conversa {
  chamado: DadosDoChamado;
  papel: 'autor' | 'atendente';
  mensagens: MensagemChamado[];
  autor: { id: number; nome: string; usuario: string; papel: Papel; status: string; serieNome: string | null } | null;
}

const PAPEIS = { aluno: 'Aluno', professor: 'Professor', admin: 'Administrador' };

export function Chamado({ voltarPara }: { voltarPara: string }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const carregarSuporte = useEstado((e) => e.carregarSuporte);
  const souAdmin = useEstado((e) => e.usuario?.papel === 'admin');
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    try {
      setConversa(await api<Conversa>(`/suporte/chamados/${id}`));
      setErro(null);
      void carregarSuporte(); // abrir a conversa zera o aviso de mensagens novas
    } catch (falha) {
      setErro(mensagemDoErro(falha));
    }
  }, [id, carregarSuporte]);

  useEffect(() => {
    setConversa(null);
    void carregar();
  }, [carregar]);

  // Mensagem nova ou mudança de situação neste chamado: atualiza a conversa na hora.
  useEffect(() => {
    const aoMudar = (e: Event) => {
      if ((e as CustomEvent<{ chamadoId?: number }>).detail?.chamadoId === Number(id)) void carregar();
    };
    window.addEventListener(EVENTO_SUPORTE, aoMudar);
    return () => window.removeEventListener(EVENTO_SUPORTE, aoMudar);
  }, [id, carregar]);

  const quantas = conversa?.mensagens.length ?? 0;
  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'nearest' });
  }, [quantas]);

  const enviar = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      await api(`/suporte/chamados/${id}/mensagens`, { corpo: { texto } });
      setTexto('');
      await carregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  // Enter envia; Shift+Enter quebra a linha.
  const aoTeclar = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void enviar();
    }
  };

  const mudarSituacao = async (status: StatusChamado) => {
    try {
      await api(`/suporte/chamados/${id}/status`, { corpo: { status } });
      await carregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const avaliar = async (nota: number) => {
    try {
      await api(`/suporte/chamados/${id}/avaliacao`, { corpo: { nota } });
      avisar('Obrigado por avaliar o atendimento!', 'sucesso');
      await carregar();
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  const excluir = async () => {
    if (!window.confirm('Excluir este chamado e todas as mensagens dele? Esta ação não pode ser desfeita.')) return;
    try {
      await api(`/suporte/chamados/${id}`, { metodo: 'DELETE' });
      avisar('Chamado excluído.', 'sucesso');
      navegar(voltarPara);
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    }
  };

  if (erro && !conversa) {
    return (
      <div className="pagina">
        <ErroDeCarga erro={erro} />
        <p className="centro">
          <Link className="link" to={voltarPara}>
            Voltar
          </Link>
        </p>
      </div>
    );
  }
  if (!conversa) return <Carregando />;

  const { chamado, papel, mensagens, autor } = conversa;
  const resolvido = chamado.status === 'resolvido';

  return (
    <div className="pagina">
      <Link className="voltar" to={voltarPara}>
        <Icone nome="voltar" tamanho={18} /> {papel === 'autor' ? 'Meus chamados' : 'Atendimento'}
      </Link>

      <div className="conversa">
        <header className="conversa-topo">
          <div className="cresce">
            <h1>{chamado.assunto}</h1>
            <p className="suave pequeno">
              {chamado.categoriaNome} · {papel === 'autor' ? `com ${chamado.atendente}` : chamado.paraProfessor ? `enviado a ${chamado.atendente}` : 'enviado à equipe'} · aberto {haQuantoTempo(chamado.criadoEm)}
            </p>
          </div>
          <Situacao status={chamado.status} visao={papel} />
          {resolvido ? (
            <button className="botao claro pequeno" onClick={() => void mudarSituacao('aberto')}>
              Reabrir
            </button>
          ) : (
            <button className="botao verde pequeno" onClick={() => void mudarSituacao('resolvido')}>
              <Icone nome="check" tamanho={16} /> Marcar como resolvido
            </button>
          )}
          {souAdmin && papel === 'atendente' && (
            <button className="botao-icone" title="Excluir chamado" aria-label="Excluir chamado" onClick={() => void excluir()}>
              <Icone nome="lixeira" tamanho={18} />
            </button>
          )}
        </header>

        {autor && (
          <div className="conversa-autor">
            <Icone nome="usuario" tamanho={20} />
            <span className="cresce">
              <strong>{autor.nome}</strong> <span className="suave">@{autor.usuario}</span>
              <span className="suave pequeno" style={{ display: 'block' }}>
                {PAPEIS[autor.papel]}
                {autor.serieNome ? ` · ${autor.serieNome}` : ''}
                {autor.status !== 'ativo' ? ` · conta ${autor.status === 'pendente' ? 'aguardando aprovação' : 'bloqueada'}` : ''}
              </span>
            </span>
            <Link className="link" to={souAdmin ? `/usuarios?q=${encodeURIComponent(autor.usuario)}` : `/perfil/${autor.id}`}>
              {souAdmin ? 'Ver conta' : 'Ver perfil'}
            </Link>
          </div>
        )}

        <div className="conversa-mensagens" aria-live="polite">
          {mensagens.map((m) => (
            <div key={m.id} className={`balao ${m.minha ? 'minha' : ''} ${m.doAtendente ? 'atendente' : ''}`}>
              <small>
                {m.minha ? 'Você' : m.autor} · {haQuantoTempo(m.criadoEm)}
              </small>
              <p>{m.texto}</p>
            </div>
          ))}
          <div ref={fim} />
        </div>

        {resolvido && papel === 'autor' && (
          <div className="conversa-avaliacao">
            <strong>{chamado.avaliacao ? 'Sua avaliação do atendimento' : 'Como foi o atendimento?'}</strong>
            <Estrelas nota={chamado.avaliacao} aoEscolher={(n) => void avaliar(n)} tamanho={34} />
          </div>
        )}
        {resolvido && papel === 'atendente' && chamado.avaliacao != null && (
          <div className="conversa-avaliacao">
            <strong>Avaliação do atendimento</strong>
            <Estrelas nota={chamado.avaliacao} tamanho={28} />
          </div>
        )}

        <form className="conversa-envio" onSubmit={enviar}>
          <textarea
            className="entrada"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={aoTeclar}
            maxLength={2000}
            placeholder={resolvido ? 'Escreva para reabrir a conversa...' : 'Escreva sua mensagem...'}
            aria-label="Mensagem"
          />
          <button className="botao rosa" disabled={enviando || !texto.trim()}>
            <Icone nome="enviar" tamanho={18} /> Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
