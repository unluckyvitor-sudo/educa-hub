import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEstado } from './estado';
import { conectarTempoReal, useDuelo } from './tempoReal';
import { Avisos, Carregando, Modal } from './componentes/comuns';
import { Icone } from './componentes/Icone';
import { Logo } from './componentes/Logo';
import { Layout } from './componentes/Layout';
import { Retrato } from './componentes/Retrato';
import { Entrar } from './paginas/Entrar';
import { Cadastro } from './paginas/Cadastro';
import { Aguardando } from './paginas/Aguardando';
import { Configuracoes } from './paginas/Configuracoes';
import { Perfil } from './paginas/Perfil';
import { Biblioteca } from './paginas/Biblioteca';
import { Conteudo } from './paginas/Conteudo';
import { Ajuda } from './paginas/Ajuda';
import { Chamado } from './paginas/Chamado';
import { Atendimento } from './paginas/Atendimento';
import { Inicio } from './paginas/aluno/Inicio';
import { Materias } from './paginas/aluno/Materias';
import { Materia } from './paginas/aluno/Materia';
import { Jogar } from './paginas/aluno/Jogar';
import { Desafios } from './paginas/aluno/Desafios';
import { Duelo } from './paginas/aluno/Duelo';
import { MeuProgresso } from './paginas/aluno/MeuProgresso';
import { MeuAvatar } from './paginas/aluno/MeuAvatar';
import { Amigos } from './paginas/aluno/Amigos';
import { PainelProfessor } from './paginas/professor/PainelProfessor';
import { Turmas } from './paginas/professor/Turmas';
import { TurmaDetalhe } from './paginas/professor/TurmaDetalhe';
import { MissoesProfessor } from './paginas/professor/MissoesProfessor';
import { AlunoDetalhe } from './paginas/professor/AlunoDetalhe';
import { PainelAdmin } from './paginas/admin/PainelAdmin';
import { UsuariosAdmin } from './paginas/admin/UsuariosAdmin';
import { TurmasAdmin } from './paginas/admin/TurmasAdmin';
import { Moderacao } from './paginas/admin/Moderacao';
import { Feedbacks } from './paginas/admin/Feedbacks';

// Páginas de desenvolvimento (/laboratorio e /visor): carregadas sob demanda e ausentes do build de produção.
const PAGINAS_DEV: Record<string, ReturnType<typeof lazy>> = import.meta.env.DEV
  ? {
      '/laboratorio': lazy(() => import('./paginas/Laboratorio').then((m) => ({ default: m.Laboratorio }))),
      '/visor': lazy(() => import('./paginas/VisorGlb').then((m) => ({ default: m.VisorGlb }))),
    }
  : {};

