// Teste de ponta a ponta das ferramentas do professor: senha de aluno e missões com prazo livre.
// Uso: node testes/professor.teste.mjs <senha-das-contas-demo>
import { lerSenhas, verificar, entrar, clienteDe, BASE } from './apoio.mjs';

const { demo } = lerSenhas();
const prof = await entrar('prof.marina', demo);
const aluno = await entrar('heitor', demo); // da turma dela
const deFora = await entrar('lucas', demo); // de outra série, fora das turmas dela
const turma = (await prof.get('/prof/turmas')).dados.turmas[0];

const dia = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ───────── Senha de aluno ─────────
verificar((await aluno.post(`/prof/alunos/${aluno.id}/senha`)).status === 403, 'aluno não redefine senha de ninguém');
verificar((await prof.post(`/prof/alunos/${deFora.id}/senha`)).status === 404, 'professora não redefine a senha de quem não é das turmas dela');
verificar((await prof.post(`/prof/alunos/${prof.id}/senha`)).status === 404, 'nem a de outra conta que não seja de aluno');

let temporaria = null;
try {
  const r = await prof.post(`/prof/alunos/${aluno.id}/senha`);
  temporaria = r.dados?.senhaTemporaria ?? null;
  verificar(r.status === 200 && /^[A-Z2-9]{8}$/.test(temporaria), 'professora gera uma senha temporária para o aluno da turma');
  verificar((await aluno.get('/eu')).status === 401, 'o aluno é desconectado de onde estava');
  const antiga = await fetch(`${BASE}/api/auth/entrar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'educahub' }, body: JSON.stringify({ usuario: 'heitor', senha: demo }) });
  verificar(antiga.status === 401, 'a senha antiga deixa de funcionar');
  const comNova = await entrar('heitor', temporaria);
  verificar((await comNova.get('/notificacoes')).dados.notificacoes.some((n) => n.texto.includes('senha foi redefinida')), 'o aluno entra com a senha nova e é avisado de quem a redefiniu');
} finally {
  // Devolve a senha das contas de demonstração, para os outros testes continuarem funcionando.
  if (temporaria) {
    const conta = await entrar('heitor', temporaria);
    const volta = await conta.put('/eu/senha', { atual: temporaria, nova: demo });
    verificar(volta.status === 200, 'senha de demonstração restaurada');
  }
}

// ───────── Missões com prazo livre ─────────
const base = { turmaId: turma.id, titulo: 'Teste — prazo livre', tipo: 'atividades', meta: 2, xp: 10, moedas: 5 };
verificar((await prof.post('/prof/missoes', { ...base, fim: dia(-1) })).status === 400, 'prazo no passado é recusado');
verificar((await prof.post('/prof/missoes', { ...base, fim: dia(90) })).status === 400, 'prazo além de 60 dias é recusado');
verificar((await prof.post('/prof/missoes', { ...base, fim: '2026-02-31' })).status === 400, 'data que não existe é recusada');

const criada = await prof.post('/prof/missoes', { ...base, fim: dia(10) });
verificar(criada.status === 201 && criada.dados.missao.fim === dia(10), 'missão criada com o prazo escolhido');
const id = criada.dados.missao.id;
try {
  const paraOAluno = (await clienteDe((await entrar('heitor', demo)).cookie).get('/missoes')).dados.missoes.find((m) => m.missaoId === id);
  verificar(paraOAluno?.fim === dia(10), 'o aluno vê a missão com esse prazo');
  verificar((await aluno.put(`/prof/missoes/${id}`, { titulo: 'Mudei', fim: dia(3) })).status !== 200, 'aluno não edita missão');

  const editada = await prof.put(`/prof/missoes/${id}`, { titulo: 'Teste — prazo novo', descricao: 'Com descrição.', fim: dia(20) });
  verificar(editada.status === 200 && editada.dados.missao.titulo === 'Teste — prazo novo' && editada.dados.missao.fim === dia(20), 'professora edita título, descrição e prazo');
  verificar(editada.dados.missao.meta === 2 && editada.dados.missao.xp === 10, 'a meta e a recompensa continuam as mesmas');
  verificar((await prof.put(`/prof/missoes/${id}`, { titulo: 'Teste — prazo novo', fim: dia(120) })).status === 400, 'a edição também respeita o limite de 60 dias');

  const atalho = await prof.post('/prof/missoes', { ...base, titulo: 'Teste — só hoje', periodo: 'diaria' });
  verificar(atalho.status === 201 && atalho.dados.missao.fim === dia(0) && atalho.dados.missao.periodo === 'diaria', 'o atalho "só hoje" continua valendo');
  await prof.apagar(`/prof/missoes/${atalho.dados.missao.id}`);
} finally {
  await prof.apagar(`/prof/missoes/${id}`);
}
verificar(!(await prof.get('/prof/missoes')).dados.missoes.some((m) => m.titulo.startsWith('Teste —')), 'missões de teste removidas');

console.log('\nTodos os testes das ferramentas do professor passaram.');
