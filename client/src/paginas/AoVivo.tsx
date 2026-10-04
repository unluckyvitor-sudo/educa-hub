// Quiz ao vivo: a tela do professor (pensada para projetar) e a do aluno, que responde no próprio aparelho.
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAoVivo, type CartaoAoVivo, type SessaoAoVivo } from '../aoVivo';
import { useEstado } from '../estado';
import { GatoVivo } from '../gato/GatoVivo';
import { tocar } from '../sons';
import { coresDaMateria } from '../visual';
import { Carregando, Modal } from '../componentes/comuns';
import { soltarConfete } from '../componentes/Gamificacao';
import { Icone, Moeda, Xp } from '../componentes/Icone';
import { Retrato } from '../componentes/Retrato';
import type { Topico } from '../tipos';

const LETRAS = ['A', 'B', 'C', 'D'];

/** Barra de tempo da pergunta, acertada pelo relógio do servidor. */
function Cronometro({ sessao }: { sessao: SessaoAoVivo }) {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(Date.now()), 100);
    return () => window.clearInterval(relogio);
  }, []);
  const restante = Math.max(0, (sessao.pergunta?.restanteMs ?? 0) - (agora - sessao.recebidaEm));
  const fracao = restante / (sessao.tempo * 1000);
  return (
    <div className="aovivo-tempo">
      <div className={`quiz-tempo ${fracao < 0.25 ? 'urgente' : ''}`}>
        <i style={{ width: `${fracao * 100}%` }} />
      </div>
      <strong>{Math.ceil(restante / 1000)}s</strong>
    </div>
  );
}

function Alternativas({ sessao, aoResponder }: { sessao: SessaoAoVivo; aoResponder?: (i: number) => void }) {
  const { pergunta, resultado } = sessao;
  if (!pergunta) return null;
  const maior = Math.max(1, ...(resultado?.distribuicao ?? [1]));
  return (
    <div className="alternativas">
      {pergunta.alternativas.map((texto, i) => {
        // Na tela do professor as erradas não ficam apagadas: a contagem de cada uma precisa continuar legível.
        const classe = resultado ? (resultado.correta === i ? 'certa' : pergunta.minhaResposta === i ? 'errada' : sessao.conduz ? '' : 'apagada') : pergunta.minhaResposta === i ? 'escolhida' : '';
        return (
          <button key={i} className={`alternativa a${i} ${classe}`} disabled={!aoResponder || pergunta.minhaResposta !== null || !!resultado} onClick={() => aoResponder?.(i)}>
            <span className="alternativa-letra">{LETRAS[i]}</span>
            <span className="cresce">{texto}</span>
            {resultado && sessao.conduz && (
              <span className="aovivo-votos" title="Quantos alunos escolheram esta resposta">
                <i style={{ width: `${(resultado.distribuicao[i] / maior) * 100}%` }} />
                <b>{resultado.distribuicao[i]}</b>
              </span>
            )}
            {resultado && resultado.correta === i && <Icone nome="check" tamanho={24} />}
          </button>
        );
      })}
    </div>
  );
}

function Classificacao({ lista, destaque, limite = 40 }: { lista: CartaoAoVivo[]; destaque?: number; limite?: number }) {
  return (
    <ol className="aovivo-lista">
      {lista.slice(0, limite).map((p, i) => (
        <li key={p.id} className={p.id === destaque ? 'eu' : ''}>
          <b className={`posicao p${i + 1}`}>{i + 1}</b>
          <Retrato avatar={p.avatar} tamanho={40} />
          <span className="cresce pessoa-nome">{p.nome}</span>
          <span className="suave pequeno">{p.acertos} {p.acertos === 1 ? 'acerto' : 'acertos'}</span>
          <strong>{p.pontos}</strong>
        </li>
      ))}
    </ol>
  );
}

