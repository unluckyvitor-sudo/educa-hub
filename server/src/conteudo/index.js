import fundamental1 from './fundamental1.js';
import fundamental2 from './fundamental2.js';
import medio from './medio.js';
import superior from './superior.js';
import { MATERIAS } from './niveis.js';

export * from './niveis.js';

export const MODOS = ['quiz', 'vf', 'memoria'];

const topicos = new Map();
const porSerie = new Map();

for (const [serie, materia, lista] of [...fundamental1, ...fundamental2, ...medio, ...superior]) {
  if (!MATERIAS[materia]) throw new Error(`Matéria desconhecida no conteúdo: ${materia}`);
  if (!porSerie.has(serie)) porSerie.set(serie, new Map());
  const convertidos = lista.map((bruto, i) => {
    const id = `${serie}.${materia}.${i + 1}`;
    const topico = {
      id,
      serie,
      materia,
      titulo: bruto.t,
      resumo: bruto.r,
      questoes: bruto.q.map(([enunciado, correta, e1, e2, e3, explicacao], j) => ({
        id: `${id}.${j + 1}`,
        topicoId: id,
        materia,
        enunciado,
        correta,
        erradas: [e1, e2, e3],
        explicacao: explicacao ?? null,
      })),
    };
    topicos.set(id, topico);
    return topico;
  });
  porSerie.get(serie).set(materia, convertidos);
}

export function materiasDaSerie(serie) {
  const mapa = porSerie.get(serie);
  if (!mapa) return [];
  return [...mapa.entries()].map(([id, lista]) => ({ id, nome: MATERIAS[id], topicos: lista }));
}

export function topicosDe(serie, materia) {
  return porSerie.get(serie)?.get(materia) ?? [];
}

export function topicoPorId(id) {
  return topicos.get(id) ?? null;
}

/** Todas as questões de uma série, opcionalmente filtradas por matéria. */
export function questoesDaSerie(serie, materia = null) {
  return materiasDaSerie(serie)
    .filter((m) => !materia || m.id === materia)
    .flatMap((m) => m.topicos.flatMap((t) => t.questoes));
}

/** Total de atividades (tópico × modo de jogo) disponíveis para uma série. */
export function totalAtividades(serie) {
  return materiasDaSerie(serie).reduce((soma, m) => soma + m.topicos.length * MODOS.length, 0);
}

export function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
