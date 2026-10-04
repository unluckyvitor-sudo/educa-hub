// Teste de ponta a ponta do quiz ao vivo: uma professora conduz e dois alunos respondem.
// Uso: node testes/aoVivo.teste.mjs <senha-das-contas-demo>
import { lerSenhas, verificar, entrar, conectar, esperar, pausa } from './apoio.mjs';

const { demo } = lerSenhas();
const prof = await entrar('prof.marina', demo);
const bruno = await entrar('bruno', demo);
const carla = await entrar('carla', demo);
const deFora = await entrar('lucas', demo); // não está na turma
const turma = (await prof.get('/prof/turmas')).dados.turmas[0];

// Uma sessão que tenha sobrado de uma execução anterior é encerrada antes de começar.
const sobra = (await prof.get('/aovivo/atual')).dados.sessao;
if (sobra) {
  await prof.post(`/aovivo/${sobra.id}/encerrar`);
  const ainda = (await prof.get('/aovivo/atual')).dados.sessao;
  if (ainda) await prof.post(`/aovivo/${ainda.id}/encerrar`);
}

const sockets = { prof: await conectar(prof.cookie), bruno: await conectar(bruno.cookie), carla: await conectar(carla.cookie) };
const estadoDe = (quem, condicao) =>
  new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error(`Tempo esgotado esperando o estado de ${quem}`)), 8000);
    const ouvir = (e) => {
      if (!condicao(e)) return;
      clearTimeout(t);
      sockets[quem].off('aovivo:estado', ouvir);
      ok(e);
    };
    sockets[quem].on('aovivo:estado', ouvir);
  });

