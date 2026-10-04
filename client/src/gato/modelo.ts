// O gato 3D do EducaHub: mascote da plataforma e avatar personalizável dos usuários.
// O corpo é montado com formas do Three.js (ver rigPrincipal.ts e rigClassico.ts)
// e animado aqui, por poses que se misturam suavemente.
import * as THREE from 'three';
import { Tintas } from './pecas';
import { PELAGENS, ROUPAS } from './pelagens';
import { ACESSORIOS, ESCONDEM_TOPETE, ESCONDEM_TUFOS } from './acessorios';
import { montarPrincipal } from './rigPrincipal';
import { montarClassico } from './rigClassico';
import type { Ajustes, Rig } from './rig';
import type { AvatarConfig, Animacao } from './avatar';

/**
 * Qual corpo o gato usa:
 * - 'principal': o mascote atual, de corpo esbelto e cabeça modelada.
 * - 'classico': o primeiro modelo da plataforma.
 */
export const ESTILO_DO_GATO: 'principal' | 'classico' = 'principal';

// A configuração do avatar e os nomes das animações ficam em avatar.ts, que não depende do Three.js.
export { AVATAR_PADRAO, type AvatarConfig, type Animacao } from './avatar';

interface Pose {
  pulo: number;
  /** Positivo estica o tronco para cima; negativo achata (agachamento do salto). */
  esticar: number;
  giro: number;
  balanco: number;
  cabX: number;
  cabY: number;
  cabZ: number;
  /** Braço do lado esquerdo da tela. Z abre para fora; X gira o braço para a frente ou para trás. */
  esqX: number;
  esqZ: number;
  dirX: number;
  dirZ: number;
  boca: number;
  olhos: number;
  /** Acima de 0,5 os olhos viram dois arcos sorridentes. */
  feliz: number;
  orelhas: number;
  cauda: number;
}

/** O que a pose precisa saber sobre o gato que está sendo animado. */
interface Contexto {
  a: Ajustes;
  /** A mão direita da tela segura um item. */
  dirSegura: boolean;
  /** A mão esquerda também segura (livro com as duas mãos). */
  esqSegura: boolean;
}

const NEUTRA: Pose = { pulo: 0, esticar: 0, giro: 0, balanco: 0, cabX: 0, cabY: 0, cabZ: 0, esqX: 0, esqZ: 0.32, dirX: 0, dirZ: 0.32, boca: 0.55, olhos: 1, feliz: 0, orelhas: 0, cauda: 0.28 };

/** Pose neutra com os braços soltos na abertura de repouso do modelo. */
const neutra = (c: Contexto): Pose => ({ ...NEUTRA, esqZ: c.a.repouso, dirZ: c.a.repouso });
const direitoSegurando = (c: Contexto) => (c.dirSegura ? { dirX: c.a.segurando.x, dirZ: c.a.segurando.z } : null);
const esquerdoSegurando = (c: Contexto) => (c.esqSegura ? { esqX: c.a.segurando.x, esqZ: c.a.segurando.z } : null);

/** Interpola valores entre quadros-chave, com entrada e saída suaves. */
function quadros(t: number, tempos: number[], valores: number[]) {
  for (let i = 1; i < tempos.length; i++) {
    if (t <= tempos[i]) {
      const f = (t - tempos[i - 1]) / (tempos[i] - tempos[i - 1]);
      const suave = f * f * (3 - 2 * f);
      return valores[i - 1] + (valores[i] - valores[i - 1]) * suave;
    }
  }
  return valores[valores.length - 1];
}

// Salto inspirado no clipe "Jump" do modelo enviado pelo usuário: agacha, sobe esticando, cai e amortece.
const SALTO = { duracao: 1.25, tempos: [0, 0.25, 0.55, 0.9, 1.25], altura: [0, 0.03, 0.4, 0.03, 0], esticar: [0, -1, 0.7, -0.9, 0] };

