// Peças de gamificação reutilizadas em várias páginas: missões, sequência de dias e ranking.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api, mensagemDoErro } from '../api';
import { avisar, useEstado } from '../estado';
import { diaDaSemana, formatarDia, hojeLocal } from '../visual';
import { Icone, Moeda, Chama, Xp } from './Icone';
import { Retrato } from './Retrato';
import type { InfoSequencia, Missao, PosicaoRanking } from '../tipos';

const ICONE_MISSAO: Record<string, string> = {
  atividades: 'jogar',
  acertos: 'alvo',
  duelos: 'espadas',
  perfeitas: 'estrela',
  materias: 'livro',
  quiz: 'raio',
};

// Sem worker: o padrão da biblioteca cria um script em tempo de execução (blob:),
// que a política de conteúdo do servidor bloqueia de propósito.
const confete = confetti.create(undefined, { resize: true, useWorker: false });

export function soltarConfete() {
  void confete({ particleCount: 110, spread: 75, origin: { y: 0.65 }, colors: ['#5b5ff0', '#ff4f9a', '#ffc93c', '#2f8bff', '#22b573'] });
}

export function Recompensa({ xp, moedas }: { xp: number; moedas: number }) {
  return (
    <span className="linha" style={{ gap: 10 }}>
      {xp > 0 && (
        <span className="valor">
          <Xp tamanho={18} /> {xp}
        </span>
      )}
      {moedas > 0 && (
        <span className="valor">
          <Moeda tamanho={18} /> {moedas}
        </span>
      )}
    </span>
  );
}

export function CartaoMissao({ missao, aoResgatar }: { missao: Missao; aoResgatar: () => void }) {
  const atualizarUsuario = useEstado((e) => e.atualizarUsuario);
  const [resgatando, setResgatando] = useState(false);
  const percentual = Math.min(100, (missao.progresso / missao.meta) * 100);
  const hoje = hojeLocal();

  const resgatar = async () => {
    setResgatando(true);
    try {
      await api('/missoes/resgatar', { corpo: { chave: missao.chave } });
      soltarConfete();
      avisar(`Missão concluída: +${missao.xp} XP e +${missao.moedas} moedas!`, 'sucesso');
      await atualizarUsuario();
      aoResgatar();
    } catch (erro) {
      avisar(mensagemDoErro(erro), 'erro');
    } finally {
      setResgatando(false);
    }
  };

  return (
    <div className={`missao ${missao.resgatada ? 'feita' : missao.concluida ? 'pronta' : ''} ${missao.origem}`}>
      <span className="missao-icone">
        <Icone nome={missao.resgatada ? 'check' : ICONE_MISSAO[missao.tipo] ?? 'alvo'} tamanho={24} />
      </span>
      <div className="cresce">
        <div className="linha quebra" style={{ gap: 8 }}>
          <strong className="missao-titulo">{missao.titulo}</strong>
          {missao.origem === 'professor' ? (
            <span className="etiqueta rosa">Prof. {missao.professor?.split(' ')[0]}</span>
          ) : (
            <span className="etiqueta cinza">{missao.periodo === 'diaria' ? 'Diária' : 'Semanal'}</span>
          )}
          {missao.materiaNome && <span className="etiqueta">{missao.materiaNome}</span>}
        </div>
        {missao.descricao && <p className="suave pequeno">{missao.descricao}</p>}
        <div className="linha" style={{ marginTop: 8 }}>
          <div className="barra cresce">
            <i style={{ width: `${percentual}%` }} />
          </div>
          <span className="pequeno forte">
            {missao.tipo === 'quiz' ? (missao.concluida ? 'Feito' : `${missao.totalQuestoes} questões`) : `${missao.progresso}/${missao.meta}`}
          </span>
        </div>
        {missao.origem === 'professor' && !missao.resgatada && <p className="pequeno suave" style={{ marginTop: 4 }}>{missao.fim === hoje ? 'Termina hoje' : `Até ${formatarDia(missao.fim)}`}</p>}
      </div>
      <div className="missao-lado">
        <Recompensa xp={missao.xp} moedas={missao.moedas} />
        {missao.resgatada ? (
          <span className="etiqueta verde">Resgatada</span>
        ) : missao.concluida ? (
          <button className="botao amarelo pequeno" onClick={resgatar} disabled={resgatando}>
            <Icone nome="presente" tamanho={16} /> Resgatar
          </button>
        ) : missao.tipo === 'quiz' ? (
          <Link className="botao rosa pequeno" to={`/jogar/missao/${missao.missaoId}`}>
            Jogar
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function CartaoSequencia({ sequencia, compacto = false }: { sequencia: InfoSequencia; compacto?: boolean }) {
  const proximo = sequencia.marcos.find((m) => m.dias > sequencia.atual);
  return (
    <div className="sequencia">
      <div className="linha">
        <span className={`sequencia-chama ${sequencia.jogouHoje ? 'acesa' : ''}`}>
          <Chama tamanho={54} apagada={!sequencia.jogouHoje} />
        </span>
        <div>
          <div className="sequencia-numero">
            {sequencia.atual} {sequencia.atual === 1 ? 'dia' : 'dias'}
          </div>
          <div className="suave pequeno">{sequencia.jogouHoje ? 'Sequência garantida hoje!' : sequencia.atual > 0 ? 'Jogue hoje para não perder a sequência!' : 'Jogue hoje para começar uma sequência.'}</div>
        </div>
      </div>
      <div className="sequencia-semana">
        {sequencia.ultimosDias.map((d) => (
          <div key={d.dia} className={`sequencia-dia ${d.jogou ? 'jogou' : ''}`}>
            <i>{d.jogou && <Icone nome="check" tamanho={16} />}</i>
            {diaDaSemana(d.dia)}
          </div>
        ))}
      </div>
      {proximo && (
        <div className="sequencia-proximo">
          <Icone nome="presente" tamanho={20} />
          <span>
            Faltam <strong>{proximo.dias - sequencia.atual}</strong> {proximo.dias - sequencia.atual === 1 ? 'dia' : 'dias'} para ganhar <strong>{proximo.moedas} moedas</strong>
            {proximo.item && (
              <>
                {' '}
                e <strong>{proximo.item.nome}</strong>
              </>
            )}
          </span>
        </div>
      )}
      {!compacto && (
        <div className="marcos">
          {sequencia.marcos.map((m) => (
            <div key={m.dias} className={`marco ${m.alcancado ? 'alcancado' : ''}`}>
              <strong>{m.dias}</strong>
              <span>dias</span>
              <small>
                +{m.moedas}
                {m.item ? ` · ${m.item.nome}` : ''}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListaRanking({ ranking, unidade = 'XP', vazio = 'Ainda não há ninguém por aqui.' }: { ranking: PosicaoRanking[]; unidade?: string; vazio?: string }) {
  if (!ranking.length) return <div className="vazio">{vazio}</div>;
  return (
    <ol className="ranking">
      {ranking.map((p) => (
        <li key={p.id} className={`${p.eu ? 'eu' : ''} p${p.posicao}`}>
          <span className="ranking-posicao">{p.posicao}</span>
          <Link to={`/perfil/${p.id}`} className="pessoa cresce">
            <Retrato avatar={p.avatar} tamanho={44} online={p.online} />
            <span className="cresce" style={{ minWidth: 0 }}>
              <span className="pessoa-nome" style={{ display: 'block' }}>
                {p.nome} {p.eu && <span className="etiqueta">você</span>}
              </span>
              <span className="pessoa-sub">Nível {p.nivel}</span>
            </span>
          </Link>
          <span className="ranking-pontos">
            {p.pontos} <small>{unidade}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}
