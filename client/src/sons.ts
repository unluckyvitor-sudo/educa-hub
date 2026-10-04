// Efeitos sonoros simples gerados na hora (sem arquivos de áudio).
const CHAVE = 'educahub:som';
let contexto: AudioContext | null = null;

export const somLigado = () => localStorage.getItem(CHAVE) !== 'off';

export function alternarSom(ligado: boolean) {
  localStorage.setItem(CHAVE, ligado ? 'on' : 'off');
}

function nota(frequencia: number, inicio: number, duracao: number, tipo: OscillatorType = 'sine', volume = 0.12) {
  if (!contexto) return;
  const oscilador = contexto.createOscillator();
  const ganho = contexto.createGain();
  oscilador.type = tipo;
  oscilador.frequency.value = frequencia;
  const t = contexto.currentTime + inicio;
  ganho.gain.setValueAtTime(0, t);
  ganho.gain.linearRampToValueAtTime(volume, t + 0.015);
  ganho.gain.exponentialRampToValueAtTime(0.001, t + duracao);
  oscilador.connect(ganho).connect(contexto.destination);
  oscilador.start(t);
  oscilador.stop(t + duracao + 0.02);
}

const MELODIAS = {
  acerto: () => [660, 880, 1320].forEach((f, i) => nota(f, i * 0.08, 0.22, 'triangle')),
  erro: () => [300, 220].forEach((f, i) => nota(f, i * 0.12, 0.25, 'sawtooth', 0.07)),
  clique: () => nota(520, 0, 0.08, 'triangle', 0.08),
  virar: () => nota(400, 0, 0.06, 'sine', 0.07),
  vitoria: () => [523, 659, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.11, 0.3, 'triangle')),
  derrota: () => [392, 330, 262].forEach((f, i) => nota(f, i * 0.16, 0.34, 'sine', 0.1)),
  moeda: () => [988, 1319].forEach((f, i) => nota(f, i * 0.07, 0.2, 'square', 0.05)),
  tique: () => nota(900, 0, 0.04, 'square', 0.04),
};

export function tocar(som: keyof typeof MELODIAS) {
  if (!somLigado()) return;
  try {
    contexto ??= new AudioContext();
    if (contexto.state === 'suspended') void contexto.resume();
    MELODIAS[som]();
  } catch {
    // Sem áudio disponível: o jogo segue normalmente.
  }
}
