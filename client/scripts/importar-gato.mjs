// Importa um modelo GLB do gato para o projeto, corrigindo problemas conhecidos do arquivo:
//   node client/scripts/importar-gato.mjs caminho/do/modelo.glb
// O resultado vai para client/modelos/gato.glb (arquivo de referência; veja-o em /visor no modo dev).
// As medidas usadas pela plataforma ficam em client/src/gato/rigImportado.ts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origem = process.argv[2];
if (!origem) {
  console.error('Uso: node client/scripts/importar-gato.mjs caminho/do/modelo.glb');
  process.exit(1);
}

const MAGICA = 0x46546c67; // "glTF"
const JSON_CHUNK = 0x4e4f534a;
const dados = fs.readFileSync(origem);
if (dados.readUInt32LE(0) !== MAGICA) {
  console.error('O arquivo não é um GLB válido.');
  process.exit(1);
}

// Um GLB é: cabeçalho de 12 bytes + pedaço JSON + pedaço binário.
const tamanhoJson = dados.readUInt32LE(12);
if (dados.readUInt32LE(16) !== JSON_CHUNK) throw new Error('Primeiro pedaço do GLB não é JSON.');
const gltf = JSON.parse(dados.subarray(20, 20 + tamanhoJson).toString('utf8'));
const resto = dados.subarray(20 + tamanhoJson);

// Correção: alguns geradores gravam o nó inteiro (objeto) no alvo do canal de animação, em vez do índice.
let corrigidos = 0;
for (const animacao of gltf.animations ?? []) {
  for (const canal of animacao.channels) {
    const alvo = canal.target.node;
    if (typeof alvo === 'number') continue;
    const indice = gltf.nodes.findIndex((n) => n.name === alvo?.name);
    if (indice < 0) throw new Error(`Canal da animação "${animacao.name}" aponta para um nó desconhecido.`);
    canal.target.node = indice;
    corrigidos += 1;
  }
}

const NOS_ESPERADOS = ['Cat_Rig', 'Body', 'Head', 'Arm.L', 'Arm.R', 'EyeWhite.L', 'EyeWhite.R'];
const nomes = new Set(gltf.nodes.map((n) => n.name));
const faltando = NOS_ESPERADOS.filter((n) => !nomes.has(n));
if (faltando.length) console.warn(`Aviso: o modelo não tem os nós ${faltando.join(', ')}. Partes do gato podem não animar.`);

let json = Buffer.from(JSON.stringify(gltf), 'utf8');
if (json.length % 4) json = Buffer.concat([json, Buffer.alloc(4 - (json.length % 4), 0x20)]);
const cabecalho = Buffer.alloc(20);
cabecalho.writeUInt32LE(MAGICA, 0);
cabecalho.writeUInt32LE(2, 4);
cabecalho.writeUInt32LE(20 + json.length + resto.length, 8);
cabecalho.writeUInt32LE(json.length, 12);
cabecalho.writeUInt32LE(JSON_CHUNK, 16);

const destino = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'modelos', 'gato.glb');
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, Buffer.concat([cabecalho, json, resto]));

console.log(`Modelo importado: ${gltf.nodes.length} nós, ${gltf.meshes.length} malhas, animações: ${(gltf.animations ?? []).map((a) => a.name).join(', ') || 'nenhuma'}.`);
if (corrigidos) console.log(`${corrigidos} canal(is) de animação corrigido(s).`);
console.log(`Gravado em ${destino}`);
