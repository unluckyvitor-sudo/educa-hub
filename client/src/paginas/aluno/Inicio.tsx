import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useEstado } from '../../estado';
import { GatoVivo } from '../../gato/GatoVivo';
import { fundoDoAvatar } from '../../visual';
import { CartaoMateria } from '../../componentes/CartaoMateria';
import { Carregando, ErroDeCarga, Rosca, useCarregar } from '../../componentes/comuns';
import { CartaoMissao, CartaoSequencia, ListaRanking } from '../../componentes/Gamificacao';
import { Icone } from '../../componentes/Icone';
import { Mascote } from '../../componentes/Mascote';
import { Coroa, EstrelaRabisco, Faiscas, Pinceladas } from '../../componentes/Rabiscos';
import type { Animacao } from '../../gato/modelo';
import type { InfoSequencia, MateriaResumo, Missao, PosicaoRanking } from '../../tipos';

function PilhaDeLivros() {
  return (
    <svg width="62" height="56" viewBox="0 0 62 56" fill="none" stroke="#171b45" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M6 37 30 27l26 10-25 11z" fill="#2f8bff" />
      <path d="M6 37v6l25 11v-6zM56 37v6L31 54" fill="#fff" />
      <path d="M6 25 30 15l26 10-25 11z" fill="#3fd0b9" />
      <path d="M6 25v6l25 11v-6zM56 25v6L31 42" fill="#fff" />
      <path d="M6 13 30 3l26 10-25 11z" fill="#5b5ff0" />
      <path d="M6 13v6l25 11v-6zM56 13v6L31 30" fill="#fff" />
    </svg>
  );
}

/** Cabeçalho com o avatar do aluno e a saudação. */
export function Saudacao({ nome, legenda }: { nome: string; legenda: string }) {
  const usuario = useEstado((e) => e.usuario)!;
  const [animacao, setAnimacao] = useState<Animacao>('parado');

  return (
    <section className="heroi">
      <Pinceladas className="heroi-pinceladas" />
      <EstrelaRabisco className="heroi-estrela" cor="#5b3df0" tamanho={92} />
      <Link
        to={usuario.papel === 'aluno' ? '/avatar' : `/perfil/${usuario.id}`}
        className="heroi-avatar"
        style={{ background: fundoDoAvatar(usuario.avatar.fundo) }}
        onMouseEnter={() => setAnimacao('acenar')}
        onMouseLeave={() => setAnimacao('parado')}
        title={usuario.papel === 'aluno' ? 'Personalizar meu avatar' : 'Meu perfil'}
      >
        <svg className="heroi-respingos" viewBox="0 0 320 300" fill="none" strokeLinecap="round" aria-hidden="true">
          <path d="M22 60l14 14m0-14L22 74M268 22l12 12m0-12-12 12" stroke="#ff4f9a" strokeWidth="6" />
          <path d="M296 150l10 3-7 8zM14 190l11-2-4 10z" fill="#5b3df0" />
          <path d="M40 250c8-3 12-10 14-18M286 244c-9-2-15-8-18-16" stroke="#5b3df0" strokeWidth="5" />
          <circle cx="292" cy="92" r="5" fill="#ff4f9a" />
          <circle cx="30" cy="128" r="4" fill="#2f8bff" />
        </svg>
        <GatoVivo className="heroi-gato" avatar={usuario.avatar} animacao={animacao} enquadramento="retrato" seguirMouse />
      </Link>
      <div className="heroi-texto">
        <h1>
          Olá, {nome}!
          <Coroa className="heroi-coroa" cor="#ff3d8b" tamanho={52} />
          <Faiscas className="heroi-faiscas" cor="#2f6bff" tamanho={46} />
        </h1>
        <div>
          <span className="heroi-turma">{legenda}</span>
        </div>
      </div>
    </section>
  );
}

interface DadosInicio {
  materias: MateriaResumo[];
  total: number;
  concluidas: number;
  missoes: Missao[];
  sequencia: InfoSequencia;
  ranking: PosicaoRanking[];
}

async function carregarInicio(): Promise<DadosInicio> {
  const [materias, missoes, ranking] = await Promise.all([
    api<{ materias: MateriaResumo[]; total: number; concluidas: number }>('/materias'),
    api<{ missoes: Missao[]; sequencia: InfoSequencia }>('/missoes'),
    api<{ ranking: PosicaoRanking[] }>('/ranking?escopo=serie&periodo=semana'),
  ]);
  return { ...materias, ...missoes, ranking: ranking.ranking };
}

export function Inicio() {
  const usuario = useEstado((e) => e.usuario)!;
  const { dados, erro, recarregar } = useCarregar(carregarInicio);
  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <>
      <Saudacao nome={primeiroNome} legenda={`Turma: ${usuario.serieNome ?? '—'}`} />
      <div className="pagina">
        {erro ? (
          <ErroDeCarga erro={erro} />
        ) : !dados ? (
          <Carregando />
        ) : (
          <>
            <div className="inicio-grade">
              <section className="cartao inicio-materias">
                <div className="inicio-titulo">
                  <PilhaDeLivros />
                  <div>
                    <h2>Minhas matérias</h2>
                    <p>Escolha a matéria que você quer estudar hoje!</p>
                  </div>
                </div>
                <div className="materias-grade">
                  {dados.materias.map((m, i) => (
                    <CartaoMateria key={m.id} materia={m} indice={i} />
                  ))}
                </div>
              </section>

              <aside className="inicio-lado">
                <section className="cartao lavanda">
                  <div className="cartao-titulo">
                    <Icone nome="grafico" tamanho={34} style={{ color: '#4b3fd6' }} />
                    <h2>Seu progresso</h2>
                  </div>
                  <Link to="/progresso" className="progresso-resumo">
                    <Rosca percentual={dados.total ? (dados.concluidas / dados.total) * 100 : 0} />
                    <p>
                      Você já completou
                      <br />
                      <strong>
                        {dados.concluidas} de {dados.total}
                      </strong>{' '}
                      atividades
                    </p>
                  </Link>
                </section>
                <Mascote falaInicial={usuario.jogouHoje ? undefined : 'Que tal uma atividade para começar o dia?'} />
              </aside>
            </div>

            <div className="grade-2" style={{ marginTop: 22 }}>
              <section className="cartao">
                <div className="cartao-titulo">
                  <Icone nome="alvo" tamanho={30} style={{ color: '#ff4f9a' }} />
                  <h2>Missões de hoje</h2>
                  <Link className="link acao" to="/desafios">
                    Ver todas
                  </Link>
                </div>
                <div className="coluna" style={{ gap: 12 }}>
                  {dados.missoes
                    .filter((m) => m.origem === 'professor' || m.periodo === 'diaria')
                    .slice(0, 4)
                    .map((m) => (
                      <CartaoMissao key={m.chave} missao={m} aoResgatar={recarregar} />
                    ))}
                </div>
              </section>

              <div className="coluna" style={{ gap: 20 }}>
                <section className="cartao">
                  <div className="cartao-titulo">
                    <h2>Sua sequência</h2>
                  </div>
                  <CartaoSequencia sequencia={dados.sequencia} compacto />
                </section>
                <section className="cartao">
                  <div className="cartao-titulo">
                    <Icone nome="trofeu" tamanho={30} style={{ color: '#ffab1a' }} />
                    <h2>Ranking da semana</h2>
                    <Link className="link acao" to="/desafios?aba=ranking">
                      Ver ranking
                    </Link>
                  </div>
                  <ListaRanking ranking={dados.ranking.slice(0, 5)} />
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
