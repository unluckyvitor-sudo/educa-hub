// Corpo principal do gato: mascote de proporções "chibi" (cabeça grande, corpo pequeno e esbelto).
// Cabeça modelada com bochechas, orelhas de ponta arredondada, olhos grandes e brilhantes,
// moletom com capuz, cordões e bolso, cauda que afina até a ponta.
// Do modelo enviado pelo usuário (client/modelos/gato.glb) ficaram os olhos com branco aparente,
// a gola do moletom em volta do pescoço e o salto com impulso.
import * as THREE from 'three';
import { Tintas, esfera, cilindro, capsula, caixa, anel, torneado, gota, modelado, tuboAfinado, recorte, estrela, barra, grupo, type V3 } from './pecas';
import type { Pelagem, Roupa } from './pelagens';
import { criarSombra, criarSorriso, montarEstampa, tintasDaPelagem, type Medidas, type OpcoesDoCorpo, type Pelo, type Rig } from './rig';
import { numeroDaCamisa } from './rigClassico';

const CABECA: V3 = [0.6, 0.56, 0.56];
const ACHATAMENTO = 0.86; // o tronco é um pouco mais largo que fundo

/** Perfil do tronco, de baixo para cima: [raio, altura]. Mais largo no quadril, estreito nos ombros. */
const PERFIL_TRONCO: [number, number][] = [
  [0, 0.27],
  [0.25, 0.285],
  [0.34, 0.37],
  [0.368, 0.52],
  [0.352, 0.68],
  [0.305, 0.84],
  [0.235, 0.95],
  [0.165, 1.03],
  [0, 1.07],
];

const MEDIDAS: Medidas = {
  cabeca: { rx: 0.65, ry: 0.55, rz: 0.58 },
  olhos: { x: 0.245, y: 0, z: 0.63, giro: 0.33, raio: 0.225 },
  // Anel estreito, entre os ombros: some sob a cabeça nas laterais e aparece à frente da gola do moletom.
  pescoco: { y: 1.0, rx: 0.2, rz: 0.27 },
  peito: { y: 0.7, z: 0.32 },
  // Itens das costas ficam atrás do capuz caído, para não atravessá-lo.
  costas: { z: -0.46, y: 0.66, largura: 0.85 },
  // O livro fica à frente da pata (que o apoia por trás e aparece na borda).
  livro: { pos: [-0.02, 0.03, 0.175], rot: [0.08, -0.2, -0.1], escala: 0.84 },
  orelha: { x: 0.405, y: 0.52, z: -0.02, raio: 0.17 },
};

/** Profundidade (z) da frente do tronco na altura y. */
function frenteDoTronco(y: number) {
  for (let i = 1; i < PERFIL_TRONCO.length; i++) {
    const [r0, y0] = PERFIL_TRONCO[i - 1];
    const [r1, y1] = PERFIL_TRONCO[i];
    if (y <= y1) return (r0 + ((r1 - r0) * (y - y0)) / (y1 - y0)) * ACHATAMENTO;
  }
  return 0;
}

