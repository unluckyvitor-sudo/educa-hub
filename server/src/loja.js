// Catálogo de skins e acessórios do avatar. O cliente desenha cada item em 3D pelo id;
// aqui ficam nome, preço e forma de obtenção.
// padrao: já vem com a conta · marco: recompensa exclusiva de sequência de dias.

export const TIPOS_ITEM = ['pelagem', 'roupa', 'cabeca', 'rosto', 'pescoco', 'costas', 'mao', 'fundo'];

/** Tipos que podem ficar vazios no avatar. */
export const TIPOS_OPCIONAIS = ['cabeca', 'rosto', 'pescoco', 'costas', 'mao'];

export const ITENS = [
  // Pelagens (skins)
  { id: 'smoking', tipo: 'pelagem', nome: 'Smoking', raridade: 'comum', padrao: true },
  { id: 'laranja', tipo: 'pelagem', nome: 'Laranjinha', raridade: 'comum', padrao: true },
  { id: 'cinza', tipo: 'pelagem', nome: 'Cinza Nuvem', raridade: 'comum', padrao: true },
  { id: 'branco', tipo: 'pelagem', nome: 'Floco de Neve', raridade: 'comum', preco: 100 },
  { id: 'siames', tipo: 'pelagem', nome: 'Siamês', raridade: 'raro', preco: 180 },
  { id: 'tricolor', tipo: 'pelagem', nome: 'Tricolor', raridade: 'raro', preco: 220 },
  { id: 'chiclete', tipo: 'pelagem', nome: 'Chiclete', raridade: 'raro', preco: 300 },
  { id: 'neon', tipo: 'pelagem', nome: 'Azul Neon', raridade: 'epico', preco: 450 },
  { id: 'galaxia', tipo: 'pelagem', nome: 'Galáxia', raridade: 'epico', preco: 800 },
  { id: 'robo', tipo: 'pelagem', nome: 'Robô-Gato', raridade: 'epico', preco: 1200 },
  { id: 'arcoiris', tipo: 'pelagem', nome: 'Arco-Íris', raridade: 'lendario', marco: 30 },
  { id: 'dourado', tipo: 'pelagem', nome: 'Gato de Ouro', raridade: 'lendario', marco: 100 },

  // Roupas
  { id: 'moletom-roxo', tipo: 'roupa', nome: 'Moletom Roxo', raridade: 'comum', padrao: true },
  { id: 'moletom-azul', tipo: 'roupa', nome: 'Moletom Azul', raridade: 'comum', padrao: true },
  { id: 'moletom-rosa', tipo: 'roupa', nome: 'Moletom Rosa', raridade: 'comum', padrao: true },
  { id: 'moletom-verde', tipo: 'roupa', nome: 'Moletom Verde', raridade: 'comum', preco: 80 },
  { id: 'moletom-vermelho', tipo: 'roupa', nome: 'Moletom Vermelho', raridade: 'comum', preco: 80 },
  { id: 'moletom-amarelo', tipo: 'roupa', nome: 'Moletom Amarelo', raridade: 'comum', preco: 80 },
  { id: 'moletom-preto', tipo: 'roupa', nome: 'Moletom Ninja', raridade: 'raro', preco: 150 },
  { id: 'jaleco', tipo: 'roupa', nome: 'Jaleco de Cientista', raridade: 'raro', preco: 260 },
  { id: 'uniforme', tipo: 'roupa', nome: 'Camisa do Time', raridade: 'raro', preco: 220 },
  { id: 'heroi', tipo: 'roupa', nome: 'Traje de Herói', raridade: 'epico', preco: 500 },

  // Cabeça
  { id: 'laco', tipo: 'cabeca', nome: 'Laço', raridade: 'comum', preco: 90 },
  { id: 'bone', tipo: 'cabeca', nome: 'Boné', raridade: 'comum', preco: 120 },
  { id: 'chapeu-festa', tipo: 'cabeca', nome: 'Chapéu de Festa', raridade: 'comum', preco: 140 },
  { id: 'gorro', tipo: 'cabeca', nome: 'Gorro', raridade: 'comum', preco: 150 },
  { id: 'fones', tipo: 'cabeca', nome: 'Fones de Ouvido', raridade: 'raro', preco: 250 },
  { id: 'capelo', tipo: 'cabeca', nome: 'Capelo de Formatura', raridade: 'raro', preco: 300 },
  { id: 'cartola', tipo: 'cabeca', nome: 'Cartola', raridade: 'raro', preco: 350 },
  { id: 'chapeu-mago', tipo: 'cabeca', nome: 'Chapéu de Mago', raridade: 'epico', preco: 420 },
  { id: 'coroa', tipo: 'cabeca', nome: 'Coroa Real', raridade: 'epico', preco: 600 },
  { id: 'astronauta', tipo: 'cabeca', nome: 'Capacete Espacial', raridade: 'epico', preco: 900 },
  { id: 'aureola', tipo: 'cabeca', nome: 'Auréola', raridade: 'lendario', marco: 60 },

  // Rosto
  { id: 'oculos-redondos', tipo: 'rosto', nome: 'Óculos Redondos', raridade: 'comum', preco: 100 },
  { id: 'oculos-escuros', tipo: 'rosto', nome: 'Óculos Escuros', raridade: 'raro', preco: 180 },
  { id: 'monoculo', tipo: 'rosto', nome: 'Monóculo', raridade: 'raro', preco: 220 },
  { id: 'mascara-heroi', tipo: 'rosto', nome: 'Máscara de Herói', raridade: 'raro', preco: 260 },
  { id: 'oculos-estrela', tipo: 'rosto', nome: 'Óculos de Estrela', raridade: 'epico', preco: 320 },

  // Pescoço
  { id: 'sino', tipo: 'pescoco', nome: 'Coleira com Sino', raridade: 'comum', preco: 80 },
  { id: 'gravata-borboleta', tipo: 'pescoco', nome: 'Gravata-Borboleta', raridade: 'comum', preco: 90 },
  { id: 'cachecol', tipo: 'pescoco', nome: 'Cachecol', raridade: 'comum', preco: 140 },
  { id: 'medalha', tipo: 'pescoco', nome: 'Medalha de Dedicação', raridade: 'raro', marco: 7 },

  // Costas
  { id: 'mochila', tipo: 'costas', nome: 'Mochila', raridade: 'comum', preco: 160 },
  { id: 'capa', tipo: 'costas', nome: 'Capa de Herói', raridade: 'raro', preco: 450 },
  { id: 'asas-borboleta', tipo: 'costas', nome: 'Asas de Borboleta', raridade: 'epico', preco: 600 },
  { id: 'asas-anjo', tipo: 'costas', nome: 'Asas de Anjo', raridade: 'epico', preco: 700 },
  { id: 'jetpack', tipo: 'costas', nome: 'Mochila a Jato', raridade: 'lendario', preco: 1000 },

  // Mão
  { id: 'livro', tipo: 'mao', nome: 'Livro', raridade: 'comum', padrao: true },
  { id: 'pirulito', tipo: 'mao', nome: 'Pirulito', raridade: 'comum', preco: 70 },
  { id: 'lapis', tipo: 'mao', nome: 'Lápis Gigante', raridade: 'comum', preco: 90 },
  { id: 'balao', tipo: 'mao', nome: 'Balão', raridade: 'comum', preco: 120 },
  { id: 'varinha', tipo: 'mao', nome: 'Varinha Mágica', raridade: 'epico', preco: 350 },
  { id: 'trofeu', tipo: 'mao', nome: 'Troféu de Constância', raridade: 'epico', marco: 14 },

  // Fundos do retrato
  { id: 'lilas', tipo: 'fundo', nome: 'Lilás', raridade: 'comum', padrao: true },
  { id: 'ceu', tipo: 'fundo', nome: 'Céu', raridade: 'comum', padrao: true },
  { id: 'por-do-sol', tipo: 'fundo', nome: 'Pôr do Sol', raridade: 'comum', preco: 60 },
  { id: 'floresta', tipo: 'fundo', nome: 'Floresta', raridade: 'comum', preco: 60 },
  { id: 'doce', tipo: 'fundo', nome: 'Algodão-Doce', raridade: 'raro', preco: 150 },
  { id: 'espaco', tipo: 'fundo', nome: 'Espaço Sideral', raridade: 'raro', preco: 200 },
  { id: 'neon-fundo', tipo: 'fundo', nome: 'Neon', raridade: 'epico', preco: 280 },
];

export const ITEM_POR_ID = Object.fromEntries(ITENS.map((i) => [i.id, i]));

export const AVATAR_PADRAO = {
  pelagem: 'smoking',
  roupa: 'moletom-roxo',
  cabeca: null,
  rosto: null,
  pescoco: null,
  costas: null,
  mao: 'livro',
  fundo: 'lilas',
};

/** Marcos de sequência de dias e suas recompensas. */
export const MARCOS_SEQUENCIA = [
  { dias: 3, moedas: 30 },
  { dias: 7, moedas: 80, item: 'medalha' },
  { dias: 14, moedas: 150, item: 'trofeu' },
  { dias: 30, moedas: 400, item: 'arcoiris' },
  { dias: 60, moedas: 800, item: 'aureola' },
  { dias: 100, moedas: 1500, item: 'dourado' },
];
