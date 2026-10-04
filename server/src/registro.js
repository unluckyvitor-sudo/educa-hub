// Registro de auditoria: quem fez o quê nas ações sensíveis (logins, senhas, ações do administrador, suporte).
// O administrador consulta em Moderação › Registro de segurança.
import { db } from './db.js';

const DIAS_GUARDADOS = 180;

/**
 * Grava um evento. `usuarioId` é quem fez; `alvoId`, a conta afetada (quando há).
 * Nunca derruba a requisição: uma falha aqui só vai para o console.
 */
export function registrar(acao, { usuarioId = null, alvoId = null, ip = null, detalhe = null } = {}) {
  try {
    const nomeDe = (id) => (id == null ? null : (db.prepare("SELECT nome || ' (@' || usuario || ')' AS n FROM usuarios WHERE id = ?").get(id)?.n ?? null));
    db.prepare('INSERT INTO auditoria (acao, usuario_id, usuario_nome, alvo_id, alvo_nome, ip, detalhe) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      acao, usuarioId, nomeDe(usuarioId), alvoId, nomeDe(alvoId), ip, detalhe == null ? null : String(detalhe).slice(0, 300),
    );
  } catch (erro) {
    console.error('Falha ao gravar o registro de auditoria:', erro.message);
  }
}

export function limparRegistrosAntigos() {
  db.prepare("DELETE FROM auditoria WHERE criado_em < datetime('now', ?)").run(`-${DIAS_GUARDADOS} days`);
}

/** Últimos eventos, com o nome de quem fez e de quem foi afetado (como eram no momento do evento). */
export function ultimosRegistros(limite = 200) {
  return db
    .prepare(
      `SELECT id, acao, ip, detalhe, criado_em AS criadoEm,
              usuario_id AS usuarioId, usuario_nome AS usuario, alvo_id AS alvoId, alvo_nome AS alvo
       FROM auditoria ORDER BY id DESC LIMIT ?`,
    )
    .all(limite);
}
