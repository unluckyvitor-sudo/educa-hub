import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { api, mensagemDoErro } from '../../api';
import { useEstado } from '../../estado';
import { GatoVivo } from '../../gato/GatoVivo';
import type { Animacao } from '../../gato/modelo';
import { tocar } from '../../sons';
import { coresDaMateria, MODOS } from '../../visual';
import { Carregando, Modal } from '../../componentes/comuns';
import { soltarConfete } from '../../componentes/Gamificacao';
import { Icone, Chama, Moeda, Xp } from '../../componentes/Icone';
import { Retrato } from '../../componentes/Retrato';
import { Quiz, type ItemDeJogo } from '../../jogos/Quiz';
import { Memoria, type Carta } from '../../jogos/Memoria';
import type { Marco, Modo, ResultadoJogo } from '../../tipos';

interface Partida {
  partida: string;
  modo: Modo;
  titulo: string;
  materia: string | null;
  materiaNome: string | null;
  tempo?: number;
  itens?: ItemDeJogo[];
  cartas?: Carta[];
  /** Partida do caderno de erros. */
  revisao?: boolean;
}

type Contexto = 'topico' | 'missao' | 'revisao';

const FRASES = [
  { minimo: 1, titulo: 'Perfeito!', fala: 'Você gabaritou! Estou impressionado!' },
  { minimo: 0.6, titulo: 'Muito bem!', fala: 'Mandou bem! Vamos para a próxima?' },
  { minimo: 0.01, titulo: 'Bom começo!', fala: 'Cada tentativa deixa você mais forte.' },
  { minimo: 0, titulo: 'Não desista!', fala: 'Leia o resumo e tente de novo. Você consegue!' },
];

/** Janela que celebra um marco de sequência de dias (com moedas e, às vezes, um item exclusivo). */
export function MarcoAlcancado({ marco, aoFechar }: { marco: Marco | null; aoFechar: () => void }) {
  const avatar = useEstado((e) => e.usuario?.avatar);
  return (
    <Modal aberto={!!marco} aoFechar={aoFechar}>
      {marco && avatar && (
        <div className="centro">
          <Chama tamanho={84} />
          <h2>{marco.dias} dias de sequência!</h2>
          <p className="suave">Sua dedicação rendeu uma recompensa especial:</p>
          <div className="linha" style={{ justifyContent: 'center', margin: '18px 0', gap: 22 }}>
            <span className="valor" style={{ fontSize: 26 }}>
              <Moeda tamanho={32} /> +{marco.moedas}
            </span>
            {marco.item && (
              <span className="linha">
                <Retrato avatar={{ ...avatar, [marco.item.tipo]: marco.item.id }} tamanho={70} />
                <strong>{marco.item.nome}</strong>
              </span>
            )}
          </div>
          <button className="botao amarelo grande" onClick={aoFechar}>
            Que demais!
          </button>
        </div>
      )}
    </Modal>
  );
}

