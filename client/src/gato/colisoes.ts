// Ferramenta de desenvolvimento: procura peças que atravessam umas às outras
// (acessório no corpo, acessório em acessório, braço na cabeça...), em todas as animações.
// Espalha pontos pela superfície de cada peça e conta quantos caem dentro de outra.
// Usada pelo laboratório (/laboratorio), pelo console: await verificarColisoes().
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { Gato, type Animacao, type AvatarConfig } from './modelo';
import { ehContorno } from './pecas';

const AMOSTRAS = 260;
const ANIMACOES: Animacao[] = ['parado', 'acenar', 'comemorar', 'triste', 'pensar', 'dancar', 'surpreso'];
/** Para onde o gato olha em cada instante testado (a cabeça acompanha o mouse nas telas). */
const OLHARES: [number, number][] = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]];
const RAIOS = [new THREE.Vector3(0.31, 0.83, 0.46), new THREE.Vector3(0.79, -0.23, 0.57), new THREE.Vector3(-0.42, 0.37, 0.83)].map((v) => v.normalize());

export type Encaixe = 'cabeca' | 'rosto' | 'pescoco' | 'costas' | 'mao';

/** Partes do corpo em que cada tipo de acessório encosta de propósito. */
const CONTATO_NATURAL: Record<Encaixe, string[]> = {
  cabeca: ['cabeça'],
  rosto: ['cabeça'],
  pescoco: ['tronco', 'cabeça'],
  costas: ['tronco'],
  mao: ['braço direito', 'pata direita'],
};

/** Partes do corpo que nunca deveriam se atravessar. */
const PARES_DO_CORPO = [
  ['braço', 'cabeça'], ['pata', 'cabeça'], ['braço', 'orelha'], ['pata', 'orelha'], ['braço', 'cauda'], ['pata', 'cauda'],
  ['pata', 'tronco'], ['pata', 'pata'], ['pata', 'braço'], ['cauda', 'cabeça'], ['cauda', 'orelha'],
];

interface Dados {
  pontos: Float32Array;
  /** Triângulos da malha, já com as tampas que fecham bocas planas (base da orelha, de uma cúpula, pontas de um tubo). */
  triangulos: Float32Array;
  caixa: THREE.Box3;
  /** Superfície sem "dentro" (capa, visor): só é testada pelos pontos dela que entram em outras peças. */
  aberta: boolean;
}
const cache = new WeakMap<THREE.BufferGeometry, Dados>();

function dadosDe(g: THREE.BufferGeometry): Dados {
  let d = cache.get(g);
  if (!d) {
    const solta = g.index ? g.toNonIndexed() : g;
    const amostrador = new MeshSurfaceSampler(new THREE.Mesh(g)).build();
    const pontos = new Float32Array(AMOSTRAS * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < AMOSTRAS; i++) {
      amostrador.sample(v);
      pontos.set([v.x, v.y, v.z], i * 3);
    }
    if (!g.boundingBox) g.computeBoundingBox();
    if (!g.boundingSphere) g.computeBoundingSphere();
    cache.set(g, (d = { pontos, caixa: g.boundingBox!, ...fechar(solta.attributes.position.array as Float32Array) }));
  }
  return d;
}

/**
 * O teste de "ponto dentro da peça" só vale para malhas fechadas. Esta função procura as bordas soltas:
 * se cada boca for plana (um círculo, por exemplo), fecha com uma tampa; senão, marca a malha como aberta.
 */
