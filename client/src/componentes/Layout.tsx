import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useEstado } from '../estado';
import { desconectarTempoReal } from '../tempoReal';
import { haQuantoTempo } from '../visual';
import { Icone, Moeda, Chama } from './Icone';
import { Logo } from './Logo';
import { Retrato } from './Retrato';
import { Coroa, Seta, Coracao } from './Rabiscos';
import type { Papel } from '../tipos';

const MENUS: Record<Papel, { para: string; icone: string; rotulo: string }[]> = {
  aluno: [
    { para: '/', icone: 'inicio', rotulo: 'Início' },
    { para: '/materias', icone: 'livro', rotulo: 'Minhas matérias' },
    { para: '/desafios', icone: 'trofeu', rotulo: 'Desafios' },
    { para: '/progresso', icone: 'grafico', rotulo: 'Meu progresso' },
    { para: '/biblioteca', icone: 'pasta', rotulo: 'Biblioteca' },
    { para: '/configuracoes', icone: 'engrenagem', rotulo: 'Configurações' },
  ],
  professor: [
    { para: '/', icone: 'inicio', rotulo: 'Início' },
    { para: '/turmas', icone: 'usuarios', rotulo: 'Minhas turmas' },
    { para: '/missoes', icone: 'alvo', rotulo: 'Missões' },
    { para: '/atendimento', icone: 'mensagem', rotulo: 'Dúvidas dos alunos' },
    { para: '/biblioteca', icone: 'pasta', rotulo: 'Biblioteca' },
    { para: '/configuracoes', icone: 'engrenagem', rotulo: 'Configurações' },
  ],
  admin: [
    { para: '/', icone: 'inicio', rotulo: 'Visão geral' },
    { para: '/usuarios', icone: 'usuarios', rotulo: 'Usuários' },
    { para: '/turmas', icone: 'chapeu', rotulo: 'Turmas' },
    { para: '/atendimento', icone: 'mensagem', rotulo: 'Suporte' },
    { para: '/feedbacks', icone: 'coracao', rotulo: 'Feedbacks' },
    { para: '/moderacao', icone: 'escudo', rotulo: 'Moderação' },
    { para: '/biblioteca', icone: 'pasta', rotulo: 'Biblioteca' },
    { para: '/configuracoes', icone: 'engrenagem', rotulo: 'Configurações' },
  ],
};

function Pata() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="#ff4f9a" aria-hidden="true">
      <ellipse cx="16" cy="21" rx="7" ry="6" />
      <ellipse cx="6.500" cy="14" rx="3" ry="4" />
      <ellipse cx="12.500" cy="8" rx="3" ry="4" />
      <ellipse cx="19.500" cy="8" rx="3" ry="4" />
      <ellipse cx="25.500" cy="14" rx="3" ry="4" />
    </svg>
  );
}

/** Abre um painel suspenso e o fecha ao clicar fora ou mudar de página. */
function Suspenso({ botao, children, className = '' }: { botao: (abrir: () => void, aberto: boolean) => ReactNode; children: (fechar: () => void) => ReactNode; className?: string }) {
  const [aberto, setAberto] = useState(false);
  const ancora = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setAberto(false), [pathname]);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !ancora.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [aberto]);

  return (
    <div className="suspenso-ancora" ref={ancora}>
      {botao(() => setAberto((a) => !a), aberto)}
      {aberto && <div className={`suspenso ${className}`}>{children(() => setAberto(false))}</div>}
    </div>
  );
}

