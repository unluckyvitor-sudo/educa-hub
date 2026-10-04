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

export function serieValida(id) {
  return Object.hasOwn(SERIE_POR_ID, id);
}
