// Termos de uso, Política de privacidade e o aceite deles (no cadastro e para contas que já existiam).
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, mensagemDoErro } from '../api';
import { useEstado } from '../estado';
import { desconectarTempoReal } from '../tempoReal';
import { Carregando, Modal, useCarregar } from '../componentes/comuns';
import { Icone } from '../componentes/Icone';
import { Logo } from '../componentes/Logo';
import type { Usuario } from '../tipos';

interface Sobre {
  responsavel: string | null;
  contato: string | null;
  versaoDosTermos: string;
  idadeSemResponsavel: number;
}

/** Abaixo desta idade o cadastro de aluno pede a autorização de um responsável (a regra que vale é a do servidor). */
export const IDADE_SEM_RESPONSAVEL = 18;

export function idadeEm(nascimento: string, hoje = new Date()) {
  const [ano, mes, dia] = nascimento.split('-').map(Number);
  if (!ano || !mes || !dia) return null;
  const jaFezAniversario = hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia);
  return hoje.getFullYear() - ano - (jaFezAniversario ? 0 : 1);
}

export const menorDeIdade = (nascimento: string) => {
  const idade = idadeEm(nascimento);
  return idade !== null && idade < IDADE_SEM_RESPONSAVEL;
};

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

function TermosDeUso({ quem }: { quem: string }) {
  return (
    <>
      <Secao titulo="1. O que é o EducaHub">
        <p>O EducaHub é uma plataforma de estudo com jogos, missões, duelos de conhecimento e um gato como avatar, para alunos do Ensino Fundamental ao Superior. Este endereço é administrado por {quem}, que responde pelo uso feito aqui.</p>
      </Secao>
      <Secao titulo="2. Contas">
        <ul>
          <li>Há contas de aluno e de professor. As de professor só são liberadas depois da aprovação da administração.</li>
          <li>Informe dados verdadeiros e guarde a sua senha: ninguém da equipe vai pedi-la.</li>
          <li>Alunos com menos de {IDADE_SEM_RESPONSAVEL} anos só podem usar a plataforma com a autorização de um responsável, informada no cadastro.</li>
          <li>O aluno que esquece a senha pede uma nova ao professor da turma ou ao suporte.</li>
        </ul>
      </Secao>
      <Secao titulo="3. Convivência">
        <ul>
          <li>Trate colegas e professores com respeito. Nomes, mensagens e textos ofensivos não são permitidos.</li>
          <li>Não é permitido trapacear nos jogos, tentar entrar na conta de outra pessoa nem atrapalhar o funcionamento da plataforma.</li>
          <li>As conversas dos duelos entre amigos e os pedidos de ajuda ficam registrados e podem ser lidos pela administração para manter o ambiente seguro.</li>
          <li>Contas que desrespeitarem estas regras podem ser bloqueadas ou excluídas.</li>
        </ul>
      </Secao>
      <Secao titulo="4. Pontos, moedas e itens">
        <p>Pontos, moedas, sequências e itens do avatar existem só dentro da plataforma: não têm valor em dinheiro e não podem ser vendidos nem trocados. As regras de pontuação podem ser ajustadas para manter o jogo justo.</p>
      </Secao>
      <Secao titulo="5. Conteúdo">
        <p>Os resumos e as questões são oferecidos como apoio ao estudo e não substituem as aulas. Professores podem criar tópicos, questões e missões para as suas turmas; quem cria é responsável pelo que escreve e autoriza o uso desse material dentro da plataforma.</p>
      </Secao>
      <Secao titulo="6. Funcionamento">
        <p>A plataforma pode ficar fora do ar para manutenção ou por falhas, e partidas em andamento podem ser perdidas nesses momentos. É feita uma cópia de segurança dos dados por dia, mas não há garantia contra toda perda.</p>
      </Secao>
      <Secao titulo="7. Encerramento">
        <p>Você pode pedir a exclusão da sua conta a qualquer momento em Ajuda e suporte. A exclusão apaga os dados da conta, como descrito na Política de privacidade.</p>
      </Secao>
      <Secao titulo="8. Mudanças nestes termos">
        <p>Quando os termos mudarem de forma relevante, a plataforma avisa e pede um novo aceite antes de continuar.</p>
      </Secao>
    </>
  );
}

