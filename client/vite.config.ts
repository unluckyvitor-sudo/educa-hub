import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SERVIDOR = 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // acessível por outros aparelhos da mesma rede
    port: 5173,
    strictPort: true,
    // xfwd repassa o IP de quem acessa: sem ele, o servidor veria todos os aparelhos da rede como um só
    // e o limite de tentativas de login de um aluno travaria o de todos os outros.
    proxy: {
      '/api': { target: SERVIDOR, xfwd: true },
      '/socket.io': { target: SERVIDOR, ws: true, xfwd: true },
    },
  },
});
