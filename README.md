# EDUCA HUB

Plataforma educacional gamificada, do Ensino Fundamental ao Superior, com um gato 3D como mascote e avatar.
Alunos aprendem jogando, ganham pontos e moedas, mantêm sequências de dias, duelam entre si e personalizam o avatar.
Professores organizam turmas, propõem missões e acompanham o desempenho. O administrador tem acesso geral.

## Como rodar

Requisitos: [Node.js](https://nodejs.org) 24 ou mais novo.

```bash
npm install
```

```bash
npm run dev
```

Abra http://localhost:5173. Outros aparelhos da mesma rede acessam pelo endereço "Network" mostrado no terminal.

Para rodar como em produção (um único servidor, na porta 3001):

```bash
npm run build
```

```bash
npm start
```

## Contas

| Conta | Como obter |
| --- | --- |
| **Administrador** (`admin`) | Criada na primeira execução. A senha inicial fica em `admin-inicial.txt`, na pasta de dados. Troque em Configurações ou com `npm run admin:senha`. |
| **Demonstração** | `npm run seed` cria uma professora, uma turma e dez alunos com histórico. Usuários e senha ficam em `contas-demo.txt`, na pasta de dados. `npm run seed -- --recriar` apaga e recria essas contas. |
| **Novas contas** | Tela "Criar conta". Alunos entram direto; professores ficam pendentes até o administrador aprovar. |

**Pasta de dados:** `%LOCALAPPDATA%\EducaHub` (banco `educahub.db` e os arquivos de senha).
Ela fica fora do projeto de propósito: o OneDrive trava arquivos de banco de dados em pastas sincronizadas.
Para usar outro local, defina a variável de ambiente `EDUCAHUB_DADOS`.

## O que já existe

**Aluno**
- Painel inicial com as matérias do seu nível, progresso, missões do dia, sequência e ranking.
- Conteúdo por nível (1º ano do Fundamental até o Superior), organizado conforme a BNCC: 206 tópicos e 824 questões, cada tópico com resumo de estudo (Biblioteca).
- Três jogos por tópico: Quiz Relâmpago, Verdadeiro ou Falso e Jogo da Memória. As respostas são corrigidas no servidor.
- Pontos (XP), níveis, moedas e sequência de dias com recompensas nos marcos de 3, 7, 14, 30, 60 e 100 dias.
- Missões diárias e semanais do sistema e missões criadas pelos professores.
- Duelos em tempo real: contra um amigo (com chat), contra alguém aleatório do mesmo nível (só reações rápidas) ou treino contra o Mestre Bigodes.
- Avatar: gato 3D com 12 pelagens, 10 roupas e 31 acessórios, comprados com moedas ou ganhos por sequência.
- Amigos, rankings (nível, turma, amigos, geral; semanal ou total) e perfil.
- Ajuda e suporte (menu do perfil): perguntas frequentes, chamados para a equipe ou para um professor da turma, e feedback com nota de 1 a 5.

**Professor**
- Turmas por ano/série/curso, com código de acesso; só entram alunos do mesmo nível.
- Quem está online, ranking da turma, atividade recente e desempenho detalhado de cada aluno.
- Missões diárias ou semanais: metas de atividades/acertos ou quiz com questões próprias.
- Dúvidas dos alunos: os alunos das turmas podem escrever para o professor, que responde pela plataforma.
- Ajuda e suporte, inclusive enquanto a conta aguarda aprovação.

**Administrador**
- Visão geral da plataforma, aprovação de professores, gestão de usuários (bloquear, redefinir senha, moedas, excluir), turmas e moderação dos chats.
- Suporte: fila de pedidos de ajuda, resposta em nome da "Equipe EducaHub" e acompanhamento das conversas entre alunos e professores.
- Feedbacks: nota média, distribuição e comentários. Registro de segurança (logins, senhas e ações administrativas) em Moderação.
- Pendências de segurança no painel (senha inicial em uso, contas de demonstração ativas).

## Estrutura

```
server/            API (Express), tempo real (Socket.IO) e banco (SQLite embutido no Node)
  src/conteudo/    currículo e banco de questões por nível
  src/rotas/       conta, aprender (jogos), social, suporte, professor, admin
  src/regras.js    XP, níveis, sequência e missões
  src/loja.js      catálogo de skins e acessórios
  src/tempoReal.js presença online e duelos
  src/limites.js   tetos de uso (login, cadastro, chamados, eventos em tempo real)
  src/registro.js  registro de auditoria
  src/moderacao.js filtro de palavrões e nomes reservados à equipe
  testes/          testes de ponta a ponta: segurança, suporte e duelos
client/            interface (React + Vite + TypeScript)
  src/gato/        modelo 3D do gato, pelagens, acessórios e animações (Three.js)
  modelos/         arquivo GLB de referência do gato
  scripts/         importador do modelo do gato
  src/paginas/     telas de aluno, professor e admin
  src/jogos/       quiz, verdadeiro ou falso e memória
```

## O gato

O gato é montado em código (`client/src/gato/`), com formas do Three.js em estilo de desenho com contorno, e é isso que permite trocar pelagem, roupa e acessórios.

- `rigPrincipal.ts` é o corpo atual: proporções de mascote (cabeça grande, corpo pequeno e esbelto), cabeça modelada com bochechas, orelhas de ponta arredondada com a base embutida na cabeça, olhos em degradê, moletom com capuz, cordões e bolso, cauda que afina até a ponta.
- `rigClassico.ts` é o primeiro modelo da plataforma. `ESTILO_DO_GATO` em `modelo.ts` alterna entre os dois.
- `client/modelos/gato.glb` é o modelo enviado como referência (dele vieram os olhos com branco aparente e o salto com impulso). `node client/scripts/importar-gato.mjs caminho/do/modelo.glb` guarda uma nova versão do arquivo, corrigindo canais de animação malformados.
- Em modo de desenvolvimento, http://localhost:5173/laboratorio mostra o gato com todas as pelagens, roupas, acessórios, animações e ângulos (o botão "vistas" mostra seis ângulos de uma vez), e http://localhost:5173/visor mostra o arquivo GLB exatamente como veio.

### Nada atravessa o gato

Os acessórios são pensados para não entrar no corpo em nenhuma animação:

- Chapéus são pequenos e pousam no alto da cabeça, no vão entre as orelhas (que abrem um pouco para dar espaço). O capacete de astronauta é justo, com furos para as orelhas.
- Itens de mão ficam ao lado do corpo, abaixo da bochecha; quem segura um item continua segurando em todas as animações.
- Itens das costas ficam atrás do capuz, e a cauda passa por baixo e por fora deles.
- Alças, colares e fitas ficam rentes ao corpo (marcados com `rente(...)` em `acessorios.ts`).

`client/src/gato/colisoes.ts` confere isso de verdade: espalha pontos na superfície de cada peça e conta quantos caem dentro de outra, em todas as animações. No laboratório, abra o console do navegador e rode:

```js
await verificarColisoes()                       // cada acessório sozinho
await verificarColisoes([['mochila', 'fones']])  // combinações específicas
```

Lista vazia quer dizer que nada se atravessa. Rode sempre que criar ou mexer em um acessório, pose ou parte do corpo.

## Como adicionar conteúdo

Os arquivos em `server/src/conteudo/` listam, por série e matéria, os tópicos com resumo e questões:

```js
['F6', 'matematica', [
  { t: 'Título do tópico', r: 'Resumo para a Biblioteca.', q: [
    ['Enunciado?', 'resposta certa', 'errada', 'errada', 'errada', 'explicação opcional'],
  ]},
]],
```

Novos itens da loja entram em `server/src/loja.js` (nome, preço, raridade) e em `client/src/gato/acessorios.ts` (o desenho 3D, com o mesmo id). Depois de desenhar um acessório, inclua-o na lista `ENCAIXE` do laboratório e rode `verificarColisoes()` (ver "Nada atravessa o gato").

## Suporte e feedbacks

- Qualquer pessoa logada abre um chamado em **Ajuda e suporte** (menu do perfil). O aluno escolhe se escreve para a equipe da plataforma ou para um professor das turmas dele.
- Quem atende responde em **Suporte** (administrador) ou **Dúvidas dos alunos** (professor). A outra pessoa é avisada pelo sininho e a conversa se atualiza na hora.
- O chamado fica "aguardando resposta", "respondido" ou "resolvido". Depois de resolvido, quem pediu ajuda avalia o atendimento com estrelas; uma mensagem nova reabre o chamado.
- Para o aluno, a resposta do administrador aparece como "Equipe EducaHub". O administrador pode ler as conversas entre alunos e professores (aba "Alunos e professores") e excluir chamados.
- Limites: 5 chamados em andamento por pessoa, 10 novos por hora e 6 feedbacks por dia.

## Segurança

O que a plataforma faz sozinha:

- Senhas guardadas com scrypt; sessão em cookie `HttpOnly` e `SameSite` (e `Secure` quando o acesso é por HTTPS). Trocar a senha encerra as sessões dos outros aparelhos.
- Tetos de uso: 8 senhas erradas bloqueiam o login daquela conta por 10 minutos; há limites para cadastros, códigos de turma, pedidos de amizade, chamados e mensagens.
- Tudo o que chega do navegador é validado no servidor, inclusive os eventos dos duelos. O gabarito nunca vai para o navegador antes da resposta.
- Cabeçalhos de proteção (política de conteúdo, bloqueio de `iframe`), e a conexão em tempo real só aceita páginas da própria plataforma.
- Nomes como "admin" e "Suporte EducaHub" são reservados à equipe, para ninguém se passar por ela.
- Recompensas resistem a trapaça: refazer o quiz de um professor quase não rende, desistir de um duelo no início não entrega a vitória inteira e uma atividade só conta com pelo menos um acerto.
- Registro de auditoria em Moderação › Registro de segurança, guardado por 180 dias.

O que depende de quem administra:

- Trocar a senha inicial do `admin` e apagar o arquivo `admin-inicial.txt` (o painel avisa enquanto isso não for feito).
- Excluir as contas de demonstração antes de abrir a plataforma para alunos de verdade: todas usam a mesma senha.
- Antes de publicar na internet, colocar a plataforma atrás de HTTPS. Na rede local ela funciona em HTTP, e nesse caso as senhas trafegam sem criptografia dentro da rede.

## Testes

Com o servidor rodando e os dados de demonstração criados (a senha do administrador é opcional e habilita mais verificações):

```bash
node server/testes/seguranca.teste.mjs SENHA_DAS_CONTAS_DEMO SENHA_DO_ADMIN
```

```bash
node server/testes/suporte.teste.mjs SENHA_DAS_CONTAS_DEMO SENHA_DO_ADMIN
```

```bash
node server/testes/duelo.teste.mjs SENHA_DAS_CONTAS_DEMO
```

O teste de segurança repete ataques que já funcionaram (servidor derrubado por evento malformado, poluição de protótipo, missões concluídas sem jogar) e confere que agora são recusados.
