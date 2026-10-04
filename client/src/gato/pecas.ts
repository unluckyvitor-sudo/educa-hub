// Blocos de montagem do gato 3D: geometrias compartilhadas, materiais de desenho animado e contorno.
import * as THREE from 'three';

export type V3 = [number, number, number];

const COR_CONTORNO = 0x1a1c44;
const ESPESSURA = 0.028;

// Sombreamento em degraus (cel shading).
const tons = new THREE.DataTexture(new Uint8Array([105, 190, 255]), 3, 1, THREE.RedFormat);
tons.minFilter = tons.magFilter = THREE.NearestFilter;
tons.needsUpdate = true;

const matContorno = new THREE.MeshBasicMaterial({ color: COR_CONTORNO, side: THREE.BackSide });

/** A malha é só a casca de contorno de outra peça? */
export const ehContorno = (malha: THREE.Mesh) => malha.material === matContorno;

const geometrias = new Map<string, THREE.BufferGeometry>();
/** Geometrias são compartilhadas entre todos os gatos e nunca descartadas. */
export function geo<T extends THREE.BufferGeometry>(chave: string, criar: () => T): T {
  let g = geometrias.get(chave) as T | undefined;
  if (!g) geometrias.set(chave, (g = criar()));
  return g;
}

const ESFERA = new THREE.SphereGeometry(1, 28, 20);

/** Materiais de um gato. Ficam registrados para serem liberados quando o gato é refeito. */
export class Tintas {
  private usadas: THREE.Material[] = [];
  private texturas: THREE.Texture[] = [];

  toon(cor: number, extra: THREE.MeshToonMaterialParameters = {}) {
    return this.guardar(new THREE.MeshToonMaterial({ color: cor, gradientMap: tons, ...extra }));
  }

  metal(cor: number, extra: THREE.MeshStandardMaterialParameters = {}) {
    return this.guardar(new THREE.MeshStandardMaterial({ color: cor, metalness: 0.45, roughness: 0.32, ...extra }));
  }

  simples(cor: number, extra: THREE.MeshBasicMaterialParameters = {}) {
    return this.guardar(new THREE.MeshBasicMaterial({ color: cor, ...extra }));
  }

  /** Textura pintada em canvas (arco-íris, galáxia, estampas). */
  textura(largura: number, altura: number, pintar: (ctx: CanvasRenderingContext2D) => void) {
    const tela = document.createElement('canvas');
    tela.width = largura;
    tela.height = altura;
    pintar(tela.getContext('2d')!);
    const t = new THREE.CanvasTexture(tela);
    t.colorSpace = THREE.SRGBColorSpace;
    this.texturas.push(t);
    return t;
  }

  private guardar<T extends THREE.Material>(m: T) {
    this.usadas.push(m);
    return m;
  }

  descartar() {
    this.usadas.forEach((m) => m.dispose());
    this.texturas.forEach((t) => t.dispose());
    this.usadas = [];
    this.texturas = [];
  }
}

function contornar(mesh: THREE.Mesh, meia: V3) {
  const c = new THREE.Mesh(mesh.geometry, matContorno);
  c.scale.set(1 + ESPESSURA / meia[0], 1 + ESPESSURA / meia[1], 1 + ESPESSURA / meia[2]);
  mesh.add(c);
}

interface Opcoes {
  pos?: V3;
  rot?: V3;
  contorno?: boolean;
}

function finalizar(mesh: THREE.Mesh, meia: V3, { pos, rot, contorno = true }: Opcoes) {
  if (pos) mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  if (contorno) contornar(mesh, meia);
  return mesh;
}

/** Elipsoide com os semieixos dados. */
export function esfera(mat: THREE.Material, raios: V3, opcoes: Opcoes = {}) {
  const m = new THREE.Mesh(ESFERA, mat);
  m.scale.set(...raios);
  // O contorno é filho da esfera já escalada, então a espessura é relativa aos raios.
  return finalizar(m, raios, opcoes);
}

export function cone(mat: THREE.Material, raio: number, altura: number, opcoes: Opcoes = {}, lados = 20) {
  const g = geo(`cone:${raio}:${altura}:${lados}`, () => new THREE.ConeGeometry(raio, altura, lados));
  return finalizar(new THREE.Mesh(g, mat), [raio, altura / 2, raio], opcoes);
}

export function cilindro(mat: THREE.Material, raioTopo: number, raioBase: number, altura: number, opcoes: Opcoes = {}, lados = 24) {
  const g = geo(`cil:${raioTopo}:${raioBase}:${altura}:${lados}`, () => new THREE.CylinderGeometry(raioTopo, raioBase, altura, lados));
  const raio = Math.max(raioTopo, raioBase);
  return finalizar(new THREE.Mesh(g, mat), [raio, altura / 2, raio], opcoes);
}

