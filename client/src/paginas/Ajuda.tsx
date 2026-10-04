// Central de ajuda: perguntas frequentes, chamados para o suporte (ou para o professor) e feedback sobre a plataforma.
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { avisar, useEstado } from '../estado';
import { EVENTO_SUPORTE } from '../tempoReal';
import { GatoVivo } from '../gato/GatoVivo';
import { AVATAR_PADRAO } from '../gato/modelo';
import { Carregando, ErroDeCarga, Modal, Vazio, useCarregar } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { Estrelas, LinhaChamado } from '../componentes/Suporte';
import type { Chamado, Papel } from '../tipos';

const ABAS = ['perguntas', 'chamados', 'feedback'] as const;
type Aba = (typeof ABAS)[number];

interface Pergunta {
  pergunta: string;
  resposta: string;
}

const PERGUNTAS: Record<'aluno' | 'professor', Pergunta[]> = {
  aluno: [
    { pergunta: 'Como ganho pontos (XP) e moedas?', resposta: 'Jogando as atividades das matérias, cumprindo missões e duelando. Cada acerto vale XP e moedas, e gabaritar dá um bônus. Repetir o mesmo jogo no mesmo dia rende menos, então vale explorar tópicos novos.' },
    { pergunta: 'O que é a sequência de dias?', resposta: 'Cada dia em que você faz uma atividade com pelo menos um acerto, ou joga um duelo, entra na sequência. Ao chegar a 3, 7, 14, 30, 60 e 100 dias seguidos você ganha moedas e itens exclusivos. Se passar um dia inteiro sem jogar, ela volta ao zero.' },
    { pergunta: 'Como entro na turma do meu professor?', resposta: 'Abra Configurações, procure "Minhas turmas" e digite o código que o professor passou. Só entram alunos do mesmo nível de ensino da turma.' },
    { pergunta: 'As matérias que aparecem não são as do meu ano. O que eu faço?', resposta: 'O conteúdo segue o nível escolhido no seu perfil. Mude em Configurações › "Nível que estou estudando". Se você participa de uma turma de outro nível, saia dela antes de mudar.' },
    { pergunta: 'Como desafio um amigo para um duelo?', resposta: 'Primeiro adicione o amigo: menu do perfil (a patinha no alto) › Amigos, e procure pelo nome de usuário. Depois vá em Desafios › Duelos e convide. Os dois precisam estar online e no mesmo nível de ensino.' },
    { pergunta: 'Como mudo a aparência do meu gato?', resposta: 'No menu do perfil (a patinha no alto), abra "Meu avatar e loja". Lá você troca pelagem, roupa e acessórios, e compra itens novos com moedas.' },
    { pergunta: 'Esqueci minha senha. E agora?', resposta: 'Peça ao seu professor ou responsável para falar com a administração da plataforma, que cria uma senha temporária para você. Importante: a equipe do EducaHub nunca pede a sua senha. Não a passe para ninguém.' },
    { pergunta: 'Alguém foi desrespeitoso comigo. Como aviso?', resposta: 'Abra um chamado aqui na aba "Meus chamados" escolhendo "Comportamento de outra pessoa" e conte o que aconteceu. Você também pode falar com o seu professor. Ninguém além da equipe vê a sua mensagem.' },
    { pergunta: 'Achei uma questão com erro. Onde aviso?', resposta: 'Abra um chamado escolhendo "Questão ou conteúdo com erro" e diga a matéria, o tópico e o enunciado da questão. A equipe confere e corrige.' },
  ],
  professor: [
    { pergunta: 'Como crio uma turma?', resposta: 'Em "Minhas turmas", clique em "Nova turma", dê um nome e escolha o nível de ensino. A turma recebe um código para você passar aos alunos.' },
    { pergunta: 'Como os alunos entram na turma?', resposta: 'Cada aluno abre Configurações › "Minhas turmas" e digita o código. Só entram alunos cujo perfil está no mesmo nível de ensino da turma. Você pode gerar um código novo a qualquer momento, e o antigo deixa de valer.' },
    { pergunta: 'Como proponho missões e desafios?', resposta: 'Em "Missões", crie uma missão diária ou semanal com meta de atividades ou de acertos, ou um quiz com as suas próprias questões. Cada missão dá até 300 XP e 200 moedas, e cada turma pode ter até 12 missões ativas.' },
    { pergunta: 'Como acompanho o desempenho dos alunos?', resposta: 'O painel inicial mostra quem está online, os destaques da semana e as atividades recentes. Dentro de cada turma há o ranking, as missões e, clicando em um aluno, o progresso dele por matéria.' },
    { pergunta: 'Um aluno esqueceu a senha. O que eu faço?', resposta: 'Abra um chamado em "Minha conta e acesso" informando o nome de usuário do aluno. A administração gera uma senha temporária para você entregar a ele.' },
    { pergunta: 'Onde vejo as dúvidas que os alunos me enviam?', resposta: 'No menu "Dúvidas dos alunos". Os alunos das suas turmas podem escolher você como destinatário ao pedir ajuda. A administração da plataforma pode acompanhar essas conversas.' },
    { pergunta: 'Minha conta ainda aguarda aprovação. Quanto tempo leva?', resposta: 'A administração confere os dados de cada professor antes de liberar o acesso. Se estiver demorando, abra um chamado em "Minha conta e acesso" e informe a sua instituição.' },
    { pergunta: 'Posso jogar as atividades?', resposta: 'Pode, na Biblioteca e nos tópicos, para conhecer o conteúdo que os alunos veem. As suas partidas não contam pontos nem entram nos rankings.' },
  ],
};

