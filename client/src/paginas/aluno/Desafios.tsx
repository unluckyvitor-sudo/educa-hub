import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useEstado } from '../../estado';
import { GatoVivo } from '../../gato/GatoVivo';
import { EVENTO_PRESENCA, useDuelo } from '../../tempoReal';
import { Carregando, ErroDeCarga, Vazio, useCarregar } from '../../componentes/comuns';
import { CartaoMissao, CartaoSequencia, ListaRanking } from '../../componentes/Gamificacao';
import { Icone } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import type { Amigo, InfoSequencia, MateriaResumo, Missao, PosicaoRanking } from '../../tipos';

type Aba = 'missoes' | 'duelos' | 'ranking';

function AbaMissoes() {
  const { dados, erro, recarregar } = useCarregar(() => api<{ missoes: Missao[]; sequencia: InfoSequencia }>('/missoes'));
  if (erro) return <ErroDeCarga erro={erro} />;
  if (!dados) return <Carregando />;

  const grupos = [
    { titulo: 'Dos seus professores', lista: dados.missoes.filter((m) => m.origem === 'professor') },
    { titulo: 'Missões diárias', lista: dados.missoes.filter((m) => m.origem === 'sistema' && m.periodo === 'diaria') },
    { titulo: 'Missões da semana', lista: dados.missoes.filter((m) => m.origem === 'sistema' && m.periodo === 'semanal') },
  ];

  return (
    <div className="grade-2">
      <div className="coluna">
        {grupos
          .filter((g) => g.lista.length)
          .map((g) => (
            <section key={g.titulo} className="cartao">
              <div className="cartao-titulo">
                <h2>{g.titulo}</h2>
              </div>
              <div className="coluna" style={{ gap: 12 }}>
                {g.lista.map((m) => (
                  <CartaoMissao key={m.chave} missao={m} aoResgatar={recarregar} />
                ))}
              </div>
            </section>
          ))}
      </div>
      <section className="cartao" style={{ alignSelf: 'start' }}>
        <div className="cartao-titulo">
          <h2>Sequência de dias</h2>
        </div>
        <CartaoSequencia sequencia={dados.sequencia} />
      </section>
    </div>
  );
}

