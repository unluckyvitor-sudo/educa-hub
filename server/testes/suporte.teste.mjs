// Teste de ponta a ponta do suporte e dos feedbacks (com o servidor rodando e as contas de demonstração criadas):
//   node testes/suporte.teste.mjs <senha-das-contas-demo> [senha-do-admin]
// Usa "ana" (aluna da turma 6º Ano A), "bruno" (colega), "lucas" (aluno de outra turma) e "prof.marina".
// Com a senha do administrador, testa também a fila da equipe e apaga o que o teste criou.
import { lerSenhas, verificar, entrar, conectar, esperar } from './apoio.mjs';

const senhas = lerSenhas();
const ana = await entrar('ana', senhas.demo);
const bruno = await entrar('bruno', senhas.demo);
const lucas = await entrar('lucas', senhas.demo);
const marina = await entrar('prof.marina', senhas.demo);
const criados = [];

// ───────── Opções e validação ─────────
const opcoes = (await ana.get('/suporte/opcoes')).dados;
verificar(opcoes.categorias.length >= 5 && opcoes.professores.some((p) => p.id === marina.id), 'a aluna vê as categorias e a professora da turma dela');
verificar((await lucas.get('/suporte/opcoes')).dados.professores.length === 0, 'aluno sem turma não tem professor para escrever');
verificar((await ana.post('/suporte/chamados', { categoria: 'inexistente', assunto: 'Teste', mensagem: 'Mensagem de teste' })).status === 400, 'categoria inválida é recusada');
verificar((await ana.post('/suporte/chamados', { categoria: 'duvida', assunto: 'Oi', mensagem: 'curta' })).status === 400, 'assunto curto demais é recusado');
verificar((await lucas.post('/suporte/chamados', { categoria: 'conteudo', assunto: 'Dúvida de teste', mensagem: 'Mensagem de teste', professorId: marina.id })).status === 400, 'aluno não escreve para professor de uma turma que não é dele');

// ───────── Dúvida de uma aluna para a professora ─────────
const socketDaMarina = await conectar(marina.cookie);
const socketDaAna = await conectar(ana.cookie);
const avisoParaMarina = esperar(socketDaMarina, 'notificacao');
const aberto = await ana.post('/suporte/chamados', { categoria: 'conteudo', assunto: '[teste] Dúvida sobre frações', mensagem: 'Professora, como eu somo 1/2 + 1/3?', professorId: marina.id });
verificar(aberto.status === 201, 'chamado para a professora criado');
const idDuvida = aberto.dados.id;
criados.push(idDuvida);
verificar((await avisoParaMarina).link === `/atendimento/${idDuvida}`, 'a professora é avisada na hora, com o link da conversa');

verificar((await bruno.get(`/suporte/chamados/${idDuvida}`)).status === 400, 'um colega não consegue ler o chamado de outra pessoa');
verificar((await bruno.post(`/suporte/chamados/${idDuvida}/mensagens`, { texto: 'intruso' })).status === 400, 'nem escrever nele');
verificar((await lucas.post(`/suporte/chamados/${idDuvida}/status`, { status: 'resolvido' })).status === 400, 'nem mudar a situação dele');

const fila = (await marina.get('/suporte/atendimento')).dados.chamados;
const naFila = fila.find((c) => c.id === idDuvida);
verificar(naFila && naFila.novas === 1 && naFila.autor.id === ana.id && naFila.status === 'aberto', 'a dúvida aparece na fila da professora, com 1 mensagem nova');
verificar((await marina.get('/suporte/resumo')).dados.paraAtender >= 1, 'o menu da professora mostra um pedido esperando');

const visaoDaMarina = (await marina.get(`/suporte/chamados/${idDuvida}`)).dados;
verificar(visaoDaMarina.papel === 'atendente' && visaoDaMarina.autor.usuario === 'ana' && visaoDaMarina.mensagens.length === 1, 'a professora abre a conversa e vê quem escreveu');

const avisoParaAna = esperar(socketDaAna, 'notificacao');
const atualizacao = esperar(socketDaAna, 'suporte:atualizado');
verificar((await marina.post(`/suporte/chamados/${idDuvida}/mensagens`, { texto: 'Deixe as duas frações com o mesmo denominador: 3/6 + 2/6 = 5/6.' })).status === 201, 'a professora responde');
verificar((await avisoParaAna).link === `/ajuda/chamados/${idDuvida}` && (await atualizacao).chamadoId === idDuvida, 'a aluna é avisada e a tela dela se atualiza');
verificar((await ana.get('/suporte/resumo')).dados.respostasNovas === 1, 'o aviso de resposta nova aparece para a aluna');

const visaoDaAna = (await ana.get(`/suporte/chamados/${idDuvida}`)).dados;
verificar(visaoDaAna.papel === 'autor' && visaoDaAna.chamado.status === 'respondido' && visaoDaAna.mensagens[1].autor === `Prof. ${marina.nome}` && visaoDaAna.autor === null, 'a aluna lê a resposta, assinada pela professora');
verificar((await ana.get('/suporte/resumo')).dados.respostasNovas === 0, 'abrir a conversa zera o aviso');

