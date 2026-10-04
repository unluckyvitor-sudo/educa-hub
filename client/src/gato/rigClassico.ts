// Corpo "clássico" do gato: o primeiro modelo da plataforma, com bochechas peludas, topete e moletom inteiro.
// Fica disponível trocando ESTILO_DO_GATO em modelo.ts.
import * as THREE from 'three';
import { Tintas, esfera, cone, cilindro, capsula, caixa, anel, tubo, recorte, estrela, grupo, type V3 } from './pecas';
import type { Pelagem, Roupa } from './pelagens';
import { criarSombra, criarSorriso, montarEstampa, tintasDaPelagem, type Medidas, type OpcoesDoCorpo, type Pelo, type Rig } from './rig';

const MEDIDAS: Medidas = {
  cabeca: { rx: 0.66, ry: 0.58, rz: 0.58 },
  olhos: { x: 0.255, y: 0.07, z: 0.6, giro: 0.36, raio: 0.2 },
  pescoco: { y: 0.97, rx: 0.4, rz: 0.4 },
  peito: { y: 0.68, z: 0.475 },
  costas: { z: -0.42, y: 0.78, largura: 1 },
  livro: { pos: [0.04, 0.16, 0.1], rot: [0.12, -0.35, -0.16], escala: 1 },
  orelha: { x: 0.47, y: 0.5, z: 0, raio: 0.22 },
};

function montarRoupa(t: Tintas, c: THREE.Group, roupa: Roupa, tecido: THREE.Material, pelo: Pelo) {
  const detalhe = t.toon(roupa.detalhe);
  const tronco = esfera(tecido, [0.5, 0.54, 0.43], { pos: [0, 0.74, 0] });
  c.add(tronco);
  c.add(anel(detalhe, 0.36, 0.075, { pos: [0, 0.34, 0], rot: [Math.PI / 2, 0, 0] }));

  if (roupa.tipo === 'moletom') {
    c.add(anel(tecido, 0.3, 0.115, { pos: [0, 1.07, -0.04], rot: [Math.PI / 2 - 0.22, 0, 0] }));
    c.add(esfera(tecido, [0.36, 0.25, 0.22], { pos: [0, 1.06, -0.3] }));
    c.add(esfera(detalhe, [0.24, 0.13, 0.08], { pos: [0, 0.56, 0.37], contorno: false }));
    const cordao = t.toon(0xffffff);
    for (const lado of [-1, 1]) {
      c.add(
        cilindro(cordao, 0.016, 0.016, 0.2, { pos: [lado * 0.1, 0.9, 0.4], rot: [-0.18, 0, lado * 0.06], contorno: false }),
        esfera(cordao, [0.03, 0.04, 0.03], { pos: [lado * 0.106, 0.79, 0.415], contorno: false }),
      );
    }
  } else if (roupa.tipo === 'jaleco') {
    const azul = t.toon(0x2f7df6);
    for (const lado of [-1, 1]) {
      c.add(caixa(tecido, [0.2, 0.26, 0.04], { pos: [lado * 0.13, 0.98, 0.34], rot: [-0.25, 0, lado * -0.5] }));
    }
    for (let i = 0; i < 3; i++) c.add(esfera(azul, [0.03, 0.03, 0.02], { pos: [0, 0.82 - i * 0.14, 0.42 - Math.abs(i - 1) * 0.02], contorno: false }));
    c.add(caixa(detalhe, [0.16, 0.13, 0.02], { pos: [0.24, 0.62, 0.36], rot: [0, 0.5, 0], contorno: false }));
    c.add(cilindro(azul, 0.016, 0.016, 0.14, { pos: [0.24, 0.7, 0.375], rot: [0, 0, 0.15], contorno: false }));
  } else if (roupa.tipo === 'uniforme') {
    c.add(anel(detalhe, 0.27, 0.05, { pos: [0, 1.1, 0], rot: [Math.PI / 2, 0, 0] }));
    c.add(numeroDaCamisa(t, [0, 0.74, 0.44], 0.34));
  } else {
    c.add(anel(detalhe, 0.44, 0.05, { pos: [0, 0.52, 0], rot: [Math.PI / 2, 0, 0] }));
    c.add(recorte(detalhe, 'emblema', (f) => estrela(f, 0.15, 0.065), 0.03, { pos: [0, 0.8, 0.43], rot: [-0.1, 0, 0] }));
    c.add(esfera(detalhe, [0.07, 0.06, 0.04], { pos: [0, 0.52, 0.44], contorno: false }));
  }
  // Peito claro aparecendo na gola
  c.add(esfera(pelo.clara, [0.2, 0.12, 0.1], { pos: [0, 1.03, 0.27], contorno: false }));
  return tronco;
}

