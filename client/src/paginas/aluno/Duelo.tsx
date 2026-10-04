import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useEstado } from '../../estado';
import { GatoVivo } from '../../gato/GatoVivo';
import type { Animacao } from '../../gato/modelo';
import { tocar } from '../../sons';
import { useDuelo } from '../../tempoReal';
import { EMOTES, fundoDoAvatar } from '../../visual';
import { soltarConfete } from '../../componentes/Gamificacao';
import { Icone, Chama, Moeda, Xp } from '../../componentes/Icone';
import { MarcoAlcancado } from './Jogar';
import type { Marco } from '../../tipos';

const LETRAS = ['A', 'B', 'C', 'D'];

function Contagem() {
  const [n, setN] = useState(3);
  useEffect(() => {
    const relogio = window.setInterval(() => setN((v) => Math.max(v - 1, 0)), 1000);
    return () => window.clearInterval(relogio);
  }, []);
  useEffect(() => tocar('tique'), [n]);
  return (
    <motion.div key={n} className="duelo-contagem" initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      {n > 0 ? n : 'Já!'}
    </motion.div>
  );
}

function Cronometro({ recebidaEm, tempo, parado }: { recebidaEm: number; tempo: number; parado: boolean }) {
  const [restante, setRestante] = useState(tempo);
  useEffect(() => {
    if (parado) return;
    const relogio = window.setInterval(() => setRestante(Math.max(0, tempo - (Date.now() - recebidaEm) / 1000)), 100);
    return () => window.clearInterval(relogio);
  }, [recebidaEm, tempo, parado]);
  return (
    <div className={`quiz-tempo ${restante < 4 ? 'urgente' : ''}`}>
      <i style={{ width: `${(restante / tempo) * 100}%` }} />
    </div>
  );
}

function Conversa({ livre, meuId }: { livre: boolean; meuId: number }) {
  const mensagens = useDuelo((d) => d.mensagens);
  const enviarMensagem = useDuelo((d) => d.enviarMensagem);
  const enviarEmote = useDuelo((d) => d.enviarEmote);
  const [texto, setTexto] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => fim.current?.scrollIntoView({ block: 'nearest' }), [mensagens.length]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    enviarMensagem(texto);
    setTexto('');
  };

  return (
    <aside className="duelo-conversa">
      <div className="chips">
        {Object.entries(EMOTES).map(([id, rotulo]) => (
          <button key={id} className="chip" onClick={() => enviarEmote(id)}>
            {rotulo}
          </button>
        ))}
      </div>
      {livre ? (
        <>
          <div className="duelo-mensagens">
            {mensagens.length === 0 && <p className="suave pequeno centro">Vocês são amigos: o chat está liberado. Seja gentil!</p>}
            {mensagens.map((m, i) => (
              <div key={i} className={`balao ${m.de === meuId ? 'meu' : ''}`}>
                {m.texto}
              </div>
            ))}
            <div ref={fim} />
          </div>
          <form className="linha" onSubmit={enviar}>
            <input className="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={200} placeholder="Escreva uma mensagem..." aria-label="Mensagem" />
            <button className="botao pequeno" aria-label="Enviar mensagem">
              <Icone nome="enviar" tamanho={18} />
            </button>
          </form>
        </>
      ) : (
        <p className="suave pequeno">Com oponentes que não são seus amigos, a conversa é só por reações rápidas.</p>
      )}
    </aside>
  );
}

