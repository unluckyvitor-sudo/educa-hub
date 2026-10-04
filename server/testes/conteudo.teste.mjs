// Teste de ponta a ponta do editor de conteúdo e do caderno de erros.
// Uso: node testes/conteudo.teste.mjs <senha-das-contas-demo> [senha-do-admin]
import { lerSenhas, verificar, entrar } from './apoio.mjs';

const { demo, admin: senhaAdmin } = lerSenhas();
const prof = await entrar('prof.marina', demo);
const aluno = await entrar('heitor', demo); // 6º ano, na turma da professora
const deFora = await entrar('lucas', demo); // 2ª série do médio, fora das turmas dela

const QUESTOES = [
  ['Teste: quanto é 2 elevado a 3?', '8', ['6', '9', '5']],
  ['Teste: quanto é 10 elevado a 2?', '100', ['20', '1000', '12']],
  ['Teste: quanto é 5 elevado a 0?', '1', ['0', '5', '50']],
  ['Teste: quanto é 3 elevado a 2?', '9', ['6', '5', '27']],
];
const NOSSAS = new Set(QUESTOES.map((q) => q[0]));
const adm = senhaAdmin ? await entrar('admin', senhaAdmin) : null;

/** Remove tudo o que este teste cria (inclusive o que sobrou de uma execução interrompida no meio). */
async function limparSobras() {
  for (const serie of ['F6', 'M2']) {
    const materias = (await prof.get(`/biblioteca?serie=${serie}`)).dados.materias;
    for (const t of materias.flatMap((m) => m.topicos)) if (t.titulo.startsWith('Teste —')) await prof.apagar(`/conteudo/topicos/${t.id}`);
  }
  for (const conta of [prof, adm].filter(Boolean)) {
    const base = (await conta.get('/conteudo/topicos/F6.matematica.1')).dados;
    for (const q of base.questoes) if (q.enunciado.startsWith('Teste:') && q.editavel) await conta.apagar(`/conteudo/questoes/${q.id}`);
  }
}
await limparSobras();

/** Joga uma partida inteira; `responder` recebe o item e devolve a resposta (null = deixar o tempo acabar). */
async function jogar(corpo, responder) {
  const inicio = await aluno.post('/jogos/iniciar', corpo);
  if (inicio.status !== 200) return { inicio };
  const retornos = [];
  for (const [indice, item] of inicio.dados.itens.entries()) {
    const r = await aluno.post(`/jogos/${inicio.dados.partida}/responder`, { indice, resposta: responder(item) });
    retornos.push({ item, ...r.dados });
  }
  const fim = await aluno.post(`/jogos/${inicio.dados.partida}/finalizar`);
  return { inicio, retornos, fim: fim.dados };
}