function Podio({ lista }: { lista: CartaoAoVivo[] }) {
  // Segundo lugar à esquerda, primeiro no meio, terceiro à direita.
  const ordem = [lista[1], lista[0], lista[2]];
  return (
    <div className="aovivo-podio">
      {ordem.map((p, i) =>
        p ? (
          <div key={p.id} className={`degrau d${[2, 1, 3][i]}`}>
            <Retrato avatar={p.avatar} tamanho={i === 1 ? 96 : 76} />
            <strong>{p.nome.split(' ')[0]}</strong>
            <span>{p.pontos} pts</span>
            <i>{[2, 1, 3][i]}º</i>
          </div>
        ) : (
          <div key={i} className="degrau vazio" />
        ),
      )}
    </div>
  );
}

// ───────────── Professor ─────────────

function Condutor({ sessao, aoSair }: { sessao: SessaoAoVivo; aoSair: () => void }) {
  const avancar = useAoVivo((s) => s.avancar);
  const { fase } = sessao;
  const ultima = sessao.indice + 1 >= sessao.total;

  return (
    <>
      {fase === 'sala' && (
        <div className="aovivo-cartao centro">
          <span className="etiqueta rosa">{sessao.turma}</span>
          <h1>{sessao.titulo}</h1>
          <p className="subtitulo">
            {sessao.total} perguntas, {sessao.tempo} segundos cada. O convite aparece na tela de cada aluno da turma que estiver com o EducaHub aberto.
          </p>
          <div className="aovivo-sala">
            {sessao.sala?.length ? (
              sessao.sala.map((p) => (
                <span key={p.id} className="aovivo-presente">
                  <Retrato avatar={p.avatar} tamanho={64} />
                  {p.nome.split(' ')[0]}
                </span>
              ))
            ) : (
              <p className="suave">Esperando os alunos entrarem na sala...</p>
            )}
          </div>
          <button className="botao rosa grande" disabled={!sessao.participantes} onClick={() => void avancar()}>
            <Icone nome="jogar" tamanho={20} /> {sessao.participantes ? `Começar com ${sessao.participantes} ${sessao.participantes === 1 ? 'aluno' : 'alunos'}` : 'Começar'}
          </button>
        </div>
      )}

      {(fase === 'pergunta' || fase === 'resultado') && sessao.pergunta && (
        <div className="aovivo-cartao">
          <div className="linha quebra">
            <span className="etiqueta">
              Pergunta {sessao.indice + 1} de {sessao.total}
            </span>
            <span className="etiqueta verde acao">
              {sessao.pergunta.responderam} de {sessao.participantes} responderam
            </span>
          </div>
          {fase === 'pergunta' && <Cronometro sessao={sessao} />}
          <h1 className="aovivo-enunciado">{sessao.pergunta.enunciado}</h1>
          <Alternativas sessao={sessao} />
          {sessao.resultado?.explicacao && <p className="aovivo-explicacao">{sessao.resultado.explicacao}</p>}
          <div className="linha quebra" style={{ justifyContent: 'flex-end' }}>
            <button className={`botao ${fase === 'pergunta' ? 'claro' : 'rosa'} grande`} onClick={() => void avancar()}>
              {fase === 'pergunta' ? 'Fechar a pergunta agora' : ultima ? 'Ver o pódio' : 'Próxima pergunta'} <Icone nome="seta" tamanho={18} />
            </button>
          </div>
          {fase === 'resultado' && sessao.podio && (
            <>
              <h2 style={{ marginTop: 8 }}>Classificação</h2>
              <Classificacao lista={sessao.podio} limite={5} />
            </>
          )}
        </div>
      )}

      {fase === 'fim' && sessao.podio && (
        <div className="aovivo-cartao centro">
          <h1>Pódio</h1>
          <p className="subtitulo">{sessao.titulo} · {sessao.turma}</p>
          <Podio lista={sessao.podio} />
          <Classificacao lista={sessao.podio} />
          <p className="suave pequeno">As respostas já contam no relatório de dificuldades da turma, e o que cada aluno errou foi para o caderno de erros dele.</p>
          <button className="botao" onClick={aoSair}>
            Encerrar e voltar <Icone nome="seta" tamanho={18} />
          </button>
        </div>
      )}
    </>
  );
}

