// Moderação de texto: filtro de palavrões e nomes que só a equipe da plataforma pode usar.

const PALAVRAS = '(idiota|burr[oa]s?|imbecil|ot[aá]ri[oa]s?|merda|porra|caralho|put[ao]s?|fdp|vsf|bosta|cuz[aã]o|viad[oa]s?|desgra[cç]ad[oa]s?|retardad[oa]s?)';
const PALAVRAS_BLOQUEADAS = new RegExp(`\\b${PALAVRAS}\\b`, 'gi');
const TEM_PALAVRA_BLOQUEADA = new RegExp(`\\b${PALAVRAS}\\b`, 'i');

/** Troca palavrões por patinhas (chat dos duelos, bio do perfil). */
export const filtrarTexto = (texto) => texto.replace(PALAVRAS_BLOQUEADAS, '🐾🐾🐾');

export const temPalavraBloqueada = (texto) => TEM_PALAVRA_BLOQUEADA.test(texto);

// Ninguém além da equipe pode se apresentar como administração ou suporte: evita golpes do tipo "me passe sua senha".
const INICIOS_RESERVADOS = /^(admin|suporte|moderad|moderac|educahub)/;
const USUARIOS_RESERVADOS = new Set(['mestre.bigodes', 'mestrebigodes', 'professor', 'aluno', 'educa.hub']);
const NOME_RESERVADO = /(^|[^a-z])(admin|administrador[a]?|administracao|suporte|moderador[a]?|moderacao|educa\s*hub|equipe educa)([^a-z]|$)/;

const semAcentos = (texto) => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function usuarioReservado(usuario) {
  return USUARIOS_RESERVADOS.has(usuario) || INICIOS_RESERVADOS.test(usuario.replace(/[^a-z0-9]/g, ''));
}

export const nomeReservado = (nome) => NOME_RESERVADO.test(semAcentos(nome));