function Topo() {
  const usuario = useEstado((e) => e.usuario)!;
  const notificacoes = useEstado((e) => e.notificacoes);
  const marcarLidas = useEstado((e) => e.marcarNotificacoesLidas);
  const definirUsuario = useEstado((e) => e.definirUsuario);
  const navegar = useNavigate();
  const [busca, setBusca] = useState('');
  const novas = notificacoes.filter((n) => !n.lida).length;
  const respostasDoSuporte = useEstado((e) => e.suporte.respostasNovas);
  const aluno = usuario.papel === 'aluno';

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    navegar(`/biblioteca${busca.trim() ? `?q=${encodeURIComponent(busca.trim())}` : ''}`);
  };

  const sair = async () => {
    await api('/auth/sair', { metodo: 'POST' }).catch(() => {});
    desconectarTempoReal();
    definirUsuario(null);
    navegar('/entrar');
  };

  return (
    <header className="topo">
      <Link to="/" className="topo-marca">
        <Logo altura={46} />
      </Link>

      <form className="busca" onSubmit={buscar} role="search">
        <Icone nome="busca" tamanho={30} />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="O que você quer aprender hoje?" aria-label="Buscar conteúdo" />
      </form>

      {aluno && (
        <div className="topo-fichas">
          <Link to="/desafios" className={`ficha fogo ${usuario.jogouHoje ? '' : 'apagada'}`} title={usuario.jogouHoje ? 'Sequência de dias jogados' : 'Jogue hoje para manter sua sequência!'}>
            <Chama apagada={!usuario.jogouHoje} />
            {usuario.sequencia}
          </Link>
          <Link to="/avatar" className="ficha ouro" title="Suas moedas — abrir a loja">
            <Moeda />
            {usuario.moedas}
          </Link>
        </div>
      )}

      <Suspenso
        className="notificacoes"
        botao={(alternar) => (
          <button
            className="topo-sino"
            aria-label={`Notificações${novas ? ` (${novas} novas)` : ''}`}
            onClick={() => {
              alternar();
              // Marca como lidas só depois de um instante, para o destaque aparecer ao abrir.
              setTimeout(marcarLidas, 1500);
            }}
          >
            <Icone nome="sino" tamanho={34} />
            {novas > 0 && <i className="bolinha" />}
          </button>
        )}
      >
        {(fechar) =>
          notificacoes.length === 0 ? (
            <div className="vazio">
              <strong>Tudo tranquilo</strong>Nenhuma notificação por enquanto.
            </div>
          ) : (
            notificacoes.map((n) => (
              <button
                key={n.id}
                className={`notificacao ${n.lida ? '' : 'nova'}`}
                onClick={() => {
                  fechar();
                  if (n.link) navegar(n.link);
                }}
              >
                {n.texto}
                <small>{haQuantoTempo(n.criado_em ?? new Date().toISOString())}</small>
              </button>
            ))
          )
        }
      </Suspenso>

      <Suspenso
        botao={(alternar) => (
          <button className="topo-perfil" onClick={alternar} aria-label="Menu do perfil">
            <span className="pata">
              <Pata />
            </span>
            <Icone nome="chevron" />
            {respostasDoSuporte > 0 && <i className="bolinha" title="O suporte respondeu" />}
          </button>
        )}
      >
        {() => (
          <>
            <div className="suspenso-cabecalho">
              <Retrato avatar={usuario.avatar} tamanho={48} />
              <div className="cresce">
                <div className="pessoa-nome">{usuario.nome}</div>
                <div className="pessoa-sub">@{usuario.usuario}</div>
              </div>
            </div>
            <Link className="suspenso-item" to={`/perfil/${usuario.id}`}>
              <Icone nome="usuario" tamanho={20} /> Meu perfil
            </Link>
            {aluno && (
              <>
                <Link className="suspenso-item" to="/avatar">
                  <Icone nome="camiseta" tamanho={20} /> Meu avatar e loja
                </Link>
                <Link className="suspenso-item" to="/amigos">
                  <Icone nome="usuarios" tamanho={20} /> Amigos
                </Link>
              </>
            )}
            <Link className="suspenso-item" to="/configuracoes">
              <Icone nome="engrenagem" tamanho={20} /> Configurações
            </Link>
            <Link className="suspenso-item" to={respostasDoSuporte > 0 ? '/ajuda?aba=chamados' : '/ajuda'}>
              <Icone nome="info" tamanho={20} /> Ajuda e suporte
              {respostasDoSuporte > 0 && <b className="contador">{respostasDoSuporte}</b>}
            </Link>
            <button className="suspenso-item" onClick={sair}>
              <Icone nome="sair" tamanho={20} /> Sair
            </button>
          </>
        )}
      </Suspenso>
    </header>
  );
}

function Menu({ papel }: { papel: Papel }) {
  const suporte = useEstado((e) => e.suporte);
  // Pedidos esperando resposta e feedbacks novos aparecem como um número ao lado do item.
  const avisos: Record<string, number> = { '/atendimento': suporte.paraAtender, '/feedbacks': suporte.feedbacksNovos };
  return (
    <aside className="menu">
      <nav aria-label="Navegação principal">
        {MENUS[papel].map((item) => (
          <NavLink key={item.para} to={item.para} end={item.para === '/'} className={({ isActive }) => `menu-item ${isActive ? 'ativo' : ''}`} title={item.rotulo}>
            <Icone nome={item.icone} tamanho={34} />
            <span>{item.rotulo}</span>
            {avisos[item.para] > 0 && <b className="contador">{avisos[item.para]}</b>}
          </NavLink>
        ))}
      </nav>
      <div className="menu-rabiscos" aria-hidden="true">
        <Coroa className="r-coroa" tamanho={66} />
        <Seta className="r-seta" tamanho={84} />
        <Coracao className="r-coracao" tamanho={56} />
        <div className="menu-assinatura">EducaHub</div>
      </div>
      <svg className="menu-onda" viewBox="0 0 252 150" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 52c40-22 86-14 122 16s84 46 130 18v64H0z" fill="#8f86ee" />
        <path d="M0 78c46-20 92-6 130 24s82 30 122 8v40H0z" fill="#c9c6fb" />
      </svg>
    </aside>
  );
}

export function Layout() {
  const usuario = useEstado((e) => e.usuario)!;

  return (
    <div className="app">
      <Topo />
      <Menu papel={usuario.papel} />
      <main className="conteudo">
        <Outlet />
        <svg className="onda-rodape" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70c120-50 250-40 380 0s260 40 400 0 280-50 420-10v60H0z" fill="#e4e2fc" />
          <path d="M0 96c140-30 280-26 420 2s280 22 420-4 240-22 360-4v30H0z" fill="#d3d0fa" />
        </svg>
      </main>
    </div>
  );
}