export function Duelo() {
  const usuario = useEstado((e) => e.usuario)!;
  const navegar = useNavigate();
  const { fase, info, pergunta, minhaResposta, oponenteRespondeu, resultado, pontos, fim, emote, responder, desistir, encerrar } = useDuelo();
  const [marco, setMarco] = useState<Marco | null>(null);
  const [emoteVisivel, setEmoteVisivel] = useState<{ de: number; texto: string } | null>(null);

  // Reações rápidas aparecem por alguns segundos sobre quem enviou.
  useEffect(() => {
    if (!emote) return;
    setEmoteVisivel({ de: emote.de, texto: EMOTES[emote.emote] ?? '' });
    const relogio = window.setTimeout(() => setEmoteVisivel(null), 2600);
    return () => window.clearTimeout(relogio);
  }, [emote]);

  const eu = resultado?.placar.find((l) => l.id === usuario.id);
  useEffect(() => {
    if (fase === 'resultado' && eu) tocar(eu.acertou ? 'acerto' : 'erro');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, resultado?.indice]);

  useEffect(() => {
    if (!fim) return;
    tocar(fim.desfecho === 'derrota' ? 'derrota' : 'vitoria');
    if (fim.desfecho === 'vitoria') soltarConfete();
    setMarco(fim.sequencia?.marcos[0] ?? null);
  }, [fim]);

  if (fase === 'ocioso' || fase === 'buscando' || fase === 'convidando' || !info) return <Navigate to="/desafios?aba=duelos" replace />;

  const oponente = info.oponente;
  const linhaOponente = resultado?.placar.find((l) => l.id === oponente.id);
  const sair = () => {
    encerrar();
    navegar('/desafios?aba=duelos');
  };

  const meuHumor: Animacao = fase === 'fim' ? (fim?.desfecho === 'derrota' ? 'triste' : 'dancar') : fase === 'resultado' ? (eu?.acertou ? 'comemorar' : 'triste') : fase === 'inicio' ? 'acenar' : 'pensar';
  const humorOponente: Animacao = fase === 'fim' ? (fim?.desfecho === 'vitoria' ? 'triste' : fim?.desfecho === 'derrota' ? 'dancar' : 'acenar') : fase === 'resultado' ? (linhaOponente?.acertou ? 'comemorar' : 'triste') : fase === 'inicio' ? 'acenar' : 'pensar';

  const lutador = (lado: 'eu' | 'oponente') => {
    const dados = lado === 'eu' ? { id: usuario.id, nome: usuario.nome.split(' ')[0], avatar: usuario.avatar, nivel: usuario.nivel } : { id: oponente.id, nome: oponente.bot ? oponente.nome : oponente.nome.split(' ')[0], avatar: oponente.avatar, nivel: oponente.nivel };
    const linha = lado === 'eu' ? eu : linhaOponente;
    return (
      <div className={`lutador ${lado}`}>
        <div className="lutador-moldura" style={{ background: fundoDoAvatar(dados.avatar.fundo) }}>
          <GatoVivo className="lutador-gato" avatar={dados.avatar} animacao={lado === 'eu' ? meuHumor : humorOponente} enquadramento="retrato" />
          <AnimatePresence>
            {emoteVisivel?.de === dados.id && (
              <motion.div className="lutador-emote" initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}>
                {emoteVisivel.texto}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <strong>{dados.nome}</strong>
        <span className="suave pequeno">Nível {dados.nivel}</span>
        <motion.div key={pontos[dados.id] ?? 0} className="lutador-pontos" initial={{ scale: 1.35 }} animate={{ scale: 1 }}>
          {pontos[dados.id] ?? 0}
        </motion.div>
        {fase === 'resultado' && linha && <span className={`etiqueta ${linha.acertou ? 'verde' : 'vermelha'}`}>{linha.acertou ? `+${linha.ganho}` : linha.resposta === null ? 'Sem resposta' : 'Errou'}</span>}
        {fase === 'pergunta' && lado === 'oponente' && <span className={`etiqueta ${oponenteRespondeu ? 'amarela' : 'cinza'}`}>{oponenteRespondeu ? 'Já respondeu!' : 'Pensando...'}</span>}
        {fase === 'pergunta' && lado === 'eu' && minhaResposta !== null && <span className="etiqueta">Resposta enviada</span>}
      </div>
    );
  };

  const classeDaAlternativa = (i: number) => {
    if (fase !== 'resultado' || !resultado) return minhaResposta === i ? 'escolhida' : '';
    if (resultado.correta === i) return 'certa';
    if (minhaResposta === i) return 'errada';
    return 'apagada';
  };

  return (
    <div className="jogo duelo">
      <header className="jogo-topo">
        <button
          className="botao-icone"
          aria-label="Abandonar o duelo"
          title={fase === 'fim' ? 'Sair' : 'Abandonar o duelo'}
          onClick={() => {
            if (fase !== 'fim') desistir();
            sair();
          }}
        >
          <Icone nome="x" />
        </button>
        <div className="cresce">
          <strong className="jogo-titulo">Duelo de conhecimento</strong>
          <span className="suave pequeno">
            {info.materia}
            {info.tipo === 'treino' ? ' · Treino' : info.tipo === 'amigo' ? ' · Entre amigos' : ''}
          </span>
        </div>
        {pergunta && fase !== 'fim' && (
          <span className="etiqueta">
            Pergunta {pergunta.indice + 1} de {pergunta.total}
          </span>
        )}
      </header>

      <main className="duelo-palco">
        {lutador('eu')}

        <section className="duelo-centro">
          {fase === 'inicio' && (
            <div className="centro">
              <h1 className="duelo-vs">VS</h1>
              <Contagem />
            </div>
          )}

          {(fase === 'pergunta' || fase === 'resultado') && pergunta && (
            <motion.div key={pergunta.indice} className="quiz-cartao" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <Cronometro recebidaEm={pergunta.recebidaEm} tempo={pergunta.tempo} parado={fase === 'resultado'} />
              <span className="etiqueta" style={{ alignSelf: 'flex-start' }}>
                {pergunta.materia}
              </span>
              <h2 className="quiz-enunciado">{pergunta.enunciado}</h2>
              <div className="alternativas">
                {pergunta.alternativas.map((texto, i) => (
                  <button key={i} className={`alternativa a${i} ${classeDaAlternativa(i)}`} disabled={minhaResposta !== null || fase === 'resultado'} onClick={() => (tocar('clique'), responder(i))}>
                    <span className="alternativa-letra">{LETRAS[i]}</span>
                    <span className="cresce">{texto}</span>
                    {fase === 'resultado' && linhaOponente?.resposta === i && <span className="etiqueta cinza">{oponente.nome.split(' ')[0]}</span>}
                  </button>
                ))}
              </div>
              {fase === 'resultado' && resultado?.explicacao && <div className="quiz-retorno acerto">{resultado.explicacao}</div>}
            </motion.div>
          )}

          {fase === 'fim' && fim && (
            <motion.div className="resultado" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}>
              <h1>{fim.desfecho === 'vitoria' ? 'Vitória!' : fim.desfecho === 'empate' ? 'Empate!' : 'Derrota'}</h1>
              <p className="subtitulo">
                {fim.abandono
                  ? fim.desfecho === 'vitoria'
                    ? `${oponente.nome.split(' ')[0]} saiu do duelo.`
                    : 'Você saiu antes do fim.'
                  : fim.desfecho === 'vitoria'
                    ? 'Você foi mais rápido e certeiro!'
                    : fim.desfecho === 'empate'
                      ? 'Que disputa equilibrada!'
                      : 'Faltou pouco. Peça a revanche!'}
              </p>
              <div className="resultado-numeros">
                <div>
                  <strong className="valor">
                    <Xp tamanho={28} /> +{fim.recompensa.xp}
                  </strong>
                  <span>experiência</span>
                </div>
                <div>
                  <strong className="valor">
                    <Moeda tamanho={28} /> +{fim.recompensa.moedas}
                  </strong>
                  <span>moedas</span>
                </div>
              </div>
              {fim.subiuNivel && <div className="resultado-faixa nivel">Você subiu para o nível {fim.nivel}!</div>}
              {fim.sequencia?.aumentou && (
                <div className="resultado-faixa fogo">
                  <Chama tamanho={26} /> Sequência de {fim.sequencia.sequencia} {fim.sequencia.sequencia === 1 ? 'dia' : 'dias'}!
                </div>
              )}
              <button className="botao grande" onClick={sair}>
                Voltar aos desafios
              </button>
            </motion.div>
          )}

          {!oponente.bot && fase !== 'inicio' && <Conversa livre={info.chatLivre} meuId={usuario.id} />}
        </section>

        {lutador('oponente')}
      </main>
      <MarcoAlcancado marco={marco} aoFechar={() => setMarco(null)} />
    </div>
  );
}