function Perguntas({ papel, aoPedirAjuda }: { papel: Papel; aoPedirAjuda: () => void }) {
  const [busca, setBusca] = useState('');
  const lista = PERGUNTAS[papel === 'aluno' ? 'aluno' : 'professor'];
  const termo = busca.trim().toLowerCase();
  const filtradas = termo ? lista.filter((p) => `${p.pergunta} ${p.resposta}`.toLowerCase().includes(termo)) : lista;

  return (
    <section className="cartao coluna">
      <label className="busca" style={{ margin: 0, width: '100%' }}>
        <Icone nome="busca" tamanho={24} />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Procure por uma palavra: senha, turma, duelo..." aria-label="Buscar nas perguntas frequentes" />
      </label>
      {filtradas.length === 0 ? (
        <Vazio titulo="Nenhuma pergunta com essas palavras">Tente outro termo ou fale com o suporte.</Vazio>
      ) : (
        <div className="perguntas">
          {filtradas.map((p) => (
            <details key={p.pergunta} className="pergunta">
              <summary>
                {p.pergunta}
                <Icone nome="chevron" tamanho={20} />
              </summary>
              <p>{p.resposta}</p>
            </details>
          ))}
        </div>
      )}
      <div className="linha quebra ajuda-rodape">
        <span className="cresce">
          <strong>Não achou o que procurava?</strong>
          <span className="suave pequeno" style={{ display: 'block' }}>Escreva para o suporte. A resposta chega aqui mesmo, em "Meus chamados".</span>
        </span>
        <button className="botao rosa" onClick={aoPedirAjuda}>
          <Icone nome="mensagem" tamanho={18} /> Falar com o suporte
        </button>
      </div>
    </section>
  );
}

interface Opcoes {
  categorias: { id: string; nome: string }[];
  professores: { id: number; nome: string; turmas: string }[];
}

