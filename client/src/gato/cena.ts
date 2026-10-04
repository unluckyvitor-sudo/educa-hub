// Cena, luzes e câmera usadas para desenhar o gato — ao vivo ou como retrato estático.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Gato, type AvatarConfig } from './modelo';
import { chaveDoAvatar, type Enquadramento } from './avatar';

export { chaveDoAvatar, type Enquadramento } from './avatar';

const QUADROS: Record<Enquadramento, { alvo: [number, number, number]; distancia: number }> = {
  corpo: { alvo: [0, 1.22, 0], distancia: 7.4 },
  busto: { alvo: [0, 1.42, 0], distancia: 5.4 },
  retrato: { alvo: [0, 1.7, 0], distancia: 5.7 },
};

export function criarCena(enquadramento: Enquadramento, renderizador: THREE.WebGLRenderer) {
  const cena = new THREE.Scene();
  // Ambiente de reflexos para os materiais metálicos (ouro, robô, vidro do capacete).
  const pmrem = new THREE.PMREMGenerator(renderizador);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.55;
  pmrem.dispose();
  cena.add(new THREE.HemisphereLight(0xffffff, 0xc9c2ff, 2.1));
  const sol = new THREE.DirectionalLight(0xffffff, 2.4);
  sol.position.set(-2.5, 4, 5);
  cena.add(sol);

  const { alvo, distancia } = QUADROS[enquadramento];
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, alvo[1] + 0.25, distancia);
  camera.lookAt(...alvo);
  return { cena, camera };
}

export function criarRenderizador(manterImagem = false) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: manterImagem });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.setClearColor(0x000000, 0);
  return r;
}

// ───────────── Retratos estáticos ─────────────
// Um único renderizador fora da tela desenha os retratos e devolve imagens,
// para que listas (rankings, amigos, turmas) não abram um contexto WebGL por avatar.

let estudio: { r: THREE.WebGLRenderer; cena: THREE.Scene; camera: THREE.PerspectiveCamera } | null = null;
const prontos = new Map<string, string>();
const TAMANHO = 220;

export function retratoPronto(avatar: AvatarConfig) {
  return prontos.get(chaveDoAvatar(avatar)) ?? null;
}

export function gerarRetrato(avatar: AvatarConfig) {
  const chave = chaveDoAvatar(avatar);
  const existente = prontos.get(chave);
  if (existente) return existente;

  if (!estudio) {
    const r = criarRenderizador(true);
    r.setSize(TAMANHO, TAMANHO, false);
    estudio = { r, ...criarCena('retrato', r) };
  }
  const gato = new Gato(avatar);
  gato.raiz.rotation.y = -0.18;
  gato.atualizar(1.3, 1);
  estudio.cena.add(gato.raiz);
  estudio.r.render(estudio.cena, estudio.camera);
  const imagem = estudio.r.domElement.toDataURL('image/png');
  estudio.cena.remove(gato.raiz);
  gato.descartar();

  prontos.set(chave, imagem);
  return imagem;
}

// Fila: um retrato por quadro, para não travar a página em listas longas.
const fila: { avatar: AvatarConfig; entregar: (url: string) => void }[] = [];
let processando = false;

function processarFila() {
  // Entrega na hora o que já está pronto e desenha no máximo um retrato novo por quadro.
  let desenhou = false;
  while (fila.length) {
    const pronto = retratoPronto(fila[0].avatar);
    if (!pronto && desenhou) break;
    const item = fila.shift()!;
    item.entregar(pronto ?? gerarRetrato(item.avatar));
    desenhou ||= !pronto;
  }
  if (fila.length) requestAnimationFrame(processarFila);
  else processando = false;
}

export function pedirRetrato(avatar: AvatarConfig, entregar: (url: string) => void) {
  fila.push({ avatar, entregar });
  if (!processando) {
    processando = true;
    requestAnimationFrame(processarFila);
  }
}
