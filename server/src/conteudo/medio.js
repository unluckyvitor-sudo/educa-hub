// Ensino Médio (1ª à 3ª série). Formato de cada questão:
// [enunciado, resposta correta, errada, errada, errada, explicação opcional]
export default [
  // ───────────── 1ª SÉRIE ─────────────
  ['M1', 'portugues', [
    { t: 'Funções da linguagem e variação linguística', r: 'As funções da linguagem (referencial, emotiva, conativa, fática, metalinguística e poética) dependem do elemento da comunicação em destaque. A língua varia conforme região, época, grupo social e situação.', q: [
      ['Um texto que busca convencer o leitor, como uma propaganda, usa principalmente a função...', 'Conativa (apelativa)', 'Referencial', 'Fática', 'Metalinguística'],
      ['Uma notícia de jornal usa predominantemente a função...', 'Referencial', 'Emotiva', 'Poética', 'Conativa'],
      ['As diferenças de fala entre regiões do país são exemplos de variação...', 'Regional', 'Histórica', 'Situacional', 'Etária'],
      ['Um dicionário, ao explicar o significado das palavras, usa a função...', 'Metalinguística', 'Fática', 'Emotiva', 'Poética'],
    ]},
    { t: 'Das origens ao Arcadismo', r: 'O Trovadorismo trouxe as cantigas medievais; o Classicismo teve Camões; o Quinhentismo registrou a chegada ao Brasil; o Barroco explorou conflitos e contrastes; o Arcadismo buscou simplicidade e vida no campo.', q: [
      ['Quem escreveu "Os Lusíadas"?', 'Luís de Camões', 'Fernando Pessoa', 'Gil Vicente', 'Padre Antônio Vieira'],
      ['Qual poeta barroco brasileiro ficou conhecido como "Boca do Inferno"?', 'Gregório de Matos', 'Tomás Antônio Gonzaga', 'Cláudio Manuel da Costa', 'Basílio da Gama'],
      ['Qual documento é considerado o marco inicial da literatura no Brasil?', 'A Carta de Pero Vaz de Caminha', 'Os Sermões de Vieira', 'Marília de Dirceu', 'O Uraguai'],
      ['O lema "fugere urbem" (fugir da cidade) pertence ao...', 'Arcadismo', 'Barroco', 'Trovadorismo', 'Romantismo'],
    ]},
  ]],
  ['M1', 'matematica', [
    { t: 'Conjuntos e funções afim e quadrática', r: 'A função afim f(x) = ax + b tem como gráfico uma reta. A função quadrática f(x) = ax² + bx + c tem como gráfico uma parábola, com vértice em x = −b/2a.', q: [
      ['Qual é o zero da função f(x) = 2x − 6?', '3', '−3', '6', '−6'],
      ['O gráfico de f(x) = x² − 4 é uma...', 'Parábola', 'Reta', 'Hipérbole', 'Circunferência'],
      ['Qual é a abscissa do vértice de f(x) = x² − 6x + 5?', '3', '−3', '6', '5', 'x do vértice = −b/2a = 6/2 = 3.'],
      ['Se A = {1, 2, 3} e B = {2, 3, 4}, então A ∩ B é...', '{2, 3}', '{1, 2, 3, 4}', '{1, 4}', '{2}'],
    ]},
    { t: 'Exponenciais e logaritmos', r: 'Na função exponencial f(x) = aˣ, a variável está no expoente. O logaritmo é a operação inversa: log_a(b) = x significa aˣ = b.', q: [
      ['Quanto vale log₂ 8?', '3', '4', '2', '16'],
      ['Qual é a solução de 2ˣ = 32?', '5', '4', '6', '16'],
      ['Quanto vale log₁₀ 1000?', '3', '10', '100', '2'],
      ['Quanto vale log 1 em qualquer base válida?', '0', '1', '10', 'Não existe'],
    ]},
  ]],
  ['M1', 'fisica', [
    { t: 'Cinemática', r: 'Velocidade média é a razão entre deslocamento e tempo. No MRU a velocidade é constante; no MRUV a aceleração é constante e v = v₀ + at.', q: [
      ['Um carro percorre 120 km em 2 h. Qual é a sua velocidade média?', '60 km/h', '240 km/h', '100 km/h', '30 km/h'],
      ['Quanto vale 72 km/h em m/s?', '20 m/s', '7,2 m/s', '36 m/s', '259 m/s', 'Divide-se por 3,6.'],
      ['Um móvel parte do repouso com aceleração de 2 m/s². Qual é sua velocidade após 5 s?', '10 m/s', '2,5 m/s', '7 m/s', '25 m/s'],
      ['Qual é a aceleração da gravidade aproximada na superfície da Terra?', '9,8 m/s²', '1,6 m/s²', '98 m/s²', '3,7 m/s²'],
    ]},
    { t: 'Leis de Newton', r: '1ª lei: inércia. 2ª lei: a força resultante é igual à massa vezes a aceleração (F = m·a). 3ª lei: a toda ação corresponde uma reação de mesma intensidade e sentido oposto.', q: [
      ['Qual é a força resultante sobre um corpo de 5 kg com aceleração de 2 m/s²?', '10 N', '2,5 N', '7 N', '3 N'],
      ['A tendência de um corpo manter seu estado de movimento é a...', 'Inércia', 'Aceleração', 'Gravidade', 'Pressão'],
      ['Qual é o peso de um corpo de 10 kg na Terra? (g = 10 m/s²)', '100 N', '10 N', '1 N', '1000 N'],
      ['Qual é a unidade de força no Sistema Internacional?', 'Newton', 'Joule', 'Watt', 'Pascal'],
    ]},
  ]],
  ['M1', 'quimica', [
    { t: 'Modelos atômicos e tabela periódica', r: 'Dalton imaginou o átomo como esfera maciça; Thomson descobriu o elétron; Rutherford propôs o núcleo; Bohr, os níveis de energia. Na tabela, colunas são famílias e linhas são períodos.', q: [
      ['Qual cientista propôs o modelo atômico com núcleo e eletrosfera?', 'Rutherford', 'Dalton', 'Thomson', 'Demócrito'],
      ['O modelo do "pudim de passas" foi proposto por...', 'Thomson', 'Bohr', 'Rutherford', 'Dalton'],
      ['Os elementos da família 18 da tabela periódica são os...', 'Gases nobres', 'Metais alcalinos', 'Halogênios', 'Calcogênios'],
      ['Átomos do mesmo elemento com números de massa diferentes são...', 'Isótopos', 'Isóbaros', 'Isótonos', 'Íons'],
    ]},
    { t: 'Ligações químicas', r: 'Na ligação iônica há transferência de elétrons entre metal e ametal. Na covalente, compartilhamento de elétrons entre ametais. Na metálica, um "mar de elétrons" une os átomos de metal.', q: [
      ['Qual tipo de ligação existe no cloreto de sódio (NaCl)?', 'Iônica', 'Covalente', 'Metálica', 'Ponte de hidrogênio'],
      ['Na molécula de água (H₂O), as ligações entre H e O são...', 'Covalentes', 'Iônicas', 'Metálicas', 'Nucleares'],
      ['Um átomo que perde elétrons se torna um...', 'Cátion', 'Ânion', 'Isótopo', 'Nêutron'],
      ['Pela regra do octeto, os átomos tendem a ficar com quantos elétrons na camada de valência?', '8', '2', '6', '10'],
    ]},
  ]],
  ['M1', 'biologia', [
    { t: 'Citologia', r: 'Células procariontes não têm núcleo organizado; as eucariontes têm. Organelas: mitocôndria (respiração celular), ribossomo (síntese de proteínas), cloroplasto (fotossíntese), lisossomo (digestão celular).', q: [
      ['Qual organela realiza a respiração celular?', 'Mitocôndria', 'Ribossomo', 'Lisossomo', 'Complexo golgiense'],
      ['Qual organela é responsável pela síntese de proteínas?', 'Ribossomo', 'Mitocôndria', 'Vacúolo', 'Centríolo'],
      ['As bactérias são organismos...', 'Procariontes', 'Eucariontes', 'Pluricelulares', 'Acelulares'],
      ['Qual organela está presente em células vegetais e ausente em células animais?', 'Cloroplasto', 'Mitocôndria', 'Ribossomo', 'Núcleo'],
    ]},
    { t: 'Divisão celular e metabolismo', r: 'A mitose gera duas células geneticamente iguais; a meiose gera quatro células com metade dos cromossomos (gametas). A fotossíntese produz glicose e oxigênio a partir de luz, água e gás carbônico.', q: [
      ['Qual divisão celular forma os gametas?', 'Meiose', 'Mitose', 'Bipartição', 'Brotamento'],
      ['Qual gás é liberado na fotossíntese?', 'Oxigênio', 'Gás carbônico', 'Nitrogênio', 'Metano'],
      ['Ao final de uma mitose, formam-se...', 'Duas células iguais à original', 'Quatro células haploides', 'Uma célula maior', 'Oito células'],
      ['Qual molécula é a principal "moeda energética" da célula?', 'ATP', 'DNA', 'RNA', 'Colesterol'],
    ]},
  ]],
  ['M1', 'historia', [
    { t: 'Antiguidade e Idade Média', r: 'As civilizações clássicas (Grécia e Roma) deixaram bases políticas e culturais do Ocidente. A Idade Média europeia foi marcada pelo feudalismo, pelo poder da Igreja e, no fim, pelo renascimento comercial e urbano.', q: [
      ['A relação de fidelidade entre nobres na Idade Média era chamada de...', 'Suserania e vassalagem', 'Escravidão', 'Mercantilismo', 'Colonato'],
      ['Qual doença matou cerca de um terço da população europeia no século XIV?', 'Peste Negra', 'Gripe Espanhola', 'Varíola', 'Cólera'],
      ['As expedições militares cristãs em direção a Jerusalém foram as...', 'Cruzadas', 'Bandeiras', 'Grandes Navegações', 'Reconquistas'],
      ['Qual império manteve Constantinopla como capital até 1453?', 'Império Bizantino', 'Império Carolíngio', 'Império Persa', 'Império Mongol'],
    ]},
    { t: 'Mundo moderno', r: 'A Idade Moderna trouxe o absolutismo (poder concentrado no rei), o mercantilismo (acúmulo de metais e balança comercial favorável) e a expansão marítima europeia.', q: [
      ['O rei francês Luís XIV, o "Rei Sol", é símbolo do...', 'Absolutismo', 'Liberalismo', 'Socialismo', 'Anarquismo'],
      ['A ideia de que a riqueza de um país depende do acúmulo de metais preciosos é o...', 'Metalismo', 'Liberalismo', 'Fisiocratismo', 'Socialismo'],
      ['Qual navegador português chegou às Índias contornando a África em 1498?', 'Vasco da Gama', 'Bartolomeu Dias', 'Cabral', 'Colombo'],
      ['Quem escreveu "O Príncipe", obra sobre o poder político?', 'Maquiavel', 'Hobbes', 'Locke', 'Rousseau'],
    ]},
  ]],
  ['M1', 'geografia', [
    { t: 'Cartografia e geologia', r: 'Projeções cartográficas representam a Terra em um plano, sempre com alguma distorção. A crosta é dividida em placas tectônicas, cujo movimento causa terremotos e vulcões.', q: [
      ['A projeção de Mercator distorce principalmente...', 'As áreas próximas aos polos', 'As áreas próximas ao Equador', 'As formas dos continentes na linha do Equador', 'Os oceanos tropicais'],
      ['O movimento das placas tectônicas pode causar...', 'Terremotos', 'Furacões', 'Marés', 'Eclipses'],
      ['Em um mapa de escala 1:100 000, 1 cm corresponde a...', '1 km', '100 m', '10 km', '100 km'],
      ['Rochas formadas pelo resfriamento do magma são...', 'Magmáticas (ígneas)', 'Sedimentares', 'Metamórficas', 'Orgânicas'],
    ]},
    { t: 'Clima e biomas do mundo', r: 'Latitude, altitude, maritimidade e massas de ar influenciam o clima. Cada clima sustenta biomas próprios: florestas tropicais, savanas, desertos, taiga, tundra.', q: [
      ['Quanto maior a altitude, a temperatura tende a ser...', 'Menor', 'Maior', 'Igual', 'Mais instável'],
      ['Qual bioma é formado por florestas de coníferas em regiões frias?', 'Taiga', 'Savana', 'Tundra', 'Estepe'],
      ['Qual fenômeno aquece anormalmente as águas do Pacífico equatorial?', 'El Niño', 'La Niña', 'Monções', 'Corrente do Golfo'],
      ['Qual clima predomina na maior parte da Amazônia?', 'Equatorial', 'Semiárido', 'Subtropical', 'Temperado'],
    ]},
  ]],
  ['M1', 'filosofia', [
    { t: 'Do mito à filosofia', r: 'A filosofia nasceu na Grécia ao buscar explicações racionais, em vez de míticas. Os pré-socráticos investigavam a "arché", o princípio de todas as coisas.', q: [
      ['Quem é considerado o primeiro filósofo, para quem a água era o princípio de tudo?', 'Tales de Mileto', 'Heráclito', 'Parmênides', 'Pitágoras'],
      ['Qual filósofo afirmou que "tudo flui"?', 'Heráclito', 'Parmênides', 'Tales', 'Demócrito'],
      ['O princípio originário de todas as coisas, buscado pelos pré-socráticos, é a...', 'Arché', 'Pólis', 'Ágora', 'Doxa'],
      ['Qual pré-socrático propôs que tudo é formado por átomos?', 'Demócrito', 'Anaximandro', 'Empédocles', 'Zenão'],
    ]},
    { t: 'Sócrates, Platão e Aristóteles', r: 'Sócrates usava o diálogo (maiêutica) para buscar a verdade. Platão distinguiu o mundo sensível do mundo das ideias. Aristóteles valorizou a observação e sistematizou a lógica.', q: [
      ['A frase "Só sei que nada sei" é atribuída a...', 'Sócrates', 'Platão', 'Aristóteles', 'Epicuro'],
      ['O "Mito da Caverna" foi escrito por...', 'Platão', 'Sócrates', 'Aristóteles', 'Heráclito'],
      ['Quem foi o fundador do Liceu e mestre de Alexandre, o Grande?', 'Aristóteles', 'Platão', 'Sócrates', 'Diógenes'],
      ['O método socrático de fazer perguntas para "dar à luz" ideias é a...', 'Maiêutica', 'Retórica', 'Dialética hegeliana', 'Escolástica'],
    ]},
  ]],
  ['M1', 'sociologia', [
    { t: 'O surgimento da Sociologia', r: 'A Sociologia surgiu no século XIX para compreender as transformações da Revolução Industrial. Comte criou o positivismo; Durkheim estudou os fatos sociais; Weber, a ação social; Marx, a luta de classes.', q: [
      ['Quem criou o termo "sociologia" e fundou o positivismo?', 'Auguste Comte', 'Karl Marx', 'Max Weber', 'Émile Durkheim'],
      ['O conceito de "fato social" foi desenvolvido por...', 'Durkheim', 'Weber', 'Marx', 'Comte'],
      ['Para Karl Marx, a história é movida pela...', 'Luta de classes', 'Ação social', 'Solidariedade orgânica', 'Lei dos três estados'],
      ['O conceito de "ação social" é central na obra de...', 'Max Weber', 'Durkheim', 'Comte', 'Marx'],
    ]},
    { t: 'Cultura e socialização', r: 'Socialização é o processo pelo qual aprendemos normas e valores. Cultura é o conjunto de saberes, costumes e crenças de um grupo. Etnocentrismo é julgar outras culturas a partir da própria.', q: [
      ['Julgar outras culturas tomando a própria como superior é...', 'Etnocentrismo', 'Relativismo cultural', 'Aculturação', 'Socialização'],
      ['Qual é a primeira instituição responsável pela socialização do indivíduo?', 'Família', 'Estado', 'Empresa', 'Mídia'],
      ['Compreender uma cultura a partir de seus próprios valores é o...', 'Relativismo cultural', 'Etnocentrismo', 'Preconceito', 'Determinismo'],
      ['Regras de comportamento compartilhadas por um grupo são...', 'Normas sociais', 'Fatos biológicos', 'Instintos', 'Leis naturais'],
    ]},
  ]],
  ['M1', 'ingles', [
    { t: 'Reading strategies', r: 'Cognatos são palavras parecidas nas duas línguas (important/importante). Skimming é a leitura rápida para captar a ideia geral; scanning busca uma informação específica.', q: [
      ['Qual destas palavras é um falso cognato?', 'Pretend (fingir)', 'Important', 'Music', 'Family'],
      ['A leitura rápida para captar a ideia geral do texto é o...', 'Skimming', 'Scanning', 'Spelling', 'Listening'],
      ['"Actually" significa...', 'Na verdade', 'Atualmente', 'Ativamente', 'Antigamente'],
      ['"Parents" significa...', 'Pais', 'Parentes', 'Padrinhos', 'Parceiros'],
    ]},
    { t: 'Verb tenses review', r: 'Present continuous (am/is/are + -ing) indica ações em andamento; past continuous (was/were + -ing), ações em andamento no passado.', q: [
      ['Complete: "She ___ studying right now."', 'is', 'are', 'was', 'does'],
      ['Complete: "They ___ playing when it started to rain."', 'were', 'was', 'are', 'did'],
      ['Qual frase está no present continuous?', 'I am reading a book.', 'I read a book.', 'I have read a book.', 'I will read a book.'],
      ['Complete: "While I ___ dinner, the phone rang."', 'was cooking', 'cook', 'am cooking', 'cooks'],
    ]},
  ]],

  // ───────────── 2ª SÉRIE ─────────────
  ['M2', 'portugues', [
    { t: 'Romantismo', r: 'O Romantismo valorizou o sentimento, o nacionalismo e a liberdade de criação. No Brasil, teve o indianismo (Gonçalves Dias, José de Alencar), o ultrarromantismo (Álvares de Azevedo) e a poesia social (Castro Alves).', q: [
      ['Quem escreveu "Iracema" e "O Guarani"?', 'José de Alencar', 'Machado de Assis', 'Aluísio Azevedo', 'Joaquim Manuel de Macedo'],
      ['Qual poeta ficou conhecido como "o poeta dos escravos"?', 'Castro Alves', 'Gonçalves Dias', 'Álvares de Azevedo', 'Casimiro de Abreu'],
      ['O poema "Canção do Exílio" foi escrito por...', 'Gonçalves Dias', 'Olavo Bilac', 'Castro Alves', 'Carlos Drummond de Andrade'],
      ['A geração romântica marcada pelo pessimismo e pelo "mal do século" é a...', 'Ultrarromântica', 'Indianista', 'Condoreira', 'Parnasiana'],
    ]},
    { t: 'Realismo, Naturalismo e Parnasianismo', r: 'O Realismo analisa a sociedade com objetividade e ironia (Machado de Assis). O Naturalismo destaca a influência do meio (Aluísio Azevedo). O Parnasianismo cultua a forma perfeita (Olavo Bilac).', q: [
      ['Quem escreveu "Dom Casmurro"?', 'Machado de Assis', 'José de Alencar', 'Eça de Queirós', 'Raul Pompeia'],
      ['Qual obra de Aluísio Azevedo é um marco do Naturalismo?', 'O Cortiço', 'Senhora', 'Memórias Póstumas de Brás Cubas', 'O Ateneu'],
      ['O lema "arte pela arte" e o culto à forma caracterizam o...', 'Parnasianismo', 'Romantismo', 'Modernismo', 'Barroco'],
      ['Qual obra de Machado de Assis inaugurou o Realismo no Brasil?', 'Memórias Póstumas de Brás Cubas', 'Helena', 'A Moreninha', 'Iracema'],
    ]},
  ]],
  ['M2', 'matematica', [
    { t: 'Trigonometria e progressões', r: 'Na PA, cada termo é o anterior mais uma razão: aₙ = a₁ + (n − 1)r. Na PG, cada termo é o anterior vezes a razão: aₙ = a₁·qⁿ⁻¹. Relação fundamental: sen²x + cos²x = 1.', q: [
      ['Qual é o 10º termo da PA (2, 5, 8, ...)?', '29', '32', '27', '30', 'a₁₀ = 2 + 9 × 3 = 29.'],
      ['Qual é o 5º termo da PG (3, 6, 12, ...)?', '48', '24', '96', '30'],
      ['Quanto vale sen²x + cos²x?', '1', '0', '2', 'tg x'],
      ['Quanto vale cos 60°?', '1/2', '√3/2', '√2/2', '0'],
    ]},
    { t: 'Combinatória, probabilidade e matrizes', r: 'O fatorial n! multiplica n por todos os naturais menores. Arranjos consideram a ordem; combinações, não. O determinante de uma matriz 2×2 é ad − bc.', q: [
      ['Quanto é 5!?', '120', '25', '60', '720'],
      ['De quantas formas 3 pessoas podem se organizar em fila?', '6', '3', '9', '27'],
      ['Qual é o determinante da matriz [[2, 3], [1, 4]]?', '5', '11', '8', '−5', '2 × 4 − 3 × 1 = 5.'],
      ['Quantas duplas diferentes podem ser formadas com 4 pessoas?', '6', '12', '8', '4', 'C(4,2) = 6.'],
    ]},
  ]],
  ['M2', 'fisica', [
    { t: 'Termologia', r: 'Temperatura mede a agitação das partículas; calor é energia em trânsito. Conversões: K = °C + 273. Calor sensível: Q = m·c·ΔT. A 1ª lei da termodinâmica expressa a conservação da energia.', q: [
      ['Quanto vale 27 °C em kelvin?', '300 K', '246 K', '27 K', '327 K'],
      ['Qual é a temperatura de ebulição da água ao nível do mar?', '100 °C', '0 °C', '212 °C', '373 °C'],
      ['Calor é definido como...', 'Energia térmica em trânsito', 'Medida da temperatura', 'Um tipo de matéria', 'Ausência de frio'],
      ['Durante a mudança de estado físico de uma substância pura, a temperatura...', 'Permanece constante', 'Sempre aumenta', 'Sempre diminui', 'Oscila'],
    ]},
    { t: 'Óptica e ondas', r: 'A luz sofre reflexão e refração. Em ondas, v = λ·f: a velocidade é o comprimento de onda vezes a frequência. A frequência é medida em hertz.', q: [
      ['Uma onda tem frequência de 10 Hz e comprimento de onda de 2 m. Qual é sua velocidade?', '20 m/s', '5 m/s', '12 m/s', '0,2 m/s'],
      ['O desvio da luz ao mudar de meio é a...', 'Refração', 'Reflexão', 'Difração', 'Polarização'],
      ['Qual é a velocidade aproximada da luz no vácuo?', '300 000 km/s', '340 m/s', '150 000 km/s', '3 000 km/s'],
      ['Qual lente corrige a miopia?', 'Divergente', 'Convergente', 'Cilíndrica', 'Plana'],
    ]},
  ]],
  ['M2', 'quimica', [
    { t: 'Estequiometria e soluções', r: 'Um mol contém 6,02 × 10²³ partículas. A massa molar relaciona massa e quantidade de matéria. A concentração comum é a razão entre a massa do soluto e o volume da solução.', q: [
      ['Qual é a massa molar da água (H = 1, O = 16)?', '18 g/mol', '17 g/mol', '16 g/mol', '20 g/mol'],
      ['Quantas partículas há em 1 mol?', '6,02 × 10²³', '6,02 × 10²', '1,0 × 10²³', '3,14 × 10²³'],
      ['Dissolvendo 20 g de sal em 2 L de solução, a concentração é...', '10 g/L', '40 g/L', '20 g/L', '0,1 g/L'],
      ['Em uma solução de água e açúcar, a água é o...', 'Solvente', 'Soluto', 'Precipitado', 'Catalisador'],
    ]},
    { t: 'Termoquímica, cinética e equilíbrio', r: 'Reações exotérmicas liberam calor (ΔH < 0); endotérmicas absorvem (ΔH > 0). Temperatura, concentração e catalisadores alteram a velocidade das reações. O pH mede a acidez.', q: [
      ['Uma reação que libera calor é...', 'Exotérmica', 'Endotérmica', 'Isotérmica', 'Atérmica'],
      ['Uma substância que acelera a reação sem ser consumida é um...', 'Catalisador', 'Reagente', 'Produto', 'Inibidor'],
      ['Uma solução com pH 3 é...', 'Ácida', 'Básica', 'Neutra', 'Salina'],
      ['Qual é o pH da água pura a 25 °C?', '7', '0', '14', '1'],
    ]},
  ]],
  ['M2', 'biologia', [
    { t: 'Classificação dos seres vivos', r: 'A classificação segue a hierarquia reino, filo, classe, ordem, família, gênero e espécie. Os vírus são acelulares e só se reproduzem dentro de células.', q: [
      ['Qual é a categoria mais específica da classificação biológica?', 'Espécie', 'Gênero', 'Família', 'Reino'],
      ['Cogumelos e leveduras pertencem ao reino...', 'Fungi', 'Plantae', 'Monera', 'Protista'],
      ['Os vírus são considerados...', 'Parasitas intracelulares obrigatórios', 'Bactérias pequenas', 'Células procariontes', 'Fungos microscópicos'],
      ['No nome científico "Homo sapiens", a palavra "Homo" indica o...', 'Gênero', 'Reino', 'Família', 'Filo'],
    ]},
    { t: 'Fisiologia humana e botânica', r: 'Os rins filtram o sangue; a insulina regula a glicose; os neurônios transmitem impulsos nervosos. Nas plantas, o xilema leva água e sais e o floema leva a seiva elaborada.', q: [
      ['Qual hormônio reduz a taxa de glicose no sangue?', 'Insulina', 'Adrenalina', 'Glucagon', 'Tiroxina'],
      ['Qual órgão filtra o sangue e produz a urina?', 'Rim', 'Fígado', 'Baço', 'Pâncreas'],
      ['Qual tecido vegetal transporta água e sais minerais das raízes às folhas?', 'Xilema', 'Floema', 'Epiderme', 'Parênquima'],
      ['Qual é a célula do sistema nervoso que transmite impulsos?', 'Neurônio', 'Hemácia', 'Leucócito', 'Osteócito'],
    ]},
  ]],
  ['M2', 'historia', [
    { t: 'Revoluções e século XIX', r: 'A Revolução Industrial transformou o trabalho e as cidades. As revoluções liberais e o nacionalismo redesenharam a Europa. No fim do século XIX, o imperialismo repartiu África e Ásia entre potências europeias.', q: [
      ['Qual conferência (1884-1885) organizou a partilha da África entre potências europeias?', 'Conferência de Berlim', 'Congresso de Viena', 'Tratado de Versalhes', 'Conferência de Yalta'],
      ['Quem liderou a França após a Revolução e se coroou imperador em 1804?', 'Napoleão Bonaparte', 'Luís XVI', 'Robespierre', 'Luís XVIII'],
      ['Quem escreveu o "Manifesto Comunista" com Friedrich Engels?', 'Karl Marx', 'Adam Smith', 'Lenin', 'Proudhon'],
      ['A independência dos Estados Unidos foi declarada em...', '1776', '1789', '1812', '1865'],
    ]},
    { t: 'Brasil Império', r: 'O Primeiro Reinado (1822-1831) foi de D. Pedro I; seguiu-se o Período Regencial, com várias revoltas; no Segundo Reinado (1840-1889), o café tornou-se a base da economia.', q: [
      ['Qual produto foi a base da economia do Segundo Reinado?', 'Café', 'Açúcar', 'Ouro', 'Borracha'],
      ['Qual foi o maior conflito armado da América do Sul, entre 1864 e 1870?', 'Guerra do Paraguai', 'Guerra de Canudos', 'Guerra dos Farrapos', 'Guerra da Cisplatina'],
      ['Qual lei de 1850 proibiu o tráfico de africanos escravizados para o Brasil?', 'Lei Eusébio de Queirós', 'Lei Áurea', 'Lei do Ventre Livre', 'Lei dos Sexagenários'],
      ['A revolta regencial ocorrida no Rio Grande do Sul foi a...', 'Farroupilha', 'Cabanagem', 'Sabinada', 'Balaiada'],
    ]},
  ]],
  ['M2', 'geografia', [
    { t: 'População e urbanização', r: 'A transição demográfica descreve a queda das taxas de mortalidade e natalidade. A urbanização acelerada gerou metrópoles, conurbações e problemas como falta de moradia e mobilidade.', q: [
      ['O encontro de duas ou mais cidades que crescem até se unirem é a...', 'Conurbação', 'Metropolização', 'Gentrificação', 'Verticalização'],
      ['A população entre 15 e 64 anos disponível para o trabalho é parte da...', 'População economicamente ativa', 'Taxa de natalidade', 'População relativa', 'Migração pendular'],
      ['O deslocamento diário entre a casa em uma cidade e o trabalho em outra é a migração...', 'Pendular', 'Sazonal', 'Definitiva', 'Internacional'],
      ['O número de habitantes por quilômetro quadrado é a...', 'Densidade demográfica', 'População absoluta', 'Taxa de fecundidade', 'Expectativa de vida'],
    ]},
    { t: 'Indústria, energia e agropecuária', r: 'A indústria passou por três revoluções tecnológicas e caminha para a quarta. A matriz energética mundial ainda depende de combustíveis fósseis. O agronegócio é forte nas exportações brasileiras.', q: [
      ['Qual é o principal combustível fóssil usado no mundo?', 'Petróleo', 'Urânio', 'Etanol', 'Biomassa'],
      ['O sistema de produção em série com linha de montagem é o...', 'Fordismo', 'Toyotismo', 'Artesanato', 'Volvismo'],
      ['Qual grão é o principal produto de exportação do agronegócio brasileiro?', 'Soja', 'Trigo', 'Arroz', 'Cevada'],
      ['O sistema produtivo "just in time", com estoques mínimos, é característico do...', 'Toyotismo', 'Fordismo', 'Taylorismo', 'Feudalismo'],
    ]},
  ]],
  ['M2', 'filosofia', [
    { t: 'Filosofia medieval e moderna', r: 'Na Idade Média, Agostinho e Tomás de Aquino conciliaram fé e razão. Na modernidade, o racionalismo (Descartes) e o empirismo (Locke, Hume) discutiram a origem do conhecimento; Kant buscou uma síntese.', q: [
      ['A frase "Penso, logo existo" é de...', 'Descartes', 'Kant', 'Hume', 'Locke'],
      ['Para o empirismo, o conhecimento vem...', 'Da experiência', 'Das ideias inatas', 'Da revelação divina', 'Da intuição pura'],
      ['Qual filósofo medieval escreveu a "Suma Teológica"?', 'Tomás de Aquino', 'Agostinho', 'Anselmo', 'Boécio'],
      ['Quem afirmou que a mente é uma "tábula rasa" ao nascer?', 'John Locke', 'René Descartes', 'Platão', 'Leibniz'],
    ]},
    { t: 'Ética', r: 'A ética reflete sobre o agir humano. Aristóteles defendia a virtude como meio-termo; Kant, o dever e o imperativo categórico; o utilitarismo, a maior felicidade para o maior número.', q: [
      ['O "imperativo categórico" é um conceito de...', 'Kant', 'Aristóteles', 'Mill', 'Nietzsche'],
      ['A ética que busca "a maior felicidade para o maior número" é o...', 'Utilitarismo', 'Estoicismo', 'Existencialismo', 'Ceticismo'],
      ['Para Aristóteles, a virtude está...', 'No meio-termo entre dois excessos', 'No prazer imediato', 'Na obediência cega', 'Na riqueza'],
      ['Quais filósofos são os principais nomes do utilitarismo?', 'Bentham e Stuart Mill', 'Platão e Sócrates', 'Hegel e Marx', 'Sartre e Camus'],
    ]},
  ]],
  ['M2', 'sociologia', [
    { t: 'Estratificação e desigualdade', r: 'Estratificação é a divisão da sociedade em camadas: castas, estamentos ou classes. Mobilidade social é a mudança de posição. No Brasil, a desigualdade está ligada a renda, raça e gênero.', q: [
      ['O sistema de estratificação baseado no nascimento, sem mobilidade, é o de...', 'Castas', 'Classes', 'Estamentos', 'Méritos'],
      ['A mudança de posição de uma pessoa na hierarquia social é a...', 'Mobilidade social', 'Socialização', 'Alienação', 'Anomia'],
      ['Qual índice mede a desigualdade de renda?', 'Índice de Gini', 'IDH', 'PIB', 'IPCA'],
      ['Na sociedade feudal, a estratificação se dava por...', 'Estamentos', 'Classes', 'Castas', 'Tribos'],
    ]},
    { t: 'Trabalho e movimentos sociais', r: 'Para Marx, a mais-valia é o valor produzido pelo trabalhador e não pago. Movimentos sociais são ações coletivas que buscam mudanças, como os movimentos operário, negro, feminista e ambientalista.', q: [
      ['O valor produzido pelo trabalhador e apropriado pelo capitalista é a...', 'Mais-valia', 'Inflação', 'Renda mínima', 'Taxa de juros'],
      ['A perda de sentido do trabalhador em relação ao que produz é a...', 'Alienação', 'Socialização', 'Anomia', 'Burocracia'],
      ['Para Durkheim, a ausência ou enfraquecimento das normas sociais é a...', 'Anomia', 'Alienação', 'Coerção', 'Solidariedade'],
      ['A organização que representa trabalhadores de uma categoria é o...', 'Sindicato', 'Cartório', 'Partido', 'Tribunal'],
    ]},
  ]],
  ['M2', 'ingles', [
    { t: 'Conditionals', r: 'Zero conditional: fatos (If you heat ice, it melts). First: possibilidades reais (If it rains, I will stay). Second: hipóteses (If I had money, I would travel).', q: [
      ['Complete: "If it rains, I ___ at home."', 'will stay', 'would stay', 'stayed', 'staying'],
      ['Complete: "If I ___ rich, I would travel the world."', 'were', 'am', 'will be', 'be'],
      ['Complete: "If you heat water to 100 °C, it ___."', 'boils', 'boiled', 'would boil', 'boiling'],
      ['A frase "If I had time, I would help you" expressa...', 'Uma situação hipotética', 'Um fato científico', 'Uma ordem', 'Um plano certo'],
    ]},
    { t: 'Passive voice', r: 'A voz passiva usa o verbo to be + particípio passado e destaca quem sofre a ação: "The book was written by her."', q: [
      ['Qual é a voz passiva de "They built the house"?', 'The house was built by them.', 'The house built them.', 'The house is build by them.', 'They were built the house.'],
      ['Complete: "English ___ spoken all over the world."', 'is', 'are', 'be', 'has'],
      ['Complete: "The letter was ___ yesterday."', 'sent', 'send', 'sending', 'sends'],
      ['Na voz passiva, quem pratica a ação é introduzido por...', 'by', 'for', 'to', 'with'],
    ]},
  ]],

  // ───────────── 3ª SÉRIE ─────────────
  ['M3', 'portugues', [
    { t: 'Modernismo', r: 'A Semana de 1922 abriu a 1ª fase (ruptura e humor). A 2ª fase teve o romance regionalista de 30 e a poesia de Drummond. A 3ª trouxe Guimarães Rosa e Clarice Lispector.', q: [
      ['Quem escreveu "Macunaíma"?', 'Mário de Andrade', 'Oswald de Andrade', 'Manuel Bandeira', 'Graciliano Ramos'],
      ['Qual obra de Graciliano Ramos retrata uma família de retirantes?', 'Vidas Secas', 'Capitães da Areia', 'O Quinze', 'Grande Sertão: Veredas'],
      ['Quem escreveu "Grande Sertão: Veredas"?', 'Guimarães Rosa', 'Clarice Lispector', 'Jorge Amado', 'Érico Veríssimo'],
      ['O poema "No meio do caminho" é de...', 'Carlos Drummond de Andrade', 'Cecília Meireles', 'Vinicius de Moraes', 'João Cabral de Melo Neto'],
    ]},
    { t: 'Texto dissertativo-argumentativo', r: 'A redação dissertativa defende uma tese com argumentos. Estrutura: introdução (tema e tese), desenvolvimento (argumentos) e conclusão. No Enem, a conclusão traz uma proposta de intervenção.', q: [
      ['A ideia central defendida em um texto argumentativo é a...', 'Tese', 'Epígrafe', 'Narrativa', 'Sinopse'],
      ['Na redação do Enem, a conclusão deve apresentar...', 'Uma proposta de intervenção', 'Uma nova tese', 'Um diálogo', 'Uma citação obrigatória'],
      ['Qual conectivo indica oposição de ideias?', 'Entretanto', 'Portanto', 'Além disso', 'Porque'],
      ['Os mecanismos que ligam as partes do texto garantem a...', 'Coesão', 'Ortografia', 'Ficção', 'Rima'],
    ]},
  ]],
  ['M3', 'matematica', [
    { t: 'Geometria analítica e espacial', r: 'A distância entre dois pontos vem do teorema de Pitágoras. A equação reduzida da reta é y = mx + n. Volumes: cubo a³, cilindro πr²h, esfera 4πr³/3.', q: [
      ['Qual é a distância entre os pontos A(0, 0) e B(3, 4)?', '5', '7', '12', '25'],
      ['Qual é o coeficiente angular da reta y = 3x − 2?', '3', '−2', '2', '1/3'],
      ['Qual é o volume de um cubo de aresta 3 cm?', '27 cm³', '9 cm³', '18 cm³', '54 cm³'],
      ['Quantas faces tem um cubo?', '6', '8', '12', '4'],
    ]},
    { t: 'Estatística e números complexos', r: 'Média é a soma dividida pela quantidade; mediana é o valor central; moda é o mais frequente. Nos complexos, i² = −1 e todo número tem a forma a + bi.', q: [
      ['Qual é a média de 4, 6, 8 e 10?', '7', '6', '8', '28'],
      ['Qual é a mediana de 3, 5, 7, 9 e 11?', '7', '5', '9', '35'],
      ['Quanto vale i²?', '−1', '1', 'i', '0'],
      ['Qual é a moda do conjunto 2, 3, 3, 5, 7?', '3', '2', '4', '5'],
    ]},
  ]],
  ['M3', 'fisica', [
    { t: 'Eletricidade', r: 'Cargas de mesmo sinal se repelem e de sinais opostos se atraem. Lei de Ohm: U = R·i. Potência elétrica: P = U·i. Em série, as resistências se somam.', q: [
      ['Um resistor de 10 Ω é percorrido por 2 A. Qual é a tensão?', '20 V', '5 V', '12 V', '0,2 V'],
      ['Um aparelho ligado em 110 V consome 2 A. Qual é sua potência?', '220 W', '55 W', '112 W', '440 W'],
      ['Dois resistores de 4 Ω e 6 Ω em série equivalem a...', '10 Ω', '2,4 Ω', '24 Ω', '2 Ω'],
      ['Cargas elétricas de sinais opostos...', 'Atraem-se', 'Repelem-se', 'Anulam a gravidade', 'Não interagem'],
    ]},
    { t: 'Eletromagnetismo e física moderna', r: 'Correntes elétricas geram campos magnéticos, e a variação do fluxo magnético induz corrente (Faraday). Einstein formulou a relatividade e explicou o efeito fotoelétrico com os fótons.', q: [
      ['Quem formulou a teoria da relatividade?', 'Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Max Planck'],
      ['A indução eletromagnética foi descoberta por...', 'Faraday', 'Coulomb', 'Ohm', 'Joule'],
      ['A famosa equação E = mc² relaciona energia e...', 'Massa', 'Carga', 'Temperatura', 'Pressão'],
      ['O "pacote" de energia da luz é chamado de...', 'Fóton', 'Elétron', 'Nêutron', 'Quark'],
    ]},
  ]],
  ['M3', 'quimica', [
    { t: 'Química orgânica', r: 'A química orgânica estuda os compostos de carbono, que faz quatro ligações. Funções: hidrocarboneto, álcool (–OH), ácido carboxílico (–COOH), aldeído, cetona, éster, amina.', q: [
      ['Quantas ligações covalentes o carbono normalmente faz?', '4', '2', '3', '1'],
      ['Qual é a fórmula do metano?', 'CH₄', 'C₂H₆', 'CO₂', 'CH₃OH'],
      ['O grupo –OH ligado a carbono saturado caracteriza a função...', 'Álcool', 'Cetona', 'Éter', 'Amina'],
      ['O etanol pertence a qual função orgânica?', 'Álcool', 'Ácido carboxílico', 'Aldeído', 'Hidrocarboneto'],
    ]},
    { t: 'Eletroquímica e radioatividade', r: 'Oxidação é perda de elétrons; redução é ganho. Pilhas transformam energia química em elétrica. Na radioatividade, núcleos instáveis emitem partículas alfa, beta ou radiação gama.', q: [
      ['A perda de elétrons por uma espécie química é a...', 'Oxidação', 'Redução', 'Neutralização', 'Hidrólise'],
      ['Qual emissão radioativa tem maior poder de penetração?', 'Gama', 'Alfa', 'Beta', 'Todas têm o mesmo poder'],
      ['O tempo para que metade dos átomos de uma amostra radioativa se desintegre é a...', 'Meia-vida', 'Vida útil', 'Constante de Avogadro', 'Massa crítica'],
      ['Em uma pilha, o eletrodo em que ocorre a oxidação é o...', 'Ânodo', 'Cátodo', 'Ponte salina', 'Eletrólito'],
    ]},
  ]],
  ['M3', 'biologia', [
    { t: 'Genética', r: 'Genes têm versões chamadas alelos. Homozigotos têm dois alelos iguais; heterozigotos, diferentes. No sistema ABO, o tipo O é doador universal e o AB é receptor universal.', q: [
      ['No cruzamento Aa × Aa, qual é a proporção esperada de aa?', '25%', '50%', '75%', '0%'],
      ['Qual tipo sanguíneo é o doador universal?', 'O negativo', 'AB positivo', 'A positivo', 'B negativo'],
      ['Um indivíduo com alelos diferentes para um gene (Aa) é...', 'Heterozigoto', 'Homozigoto dominante', 'Homozigoto recessivo', 'Haploide'],
      ['Quantos cromossomos tem uma célula somática humana?', '46', '23', '48', '44'],
    ]},
    { t: 'Evolução e ecologia', r: 'A seleção natural favorece os indivíduos mais adaptados. Em ecologia, população é o conjunto de indivíduos de uma espécie; comunidade reúne as populações; ecossistema inclui o ambiente físico.', q: [
      ['A relação em que as duas espécies se beneficiam é o...', 'Mutualismo', 'Parasitismo', 'Predatismo', 'Competição'],
      ['Estruturas de mesma origem embrionária em espécies diferentes são órgãos...', 'Homólogos', 'Análogos', 'Vestigiais', 'Artificiais'],
      ['Em uma cadeia alimentar, a energia disponível a cada nível trófico...', 'Diminui', 'Aumenta', 'Permanece igual', 'Dobra'],
      ['O aumento da concentração de poluentes ao longo da cadeia alimentar é a...', 'Magnificação trófica', 'Eutrofização', 'Sucessão ecológica', 'Fotossíntese'],
    ]},
  ]],
  ['M3', 'historia', [
    { t: 'Mundo contemporâneo', r: 'O século XX teve duas guerras mundiais, a Revolução Russa (1917), a crise de 1929, regimes totalitários e a Guerra Fria. Em 1991, a União Soviética deixou de existir.', q: [
      ['Em que ano ocorreu a Revolução Russa?', '1917', '1905', '1929', '1945'],
      ['Qual acontecimento desencadeou a crise econômica de 1929?', 'Quebra da Bolsa de Nova York', 'Fim da Primeira Guerra', 'Revolução Russa', 'Ataque a Pearl Harbor'],
      ['Qual regime totalitário foi liderado por Adolf Hitler?', 'Nazismo', 'Fascismo italiano', 'Stalinismo', 'Franquismo'],
      ['Em que ano a União Soviética foi dissolvida?', '1991', '1989', '1985', '2001'],
    ]},
    { t: 'Brasil República', r: 'Vargas instaurou o Estado Novo em 1937. Juscelino Kubitschek construiu Brasília. O golpe de 1964 iniciou a ditadura, endurecida pelo AI-5 em 1968. A Constituição de 1988 consolidou a redemocratização.', q: [
      ['Qual presidente construiu Brasília com o lema "50 anos em 5"?', 'Juscelino Kubitschek', 'Getúlio Vargas', 'João Goulart', 'Jânio Quadros'],
      ['Qual ato institucional de 1968 fechou o Congresso e suspendeu direitos?', 'AI-5', 'AI-1', 'AI-2', 'AI-12'],
      ['O movimento de 1984 que pedia eleições diretas para presidente foi o...', 'Diretas Já', 'Caras-Pintadas', 'Tenentismo', 'Queremismo'],
      ['A ditadura do Estado Novo foi instaurada por Vargas em...', '1937', '1930', '1945', '1954'],
    ]},
  ]],
  ['M3', 'geografia', [
    { t: 'Geopolítica e globalização', r: 'Após a Guerra Fria, o mundo tornou-se multipolar. A ONU busca manter a paz; a OMC regula o comércio. A globalização integra mercados, mas também amplia desigualdades.', q: [
      ['Qual órgão da ONU tem cinco membros permanentes com poder de veto?', 'Conselho de Segurança', 'Assembleia Geral', 'UNESCO', 'FAO'],
      ['Qual organização regula o comércio internacional?', 'OMC', 'OMS', 'OTAN', 'OEA'],
      ['A aliança militar ocidental criada em 1949 é a...', 'OTAN', 'ONU', 'OPEP', 'Pacto de Varsóvia'],
      ['A ordem mundial da Guerra Fria, com duas superpotências, era chamada de...', 'Bipolar', 'Multipolar', 'Unipolar', 'Apolar'],
    ]},
    { t: 'Questões ambientais', r: 'O aquecimento global está ligado à emissão de gases de efeito estufa. O desenvolvimento sustentável busca atender às necessidades atuais sem comprometer as futuras gerações.', q: [
      ['Qual acordo internacional de 2015 busca limitar o aquecimento global?', 'Acordo de Paris', 'Protocolo de Montreal', 'Tratado de Tordesilhas', 'Tratado de Roma'],
      ['O Protocolo de Montreal teve como objetivo proteger...', 'A camada de ozônio', 'As florestas tropicais', 'Os oceanos', 'As geleiras'],
      ['Atender às necessidades do presente sem comprometer as gerações futuras é o...', 'Desenvolvimento sustentável', 'Crescimento zero', 'Extrativismo', 'Consumismo'],
      ['O aquecimento do centro das cidades em relação ao entorno é o fenômeno da...', 'Ilha de calor', 'Inversão térmica', 'Chuva ácida', 'Desertificação'],
    ]},
  ]],
  ['M3', 'filosofia', [
    { t: 'Filosofia política', r: 'Os contratualistas explicam a origem do Estado por um pacto: Hobbes defende um soberano forte; Locke, os direitos naturais; Rousseau, a vontade geral. Montesquieu propôs a separação dos três poderes.', q: [
      ['Quem afirmou que "o homem é o lobo do homem"?', 'Thomas Hobbes', 'John Locke', 'Rousseau', 'Montesquieu'],
      ['A separação dos poderes em Executivo, Legislativo e Judiciário foi proposta por...', 'Montesquieu', 'Maquiavel', 'Hobbes', 'Voltaire'],
      ['O conceito de "vontade geral" pertence a...', 'Rousseau', 'Locke', 'Hobbes', 'Kant'],
      ['Para John Locke, são direitos naturais...', 'Vida, liberdade e propriedade', 'Poder, glória e riqueza', 'Fé, esperança e caridade', 'Ordem, obediência e tradição'],
    ]},
    { t: 'Filosofia contemporânea', r: 'Nietzsche criticou a moral tradicional. O existencialismo de Sartre afirma que a existência precede a essência. A Escola de Frankfurt analisou a indústria cultural.', q: [
      ['Quem afirmou que "a existência precede a essência"?', 'Sartre', 'Nietzsche', 'Heidegger', 'Foucault'],
      ['O conceito de "indústria cultural" foi criado por...', 'Adorno e Horkheimer', 'Marx e Engels', 'Sartre e Beauvoir', 'Deleuze e Guattari'],
      ['A frase "Deus está morto" é de...', 'Nietzsche', 'Kierkegaard', 'Schopenhauer', 'Hegel'],
      ['Quem escreveu "O Segundo Sexo", obra fundamental do feminismo?', 'Simone de Beauvoir', 'Hannah Arendt', 'Judith Butler', 'Rosa Luxemburgo'],
    ]},
  ]],
  ['M3', 'sociologia', [
    { t: 'Estado, poder e cidadania', r: 'Para Weber, o Estado detém o monopólio legítimo da força. A cidadania reúne direitos civis, políticos e sociais. A democracia pode ser direta, representativa ou participativa.', q: [
      ['Para Weber, o Estado se define pelo monopólio legítimo da...', 'Força', 'Riqueza', 'Religião', 'Informação'],
      ['O direito de votar e ser votado é um direito...', 'Político', 'Civil', 'Social', 'Econômico'],
      ['Saúde e educação públicas são direitos...', 'Sociais', 'Civis', 'Políticos', 'Naturais'],
      ['A dominação baseada em leis e regras impessoais é, para Weber, a dominação...', 'Racional-legal', 'Carismática', 'Tradicional', 'Patriarcal'],
    ]},
    { t: 'Cultura, mídia e globalização', r: 'A indústria cultural transforma a cultura em mercadoria. As redes digitais mudaram a forma de se informar e se relacionar. Bauman chamou de "modernidade líquida" a fluidez das relações atuais.', q: [
      ['Quem criou o conceito de "modernidade líquida"?', 'Zygmunt Bauman', 'Pierre Bourdieu', 'Anthony Giddens', 'Manuel Castells'],
      ['Notícias falsas espalhadas para enganar são chamadas de...', 'Fake news', 'Spam', 'Hashtags', 'Podcasts'],
      ['O conceito de "capital cultural" foi desenvolvido por...', 'Pierre Bourdieu', 'Max Weber', 'Karl Marx', 'Auguste Comte'],
      ['A expressão "sociedade em rede" está associada a...', 'Manuel Castells', 'Émile Durkheim', 'Zygmunt Bauman', 'Michel Foucault'],
    ]},
  ]],
  ['M3', 'ingles', [
    { t: 'Reported speech and relative clauses', r: 'No discurso indireto, o tempo verbal recua (says → said). Pronomes relativos: who (pessoas), which (coisas), where (lugares), whose (posse).', q: [
      ['Passe para o discurso indireto: He said, "I am tired."', 'He said that he was tired.', 'He said that I am tired.', 'He said that he is tired now.', 'He says he was tired.'],
      ['Complete: "The man ___ lives next door is a doctor."', 'who', 'which', 'where', 'whose'],
      ['Complete: "This is the city ___ I was born."', 'where', 'who', 'which', 'whose'],
      ['Complete: "The girl ___ bag was stolen called the police."', 'whose', 'who', 'which', 'whom'],
    ]},
    { t: 'Linking words and text interpretation', r: 'Conectivos organizam as ideias: however (contraste), therefore (conclusão), because (causa), although (concessão), moreover (adição).', q: [
      ['"However" expressa ideia de...', 'Contraste', 'Adição', 'Causa', 'Conclusão'],
      ['Qual conectivo significa "portanto"?', 'Therefore', 'Although', 'Moreover', 'Unless'],
      ['"Although it was raining, we went out." A palavra "although" significa...', 'Embora', 'Porque', 'Então', 'Quando'],
      ['Qual conectivo indica adição de ideias?', 'Moreover', 'However', 'Unless', 'Instead'],
    ]},
  ]],
];