const POSES: Record<Animacao, (t: number, c: Contexto) => Pose> = {
  parado: (t, c) => ({
    ...neutra(c),
    pulo: Math.sin(t * 2) * 0.012,
    balanco: Math.sin(t * 1.3) * 0.015,
    cabY: Math.sin(t * 0.7) * 0.06,
    cabZ: Math.sin(t * 1.1) * 0.04,
    esqZ: c.a.repouso + Math.sin(t * 2) * 0.03,
    ...esquerdoSegurando(c),
    ...direitoSegurando(c),
  }),
  acenar: (t, c) => ({
    ...neutra(c),
    pulo: Math.abs(Math.sin(t * 4.5)) * 0.03,
    balanco: 0.03,
    cabZ: -0.12,
    esqX: c.a.erguido.x,
    esqZ: c.a.erguido.z + Math.sin(t * 9) * c.a.erguido.vaivem,
    ...direitoSegurando(c),
    boca: 1,
    cauda: 0.45,
  }),
  comemorar: (t, c) => {
    const fase = t % SALTO.duracao;
    const salto = c.a.saltoComImpulso
      ? { pulo: quadros(fase, SALTO.tempos, SALTO.altura), esticar: quadros(fase, SALTO.tempos, SALTO.esticar) }
      : { pulo: Math.abs(Math.sin(t * 6)) * 0.3, esticar: 0 };
    return {
      ...neutra(c),
      ...salto,
      balanco: Math.sin(t * 6) * 0.05,
      cabX: -0.12,
      cabZ: Math.sin(t * 6) * 0.07,
      esqX: c.a.erguido.x,
      esqZ: c.a.erguido.z + Math.sin(t * 12) * c.a.erguido.vaivem * 0.75,
      dirX: c.a.erguido.x,
      dirZ: c.a.erguido.z - Math.sin(t * 12) * c.a.erguido.vaivem * 0.75,
      ...direitoSegurando(c),
      boca: 1,
      feliz: 1,
      cauda: 0.7,
    };
  },
  triste: (t, c) => ({
    ...neutra(c),
    pulo: -0.02,
    esticar: -0.35,
    balanco: Math.sin(t * 1.2) * 0.02,
    cabX: 0.3,
    cabY: Math.sin(t * 0.9) * 0.1,
    cabZ: 0.06,
    ...esquerdoSegurando(c),
    ...direitoSegurando(c),
    boca: 0.06,
    olhos: 0.55,
    orelhas: 1,
    cauda: 0.05,
  }),
  pensar: (t, c) => ({
    ...neutra(c),
    cabX: -0.06,
    cabY: 0.22,
    // A cabeça pende para o lado da pata que pensa.
    cabZ: 0.13 + Math.sin(t * 1.5) * 0.03,
    esqX: c.a.pensando.x,
    esqZ: c.a.pensando.z,
    ...direitoSegurando(c),
    boca: 0.12,
    olhos: 0.9,
    orelhas: 0.15,
    cauda: 0.15,
  }),
  dancar: (t, c) => ({
    ...neutra(c),
    pulo: Math.abs(Math.sin(t * 5)) * 0.1,
    esticar: Math.sin(t * 10) * 0.25,
    giro: Math.sin(t * 2.5) * 0.35,
    balanco: Math.sin(t * 5) * 0.14,
    // A cabeça pende para o lado do braço que desce, abrindo espaço para o que sobe.
    cabZ: Math.sin(t * 5) * -0.12,
    esqX: c.a.danca.x,
    esqZ: c.a.danca.z + Math.sin(t * 5) * c.a.danca.vaivem,
    dirX: c.a.danca.x,
    dirZ: c.a.danca.z - Math.sin(t * 5) * c.a.danca.vaivem,
    ...direitoSegurando(c),
    boca: 0.9,
    feliz: Math.sin(t * 2.5) > 0.3 ? 1 : 0,
    cauda: 0.6,
  }),
  surpreso: (t, c) => ({
    ...neutra(c),
    pulo: Math.abs(Math.sin(t * 8)) * 0.05,
    esticar: 0.4,
    cabX: -0.1,
    esqX: 0.2,
    esqZ: 1.1,
    dirX: 0.2,
    dirZ: 1.1,
    ...direitoSegurando(c),
    boca: 0.95,
    olhos: 1.18,
    orelhas: -0.25,
    cauda: 0.1,
  }),
};

