// Cria contas e dados de demonstração para testar a plataforma: npm run seed
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, PASTA_DADOS, diaLocal, diasAtras, transacao } from './db.js';
import { gerarHash } from './auth.js';
import { materiasDaSerie, MODOS } from './conteudo/index.js';
import { VERSAO_DOS_TERMOS } from './termos.js';
import { AVATAR_PADRAO, ITEM_POR_ID } from './loja.js';

const CONTAS_DEMO = ['prof.marina', 'prof.carlos', 'ana', 'bruno', 'carla', 'diego', 'elisa', 'felipe', 'gabi', 'heitor', 'lucas', 'julia'];

if (db.prepare("SELECT 1 FROM usuarios WHERE usuario = 'prof.marina'").get()) {
  if (!process.argv.includes('--recriar')) {
    console.log('Os dados de demonstração já existem. Use "npm run seed -- --recriar" para apagá-los e criar de novo.');
    process.exit(0);
  }
  // Apaga só as contas de demonstração (turmas, atividades e amizades delas saem junto).
  db.prepare(`DELETE FROM usuarios WHERE usuario IN (${CONTAS_DEMO.map(() => '?').join(',')})`).run(...CONTAS_DEMO);
}

const senha = crypto.randomBytes(6).toString('base64url');
const hash = await gerarHash(senha);
const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
const entre = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// [usuário, nome, série, avatar, atividades, dias de sequência]
const ALUNOS = [
  ['ana', 'Ana Clara', 'F6', {}, 0, 0],
  ['bruno', 'Bruno Lima', 'F6', { pelagem: 'laranja', roupa: 'moletom-azul', cabeca: 'bone', fundo: 'ceu' }, 14, 4],
  ['carla', 'Carla Mendes', 'F6', { pelagem: 'siames', roupa: 'moletom-rosa', cabeca: 'laco', rosto: 'oculos-redondos', fundo: 'doce' }, 22, 6],
  ['diego', 'Diego Santos', 'F6', { pelagem: 'cinza', roupa: 'moletom-verde', cabeca: 'fones', fundo: 'floresta' }, 9, 2],
  ['elisa', 'Elisa Rocha', 'F6', { pelagem: 'tricolor', roupa: 'jaleco', cabeca: 'capelo', mao: 'lapis', fundo: 'por-do-sol' }, 30, 9],
  ['felipe', 'Felipe Araújo', 'F6', { pelagem: 'neon', roupa: 'heroi', costas: 'capa', rosto: 'mascara-heroi', fundo: 'neon-fundo' }, 18, 3],
  ['gabi', 'Gabriela Nunes', 'F6', { pelagem: 'chiclete', roupa: 'moletom-amarelo', cabeca: 'coroa', mao: 'varinha', fundo: 'doce' }, 26, 7],
  ['heitor', 'Heitor Alves', 'F6', { pelagem: 'branco', roupa: 'uniforme', mao: 'balao', fundo: 'ceu' }, 5, 1],
  ['lucas', 'Lucas Ferreira', 'M2', { pelagem: 'galaxia', roupa: 'moletom-preto', rosto: 'oculos-escuros', fundo: 'espaco' }, 12, 3],
  ['julia', 'Júlia Castro', 'UEX', { pelagem: 'robo', roupa: 'jaleco', cabeca: 'astronauta', costas: 'jetpack', fundo: 'espaco' }, 16, 5],
];

const ids = {};

