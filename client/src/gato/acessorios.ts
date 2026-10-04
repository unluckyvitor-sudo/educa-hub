// Acessórios 3D do avatar. Cada função monta o item e o prende ao encaixe certo do gato,
// usando as medidas do corpo (rig.ts) para servir em qualquer modelo.
// Os ids são os mesmos do catálogo da loja no servidor.
import * as THREE from 'three';
import { esfera, cone, cilindro, caixa, anel, cupula, barra, faixa, modelado, recorte, estrela, grupo, geo, type V3 } from './pecas';
import type { Ajustes, Encaixes, Medidas } from './rig';

const OURO = 0xffc72e;

/** Chapéus que cobrem o topo da cabeça (o topete some). */
export const ESCONDEM_TOPETE = new Set(['bone', 'chapeu-festa', 'gorro', 'capelo', 'cartola', 'chapeu-mago', 'coroa', 'astronauta']);

/** Capacetes justos, que escondem os tufos de pelo das bochechas. */
export const ESCONDEM_TUFOS = new Set(['astronauta']);

/**
 * Marca uma peça que veste o corpo e, por isso, encosta de propósito em algumas partes dele
 * (a verificação de colisões em colisoes.ts não acusa esses contatos).
 */
function encosta<T extends THREE.Object3D>(peca: T, ...partes: string[]) {
  peca.userData.encosta = partes;
  return peca;
}

/** Alças, colares e fitas ficam rentes ao corpo: os braços passam por cima deles. */
const rente = <T extends THREE.Object3D>(peca: T) => encosta(peca, 'tronco', 'cabeça', 'braço');

/** Com chapéu, as orelhas abrem um pouco para os lados e não fecham sobre ele. */
function abrirOrelhas(ajustes: Ajustes) {
  ajustes.orelhas += 0.12;
  ajustes.orelhasMovem = 'so-abrem';
}

/** Casca do capacete: uma fatia (em longitude) de um ovo, mais funda na frente e achatada embaixo para não entrar nos ombros. */
function cascaDoCapacete(inicio: number, abertura: number, frente: number) {
  const g = new THREE.SphereGeometry(1, 40, 28, inicio, abertura);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y < -0.55) pos.setY(i, -0.55 + (y + 0.55) * 0.55);
    if (z > 0) pos.setZ(i, z * frente);
  }
  g.computeVertexNormals();
  return g;
}

function elipse(forma: THREE.Shape, rx: number, ry: number) {
  forma.absellipse(0, 0, rx, ry, 0, Math.PI * 2);
}

/** Posição da lente de cada olho: [esquerdo da tela, direito da tela]. */
const lentes = (m: Medidas): V3[] => [
  [-m.olhos.x, m.olhos.y, m.olhos.z],
  [m.olhos.x, m.olhos.y, m.olhos.z],
];

/** Haste dos óculos: da lateral da lente até a lateral da cabeça. */
function haste(mat: THREE.Material, m: Medidas, lado: number, raio = 0.02) {
  return barra(mat, [lado * (m.olhos.x + m.olhos.raio * 0.9), m.olhos.y + 0.02, m.olhos.z - 0.08], [lado * (m.cabeca.rx - 0.02), m.olhos.y + 0.07, 0.1], raio);
}

/** Anel em volta do pescoço (elíptico quando o pescoço é mais largo que fundo), caído para a frente. */
function colar(mat: THREE.Material, m: Medidas, tubo: number, queda: number, folga = 0, altura = 0) {
  const aro = anel(mat, m.pescoco.rx + folga, tubo, { pos: [0, m.pescoco.y + altura, 0.04], rot: [Math.PI / 2 + queda, 0, 0] });
  aro.scale.y = (m.pescoco.rz + folga) / (m.pescoco.rx + folga);
  return rente(aro);
}