function fechar(tri: Float32Array): { triangulos: Float32Array; aberta: boolean } {
  // Junta vértices repetidos (emendas) pela posição.
  const ids = new Map<string, number>();
  const pos: number[][] = [];
  const id = (i: number) => {
    const chave = `${Math.round(tri[i] * 1e4)},${Math.round(tri[i + 1] * 1e4)},${Math.round(tri[i + 2] * 1e4)}`;
    let n = ids.get(chave);
    if (n === undefined) {
      ids.set(chave, (n = pos.length));
      pos.push([tri[i], tri[i + 1], tri[i + 2]]);
    }
    return n;
  };
  const usos = new Map<string, [number, number, number]>();
  for (let i = 0; i < tri.length; i += 9) {
    const v = [id(i), id(i + 3), id(i + 6)];
    if (v[0] === v[1] || v[1] === v[2] || v[0] === v[2]) continue;
    for (let k = 0; k < 3; k++) {
      const [a, b] = [v[k], v[(k + 1) % 3]];
      const chave = a < b ? `${a}|${b}` : `${b}|${a}`;
      const uso = usos.get(chave);
      if (uso) uso[2]++;
      else usos.set(chave, [a, b, 1]);
    }
  }
  const bordas = [...usos.values()].filter((u) => u[2] === 1);
  if (!bordas.length) return { triangulos: tri, aberta: false };

  // Agrupa as bordas em bocas (laços de arestas ligadas).
  const grupo = new Map<number, number>();
  const raiz = (n: number): number => {
    const pai = grupo.get(n) ?? n;
    if (pai === n) return n;
    const r = raiz(pai);
    grupo.set(n, r);
    return r;
  };
  for (const [a, b] of bordas) grupo.set(raiz(a), raiz(b));
  const bocas = new Map<number, [number, number][]>();
  for (const [a, b] of bordas) {
    const r = raiz(a);
    if (!bocas.has(r)) bocas.set(r, []);
    bocas.get(r)!.push([a, b]);
  }

  const tampas: number[] = [];
  for (const arestas of bocas.values()) {
    const pontos = [...new Set(arestas.flat())].map((n) => new THREE.Vector3(...pos[n]));
    const centro = pontos.reduce((soma, v) => soma.add(v), new THREE.Vector3()).divideScalar(pontos.length);
    const plano = new THREE.Plane();
    // Normal da boca: a soma dos produtos vetoriais das arestas em torno do centro.
    const normal = new THREE.Vector3();
    const referencia = new THREE.Vector3();
    for (const [a, b] of arestas) {
      const va = new THREE.Vector3(...pos[a]).sub(centro);
      const vb = new THREE.Vector3(...pos[b]).sub(centro);
      const n = va.cross(vb);
      if (!referencia.lengthSq()) referencia.copy(n);
      normal.add(n.dot(referencia) < 0 ? n.negate() : n);
    }
    if (!normal.lengthSq()) return { triangulos: tri, aberta: true };
    plano.setFromNormalAndCoplanarPoint(normal.normalize(), centro);
    const tamanho = Math.max(...pontos.map((v) => v.distanceTo(centro)));
    if (pontos.some((v) => Math.abs(plano.distanceToPoint(v)) > tamanho * 0.03 + 1e-4)) return { triangulos: tri, aberta: true };
    for (const [a, b] of arestas) tampas.push(centro.x, centro.y, centro.z, ...pos[a], ...pos[b]);
  }
  const fechada = new Float32Array(tri.length + tampas.length);
  fechada.set(tri);
  fechada.set(tampas, tri.length);
  return { triangulos: fechada, aberta: false };
}

/** Conta quantas vezes o raio cruza a malha e guarda a distância do cruzamento mais próximo. */
function cruzar(tri: Float32Array, o: THREE.Vector3, d: THREE.Vector3, sinal: number, saida: { perto: number }) {
  const dx = d.x * sinal, dy = d.y * sinal, dz = d.z * sinal;
  let n = 0;
  let perto = Infinity;
  for (let i = 0; i < tri.length; i += 9) {
    const ax = tri[i], ay = tri[i + 1], az = tri[i + 2];
    const e1x = tri[i + 3] - ax, e1y = tri[i + 4] - ay, e1z = tri[i + 5] - az;
    const e2x = tri[i + 6] - ax, e2y = tri[i + 7] - ay, e2z = tri[i + 8] - az;
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (det > -1e-12 && det < 1e-12) continue;
    const inv = 1 / det;
    const tx = o.x - ax, ty = o.y - ay, tz = o.z - az;
    const u = (tx * px + ty * py + tz * pz) * inv;
    if (u < 0 || u > 1) continue;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
    const v = (dx * qx + dy * qy + dz * qz) * inv;
    if (v < 0 || u + v > 1) continue;
    const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
    if (t > 1e-9) {
      n++;
      if (t < perto) perto = t;
    }
  }
  saida.perto = perto;
  return n;
}