verificar((await ana.post(`/suporte/chamados/${idDuvida}/avaliacao`, { nota: 5 })).status === 400, 'só dá para avaliar depois de resolvido');
verificar((await ana.post(`/suporte/chamados/${idDuvida}/status`, { status: 'respondido' })).status === 400, 'quem pediu ajuda não marca o chamado como respondido');
verificar((await ana.post(`/suporte/chamados/${idDuvida}/status`, { status: 'resolvido' })).status === 200, 'a aluna marca como resolvido');
verificar((await ana.post(`/suporte/chamados/${idDuvida}/avaliacao`, { nota: 9 })).status === 400, 'nota fora de 1 a 5 é recusada');
verificar((await ana.post(`/suporte/chamados/${idDuvida}/avaliacao`, { nota: 5 })).status === 200, 'e avalia o atendimento com 5 estrelas');
verificar((await marina.post(`/suporte/chamados/${idDuvida}/avaliacao`, { nota: 5 })).status === 400, 'quem atende não avalia o próprio atendimento');

verificar((await ana.post(`/suporte/chamados/${idDuvida}/mensagens`, { texto: 'Só mais uma dúvida: e 1/2 + 1/4?' })).status === 201, 'uma mensagem nova da aluna...');
const reaberto = (await ana.get(`/suporte/chamados/${idDuvida}`)).dados.chamado;
verificar(reaberto.status === 'aberto' && reaberto.avaliacao === null, '...reabre o chamado');

// ───────── Pedido para a equipe ─────────
const paraEquipe = await ana.post('/suporte/chamados', { categoria: 'problema', assunto: '[teste] O jogo da memória travou', mensagem: 'Cliquei em duas cartas e nada aconteceu.' });
verificar(paraEquipe.status === 201, 'chamado para a equipe criado');
const idEquipe = paraEquipe.dados.id;
criados.push(idEquipe);
verificar((await marina.get(`/suporte/chamados/${idEquipe}`)).status === 400, 'a professora não lê chamados enviados à equipe');
verificar(!(await marina.get('/suporte/atendimento')).dados.chamados.some((c) => c.id === idEquipe), 'nem os vê na fila dela');
verificar((await ana.get('/suporte/chamados')).dados.chamados.filter((c) => criados.includes(c.id)).length === 2, 'a aluna vê os dois chamados na lista dela');

// ───────── Feedback ─────────
verificar((await ana.post('/feedback', { tipo: 'elogio' })).status === 400, 'feedback sem nota e sem comentário é recusado');
verificar((await ana.post('/feedback', { tipo: 'outro', nota: 5 })).status === 400, 'tipo de feedback inválido é recusado');
verificar((await ana.post('/feedback', { tipo: 'sugestao', nota: 4, texto: '[teste] Queria mais jogos de memória!', pagina: '/materias/matematica' })).status === 201, 'feedback enviado');

// ───────── Administrador: fila da equipe, resposta em nome da equipe, feedbacks e limpeza ─────────
if (senhas.admin) {
  const admin = await entrar('admin', senhas.admin);
  const filaDaEquipe = (await admin.get('/suporte/atendimento?status=aberto')).dados.chamados;
  verificar(filaDaEquipe.some((c) => c.id === idEquipe) && !filaDaEquipe.some((c) => c.id === idDuvida), 'a fila da equipe tem o pedido da aluna e não mistura as dúvidas dos professores');
  verificar((await admin.get('/suporte/atendimento?fila=professores')).dados.chamados.some((c) => c.id === idDuvida), 'o administrador acompanha as conversas entre alunos e professores');

  verificar((await admin.post(`/suporte/chamados/${idEquipe}/mensagens`, { texto: 'Obrigado por avisar! Já corrigimos. Pode testar de novo?' })).status === 201, 'o administrador responde');
  const resposta = (await ana.get(`/suporte/chamados/${idEquipe}`)).dados.mensagens[1];
  verificar(resposta.autor === 'Equipe EducaHub' && !JSON.stringify(resposta).includes(admin.nome), 'a aluna vê a resposta como "Equipe EducaHub", sem o nome do administrador');
  verificar((await admin.post(`/suporte/chamados/${idEquipe}/status`, { status: 'resolvido' })).status === 200, 'o administrador marca como resolvido');

  const feedbacks = (await admin.get('/admin/feedbacks?tipo=sugestao')).dados;
  const meu = feedbacks.feedbacks.find((f) => f.usuarioId === ana.id && f.texto?.startsWith('[teste]'));
  verificar(meu && meu.nota === 4 && !meu.lido && feedbacks.resumo.total >= 1, 'o feedback chegou ao administrador, ainda não lido');
  verificar((await admin.put(`/admin/feedbacks/${meu.id}`, { lido: true })).status === 200, 'e pode ser marcado como lido');

  verificar((await ana.apagar(`/suporte/chamados/${idEquipe}`)).status === 403, 'só o administrador exclui chamados');
  for (const id of criados) await admin.apagar(`/suporte/chamados/${id}`);
  await admin.apagar(`/admin/feedbacks/${meu.id}`);
  verificar((await ana.get('/suporte/chamados')).dados.chamados.every((c) => !criados.includes(c.id)), 'o que o teste criou foi apagado');
} else {
  console.log('(sem a senha do administrador: a fila da equipe não foi testada e os chamados de teste ficaram no banco)');
}

socketDaMarina.close();
socketDaAna.close();
console.log('\nTodos os testes de suporte passaram.');
