// Peças comuns aos dois corpos do gato (o modelo importado e o clássico):
// o "rig" que a animação controla, as medidas usadas pelos acessórios e as tintas da pelagem.
import * as THREE from 'three';
import { Tintas, esfera, cilindro, caixa, anel, geo, type V3 } from './pecas';
import type { Pelagem } from './pelagens';

/** Medidas do corpo que os acessórios usam para se encaixar em qualquer modelo. */
export interface Medidas {
  /** Semieixos da cabeça. */
  cabeca: { rx: number; ry: number; rz: number };
  /** Centro de cada olho (x espelhado), profundidade das lentes, giro para fora e raio do aro. */
  olhos: { x: number; y: number; z: number; giro: number; raio: number };
  /** Altura e semieixos de um anel em volta do pescoço. */
  pescoco: { y: number; rx: number; rz: number };
  /** Ponto do peito onde ficam medalhas. */
  peito: { y: number; z: number };
  /** Costas: profundidade logo atrás do corpo (e do capuz), altura do meio das costas e fator de largura. */
  costas: { z: number; y: number; largura: number };
  /** Posição do livro em relação à mão que o segura. */
  livro: { pos: V3; rot: V3; escala: number };
  /** Ponto em que cada orelha sai de um capacete justo (x espelhado) e o raio do furo. */
  orelha: { x: number; y: number; z: number; raio: number };
}

/** O que o corpo deixa de mostrar por causa do que o gato veste na cabeça. */
export interface OpcoesDoCorpo {
  semTopete: boolean;
  /** Sem os tufos de pelo das bochechas (capacetes justos). */
  semTufos: boolean;
}

/** Ângulos de braço e detalhes de animação próprios de cada modelo. */
export interface Ajustes {
  /** Abertura dos braços soltos ao lado do corpo (o bastante para a pata não entrar no quadril). */
  repouso: number;
  /** Braço dobrado à frente, segurando o item. */
  segurando: { x: number; z: number };
  /** O livro é segurado com as duas mãos, ao centro. */
  livroComDuasMaos: boolean;
  /** Braço erguido para acenar e comemorar; `vaivem` é o quanto ele balança sem encostar na cabeça. */
  erguido: { x: number; z: number; vaivem: number };
  /** Braços na dança: abertura média, o quanto sobem e descem e o giro para trás. */
  danca: { x: number; z: number; vaivem: number };
  /**
   * Abano da cauda: `giro` balança para a frente e para trás, `abano` levanta e abaixa.
   * Com `soParaFora`, o abano só afasta a cauda do corpo (quando ela fica ao lado dele).
   */
  cauda: { giro: number; abano: number; soParaFora: boolean };
  /** Braço com a pata no queixo. */
  pensando: { x: number; z: number };
  /** Quanto a cabeça pode pender para os lados (1 = à vontade). */
  inclinacao: number;
  /** Inclinação das orelhas em repouso. */
  orelhas: number;
  /** 'so-abrem': as orelhas não fecham sobre um chapéu. 'presas': ficam paradas nos furos do capacete. */
  orelhasMovem: 'livres' | 'so-abrem' | 'presas';
  /** O salto de comemoração tem agachamento e esticada (em vez de quiques rápidos). */
  saltoComImpulso: boolean;
}

/** Pontos de encaixe entregues aos acessórios. */
export interface Encaixes {
  cabeca: THREE.Group;
  corpo: THREE.Group;
  mao: THREE.Group;
  tintas: Tintas;
  medidas: Medidas;
  /** Ajustes de animação deste gato; o acessório pode alterá-los para abrir espaço para si. */
  ajustes: Ajustes;
  /** Funções chamadas a cada quadro (asas batendo, chamas, brilhos). */
  animados: ((t: number) => void)[];
}

/** As partes móveis de um gato montado. */
export interface Rig {
  sombra: THREE.Mesh;
  corpo: THREE.Group;
  cabeca: THREE.Group;
  /** Malhas do tronco, achatadas e esticadas nos saltos. */
  tronco: THREE.Object3D[];
  /** [esquerdo da tela, direito da tela]. O direito segura o item da mão. */
  bracos: [THREE.Group, THREE.Group];
  mao: THREE.Group;
  orelhas: [THREE.Group, THREE.Group];
  olhos: THREE.Group[];
  pupilas: THREE.Mesh[];
  /** Arcos que substituem os olhos quando o gato está radiante (^ ^). */
  sorrisos: THREE.Mesh[];
  boca: THREE.Group;
  cauda: THREE.Group;
  medidas: Medidas;
  ajustes: Ajustes;
}

export interface Pelo {
  base: THREE.Material;
  clara: THREE.Material;
  pontas: THREE.Material;
  patas: THREE.Material;
  pontaCauda: THREE.Material;
}

