import { useEffect, useRef } from 'react';
import { Gato, type AvatarConfig, type Animacao } from './modelo';
import { criarCena, criarRenderizador, chaveDoAvatar, type Enquadramento } from './cena';

interface Props {
  avatar: AvatarConfig;
  animacao?: Animacao;
  enquadramento?: Enquadramento;
  /** A cabeça acompanha o ponteiro do mouse. */
  seguirMouse?: boolean;
  /** Permite girar o gato arrastando (usado no provador de roupas). */
  girarArrastando?: boolean;
  /** Ângulo do gato em radianos (0 = de frente). */
  giro?: number;
  className?: string;
  onClick?: () => void;
}

/** Gato 3D animado em tempo real. Use poucos por página; para listas, prefira <Retrato>. */
export function GatoVivo({ avatar, animacao = 'parado', enquadramento = 'corpo', seguirMouse = false, girarArrastando = false, giro = 0, className, onClick }: Props) {
  const moldura = useRef<HTMLDivElement>(null);
  const gato = useRef<Gato | null>(null);
  const avatarAtual = useRef(avatar);
  avatarAtual.current = avatar;
  const animacaoAtual = useRef(animacao);
  animacaoAtual.current = animacao;

  useEffect(() => {
    const caixa = moldura.current!;
    // Cada montagem cria a própria tela: assim o contexto WebGL pode ser liberado ao desmontar.
    const renderizador = criarRenderizador();
    const tela = renderizador.domElement;
    tela.style.cssText = 'width:100%;height:100%;display:block';
    caixa.appendChild(tela);
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const { cena, camera } = criarCena(enquadramento, renderizador);
    const g = (gato.current = new Gato(avatarAtual.current));
    g.animacao = animacaoAtual.current;
    cena.add(g.raiz);

    const ajustar = () => {
      const { clientWidth: l, clientHeight: a } = caixa;
      if (!l || !a) return;
      renderizador.setSize(l, a, false);
      camera.aspect = l / a;
      camera.updateProjectionMatrix();
    };
    const observadorTamanho = new ResizeObserver(ajustar);
    observadorTamanho.observe(caixa);
    ajustar();

    let visivel = true;
    const observadorVisao = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    observadorVisao.observe(caixa);

    const aoMover = (e: PointerEvent) => {
      const r = caixa.getBoundingClientRect();
      g.olharPara((e.clientX - (r.left + r.width / 2)) / 420, (r.top + r.height * 0.35 - e.clientY) / 420);
    };
    if (seguirMouse) window.addEventListener('pointermove', aoMover);

    let arrastando: number | null = null;
    const aoPressionar = (e: PointerEvent) => {
      arrastando = e.clientX;
      tela.setPointerCapture(e.pointerId);
    };
    const aoArrastar = (e: PointerEvent) => {
      if (arrastando === null) return;
      g.raiz.rotation.y += (e.clientX - arrastando) * 0.012;
      arrastando = e.clientX;
    };
    const aoSoltar = () => (arrastando = null);
    if (girarArrastando) {
      tela.addEventListener('pointerdown', aoPressionar);
      tela.addEventListener('pointermove', aoArrastar);
      tela.addEventListener('pointerup', aoSoltar);
      tela.addEventListener('pointercancel', aoSoltar);
    }

    let quadro = 0;
    let anterior = performance.now();
    const inicio = anterior;
    const desenhar = (agora: number) => {
      quadro = requestAnimationFrame(desenhar);
      const dt = Math.min((agora - anterior) / 1000, 0.1);
      anterior = agora;
      if (!visivel || document.hidden) return;
      g.atualizar((agora - inicio) / 1000, dt);
      renderizador.render(cena, camera);
    };
    quadro = requestAnimationFrame(desenhar);

    return () => {
      cancelAnimationFrame(quadro);
      observadorTamanho.disconnect();
      observadorVisao.disconnect();
      window.removeEventListener('pointermove', aoMover);
      g.descartar();
      cena.environment?.dispose();
      renderizador.dispose();
      renderizador.forceContextLoss();
      tela.remove();
      gato.current = null;
    };
  }, [enquadramento, seguirMouse, girarArrastando]);

  const chave = chaveDoAvatar(avatar);
  useEffect(() => {
    gato.current?.montar(avatarAtual.current);
  }, [chave]);

  useEffect(() => {
    if (gato.current) gato.current.animacao = animacao;
  }, [animacao]);

  useEffect(() => {
    if (gato.current) gato.current.raiz.rotation.y = giro;
  }, [giro, enquadramento]);

  return (
    <div
      ref={moldura}
      className={className}
      onClick={onClick}
      style={{ touchAction: girarArrastando ? 'none' : undefined, cursor: girarArrastando ? 'grab' : onClick ? 'pointer' : undefined }}
    />
  );
}