/** Plaquinha com o número 10 da camisa do time. */
export function numeroDaCamisa(t: Tintas, pos: V3, tamanho: number) {
  const numero = t.simples(0xffffff, {
    transparent: true,
    map: t.textura(128, 128, (ctx) => {
      ctx.fillStyle = '#1c5fd1';
      ctx.font = '900 100px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10', 64, 70);
    }),
  });
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(tamanho, tamanho), numero);
  placa.position.set(...pos);
  return placa;
}

export function montarClassico(t: Tintas, p: Pelagem, roupa: Roupa, opcoes: OpcoesDoCorpo): Rig {
  const pelo = tintasDaPelagem(t, p);
  const tecido = t.toon(roupa.cor);
  const corpo = grupo();

  // Pernas e pés
  for (const lado of [-1, 1]) {
    corpo.add(
      esfera(pelo.pontas, [0.17, 0.2, 0.18], { pos: [lado * 0.2, 0.24, 0.02] }),
      esfera(pelo.patas, [0.17, 0.1, 0.24], { pos: [lado * 0.21, 0.1, 0.1] }),
    );
  }

  // Cauda
  const cauda = grupo([0, 0.46, -0.3]);
  const curva: V3[] = [[0, 0, 0], [0.22, 0.02, -0.26], [0.5, 0.28, -0.32], [0.6, 0.62, -0.22], [0.5, 0.88, -0.12]];
  cauda.add(tubo(pelo.pontas, 'cauda', curva, 0.085), esfera(pelo.pontaCauda, [0.105, 0.105, 0.105], { pos: curva[4] }));
  corpo.add(cauda);

  const tronco = montarRoupa(t, corpo, roupa, tecido, pelo);

  // Braços
  const bracos = [-1, 1].map((lado) => {
    const ombro = grupo([lado * 0.4, 1.0, 0.04]);
    ombro.add(
      capsula(tecido, 0.125, 0.3, { pos: [0, -0.2, 0] }),
      esfera(pelo.patas, [0.15, 0.15, 0.15], { pos: [0, -0.47, 0] }),
    );
    corpo.add(ombro);
    return ombro;
  }) as [THREE.Group, THREE.Group];
  const mao = grupo([0, -0.55, 0.06]);
  bracos[1].add(mao);

  // Cabeça
  const cab = grupo([0, 1.5, 0.03]);
  corpo.add(cab);
  cab.add(esfera(pelo.base, [0.66, 0.58, 0.58]));

  // Focinho e bochechas
  cab.add(esfera(pelo.clara, [0.42, 0.3, 0.3], { pos: [0, -0.2, 0.34], contorno: false }));
  for (const lado of [-1, 1]) {
    cab.add(
      cone(pelo.clara, 0.15, 0.34, { pos: [lado * 0.6, -0.2, 0.14], rot: [0, 0, lado * -2.05] }),
      cone(pelo.clara, 0.12, 0.28, { pos: [lado * 0.58, -0.34, 0.16], rot: [0, 0, lado * -2.5] }),
      esfera(pelo.clara, [0.125, 0.105, 0.1], { pos: [lado * 0.095, -0.18, 0.585], contorno: false }),
    );
  }
  cab.add(esfera(t.toon(p.nariz), [0.07, 0.048, 0.045], { pos: [0, -0.085, 0.64], contorno: false }));

  // Boca (abre e fecha)
  const boca = grupo([0, -0.285, 0.6]);
  boca.add(
    esfera(t.simples(0x7a1b36), [0.095, 0.085, 0.05], { contorno: false }),
    esfera(t.simples(0xff7d9c), [0.062, 0.04, 0.03], { pos: [0, -0.04, 0.025], contorno: false }),
  );
  cab.add(boca);

  // Olhos
  const escuro = t.simples(0x14152f);
  const iris = p.estampa === 'robo' ? t.simples(p.iris) : t.toon(p.iris);
  const brilho = t.simples(0xffffff);
  const pupilas: THREE.Mesh[] = [];
  const sorrisos = [-1, 1].map((lado) => {
    const arco = criarSorriso(escuro, [lado * 0.255, 0.03, 0.56], lado * 0.36, 0.115);
    cab.add(arco);
    return arco;
  });
  const olhos = [-1, 1].map((lado) => {
    const olho = grupo([lado * 0.255, 0.07, 0.505], [0, lado * 0.36, 0]);
    const pupila = esfera(escuro, [0.095, 0.122, 0.05], { pos: [0, 0, 0.05], contorno: false });
    olho.add(
      esfera(escuro, [0.168, 0.19, 0.06], { contorno: false }),
      esfera(iris, [0.146, 0.168, 0.07], { pos: [0, 0, 0.015], contorno: false }),
      pupila,
      esfera(brilho, [0.042, 0.042, 0.02], { pos: [-0.045, 0.068, 0.1], contorno: false }),
      esfera(brilho, [0.021, 0.021, 0.012], { pos: [0.042, -0.05, 0.1], contorno: false }),
    );
    pupilas.push(pupila);
    cab.add(olho);
    return olho;
  });

  // Bigodes
  const fio = t.simples(p.bigodes);
  for (const lado of [-1, 1]) {
    for (let i = -1; i <= 1; i++) {
      cab.add(cilindro(fio, 0.007, 0.004, 0.36, { pos: [lado * 0.5, -0.17 + i * 0.045, 0.44], rot: [0, lado * -0.35, lado * (Math.PI / 2 + i * 0.22)], contorno: false }, 6));
    }
  }

  // Orelhas
  const dentro = t.toon(p.orelha);
  const orelhas = [-1, 1].map((lado) => {
    const orelha = grupo([lado * 0.4, 0.38, 0]);
    orelha.add(
      cone(pelo.pontas, 0.25, 0.48, { pos: [0, 0.2, 0] }),
      cone(dentro, 0.15, 0.32, { pos: [0, 0.17, 0.085], contorno: false }),
    );
    cab.add(orelha);
    return orelha;
  }) as [THREE.Group, THREE.Group];

  // Topete (some quando há chapéu)
  if (!opcoes.semTopete) {
    cab.add(
      cone(pelo.base, 0.075, 0.22, { pos: [-0.1, 0.6, 0.12], rot: [0.2, 0, 0.45] }),
      cone(pelo.base, 0.08, 0.26, { pos: [0.0, 0.64, 0.12], rot: [0.2, 0, -0.05] }),
      cone(pelo.base, 0.07, 0.2, { pos: [0.1, 0.59, 0.12], rot: [0.2, 0, -0.55] }),
    );
  }

  montarEstampa(t, p, cab, MEDIDAS.cabeca);

  return {
    sombra: criarSombra(t, 0.62),
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
      repouso: 0.32,
      segurando: { x: -1.0, z: -0.3 },
      livroComDuasMaos: false,
      erguido: { x: 0.45, z: 2.15, vaivem: 0.3 },
      danca: { x: 0.3, z: 1.45, vaivem: 0.75 },
      cauda: { giro: 1, abano: 0.35, soParaFora: false },
      pensando: { x: -2.05, z: -0.42 },
      inclinacao: 1,
      orelhas: 0.36,
      orelhasMovem: 'livres',
      saltoComImpulso: false,
    },
  };
}