export function tintasDaPelagem(t: Tintas, p: Pelagem): Pelo {
  let base: THREE.Material;
  switch (p.estampa) {
    case 'arcoiris':
      base = t.toon(0xffffff, {
        map: t.textura(8, 256, (ctx) => {
          const g = ctx.createLinearGradient(0, 0, 0, 256);
          ['#ff4d6d', '#ff9a3c', '#ffe14d', '#4ade80', '#38bdf8', '#a78bfa', '#ff4d6d'].forEach((c, i, l) => g.addColorStop(i / (l.length - 1), c));
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 8, 256);
        }),
      });
      break;
    case 'galaxia':
      base = t.toon(0xffffff, {
        map: t.textura(256, 256, (ctx) => {
          const g = ctx.createLinearGradient(0, 0, 256, 256);
          g.addColorStop(0, '#2b1a8f');
          g.addColorStop(0.5, '#7b2fd6');
          g.addColorStop(1, '#1b3fb5');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 256, 256);
          for (let i = 0; i < 90; i++) {
            ctx.fillStyle = i % 5 === 0 ? '#ffe27a' : '#ffffff';
            ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            ctx.beginPath();
            ctx.arc(Math.random() * 256, Math.random() * 256, 0.6 + Math.random() * 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }),
        emissive: 0x2a1470,
        emissiveIntensity: 0.5,
      });
      break;
    case 'robo':
      base = t.metal(p.base);
      break;
    case 'ouro':
      base = t.metal(p.base, { emissive: 0x8a5a00, emissiveIntensity: 0.45, metalness: 0.6, roughness: 0.25 });
      break;
    case 'neon':
      base = t.toon(p.base, { emissive: 0x1238c9, emissiveIntensity: 0.6 });
      break;
    default:
      base = t.toon(p.base);
  }
  return {
    base,
    clara: t.toon(p.clara),
    pontas: p.pontas === p.base ? base : t.toon(p.pontas),
    patas: t.toon(p.patas),
    pontaCauda: p.estampa === 'robo' || p.estampa === 'neon' ? t.toon(p.pontaCauda, { emissive: p.pontaCauda, emissiveIntensity: 0.7 }) : t.toon(p.pontaCauda),
  };
}

export function criarSombra(t: Tintas, raio: number) {
  const sombra = new THREE.Mesh(geo(`sombra:${raio}`, () => new THREE.CircleGeometry(raio, 32)), t.simples(0x1a1c44, { transparent: true, opacity: 0.16 }));
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = 0.005;
  return sombra;
}

/** Listras, manchas e detalhes de robô desenhados sobre a cabeça. */
export function montarEstampa(t: Tintas, p: Pelagem, cab: THREE.Group, cabeca: Medidas['cabeca']) {
  if (p.estampa === 'listras') {
    const listra = t.toon(0xd9742a);
    for (let i = -1; i <= 1; i++) {
      cab.add(esfera(listra, [0.035, 0.13 - Math.abs(i) * 0.03, 0.03], { pos: [i * 0.11, 0.44 - Math.abs(i) * 0.03, 0.4 - Math.abs(i) * 0.02], rot: [-0.7, 0, i * -0.25], contorno: false }));
    }
  } else if (p.estampa === 'manchas') {
    cab.add(
      esfera(t.toon(0xf79a3e), [0.3, 0.26, 0.2], { pos: [-0.3, 0.3, 0.3], contorno: false }),
      esfera(t.toon(0x2a2b45), [0.28, 0.24, 0.2], { pos: [0.34, 0.3, 0.26], contorno: false }),
    );
  } else if (p.estampa === 'robo') {
    const luz = t.simples(0x5ee6ff);
    cab.add(
      cilindro(t.metal(0x7d879f), 0.015, 0.015, 0.26, { pos: [0, cabeca.ry + 0.1, 0], contorno: false }),
      esfera(luz, [0.05, 0.05, 0.05], { pos: [0, cabeca.ry + 0.25, 0], contorno: false }),
      caixa(luz, [0.3, 0.025, 0.02], { pos: [0, 0.36, 0.5], rot: [-0.55, 0, 0], contorno: false }),
    );
    for (const lado of [-1, 1]) cab.add(cilindro(t.metal(0x7d879f), 0.07, 0.07, 0.05, { pos: [lado * cabeca.rx, 0.02, 0.05], rot: [0, 0, Math.PI / 2], contorno: false }));
  }
}

/** Arco escuro (meia-lua para cima) que representa o olho fechado de alegria. */
export function criarSorriso(mat: THREE.Material, pos: V3, giro: number, raio: number) {
  const arco = anel(mat, raio, raio * 0.3, { pos, rot: [0, giro, 0], arco: Math.PI });
  arco.visible = false;
  return arco;
}
