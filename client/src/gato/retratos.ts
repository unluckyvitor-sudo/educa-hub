// Retratos dos avatares para as listas (rankings, amigos, turmas), sem carregar o motor 3D junto com a página:
// o desenho (cena.ts) só é buscado quando o primeiro retrato é pedido.
import { chaveDoAvatar, type AvatarConfig } from './avatar';

const prontos = new Map<string, string>();
let cena: Promise<typeof import('./cena')> | null = null;

export function retratoPronto(avatar: AvatarConfig) {
  return prontos.get(chaveDoAvatar(avatar)) ?? null;
}

export function pedirRetrato(avatar: AvatarConfig, entregar: (url: string) => void) {
  cena ??= import('./cena');
  cena
    .then((m) =>
      m.pedirRetrato(avatar, (url) => {
        prontos.set(chaveDoAvatar(avatar), url);
        entregar(url);
      }),
    )
    .catch(() => {
      cena = null; // falha de rede ao buscar o desenho: o próximo retrato tenta de novo
    });
}