function Resultado({ resultado, contexto, voltarPara, aoRepetir }: { resultado: ResultadoJogo; contexto: Contexto; voltarPara: string; aoRepetir: () => void }) {
  const fracao = resultado.total ? resultado.acertos / resultado.total : 0;
  const estrelas = fracao >= 0.9 ? 3 : fracao >= 0.6 ? 2 : fracao > 0 ? 1 : 0;
  const frase = FRASES.find((f) => fracao >= f.minimo)!;
  const [marco, setMarco] = useState<Marco | null>(resultado.sequencia?.marcos[0] ?? null);

  return (
    <motion.div className="resultado" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
      <div className="resultado-estrelas">
        {[1, 2, 3].map((n) => (
          <motion.span key={n} className={n <= estrelas ? 'cheia' : ''} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.25 + n * 0.18, type: 'spring', stiffness: 300, damping: 12 }}>
            <Icone nome="estrela" tamanho={n === 2 ? 84 : 64} />
          </motion.span>
        ))}
      </div>
      <h1>{frase.titulo}</h1>
      <p className="subtitulo">{frase.fala}</p>
      <div className="resultado-numeros">
        <div>
          <strong>
            {resultado.acertos}/{resultado.total}
          </strong>
          <span>acertos</span>
        </div>
        <div>
          <strong className="valor">
            <Xp tamanho={28} /> +{resultado.xp}
          </strong>
          <span>experiência</span>
        </div>
        <div>
          <strong className="valor">
            <Moeda tamanho={28} /> +{resultado.moedas}
          </strong>
          <span>moedas</span>
        </div>
      </div>
      {resultado.subiuNivel && <div className="resultado-faixa nivel">Você subiu para o nível {resultado.nivel}!</div>}
      {resultado.sequencia?.aumentou && (
        <div className="resultado-faixa fogo">
          <Chama tamanho={26} /> Sequência de {resultado.sequencia.sequencia} {resultado.sequencia.sequencia === 1 ? 'dia' : 'dias'}!
        </div>
      )}
      {contexto === 'revisao' && (
        <div className={`resultado-faixa ${resultado.noCaderno ? 'nivel' : 'fogo'}`}>
          {resultado.noCaderno
            ? `${resultado.noCaderno === 1 ? 'Ainda há 1 questão' : `Ainda há ${resultado.noCaderno} questões`} no seu caderno de erros.`
            : 'Caderno de erros zerado! Você dominou tudo o que tinha errado.'}
        </div>
      )}
      {resultado.erradas.length > 0 && (
        <details className="rever" open>
          <summary>
            Rever o que errei <span className="etiqueta vermelha">{resultado.erradas.length}</span>
          </summary>
          <ul>
            {resultado.erradas.map((q) => (
              <li key={q.enunciado}>
                <strong>{q.enunciado}</strong>
                <span className="rever-certa">
                  <Icone nome="check" tamanho={16} /> {q.correta}
                </span>
                {q.explicacao && <small>{q.explicacao}</small>}
              </li>
            ))}
          </ul>
          {contexto !== 'missao' && <p className="pequeno suave">Essas questões ficam no seu caderno de erros (em Meu progresso) até você acertar duas vezes seguidas.</p>}
        </details>
      )}
      <div className="linha quebra" style={{ justifyContent: 'center', marginTop: 8 }}>
        {(contexto !== 'revisao' || resultado.noCaderno > 0) && (
          <button className="botao claro" onClick={aoRepetir}>
            <Icone nome="atualizar" tamanho={18} /> {contexto === 'revisao' ? 'Revisar mais' : 'Jogar de novo'}
          </button>
        )}
        <Link className="botao" to={voltarPara}>
          Continuar <Icone nome="seta" tamanho={18} />
        </Link>
      </div>
      <MarcoAlcancado marco={marco} aoFechar={() => setMarco(null)} />
    </motion.div>
  );
}

