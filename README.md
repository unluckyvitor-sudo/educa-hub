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

**Pasta de dados:** `EducaHub`, dentro da sua pasta de usuário (no Windows, `C:\Users\SEU-NOME\EducaHub`). Nela ficam o banco `educahub.db`, os arquivos de senha e as cópias de segurança.
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
- Caderno de erros: o que o aluno erra nos jogos e duelos fica guardado para revisão (em Meu progresso e Minhas matérias) e sai depois de dois acertos seguidos. O resultado de cada jogo mostra o que foi errado, com a resposta certa.
- Quiz ao vivo: quando o professor da turma abre um, o convite aparece na tela e todos respondem ao mesmo tempo.
- Ajuda e suporte (menu do perfil): perguntas frequentes, chamados para a equipe ou para um professor da turma, e feedback com nota de 1 a 5.

**Professor**
- Turmas por ano/série/curso, com código de acesso; só entram alunos do mesmo nível.
- Quem está online, ranking da turma, atividade recente e desempenho detalhado de cada aluno.
- Missões com prazo livre (hoje, 7 dias ou uma data até 60 dias à frente): metas de atividades/acertos ou quiz com questões próprias. Título, descrição e prazo podem ser editados depois.
- Senha de aluno: na página do aluno, "Redefinir senha" gera uma senha temporária para quem esqueceu a sua.
- Conteúdo próprio: na Biblioteca, cria tópicos e acrescenta questões, que valem para os alunos das turmas dele.
- Quiz ao vivo: conduz uma rodada de perguntas com a turma inteira (a tela pode ser projetada) e termina com pódio.
- Dificuldades da turma: as questões em que os alunos mais erram.
- Dúvidas dos alunos: os alunos das turmas podem escrever para o professor, que responde pela plataforma.
- Ajuda e suporte, inclusive enquanto a conta aguarda aprovação.

**Administrador**
- Visão geral da plataforma, aprovação de professores, gestão de usuários (bloquear, redefinir senha, moedas, excluir), turmas e moderação dos chats.
- Suporte: fila de pedidos de ajuda, resposta em nome da "Equipe EducaHub" e acompanhamento das conversas entre alunos e professores.
- Feedbacks: nota média, distribuição e comentários. Registro de segurança (logins, senhas e ações administrativas) em Moderação.
- Pendências de segurança no painel (senha inicial em uso, contas de demonstração ativas).
- Conteúdo: cria tópicos e questões para todos os alunos de um nível e publica o que os professores criaram.
- Cópia de segurança do banco: uma por dia, automática, e um botão no painel para fazer na hora.

## Estrutura