try {
  // ── Quem pode criar conteúdo ──
  verificar((await aluno.post('/conteudo/topicos', { serie: 'F6', materia: 'matematica', titulo: 'Tópico de aluno' })).status === 403, 'aluno não cria tópicos');
  verificar((await aluno.get('/conteudo/topicos/F6.matematica.1')).status === 403, 'aluno não abre o editor');
  verificar((await prof.post('/conteudo/topicos', { serie: 'F6', materia: 'biologia', titulo: 'Matéria errada' })).status === 400, 'matéria que não existe no nível é recusada');

  const novo = await prof.post('/conteudo/topicos', { serie: 'F6', materia: 'matematica', titulo: 'Teste — Potências', resumo: 'Potência é uma multiplicação de fatores iguais.' });
  verificar(novo.status === 201 && /^x\d+$/.test(novo.dados.id), 'professora cria um tópico');
  const topicoId = novo.dados.id;

  const daMateria = async (conta, materia = 'matematica') => (await conta.get(`/materias/${materia}`)).dados.topicos;
  verificar(!(await daMateria(aluno)).some((t) => t.id === topicoId), 'tópico sem questões (rascunho) não aparece para o aluno');
  verificar((await aluno.post('/jogos/iniciar', { topicoId, modo: 'quiz' })).status === 400, 'rascunho não pode ser jogado');

  // ── Questões ──
  const repetida = await prof.post(`/conteudo/topicos/${topicoId}/questoes`, { enunciado: 'Teste: repetida?', correta: 'Sim', erradas: ['sim', 'Não', 'Talvez'] });
  verificar(repetida.status === 400, 'respostas repetidas são recusadas');
  verificar((await prof.post(`/conteudo/topicos/${topicoId}/questoes`, { enunciado: 'Teste: faltam erradas?', correta: 'Sim', erradas: ['Não'] })).status === 400, 'questão precisa de três respostas erradas');
  for (const [enunciado, correta, erradas] of QUESTOES) {
    const r = await prof.post(`/conteudo/topicos/${topicoId}/questoes`, { enunciado, correta, erradas, explicacao: 'Explicação de teste.' });
    if (r.status !== 201) throw new Error(`FALHOU: criar questão (${r.status} ${JSON.stringify(r.dados)})`);
  }
  const editor = (await prof.get(`/conteudo/topicos/${topicoId}`)).dados;
  verificar(editor.questoes.length === 4 && editor.questoes.every((q) => q.editavel && !q.publico) && !editor.topico.rascunho, 'tópico com 4 questões deixa de ser rascunho');
  verificar((await prof.put(`/conteudo/questoes/${editor.questoes[0].id}`, { enunciado: QUESTOES[0][0], correta: '8', erradas: ['6', '9', '4'], publico: true })).status === 200, 'professora edita a própria questão');
  verificar((await prof.get(`/conteudo/topicos/${topicoId}`)).dados.questoes[0].publico === false, 'professora não consegue publicar para todos');
  verificar((await prof.put('/conteudo/topicos/F6.matematica.1', { titulo: 'Outro título' })).status === 400, 'tópico dos arquivos não pode ser alterado');

  const noBase = await prof.post('/conteudo/topicos/F6.matematica.1/questoes', { enunciado: 'Teste: qual é o menor número primo?', correta: '2', erradas: ['1', '3', '0'] });
  verificar(noBase.status === 201, 'professora acrescenta questão a um tópico que já existia');
  const extraNoBase = noBase.dados.id;

  // ── Quem enxerga ──
  verificar((await daMateria(aluno)).some((t) => t.id === topicoId && t.extra && t.questoes === 4), 'aluno da turma vê o tópico novo');
  verificar((await daMateria(aluno)).find((t) => t.id === 'F6.matematica.1').questoes === 5, 'aluno da turma recebe a questão extra no tópico antigo');
  const foraDaTurma = await prof.post('/conteudo/topicos', { serie: 'M2', materia: 'matematica', titulo: 'Teste — fora da turma' });
  for (const [enunciado, correta, erradas] of QUESTOES) await prof.post(`/conteudo/topicos/${foraDaTurma.dados.id}/questoes`, { enunciado, correta, erradas });
  verificar(!(await daMateria(deFora)).some((t) => t.id === foraDaTurma.dados.id), 'aluno de fora das turmas da professora não vê o conteúdo dela');
  verificar((await deFora.post('/jogos/iniciar', { topicoId: foraDaTurma.dados.id, modo: 'quiz' })).status === 400, 'e também não consegue jogar pelo endereço direto');

  // ── Caderno de erros ──
  const respostasCertas = new Map(QUESTOES.map((q) => [q[0], q[1]]));
  const errando = await jogar({ topicoId, modo: 'quiz' }, () => null);
  for (const r of errando.retornos) respostasCertas.set(r.item.enunciado, r.correta);
  verificar(errando.fim.acertos === 0 && errando.fim.erradas.length === errando.fim.total, 'o resultado lista as questões erradas');
  verificar(errando.fim.erradas.every((e) => e.correta), 'cada questão errada vem com a resposta certa');
  const caderno = (await aluno.get('/erros')).dados;
  verificar(QUESTOES.every((q) => caderno.questoes.some((c) => c.enunciado === q[0])), 'as questões erradas entram no caderno de erros');
  verificar(caderno.questoes.every((c) => !('correta' in c)), 'o caderno não entrega as respostas');
  verificar((await aluno.get('/materias')).dados.erros === caderno.total, 'a contagem aparece em Minhas matérias');

  const nossasNoCaderno = async () => (await aluno.get('/erros')).dados.questoes.filter((c) => NOSSAS.has(c.enunciado)).length;
  const certa = (item) => item.alternativas.indexOf(respostasCertas.get(item.enunciado));
  let rodadas = 0;
  let aposPrimeira = null;
  while ((await nossasNoCaderno()) > 0 && rodadas < 8) {
    const revisao = await jogar({ revisao: true }, (item) => (respostasCertas.has(item.enunciado) ? certa(item) : null));
    for (const r of revisao.retornos) respostasCertas.set(r.item.enunciado, r.correta);
    rodadas += 1;
    if (rodadas === 1) {
      aposPrimeira = await nossasNoCaderno();
      verificar(revisao.inicio.dados.revisao === true && revisao.inicio.dados.titulo === 'Caderno de erros', 'a revisão é um jogo próprio');
      verificar(revisao.fim.xp > 0 && revisao.fim.xp <= revisao.fim.acertos * 5, 'a revisão rende menos que um jogo novo');
    }
  }
  verificar(aposPrimeira === 4, 'um acerto só não tira a questão do caderno');
  verificar((await nossasNoCaderno()) === 0 && rodadas >= 2, `dois acertos seguidos tiram a questão do caderno (${rodadas} revisões)`);
  // Limpa o que sobrou das questões de revisão de outros tópicos, para o teste poder rodar de novo.
  for (let i = 0; i < 6 && (await aluno.get('/erros')).dados.total > 0; i++) {
    const r = await jogar({ revisao: true }, (item) => (respostasCertas.has(item.enunciado) ? certa(item) : null));
    for (const x of r.retornos ?? []) respostasCertas.set(x.item.enunciado, x.correta);
  }
  verificar((await aluno.post('/jogos/iniciar', { revisao: true })).status === 404, 'caderno vazio não abre revisão');
  verificar((await prof.post('/jogos/iniciar', { revisao: true })).status === 400, 'professor não tem caderno de erros');

  // ── Dificuldades da turma ──
  const turma = (await prof.get('/prof/turmas')).dados.turmas[0];
  const dificuldades = (await prof.get(`/prof/turmas/${turma.id}/dificuldades`)).dados.questoes;
  // A lista traz só as mais erradas, então as questões deste teste podem não caber nela: confere-se a forma e a ordem.
  verificar(
    dificuldades.length > 0 && dificuldades.every((d) => d.enunciado && d.correta && d.erros >= 1 && d.respostas >= 3 && d.erros <= d.respostas),
    'a professora vê as questões em que a turma mais erra',
  );
  verificar(dificuldades.every((d, i) => i === 0 || dificuldades[i - 1].taxa >= d.taxa), 'da maior taxa de erro para a menor');
  verificar((await aluno.get(`/prof/turmas/${turma.id}/dificuldades`)).status === 403, 'aluno não vê o relatório da turma');

  // ── Publicação pelo administrador ──
  if (adm) {
    const fora = foraDaTurma.dados.id;
    verificar((await adm.put(`/conteudo/topicos/${fora}`, { titulo: 'Teste — fora da turma', publico: true })).status === 200, 'administrador publica o tópico da professora');
    verificar((await daMateria(deFora)).some((t) => t.id === fora), 'depois de publicado, qualquer aluno do nível vê');
    const doAdmin = await adm.post('/conteudo/topicos/F6.matematica.1/questoes', { enunciado: 'Teste: 7 é primo?', correta: 'Sim', erradas: ['Não', 'Só às vezes', 'Depende'] });
    verificar((await prof.put(`/conteudo/questoes/${doAdmin.dados.id}`, { enunciado: 'Teste: mudei', correta: 'Sim', erradas: ['a', 'b', 'c'] })).status === 400, 'professora não altera questão de outra pessoa');
    await adm.apagar(`/conteudo/questoes/${doAdmin.dados.id}`);
  } else {
    console.log('(sem a senha do administrador: a publicação não foi testada)');
  }

  verificar((await prof.apagar(`/conteudo/questoes/${extraNoBase}`)).status === 200, 'professora exclui a própria questão');
} finally {
  // Remove o que o teste criou, mesmo quando alguma verificação falha.
  await limparSobras();
  const sobras = (await prof.get('/biblioteca?serie=F6')).dados.materias.flatMap((m) => m.topicos).filter((t) => t.titulo.startsWith('Teste —'));
  const questoesDeTeste = (await prof.get('/conteudo/topicos/F6.matematica.1')).dados.questoes.filter((q) => q.enunciado.startsWith('Teste:'));
  console.log(sobras.length || questoesDeTeste.length ? `ATENÇÃO: sobraram ${sobras.length} tópicos e ${questoesDeTeste.length} questões de teste` : 'conteúdo de teste removido');
}

console.log('\nEditor de conteúdo e caderno de erros: tudo certo.');