export class Gato {
  readonly raiz = new THREE.Group();
  animacao: Animacao = 'parado';

  private tintas = new Tintas();
  private animados: ((t: number) => void)[] = [];
  rig!: Rig;
  private contexto!: Contexto;
  private escalasDoTronco: THREE.Vector3[] = [];
  private alturaDaCabeca = 0;
  private alturaDosOmbros = 0;
  private pose: Pose = { ...NEUTRA };
  private olhar = { x: 0, y: 0 };
  private olharAlvo = { x: 0, y: 0 };

  constructor(config: AvatarConfig) {
    this.montar(config);
  }

  /** Para onde o gato olha, em coordenadas de -1 a 1 (0,0 = para a frente). */
  olharPara(x: number, y: number) {
    this.olharAlvo.x = THREE.MathUtils.clamp(x, -1, 1);
    this.olharAlvo.y = THREE.MathUtils.clamp(y, -1, 1);
  }

  /** Refaz o gato com outro visual, mantendo a animação atual. */
  montar(config: AvatarConfig) {
    this.raiz.clear();
    this.tintas.descartar();
    this.animados = [];

    const pelagem = PELAGENS[config.pelagem] ?? PELAGENS.smoking;
    const roupa = ROUPAS[config.roupa] ?? ROUPAS['moletom-roxo'];
    const opcoes = { semTopete: !!config.cabeca && ESCONDEM_TOPETE.has(config.cabeca), semTufos: !!config.cabeca && ESCONDEM_TUFOS.has(config.cabeca) };
    const rig = (this.rig = ESTILO_DO_GATO === 'principal' ? montarPrincipal(this.tintas, pelagem, roupa, opcoes) : montarClassico(this.tintas, pelagem, roupa, opcoes));
    this.alturaDaCabeca = rig.cabeca.position.y;
    this.alturaDosOmbros = rig.bracos[0].position.y;
    this.raiz.add(rig.sombra, rig.corpo);
    this.escalasDoTronco = rig.tronco.map((m) => m.scale.clone());
    // O item fica sempre em pé: a cada quadro a mão desfaz a rotação do braço (ver atualizar).
    rig.mao.rotation.order = 'ZYX';

    // Cada peça guarda de quem é ('corpo' ou o id do acessório); a verificação de colisões usa isso.
    const marcar = (dono: string) => rig.corpo.traverse((o) => (o.userData.dono ??= dono));
    marcar('corpo');
    for (const id of [config.cabeca, config.rosto, config.pescoco, config.costas, config.mao]) {
      if (!id) continue;
      ACESSORIOS[id]?.({ cabeca: rig.cabeca, corpo: rig.corpo, mao: rig.mao, tintas: this.tintas, medidas: rig.medidas, ajustes: rig.ajustes, animados: this.animados });
      marcar(id);
    }
    const dirSegura = !!config.mao && !!ACESSORIOS[config.mao];
    this.contexto = { a: rig.ajustes, dirSegura, esqSegura: dirSegura && config.mao === 'livro' && rig.ajustes.livroComDuasMaos };
  }