```
server/            API (Express), tempo real (Socket.IO) e banco (SQLite embutido no Node)
  src/conteudo/    currículo e banco de questões por nível
  src/rotas/       conta, aprender (jogos), social, suporte, conteudo (editor), aoVivo (quiz ao vivo), professor, admin
  src/acervo.js    conteúdo dos arquivos + conteúdo criado pela interface; respostas e caderno de erros
  src/copias.js    cópias de segurança do banco (src/copia.js é o comando)
  src/termos.js    aceite dos termos e autorização do responsável
  src/estaticos.js entrega do cliente em produção (compressão e cache)
  src/regras.js    XP, níveis, sequência e missões
  src/loja.js      catálogo de skins e acessórios
  src/tempoReal.js presença online e duelos
  src/limites.js   tetos de uso (login, cadastro, chamados, eventos em tempo real)
  src/registro.js  registro de auditoria
  src/moderacao.js filtro de palavrões e nomes reservados à equipe
  testes/          testes de ponta a ponta: segurança, suporte, duelos, conteúdo, quiz ao vivo e ferramentas do professor
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

**Pela interface (sem mexer em código):** professores e administradores abrem a **Biblioteca**, escolhem o nível e usam "Novo tópico" ou o botão de questões de um tópico.

- Uma questão tem enunciado, a resposta certa, três erradas e uma explicação opcional.
- Um tópico novo aparece para os alunos quando tem pelo menos 4 questões (antes disso é rascunho).
- O que o administrador cria vale para todos os alunos do nível. O que o professor cria vale para os alunos das turmas dele, até o administrador clicar em "Publicar para todos".
- Um quiz usa até 6 questões do tópico (mais 2 de revisão) e dá preferência às que o aluno errou e às que ele ainda não viu.
- Os duelos usam só o conteúdo público, porque os dois jogadores precisam poder ver as mesmas questões.

**Nos arquivos:** `server/src/conteudo/` lista, por série e matéria, os tópicos com resumo e questões:

```js
['F6', 'matematica', [
  { t: 'Título do tópico', r: 'Resumo para a Biblioteca.', q: [
    ['Enunciado?', 'resposta certa', 'errada', 'errada', 'errada', 'explicação opcional'],
  ]},
]],
```

**Vídeo-aula no resumo:** coloque o arquivo `.mp4` (H.264) em `client/public/videos/` e aponte o tópico para ele com `v: '/videos/nome-do-arquivo.mp4'`. O vídeo aparece no resumo do tópico (botão "Resumo e vídeo" em Minhas matérias) e na Biblioteca. Hoje há dois, nos tópicos de Matemática do 7º ano: *Números inteiros e racionais* e *Equações, razão e proporção*.

Novos itens da loja entram em `server/src/loja.js` (nome, preço, raridade) e em `client/src/gato/acessorios.ts` (o desenho 3D, com o mesmo id). Depois de desenhar um acessório, inclua-o na lista `ENCAIXE` do laboratório e rode `verificarColisoes()` (ver "Nada atravessa o gato").

## Caderno de erros

- Toda resposta dada nos jogos, duelos e quizzes ao vivo é registrada (tabela `respostas`). As dos desafios de professor ficam de fora, porque somem com a missão.
- Uma questão errada entra no caderno do aluno e sai quando ele a acerta duas vezes seguidas.
- "Revisar agora" abre um quiz com até 8 questões do caderno, das mais antigas para as mais novas. A revisão rende 5 XP e 1 moeda por acerto, e quase nada depois de três revisões no mesmo dia.
- Na turma, a aba **Dificuldades** mostra ao professor as questões com maior taxa de erro (com pelo menos 3 respostas).

## Quiz ao vivo

- O professor abre a turma, clica em **Quiz ao vivo**, escolhe a matéria (ou um tópico) e a quantidade de perguntas.
- Os alunos da turma que estão com a plataforma aberta recebem o convite na hora; quem entrar depois também encontra o quiz.
- O professor conduz: começa, fecha a pergunta antes do tempo se quiser e passa para a próxima. Cada pergunta dura 20 segundos e fecha sozinha quando todos respondem.
- O gabarito só aparece depois que a pergunta fecha, inclusive na tela do professor, que costuma estar projetada.
- No fim há pódio e recompensa: 10 XP mais 5 por acerto, com bônus para os três primeiros quando há pelo menos 3 participantes. Cada aluno recebe recompensa de até 3 quizzes por dia.
- A sessão fica na memória do servidor: reiniciar o servidor encerra um quiz em andamento.

## Suporte e feedbacks

- Qualquer pessoa logada abre um chamado em **Ajuda e suporte** (menu do perfil). O aluno escolhe se escreve para a equipe da plataforma ou para um professor das turmas dele.
- Quem atende responde em **Suporte** (administrador) ou **Dúvidas dos alunos** (professor). A outra pessoa é avisada pelo sininho e a conversa se atualiza na hora.
- O chamado fica "aguardando resposta", "respondido" ou "resolvido". Depois de resolvido, quem pediu ajuda avalia o atendimento com estrelas; uma mensagem nova reabre o chamado.
- Para o aluno, a resposta do administrador aparece como "Equipe EducaHub". O administrador pode ler as conversas entre alunos e professores (aba "Alunos e professores") e excluir chamados.
- Limites: 5 chamados em andamento por pessoa, 10 novos por hora e 6 feedbacks por dia.

## Termos de uso e privacidade

- As páginas **/termos** e **/privacidade** abrem com ou sem login. Os textos ficam em `client/src/paginas/Termos.tsx`.
- No cadastro, todos aceitam os termos. O aluno informa a data de nascimento e, se tiver menos de 18 anos, o nome e a autorização de um responsável.
- A autorização é declarada por quem preenche o cadastro: a plataforma registra o nome informado e a data, mas não verifica a identidade do responsável.
- Contas criadas antes dos termos (ou depois de uma versão nova) veem uma janela de aceite ao entrar. Para pedir um novo aceite a todos, mude `VERSAO_DOS_TERMOS` em `server/src/termos.js`.
- As variáveis `EDUCAHUB_RESPONSAVEL` (quem responde pela instalação) e `EDUCAHUB_CONTATO` (e-mail ou telefone) aparecem nos dois documentos; o painel do administrador avisa enquanto não forem definidas.
- **Os textos são um modelo.** Antes de abrir a plataforma ao público, revise-os com alguém que entenda da Lei Geral de Proteção de Dados.

## Conexão instável

- **Duelos:** quem perde a conexão tem 20 segundos para voltar. O duelo continua nesse tempo (quem caiu só deixa de responder) e, na volta, o jogador recebe a pergunta em andamento. Recarregar a página também volta ao duelo. Quem não retorna no prazo perde por abandono.
- **Sessão:** quando a sessão expira ou é encerrada em outro aparelho, a plataforma volta para a tela de entrada com um aviso.
- **Jogos:** se o resultado não chegar por falha de rede, as respostas continuam guardadas no servidor e o botão "Tentar de novo" busca o resultado sem refazer o jogo. Sair no meio de uma partida pede confirmação.
- **Telas de erro:** todas têm o botão "Tentar de novo".

## Publicar na internet

A plataforma precisa de um servidor Node ligado o tempo todo, com conexões WebSocket (duelos e quiz ao vivo) e um disco que não se apague (o banco é um arquivo). Hospedagens só de sites estáticos, como a Netlify, não servem para o servidor.

**Para testar sem hospedar:** um endereço público temporário, com HTTPS, que aponta para a plataforma rodando neste computador. Precisa do [cloudflared](https://github.com/cloudflare/cloudflared) (`winget install --id Cloudflare.cloudflared -e`).

```bash
npm run build
```

```bash
npm run tunel
```

O comando mostra o endereço (algo como `https://palavras-aleatorias.trycloudflare.com`). Ele vale enquanto a janela ficar aberta, muda a cada vez que o túnel é ligado e depende de o computador continuar ligado. Os dados continuam na pasta de dados deste computador. Quem tiver o endereço chega à tela de entrada: troque a senha inicial do administrador e exclua as contas de demonstração antes de divulgar.