transacao(() => {
  const inserirUsuario = db.prepare(
    `INSERT INTO usuarios (papel, status, nome, usuario, senha_hash, serie, instituicao, disciplinas, formacao, bio, moedas, avatar_json,
       nascimento, termos_versao, termos_em, responsavel, consentimento_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
       CASE WHEN ?1 = 'aluno' THEN (CASE WHEN ?6 LIKE 'U%' THEN '2004-03-15' WHEN ?6 LIKE 'M%' THEN '2009-03-15' ELSE '2014-03-15' END) END,
       '${VERSAO_DOS_TERMOS}', datetime('now'),
       CASE WHEN ?1 = 'aluno' AND ?6 NOT LIKE 'U%' THEN 'Responsável de demonstração' END,
       CASE WHEN ?1 = 'aluno' AND ?6 NOT LIKE 'U%' THEN datetime('now') END)`, // dados fictícios: as contas de demonstração já nascem em dia com os termos
  );
  const novo = (...campos) => Number(inserirUsuario.run(...campos).lastInsertRowid);

  ids.marina = novo('professor', 'ativo', 'Marina Souza', 'prof.marina', hash, null, 'Escola Horizonte', 'Matemática e Ciências', 'Licenciatura em Matemática', 'Apaixonada por ensinar com jogos.', 0, '{}');
  ids.carlos = novo('professor', 'pendente', 'Carlos Pereira', 'prof.carlos', hash, null, 'Colégio Aurora', 'História', 'Licenciatura em História', null, 0, '{}');

  const inserirAtividade = db.prepare(
    `INSERT INTO atividades (usuario_id, materia, topico_id, modo, acertos, total, xp, moedas, duracao_s, dia, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const inserirGanho = db.prepare('INSERT INTO ganhos (usuario_id, xp, moedas, origem, dia) VALUES (?, ?, ?, ?, ?)');

  for (const [usuario, nome, serie, visual, atividades, sequencia] of ALUNOS) {
    const avatar = { ...AVATAR_PADRAO, ...visual };
    const id = novo('aluno', 'ativo', nome, usuario, hash, serie, 'Escola Horizonte', null, null, null, usuario === 'ana' ? 350 : entre(40, 220), JSON.stringify(avatar));
    ids[usuario] = id;
    for (const item of Object.values(avatar)) {
      if (item && !ITEM_POR_ID[item].padrao) db.prepare('INSERT INTO inventario (usuario_id, item_id) VALUES (?, ?)').run(id, item);
    }

    const topicos = materiasDaSerie(serie).flatMap((m) => m.topicos);
    let xpTotal = 0;
    for (let i = 0; i < atividades; i++) {
      const topico = sortear(topicos);
      const total = 6;
      const acertos = entre(3, 6);
      const xp = acertos * 10 + (acertos === total ? 20 : 0);
      const moedas = acertos * 2 + (acertos === total ? 5 : 0);
      // As primeiras atividades cobrem os dias da sequência; as demais se espalham pelas duas últimas semanas.
      const dia = diasAtras(i < sequencia ? i : entre(sequencia + 1, 13));
      inserirAtividade.run(id, topico.materia, topico.id, sortear(MODOS), acertos, total, xp, moedas, entre(50, 160), dia, `${dia} ${entre(10, 20)}:${entre(10, 59)}:00`);
      inserirGanho.run(id, xp, moedas, 'atividade', dia);
      xpTotal += xp;
    }
    db.prepare('UPDATE usuarios SET xp = ?, sequencia = ?, maior_sequencia = ?, ultimo_dia_ativo = ? WHERE id = ?').run(
      xpTotal, sequencia, sequencia + entre(0, 4), sequencia ? diaLocal() : null, id,
    );
  }

  const amizade = db.prepare('INSERT INTO amizades (de_id, para_id, status) VALUES (?, ?, ?)');
  amizade.run(ids.ana, ids.bruno, 'aceita');
  amizade.run(ids.carla, ids.ana, 'aceita');
  amizade.run(ids.bruno, ids.carla, 'aceita');
  amizade.run(ids.elisa, ids.gabi, 'aceita');
  amizade.run(ids.diego, ids.ana, 'pendente');

  const turma = Number(
    db.prepare('INSERT INTO turmas (professor_id, nome, serie, descricao, codigo) VALUES (?, ?, ?, ?, ?)')
      .run(ids.marina, '6º Ano A', 'F6', 'Turma da manhã — Escola Horizonte', 'GATO6A').lastInsertRowid,
  );
  for (const [usuario, , serie] of ALUNOS) {
    if (serie === 'F6') db.prepare('INSERT INTO turma_membros (turma_id, aluno_id) VALUES (?, ?)').run(turma, ids[usuario]);
  }

  const missao = db.prepare(
    `INSERT INTO missoes (turma_id, professor_id, titulo, descricao, periodo, tipo, materia, meta, recompensa_xp, recompensa_moedas, questoes_json, inicio, fim)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  missao.run(turma, ids.marina, 'Semana da Matemática', 'Complete 3 atividades de Matemática até o fim da semana.', 'semanal', 'atividades', 'matematica', 3, 100, 60, null, diaLocal(), diasAtras(-6));
  missao.run(
    turma, ids.marina, 'Desafio relâmpago: frações', 'Um quiz rápido preparado pela professora.', 'semanal', 'quiz', 'matematica', 1, 80, 50,
    JSON.stringify([
      { enunciado: 'Quanto é 1/3 + 1/3?', alternativas: ['2/3', '2/6', '1/6', '1/3'], correta: 0, explicacao: 'Com denominadores iguais, somamos os numeradores.' },
      { enunciado: 'Qual fração equivale a 0,25?', alternativas: ['1/2', '1/4', '2/5', '1/5'], correta: 1, explicacao: null },
      { enunciado: 'Quanto é 3/4 de 20?', alternativas: ['12', '5', '15', '16'], correta: 2, explicacao: '20 ÷ 4 = 5; 5 × 3 = 15.' },
    ]),
    diaLocal(), diasAtras(-6),
  );
});

const arquivo = path.join(PASTA_DADOS, 'contas-demo.txt');
fs.writeFileSync(
  arquivo,
  [
    'EDUCA HUB — contas de demonstração',
    '',
    `Senha de todas as contas abaixo: ${senha}`,
    '',
    'Professora (aprovada):   prof.marina',
    'Professor (pendente):    prof.carlos',
    `Alunos:                  ${ALUNOS.map(([u]) => u).join(', ')}`,
    '',
    'Turma de exemplo: 6º Ano A — código GATO6A',
    '',
  ].join('\n'),
);
console.log(`Dados de demonstração criados. Contas e senha em: ${arquivo}`);