try {
  // ── Criação e sala ──
  verificar((await bruno.post('/aovivo', { turmaId: turma.id, materia: 'matematica' })).status === 403, 'aluno não cria quiz ao vivo');
  verificar((await prof.post('/aovivo', { turmaId: 999999, materia: 'matematica' })).status === 400, 'turma de outra pessoa é recusada');
  const convite = esperar(sockets.bruno, 'aovivo:convite', 6000);
  const criado = await prof.post('/aovivo', { turmaId: turma.id, topicoId: 'F6.matematica.1', quantidade: 3 });
  verificar(criado.status === 201 && criado.dados.sessao.fase === 'sala' && criado.dados.sessao.conduz, 'professora cria o quiz e entra como condutora');
  const id = criado.dados.sessao.id;
  verificar((await convite).id === id, 'os alunos da turma recebem o convite na hora');
  verificar((await prof.post('/aovivo', { turmaId: turma.id, materia: 'matematica' })).status === 400, 'não abre dois quizzes na mesma turma');
  verificar((await bruno.get('/aovivo/atual')).dados.sessao?.participando === false, 'quem abre a plataforma depois também encontra o quiz');
  verificar((await deFora.get('/aovivo/atual')).dados.sessao === null, 'aluno de outra turma não vê o quiz');
  verificar((await deFora.post(`/aovivo/${id}/entrar`)).status === 400, 'e não consegue entrar');
  verificar((await prof.post(`/aovivo/${id}/avancar`)).status === 400, 'não começa com a sala vazia');

  const salaCheia = estadoDe('prof', (e) => e.fase === 'sala' && e.participantes === 2);
  await bruno.post(`/aovivo/${id}/entrar`);
  await carla.post(`/aovivo/${id}/entrar`);
  verificar((await salaCheia).sala.length === 2, 'a professora vê os alunos chegando à sala');
  verificar((await bruno.post(`/aovivo/${id}/avancar`)).status === 403, 'aluno não conduz o quiz');

  // ── Primeira pergunta: os dois respondem e ela fecha sozinha ──
  const perguntaDoBruno = estadoDe('bruno', (e) => e.fase === 'pergunta');
  const inicio = await prof.post(`/aovivo/${id}/avancar`);
  verificar(inicio.dados.sessao.fase === 'pergunta' && inicio.dados.sessao.indice === 0, 'o quiz começa');
  const p1 = await perguntaDoBruno;
  verificar(p1.pergunta.alternativas.length === 4 && p1.resultado === null, 'a pergunta chega aos alunos sem o gabarito');
  verificar(inicio.dados.sessao.resultado === null && !JSON.stringify(inicio.dados.sessao).includes('"correta"'), 'a tela da professora também não mostra o gabarito durante a pergunta');
  verificar((await bruno.post(`/aovivo/${id}/responder`, { indice: 0, resposta: 9 })).status === 400, 'resposta fora das alternativas é recusada');

  const contagem = estadoDe('prof', (e) => e.fase === 'pergunta' && e.pergunta.responderam === 1);
  const r1 = await bruno.post(`/aovivo/${id}/responder`, { indice: 0, resposta: 0 });
  verificar(r1.dados.sessao.pergunta.minhaResposta === 0 && r1.dados.sessao.fase === 'pergunta', 'a resposta fica registrada e a pergunta segue aberta');
  await contagem;
  verificar(true, 'a professora acompanha quantos já responderam');
  await bruno.post(`/aovivo/${id}/responder`, { indice: 0, resposta: 1 });
  const fechou = estadoDe('prof', (e) => e.fase === 'resultado');
  await carla.post(`/aovivo/${id}/responder`, { indice: 0, resposta: 1 });
  const res1 = await fechou;
  verificar(res1.resultado.distribuicao[0] === 1 && res1.resultado.distribuicao[1] === 1, 'quando todos respondem, a pergunta fecha (e a segunda resposta do mesmo aluno não conta)');
  verificar(Number.isInteger(res1.resultado.correta) && res1.podio.length === 2, 'o resultado traz o gabarito e a classificação');
  verificar((await bruno.post(`/aovivo/${id}/responder`, { indice: 0, resposta: 2 })).status === 400, 'depois de fechada, a pergunta não aceita resposta');

  // ── Segunda pergunta: só um responde e a professora fecha antes do tempo ──
  await prof.post(`/aovivo/${id}/avancar`);
  const correta2 = await carla.post(`/aovivo/${id}/responder`, { indice: 1, resposta: 2 });
  verificar(correta2.dados.sessao.fase === 'pergunta', 'com gente faltando responder, a pergunta continua aberta');
  const res2 = (await prof.post(`/aovivo/${id}/avancar`)).dados.sessao;
  verificar(res2.fase === 'resultado' && res2.resultado.distribuicao.reduce((a, b) => a + b, 0) === 1, 'a professora pode fechar a pergunta antes do tempo');

  // ── Terceira pergunta e pódio ──
  await prof.post(`/aovivo/${id}/avancar`);
  const estadoDaCarla = (await carla.get('/aovivo/atual')).dados.sessao;
  verificar(estadoDaCarla.fase === 'pergunta' && estadoDaCarla.indice === 2 && estadoDaCarla.pergunta.restanteMs > 15000, 'quem recarrega a página volta para a pergunta em andamento');
  await bruno.post(`/aovivo/${id}/responder`, { indice: 2, resposta: 0 });
  await carla.post(`/aovivo/${id}/responder`, { indice: 2, resposta: 0 });
  const fimDoBruno = estadoDe('bruno', (e) => e.fase === 'fim');
  const fim = (await prof.post(`/aovivo/${id}/avancar`)).dados.sessao;
  verificar(fim.fase === 'fim' && fim.podio.length === 2 && fim.podio[0].pontos >= fim.podio[1].pontos, 'depois da última pergunta vem o pódio, em ordem de pontos');
  const meuFim = await fimDoBruno;
  verificar(meuFim.eu.recompensa !== null && meuFim.eu.posicao >= 1, 'cada aluno recebe a posição e a recompensa');
  console.log(`   (recompensa do Bruno: ${meuFim.eu.recompensa.xp} XP e ${meuFim.eu.recompensa.moedas} moedas — zero quando o teto de ${3} quizzes por dia já foi atingido)`);

  // ── Encerramento ──
  const encerrado = esperar(sockets.carla, 'aovivo:encerrado', 6000);
  verificar((await prof.post(`/aovivo/${id}/encerrar`)).dados.sessao === null, 'a professora fecha a sessão');
  verificar((await encerrado).id === id, 'os alunos são avisados do encerramento');
  await pausa(200);
  verificar((await bruno.get('/aovivo/atual')).dados.sessao === null, 'a sessão some para todos');
  verificar((await bruno.post(`/aovivo/${id}/responder`, { indice: 0, resposta: 0 })).status === 400, 'sessão encerrada não aceita mais nada');
} finally {
  const sobrou = (await prof.get('/aovivo/atual')).dados.sessao;
  if (sobrou) {
    await prof.post(`/aovivo/${sobrou.id}/encerrar`);
    const ainda = (await prof.get('/aovivo/atual')).dados.sessao;
    if (ainda) await prof.post(`/aovivo/${ainda.id}/encerrar`);
  }
  for (const s of Object.values(sockets)) s.close();
}

console.log('\nTodos os testes do quiz ao vivo passaram.');