export function capsula(mat: THREE.Material, raio: number, comprimento: number, opcoes: Opcoes = {}) {
  const g = geo(`cap:${raio}:${comprimento}`, () => new THREE.CapsuleGeometry(raio, comprimento, 6, 14));
  return finalizar(new THREE.Mesh(g, mat), [raio, comprimento / 2 + raio, raio], opcoes);
}

export function caixa(mat: THREE.Material, tamanho: V3, opcoes: Opcoes = {}) {
  const g = geo(`cx:${tamanho.join(':')}`, () => new THREE.BoxGeometry(...tamanho));
  return finalizar(new THREE.Mesh(g, mat), [tamanho[0] / 2, tamanho[1] / 2, tamanho[2] / 2], opcoes);
}

/** Metade de cima de um elipsoide (bonés, gorros, capacetes). */
export function cupula(mat: THREE.Material, raios: V3, opcoes: Opcoes = {}) {
  const g = geo('cupula', () => new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2));
  const m = new THREE.Mesh(g, mat);
  m.scale.set(...raios);
  return finalizar(m, raios, opcoes);
}

/** Cilindro fino ligando dois pontos (hastes, cordões, varetas). */
export function barra(mat: THREE.Material, de: V3, ate: V3, raio: number) {
  const a = new THREE.Vector3(...de);
  const b = new THREE.Vector3(...ate);
  const comprimento = a.distanceTo(b);
  const m = new THREE.Mesh(geo(`barra:${raio}`, () => new THREE.CylinderGeometry(raio, raio, 1, 8)), mat);
  m.scale.y = comprimento;
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
  return m;
}

/**
 * Faixa curva: parede de cilindro aberta, cobrindo `arco` radianos centrados na frente (+Z).
 * `topo` < 1 fecha a faixa em cima, para acompanhar uma cabeça arredondada.
 */
export function faixa(mat: THREE.Material, raios: [number, number], altura: number, arco: number, opcoes: Opcoes & { topo?: number } = {}) {
  const topo = opcoes.topo ?? 1;
  const g = geo(`faixa:${altura}:${arco}:${topo}`, () => new THREE.CylinderGeometry(topo, 1, altura, 40, 1, true, -arco / 2, arco));
  const m = new THREE.Mesh(g, mat);
  m.scale.set(raios[0], 1, raios[1]);
  return finalizar(m, [raios[0], altura / 2, raios[1]], { contorno: false, ...opcoes });
}

/** Anel (toro). Sem contorno por padrão: o casco invertido não funciona bem em anéis finos. */
export function anel(mat: THREE.Material, raio: number, tubo: number, opcoes: Opcoes & { arco?: number } = {}) {
  const arco = opcoes.arco ?? Math.PI * 2;
  const g = geo(`anel:${raio}:${tubo}:${arco}`, () => new THREE.TorusGeometry(raio, tubo, 12, 32, arco));
  return finalizar(new THREE.Mesh(g, mat), [raio + tubo, raio + tubo, tubo], { contorno: false, ...opcoes });
}

/** Tubo que segue uma curva suave pelos pontos dados. */
export function tubo(mat: THREE.Material, chave: string, pontos: V3[], raio: number) {
  const g = geo(`tubo:${chave}`, () => {
    const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curva, 28, raio, 10);
  });
  const m = new THREE.Mesh(g, mat);
  const casca = new THREE.Mesh(
    geo(`tubo-c:${chave}`, () => {
      const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)));
      return new THREE.TubeGeometry(curva, 28, raio + ESPESSURA, 10);
    }),
    matContorno,
  );
  m.add(casca);
  return m;
}

/** Tubo que afina da base até a ponta (cauda), com a ponta arredondada. */
export function tuboAfinado(mat: THREE.Material, chave: string, pontos: V3[], raioBase: number, raioPonta: number) {
  const SEGMENTOS = 40;
  const LADOS = 14;
  const criar = (folga: number) => {
    const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)));
    const g = new THREE.TubeGeometry(curva, SEGMENTOS, 1, LADOS);
    const pos = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i <= SEGMENTOS; i++) {
      const u = i / SEGMENTOS;
      const centro = curva.getPointAt(u);
      // Raio de cada anel; perto da ponta fecha em arco para não terminar em "cano cortado".
      const fecho = u > 0.9 ? Math.sqrt(Math.max(1 - ((u - 0.9) / 0.1) ** 2, 0)) : 1;
      const raio = (raioBase + (raioPonta - raioBase) * u) * fecho + folga;
      for (let j = 0; j <= LADOS; j++) {
        const k = i * (LADOS + 1) + j;
        v.fromBufferAttribute(pos, k).sub(centro).multiplyScalar(raio).add(centro);
        pos.setXYZ(k, v.x, v.y, v.z);
      }
    }
    g.computeVertexNormals();
    return g;
  };
  const m = new THREE.Mesh(geo(`afinado:${chave}`, () => criar(0)), mat);
  m.add(new THREE.Mesh(geo(`afinado-c:${chave}`, () => criar(ESPESSURA)), matContorno));
  return m;
}