export function Jogar({ revisao = false }: { revisao?: boolean }) {
  const { topicoId, modo, missaoId } = useParams();
  const navegar = useNavigate();
  const usuario = useEstado((e) => e.usuario)!;
  const atualizarUsuario = useEstado((e) => e.atualizarUsuario);
  const [partida, setPartida] = useState<Partida | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [falhaAoTerminar, setFalhaAoTerminar] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoJogo | null>(null);
  const [humor, setHumor] = useState<Animacao>('acenar');
  const [rodada, setRodada] = useState(0);
  const relogio = useRef<number | undefined>(undefined);

  useEffect(() => {
    let ativo = true;
    setPartida(null);
    setResultado(null);
    setErro(null);
    setFalhaAoTerminar(null);
    setHumor('acenar');
    api<Partida>('/jogos/iniciar', { corpo: revisao ? { revisao: true } : missaoId ? { missaoId: Number(missaoId) } : { topicoId, modo } })
      .then((p) => ativo && setPartida(p))
      .catch((e) => ativo && setErro(mensagemDoErro(e)));
    relogio.current = window.setTimeout(() => ativo && setHumor('parado'), 2200);
    return () => {
      ativo = false;
      window.clearTimeout(relogio.current);
    };
  }, [topicoId, modo, missaoId, revisao, rodada]);

  const reagir = useCallback((acertou: boolean) => {
    window.clearTimeout(relogio.current);
    setHumor(acertou ? 'comemorar' : 'triste');
    relogio.current = window.setTimeout(() => setHumor('pensar'), 1700);
  }, []);

  const terminar = useCallback(async () => {
    if (!partida) return;
    setFalhaAoTerminar(null);
    try {
      const r = await api<ResultadoJogo>(`/jogos/${partida.partida}/finalizar`, { metodo: 'POST' });
      window.clearTimeout(relogio.current);
      setResultado(r);
      const bom = r.total > 0 && r.acertos / r.total >= 0.6;
      setHumor(bom ? 'dancar' : 'triste');
      tocar(bom ? 'vitoria' : 'derrota');
      if (bom) soltarConfete();
      void atualizarUsuario();
    } catch (e) {
      // As respostas já estão no servidor: basta pedir o resultado de novo, sem refazer o jogo.
      setFalhaAoTerminar(mensagemDoErro(e));
    }
  }, [partida, atualizarUsuario]);

  const voltarPara = revisao ? '/progresso' : missaoId ? '/desafios' : partida?.materia ? `/materias/${partida.materia}` : '/materias';
  const contexto: Contexto = revisao ? 'revisao' : missaoId ? 'missao' : 'topico';
  const cores = coresDaMateria(partida?.materia);
  const estilo = { '--claro': cores.claro, '--claro2': cores.claro2, '--forte': cores.forte } as CSSProperties;

  const sair = () => {
    const emAndamento = !!partida && !resultado && !erro;
    if (emAndamento && !window.confirm('Sair do jogo agora? O que você respondeu nesta partida não será contado.')) return;
    navegar(voltarPara);
  };

  return (
    <div className="jogo" style={estilo}>
      <header className="jogo-topo">
        <button className="botao-icone" onClick={sair} aria-label="Sair do jogo" title="Sair do jogo">
          <Icone nome="x" />
        </button>
        <div className="cresce">
          <strong className="jogo-titulo">{partida?.titulo ?? 'Preparando o jogo...'}</strong>
          {partida && (
            <span className="suave pequeno">
              {partida.materiaNome ? `${partida.materiaNome} · ` : ''}
              {revisao ? 'Revisão do que você errou' : missaoId ? 'Desafio do professor' : MODOS[partida.modo].nome}
            </span>
          )}
        </div>
        <span className="ficha ouro">
          <Moeda /> {usuario.moedas}
        </span>
      </header>

      <main className="jogo-palco">
        <div className="jogo-area">
          {erro ? (
            <div className="resultado">
              <h1>Ops!</h1>
              <p className="subtitulo">{erro}</p>
              <Link className="botao" to={voltarPara}>
                Voltar
              </Link>
            </div>
          ) : falhaAoTerminar && !resultado ? (
            <div className="resultado">
              <h1>Quase lá!</h1>
              <p className="subtitulo">Suas respostas estão guardadas, mas o resultado não chegou: {falhaAoTerminar}</p>
              <button className="botao" onClick={() => void terminar()}>
                <Icone nome="atualizar" tamanho={18} /> Tentar de novo
              </button>
            </div>
          ) : !partida ? (
            <Carregando texto="Embaralhando as questões..." />
          ) : resultado ? (
            <Resultado resultado={resultado} contexto={contexto} voltarPara={voltarPara} aoRepetir={() => setRodada((r) => r + 1)} />
          ) : partida.modo === 'memoria' ? (
            <Memoria key={partida.partida} partida={partida.partida} cartas={partida.cartas!} aoResponder={reagir} aoTerminar={terminar} />
          ) : (
            <Quiz key={partida.partida} partida={partida.partida} itens={partida.itens!} tempo={partida.tempo!} aoResponder={reagir} aoTerminar={terminar} />
          )}
        </div>
        <GatoVivo className="jogo-gato" avatar={usuario.avatar} animacao={humor} enquadramento="busto" />
      </main>
    </div>
  );
}