function NovoChamado({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const navegar = useNavigate();
  const { dados: opcoes } = useCarregar(() => api<Opcoes>('/suporte/opcoes'));
  const [destino, setDestino] = useState('equipe');
  const [categoria, setCategoria] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const corpo = { categoria, assunto, mensagem, ...(destino === 'equipe' ? {} : { professorId: Number(destino) }) };
      const { id } = await api<{ id: number }>('/suporte/chamados', { corpo });
      avisar('Pedido enviado! Avisaremos quando chegar a resposta.', 'sucesso');
      navegar(`/ajuda/chamados/${id}`);
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
      setEnviando(false);
    }
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} largo>
      <form className="coluna" onSubmit={enviar}>
        <h2>Como podemos ajudar?</h2>
        {!opcoes ? (
          <Carregando />
        ) : (
          <>
            <div className="grade-campos">
              {opcoes.professores.length > 0 && (
                <label className="campo">
                  <span>Para quem</span>
                  <select className="entrada" value={destino} onChange={(e) => setDestino(e.target.value)}>
                    <option value="equipe">Equipe do EducaHub</option>
                    {opcoes.professores.map((p) => (
                      <option key={p.id} value={p.id}>
                        Prof. {p.nome} ({p.turmas})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="campo">
                <span>Tipo de ajuda</span>
                <select className="entrada" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                  <option value="" disabled>
                    Escolha...
                  </option>
                  {opcoes.categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="campo">
              <span>Assunto</span>
              <input className="entrada" value={assunto} onChange={(e) => setAssunto(e.target.value)} minLength={3} maxLength={100} placeholder="Em poucas palavras" required />
            </label>
            <label className="campo">
              <span>Conte o que está acontecendo</span>
              <textarea className="entrada" style={{ minHeight: 130 }} value={mensagem} onChange={(e) => setMensagem(e.target.value)} minLength={5} maxLength={2000} placeholder="Quanto mais detalhes, mais rápido conseguimos ajudar." required />
            </label>
            <p className="suave pequeno">
              <Icone nome="escudo" tamanho={15} style={{ verticalAlign: '-2px' }} /> Nunca escreva a sua senha aqui. A equipe do EducaHub não pede senhas.
            </p>
          </>
        )}
        <div className="modal-acoes">
          <button type="button" className="botao claro" onClick={aoFechar}>
            Cancelar
          </button>
          <button className="botao rosa" disabled={enviando || !opcoes}>
            <Icone nome="enviar" tamanho={18} /> {enviando ? 'Enviando...' : 'Enviar pedido'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MeusChamados({ novo, aoAbrirNovo, aoFecharNovo }: { novo: boolean; aoAbrirNovo: () => void; aoFecharNovo: () => void }) {
  const { dados, erro, recarregar } = useCarregar(() => api<{ chamados: Chamado[] }>('/suporte/chamados'));

  useEffect(() => {
    window.addEventListener(EVENTO_SUPORTE, recarregar);
    return () => window.removeEventListener(EVENTO_SUPORTE, recarregar);
  });

  return (
    <section className="cartao">
      <div className="cartao-titulo">
        <Icone nome="mensagem" tamanho={28} style={{ color: '#ff4f9a' }} />
        <h2>Meus chamados</h2>
        <button className="botao rosa pequeno acao" onClick={aoAbrirNovo}>
          <Icone nome="mais" tamanho={16} /> Novo chamado
        </button>
      </div>
      {erro ? (
        <ErroDeCarga erro={erro} />
      ) : !dados ? (
        <Carregando />
      ) : dados.chamados.length === 0 ? (
        <Vazio titulo="Você ainda não pediu ajuda">Quando precisar, clique em "Novo chamado". A conversa com o suporte fica guardada aqui.</Vazio>
      ) : (
        <div className="chamados">
          {dados.chamados.map((c) => (
            <LinhaChamado key={c.id} chamado={c} visao="autor" para={`/ajuda/chamados/${c.id}`} />
          ))}
        </div>
      )}
      {novo && <NovoChamado aberto aoFechar={aoFecharNovo} />}
    </section>
  );
}

const TIPOS_DE_FEEDBACK = [
  { id: 'elogio', nome: 'Elogio', icone: 'coracao', dica: 'O que você mais gosta no EducaHub?' },
  { id: 'sugestao', nome: 'Sugestão', icone: 'raio', dica: 'O que deixaria a plataforma melhor?' },
  { id: 'problema', nome: 'Problema', icone: 'info', dica: 'O que atrapalhou ou não funcionou como você esperava?' },
] as const;

function EnviarFeedback() {
  const avatar = useEstado((e) => e.usuario?.avatar) ?? AVATAR_PADRAO;
  const [tipo, setTipo] = useState<(typeof TIPOS_DE_FEEDBACK)[number]['id']>('elogio');
  const [nota, setNota] = useState<number | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const escolhido = TIPOS_DE_FEEDBACK.find((t) => t.id === tipo)!;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (nota == null && !texto.trim()) return avisar('Dê uma nota ou escreva um comentário.', 'erro');
    setEnviando(true);
    try {
      await api('/feedback', { corpo: { tipo, nota, texto } });
      setEnviado(true);
      setNota(null);
      setTexto('');
    } catch (falha) {
      avisar(mensagemDoErro(falha), 'erro');
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <section className="cartao centro feedback-obrigado">
        <GatoVivo className="feedback-gato" avatar={avatar} animacao="comemorar" enquadramento="busto" />
        <h2>Obrigado pelo feedback!</h2>
        <p className="subtitulo">A equipe lê tudo o que chega. É assim que o EducaHub fica cada vez melhor.</p>
        <button className="botao claro" onClick={() => setEnviado(false)}>
          Enviar outro
        </button>
      </section>
    );
  }

  return (
    <form className="cartao coluna" onSubmit={enviar}>
      <div className="cartao-titulo" style={{ marginBottom: 0 }}>
        <Icone nome="coracao" tamanho={28} style={{ color: '#ff4f9a' }} />
        <h2>Conte o que você achou</h2>
      </div>
      <div className="chips" role="radiogroup" aria-label="Tipo de feedback">
        {TIPOS_DE_FEEDBACK.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={tipo === t.id} className={`chip rosa com-icone ${tipo === t.id ? 'ativo' : ''}`} onClick={() => setTipo(t.id)}>
            <Icone nome={t.icone} tamanho={16} />
            {t.nome}
          </button>
        ))}
      </div>
      <div className="campo">
        <span>Que nota você dá para o EducaHub?</span>
        <Estrelas nota={nota} aoEscolher={setNota} tamanho={38} />
      </div>
      <label className="campo">
        <span>{escolhido.dica}</span>
        <textarea className="entrada" style={{ minHeight: 120 }} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={1000} placeholder="Escreva à vontade (opcional se você deu uma nota)." />
      </label>
      <div className="linha quebra">
        <button className="botao rosa" disabled={enviando}>
          <Icone nome="enviar" tamanho={18} /> {enviando ? 'Enviando...' : 'Enviar feedback'}
        </button>
        <span className="suave pequeno cresce">Precisa de uma resposta? Use "Meus chamados": o feedback não vira conversa.</span>
      </div>
    </form>
  );
}

export function Ajuda() {
  const usuario = useEstado((e) => e.usuario)!;
  const respostasNovas = useEstado((e) => e.suporte.respostasNovas);
  const [parametros, setParametros] = useSearchParams();
  const aba: Aba = ABAS.find((a) => a === parametros.get('aba')) ?? 'perguntas';
  const novo = parametros.get('novo') === '1';

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Ajuda e suporte</h1>
          <p className="subtitulo">Tire dúvidas, fale com o suporte e conte o que você acha da plataforma.</p>
        </div>
        <div className="abas acoes">
          <button className={aba === 'perguntas' ? 'ativa' : ''} onClick={() => setParametros({ aba: 'perguntas' })}>
            Perguntas frequentes
          </button>
          <button className={aba === 'chamados' ? 'ativa' : ''} onClick={() => setParametros({ aba: 'chamados' })}>
            Meus chamados
            {respostasNovas > 0 && <b className="contador">{respostasNovas}</b>}
          </button>
          <button className={aba === 'feedback' ? 'ativa' : ''} onClick={() => setParametros({ aba: 'feedback' })}>
            Feedback
          </button>
        </div>
      </div>
      <div style={{ maxWidth: 900 }}>
        {aba === 'perguntas' ? (
          <Perguntas papel={usuario.papel} aoPedirAjuda={() => setParametros({ aba: 'chamados', novo: '1' })} />
        ) : aba === 'chamados' ? (
          <MeusChamados novo={novo} aoAbrirNovo={() => setParametros({ aba: 'chamados', novo: '1' })} aoFecharNovo={() => setParametros({ aba: 'chamados' })} />
        ) : (
          <EnviarFeedback />
        )}
      </div>
    </div>
  );
}