/** Convite de duelo recebido de um amigo, visível em qualquer página. */
function ConviteDeDuelo() {
  const convite = useDuelo((d) => d.convite);
  const responder = useDuelo((d) => d.responderConvite);
  return (
    <Modal aberto={!!convite}>
      {convite && (
        <div className="centro">
          <Retrato avatar={convite.de.avatar} tamanho={110} />
          <h2 style={{ marginTop: 16 }}>{convite.de.nome} desafiou você!</h2>
          <p className="suave">Duelo de conhecimento — {convite.materia}</p>
          <div className="modal-acoes" style={{ justifyContent: 'center' }}>
            <button className="botao claro" onClick={() => responder(false)}>
              Agora não
            </button>
            <button className="botao rosa" onClick={() => responder(true)}>
              <Icone nome="espadas" tamanho={20} /> Aceitar duelo
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Moldura simples para o professor que ainda aguarda aprovação: sem menu, só a ajuda. */
function AreaDeEspera() {
  return (
    <div className="area-de-espera">
      <header>
        <Logo altura={40} />
        <Link className="botao claro pequeno" to="/">
          <Icone nome="voltar" tamanho={16} /> Voltar
        </Link>
      </header>
      <Outlet />
    </div>
  );
}

/** Quando um duelo começa (busca, convite aceito), leva o aluno para a arena. */
function useIrParaODuelo() {
  const fase = useDuelo((d) => d.fase);
  const navegar = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (fase === 'inicio' && pathname !== '/duelo') navegar('/duelo');
    // Convite enviado ou busca iniciada em outra página: a espera acontece na aba de duelos.
    if ((fase === 'buscando' || fase === 'convidando') && pathname !== '/desafios') navegar('/desafios?aba=duelos');
  }, [fase, pathname, navegar]);
}

export function App() {
  const usuario = useEstado((e) => e.usuario);
  const carregando = useEstado((e) => e.carregando);
  const carregarSessao = useEstado((e) => e.carregarSessao);
  const carregarNotificacoes = useEstado((e) => e.carregarNotificacoes);
  const carregarSuporte = useEstado((e) => e.carregarSuporte);
  useIrParaODuelo();

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  const id = usuario?.id;
  useEffect(() => {
    if (!id) return;
    conectarTempoReal();
    void carregarNotificacoes();
    void carregarSuporte();
  }, [id, carregarNotificacoes, carregarSuporte]);

  const { pathname } = useLocation();
  const PaginaDev = PAGINAS_DEV[pathname];
  if (PaginaDev) {
    return (
      <Suspense fallback={<Carregando />}>
        <PaginaDev />
      </Suspense>
    );
  }
  if (carregando) return <Carregando texto="Acordando o gato..." />;

  const papel = usuario?.papel;
  return (
    <>
      <Routes>
        {!usuario ? (
          <>
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="*" element={<Navigate to="/entrar" replace />} />
          </>
        ) : papel === 'professor' && usuario.status === 'pendente' ? (
          <>
            {/* Quem aguarda aprovação já pode falar com o suporte. */}
            <Route element={<AreaDeEspera />}>
              <Route path="/ajuda" element={<Ajuda />} />
              <Route path="/ajuda/chamados/:id" element={<Chamado voltarPara="/ajuda?aba=chamados" />} />
            </Route>
            <Route path="*" element={<Aguardando />} />
          </>
        ) : (
          <>
            {papel === 'aluno' && (
              <>
                <Route path="/jogar/missao/:missaoId" element={<Jogar />} />
                <Route path="/jogar/revisao" element={<Jogar revisao />} />
                <Route path="/jogar/:topicoId/:modo" element={<Jogar />} />
                <Route path="/duelo" element={<Duelo />} />
              </>
            )}
            <Route element={<Layout />}>
              {papel === 'aluno' && (
                <>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/materias" element={<Materias />} />
                  <Route path="/materias/:materiaId" element={<Materia />} />
                  <Route path="/desafios" element={<Desafios />} />
                  <Route path="/progresso" element={<MeuProgresso />} />
                  <Route path="/avatar" element={<MeuAvatar />} />
                  <Route path="/amigos" element={<Amigos />} />
                </>
              )}
              {papel === 'professor' && (
                <>
                  <Route path="/" element={<PainelProfessor />} />
                  <Route path="/turmas" element={<Turmas />} />
                  <Route path="/missoes" element={<MissoesProfessor />} />
                </>
              )}
              {papel === 'admin' && (
                <>
                  <Route path="/" element={<PainelAdmin />} />
                  <Route path="/usuarios" element={<UsuariosAdmin />} />
                  <Route path="/turmas" element={<TurmasAdmin />} />
                  <Route path="/moderacao" element={<Moderacao />} />
                  <Route path="/feedbacks" element={<Feedbacks />} />
                </>
              )}
              {papel !== 'aluno' && (
                <>
                  <Route path="/turmas/:turmaId" element={<TurmaDetalhe />} />
                  <Route path="/alunos/:alunoId" element={<AlunoDetalhe />} />
                  <Route path="/atendimento" element={<Atendimento />} />
                  <Route path="/atendimento/:id" element={<Chamado voltarPara="/atendimento" />} />
                  <Route path="/conteudo/:topicoId" element={<Conteudo />} />
                </>
              )}
              <Route path="/ajuda" element={<Ajuda />} />
              <Route path="/ajuda/chamados/:id" element={<Chamado voltarPara="/ajuda?aba=chamados" />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/perfil/:usuarioId" element={<Perfil />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>
      {papel === 'aluno' && <ConviteDeDuelo />}
      <Avisos />
    </>
  );
}
