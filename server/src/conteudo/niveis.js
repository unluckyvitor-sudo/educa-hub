// Etapas, séries e matérias. A organização segue a BNCC (Fundamental e Médio)
// e ciclos básicos comuns das grandes áreas no Ensino Superior.

export const ETAPAS = [
  { id: 'fundamental1', nome: 'Fundamental — Anos Iniciais' },
  { id: 'fundamental2', nome: 'Fundamental — Anos Finais' },
  { id: 'medio', nome: 'Ensino Médio' },
  { id: 'superior', nome: 'Ensino Superior' },
];

export const SERIES = [
  { id: 'F1', nome: '1º Ano', etapa: 'fundamental1' },
  { id: 'F2', nome: '2º Ano', etapa: 'fundamental1' },
  { id: 'F3', nome: '3º Ano', etapa: 'fundamental1' },
  { id: 'F4', nome: '4º Ano', etapa: 'fundamental1' },
  { id: 'F5', nome: '5º Ano', etapa: 'fundamental1' },
  { id: 'F6', nome: '6º Ano', etapa: 'fundamental2' },
  { id: 'F7', nome: '7º Ano', etapa: 'fundamental2' },
  { id: 'F8', nome: '8º Ano', etapa: 'fundamental2' },
  { id: 'F9', nome: '9º Ano', etapa: 'fundamental2' },
  { id: 'M1', nome: '1ª Série do Médio', etapa: 'medio' },
  { id: 'M2', nome: '2ª Série do Médio', etapa: 'medio' },
  { id: 'M3', nome: '3ª Série do Médio', etapa: 'medio' },
  { id: 'UEX', nome: 'Exatas e Tecnologia', etapa: 'superior' },
  { id: 'USA', nome: 'Saúde e Biológicas', etapa: 'superior' },
  { id: 'UHU', nome: 'Humanas e Sociais', etapa: 'superior' },
];

export const MATERIAS = {
  portugues: 'Português',
  matematica: 'Matemática',
  ciencias: 'Ciências',
  geografia: 'Geografia',
  historia: 'História',
  ingles: 'Inglês',
  artes: 'Artes',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  filosofia: 'Filosofia',
  sociologia: 'Sociologia',
  calculo: 'Cálculo',
  algebra: 'Álgebra Linear',
  fisicageral: 'Física Geral',
  estatistica: 'Estatística',
  programacao: 'Programação',
  anatomia: 'Anatomia',
  fisiologia: 'Fisiologia',
  bioquimica: 'Bioquímica',
  genetica: 'Genética',
  farmacologia: 'Farmacologia',
  direito: 'Direito',
  psicologia: 'Psicologia',
  pedagogia: 'Pedagogia',
};

export const SERIE_POR_ID = Object.fromEntries(SERIES.map((s) => [s.id, s]));

// ───────────── Níveis em uso nesta instalação ─────────────
// EDUCAHUB_SERIES limita os níveis oferecidos: "F7" para uma demonstração só do 7º ano, "F6,F7" para dois. Sem ela, todos.
// O conteúdo dos outros níveis continua no projeto e o banco não é alterado: eles só somem das escolhas, e contas e turmas
// que estavam neles passam a usar o primeiro nível ativo enquanto a variável existir.
const pedidas = String(process.env.EDUCAHUB_SERIES ?? '')
  .split(',')
  .map((id) => id.trim().toUpperCase())
  .filter((id) => Object.hasOwn(SERIE_POR_ID, id));
if (process.env.EDUCAHUB_SERIES && !pedidas.length) console.error(`EDUCAHUB_SERIES ignorada: nenhum nível reconhecido em "${process.env.EDUCAHUB_SERIES}".`);

export const SERIES_ATIVAS = pedidas.length ? SERIES.filter((s) => pedidas.includes(s.id)) : SERIES;
export const ETAPAS_ATIVAS = ETAPAS.filter((e) => SERIES_ATIVAS.some((s) => s.etapa === e.id));
export const SERIES_INATIVAS = SERIES.filter((s) => !SERIES_ATIVAS.includes(s)).map((s) => s.id);

/** Nível que pode ser escolhido agora (cadastro, turma nova, tópico novo). */
export function serieValida(id) {
  return SERIES_ATIVAS.some((s) => s.id === id);
}

/** Nível que vale de fato: o próprio, se estiver ativo; senão, o primeiro ativo. Vazio continua vazio (professores). */
export function serieEmUso(serie) {
  return !serie || serieValida(serie) ? serie : SERIES_ATIVAS[0].id;
}

/** O usuário com o nível que vale de fato (só alunos têm nível). */
export function comSerieEmUso(usuario) {
  if (!usuario || usuario.papel !== 'aluno' || serieEmUso(usuario.serie) === usuario.serie) return usuario;
  return { ...usuario, serie: serieEmUso(usuario.serie) };
}
