// Termos de uso, política de privacidade e autorização do responsável.
// Os textos ficam no cliente (client/src/paginas/Termos.tsx); aqui estão as regras de aceite e o que fica registrado.
import { texto, ErroDeEntrada } from './auth.js';

/** Mude ao alterar os textos de forma relevante: quem aceitou uma versão anterior é convidado a aceitar de novo. */
export const VERSAO_DOS_TERMOS = '2026-10';

/** Abaixo desta idade, o cadastro de aluno pede o nome e a autorização de um responsável. */
export const IDADE_SEM_RESPONSAVEL = 18;

export function idadeEm(nascimento, hoje = new Date()) {
  const [ano, mes, dia] = nascimento.split('-').map(Number);
  const jaFezAniversario = hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia);
  return hoje.getFullYear() - ano - (jaFezAniversario ? 0 : 1);
}

/**
 * Confere o aceite dos termos e, para alunos menores de idade, a autorização do responsável.
 * Devolve o nome do responsável (ou null quando não se aplica). A autorização é declarada por quem
 * preenche o cadastro: a plataforma registra quem autorizou e quando, mas não verifica a identidade.
 */
export function lerAceite(corpo, { papel, nascimento }) {
  if (corpo?.aceitouTermos !== true) {
    throw new ErroDeEntrada('Para usar a plataforma é preciso aceitar os Termos de uso e a Política de privacidade.');
  }
  if (papel !== 'aluno') return null;
  if (!nascimento) throw new ErroDeEntrada('Informe a data de nascimento.');
  if (idadeEm(nascimento) >= IDADE_SEM_RESPONSAVEL) return null;
  const responsavel = texto(corpo.responsavel, 'Nome do responsável', { min: 3, max: 80 });
  if (!responsavel || corpo.autorizacaoDoResponsavel !== true) {
    throw new ErroDeEntrada(`Alunos com menos de ${IDADE_SEM_RESPONSAVEL} anos precisam do nome e da autorização de um responsável.`);
  }
  return responsavel;
}

/** O que falta para a conta estar em dia com os termos (contas criadas antes deles, ou depois de uma nova versão). */
export function pendenciasDeTermos(u) {
  if (u.papel === 'admin') return null; // quem administra a instalação é quem oferece os termos
  const termos = u.termos_versao !== VERSAO_DOS_TERMOS;
  const nascimento = u.papel === 'aluno' && !u.nascimento;
  const responsavel = u.papel === 'aluno' && !!u.nascimento && idadeEm(u.nascimento) < IDADE_SEM_RESPONSAVEL && !u.consentimento_em;
  return termos || nascimento || responsavel ? { termos, nascimento, responsavel } : null;
}

/** Quem responde pela instalação (definido por quem hospeda) — aparece nos Termos e na Política de privacidade. */
export function sobreAInstalacao() {
  return {
    responsavel: process.env.EDUCAHUB_RESPONSAVEL?.trim() || null,
    contato: process.env.EDUCAHUB_CONTATO?.trim() || null,
    versaoDosTermos: VERSAO_DOS_TERMOS,
    idadeSemResponsavel: IDADE_SEM_RESPONSAVEL,
  };
}
