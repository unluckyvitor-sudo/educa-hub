// Uso: npm run backup                      → faz uma cópia de segurança agora
//      npm run backup -- --listar          → mostra as cópias guardadas
//      npm run backup -- --restaurar NOME  → volta o banco para uma cópia (com o servidor desligado)
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { db, PASTA_DADOS } from './db.js';
import { fazerCopia, listarCopias, PASTA_COPIAS } from './copias.js';

const megas = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function servidorLigado() {
  try {
    await fetch(`http://localhost:${Number(process.env.PORT) || 3001}/api/catalogo`, { signal: AbortSignal.timeout(1500) });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verdadeiro quando outro processo está com o banco aberto (o servidor, mesmo que esteja reiniciando e ainda não
 * responda): nesse caso o SQLite não deixa sair do modo WAL. É a trava que impede trocar o arquivo com ele em uso.
 */
function bancoEmUso() {
  try {
    db.exec('PRAGMA busy_timeout = 0');
    return db.prepare('PRAGMA journal_mode = DELETE').get().journal_mode !== 'delete';
  } catch {
    return true;
  }
}

/** Quantas contas há na cópia; 0 quando o arquivo está danificado ou não é um banco do EDUCA HUB. */
function contasNaCopia(arquivo) {
  try {
    const candidata = new DatabaseSync(arquivo, { readOnly: true });
    try {
      if (candidata.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') return 0;
      return candidata.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
    } finally {
      candidata.close();
    }
  } catch {
    return 0;
  }
}

/** Devolve a mensagem de erro, ou null quando deu certo. (Sem process.exit: no Windows ele falha logo depois de um fetch.) */
async function restaurar(alvo) {
  const origem = alvo && (path.isAbsolute(alvo) ? alvo : path.join(PASTA_COPIAS, alvo));
  if (!origem || !fs.existsSync(origem)) return 'Informe o nome de uma cópia existente. Veja a lista com "npm run backup -- --listar".';
  if ((await servidorLigado()) || bancoEmUso()) return 'O servidor está ligado. Pare o EDUCA HUB antes de restaurar uma cópia.';
  const contas = contasNaCopia(origem);
  if (!contas) return 'Esta cópia está danificada ou não é um banco do EDUCA HUB. Nada foi alterado.';

  const anterior = fazerCopia(); // o estado de agora também fica guardado, caso a restauração tenha sido um engano
  db.close();
  const banco = path.join(PASTA_DADOS, 'educahub.db');
  for (const sobra of ['-wal', '-shm']) fs.rmSync(banco + sobra, { force: true });
  fs.copyFileSync(origem, banco);
  console.log(`Banco restaurado a partir de ${path.basename(origem)} (${contas} contas).`);
  console.log(`O estado anterior ficou guardado em ${anterior.nome}.`);
  return null;
}

const [opcao, alvo] = process.argv.slice(2);
if (opcao === '--listar') {
  const copias = listarCopias();
  console.log(copias.length ? `Cópias em ${PASTA_COPIAS}:` : `Nenhuma cópia em ${PASTA_COPIAS}.`);
  for (const c of copias) console.log(`  ${c.nome}  ${megas(c.tamanho)}`);
} else if (opcao === '--restaurar') {
  const erro = await restaurar(alvo);
  if (erro) {
    console.error(erro);
    process.exitCode = 1;
  }
} else {
  const copia = fazerCopia();
  console.log(`Cópia de segurança gravada: ${path.join(PASTA_COPIAS, copia.nome)} (${megas(copia.tamanho)})`);
}