interface Peca {
  malha: THREE.Mesh;
  dados: Dados;
  dono: string;
  parte: string;
  esfera: THREE.Sphere;
  inversa: THREE.Matrix4;
  linear: THREE.Matrix3;
}

const local = new THREE.Vector3();
const passo = new THREE.Vector3();
const saida = { perto: 0 };

/** Quanto o ponto (em coordenadas do mundo) está afundado na peça; 0 se está fora. */
function afundamento(alvo: Peca, ponto: THREE.Vector3) {
  if (alvo.dados.aberta || !alvo.esfera.containsPoint(ponto)) return 0;
  local.copy(ponto).applyMatrix4(alvo.inversa);
  if (!alvo.dados.caixa.containsPoint(local)) return 0;
  let fundo = Infinity;
  for (const raio of RAIOS) {
    for (const sinal of [1, -1]) {
      // Dentro de uma malha fechada, qualquer raio cruza a superfície um número ímpar de vezes.
      if (cruzar(alvo.dados.triangulos, local, raio, sinal, saida) % 2 === 0) return 0;
      fundo = Math.min(fundo, passo.copy(raio).multiplyScalar(saida.perto).applyMatrix3(alvo.linear).length());
    }
  }
  return fundo;
}

function parteDoCorpo(gato: Gato, malha: THREE.Mesh) {
  const { rig } = gato;
  for (let o: THREE.Object3D | null = malha; o; o = o.parent) {
    if (o === rig.orelhas[0] || o === rig.orelhas[1]) return 'orelha';
    if (o === rig.cauda) return 'cauda';
    if (o === rig.cabeca) return 'cabeça';
    const lado = o === rig.bracos[0] ? 'esquerdo' : o === rig.bracos[1] ? 'direito' : null;
    if (lado) {
      // Punho e pata ficam na ponta do braço.
      let filho: THREE.Object3D = malha;
      while (filho.parent !== o) filho = filho.parent!;
      return filho.position.y < -0.3 ? `pata ${lado === 'esquerdo' ? 'esquerda' : 'direita'}` : `braço ${lado}`;
    }
  }
  return 'tronco';
}

function listarPecas(gato: Gato): Peca[] {
  const pecas: Peca[] = [];
  gato.raiz.updateMatrixWorld(true);
  gato.rig.corpo.traverse((o) => {
    const malha = o as THREE.Mesh;
    if (!malha.isMesh || ehContorno(malha) || !malha.visible) return;
    const dados = dadosDe(malha.geometry);
    const dono = (malha.userData.dono as string) ?? 'corpo';
    pecas.push({
      malha,
      dados,
      dono,
      parte: dono === 'corpo' ? parteDoCorpo(gato, malha) : dono,
      esfera: malha.geometry.boundingSphere!.clone().applyMatrix4(malha.matrixWorld),
      inversa: malha.matrixWorld.clone().invert(),
      linear: new THREE.Matrix3().setFromMatrix4(malha.matrixWorld),
    });
  });
  return pecas;
}

const mundo = new THREE.Vector3();

/** Pontos da superfície de `a` que estão dentro de `b`: [quantidade, maior afundamento]. */
function pontosDentro(a: Peca, b: Peca): [number, number] {
  let n = 0;
  let fundo = 0;
  const { pontos } = a.dados;
  for (let i = 0; i < pontos.length; i += 3) {
    mundo.set(pontos[i], pontos[i + 1], pontos[i + 2]).applyMatrix4(a.malha.matrixWorld);
    const f = afundamento(b, mundo);
    if (f > 0) {
      n++;
      if (f > fundo) fundo = f;
    }
  }
  return [n, fundo];
}