**Para deixar no ar de vez**, em uma hospedagem de aplicações Node. O projeto já traz um `Dockerfile` (constrói a interface e monta uma imagem só com o servidor, com o banco em `/dados` e o fuso de Brasília), que o [Railway](https://railway.com) detecta sozinho:

```bash
npx @railway/cli login
```

```bash
npx @railway/cli init --name educa-hub
```

```bash
npx @railway/cli add --service educa-hub --variables "EDUCAHUB_PROXY=1"
```

```bash
npx @railway/cli service link educa-hub
```

```bash
npx @railway/cli volume add --mount-path /dados
```

```bash
npx @railway/cli domain
```

Daí em diante, cada nova versão sobe com:

```bash
npm run publicar
```

No Git Bash, o caminho `/dados` do comando do disco é convertido para uma pasta do Windows: rode esse comando no PowerShell ou com `MSYS_NO_PATHCONV=1` na frente.

A senha do administrador é definida no painel do Railway (serviço → Variables → `EDUCAHUB_ADMIN_SENHA`), não pela linha de comando.

As demais opções ficam nas configurações do serviço (painel → serviço → Settings), não em arquivo: em serviços novos o Railway não lê mais o `railway.json`. As que valem a pena:

- **Healthcheck Path** `/api/catalogo`: a publicação só é dada como concluída quando o servidor responde.
- **Serverless** (opcional): o servidor dorme depois de 5 a 10 minutos sem acessos e acorda sozinho no primeiro acesso, que demora mais e pode falhar uma vez (erro 502; basta recarregar). Reduz o consumo quando o site fica parado. Enquanto alguém estiver com a plataforma aberta e logado, a conexão em tempo real mantém o servidor acordado.

Uma opção alterada só vale a partir de uma publicação nova (`npm run publicar`): o botão de reimplantar repete a configuração da publicação anterior.

O disco (`volume`) é o que guarda o banco entre uma publicação e outra: sem ele, tudo se apaga a cada versão nova. Enquanto a versão nova liga, o endereço fica fora do ar por alguns instantes, e duelos e quizzes ao vivo em andamento são interrompidos.

Em outra hospedagem, sem contêiner:

1. Comando de construção: `npm install && npm run build`. Comando para iniciar: `npm start`. Versão do Node: 24 ou mais nova.
2. Um disco persistente, com a variável `EDUCAHUB_DADOS` apontando para ele (por exemplo `/dados`).
3. Variáveis de ambiente:

| Variável | Para que serve |
| --- | --- |
| `PORT` | Porta do servidor (a hospedagem costuma definir sozinha). |
| `EDUCAHUB_DADOS` | Pasta do banco e das cópias de segurança. Precisa estar no disco persistente. |
| `EDUCAHUB_PROXY` | Use `1` quando houver um proxy da hospedagem na frente (é o caso comum). Sem isso o cookie de sessão não é marcado como seguro e todos os visitantes parecem vir do mesmo endereço. |
| `EDUCAHUB_ADMIN_SENHA` | Senha inicial do `admin` (mínimo de 10 caracteres). Pode ser definida antes ou depois de o servidor ligar pela primeira vez: ela vale enquanto a senha sorteada não tiver sido trocada. Troque-a em Configurações depois do primeiro acesso; a partir daí a variável não tem mais efeito e pode ser removida. |
| `EDUCAHUB_SERIES` | Limita os níveis oferecidos, por exemplo `F7` (só o 7º ano, para uma demonstração) ou `F6,F7`. Os outros somem do cadastro, das turmas novas e da Biblioteca; contas e turmas que estavam neles passam a usar o primeiro nível da lista. Nada é apagado: sem a variável, tudo volta como era. |
| `TZ` | Fuso que define quando o dia vira (sequência, missões do dia). O `Dockerfile` usa `America/Sao_Paulo`. |
| `EDUCAHUB_RESPONSAVEL`, `EDUCAHUB_CONTATO` | Quem responde pela instalação e como falar com essa pessoa (aparecem nos termos). |
| `EDUCAHUB_COPIAS` | Outra pasta para as cópias de segurança (opcional). |

4. HTTPS: fica por conta da hospedagem. Com `EDUCAHUB_PROXY=1` o servidor passa a marcar o cookie como seguro e a enviar o cabeçalho HSTS.
5. Não rode `npm run seed` em produção: as contas de demonstração usam todas a mesma senha.

Em produção o servidor entrega o cliente comprimido (o carregamento inicial fica em cerca de 180 kB) e o motor 3D do gato é buscado à parte, depois que a página já apareceu.

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

## Cópias de segurança e histórico

**Banco de dados.** O servidor grava uma cópia por dia em `copias`, dentro da pasta de dados, e guarda as 14 mais recentes. O painel do administrador mostra a última e tem o botão "Fazer cópia agora".

```bash
npm run backup
```

```bash
npm run backup -- --listar
```

Para voltar a uma cópia, pare o servidor e rode o comando abaixo com o nome mostrado na lista. Ele confere a integridade da cópia, guarda o estado atual antes de trocar e se recusa a rodar com o servidor ligado.

```bash
npm run backup -- --restaurar NOME-DA-COPIA.db
```

As cópias ficam no mesmo disco do banco. Para protegê-las de um defeito no disco, defina a variável `EDUCAHUB_COPIAS` com outra pasta (pen drive, outra unidade ou uma pasta sincronizada).

**Código.** O projeto é um repositório git. Cada conjunto de mudanças é um registro que pode ser consultado ou desfeito:

```bash
git log --oneline
```

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

```bash
node server/testes/conteudo.teste.mjs SENHA_DAS_CONTAS_DEMO SENHA_DO_ADMIN
```

```bash
node server/testes/aoVivo.teste.mjs SENHA_DAS_CONTAS_DEMO
```

```bash
node server/testes/professor.teste.mjs SENHA_DAS_CONTAS_DEMO
```

Os testes usam as contas de demonstração e deixam rastros nelas (pontos, atividades e questões no caderno de erros). O conteúdo que eles criam é apagado no fim.

O teste de segurança repete ataques que já funcionaram (servidor derrubado por evento malformado, poluição de protótipo, missões concluídas sem jogar) e confere que agora são recusados.