// ───────────── Aluno ─────────────

function Participante({ sessao }: { sessao: SessaoAoVivo }) {
  const usuario = useEstado((e) => e.usuario)!;
  const responder = useAoVivo((s) => s.responder);
  const { fase, eu, pergunta, resultado } = sessao;
  const avisado = useRef('');

  // Som e confete uma vez por resultado.
  useEffect(() => {
    const chave = `${sessao.id}:${fase}:${sessao.indice}`;
    if (avisado.current === chave) return;
    avisado.current = chave;
    if (fase === 'resultado' && pergunta?.minhaResposta !== null) tocar(resultado?.acertei ? 'acerto' : 'erro');
    if (fase === 'fim') {
      tocar(eu && eu.posicao <= 3 ? 'vitoria' : 'acerto');
      if (eu && eu.posicao <= 3) soltarConfete();
    }
  }, [sessao.id, fase, sessao.indice, pergunta, resultado, eu]);

  return (
    <>
      {fase === 'sala' && (
        <div className="aovivo-cartao centro">
          <GatoVivo className="aovivo-gato" avatar={usuario.avatar} animacao="acenar" enquadramento="busto" />
          <h1>Você está na sala!</h1>
          <p className="subtitulo">
            {sessao.titulo} · {sessao.total} perguntas. Assim que {sessao.professor.split(' ')[0]} começar, a primeira pergunta aparece aqui.
          </p>
          <div className="aovivo-sala">
            {sessao.sala?.map((p) => (
              <span key={p.id} className="aovivo-presente">
                <Retrato avatar={p.avatar} tamanho={52} />
                {p.nome.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {(fase === 'pergunta' || fase === 'resultado') && pergunta && (
        <div className="aovivo-cartao">
          <div className="linha quebra">
            <span className="etiqueta">
              Pergunta {sessao.indice + 1} de {sessao.total}
            </span>
            {eu && (
              <span className="etiqueta amarela acao">
                {eu.pontos} pts · {eu.posicao}º lugar
              </span>
            )}
          </div>
          {fase === 'pergunta' && <Cronometro sessao={sessao} />}
          <h2 className="quiz-enunciado">{pergunta.enunciado}</h2>
          <Alternativas sessao={sessao} aoResponder={(i) => void responder(i)} />
          {fase === 'pergunta' && pergunta.minhaResposta !== null && <p className="aovivo-espera">Resposta enviada! Esperando a turma...</p>}
          {resultado && (
            <div className={`quiz-retorno ${resultado.acertei ? 'acerto' : 'erro'}`}>
              <div className="cresce">
                <strong>{resultado.acertei ? `Isso mesmo! +${resultado.ganho} pontos` : pergunta.minhaResposta === null ? 'O tempo acabou!' : 'Não foi dessa vez.'}</strong>
                {!resultado.acertei && <p>Resposta certa: {pergunta.alternativas[resultado.correta]}</p>}
                {resultado.explicacao && <p>{resultado.explicacao}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {fase === 'fim' && sessao.podio && eu && (
        <div className="aovivo-cartao centro">
          <h1>{eu.posicao <= 3 ? `${eu.posicao}º lugar!` : `Você ficou em ${eu.posicao}º lugar`}</h1>
          <p className="subtitulo">
            {eu.acertos} de {sessao.total} acertos · {eu.pontos} pontos
          </p>
          {eu.recompensa && (eu.recompensa.xp > 0 || eu.recompensa.moedas > 0) && (
            <div className="resultado-numeros">
              <div>
                <strong className="valor">
                  <Xp tamanho={28} /> +{eu.recompensa.xp}
                </strong>
                <span>experiência</span>
              </div>
              <div>
                <strong className="valor">
                  <Moeda tamanho={28} /> +{eu.recompensa.moedas}
                </strong>
                <span>moedas</span>
              </div>
            </div>
          )}
          <Podio lista={sessao.podio} />
          <Classificacao lista={sessao.podio} destaque={usuario.id} />
          <Link className="botao" to="/">
            Voltar ao início <Icone nome="seta" tamanho={18} />
          </Link>
        </div>
      )}
    </>
  );
}

// ───────────── Página ─────────────

export function AoVivo() {
  const usuario = useEstado((e) => e.usuario)!;
  const sessao = useAoVivo((s) => s.sessao);
  const carregar = useAoVivo((s) => s.carregar);
  const entrar = useAoVivo((s) => s.entrar);
  const encerrar = useAoVivo((s) => s.encerrar);
  const navegar = useNavigate();
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    void carregar().then(() => setCarregado(true));
  }, [carregar]);

  const cores = coresDaMateria(sessao?.materia);
  const estilo = { '--claro': cores.claro, '--claro2': cores.claro2, '--forte': cores.forte } as CSSProperties;
  const inicio = usuario.papel === 'aluno' ? '/' : '/turmas';

  const sair = async () => {
    if (sessao?.conduz) {
      const emJogo = sessao.fase === 'pergunta' || sessao.fase === 'resultado';
      if (sessao.fase !== 'fim' && !window.confirm(emJogo ? 'Encerrar o quiz agora? Vale o que já foi respondido.' : 'Cancelar este quiz ao vivo?')) return;
      await encerrar();
      // No meio do jogo, encerrar leva ao pódio; nos outros casos a sessão é fechada.
      if (!emJogo) navegar(inicio);
      return;
    }
    navegar(inicio);
  };

  return (
    <div className="jogo aovivo" style={estilo}>
      <header className="jogo-topo">
        <button className="botao-icone" onClick={() => void sair()} aria-label={sessao?.conduz ? 'Encerrar o quiz' : 'Sair'} title={sessao?.conduz ? 'Encerrar o quiz' : 'Sair'}>
          <Icone nome="x" />
        </button>
        <div className="cresce">
          <strong className="jogo-titulo">{sessao?.titulo ?? 'Quiz ao vivo'}</strong>
          <span className="suave pequeno">{sessao ? `Quiz ao vivo · ${sessao.turma}${sessao.conduz ? '' : ` · Prof. ${sessao.professor}`}` : 'Nenhum quiz em andamento'}</span>
        </div>
        {sessao && <span className="ficha">{sessao.participantes} na sala</span>}
      </header>

      <main className="aovivo-palco">
        {!carregado ? (
          <Carregando texto="Procurando o quiz..." />
        ) : !sessao ? (
          <div className="aovivo-cartao centro">
            <h1>Nenhum quiz ao vivo agora</h1>
            <p className="subtitulo">{usuario.papel === 'aluno' ? 'Quando o professor da sua turma começar um, o convite aparece na sua tela.' : 'Abra uma turma e use o botão "Quiz ao vivo" para começar.'}</p>
            <Link className="botao" to={inicio}>
              Voltar
            </Link>
          </div>
        ) : sessao.conduz ? (
          <Condutor sessao={sessao} aoSair={() => void sair()} />
        ) : sessao.participando ? (
          <Participante sessao={sessao} />
        ) : (
          <div className="aovivo-cartao centro">
            <h1>{sessao.titulo}</h1>
            <p className="subtitulo">
              Quiz ao vivo da turma {sessao.turma}, com Prof. {sessao.professor}.{sessao.fase !== 'sala' && ' Já começou, mas ainda dá para entrar.'}
            </p>
            <button className="botao rosa grande" onClick={() => void entrar()}>
              Entrar na sala
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/** Convite que aparece em qualquer página quando o professor da turma abre um quiz ao vivo. */
export function ConviteAoVivo() {
  const sessao = useAoVivo((s) => s.sessao);
  const dispensado = useAoVivo((s) => s.dispensado);
  const entrar = useAoVivo((s) => s.entrar);
  const dispensar = useAoVivo((s) => s.dispensar);
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const noQuiz = pathname === '/aovivo';

  // Quem já está participando (e recarregou a página, por exemplo) volta direto para o quiz.
  const voltar = !!sessao && sessao.participando && sessao.fase !== 'fim' && !noQuiz && !pathname.startsWith('/jogar') && pathname !== '/duelo';
  useEffect(() => {
    if (voltar) navegar('/aovivo');
  }, [voltar, navegar]);

  const convidar = !!sessao && !sessao.conduz && !sessao.participando && sessao.fase !== 'fim' && dispensado !== sessao.id && !noQuiz;
  return (
    <Modal aberto={convidar} aoFechar={dispensar}>
      {sessao && convidar && (
        <div className="centro">
          <span className="etiqueta rosa">Quiz ao vivo · {sessao.turma}</span>
          <h2 style={{ marginTop: 12 }}>Prof. {sessao.professor} chamou a turma!</h2>
          <p className="suave">
            {sessao.titulo} — {sessao.total} perguntas valendo pontos, com todo mundo ao mesmo tempo.
          </p>
          <div className="modal-acoes" style={{ justifyContent: 'center' }}>
            <button className="botao claro" onClick={dispensar}>
              Agora não
            </button>
            <button className="botao rosa" onClick={() => void entrar().then((ok) => ok && navegar('/aovivo'))}>
              <Icone nome="jogar" tamanho={18} /> Entrar na sala
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Janela em que o professor escolhe o assunto do quiz ao vivo de uma turma. */
export function FormAoVivo({ aberto, aoFechar, turma, materias }: { aberto: boolean; aoFechar: () => void; turma: { id: number; nome: string; serie: string }; materias: { id: string; nome: string }[] }) {
  const criar = useAoVivo((s) => s.criar);
  const navegar = useNavigate();
  const [materia, setMateria] = useState(materias[0]?.id ?? '');
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [topicoId, setTopicoId] = useState('');
  const [quantidade, setQuantidade] = useState(8);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto || !materia) return;
    let ativo = true;
    setTopicoId('');
    api<{ topicos: Topico[] }>(`/materias/${materia}?serie=${turma.serie}`)
      .then((r) => ativo && setTopicos(r.topicos))
      .catch(() => ativo && setTopicos([]));
    return () => {
      ativo = false;
    };
  }, [aberto, materia, turma.serie]);

  const disponiveis = topicoId ? (topicos.find((t) => t.id === topicoId)?.questoes ?? 0) : topicos.reduce((soma, t) => soma + t.questoes, 0);

  const comecar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const ok = await criar({ turmaId: turma.id, materia, ...(topicoId ? { topicoId } : {}), quantidade: Math.min(quantidade, Math.max(3, disponiveis)) });
    setEnviando(false);
    if (ok) navegar('/aovivo');
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar}>
      <form onSubmit={comecar} className="coluna" style={{ gap: 14 }}>
        <h2>Quiz ao vivo — {turma.nome}</h2>
        <p className="suave pequeno">Você conduz as perguntas (dá para projetar esta tela) e cada aluno responde no próprio aparelho. Quem estiver com o EducaHub aberto recebe o convite.</p>
        <label className="campo">
          <span>Matéria</span>
          <select className="entrada" value={materia} onChange={(e) => setMateria(e.target.value)}>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Assunto</span>
          <select className="entrada" value={topicoId} onChange={(e) => setTopicoId(e.target.value)}>
            <option value="">Todos os tópicos da matéria (revisão geral)</option>
            {topicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.titulo} ({t.questoes} questões)
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Quantidade de perguntas ({disponiveis} disponíveis)</span>
          <select className="entrada" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))}>
            {[5, 8, 10, 12, 15].map((n) => (
              <option key={n} value={n} disabled={n > disponiveis && n !== 5}>
                {n} perguntas
              </option>
            ))}
          </select>
        </label>
        <div className="modal-acoes">
          <button type="button" className="botao claro" onClick={aoFechar}>
            Cancelar
          </button>
          <button className="botao rosa" disabled={enviando || disponiveis < 3}>
            {enviando ? 'Abrindo a sala...' : 'Abrir a sala'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