/** Esfera esculpida: bochechas cheias embaixo, topo suave e queixo curto. */
function geometriaDaCabeca() {
  const g = new THREE.SphereGeometry(1, 48, 32);
  g.rotateY(-Math.PI / 2); // deixa a emenda da esfera atrás da cabeça
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const bochecha = Math.exp(-((y + 0.3) ** 2) / 0.16);
    x *= 1 + 0.13 * bochecha;
    if (z > 0) z *= 1 + 0.05 * bochecha;
    if (y > 0) y *= 0.97;
    if (y < -0.5) y = -0.5 + (y + 0.5) * 0.82;
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

function montarRoupa(t: Tintas, c: THREE.Group, roupa: Roupa, tecido: THREE.Material, detalhe: THREE.Material, pelo: Pelo) {
  const tronco = torneado(tecido, 'tronco', PERFIL_TRONCO);
  tronco.scale.z = ACHATAMENTO;
  c.add(tronco);

  // Barra da roupa
  const bainha = anel(detalhe, 0.315, 0.05, { pos: [0, 0.345, 0], rot: [Math.PI / 2, 0, 0] });
  bainha.scale.y = ACHATAMENTO;
  c.add(bainha);

  if (roupa.tipo === 'moletom') {
    // Capuz caído nas costas, gola em volta do pescoço, cordões e bolso canguru
    c.add(esfera(tecido, [0.31, 0.23, 0.19], { pos: [0, 1.0, -0.2], rot: [0.35, 0, 0] }));
    c.add(anel(tecido, 0.2, 0.075, { pos: [0, 1.01, 0.0], rot: [Math.PI / 2 - 0.18, 0, 0] }));
    c.add(esfera(detalhe, [0.2, 0.105, 0.05], { pos: [0, 0.52, frenteDoTronco(0.52) - 0.012], contorno: false }));
    const cordao = t.toon(0xffffff);
    for (const lado of [-1, 1]) {
      const topo: V3 = [lado * 0.085, 0.95, frenteDoTronco(0.95) + 0.075];
      const ponta: V3 = [lado * 0.1, 0.79, frenteDoTronco(0.79) + 0.03];
      c.add(barra(cordao, topo, ponta, 0.013), esfera(cordao, [0.024, 0.034, 0.024], { pos: [ponta[0], ponta[1] - 0.025, ponta[2]], contorno: false }));
    }
  } else if (roupa.tipo === 'jaleco') {
    const azul = t.toon(0x2f7df6);
    for (const lado of [-1, 1]) {
      c.add(caixa(tecido, [0.15, 0.2, 0.03], { pos: [lado * 0.1, 0.93, frenteDoTronco(0.93) + 0.04], rot: [-0.35, 0, lado * -0.5] }));
    }
    for (const y of [0.78, 0.64, 0.5]) c.add(esfera(azul, [0.026, 0.026, 0.018], { pos: [0, y, frenteDoTronco(y) + 0.005], contorno: false }));
    c.add(caixa(detalhe, [0.13, 0.11, 0.02], { pos: [-0.2, 0.58, frenteDoTronco(0.58) - 0.05], rot: [0, -0.6, 0], contorno: false }));
    c.add(cilindro(azul, 0.014, 0.014, 0.12, { pos: [-0.2, 0.655, frenteDoTronco(0.65) - 0.04], rot: [0, 0, 0.15], contorno: false }));
  } else if (roupa.tipo === 'uniforme') {
    c.add(anel(detalhe, 0.19, 0.045, { pos: [0, 1.01, 0.0], rot: [Math.PI / 2 - 0.1, 0, 0] }));
    c.add(numeroDaCamisa(t, [-0.03, 0.66, frenteDoTronco(0.66) + 0.012], 0.3));
  } else {
    // Herói: cinto com fivela e estrela no peito
    const cinto = anel(detalhe, 0.355, 0.04, { pos: [0, 0.46, 0], rot: [Math.PI / 2, 0, 0] });
    cinto.scale.y = ACHATAMENTO;
    c.add(cinto);
    c.add(esfera(detalhe, [0.06, 0.055, 0.035], { pos: [0, 0.46, frenteDoTronco(0.46) + 0.03], contorno: false }));
    c.add(recorte(detalhe, 'emblema', (f) => estrela(f, 0.12, 0.052), 0.025, { pos: [-0.02, 0.72, frenteDoTronco(0.72) + 0.012], rot: [-0.12, 0, 0] }));
  }

  // Tufo de pelo claro no peito, aparecendo na gola
  c.add(esfera(pelo.clara, [0.13, 0.085, 0.07], { pos: [0, 0.985, 0.17], contorno: false }));
  return tronco;
}

export function montarPrincipal(t: Tintas, p: Pelagem, roupa: Roupa, opcoes: OpcoesDoCorpo): Rig {
  const pelo = tintasDaPelagem(t, p);
  const tecido = t.toon(roupa.cor);
  const detalhe = t.toon(roupa.detalhe);
  const escuro = t.simples(0x14152f);
  const corpo = grupo();

  // Pernas curtas e pés
  for (const lado of [-1, 1]) {
    corpo.add(
      capsula(pelo.pontas, 0.105, 0.1, { pos: [lado * 0.15, 0.2, 0] }),
      esfera(pelo.patas, [0.135, 0.082, 0.19], { pos: [lado * 0.158, 0.078, 0.075] }),
    );
    for (const dedo of [-1, 1]) {
      corpo.add(esfera(escuro, [0.007, 0.03, 0.012], { pos: [lado * 0.158 + dedo * 0.042, 0.075, 0.262], rot: [0.5, 0, 0], contorno: false }));
    }
  }

  // Cauda: sai por baixo da barra do moletom, contorna pela esquerda e sobe afinando até a altura do ombro.
  // Passa por baixo e por fora dos itens das costas (mochila, jetpack, capa), atrás do plano dos braços.
  const cauda = grupo([0.04, 0.34, -0.22]);
  const curva: V3[] = [[0, 0, 0], [-0.2, -0.1, -0.04], [-0.46, -0.07, -0.05], [-0.66, 0.12, -0.05], [-0.72, 0.36, -0.04], [-0.66, 0.54, -0.03]];
  cauda.add(tuboAfinado(pelo.pontas, 'cauda-principal', curva, 0.085, 0.055));
  cauda.add(esfera(pelo.pontaCauda, [0.068, 0.068, 0.068], { pos: [-0.671, 0.508, -0.031] }));
  corpo.add(cauda);

  const tronco = montarRoupa(t, corpo, roupa, tecido, detalhe, pelo);

  // Braços: manga, punho e pata
  const bracos = [-1, 1].map((lado) => {
    const ombro = grupo([lado * 0.3, 0.92, 0.02]);
    ombro.add(
      capsula(tecido, 0.1, 0.25, { pos: [0, -0.175, 0] }),
      anel(detalhe, 0.085, 0.036, { pos: [0, -0.355, 0], rot: [Math.PI / 2, 0, 0] }),
      esfera(pelo.patas, [0.118, 0.118, 0.118], { pos: [0, -0.44, 0] }),
    );
    corpo.add(ombro);
    return ombro;
  }) as [THREE.Group, THREE.Group];
  const mao = grupo([0, -0.46, 0.05]);
  bracos[1].add(mao);

  // Cabeça
  const cab = grupo([0, 1.5, 0.02]);
  corpo.add(cab);
  cab.add(modelado(pelo.base, 'cabeca', geometriaDaCabeca, CABECA));

  // Máscara clara do focinho e bochechas
  cab.add(esfera(pelo.clara, [0.35, 0.225, 0.2], { pos: [0, -0.215, 0.37], contorno: false }));
  for (const lado of [-1, 1]) {
    cab.add(esfera(pelo.clara, [0.118, 0.095, 0.09], { pos: [lado * 0.092, -0.195, 0.53], contorno: false }));
    // Um tufo de pelo por bochecha, alto o bastante para a pata que acena passar por baixo.
    if (!opcoes.semTufos) cab.add(gota(pelo.clara, 0.095, 0.2, { pos: [lado * 0.5, -0.2, 0.18], rot: [0, 0, lado * -1.8] }));
  }

  // Nariz com brilho e boca em "w"
  cab.add(esfera(t.toon(p.nariz), [0.062, 0.042, 0.04], { pos: [0, -0.112, 0.612], contorno: false }));
  cab.add(esfera(t.simples(0xffffff, { transparent: true, opacity: 0.7 }), [0.02, 0.01, 0.008], { pos: [-0.015, -0.098, 0.648], contorno: false }));
  cab.add(barra(escuro, [0, -0.15, 0.628], [0, -0.19, 0.622], 0.008));
  for (const lado of [-1, 1]) {
    cab.add(anel(escuro, 0.042, 0.009, { pos: [lado * 0.042, -0.19, 0.628], rot: [0, 0, Math.PI], arco: Math.PI }));
  }
  const boca = grupo([0, -0.262, 0.585]);
  boca.add(
    esfera(t.simples(0x7a1b36), [0.066, 0.06, 0.035], { contorno: false }),
    esfera(t.simples(0xff7d9c), [0.044, 0.03, 0.022], { pos: [0, -0.028, 0.018], contorno: false }),
  );
  cab.add(boca);

  // Olhos grandes: contorno mais grosso em cima, branco, íris em degradê, pupila e dois brilhos
  const cor = new THREE.Color(p.iris);
  const emCima = `#${cor.clone().multiplyScalar(0.5).getHexString()}`;
  const emBaixo = `#${cor.clone().lerp(new THREE.Color(0xffffff), 0.4).getHexString()}`;
  const iris = t.simples(0xffffff, {
    map: t.textura(4, 64, (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0.22, emCima);
      g.addColorStop(0.5, `#${cor.getHexString()}`);
      g.addColorStop(0.8, emBaixo);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 4, 64);
    }),
  });
  const branco = t.simples(0xffffff);
  const pupilas: THREE.Mesh[] = [];
  const { x: ox, y: oy, giro } = MEDIDAS.olhos;
  const sorrisos = [-1, 1].map((lado) => {
    const arco = criarSorriso(escuro, [lado * ox, oy - 0.03, 0.56], lado * giro, 0.12);
    cab.add(arco);
    return arco;
  });
  const olhos = [-1, 1].map((lado) => {
    const olho = grupo([lado * ox, oy, 0.5], [0, lado * giro, 0]);
    const pupila = esfera(escuro, [0.078, 0.108, 0.04], { pos: [0, -0.005, 0.066], contorno: false });
    olho.add(
      esfera(escuro, [0.186, 0.212, 0.06], { pos: [0, 0.012, -0.014], contorno: false }),
      esfera(branco, [0.17, 0.196, 0.072], { contorno: false }),
      esfera(iris, [0.138, 0.168, 0.05], { pos: [0, -0.008, 0.042], contorno: false }),
      pupila,
      esfera(branco, [0.045, 0.05, 0.02], { pos: [-0.048, 0.07, 0.098], contorno: false }),
      esfera(branco, [0.022, 0.024, 0.012], { pos: [0.045, -0.06, 0.098], contorno: false }),
    );
    pupilas.push(pupila);
    cab.add(olho);
    return olho;
  });

  // Bigodes finos, abrindo em leque
  const fio = t.simples(p.bigodes);
  for (const lado of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      cab.add(cilindro(fio, 0.006, 0.003, 0.3, { pos: [lado * 0.43, -0.185 + i * 0.045, 0.43], rot: [0, lado * -0.4, lado * (Math.PI / 2 + i * 0.2)], contorno: false }, 6));
    }
  }

  // Orelhas de ponta arredondada, achatadas, com o interior rosado.
  // A base fica afundada na cabeça: toda a borda de baixo fica do lado de dentro, em qualquer inclinação.
  const dentro = t.toon(p.orelha);
  const orelhas = [-1, 1].map((lado) => {
    const orelha = grupo([lado * 0.3, 0.3, -0.02]);
    orelha.scale.z = 0.62;
    orelha.add(gota(pelo.pontas, 0.2, 0.55), gota(dentro, 0.125, 0.39, { pos: [0, 0.075, 0.13], contorno: false }));
    cab.add(orelha);
    return orelha;
  }) as [THREE.Group, THREE.Group];

  // Topete (some quando há chapéu)
  if (!opcoes.semTopete) {
    cab.add(
      gota(pelo.base, 0.06, 0.17, { pos: [-0.075, 0.5, 0.14], rot: [0.25, 0, 0.5] }),
      gota(pelo.base, 0.065, 0.2, { pos: [0.0, 0.52, 0.14], rot: [0.25, 0, 0] }),
      gota(pelo.base, 0.055, 0.15, { pos: [0.075, 0.5, 0.14], rot: [0.25, 0, -0.5] }),
    );
  }

  montarEstampa(t, p, cab, MEDIDAS.cabeca);

  return {
    sombra: criarSombra(t, 0.5),
    corpo,
    cabeca: cab,
    tronco: [tronco],
    bracos,
    mao,
    orelhas,
    olhos,
    pupilas,
    sorrisos,
    boca,
    cauda,
    medidas: MEDIDAS,
    ajustes: {
      repouso: 0.55,
      // Pata à frente e bem para o lado: o item sobe por fora da bochecha, sem entrar na cabeça.
      segurando: { x: -0.4, z: 0.8 },
      livroComDuasMaos: false,
      // O braço é curto e a cabeça é larga: ele acena na altura do ombro, por baixo do tufo da bochecha.
      erguido: { x: 0.75, z: 1.74, vaivem: 0.25 },
      danca: { x: 0, z: 1.3, vaivem: 0.6 },
      // A cauda fica entre o plano dos braços e o dos itens das costas: quase não balança para a frente e para trás.
      cauda: { giro: 0.1, abano: 0.5, soParaFora: true },
      // Pata erguida logo abaixo do queixo, sem entrar no focinho nem cruzar o que estiver no pescoço.
      pensando: { x: -1.45, z: -0.05 },
      inclinacao: 1,
      orelhas: 0.45,
      orelhasMovem: 'livres',
      saltoComImpulso: true,
    },
  };
}
