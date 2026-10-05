// Abre um endereço público temporário (com HTTPS) para a plataforma que roda neste computador, usando o cloudflared.
// Uso: npm run tunel      (Ctrl+C encerra o endereço; o computador precisa ficar ligado enquanto os testes durarem)
import { spawn, spawnSync } from 'node:child_process';
import { Resolver } from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.dirname(fileURLToPath(import.meta.url));
const PORTA = Number(process.env.PORT) || 3001;
const LOCAL = `http://localhost:${PORTA}`;
const filhos = [];

function encerrar(codigo = 0) {
  for (const f of filhos) f.kill();
  process.exit(codigo);
}
process.on('SIGINT', () => encerrar());
process.on('SIGTERM', () => encerrar());

/** O programa do túnel: no PATH ou na pasta em que o instalador do Windows costuma colocá-lo. */
function acharCloudflared() {
  const candidatos = ['cloudflared', 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe', 'C:\\Program Files\\cloudflared\\cloudflared.exe'];
  return candidatos.find((c) => spawnSync(c, ['--version'], { stdio: 'ignore' }).status === 0) ?? null;
}

async function servidorResponde() {
  try {
    return (await fetch(`${LOCAL}/api/catalogo`, { signal: AbortSignal.timeout(1500) })).ok;
  } catch {
    return false;
  }
}

const cloudflared = acharCloudflared();
if (!cloudflared) {
  console.error('O cloudflared não está instalado. Instale com:\n\n  winget install --id Cloudflare.cloudflared -e\n\ne rode "npm run tunel" de novo (em um terminal aberto depois da instalação).');
  process.exit(1);
}
if (!fs.existsSync(path.join(raiz, 'client', 'dist', 'index.html'))) {
  console.error('Falta construir a interface. Rode "npm run build" e depois "npm run tunel".');
  process.exit(1);
}

// Usa o servidor que já estiver ligado nesta porta; senão, liga um.
if (await servidorResponde()) {
  console.log(`Usando o servidor que já está ligado em ${LOCAL}.`);
} else {
  console.log('Ligando o servidor...');
  const servidor = spawn(process.execPath, ['src/index.js'], { cwd: path.join(raiz, 'server'), stdio: 'inherit', env: { ...process.env, PORT: String(PORTA) } });
  filhos.push(servidor);
  servidor.on('exit', (codigo) => {
    console.error(`O servidor encerrou (código ${codigo}).`);
    encerrar(1);
  });
  for (let i = 0; i < 40 && !(await servidorResponde()); i++) await new Promise((ok) => setTimeout(ok, 500));
  if (!(await servidorResponde())) {
    console.error('O servidor não respondeu. Veja as mensagens acima.');
    encerrar(1);
  }
}

/** Espera o nome novo existir no DNS público: abrir o endereço cedo demais faz o DNS da rede guardar um "não existe" por cerca de um minuto. */
async function esperarNome(endereco) {
  const dns = new Resolver({ timeout: 2000, tries: 1 });
  dns.setServers(['1.1.1.1', '8.8.8.8']);
  for (let i = 0; i < 30; i++) {
    try {
      await dns.resolve4(new URL(endereco).hostname);
      return;
    } catch {
      await new Promise((ok) => setTimeout(ok, 1000));
    }
  }
}

console.log('Abrindo o endereço público...');
const tunel = spawn(cloudflared, ['tunnel', '--no-autoupdate', '--url', LOCAL], { stdio: ['ignore', 'pipe', 'pipe'] });
filhos.push(tunel);
let anunciado = false;
const ler = async (dados) => {
  const endereco = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(String(dados))?.[0];
  if (!endereco || anunciado) return;
  anunciado = true;
  await esperarNome(endereco);
  console.log(
    [
      '',
      '══════════════════════════════════════════════════════════════',
      `  EDUCA HUB no ar em:  ${endereco}`,
      '══════════════════════════════════════════════════════════════',
      '  • O endereço vale enquanto esta janela ficar aberta e muda a cada vez que o túnel é ligado.',
      '  • Os dados ficam neste computador, que precisa continuar ligado.',
      '  • Quem tiver o endereço chega à tela de entrada: antes de divulgar, troque a senha',
      '    inicial do administrador e exclua as contas de demonstração.',
      '  • Para encerrar: Ctrl+C.',
      '',
    ].join('\n'),
  );
};
tunel.stdout.on('data', ler);
tunel.stderr.on('data', ler);
tunel.on('exit', (codigo) => {
  console.error(anunciado ? 'O endereço público foi encerrado.' : `O cloudflared encerrou sem abrir o endereço (código ${codigo}). Confira a conexão com a internet.`);
  encerrar(anunciado ? 0 : 1);
});
