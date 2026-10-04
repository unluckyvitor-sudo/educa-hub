// Página de desenvolvimento: mostra o modelo GLB do gato exatamente como foi importado (client/modelos/gato.glb),
// com os materiais e os clipes de animação originais, para comparar com a versão da plataforma. Acesse em /visor.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import arquivoDoGato from '../../modelos/gato.glb?url';

export function VisorGlb() {
  const moldura = useRef<HTMLDivElement>(null);
  const [clipes, setClipes] = useState<string[]>([]);
  const [clipe, setClipe] = useState('Idle');
  const [giro, setGiro] = useState(0);
  const tocar = useRef<(nome: string) => void>(() => {});
  const girar = useRef<(angulo: number) => void>(() => {});

  useEffect(() => {
    const caixa = moldura.current!;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setSize(caixa.clientWidth, caixa.clientHeight);
    caixa.appendChild(r.domElement);
    const cena = new THREE.Scene();
    cena.add(new THREE.HemisphereLight(0xffffff, 0xc9c2ff, 2.1));
    const sol = new THREE.DirectionalLight(0xffffff, 2.4);
    sol.position.set(-2.5, 4, 5);
    cena.add(sol);
    const camera = new THREE.PerspectiveCamera(26, caixa.clientWidth / caixa.clientHeight, 0.1, 80);
    camera.position.set(0, 2.4, 13);
    camera.lookAt(0, 2, 0);

    let mixer: THREE.AnimationMixer | null = null;
    let ativo = true;
    new GLTFLoader().load(arquivoDoGato, (gltf) => {
      if (!ativo) return;
      cena.add(gltf.scene);
      mixer = new THREE.AnimationMixer(gltf.scene);
      setClipes(gltf.animations.map((a) => a.name));
      tocar.current = (nome) => {
        mixer!.stopAllAction();
        const alvo = gltf.animations.find((a) => a.name === nome);
        if (alvo) mixer!.clipAction(alvo).play();
      };
      girar.current = (angulo) => (gltf.scene.rotation.y = angulo);
      tocar.current('Idle');
    });

    const relogio = new THREE.Clock();
    let quadro = 0;
    const desenhar = () => {
      quadro = requestAnimationFrame(desenhar);
      mixer?.update(relogio.getDelta());
      r.render(cena, camera);
    };
    desenhar();
    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      r.dispose();
      r.forceContextLoss();
      r.domElement.remove();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <div ref={moldura} style={{ width: 520, height: 560, background: '#e9e9fb', borderRadius: 24 }} />
      <div className="chips" style={{ marginTop: 10 }}>
        {clipes.map((c) => (
          <button key={c} className={`chip ${clipe === c ? 'ativo' : ''}`} onClick={() => (setClipe(c), tocar.current(c))}>
            {c}
          </button>
        ))}
        {[0, 0.8, -0.8, 3.14].map((a) => (
          <button key={a} className={`chip rosa ${giro === a ? 'ativo' : ''}`} onClick={() => (setGiro(a), girar.current(a))}>
            giro {a}
          </button>
        ))}
      </div>
    </div>
  );
}