export interface Achado {
  caso: string;
  animacao: Animacao;
  entre: string;
  /** Formato das duas peças no pior instante (ajuda a achar qual pedaço do acessório é). */
  formas: string;
  /** Pontos de superfície dentro da outra peça, no pior instante. */
  pontos: number;
  /** Maior afundamento encontrado, em unidades do modelo (o gato tem cerca de 2 de altura). */
  fundo: number;
  instante: number;
}

const familia = (parte: string) => parte.split(' ')[0];
const encostaEm = (p: Peca) => (p.malha.userData.encosta as string[] | undefined) ?? [];
const formato = (p: Peca) => `${p.malha.geometry.type.replace('Geometry', '')} em (${p.esfera.center.toArray().map((v) => v.toFixed(2)).join(', ')})`;
const lado = (parte: string) => parte.split(' ')[1]?.slice(0, 3);

function devemSeSeparar(a: Peca, b: Peca, encaixes: Record<string, Encaixe>) {
  if (a.dono === b.dono) {
    if (a.dono !== 'corpo' || a.parte === b.parte) return false;
    // O punho abraça a manga do mesmo braço.
    if (lado(a.parte) === lado(b.parte) && [a, b].every((x) => ['braço', 'pata'].includes(familia(x.parte)))) return false;
    return PARES_DO_CORPO.some(([x, y]) => (familia(a.parte) === x && familia(b.parte) === y) || (familia(a.parte) === y && familia(b.parte) === x));
  }
  if (a.dono !== 'corpo' && b.dono !== 'corpo') {
    // Duas peças que vestem o corpo podem se encostar (colar sob cachecol, alça sob capacete),
    // e uma peça pode declarar o encaixe dos itens em que encosta (o capacete pousa nos itens do pescoço).
    const ea = encostaEm(a);
    const eb = encostaEm(b);
    if (ea.length && eb.length) return false;
    return !ea.includes(encaixes[b.dono]) && !eb.includes(encaixes[a.dono]);
  }
  const [item, corpo] = a.dono === 'corpo' ? [b, a] : [a, b];
  // Peças que vestem o corpo (alças, colares, casca do capacete) dizem em que partes encostam.
  if (encostaEm(item).includes(familia(corpo.parte))) return false;
  return !CONTATO_NATURAL[encaixes[item.dono]]?.includes(corpo.parte);
}

/**
 * Testa cada visual em todas as animações e devolve o que se atravessa.
 * `casos` associa um nome a um visual; `encaixes` diz onde cada acessório é usado.
 */
export function verificar(casos: Record<string, AvatarConfig>, encaixes: Record<string, Encaixe>, instantes = 9): Achado[] {
  const achados = new Map<string, Achado>();
  for (const [caso, avatar] of Object.entries(casos)) {
    const gato = new Gato(avatar);
    for (const animacao of ANIMACOES) {
      gato.animacao = animacao;
      for (let k = 0; k < instantes; k++) {
        const instante = 0.15 + k * 0.47;
        gato.olharPara(...OLHARES[k % OLHARES.length]);
        gato.atualizar(instante, 5);
        const pecas = listarPecas(gato);
        for (let i = 0; i < pecas.length; i++) {
          for (let j = i + 1; j < pecas.length; j++) {
            const a = pecas[i];
            const b = pecas[j];
            if (!a.esfera.intersectsSphere(b.esfera) || !devemSeSeparar(a, b, encaixes)) continue;
            const [n1, f1] = pontosDentro(a, b);
            const [n2, f2] = pontosDentro(b, a);
            if (!n1 && !n2) continue;
            const entre = [a.parte, b.parte].sort().join(' × ');
            const chave = `${caso}|${animacao}|${entre}`;
            const atual = achados.get(chave);
            const fundo = Math.max(f1, f2);
            if (!atual || fundo > atual.fundo) achados.set(chave, { caso, animacao, entre, formas: `${a.parte}: ${formato(a)} × ${b.parte}: ${formato(b)}`, pontos: n1 + n2, fundo: +fundo.toFixed(3), instante });
          }
        }
      }
    }
    gato.descartar();
  }
  return [...achados.values()].sort((x, y) => y.fundo - x.fundo);
}