/** Perfil suavizado: pontos [raio, altura] ligados por uma curva. */
function perfilSuave(perfil: [number, number][], folga: number) {
  const pontos = new THREE.SplineCurve(perfil.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(56);
  return pontos.map((p, i) => {
    if (!folga) return new THREE.Vector2(Math.max(p.x, 0), p.y);
    // Afasta o perfil para fora, na direção perpendicular à curva (casca do contorno).
    const antes = pontos[Math.max(i - 1, 0)];
    const depois = pontos[Math.min(i + 1, pontos.length - 1)];
    const t = depois.clone().sub(antes).normalize();
    return new THREE.Vector2(Math.max(p.x + t.y * folga, 0), p.y - t.x * folga);
  });
}

/** Sólido de revolução (tronco, orelhas, tufos): gira um perfil [raio, altura] em torno do eixo vertical. */
export function torneado(mat: THREE.Material, chave: string, perfil: [number, number][], opcoes: Opcoes = {}) {
  const m = new THREE.Mesh(geo(`torno:${chave}`, () => new THREE.LatheGeometry(perfilSuave(perfil, 0), 40)), mat);
  if (opcoes.pos) m.position.set(...opcoes.pos);
  if (opcoes.rot) m.rotation.set(...opcoes.rot);
  if (opcoes.contorno !== false) {
    m.add(new THREE.Mesh(geo(`torno-c:${chave}`, () => new THREE.LatheGeometry(perfilSuave(perfil, ESPESSURA), 40)), matContorno));
  }
  return m;
}

/** Cone de ponta arredondada, com a base na origem (orelhas e tufos de pelo). */
export function gota(mat: THREE.Material, raio: number, altura: number, opcoes: Opcoes = {}) {
  const perfil: [number, number][] = [
    [raio, 0],
    [raio * 0.95, altura * 0.14],
    [raio * 0.72, altura * 0.46],
    [raio * 0.42, altura * 0.76],
    [raio * 0.17, altura * 0.94],
    [0, altura],
  ];
  return torneado(mat, `gota:${raio}:${altura}`, perfil, opcoes);
}

/** Malha com geometria própria (em cache) e contorno por cópia ampliada. */
export function modelado(mat: THREE.Material, chave: string, criar: () => THREE.BufferGeometry, raios: V3, opcoes: Opcoes = {}) {
  const m = new THREE.Mesh(geo(`modelado:${chave}`, criar), mat);
  m.scale.set(...raios);
  return finalizar(m, raios, opcoes);
}

/** Forma plana com espessura (estrelas, corações), a partir de um contorno 2D. */
export function recorte(mat: THREE.Material, chave: string, desenhar: (forma: THREE.Shape) => void, espessura: number, opcoes: Opcoes = {}) {
  const g = geo(`rec:${chave}:${espessura}`, () => {
    const forma = new THREE.Shape();
    desenhar(forma);
    const ge = new THREE.ExtrudeGeometry(forma, { depth: espessura, bevelEnabled: false });
    ge.translate(0, 0, -espessura / 2);
    return ge;
  });
  const m = new THREE.Mesh(g, mat);
  if (opcoes.pos) m.position.set(...opcoes.pos);
  if (opcoes.rot) m.rotation.set(...opcoes.rot);
  return m;
}

export function estrela(forma: THREE.Shape, raioExterno: number, raioInterno: number, pontas = 5) {
  for (let i = 0; i < pontas * 2; i++) {
    const r = i % 2 === 0 ? raioExterno : raioInterno;
    const a = (i / (pontas * 2)) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) forma.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else forma.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  forma.closePath();
}

export function grupo(pos?: V3, rot?: V3, ...filhos: THREE.Object3D[]) {
  const g = new THREE.Group();
  if (pos) g.position.set(...pos);
  if (rot) g.rotation.set(...rot);
  if (filhos.length) g.add(...filhos);
  return g;
}
