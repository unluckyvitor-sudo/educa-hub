// Define (ou redefine) a senha do administrador: npm run admin:senha
import readline from 'node:readline/promises';
import { db } from './db.js';
import { gerarHash, encerrarSessoesDoUsuario } from './auth.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const senha = await rl.question('Nova senha do administrador (mínimo 8 caracteres): ');
rl.close();

if (senha.length < 8) {
  console.error('Senha muito curta. Nada foi alterado.');
  process.exit(1);
}

const hash = await gerarHash(senha);
const admin = db.prepare("SELECT id FROM usuarios WHERE usuario = 'admin'").get();
if (admin) {
  db.prepare("UPDATE usuarios SET senha_hash = ?, papel = 'admin', status = 'ativo' WHERE id = ?").run(hash, admin.id);
  encerrarSessoesDoUsuario(admin.id);
} else {
  db.prepare("INSERT INTO usuarios (papel, nome, usuario, senha_hash) VALUES ('admin', 'Administrador', 'admin', ?)").run(hash);
}
console.log('Senha do usuário "admin" atualizada.');