function PoliticaDePrivacidade({ quem }: { quem: string }) {
  return (
    <>
      <Secao titulo="1. Quem cuida dos seus dados">
        <p>Os dados deste endereço ficam sob a responsabilidade de {quem}. Eles servem para a plataforma funcionar e para alunos e professores acompanharem o aprendizado. Não são vendidos nem usados para publicidade, e não há anúncios nem rastreadores de outras empresas nas páginas.</p>
      </Secao>
      <Secao titulo="2. O que é guardado">
        <ul>
          <li><strong>Cadastro:</strong> nome, nome de usuário, senha (guardada embaralhada, de um jeito que nem a administração consegue ler) e nível de ensino. Do aluno, também a data de nascimento e, se for menor de idade, o nome do responsável que autorizou. Opcionais: e-mail, escola ou curso e um texto de apresentação.</li>
          <li><strong>Estudo:</strong> atividades feitas, respostas dadas e acertos, pontos, moedas, sequência de dias, itens do avatar, duelos, turmas e missões.</li>
          <li><strong>Mensagens:</strong> conversas dos duelos entre amigos, pedidos de ajuda e feedbacks enviados.</li>
          <li><strong>Segurança:</strong> horário e endereço de rede (IP) dos logins e de ações como troca de senha, por até 180 dias.</li>
        </ul>
      </Secao>
      <Secao titulo="3. Quem enxerga o quê">
        <ul>
          <li><strong>Outros alunos:</strong> nome, avatar, nível e pontos (nos rankings e no perfil). Amigos e colegas de turma veem também a escola ou o curso.</li>
          <li><strong>Professores das suas turmas:</strong> o seu desempenho: atividades, acertos, sequência e as questões em que a turma mais erra.</li>
          <li><strong>Administração:</strong> os dados da conta e do uso, para dar suporte e manter a segurança. A senha, nunca.</li>
        </ul>
      </Secao>
      <Secao titulo="4. Crianças e adolescentes">
        <p>Alunos com menos de {IDADE_SEM_RESPONSAVEL} anos usam a plataforma com a autorização de um responsável, que é registrada com o nome informado e a data. O responsável pode pedir para ver, corrigir ou apagar os dados do aluno a qualquer momento.</p>
      </Secao>
      <Secao titulo="5. Cookies">
        <p>A plataforma usa um único cookie, necessário para manter você conectado. A preferência de som fica guardada no seu navegador.</p>
      </Secao>
      <Secao titulo="6. Por quanto tempo">
        <p>Os dados ficam guardados enquanto a conta existir. Quando a conta é excluída, eles são apagados; restam por até 180 dias o registro de segurança (nome e ação) e, por até 14 dias, as cópias de segurança diárias.</p>
      </Secao>
      <Secao titulo="7. Seus direitos">
        <p>Você (ou o seu responsável) pode pedir para saber quais dados existem, corrigi-los ou apagá-los, como prevê a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Parte dos dados você mesmo altera em Configurações; para o restante, escreva em Ajuda e suporte.</p>
      </Secao>
      <Secao titulo="8. Mudanças nesta política">
        <p>Mudanças relevantes são avisadas na plataforma, com um novo pedido de aceite.</p>
      </Secao>
    </>
  );
}

/** Página pública com os Termos de uso ou a Política de privacidade. */
export function Termos({ documento }: { documento: 'termos' | 'privacidade' }) {
  const { dados } = useCarregar(() => api<Sobre>('/sobre'));
  if (!dados) return <Carregando />;
  const quem = dados.responsavel ?? 'a instituição ou pessoa que disponibilizou este endereço';
  const termos = documento === 'termos';

  return (
    <div className="documento">
      <header>
        <Link to="/" aria-label="Página inicial">
          <Logo altura={40} />
        </Link>
        <Link className="botao claro pequeno" to="/">
          <Icone nome="voltar" tamanho={16} /> Voltar
        </Link>
      </header>
      <article>
        <h1>{termos ? 'Termos de uso' : 'Política de privacidade'}</h1>
        <p className="suave">Versão {dados.versaoDosTermos}</p>
        {termos ? <TermosDeUso quem={quem} /> : <PoliticaDePrivacidade quem={quem} />}
        <Secao titulo={termos ? '9. Contato' : '9. Contato'}>
          <p>
            Dúvidas e pedidos: use Ajuda e suporte, no menu do perfil{dados.contato ? `, ou escreva para ${dados.contato}` : ''}.
          </p>
        </Secao>
        <p>
          <Link className="link" to={termos ? '/privacidade' : '/termos'}>
            {termos ? 'Ler a Política de privacidade' : 'Ler os Termos de uso'}
          </Link>
        </p>
      </article>
    </div>
  );
}