export const ACESSORIOS: Record<string, (e: Encaixes) => void> = {
  // ───────────── Cabeça ─────────────
  // Os chapéus são pequenos e pousam no alto da cabeça, no vão entre as orelhas, sem atravessá-las.
  laco({ cabeca, tintas: t }) {
    const rosa = t.toon(0xff4f9a);
    cabeca.add(
      grupo([0.25, 0.44, 0.32], [0.15, 0.25, -0.35],
        cone(rosa, 0.12, 0.2, { pos: [-0.11, 0, 0], rot: [0, 0, -Math.PI / 2] }),
        cone(rosa, 0.12, 0.2, { pos: [0.11, 0, 0], rot: [0, 0, Math.PI / 2] }),
        esfera(t.toon(0xe0307a), [0.055, 0.055, 0.055]),
      ),
    );
  },

  bone({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    cabeca.add(
      grupo([0, 0.52, 0.05], [-0.1, 0, -0.1],
        cupula(t.toon(0xef4444), [0.17, 0.14, 0.18]),
        cilindro(t.toon(0xc42a2a), 0.14, 0.14, 0.03, { pos: [0, 0.015, 0.19], rot: [0.12, 0, 0] }),
        esfera(t.toon(0xffffff), [0.03, 0.02, 0.03], { pos: [0, 0.14, 0], contorno: false }),
      ),
    );
  },

  'chapeu-festa'({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    cabeca.add(
      grupo([0.01, 0.52, 0.03], [0, 0, -0.08],
        cone(t.toon(0xffc233), 0.16, 0.42, { pos: [0, 0.21, 0] }),
        anel(t.toon(0xff4f9a), 0.146, 0.028, { pos: [0, 0.03, 0], rot: [Math.PI / 2, 0, 0] }),
        anel(t.toon(0x2f7df6), 0.085, 0.022, { pos: [0, 0.2, 0], rot: [Math.PI / 2, 0, 0] }),
        esfera(t.toon(0xff4f9a), [0.055, 0.055, 0.055], { pos: [0, 0.44, 0] }),
      ),
    );
  },

  gorro({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    cabeca.add(
      grupo([0, 0.5, 0.02], [-0.08, 0, 0],
        cupula(t.toon(0x1fb5a3), [0.175, 0.19, 0.185]),
        anel(t.toon(0xffffff), 0.15, 0.04, { pos: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] }),
        esfera(t.toon(0xffffff), [0.065, 0.065, 0.065], { pos: [0, 0.225, 0] }),
      ),
    );
  },

  fones({ cabeca, tintas: t, medidas: m }) {
    const escuro = t.toon(0x33364b);
    const azul = t.toon(0x2f7df6);
    const lateral = m.cabeca.rx + 0.04;
    // O arco passa por trás das orelhas.
    cabeca.add(anel(escuro, lateral, 0.04, { pos: [0, 0.02, -0.25], arco: Math.PI }));
    for (const lado of [-1, 1]) {
      cabeca.add(
        cilindro(azul, 0.19, 0.19, 0.11, { pos: [lado * lateral, 0, -0.14], rot: [0, 0, Math.PI / 2] }),
        cilindro(escuro, 0.13, 0.13, 0.04, { pos: [lado * (lateral + 0.07), 0, -0.14], rot: [0, 0, Math.PI / 2], contorno: false }),
      );
    }
  },

  capelo({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    const azul = t.toon(0x23264d);
    const ouro = t.toon(OURO);
    cabeca.add(
      grupo([0, 0.5, 0.04], [0.05, 0.3, -0.08],
        cilindro(azul, 0.14, 0.16, 0.12, { pos: [0, 0.05, 0] }),
        caixa(azul, [0.42, 0.035, 0.42], { pos: [0, 0.125, 0] }),
        esfera(ouro, [0.03, 0.02, 0.03], { pos: [0, 0.15, 0], contorno: false }),
        // Cordão caindo pela frente, longe das orelhas
        barra(ouro, [0, 0.15, 0], [0.06, 0.145, 0.21], 0.01),
        barra(ouro, [0.06, 0.145, 0.21], [0.06, 0.04, 0.21], 0.01),
        cone(ouro, 0.03, 0.09, { pos: [0.06, 0.0, 0.21], contorno: false }),
      ),
    );
  },

  cartola({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    const preto = t.toon(0x23264d);
    cabeca.add(
      grupo([0.01, 0.535, 0.03], [0, 0, -0.08],
        cilindro(preto, 0.19, 0.19, 0.03, { pos: [0, 0.02, 0] }),
        cilindro(preto, 0.135, 0.125, 0.3, { pos: [0, 0.18, 0] }),
        cilindro(t.toon(0xef4444), 0.132, 0.132, 0.05, { pos: [0, 0.065, 0], contorno: false }),
      ),
    );
  },

  'chapeu-mago'({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    const roxo = t.toon(0x5b2bd6);
    const brilho = t.simples(0xffe27a);
    const chapeu = grupo([0.01, 0.5, 0.02], [-0.05, 0, -0.08],
      cilindro(roxo, 0.19, 0.19, 0.03, { pos: [0, 0.05, 0] }),
      cone(roxo, 0.155, 0.5, { pos: [0, 0.3, 0] }),
      cilindro(t.toon(OURO), 0.145, 0.155, 0.045, { pos: [0, 0.088, 0], contorno: false }),
    );
    const pontos: V3[] = [[0.07, 0.19, 0.11], [-0.06, 0.29, 0.075], [0.02, 0.4, 0.045]];
    for (const [i, p] of pontos.entries()) {
      chapeu.add(recorte(brilho, 'estrelinha', (f) => estrela(f, 0.032, 0.014), 0.012, { pos: p, rot: [-0.3, i * 0.4 - 0.3, 0] }));
    }
    cabeca.add(chapeu);
  },

  coroa({ cabeca, tintas: t, ajustes }) {
    abrirOrelhas(ajustes);
    const ouro = t.metal(OURO, { emissive: 0x8a5a00, emissiveIntensity: 0.5 });
    const coroa = grupo([0, 0.5, 0.03], [-0.06, 0, 0]);
    coroa.add(cilindro(ouro, 0.17, 0.155, 0.1, { pos: [0, 0.05, 0] }));
    const gemas = [0xef4444, 0x2f7df6, 0x2fbf71];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      coroa.add(cone(ouro, 0.042, 0.12, { pos: [Math.sin(a) * 0.158, 0.155, Math.cos(a) * 0.158] }, 10));
      coroa.add(esfera(t.simples(gemas[i % 3]), [0.022, 0.022, 0.016], { pos: [Math.sin(a) * 0.168, 0.05, Math.cos(a) * 0.168], contorno: false }));
    }
    cabeca.add(coroa);
  },

  astronauta({ cabeca, tintas: t, medidas: m, ajustes }) {
    // Capacete justo, no formato da cabeça: casca branca atrás e visor de vidro na frente.
    // As orelhas saem por dois furos com borda e ficam presas neles.
    ajustes.orelhasMovem = 'presas';
    ajustes.pensando = { ...ajustes.pensando, x: ajustes.pensando.x + 0.15 }; // a pata fica abaixo do capacete
    ajustes.inclinacao = 0.5; // menos folga sobre os ombros
    ajustes.erguido = { ...ajustes.erguido, z: ajustes.erguido.z - 0.12 }; // e o aceno passa por baixo dele
    const branco = t.toon(0xf1f3f9, { side: THREE.DoubleSide });
    const vidro = t.metal(0xbfeaff, { transparent: true, opacity: 0.2, metalness: 0, roughness: 0.05, depthWrite: false });
    const raios: V3 = [m.cabeca.rx + 0.09, m.cabeca.ry + 0.07, m.cabeca.rz + 0.07];
    const frente = (m.cabeca.rz + 0.24) / raios[2]; // o visor avança à frente do focinho e dos óculos
    const VISOR = 1.3; // meia abertura do visor, em radianos a partir da frente
    const casca = modelado(branco, `capacete-casca:${frente}`, () => cascaDoCapacete(Math.PI / 2 + VISOR, Math.PI * 2 - VISOR * 2, frente), raios);
    const visor = new THREE.Mesh(geo(`capacete-visor:${frente}`, () => cascaDoCapacete(Math.PI / 2 - VISOR, VISOR * 2, frente)), vidro);
    visor.scale.set(...raios);
    cabeca.add(
      // A casca pousa na gola e no que estiver no pescoço, como a cabeça; as orelhas passam pelos furos.
      encosta(casca, 'tronco', 'orelha', 'pescoco'),
      encosta(visor, 'tronco', 'pescoco'),
      // Brilho no alto do visor, acima dos óculos
      esfera(t.simples(0xffffff, { transparent: true, opacity: 0.55 }), [0.045, 0.11, 0.01], { pos: [-0.5 * raios[0] * 1.02, 0.7 * raios[1] * 1.02, 0.5 * raios[2] * frente * 1.02], rot: [-0.7, -0.6, 0.5], contorno: false }),
      // Antena atrás, entre as orelhas
      esfera(branco, [0.055, 0.03, 0.055], { pos: [0, raios[1] * 0.86, -raios[2] * 0.52], contorno: false }),
      barra(t.toon(0xef4444), [0, raios[1] * 0.86, -raios[2] * 0.52], [0, raios[1] * 0.86 + 0.26, -raios[2] * 0.52 - 0.08], 0.016),
      esfera(t.simples(0xef4444), [0.045, 0.045, 0.045], { pos: [0, raios[1] * 0.86 + 0.27, -raios[2] * 0.52 - 0.083], contorno: false }),
    );
    for (const lado of [-1, 1]) {
      const borda = grupo([lado * m.orelha.x, m.orelha.y, m.orelha.z], [0, 0, -lado * ajustes.orelhas], encosta(anel(branco, m.orelha.raio, 0.035, { rot: [Math.PI / 2, 0, 0] }), 'orelha'));
      borda.scale.z = 0.7;
      cabeca.add(borda);
    }
  },

  aureola({ cabeca, tintas: t, animados }) {
    const luz = t.simples(0xffe27a);
    const aro = anel(luz, 0.3, 0.04, { pos: [0, 1.0, 0], rot: [Math.PI / 2 - 0.12, 0, 0] });
    cabeca.add(aro);
    animados.push((tempo) => {
      aro.position.y = 1.0 + Math.sin(tempo * 2.4) * 0.03;
    });
  },

  // ───────────── Rosto ─────────────
  'oculos-redondos'({ cabeca, tintas: t, medidas: m }) {
    const aro = t.toon(0x23264d);
    for (const [i, p] of lentes(m).entries()) {
      const lado = i ? 1 : -1;
      cabeca.add(anel(aro, m.olhos.raio, 0.024, { pos: p, rot: [0, lado * m.olhos.giro, 0] }), haste(aro, m, lado));
    }
    const ponte = Math.max(m.olhos.x - m.olhos.raio, 0) + 0.03;
    cabeca.add(barra(aro, [-ponte, m.olhos.y + 0.03, m.olhos.z + 0.035], [ponte, m.olhos.y + 0.03, m.olhos.z + 0.035], 0.02));
  },

  'oculos-escuros'({ cabeca, tintas: t, medidas: m }) {
    const lente = t.metal(0x14152f, { roughness: 0.15, metalness: 0.2 });
    const aro = t.toon(0x23264d);
    const r = m.olhos.raio;
    for (const [i, p] of lentes(m).entries()) {
      const lado = i ? 1 : -1;
      cabeca.add(
        esfera(lente, [Math.min(r * 1.08, m.olhos.x * 0.98), r, 0.045], { pos: [p[0], p[1], p[2] - 0.01], rot: [0, lado * m.olhos.giro, 0] }),
        esfera(t.simples(0xffffff, { transparent: true, opacity: 0.7 }), [0.05, 0.025, 0.01], { pos: [p[0] - 0.06, p[1] + 0.07, p[2] + 0.035], rot: [0, lado * m.olhos.giro, 0.5], contorno: false }),
        haste(aro, m, lado, 0.022),
      );
    }
    cabeca.add(barra(aro, [-0.08, m.olhos.y + 0.04, m.olhos.z + 0.03], [0.08, m.olhos.y + 0.04, m.olhos.z + 0.03], 0.026));
  },

  monoculo({ cabeca, tintas: t, medidas: m }) {
    const ouro = t.toon(OURO);
    const p = lentes(m)[1];
    const r = m.olhos.raio;
    cabeca.add(
      anel(ouro, r, 0.026, { pos: p, rot: [0, m.olhos.giro, 0] }),
      esfera(t.simples(0xbfeaff, { transparent: true, opacity: 0.25 }), [r * 0.95, r * 0.95, 0.01], { pos: p, rot: [0, m.olhos.giro, 0], contorno: false }),
      // Corrente curta, presa à lateral do rosto: não chega ao item que a mão segura
      barra(ouro, [p[0] + r * 0.8, p[1] - r * 0.65, p[2] - 0.08], [p[0] + r * 1.25, p[1] - 0.27, p[2] - 0.2], 0.01),
      esfera(ouro, [0.022, 0.022, 0.022], { pos: [p[0] + r * 1.25, p[1] - 0.27, p[2] - 0.2], contorno: false }),
    );
  },

  'mascara-heroi'({ cabeca, tintas: t, medidas: m }) {
    const tecido = t.toon(0xe11d48, { side: THREE.DoubleSide });
    // Faixa justa em volta da cabeça, na altura dos olhos (que aparecem por cima dela), com o nó atrás.
    const fundo = m.cabeca.rz + 0.008;
    // Fones e chapéus podem ficar por cima da faixa.
    cabeca.add(encosta(faixa(tecido, [m.cabeca.rx + 0.032, fundo + 0.008], 0.17, Math.PI * 2, { pos: [0, m.olhos.y + 0.03, 0.012], topo: 0.93 }), 'cabeca'));
    for (const lado of [-1, 1]) {
      cabeca.add(caixa(tecido, [0.06, 0.18, 0.02], { pos: [lado * 0.07, m.olhos.y - 0.07, -fundo - 0.002], rot: [0.12, 0, lado * 0.45] }));
    }
  },

  'oculos-estrela'({ cabeca, tintas: t, medidas: m }) {
    const rosa = t.toon(0xff4f9a);
    const escala = m.olhos.raio / 0.2;
    for (const [i, p] of lentes(m).entries()) {
      const lado = i ? 1 : -1;
      const aro = recorte(rosa, 'aro-estrela', (f) => {
        estrela(f, 0.25, 0.17);
        const furo = new THREE.Path();
        furo.absarc(0, 0, 0.15, 0, Math.PI * 2, true);
        f.holes.push(furo);
      }, 0.035, { pos: [p[0] + lado * 0.02, p[1], p[2] + 0.015], rot: [0, lado * m.olhos.giro, 0] });
      aro.scale.set(escala, escala, 1);
      cabeca.add(aro, haste(rosa, m, lado, 0.022));
    }
  },

  // ───────────── Pescoço ─────────────
  sino({ corpo, tintas: t, medidas: m }) {
    const frente = m.pescoco.rz + 0.05;
    corpo.add(
      colar(t.toon(0xef4444), m, 0.04, 0.3),
      esfera(t.metal(OURO, { emissive: 0x8a5a00, emissiveIntensity: 0.4 }), [0.085, 0.085, 0.085], { pos: [0, m.pescoco.y - 0.14, frente] }),
      esfera(t.simples(0x7a4a00), [0.012, 0.045, 0.02], { pos: [0, m.pescoco.y - 0.17, frente + 0.08], contorno: false }),
    );
  },

  'gravata-borboleta'({ corpo, tintas: t, medidas: m }) {
    const vermelho = t.toon(0xe11d48);
    corpo.add(
      grupo([0, m.pescoco.y - 0.07, m.pescoco.rz + 0.03], [-0.2, 0, 0],
        cone(vermelho, 0.085, 0.14, { pos: [-0.075, 0, 0], rot: [0, 0, -Math.PI / 2] }),
        cone(vermelho, 0.085, 0.14, { pos: [0.075, 0, 0], rot: [0, 0, Math.PI / 2] }),
        esfera(t.toon(0xa8123a), [0.042, 0.046, 0.042]),
      ),
    );
  },

  cachecol({ corpo, tintas: t, medidas: m }) {
    const la = t.toon(0xff8a3c);
    const listra = t.toon(0xfff1dc);
    const x = m.pescoco.rx * 0.6;
    const y = m.pescoco.y - 0.21;
    const z = m.pescoco.rz + 0.03;
    corpo.add(
      // Volta fofa em torno do pescoço, pousada nos ombros
      rente(anel(la, (m.pescoco.rx + m.pescoco.rz) / 2 - 0.045, 0.1, { pos: [0, m.pescoco.y + 0.045, 0.03], rot: [Math.PI / 2 + 0.12, 0, 0] })),
      rente(caixa(la, [0.17, 0.36, 0.06], { pos: [x, y, z], rot: [-0.12, 0, -0.1] })),
      caixa(listra, [0.175, 0.045, 0.065], { pos: [x + 0.012, y - 0.11, z + 0.014], rot: [-0.12, 0, -0.1], contorno: false }),
    );
  },

  medalha({ corpo, tintas: t, medidas: m }) {
    const fita = t.toon(0x2f7df6);
    const ouro = t.metal(OURO, { emissive: 0x8a5a00, emissiveIntensity: 0.5 });
    const { y, z } = m.peito;
    const no: V3 = [0, y + 0.04, z - 0.015];
    for (const lado of [-1, 1]) corpo.add(rente(barra(fita, [lado * m.pescoco.rx * 0.6, m.pescoco.y + 0.03, m.pescoco.rz - 0.07], no, 0.03)));
    corpo.add(
      cilindro(ouro, 0.11, 0.11, 0.035, { pos: [0, y, z], rot: [Math.PI / 2 - 0.1, 0, 0] }),
      recorte(t.simples(0xfff3b0), 'estrela-medalha', (f) => estrela(f, 0.06, 0.026), 0.012, { pos: [0, y, z + 0.025], rot: [-0.1, 0, 0] }),
    );
  },

  // ───────────── Costas ─────────────
  mochila({ corpo, tintas: t, medidas: m }) {
    const laranja = t.toon(0xff8a3c);
    const escuro = t.toon(0xe0661c);
    const { y, z, largura: k } = m.costas;
    corpo.add(
      esfera(laranja, [0.36 * k, 0.4 * k, 0.22 * k], { pos: [0, y, z] }),
      esfera(escuro, [0.22 * k, 0.17 * k, 0.1 * k], { pos: [0, y - 0.12 * k, z - 0.18 * k] }),
    );
    // Alças: pousam nos ombros, entre o braço e a gola, e descem pela frente do tronco.
    for (const lado of [-1, 1]) {
      corpo.add(rente(anel(escuro, Math.abs(z) / 2, 0.03, { pos: [lado * 0.3 * k, y + 0.07, -0.05], rot: [0, Math.PI / 2, 0] })));
    }
  },

  capa({ corpo, tintas: t, medidas: m, animados }) {
    const g = geo('capa', () => {
      const plano = new THREE.PlaneGeometry(1, 1.15, 10, 10);
      const pos = plano.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const v = 0.5 - pos.getY(i) / 1.15; // 0 no topo, 1 na barra
        const x = pos.getX(i) * (0.62 + 0.75 * v);
        pos.setXYZ(i, x, pos.getY(i), -0.3 * v - 0.5 * x * x + Math.sin(x * 9) * 0.03 * v);
      }
      plano.computeVertexNormals();
      return plano;
    });
    const capa = new THREE.Mesh(g, t.toon(0xe11d48, { side: THREE.DoubleSide }));
    const pivo = grupo([0, 1.02, m.costas.z + 0.02]);
    capa.position.y = -0.575;
    capa.scale.x = m.costas.largura;
    pivo.add(capa);
    corpo.add(pivo, encosta(colar(t.toon(OURO), m, 0.035, 0.3, -0.01, 0.02), 'tronco', 'cabeça', 'braço', 'pescoco'));
    animados.push((tempo) => {
      // Só balança para trás, para nunca entrar no corpo.
      pivo.rotation.x = 0.12 + Math.sin(tempo * 2.2) * 0.05;
    });
  },

  'asas-borboleta'({ corpo, tintas: t, medidas: m, animados }) {
    const fora = t.toon(0xff4f9a, { side: THREE.DoubleSide });
    const dentro = t.toon(0xffc233, { side: THREE.DoubleSide });
    const { y, largura: k } = m.costas;
    const z = m.costas.z - 0.06;
    const TOMBO = 0.36; // a parte de cima tomba para trás, para a cabeça poder virar sem tocar nas asas
    const asas = [-1, 1].map((lado) => {
      const asa = grupo([lado * 0.08 * k, y + 0.14, z]);
      asa.scale.x = k;
      asa.add(
        recorte(fora, 'asa-b1', (f) => elipse(f, 0.42, 0.5), 0.03, { pos: [lado * 0.62, 0.36, -0.36 * TOMBO], rot: [-TOMBO, 0, lado * -0.5] }),
        recorte(dentro, 'asa-b2', (f) => elipse(f, 0.24, 0.3), 0.04, { pos: [lado * 0.62, 0.36, -0.36 * TOMBO], rot: [-TOMBO, 0, lado * -0.5] }),
        recorte(fora, 'asa-b3', (f) => elipse(f, 0.3, 0.34), 0.03, { pos: [lado * 0.5, -0.3, 0], rot: [0, 0, lado * 0.5] }),
        recorte(dentro, 'asa-b4', (f) => elipse(f, 0.16, 0.18), 0.04, { pos: [lado * 0.5, -0.3, 0], rot: [0, 0, lado * 0.5] }),
      );
      corpo.add(asa);
      return asa;
    });
    animados.push((tempo) => {
      const bater = 0.45 + Math.sin(tempo * 7) * 0.4;
      asas[0].rotation.y = -bater;
      asas[1].rotation.y = bater;
    });
  },

  'asas-anjo'({ corpo, tintas: t, medidas: m, animados }) {
    const pena = t.toon(0xffffff);
    const { y, largura: k } = m.costas;
    const z = m.costas.z - 0.06;
    const asas = [-1, 1].map((lado) => {
      const asa = grupo([lado * 0.1 * k, y + 0.18, z]);
      asa.scale.x = k;
      const penas: [V3, V3, number][] = [
        [[0.62, 0.5, 0], [0.5, 0.17, 0.05], 0.75],
        [[0.72, 0.2, 0], [0.5, 0.16, 0.05], 0.3],
        [[0.62, -0.12, 0], [0.42, 0.15, 0.05], -0.15],
        [[0.4, -0.36, 0], [0.3, 0.13, 0.05], -0.6],
      ];
      for (const [pos, raios, giro] of penas) {
        // As penas de cima tombam para trás, para a cabeça poder virar sem tocar nas asas.
        const tombo = pos[1] > 0 ? 0.36 : 0;
        asa.add(esfera(pena, raios, { pos: [lado * pos[0], pos[1], pos[2] - pos[1] * tombo], rot: [-tombo, 0, lado * giro] }));
      }
      corpo.add(asa);
      return asa;
    });
    animados.push((tempo) => {
      const bater = 0.3 + Math.sin(tempo * 3) * 0.22;
      asas[0].rotation.y = -bater;
      asas[1].rotation.y = bater;
    });
  },

  jetpack({ corpo, tintas: t, medidas: m, animados }) {
    const metal = t.metal(0xc3cbdc);
    const vermelho = t.toon(0xef4444);
    const fogo = t.simples(0xff9a3c, { transparent: true, opacity: 0.9 });
    const miolo = t.simples(0xfff3b0);
    const y = m.costas.y + 0.04;
    const z = m.costas.z - 0.1;
    const chamas: THREE.Object3D[] = [];
    for (const lado of [-1, 1]) {
      const chama = grupo([lado * 0.17, y - 0.28, z], [Math.PI, 0, 0],
        cone(fogo, 0.09, 0.3, { pos: [0, 0.15, 0], contorno: false }),
        cone(miolo, 0.045, 0.18, { pos: [0, 0.09, 0], contorno: false }),
      );
      chamas.push(chama);
      corpo.add(
        cilindro(metal, 0.13, 0.13, 0.44, { pos: [lado * 0.17, y, z] }),
        cupula(vermelho, [0.13, 0.13, 0.13], { pos: [lado * 0.17, y + 0.22, z] }),
        cone(t.toon(0x7d879f), 0.11, 0.12, { pos: [lado * 0.17, y - 0.25, z], contorno: false }),
        chama,
      );
    }
    // Suporte que liga os tanques às costas
    corpo.add(caixa(t.toon(0x7d879f), [0.3, 0.2, 0.2], { pos: [0, y + 0.02, z + 0.16], contorno: false }));
    animados.push((tempo) => {
      chamas.forEach((c, i) => c.scale.setY(0.8 + Math.sin(tempo * 24 + i * 2) * 0.25));
    });
  },

  // ───────────── Mão ─────────────
  livro({ mao, tintas: t, medidas: m }) {
    const capa = t.toon(0x1fb5a3);
    const livro = grupo(m.livro.pos, m.livro.rot,
      caixa(capa, [0.46, 0.58, 0.11]),
      caixa(t.toon(0xffffff), [0.42, 0.53, 0.085], { pos: [0.035, 0, 0], contorno: false }),
      caixa(t.toon(0x148a7c), [0.06, 0.58, 0.115], { pos: [-0.2, 0, 0], contorno: false }),
      recorte(t.simples(0xffffff), 'estrela-livro', (f) => estrela(f, 0.11, 0.048), 0.01, { pos: [0.03, 0.04, 0.062] }),
    );
    livro.scale.setScalar(m.livro.escala);
    mao.add(livro);
  },

  pirulito({ mao, tintas: t }) {
    const doce = t.toon(0xffffff, {
      map: t.textura(128, 128, (ctx) => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#ff4f9a';
        ctx.lineWidth = 12;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 8; a += 0.1) ctx.lineTo(64 + Math.cos(a) * a * 2.4, 64 + Math.sin(a) * a * 2.4);
        ctx.stroke();
      }),
    });
    // Haste curta: o doce fica abaixo da bochecha.
    const disco = cilindro(t.toon(0xff4f9a), 0.17, 0.17, 0.06, { pos: [0.02, 0.25, 0.06], rot: [Math.PI / 2, 0, 0] });
    const face = new THREE.Mesh(geo('disco-pirulito', () => new THREE.CircleGeometry(0.157, 32)), doce);
    face.position.set(0.02, 0.25, 0.095);
    mao.add(barra(t.toon(0xffffff), [0, -0.12, 0.06], [0.02, 0.13, 0.06], 0.022), disco, face);
  },

  lapis({ mao, tintas: t }) {
    mao.add(
      // Inclinado para fora, para a ponta não entrar na cabeça
      grupo([0, 0.05, 0.08], [0.1, 0, -0.32],
        cilindro(t.toon(0xffc233), 0.075, 0.075, 0.62, { pos: [0, 0.25, 0] }, 6),
        cone(t.toon(0xf4d6a8), 0.075, 0.17, { pos: [0, 0.645, 0] }, 6),
        cone(t.toon(0x33364b), 0.03, 0.07, { pos: [0, 0.7, 0], contorno: false }, 6),
        cilindro(t.metal(0xc3cbdc), 0.078, 0.078, 0.06, { pos: [0, -0.08, 0], contorno: false }),
        cilindro(t.toon(0xff8fb1), 0.075, 0.075, 0.1, { pos: [0, -0.15, 0] }),
      ),
    );
  },

  balao({ mao, tintas: t, animados }) {
    const pivo = grupo([0, 0, 0.06]);
    pivo.add(
      barra(t.simples(0xffffff), [0, 0, 0], [0.46, 0.96, 0], 0.008),
      esfera(t.toon(0xef4444), [0.27, 0.32, 0.27], { pos: [0.5, 1.26, 0], rot: [0, 0, -0.25] }),
      cone(t.toon(0xef4444), 0.05, 0.07, { pos: [0.46, 0.95, 0], contorno: false }),
      esfera(t.simples(0xffffff, { transparent: true, opacity: 0.6 }), [0.05, 0.09, 0.02], { pos: [0.4, 1.38, 0.24], rot: [0, 0, 0.4], contorno: false }),
    );
    mao.add(pivo);
    animados.push((tempo) => {
      pivo.rotation.z = Math.sin(tempo * 1.6) * 0.09;
    });
  },

  varinha({ mao, tintas: t, animados }) {
    const luz = t.simples(0xffe27a);
    const ponta: V3 = [0.24, 0.42, 0.06];
    const astro = recorte(luz, 'estrela-varinha', (f) => estrela(f, 0.13, 0.056), 0.04, { pos: ponta });
    const faiscas = [0, 1, 2].map(() => esfera(t.simples(0xffffff), [0.025, 0.025, 0.025], { contorno: false }));
    mao.add(barra(t.toon(0x5b3a29), [0, -0.12, 0.06], ponta, 0.022), astro, ...faiscas);
    animados.push((tempo) => {
      astro.rotation.z = Math.sin(tempo * 3) * 0.3;
      faiscas.forEach((f, i) => {
        const a = tempo * 3 + (i * Math.PI * 2) / 3;
        f.position.set(ponta[0] + Math.cos(a) * 0.2, ponta[1] + Math.sin(a) * 0.2, ponta[2]);
        f.scale.setScalar(0.02 + Math.abs(Math.sin(tempo * 5 + i)) * 0.02);
      });
    });
  },

  trofeu({ mao, tintas: t }) {
    const ouro = t.metal(OURO, { emissive: 0x8a5a00, emissiveIntensity: 0.5 });
    // A base da taça apoia em cima da pata; a boca fica abaixo da bochecha
    const taca = grupo([0, 0.09, 0.02], [0.08, 0, -0.08],
      caixa(t.toon(0x5b3a29), [0.24, 0.07, 0.18], { pos: [0, 0, 0] }),
      cilindro(ouro, 0.035, 0.06, 0.16, { pos: [0, 0.11, 0] }),
      cilindro(ouro, 0.19, 0.08, 0.26, { pos: [0, 0.31, 0] }),
      recorte(t.simples(0xfff3b0), 'estrela-trofeu', (f) => estrela(f, 0.06, 0.026), 0.012, { pos: [0, 0.33, 0.15], rot: [-0.25, 0, 0] }),
    );
    for (const lado of [-1, 1]) taca.add(anel(ouro, 0.068, 0.02, { pos: [lado * 0.18, 0.33, 0] }));
    taca.scale.setScalar(0.72);
    mao.add(taca);
  },
};