  /** Avança a animação. `t` é o tempo total em segundos e `dt` o intervalo desde o último quadro. */
  atualizar(t: number, dt: number) {
    const rig = this.rig;
    const alvo = POSES[this.animacao](t, this.contexto);
    const mistura = 1 - Math.exp(-dt * 11);
    const pose = this.pose;
    for (const k in alvo) {
      const chave = k as keyof Pose;
      pose[chave] += (alvo[chave] - pose[chave]) * mistura;
    }
    this.olhar.x += (this.olharAlvo.x - this.olhar.x) * mistura;
    this.olhar.y += (this.olharAlvo.y - this.olhar.y) * mistura;

    rig.corpo.position.y = pose.pulo;
    rig.corpo.rotation.set(0, pose.giro, pose.balanco);
    const encolhe = 1 - Math.max(0, pose.pulo) * 1.1;
    rig.sombra.scale.set(encolhe, encolhe, 1);

    // Achata e estica o tronco; a cabeça acompanha a altura para não descolar do corpo.
    const vertical = 1 + pose.esticar * 0.08;
    const lateral = 1 - pose.esticar * 0.05;
    for (const [i, malha] of rig.tronco.entries()) {
      const base = this.escalasDoTronco[i];
      malha.scale.set(base.x * lateral, base.y * vertical, base.z * lateral);
    }

    rig.cabeca.position.y = this.alturaDaCabeca + pose.esticar * 0.045;
    rig.cabeca.rotation.set(pose.cabX - this.olhar.y * 0.2, pose.cabY + this.olhar.x * 0.38, pose.cabZ * rig.ajustes.inclinacao);

    const [esq, dir] = rig.bracos;
    // Os ombros descem e sobem com o tronco, para a cabeça não pousar nos braços no agachamento.
    esq.position.y = dir.position.y = this.alturaDosOmbros + pose.esticar * 0.045;
    esq.rotation.set(pose.esqX, 0, -pose.esqZ);
    dir.rotation.set(pose.dirX, 0, pose.dirZ);
    rig.mao.rotation.set(-pose.dirX, 0, -pose.dirZ);

    // Piscada rápida a cada poucos segundos
    const fase = (t + 0.4) % 3.7;
    const piscada = fase < 0.13 ? Math.abs(fase - 0.065) / 0.065 : 1;
    const radiante = pose.feliz > 0.5;
    for (const [i, olho] of rig.olhos.entries()) {
      olho.visible = !radiante;
      rig.sorrisos[i].visible = radiante;
      olho.scale.y = Math.max(0.07, pose.olhos * piscada);
      const base = rig.pupilas[i].userData.base as THREE.Vector3 | undefined;
      const origem = base ?? (rig.pupilas[i].userData.base = rig.pupilas[i].position.clone());
      const pensando = this.animacao === 'pensar' ? 0.03 : 0;
      rig.pupilas[i].position.x = origem.x + this.olhar.x * 0.035;
      rig.pupilas[i].position.y = origem.y + this.olhar.y * 0.035 + pensando;
    }

    rig.boca.scale.set(1 - pose.boca * 0.12, 0.1 + pose.boca * 0.9, 1);

    const { orelhas: repouso, orelhasMovem } = rig.ajustes;
    let mexida = pose.orelhas * 0.6;
    let tremida = Math.sin(t * 1.7) > 0.96 ? Math.sin(t * 40) * 0.08 : 0;
    if (orelhasMovem === 'presas') mexida = tremida = 0;
    else if (orelhasMovem === 'so-abrem') [mexida, tremida] = [Math.max(mexida, 0), Math.abs(tremida)];
    rig.orelhas[0].rotation.z = repouso + mexida + tremida;
    rig.orelhas[1].rotation.z = -repouso - mexida;

    const { giro, abano, soParaFora } = rig.ajustes.cauda;
    const vai = Math.sin(t * 2.1);
    rig.cauda.rotation.y = Math.sin(t * 3.2) * pose.cauda * giro;
    rig.cauda.rotation.z = (soParaFora ? 0.5 + 0.5 * vai : vai) * pose.cauda * abano;

    for (const animar of this.animados) animar(t);
  }

  descartar() {
    this.raiz.clear();
    this.tintas.descartar();
  }
}
