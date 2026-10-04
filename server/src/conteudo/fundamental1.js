// Anos Iniciais (1º ao 5º ano). Formato de cada questão:
// [enunciado, resposta correta, errada, errada, errada, explicação opcional]
export default [
  // ───────────── 1º ANO ─────────────
  ['F1', 'portugues', [
    { t: 'Alfabeto e letras', r: 'O alfabeto tem 26 letras. As vogais são A, E, I, O, U; as outras letras são consoantes. Cada letra pode ser maiúscula ou minúscula.', q: [
      ['Qual é a primeira letra do alfabeto?', 'A', 'B', 'Z', 'E'],
      ['Qual destas letras é uma vogal?', 'O', 'M', 'P', 'T', 'As vogais são A, E, I, O, U.'],
      ['Com qual letra começa a palavra GATO?', 'G', 'A', 'T', 'O'],
      ['Quantas vogais existem no alfabeto?', '5', '3', '10', '26', 'São cinco: A, E, I, O, U.'],
    ]},
    { t: 'Sílabas e rimas', r: 'As palavras são formadas por pedacinhos chamados sílabas. Palavras que terminam com o mesmo som rimam, como GATO e PATO.', q: [
      ['Qual palavra rima com GATO?', 'Pato', 'Bola', 'Casa', 'Peixe'],
      ['Quantas sílabas tem a palavra BOLA?', '2', '1', '3', '4', 'BO-LA: duas sílabas.'],
      ['Qual palavra rima com MÃO?', 'Pão', 'Mesa', 'Pé', 'Dedo'],
      ['Quantas sílabas tem a palavra MACACO?', '3', '2', '4', '5', 'MA-CA-CO: três sílabas.'],
    ]},
  ]],
  ['F1', 'matematica', [
    { t: 'Números e contagem', r: 'Contamos para saber quantos objetos existem. Os números seguem uma ordem: 1, 2, 3, 4, 5... Cada número tem um vizinho antes e um depois.', q: [
      ['Qual número vem depois do 7?', '8', '6', '9', '5'],
      ['Qual número vem antes do 10?', '9', '11', '8', '1'],
      ['Qual é o maior número?', '15', '9', '12', '7'],
      ['Uma dezena é igual a quantas unidades?', '10', '5', '12', '100', 'Dezena é um grupo de 10 unidades.'],
    ]},
    { t: 'Somar e subtrair', r: 'Somar é juntar quantidades. Subtrair é tirar uma quantidade de outra. Podemos usar os dedos, desenhos ou a reta numérica para calcular.', q: [
      ['Quanto é 3 + 2?', '5', '4', '6', '1'],
      ['Quanto é 6 − 1?', '5', '7', '4', '6'],
      ['Tenho 4 balas e ganhei mais 4. Com quantas fiquei?', '8', '6', '4', '9'],
      ['Havia 9 passarinhos e 3 voaram. Quantos ficaram?', '6', '5', '12', '3'],
    ]},
  ]],
  ['F1', 'ciencias', [
    { t: 'Corpo humano e sentidos', r: 'Nosso corpo tem cabeça, tronco e membros. Com os cinco sentidos — visão, audição, olfato, paladar e tato — percebemos o mundo.', q: [
      ['Qual parte do corpo usamos para ouvir?', 'Orelhas', 'Olhos', 'Nariz', 'Mãos'],
      ['Com qual sentido sentimos o cheiro das flores?', 'Olfato', 'Visão', 'Tato', 'Audição'],
      ['Quantos sentidos nós temos?', '5', '2', '3', '10'],
      ['O que devemos fazer antes das refeições?', 'Lavar as mãos', 'Correr', 'Dormir', 'Pular'],
    ]},
    { t: 'Dia, noite e materiais', r: 'O Sol ilumina o dia; à noite vemos a Lua e as estrelas. Os objetos são feitos de materiais como madeira, plástico, vidro e metal.', q: [
      ['O que ilumina o nosso dia?', 'O Sol', 'A Lua', 'As estrelas', 'As nuvens'],
      ['Quando costumamos ver as estrelas no céu?', 'À noite', 'De manhã', 'Ao meio-dia', 'À tarde'],
      ['De que material é feita uma janela transparente?', 'Vidro', 'Madeira', 'Tecido', 'Papel'],
      ['Qual destes objetos geralmente é feito de madeira?', 'Lápis', 'Copo de vidro', 'Moeda', 'Garrafa PET'],
    ]},
  ]],
  ['F1', 'geografia', [
    { t: 'Meus lugares: casa e escola', r: 'Vivemos em vários lugares: a casa, a escola, a rua. Cada lugar tem regras de convivência e espaços com funções diferentes.', q: [
      ['Em que lugar da casa preparamos a comida?', 'Cozinha', 'Quarto', 'Banheiro', 'Garagem'],
      ['Em que lugar estudamos com a professora e os colegas?', 'Escola', 'Mercado', 'Praia', 'Hospital'],
      ['Qual destes é um lugar para brincar ao ar livre?', 'Praça', 'Elevador', 'Banheiro', 'Cozinha'],
      ['O que devemos fazer com o lixo na escola?', 'Jogar na lixeira', 'Deixar no chão', 'Guardar na mochila do colega', 'Jogar pela janela'],
    ]},
    { t: 'Tempo e natureza', r: 'A natureza tem ritmos: dia e noite, calor e frio, sol e chuva. O clima muda ao longo do ano e influencia nossas roupas e brincadeiras.', q: [
      ['O que usamos para nos proteger da chuva?', 'Guarda-chuva', 'Óculos de sol', 'Chinelo', 'Boné'],
      ['Em um dia muito frio, o que vestimos?', 'Casaco', 'Roupa de banho', 'Regata', 'Sandália'],
      ['De onde vem a chuva?', 'Das nuvens', 'Do Sol', 'Das árvores', 'Das montanhas'],
      ['Em qual período do dia o Sol nasce?', 'Manhã', 'Noite', 'Madrugada', 'Tarde'],
    ]},
  ]],
  ['F1', 'historia', [
    { t: 'Eu e minha família', r: 'Cada pessoa tem uma história, um nome e uma família. As famílias são diferentes umas das outras e todas merecem respeito.', q: [
      ['Como chamamos a mãe da nossa mãe?', 'Avó', 'Tia', 'Prima', 'Irmã'],
      ['Qual documento registra o nosso nascimento?', 'Certidão de nascimento', 'Boletim escolar', 'Carteira de motorista', 'Conta de luz'],
      ['O filho do meu tio é meu...', 'Primo', 'Avô', 'Irmão', 'Pai'],
      ['O que comemoramos no dia do aniversário?', 'O dia em que nascemos', 'O início das aulas', 'O Natal', 'O fim do ano'],
    ]},
    { t: 'O tempo passa', r: 'Organizamos o tempo em ontem, hoje e amanhã; em dias, semanas, meses e anos. Assim contamos a nossa história.', q: [
      ['Quantos dias tem uma semana?', '7', '5', '10', '30'],
      ['O dia que veio antes de hoje se chama...', 'Ontem', 'Amanhã', 'Depois', 'Agora'],
      ['Quantos meses tem um ano?', '12', '10', '7', '24'],
      ['Qual é o primeiro mês do ano?', 'Janeiro', 'Dezembro', 'Março', 'Junho'],
    ]},
  ]],
  ['F1', 'artes', [
    { t: 'Cores', r: 'As cores primárias são vermelho, azul e amarelo. Misturando duas delas criamos as cores secundárias: verde, laranja e roxo.', q: [
      ['Qual destas é uma cor primária?', 'Azul', 'Verde', 'Laranja', 'Roxo'],
      ['Misturando azul com amarelo obtemos...', 'Verde', 'Roxo', 'Laranja', 'Marrom'],
      ['Misturando vermelho com amarelo obtemos...', 'Laranja', 'Verde', 'Azul', 'Roxo'],
      ['Misturando azul com vermelho obtemos...', 'Roxo', 'Verde', 'Amarelo', 'Laranja'],
    ]},
    { t: 'Formas, linhas e sons', r: 'Desenhos são feitos de pontos, linhas e formas. Na música, os sons podem ser fortes ou fracos, graves ou agudos.', q: [
      ['Qual forma não tem pontas?', 'Círculo', 'Quadrado', 'Triângulo', 'Estrela'],
      ['Qual destes é um instrumento musical?', 'Violão', 'Pincel', 'Tesoura', 'Régua'],
      ['O que usamos para pintar um quadro?', 'Pincel e tinta', 'Martelo e prego', 'Garfo e faca', 'Régua e borracha'],
      ['Quantos lados tem um triângulo?', '3', '4', '2', '5'],
    ]},
  ]],

  // ───────────── 2º ANO ─────────────
  ['F2', 'portugues', [
    { t: 'Ordem alfabética e sílabas', r: 'A ordem alfabética organiza palavras como no dicionário. As palavras podem ter uma sílaba (monossílabas), duas (dissílabas), três (trissílabas) ou mais (polissílabas).', q: [
      ['Qual palavra vem primeiro na ordem alfabética?', 'Abacaxi', 'Banana', 'Caju', 'Damasco'],
      ['Como se separa em sílabas a palavra ESCOLA?', 'ES-CO-LA', 'E-SCO-LA', 'ESC-O-LA', 'ES-COL-A'],
      ['A palavra SOL tem quantas sílabas?', '1', '2', '3', '4', 'SOL é uma palavra monossílaba.'],
      ['Qual letra vem depois do M no alfabeto?', 'N', 'L', 'O', 'P'],
    ]},
    { t: 'Sinônimos, antônimos e pontuação', r: 'Sinônimos têm sentido parecido (feliz/contente). Antônimos têm sentido oposto (alto/baixo). O ponto final encerra frases, o de interrogação marca perguntas e o de exclamação mostra emoção.', q: [
      ['Qual é o antônimo de ALTO?', 'Baixo', 'Grande', 'Forte', 'Largo'],
      ['Qual é um sinônimo de FELIZ?', 'Contente', 'Triste', 'Bravo', 'Cansado'],
      ['Qual sinal usamos no final de uma pergunta?', 'Ponto de interrogação (?)', 'Ponto final (.)', 'Vírgula (,)', 'Ponto de exclamação (!)'],
      ['Qual é o antônimo de CHEIO?', 'Vazio', 'Pesado', 'Lotado', 'Grande'],
    ]},
  ]],
  ['F2', 'matematica', [
    { t: 'Unidades, dezenas e centenas', r: 'No sistema decimal, 10 unidades formam 1 dezena e 10 dezenas formam 1 centena. A posição do algarismo indica o seu valor.', q: [
      ['Quantas dezenas há no número 50?', '5', '50', '10', '0'],
      ['Uma centena é igual a quantas unidades?', '100', '10', '1000', '50'],
      ['No número 347, qual algarismo ocupa a casa das dezenas?', '4', '3', '7', '0'],
      ['Qual número é formado por 2 centenas, 3 dezenas e 5 unidades?', '235', '532', '253', '325'],
    ]},
    { t: 'Contas, dinheiro e tempo', r: 'Usamos adição e subtração para resolver problemas do dia a dia, como compras e troco. Uma hora tem 60 minutos e um dia tem 24 horas.', q: [
      ['Quanto é 25 + 13?', '38', '37', '48', '28'],
      ['Quanto é 40 − 15?', '25', '35', '15', '55'],
      ['Quantos minutos tem uma hora?', '60', '100', '30', '24'],
      ['Comprei um lanche de R$ 7 e paguei com R$ 10. Qual é o troco?', 'R$ 3', 'R$ 17', 'R$ 4', 'R$ 2'],
    ]},
  ]],
  ['F2', 'ciencias', [
    { t: 'Plantas e animais', r: 'Seres vivos nascem, crescem, podem se reproduzir e morrem. As plantas precisam de água, luz e ar. Os animais vivem em ambientes diferentes e se alimentam de formas variadas.', q: [
      ['De que as plantas precisam para viver?', 'Água, luz e ar', 'Somente terra', 'Leite e pão', 'Somente sombra'],
      ['Qual parte da planta fica dentro da terra e absorve água?', 'Raiz', 'Folha', 'Flor', 'Fruto'],
      ['Qual destes animais vive na água?', 'Peixe', 'Cavalo', 'Galinha', 'Gato'],
      ['Qual destes é um ser vivo?', 'Árvore', 'Pedra', 'Cadeira', 'Bola'],
    ]},
    { t: 'O Sol e os materiais', r: 'O Sol fornece luz e calor. Ao longo do dia, sua posição no céu muda e as sombras mudam de tamanho. Materiais têm propriedades como dureza, flexibilidade e transparência.', q: [
      ['O que o Sol nos fornece?', 'Luz e calor', 'Chuva e vento', 'Frio e neve', 'Sombra e água'],
      ['Quando a sombra de um poste fica mais curta?', 'Ao meio-dia', 'Ao amanhecer', 'Ao entardecer', 'À meia-noite', 'Com o Sol alto no céu, as sombras ficam curtas.'],
      ['Qual material é flexível e pode ser dobrado facilmente?', 'Borracha', 'Vidro', 'Pedra', 'Ferro'],
      ['Por que não devemos olhar diretamente para o Sol?', 'Porque pode ferir os olhos', 'Porque ele some', 'Porque dá sono', 'Porque faz chover'],
    ]},
  ]],
  ['F2', 'geografia', [
    { t: 'Transportes e comunicação', r: 'Os meios de transporte levam pessoas e mercadorias por terra, água e ar. Os meios de comunicação, como telefone e internet, aproximam as pessoas.', q: [
      ['Qual meio de transporte anda sobre trilhos?', 'Trem', 'Avião', 'Navio', 'Bicicleta'],
      ['Qual meio de transporte viaja pelo ar?', 'Avião', 'Ônibus', 'Barco', 'Metrô'],
      ['Qual destes é um meio de comunicação?', 'Telefone', 'Caminhão', 'Ponte', 'Semáforo'],
      ['Qual transporte não polui o ar?', 'Bicicleta', 'Carro', 'Ônibus', 'Moto'],
    ]},
    { t: 'O bairro e a paisagem', r: 'Paisagem é tudo o que vemos em um lugar. Ela tem elementos naturais (rios, árvores, morros) e elementos construídos pelas pessoas (casas, ruas, pontes).', q: [
      ['Qual é um elemento natural da paisagem?', 'Rio', 'Prédio', 'Ponte', 'Rua'],
      ['Qual é um elemento construído pelas pessoas?', 'Casa', 'Montanha', 'Mar', 'Nuvem'],
      ['Onde atravessamos a rua com segurança?', 'Na faixa de pedestres', 'No meio dos carros', 'Atrás do ônibus', 'Na curva'],
      ['Para que serve o semáforo?', 'Organizar o trânsito', 'Iluminar a rua', 'Enfeitar a cidade', 'Vender produtos'],
    ]},
  ]],
  ['F2', 'historia', [
    { t: 'A comunidade e seus registros', r: 'Fotos, objetos, cartas e relatos de pessoas mais velhas são fontes que ajudam a conhecer a história da comunidade.', q: [
      ['O que pode nos contar como era a vida antigamente?', 'Fotografias antigas', 'A previsão do tempo', 'O cardápio de hoje', 'Um brinquedo novo'],
      ['Quem pode contar histórias sobre o passado do bairro?', 'Os moradores mais velhos', 'Os bebês', 'Os turistas', 'Ninguém'],
      ['Onde ficam guardados objetos antigos para visitação?', 'Museu', 'Supermercado', 'Posto de gasolina', 'Farmácia'],
      ['Um objeto que pertenceu aos seus bisavós é uma fonte...', 'Histórica', 'De água', 'De energia', 'De renda'],
    ]},
    { t: 'Trabalho e convivência', r: 'Na comunidade há muitas profissões, e todas são importantes. Regras de convivência ajudam as pessoas a viver bem juntas.', q: [
      ['Quem cuida da saúde das pessoas?', 'Médica', 'Pedreiro', 'Motorista', 'Padeiro'],
      ['Quem faz o pão que comemos?', 'Padeiro', 'Carteiro', 'Dentista', 'Bombeiro'],
      ['Quem apaga incêndios e faz resgates?', 'Bombeiro', 'Professor', 'Cozinheira', 'Agricultor'],
      ['Por que existem regras na escola?', 'Para todos conviverem bem', 'Para atrapalhar as aulas', 'Para acabar com o recreio', 'Para deixar todos tristes'],
    ]},
  ]],
  ['F2', 'artes', [
    { t: 'Música e ritmo', r: 'A música combina sons e silêncios. O ritmo é a batida que se repete. Instrumentos podem ser de corda, de sopro ou de percussão.', q: [
      ['Qual destes é um instrumento de percussão?', 'Tambor', 'Flauta', 'Violino', 'Piano'],
      ['Qual destes é um instrumento de sopro?', 'Flauta', 'Pandeiro', 'Violão', 'Bateria'],
      ['Qual destes é um instrumento de corda?', 'Violão', 'Apito', 'Chocalho', 'Tambor'],
      ['Batidas que se repetem em uma música formam o...', 'Ritmo', 'Desenho', 'Cenário', 'Figurino'],
    ]},
    { t: 'Dança, teatro e desenho', r: 'Na dança, o corpo se expressa com movimentos. No teatro, atores representam personagens. No desenho, usamos linhas, formas e cores.', q: [
      ['Quem representa um personagem em uma peça?', 'Ator ou atriz', 'Pintor', 'Escultor', 'Fotógrafo'],
      ['Qual arte usa principalmente os movimentos do corpo?', 'Dança', 'Pintura', 'Escultura', 'Fotografia'],
      ['Uma linha que faz ondas é chamada de linha...', 'Ondulada', 'Reta', 'Pontilhada', 'Quebrada'],
      ['A roupa usada pelo personagem em uma peça é o...', 'Figurino', 'Cenário', 'Roteiro', 'Palco'],
    ]},
  ]],

  // ───────────── 3º ANO ─────────────
  ['F3', 'portugues', [
    { t: 'Substantivos, adjetivos e verbos', r: 'Substantivos dão nome a seres e coisas. Adjetivos indicam características. Verbos indicam ações, estados ou fenômenos da natureza.', q: [
      ['Na frase "O gato preto dorme", qual é o adjetivo?', 'Preto', 'Gato', 'Dorme', 'O'],
      ['Qual destas palavras é um verbo?', 'Correr', 'Mesa', 'Bonito', 'Azul'],
      ['Qual destas palavras é um substantivo próprio?', 'Brasil', 'Cidade', 'Menino', 'Escola','Substantivos próprios nomeiam um ser específico e começam com letra maiúscula.'],
      ['Qual é o plural de "pão"?', 'Pães', 'Pãos', 'Pões', 'Pãoes'],
    ]},
    { t: 'Sílaba tônica e ortografia', r: 'A sílaba tônica é a pronunciada com mais força. Conforme a posição dela, a palavra é oxítona (última), paroxítona (penúltima) ou proparoxítona (antepenúltima).', q: [
      ['Qual é a sílaba tônica de CAFÉ?', 'FÉ', 'CA', 'As duas', 'Nenhuma'],
      ['A palavra MÉDICO é...', 'Proparoxítona', 'Oxítona', 'Paroxítona', 'Monossílaba', 'A sílaba tônica é MÉ, a antepenúltima.'],
      ['Qual palavra está escrita corretamente?', 'Exceção', 'Eceção', 'Esseção', 'Excessão'],
      ['Qual palavra é oxítona?', 'Sofá', 'Mesa', 'Lâmpada', 'Caderno'],
    ]},
  ]],
  ['F3', 'matematica', [
    { t: 'Multiplicação e divisão', r: 'Multiplicar é somar parcelas iguais: 3 × 4 = 4 + 4 + 4. Dividir é repartir em partes iguais. Uma operação desfaz a outra.', q: [
      ['Quanto é 6 × 7?', '42', '36', '48', '13'],
      ['Quanto é 24 ÷ 4?', '6', '8', '4', '20'],
      ['3 caixas com 5 lápis cada têm quantos lápis ao todo?', '15', '8', '10', '53'],
      ['Reparti 18 figurinhas igualmente entre 3 amigos. Quantas cada um recebeu?', '6', '9', '5', '15'],
    ]},
    { t: 'Figuras e medidas', r: 'Figuras planas têm lados e vértices. Figuras espaciais, como cubo e esfera, têm volume. Medimos comprimento em metros e centímetros, massa em quilogramas e gramas.', q: [
      ['Quantos lados tem um quadrado?', '4', '3', '5', '6'],
      ['1 metro é igual a quantos centímetros?', '100', '10', '1000', '60'],
      ['Qual figura espacial tem a forma de uma bola?', 'Esfera', 'Cubo', 'Cone', 'Pirâmide'],
      ['1 quilograma é igual a quantos gramas?', '1000', '100', '10', '500'],
    ]},
  ]],
  ['F3', 'ciencias', [
    { t: 'Os animais', r: 'Vertebrados têm coluna vertebral: mamíferos, aves, répteis, anfíbios e peixes. Invertebrados, como insetos e minhocas, não têm. Cada grupo tem modos próprios de nascer, se alimentar e se locomover.', q: [
      ['Qual destes animais é um mamífero?', 'Baleia', 'Tubarão', 'Jacaré', 'Galinha', 'A baleia mama quando filhote e respira por pulmões.'],
      ['Qual animal nasce de ovo?', 'Tartaruga', 'Cachorro', 'Vaca', 'Gato'],
      ['Animais que comem apenas plantas são...', 'Herbívoros', 'Carnívoros', 'Onívoros', 'Insetívoros'],
      ['Qual destes animais é invertebrado?', 'Borboleta', 'Sapo', 'Cobra', 'Pássaro'],
    ]},
    { t: 'Luz, som e o planeta Terra', r: 'A luz permite enxergar, e os sons são produzidos por vibrações. A Terra tem forma arredondada e sua superfície é coberta por água e terra; o solo é essencial para as plantas.', q: [
      ['Qual é a forma do planeta Terra?', 'Arredondada', 'Quadrada', 'Plana', 'Triangular'],
      ['O som é produzido por...', 'Vibrações', 'Cores', 'Sombras', 'Cheiros'],
      ['Um objeto que deixa a luz passar totalmente é...', 'Transparente', 'Opaco', 'Escuro', 'Pesado'],
      ['A maior parte da superfície da Terra é coberta por...', 'Água', 'Florestas', 'Desertos', 'Gelo'],
    ]},
  ]],
  ['F3', 'geografia', [
    { t: 'Campo e cidade', r: 'No campo predominam a agricultura e a pecuária; na cidade, comércio, indústria e serviços. Campo e cidade dependem um do outro.', q: [
      ['Qual atividade é típica do campo?', 'Agricultura', 'Trabalho em shopping', 'Metrô', 'Banco'],
      ['A criação de animais como bois e galinhas se chama...', 'Pecuária', 'Indústria', 'Comércio', 'Turismo'],
      ['De onde vem a maior parte dos alimentos frescos consumidos na cidade?', 'Do campo', 'Das fábricas de carros', 'Dos prédios', 'Dos aeroportos'],
      ['Onde há mais prédios, ruas e trânsito?', 'Na cidade', 'Na fazenda', 'Na floresta', 'No sítio'],
    ]},
    { t: 'Mapas e recursos naturais', r: 'Mapas representam lugares vistos de cima e usam legendas e símbolos. Água, solo, ar e florestas são recursos naturais que precisam ser preservados.', q: [
      ['Para que serve a legenda de um mapa?', 'Explicar os símbolos', 'Enfeitar o mapa', 'Mostrar a data', 'Indicar o preço'],
      ['Qual destes é um recurso natural?', 'Água', 'Plástico', 'Vidro', 'Cimento'],
      ['Qual atitude ajuda a economizar água?', 'Fechar a torneira ao escovar os dentes', 'Lavar a calçada com mangueira', 'Tomar banhos longos', 'Deixar a torneira pingando'],
      ['Um mapa mostra os lugares como se fossem vistos...', 'De cima', 'De lado', 'De baixo', 'De dentro'],
    ]},
  ]],
  ['F3', 'historia', [
    { t: 'A cidade e o município', r: 'O município reúne a cidade (área urbana) e o campo (área rural). É governado pelo prefeito, e as leis municipais são feitas pelos vereadores.', q: [
      ['Quem governa o município?', 'O prefeito', 'O presidente', 'O governador', 'O juiz'],
      ['Quem faz as leis do município?', 'Os vereadores', 'Os professores', 'Os policiais', 'Os médicos'],
      ['Como se chama o prédio onde o prefeito trabalha?', 'Prefeitura', 'Escola', 'Hospital', 'Estádio'],
      ['A área do município com ruas, prédios e comércio é a área...', 'Urbana', 'Rural', 'Costeira', 'Florestal'],
    ]},
    { t: 'Patrimônio e cultura', r: 'Patrimônio é tudo o que um povo considera importante preservar: construções, festas, músicas, comidas e saberes. A cultura brasileira nasceu do encontro de povos indígenas, africanos e europeus.', q: [
      ['Quais povos já viviam no Brasil antes da chegada dos portugueses?', 'Povos indígenas', 'Povos italianos', 'Povos japoneses', 'Povos alemães'],
      ['Uma festa tradicional é um exemplo de patrimônio...', 'Cultural', 'Financeiro', 'Industrial', 'Esportivo'],
      ['Por que devemos preservar construções antigas?', 'Porque guardam a memória do lugar', 'Porque são mais baratas', 'Porque não têm dono', 'Porque são sempre bonitas'],
      ['A capoeira tem origem na cultura...', 'Afro-brasileira', 'Japonesa', 'Italiana', 'Alemã'],
    ]},
  ]],
  ['F3', 'artes', [
    { t: 'Arte e cultura brasileira', r: 'A arte brasileira mistura influências indígenas, africanas e europeias. Ela aparece no artesanato, nas festas populares, na música e na dança.', q: [
      ['O frevo é uma dança típica de qual estado?', 'Pernambuco', 'Rio Grande do Sul', 'Amazonas', 'Paraná'],
      ['A pintura corporal com tintas naturais é tradição de quais povos?', 'Indígenas', 'Vikings', 'Romanos', 'Esquimós'],
      ['Qual destes é um ritmo musical brasileiro?', 'Samba', 'Tango', 'Flamenco', 'Valsa'],
      ['Objetos feitos à mão, como cestos e peças de barro, são chamados de...', 'Artesanato', 'Maquinário', 'Arquitetura', 'Fotografia'],
    ]},
    { t: 'Elementos visuais', r: 'Ponto, linha, forma, cor e textura são elementos das artes visuais. A textura é a sensação da superfície: lisa, áspera, macia.', q: [
      ['A sensação de áspero ou liso em uma superfície é a...', 'Textura', 'Cor', 'Sombra', 'Moldura'],
      ['Uma obra de arte em três dimensões, feita de pedra ou argila, é uma...', 'Escultura', 'Pintura', 'Fotografia', 'Gravura'],
      ['Qual é uma cor quente?', 'Vermelho', 'Azul', 'Verde', 'Roxo'],
      ['O desenho que um artista faz de si mesmo chama-se...', 'Autorretrato', 'Paisagem', 'Natureza-morta', 'Caricatura de outro'],
    ]},
  ]],

  // ───────────── 4º ANO ─────────────
  ['F4', 'portugues', [
    { t: 'Classes gramaticais e acentuação', r: 'Pronomes substituem ou acompanham nomes. Artigos vêm antes dos substantivos. Todas as proparoxítonas são acentuadas.', q: [
      ['Na frase "Ela comprou um livro", a palavra "Ela" é um...', 'Pronome', 'Verbo', 'Adjetivo', 'Artigo'],
      ['Qual palavra deve receber acento?', 'Lampada', 'Mesa', 'Caderno', 'Janela', 'Lâmpada é proparoxítona, e todas as proparoxítonas são acentuadas.'],
      ['Em "As meninas cantam", a palavra "As" é um...', 'Artigo', 'Pronome', 'Substantivo', 'Advérbio'],
      ['Qual é o aumentativo de "casa"?', 'Casarão', 'Casinha', 'Casebre', 'Casas'],
    ]},
    { t: 'Gêneros textuais', r: 'Cada texto tem uma finalidade: a notícia informa, a receita ensina a preparar algo, a fábula conta uma história com ensinamento, a carta comunica algo a alguém.', q: [
      ['Qual texto ensina a preparar um bolo?', 'Receita', 'Notícia', 'Poema', 'Fábula'],
      ['Histórias curtas com animais que falam e uma moral no final são...', 'Fábulas', 'Notícias', 'Bilhetes', 'Anúncios'],
      ['Qual texto informa sobre um fato que aconteceu recentemente?', 'Notícia', 'Receita', 'Conto de fadas', 'Poema'],
      ['Os versos de um poema se agrupam em...', 'Estrofes', 'Capítulos', 'Parágrafos', 'Manchetes'],
    ]},
  ]],
  ['F4', 'matematica', [
    { t: 'Números grandes e operações', r: 'O sistema decimal organiza os números em classes: unidades, milhares, milhões. Multiplicar por 10, 100 ou 1000 acrescenta zeros ao número.', q: [
      ['Quanto é 125 × 10?', '1250', '135', '12 500', '1205'],
      ['Como se escreve "trinta e dois mil e quinhentos"?', '32 500', '3 250', '32 050', '320 500'],
      ['Quanto é 144 ÷ 12?', '12', '14', '11', '10'],
      ['Arredondando 478 para a centena mais próxima, obtemos...', '500', '400', '470', '480'],
    ]},
    { t: 'Frações, perímetro e área', r: 'Fração representa partes de um todo dividido igualmente. Perímetro é a soma dos lados de uma figura. Área é a medida da superfície.', q: [
      ['Uma pizza foi dividida em 8 fatias iguais e comi 2. Que fração comi?', '2/8', '8/2', '2/6', '1/8'],
      ['Qual é o perímetro de um quadrado de lado 5 cm?', '20 cm', '25 cm', '10 cm', '15 cm', 'Perímetro = 4 × 5 = 20 cm.'],
      ['Qual fração representa a metade?', '1/2', '1/3', '1/4', '2/3'],
      ['Qual é a área de um retângulo de 6 cm por 3 cm?', '18 cm²', '9 cm²', '12 cm²', '36 cm²', 'Área = base × altura = 6 × 3.'],
    ]},
  ]],
  ['F4', 'ciencias', [
    { t: 'Cadeias alimentares e microrganismos', r: 'Em uma cadeia alimentar, a energia passa dos produtores (plantas) aos consumidores e aos decompositores (fungos e bactérias). Alguns microrganismos causam doenças; outros produzem alimentos como pão e iogurte.', q: [
      ['Quais seres produzem o próprio alimento?', 'Plantas', 'Leões', 'Fungos', 'Seres humanos'],
      ['Fungos e bactérias que transformam restos de seres vivos são...', 'Decompositores', 'Produtores', 'Predadores', 'Herbívoros'],
      ['Qual alimento é produzido com a ajuda de microrganismos?', 'Iogurte', 'Sal', 'Água mineral', 'Açúcar'],
      ['Na cadeia "capim → gafanhoto → sapo", o gafanhoto é...', 'Consumidor', 'Produtor', 'Decompositor', 'Parasita'],
    ]},
    { t: 'Misturas e orientação pelo céu', r: 'Misturas reúnem duas ou mais substâncias. Algumas transformações são reversíveis (derreter gelo), outras não (queimar papel). O Sol nasce aproximadamente a leste e se põe a oeste.', q: [
      ['Em qual direção o Sol nasce, aproximadamente?', 'Leste', 'Oeste', 'Norte', 'Sul'],
      ['Qual transformação é reversível?', 'Água virando gelo', 'Papel queimando', 'Ovo sendo frito', 'Bolo assando'],
      ['Qual instrumento indica os pontos cardeais?', 'Bússola', 'Termômetro', 'Balança', 'Relógio'],
      ['Água com sal dissolvido é um exemplo de...', 'Mistura', 'Substância pura', 'Ser vivo', 'Gás'],
    ]},
  ]],
  ['F4', 'geografia', [
    { t: 'O território brasileiro', r: 'O Brasil é dividido em 26 estados e o Distrito Federal, agrupados em cinco regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.', q: [
      ['Qual é a capital do Brasil?', 'Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'],
      ['Em quantas regiões o Brasil é dividido?', '5', '3', '7', '26'],
      ['Quantos estados tem o Brasil?', '26', '27', '24', '30', 'São 26 estados mais o Distrito Federal.'],
      ['Em qual região fica o estado do Amazonas?', 'Norte', 'Sul', 'Sudeste', 'Nordeste'],
    ]},
    { t: 'Produção e trabalho', r: 'Matérias-primas vêm da natureza e são transformadas pela indústria em produtos, que chegam aos consumidores pelo comércio.', q: [
      ['Qual é a matéria-prima do papel?', 'Madeira', 'Petróleo', 'Areia', 'Algodão'],
      ['A atividade que transforma matéria-prima em produtos é a...', 'Indústria', 'Agricultura', 'Pesca', 'Pecuária'],
      ['Qual é a principal matéria-prima do vidro?', 'Areia', 'Madeira', 'Leite', 'Carvão'],
      ['Vender produtos em lojas e mercados é uma atividade de...', 'Comércio', 'Extrativismo', 'Indústria', 'Agricultura'],
    ]},
  ]],
  ['F4', 'historia', [
    { t: 'Primeiros povos e migrações', r: 'Os primeiros grupos humanos eram nômades: mudavam de lugar em busca de alimento. Com a agricultura, passaram a viver em um só lugar (sedentários). Migrar é mudar de um lugar para outro.', q: [
      ['Grupos humanos que não tinham moradia fixa eram...', 'Nômades', 'Sedentários', 'Urbanos', 'Industriais'],
      ['O que permitiu aos grupos humanos se fixarem em um lugar?', 'A agricultura', 'A televisão', 'O avião', 'A escrita'],
      ['Mudar-se de um lugar para viver em outro é...', 'Migrar', 'Votar', 'Plantar', 'Exportar'],
      ['Em qual continente surgiram os primeiros seres humanos?', 'África', 'América', 'Oceania', 'Antártida'],
    ]},
    { t: 'A formação do Brasil', r: 'Os portugueses chegaram em 1500 a terras já habitadas por povos indígenas. Depois, milhões de africanos foram trazidos à força e escravizados. Mais tarde vieram imigrantes de vários países.', q: [
      ['Em que ano os portugueses chegaram ao Brasil?', '1500', '1822', '1889', '1492'],
      ['Quem comandava a esquadra portuguesa que chegou em 1500?', 'Pedro Álvares Cabral', 'Cristóvão Colombo', 'Dom Pedro I', 'Tiradentes'],
      ['Os africanos trazidos ao Brasil no período colonial vieram...', 'À força, para serem escravizados', 'Como turistas', 'Como governantes', 'Por vontade própria, a passeio'],
      ['Qual foi o primeiro produto explorado pelos portugueses no Brasil?', 'Pau-brasil', 'Café', 'Soja', 'Petróleo'],
    ]},
  ]],
  ['F4', 'artes', [
    { t: 'Artes visuais', r: 'Retrato, paisagem e natureza-morta são gêneros da pintura. Artistas usam luz, sombra e perspectiva para dar a impressão de profundidade.', q: [
      ['Uma pintura que mostra montanhas, rios e céu é uma...', 'Paisagem', 'Natureza-morta', 'Caricatura', 'Escultura'],
      ['Uma pintura de frutas e objetos sobre a mesa é uma...', 'Natureza-morta', 'Paisagem', 'Retrato', 'Marinha'],
      ['Quem pintou o quadro "Abaporu"?', 'Tarsila do Amaral', 'Candido Portinari', 'Leonardo da Vinci', 'Pablo Picasso'],
      ['O recurso que dá a impressão de profundidade em um desenho é a...', 'Perspectiva', 'Moldura', 'Assinatura', 'Legenda'],
    ]},
    { t: 'Música e teatro', r: 'As notas musicais são dó, ré, mi, fá, sol, lá e si. No teatro, o cenário mostra onde a história acontece e o roteiro traz as falas.', q: [
      ['Quantas notas musicais existem na escala básica?', '7', '5', '10', '12'],
      ['Qual nota vem depois de "mi"?', 'Fá', 'Ré', 'Sol', 'Dó'],
      ['O espaço decorado onde a peça de teatro acontece é o...', 'Cenário', 'Figurino', 'Roteiro', 'Camarim'],
      ['O texto com as falas dos personagens é o...', 'Roteiro', 'Cenário', 'Ingresso', 'Cartaz'],
    ]},
  ]],

  // ───────────── 5º ANO ─────────────
  ['F5', 'portugues', [
    { t: 'Concordância e pontuação', r: 'O verbo concorda com o sujeito em número e pessoa. A vírgula separa itens de uma enumeração; as aspas marcam falas ou citações; o travessão introduz a fala de personagens.', q: [
      ['Qual frase está correta?', 'Os meninos jogaram bola.', 'Os menino jogaram bola.', 'Os meninos jogou bola.', 'O meninos jogaram bola.'],
      ['Qual sinal separa os itens de uma lista em uma frase?', 'Vírgula', 'Ponto final', 'Travessão', 'Reticências'],
      ['Complete: "Nós ___ ao cinema ontem."', 'fomos', 'foi', 'foram', 'fui'],
      ['Qual sinal introduz a fala de um personagem em um diálogo?', 'Travessão', 'Ponto e vírgula', 'Parênteses', 'Vírgula'],
    ]},
    { t: 'Interpretação e sentido das palavras', r: 'Sentido literal é o significado comum da palavra; sentido figurado é um significado diferente, usado para expressar ideias. Todo texto tem um assunto principal.', q: [
      ['Em "Ela tem um coração de ouro", a expressão significa que ela é...', 'Muito bondosa', 'Rica', 'Feita de metal', 'Doente'],
      ['A ideia mais importante de um texto é o seu...', 'Tema principal', 'Título do livro', 'Número de páginas', 'Autor'],
      ['Qual frase usa sentido figurado?', 'Estou morrendo de fome.', 'Almocei ao meio-dia.', 'O prato está na mesa.', 'Comprei arroz.'],
      ['Qual palavra é um advérbio de tempo?', 'Ontem', 'Bonito', 'Mesa', 'Correr'],
    ]},
  ]],
  ['F5', 'matematica', [
    { t: 'Frações e decimais', r: 'Frações e números decimais representam partes de um inteiro: 1/2 = 0,5 e 1/4 = 0,25. Frações equivalentes representam a mesma quantidade.', q: [
      ['Qual decimal equivale a 1/2?', '0,5', '0,2', '1,2', '0,12'],
      ['Quanto é 0,5 + 0,25?', '0,75', '0,30', '0,525', '7,5'],
      ['Qual fração é equivalente a 2/4?', '1/2', '1/4', '2/2', '3/4'],
      ['Quanto é 1/4 de 20?', '5', '4', '10', '80'],
    ]},
    { t: 'Porcentagem e medidas', r: 'Porcentagem é uma fração de denominador 100: 50% é a metade, 25% é um quarto. Volume mede o espaço ocupado; 1 litro equivale a 1000 mililitros.', q: [
      ['Quanto é 50% de 80?', '40', '50', '30', '8'],
      ['Quanto é 10% de 200?', '20', '10', '2', '100'],
      ['1 litro é igual a quantos mililitros?', '1000', '100', '10', '500'],
      ['Quantos centímetros cúbicos tem um cubo de aresta 2 cm?', '8', '6', '4', '12', 'Volume = 2 × 2 × 2 = 8 cm³.'],
    ]},
  ]],
  ['F5', 'ciencias', [
    { t: 'Sistemas do corpo humano', r: 'O sistema digestório transforma os alimentos em nutrientes; o respiratório capta oxigênio; o circulatório leva nutrientes e oxigênio a todo o corpo pelo sangue.', q: [
      ['Qual órgão bombeia o sangue pelo corpo?', 'Coração', 'Pulmão', 'Estômago', 'Fígado'],
      ['Em quais órgãos ocorre a troca de gases da respiração?', 'Pulmões', 'Rins', 'Intestinos', 'Ossos'],
      ['Onde a digestão dos alimentos começa?', 'Na boca', 'No estômago', 'No intestino', 'No esôfago', 'A mastigação e a saliva iniciam a digestão.'],
      ['Qual gás retiramos do ar para respirar?', 'Oxigênio', 'Gás carbônico', 'Nitrogênio', 'Hélio'],
    ]},
    { t: 'Ciclo da água e astronomia', r: 'A água evapora, forma nuvens (condensação) e volta como chuva (precipitação). A Terra gira em torno de si (rotação, 1 dia) e em torno do Sol (translação, 1 ano).', q: [
      ['A passagem da água do estado líquido para o gasoso é a...', 'Evaporação', 'Condensação', 'Solidificação', 'Fusão'],
      ['Qual movimento da Terra origina o dia e a noite?', 'Rotação', 'Translação', 'Revolução', 'Inclinação'],
      ['Quanto tempo a Terra leva para dar uma volta ao redor do Sol?', 'Cerca de 365 dias', '24 horas', '30 dias', '7 dias'],
      ['A formação das nuvens ocorre pela...', 'Condensação do vapor de água', 'Evaporação do gelo', 'Queima do ar', 'Fusão das rochas'],
    ]},
  ]],
  ['F5', 'geografia', [
    { t: 'População e regiões do Brasil', r: 'A população brasileira é formada por povos de diversas origens. A região Sudeste é a mais populosa; a Norte é a maior em área e abriga grande parte da Floresta Amazônica.', q: [
      ['Qual é a região mais populosa do Brasil?', 'Sudeste', 'Norte', 'Sul', 'Centro-Oeste'],
      ['Qual região brasileira tem a maior área?', 'Norte', 'Nordeste', 'Sudeste', 'Sul'],
      ['Em qual região fica o estado da Bahia?', 'Nordeste', 'Norte', 'Sudeste', 'Sul'],
      ['A saída de pessoas do campo para viver nas cidades é chamada de...', 'Êxodo rural', 'Imigração', 'Turismo', 'Exportação'],
    ]},
    { t: 'Cidades e meio ambiente', r: 'O crescimento das cidades traz desafios como poluição, trânsito e lixo. Reduzir, reutilizar e reciclar ajuda a cuidar do ambiente.', q: [
      ['Separar o lixo para que os materiais sejam reaproveitados é...', 'Reciclagem', 'Desmatamento', 'Poluição', 'Erosão'],
      ['Qual destas é uma fonte de energia renovável?', 'Energia solar', 'Petróleo', 'Carvão mineral', 'Gás natural'],
      ['A fumaça de carros e fábricas causa principalmente poluição...', 'Do ar', 'Sonora', 'Visual', 'Do solo'],
      ['O serviço que leva água tratada às casas e coleta o esgoto é o...', 'Saneamento básico', 'Transporte público', 'Correio', 'Comércio'],
    ]},
  ]],
  ['F5', 'historia', [
    { t: 'Povos antigos', r: 'As primeiras civilizações surgiram perto de grandes rios. Os egípcios viviam às margens do Nilo; os mesopotâmicos, entre o Tigre e o Eufrates. A invenção da escrita mudou a forma de registrar a história.', q: [
      ['Às margens de qual rio se desenvolveu o Egito Antigo?', 'Nilo', 'Amazonas', 'Tigre', 'Ganges'],
      ['Como eram chamados os reis do Egito Antigo?', 'Faraós', 'Césares', 'Czares', 'Sultões'],
      ['A escrita egípcia feita com desenhos e símbolos chama-se...', 'Hieróglifos', 'Alfabeto latino', 'Braille', 'Cuneiforme'],
      ['A Mesopotâmia ficava entre quais rios?', 'Tigre e Eufrates', 'Nilo e Congo', 'Amazonas e Negro', 'Reno e Danúbio'],
    ]},
    { t: 'Cidadania e direitos', r: 'Cidadania é ter direitos e deveres. A Constituição de 1988 é a lei mais importante do Brasil, e o Estatuto da Criança e do Adolescente (ECA) protege crianças e adolescentes.', q: [
      ['Qual é a lei mais importante do Brasil?', 'A Constituição Federal', 'O Código de Trânsito', 'O regimento escolar', 'O Estatuto do Torcedor'],
      ['Qual lei protege os direitos de crianças e adolescentes?', 'ECA', 'CLT', 'CPF', 'ONU'],
      ['Qual destes é um direito de toda criança?', 'Educação', 'Trabalhar em fábrica', 'Dirigir', 'Votar'],
      ['Em que ano foi promulgada a atual Constituição brasileira?', '1988', '1500', '1822', '2000'],
    ]},
  ]],
  ['F5', 'artes', [
    { t: 'Arte no mundo e no Brasil', r: 'Cada época e cada povo criam formas próprias de arte. No Brasil, a Semana de Arte Moderna de 1922 valorizou uma arte com identidade brasileira.', q: [
      ['Quem pintou a "Mona Lisa"?', 'Leonardo da Vinci', 'Vincent van Gogh', 'Pablo Picasso', 'Claude Monet'],
      ['Em que cidade aconteceu a Semana de Arte Moderna de 1922?', 'São Paulo', 'Rio de Janeiro', 'Salvador', 'Recife'],
      ['Desenhos e pinturas feitos em rochas por povos muito antigos são arte...', 'Rupestre', 'Digital', 'Moderna', 'Barroca'],
      ['Candido Portinari ficou conhecido por pintar...', 'O povo e os trabalhadores brasileiros', 'Naves espaciais', 'Castelos europeus', 'Paisagens do Polo Norte'],
    ]},
    { t: 'Linguagens da arte', r: 'A arte se expressa por várias linguagens: artes visuais, música, dança e teatro. A tecnologia criou novas formas, como a fotografia, o cinema e a arte digital.', q: [
      ['O cinema é conhecido como a "sétima..."', 'Arte', 'Ciência', 'Música', 'Dança'],
      ['A arte de registrar imagens com uma câmera é a...', 'Fotografia', 'Escultura', 'Gravura', 'Tapeçaria'],
      ['Um grupo de pessoas que canta junto forma um...', 'Coral', 'Elenco', 'Ateliê', 'Museu'],
      ['A sequência de passos e movimentos de uma dança é a...', 'Coreografia', 'Partitura', 'Maquete', 'Melodia'],
    ]},
  ]],
];
