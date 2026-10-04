// Sobe servidor (API + tempo real) e cliente (Vite) juntos em modo de desenvolvimento.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.dirname(fileURLToPath(import.meta.url));

// O servidor reinicia só quando algo em server/src muda. (O --watch simples também vigia node_modules,
// e a sincronização do OneDrive mexe nesses arquivos, derrubando partidas e duelos em andamento.)
const processos = [
  { nome: 'servidor', cwd: path.join(raiz, 'server'), args: ['--watch-path=src', 'src/index.js'] },
  { nome: 'cliente', cwd: path.join(raiz, 'client'), args: [path.join(raiz, 'node_modules', 'vite', 'bin', 'vite.js')] },
].map(({ nome, cwd, args }) => {
  // A API fica sempre na 3001 em desenvolvimento (é para onde o proxy do Vite aponta).
  const p = spawn(process.execPath, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: '3001' } });
  const prefixo = `[${nome}] `;
  const repassar = (saida) => (dados) =>
    saida.write(String(dados).split(/\r?\n/).filter(Boolean).map((l) => prefixo + l).join('\n') + '\n');
  p.stdout.on('data', repassar(process.stdout));
  p.stderr.on('data', repassar(process.stderr));
  p.on('exit', (codigo) => {
    console.log(`${prefixo}encerrou (código ${codigo})`);
    encerrar();
  });
  return p;
});

let encerrando = false;
function encerrar() {
  if (encerrando) return;
  encerrando = true;
  for (const p of processos) p.kill();
  process.exit();
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