interface Aceite {
  aceitouTermos: boolean;
  responsavel: string;
  autorizacaoDoResponsavel: boolean;
}

export const ACEITE_VAZIO: Aceite = { aceitouTermos: false, responsavel: '', autorizacaoDoResponsavel: false };

/** Caixas de aceite dos termos e, para aluno menor de idade, a autorização do responsável. */
export function CamposDeAceite({ valor, aoMudar, pedirResponsavel }: { valor: Aceite; aoMudar: (novo: Aceite) => void; pedirResponsavel: boolean }) {
  return (
    <div className="aceite">
      {pedirResponsavel && (
        <div className="aceite-responsavel">
          <strong>Autorização do responsável</strong>
          <p className="pequeno suave">Alunos com menos de {IDADE_SEM_RESPONSAVEL} anos precisam da autorização do pai, da mãe ou de outro responsável. Chame essa pessoa para preencher esta parte.</p>
          <label className="campo">
            <span>Nome completo do responsável</span>
            <input className="entrada" value={valor.responsavel} onChange={(e) => aoMudar({ ...valor, responsavel: e.target.value })} maxLength={80} autoComplete="off" required />
          </label>
          <label className="aceite-caixa">
            <input type="checkbox" checked={valor.autorizacaoDoResponsavel} onChange={(e) => aoMudar({ ...valor, autorizacaoDoResponsavel: e.target.checked })} required />
            <span>Sou o responsável por este aluno e autorizo o uso da plataforma e o tratamento dos dados dele, como descrito na Política de privacidade.</span>
          </label>
        </div>
      )}
      <label className="aceite-caixa">
        <input type="checkbox" checked={valor.aceitouTermos} onChange={(e) => aoMudar({ ...valor, aceitouTermos: e.target.checked })} required />
        <span>
          Li e aceito os{' '}
          <a className="link" href="/termos" target="_blank" rel="noreferrer">
            Termos de uso
          </a>{' '}
          e a{' '}
          <a className="link" href="/privacidade" target="_blank" rel="noreferrer">
            Política de privacidade
          </a>
          .
        </span>
      </label>
    </div>
  );
}

/** Janela para contas criadas antes dos termos (ou depois de uma versão nova): sem aceitar, não dá para continuar. */
export function AceiteDosTermos() {
  const usuario = useEstado((e) => e.usuario);
  const definirUsuario = useEstado((e) => e.definirUsuario);
  const { pathname } = useLocation();
  const [aceite, setAceite] = useState(ACEITE_VAZIO);
  const [nascimento, setNascimento] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const pendencias = usuario?.pendencias ?? null;
  // Nas páginas dos próprios documentos a janela não aparece, para dar para ler antes de aceitar.
  const aberto = !!pendencias && pathname !== '/termos' && pathname !== '/privacidade';
  const data = usuario?.nascimento ?? nascimento;
  const pedirResponsavel = usuario?.papel === 'aluno' && !!data && menorDeIdade(data);

  const aceitar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const r = await api<{ usuario: Usuario }>('/eu/termos', { corpo: { ...aceite, nascimento } });
      definirUsuario(r.usuario);
    } catch (falha) {
      setErro(mensagemDoErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  const sair = async () => {
    await api('/auth/sair', { metodo: 'POST' }).catch(() => {});
    desconectarTempoReal();
    definirUsuario(null);
  };

  return (
    <Modal aberto={aberto}>
      {aberto && pendencias && (
        <form onSubmit={aceitar} className="coluna" style={{ gap: 14 }}>
          <h2>Antes de continuar</h2>
          <p className="suave">
            {pendencias.termos ? 'O EducaHub agora tem Termos de uso e Política de privacidade. Leia e aceite para seguir usando a sua conta.' : 'Falta uma informação para a sua conta ficar em dia com os Termos de uso.'}
          </p>
          {pendencias.nascimento && (
            <label className="campo">
              <span>Sua data de nascimento</span>
              <input className="entrada" type="date" value={nascimento} onChange={(e) => setNascimento(e.target.value)} max={new Date().toISOString().slice(0, 10)} required />
            </label>
          )}
          <CamposDeAceite valor={aceite} aoMudar={setAceite} pedirResponsavel={pedirResponsavel} />
          {erro && <div className="erro-form">{erro}</div>}
          <div className="modal-acoes">
            <button type="button" className="botao claro" onClick={() => void sair()}>
              Sair
            </button>
            <button className="botao" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Aceitar e continuar'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