function AbaDuelos() {
  const usuario = useEstado((e) => e.usuario)!;
  const { fase, aguardando, buscar, treinar, convidar, cancelarBusca } = useDuelo();
  const [materia, setMateria] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const { dados: materias } = useCarregar(() => api<{ materias: MateriaResumo[] }>('/materias'));
  const { dados: amigos, recarregar } = useCarregar(() => api<{ amigos: Amigo[] }>('/amigos'));

  useEffect(() => {
    window.addEventListener(EVENTO_PRESENCA, recarregar);
    return () => window.removeEventListener(EVENTO_PRESENCA, recarregar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Conta o tempo de espera para oferecer o treino quando ninguém aparece.
  const procurando = fase === 'buscando' || fase === 'convidando';
  useEffect(() => {
    if (!procurando) return setSegundos(0);
    const relogio = window.setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => window.clearInterval(relogio);
  }, [procurando]);

  if (procurando) {
    return (
      <section className="cartao arena-espera">
        <GatoVivo className="arena-gato" avatar={usuario.avatar} animacao="pensar" enquadramento="busto" />
        <h2>{fase === 'convidando' ? `Aguardando ${aguardando ?? 'seu amigo'} aceitar...` : 'Procurando um oponente do seu nível...'}</h2>
        <p className="suave">{segundos}s</p>
        <div className="linha quebra" style={{ justifyContent: 'center' }}>
          <button className="botao claro" onClick={cancelarBusca}>
            Cancelar
          </button>
          {fase === 'buscando' && segundos >= 8 && (
            <button className="botao rosa" onClick={() => treinar(materia)}>
              Treinar com o Mestre Bigodes
            </button>
          )}
        </div>
        {fase === 'buscando' && segundos >= 8 && <p className="suave pequeno">Ninguém online agora? O Mestre Bigodes topa um treino (vale metade das recompensas).</p>}
      </section>
    );
  }

  const online = amigos?.amigos.filter((a) => a.online) ?? [];

  return (
    <div className="grade-2">
      <section className="cartao arena">
        <div className="cartao-titulo">
          <Icone nome="espadas" tamanho={32} style={{ color: '#ff4f9a' }} />
          <div>
            <h2>Arena de duelos</h2>
            <p className="subtitulo">5 perguntas, 15 segundos cada. Quem responde certo e rápido faz mais pontos!</p>
          </div>
        </div>
        <div className="campo">
          <span>Matéria do duelo</span>
          <div className="chips">
            <button className={`chip ${materia === null ? 'ativo' : ''}`} onClick={() => setMateria(null)}>
              Todas
            </button>
            {materias?.materias.map((m) => (
              <button key={m.id} className={`chip ${materia === m.id ? 'ativo' : ''}`} onClick={() => setMateria(m.id)}>
                {m.nome}
              </button>
            ))}
          </div>
        </div>
        <div className="arena-botoes">
          <button className="botao rosa grande" onClick={() => buscar(materia)}>
            <Icone nome="espadas" tamanho={22} /> Desafiar alguém do {usuario.serieNome}
          </button>
          <button className="botao claro grande" onClick={() => treinar(materia)}>
            Treinar com o Mestre Bigodes
          </button>
        </div>
        <p className="suave pequeno">Vitória: 40 XP e 25 moedas · Empate: 25 XP e 12 moedas · Derrota: 15 XP e 5 moedas.</p>
      </section>

      <section className="cartao">
        <div className="cartao-titulo">
          <Icone nome="usuarios" tamanho={30} style={{ color: '#5b5ff0' }} />
          <h2>Desafiar um amigo</h2>
          <Link className="link acao" to="/amigos">
            Meus amigos
          </Link>
        </div>
        {!amigos ? (
          <Carregando />
        ) : amigos.amigos.length === 0 ? (
          <Vazio titulo="Você ainda não tem amigos por aqui">
            <Link className="link" to="/amigos">
              Encontre seus colegas
            </Link>{' '}
            e chame para um duelo com chat.
          </Vazio>
        ) : (
          <div className="coluna" style={{ gap: 8 }}>
            {online.length === 0 && <p className="suave">Nenhum amigo online agora.</p>}
            {amigos.amigos.map((a) => (
              <div key={a.id} className="linha">
                <Link to={`/perfil/${a.id}`} className="pessoa cresce">
                  <Retrato avatar={a.avatar} tamanho={46} online={a.online} />
                  <span>
                    <span className="pessoa-nome" style={{ display: 'block' }}>{a.nome}</span>
                    <span className="pessoa-sub">
                      Nível {a.nivel} · {a.serieNome}
                    </span>
                  </span>
                </Link>
                <button
                  className="botao rosa pequeno"
                  disabled={!a.online || !a.mesmoNivel}
                  title={!a.mesmoNivel ? 'Duelos são entre alunos do mesmo nível de ensino' : !a.online ? 'Seu amigo está offline' : 'Enviar convite de duelo'}
                  onClick={() => convidar(a.id, materia)}
                >
                  Desafiar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AbaRanking() {
  const [escopo, setEscopo] = useState('serie');
  const [periodo, setPeriodo] = useState<'semana' | 'total'>('semana');
  const { dados: turmas } = useCarregar(() => api<{ turmas: { id: number; nome: string }[] }>('/turmas/minhas'));
  const turmaId = escopo.startsWith('turma:') ? escopo.slice(6) : null;
  const consulta = turmaId ? `escopo=turma&turmaId=${turmaId}` : `escopo=${escopo}`;
  const { dados, erro } = useCarregar(
    () => api<{ titulo: string; ranking: PosicaoRanking[]; eu: PosicaoRanking | null; participantes: number }>(`/ranking?${consulta}&periodo=${periodo}`),
    [consulta, periodo],
  );

  return (
    <section className="cartao">
      <div className="linha entre quebra" style={{ marginBottom: 16 }}>
        <div className="chips">
          <button className={`chip ${escopo === 'serie' ? 'ativo' : ''}`} onClick={() => setEscopo('serie')}>
            Meu nível
          </button>
          {turmas?.turmas.map((t) => (
            <button key={t.id} className={`chip ${escopo === `turma:${t.id}` ? 'ativo' : ''}`} onClick={() => setEscopo(`turma:${t.id}`)}>
              {t.nome}
            </button>
          ))}
          <button className={`chip ${escopo === 'amigos' ? 'ativo' : ''}`} onClick={() => setEscopo('amigos')}>
            Amigos
          </button>
          <button className={`chip ${escopo === 'geral' ? 'ativo' : ''}`} onClick={() => setEscopo('geral')}>
            Geral
          </button>
        </div>
        <div className="abas">
          <button className={periodo === 'semana' ? 'ativa' : ''} onClick={() => setPeriodo('semana')}>
            Esta semana
          </button>
          <button className={periodo === 'total' ? 'ativa' : ''} onClick={() => setPeriodo('total')}>
            Desde sempre
          </button>
        </div>
      </div>
      {erro ? (
        <ErroDeCarga erro={erro} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <>
          <ListaRanking ranking={dados.ranking} />
          {dados.eu && dados.eu.posicao > dados.ranking.length && (
            <p className="centro suave" style={{ marginTop: 12 }}>
              Você está em {dados.eu.posicao}º lugar entre {dados.participantes} participantes.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export function Desafios() {
  const [parametros, setParametros] = useSearchParams();
  const aba = (['missoes', 'duelos', 'ranking'].includes(parametros.get('aba') ?? '') ? parametros.get('aba') : 'missoes') as Aba;

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Desafios</h1>
          <p className="subtitulo">Cumpra missões, mantenha a sequência e dispute o topo do ranking.</p>
        </div>
        <div className="abas acoes">
          {(
            [
              ['missoes', 'Missões'],
              ['duelos', 'Duelos'],
              ['ranking', 'Ranking'],
            ] as const
          ).map(([id, nome]) => (
            <button key={id} className={aba === id ? 'ativa' : ''} onClick={() => setParametros({ aba: id })}>
              {nome}
            </button>
          ))}
        </div>
      </div>
      {aba === 'missoes' ? <AbaMissoes /> : aba === 'duelos' ? <AbaDuelos /> : <AbaRanking />}
    </div>
  );
}
