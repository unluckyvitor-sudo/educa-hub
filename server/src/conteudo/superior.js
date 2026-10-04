// Ensino Superior — ciclo básico de três grandes áreas. Formato de cada questão:
// [enunciado, resposta correta, errada, errada, errada, explicação opcional]
export default [
  // ───────────── EXATAS E TECNOLOGIA ─────────────
  ['UEX', 'calculo', [
    { t: 'Limites e derivadas', r: 'O limite descreve o comportamento de uma função perto de um ponto. A derivada mede a taxa de variação instantânea. Regras: (xⁿ)′ = n·xⁿ⁻¹, (sen x)′ = cos x, (eˣ)′ = eˣ.', q: [
      ['Qual é a derivada de f(x) = x³?', '3x²', 'x²', '3x', 'x⁴/4'],
      ['Qual é o valor de lim (x→0) sen(x)/x?', '1', '0', '∞', 'Não existe'],
      ['Qual é a derivada de f(x) = eˣ?', 'eˣ', 'x·eˣ⁻¹', 'ln x', '1/x'],
      ['Se f′(a) = 0 e f″(a) > 0, o ponto x = a é um...', 'Mínimo local', 'Máximo local', 'Ponto de inflexão', 'Ponto de descontinuidade'],
    ]},
    { t: 'Integrais', r: 'A integral é a operação inversa da derivada e permite calcular áreas. O Teorema Fundamental do Cálculo liga as duas: ∫ₐᵇ f(x)dx = F(b) − F(a).', q: [
      ['Qual é a integral indefinida de 2x?', 'x² + C', '2 + C', 'x²/2 + C', '2x² + C'],
      ['Quanto vale a integral de 0 a 1 de x dx?', '1/2', '1', '2', '0'],
      ['Qual é a integral indefinida de 1/x (x > 0)?', 'ln x + C', '−1/x² + C', 'x⁻² + C', 'eˣ + C'],
      ['Qual é a integral indefinida de cos x?', 'sen x + C', '−sen x + C', 'cos x + C', 'tg x + C'],
    ]},
  ]],
  ['UEX', 'algebra', [
    { t: 'Matrizes e sistemas lineares', r: 'Sistemas lineares podem ser escritos como Ax = b. Uma matriz quadrada é invertível se, e somente se, seu determinante é diferente de zero. O escalonamento (eliminação de Gauss) resolve sistemas.', q: [
      ['Uma matriz quadrada é invertível quando seu determinante é...', 'Diferente de zero', 'Igual a zero', 'Igual a um', 'Negativo'],
      ['O produto de uma matriz 2×3 por uma matriz 3×4 resulta em uma matriz...', '2×4', '3×3', '4×2', '2×3'],
      ['O método que transforma o sistema em forma triangular por operações elementares é a...', 'Eliminação de Gauss', 'Regra da cadeia', 'Série de Taylor', 'Interpolação'],
      ['A matriz que, multiplicada por A, resulta em A é a matriz...', 'Identidade', 'Nula', 'Transposta', 'Singular'],
    ]},
    { t: 'Espaços vetoriais e autovalores', r: 'Vetores são linearmente independentes quando nenhum é combinação dos outros. Base é um conjunto LI que gera o espaço; dimensão é o número de vetores da base. Autovetores satisfazem Av = λv.', q: [
      ['Qual é a dimensão do espaço R³?', '3', '2', '9', 'Infinita'],
      ['Na equação Av = λv, o escalar λ é chamado de...', 'Autovalor', 'Determinante', 'Traço', 'Posto'],
      ['Dois vetores são ortogonais quando seu produto interno é...', '0', '1', '−1', 'Máximo'],
      ['Quais são os autovalores de uma matriz diagonal com entradas 2 e 5?', '2 e 5', '7 e 10', '0 e 1', '−2 e −5'],
    ]},
  ]],
  ['UEX', 'fisicageral', [
    { t: 'Mecânica', r: 'Energia cinética: Ec = mv²/2. Energia potencial gravitacional: Ep = mgh. Trabalho é força vezes deslocamento. Em sistemas isolados, o momento linear se conserva.', q: [
      ['Qual é a energia cinética de um corpo de 2 kg a 3 m/s?', '9 J', '6 J', '18 J', '3 J'],
      ['A grandeza conservada em uma colisão em sistema isolado é...', 'O momento linear', 'A velocidade de cada corpo', 'A energia cinética, sempre', 'A aceleração'],
      ['Qual é o trabalho de uma força de 10 N ao longo de 5 m na direção do movimento?', '50 J', '2 J', '15 J', '500 J'],
      ['Qual é a unidade de energia no SI?', 'Joule', 'Newton', 'Watt', 'Pascal'],
    ]},
    { t: 'Eletromagnetismo e termodinâmica', r: 'As equações de Maxwell unificam eletricidade e magnetismo. A 2ª lei da termodinâmica afirma que a entropia de um sistema isolado nunca diminui. Nenhuma máquina térmica tem rendimento de 100%.', q: [
      ['A grandeza associada à desordem de um sistema é a...', 'Entropia', 'Entalpia', 'Energia interna', 'Capacidade térmica'],
      ['A lei que descreve a força entre duas cargas pontuais é a Lei de...', 'Coulomb', 'Faraday', 'Ampère', 'Lenz'],
      ['O rendimento máximo teórico de uma máquina térmica é dado pelo ciclo de...', 'Carnot', 'Otto', 'Diesel', 'Rankine'],
      ['As quatro equações que resumem o eletromagnetismo clássico são de...', 'Maxwell', 'Newton', 'Bohr', 'Schrödinger'],
    ]},
  ]],
  ['UEX', 'estatistica', [
    { t: 'Estatística descritiva', r: 'Medidas de posição (média, mediana, moda) resumem o centro dos dados; medidas de dispersão (variância, desvio padrão) indicam o quanto variam. O desvio padrão é a raiz quadrada da variância.', q: [
      ['O desvio padrão é a raiz quadrada da...', 'Variância', 'Média', 'Mediana', 'Amplitude'],
      ['Qual medida é menos sensível a valores extremos (outliers)?', 'Mediana', 'Média', 'Amplitude', 'Variância'],
      ['Um coeficiente de correlação próximo de −1 indica relação...', 'Linear negativa forte', 'Inexistente', 'Linear positiva forte', 'Aleatória'],
      ['O gráfico que mostra a distribuição de frequências de uma variável contínua é o...', 'Histograma', 'Organograma', 'Fluxograma', 'Cartograma'],
    ]},
    { t: 'Probabilidade e inferência', r: 'A distribuição normal é simétrica em torno da média. Em testes de hipóteses, o valor-p é a probabilidade de observar dados tão extremos se a hipótese nula for verdadeira.', q: [
      ['Em uma distribuição normal, aproximadamente quanto dos dados fica a até 1 desvio padrão da média?', '68%', '50%', '95%', '99,7%'],
      ['Rejeitar uma hipótese nula verdadeira é o erro do tipo...', 'I', 'II', 'III', 'Padrão'],
      ['Eventos independentes A e B satisfazem P(A ∩ B) =', 'P(A) · P(B)', 'P(A) + P(B)', 'P(A) − P(B)', 'P(A | B)'],
      ['O teorema que garante que médias amostrais tendem à normal é o...', 'Teorema Central do Limite', 'Teorema de Bayes', 'Teorema de Pitágoras', 'Teorema de Tales'],
    ]},
  ]],
  ['UEX', 'programacao', [
    { t: 'Lógica e algoritmos', r: 'Algoritmo é uma sequência finita de passos para resolver um problema. Estruturas básicas: sequência, decisão (if/else) e repetição (for/while). A notação O descreve o custo do algoritmo.', q: [
      ['Qual é a complexidade da busca binária em um vetor ordenado?', 'O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
      ['Qual estrutura repete um bloco enquanto uma condição for verdadeira?', 'while', 'if', 'switch', 'return'],
      ['Uma função que chama a si mesma é chamada de...', 'Recursiva', 'Iterativa', 'Anônima', 'Abstrata'],
      ['Qual é a complexidade de pior caso do Bubble Sort?', 'O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
    ]},
    { t: 'Estruturas de dados e orientação a objetos', r: 'Pilha segue LIFO (último a entrar, primeiro a sair); fila segue FIFO. Na orientação a objetos, classes definem atributos e métodos; os pilares são encapsulamento, herança, polimorfismo e abstração.', q: [
      ['Qual estrutura de dados segue a regra "último a entrar, primeiro a sair"?', 'Pilha', 'Fila', 'Árvore', 'Grafo'],
      ['O mecanismo pelo qual uma classe reaproveita atributos e métodos de outra é a...', 'Herança', 'Sobrecarga', 'Compilação', 'Serialização'],
      ['Qual estrutura segue a regra FIFO?', 'Fila', 'Pilha', 'Heap', 'Tabela hash'],
      ['Esconder os detalhes internos de um objeto e expor só o necessário é o...', 'Encapsulamento', 'Polimorfismo', 'Acoplamento', 'Laço'],
    ]},
  ]],

  // ───────────── SAÚDE E BIOLÓGICAS ─────────────
  ['USA', 'anatomia', [
    { t: 'Sistema esquelético e muscular', r: 'O esqueleto adulto tem 206 ossos e se divide em axial (crânio, coluna, tórax) e apendicular (membros). Os músculos podem ser estriados esqueléticos, estriado cardíaco e lisos.', q: [
      ['Quantos ossos tem o esqueleto humano adulto?', '206', '106', '306', '180'],
      ['Qual é o maior osso do corpo humano?', 'Fêmur', 'Úmero', 'Tíbia', 'Fíbula'],
      ['Qual tipo de músculo tem contração voluntária?', 'Estriado esquelético', 'Liso', 'Estriado cardíaco', 'Nenhum'],
      ['Quantas vértebras cervicais tem a coluna vertebral humana?', '7', '5', '12', '4'],
    ]},
    { t: 'Sistemas cardiovascular e nervoso', r: 'O coração tem quatro câmaras: dois átrios e dois ventrículos. O sistema nervoso central é formado por encéfalo e medula espinal; o periférico, por nervos e gânglios.', q: [
      ['Quantas câmaras tem o coração humano?', '4', '2', '3', '6'],
      ['Qual é a maior artéria do corpo humano?', 'Aorta', 'Carótida', 'Femoral', 'Pulmonar'],
      ['O sistema nervoso central é formado por...', 'Encéfalo e medula espinal', 'Nervos e gânglios', 'Cérebro e nervos cranianos', 'Medula e nervos espinais'],
      ['Qual câmara cardíaca bombeia o sangue para a aorta?', 'Ventrículo esquerdo', 'Ventrículo direito', 'Átrio esquerdo', 'Átrio direito'],
    ]},
  ]],
  ['USA', 'fisiologia', [
    { t: 'Homeostase e sistema nervoso', r: 'Homeostase é a manutenção do equilíbrio interno. O potencial de ação é gerado pela entrada de sódio no neurônio; a comunicação entre neurônios ocorre nas sinapses por neurotransmissores.', q: [
      ['A capacidade do organismo de manter o meio interno estável é a...', 'Homeostase', 'Metástase', 'Osmose', 'Hemostasia'],
      ['A despolarização do neurônio ocorre pela entrada de qual íon?', 'Sódio (Na⁺)', 'Potássio (K⁺)', 'Cloreto (Cl⁻)', 'Cálcio (Ca²⁺), exclusivamente'],
      ['A região de comunicação entre dois neurônios é a...', 'Sinapse', 'Bainha de mielina', 'Axônio', 'Dendrito'],
      ['Qual divisão do sistema nervoso autônomo prepara o corpo para "luta ou fuga"?', 'Simpática', 'Parassimpática', 'Somática', 'Entérica'],
    ]},
    { t: 'Fisiologia cardiovascular e renal', r: 'O débito cardíaco é a frequência cardíaca vezes o volume sistólico. O néfron é a unidade funcional do rim e realiza filtração, reabsorção e secreção.', q: [
      ['Qual é a unidade funcional do rim?', 'Néfron', 'Alvéolo', 'Hepatócito', 'Glomérulo, isoladamente'],
      ['O débito cardíaco é o produto da frequência cardíaca pelo...', 'Volume sistólico', 'Volume residual', 'Hematócrito', 'Retorno venoso'],
      ['Qual proteína transporta oxigênio nas hemácias?', 'Hemoglobina', 'Albumina', 'Mioglobina', 'Fibrinogênio'],
      ['Qual hormônio aumenta a reabsorção de água nos rins?', 'ADH (vasopressina)', 'Insulina', 'Tiroxina', 'Cortisol'],
    ]},
  ]],
  ['USA', 'bioquimica', [
    { t: 'Biomoléculas', r: 'Proteínas são formadas por aminoácidos unidos por ligações peptídicas. Carboidratos são a principal fonte rápida de energia; lipídios formam membranas e reservas. Enzimas são catalisadores biológicos.', q: [
      ['Qual ligação une os aminoácidos em uma proteína?', 'Peptídica', 'Glicosídica', 'Fosfodiéster', 'Éster'],
      ['As enzimas atuam nas reações...', 'Diminuindo a energia de ativação', 'Aumentando a energia de ativação', 'Alterando o equilíbrio final', 'Sendo consumidas no processo'],
      ['Qual polissacarídeo é a reserva de energia nos animais?', 'Glicogênio', 'Amido', 'Celulose', 'Quitina'],
      ['Quantos aminoácidos diferentes compõem as proteínas humanas?', '20', '4', '64', '12'],
    ]},
    { t: 'Metabolismo energético', r: 'A glicólise ocorre no citosol e quebra a glicose em piruvato. O ciclo de Krebs e a cadeia respiratória ocorrem na mitocôndria e produzem a maior parte do ATP.', q: [
      ['Onde ocorre a glicólise?', 'No citosol', 'Na matriz mitocondrial', 'No núcleo', 'No retículo endoplasmático'],
      ['Qual é o produto final da glicólise?', 'Piruvato', 'Acetil-CoA', 'Lactose', 'Citrato'],
      ['Qual é o aceptor final de elétrons na cadeia respiratória?', 'Oxigênio', 'Gás carbônico', 'NADH', 'Água'],
      ['Onde ocorre o ciclo de Krebs?', 'Na matriz mitocondrial', 'No citosol', 'No lisossomo', 'Na membrana plasmática'],
    ]},
  ]],
  ['USA', 'genetica', [
    { t: 'Genética molecular', r: 'O dogma central descreve o fluxo da informação: DNA → RNA → proteína. A replicação copia o DNA; a transcrição produz RNA; a tradução, nos ribossomos, produz proteínas.', q: [
      ['A síntese de RNA a partir do DNA é a...', 'Transcrição', 'Tradução', 'Replicação', 'Transdução'],
      ['No DNA, a adenina pareia com a...', 'Timina', 'Citosina', 'Guanina', 'Uracila'],
      ['Quantos nucleotídeos formam um códon?', '3', '2', '4', '20'],
      ['Qual enzima sintetiza a nova fita na replicação do DNA?', 'DNA polimerase', 'RNA polimerase', 'Ligase, exclusivamente', 'Transcriptase reversa'],
    ]},
    { t: 'Herança e mutações', r: 'Mutações são alterações no material genético. Alterações cromossômicas numéricas incluem as trissomias. Doenças ligadas ao X afetam mais os homens, que têm apenas um cromossomo X.', q: [
      ['A síndrome de Down é causada pela trissomia de qual cromossomo?', '21', '18', '13', 'X'],
      ['A hemofilia é uma herança ligada ao cromossomo...', 'X', 'Y', '21', '1'],
      ['O conjunto de cromossomos de uma célula, organizado por tamanho e forma, é o...', 'Cariótipo', 'Genótipo', 'Fenótipo', 'Genoma mitocondrial'],
      ['Qual técnica amplifica trechos de DNA em laboratório?', 'PCR', 'ELISA', 'Western blot', 'Cromatografia'],
    ]},
  ]],
  ['USA', 'farmacologia', [
    { t: 'Farmacocinética', r: 'A farmacocinética estuda o caminho do fármaco no organismo: absorção, distribuição, metabolismo e excreção (ADME). Biodisponibilidade é a fração que chega à circulação sistêmica.', q: [
      ['Qual é o principal órgão de metabolização de fármacos?', 'Fígado', 'Rim', 'Pulmão', 'Baço'],
      ['Qual via de administração tem biodisponibilidade de 100%?', 'Intravenosa', 'Oral', 'Sublingual', 'Retal'],
      ['O tempo para a concentração plasmática do fármaco cair pela metade é a...', 'Meia-vida', 'Latência', 'Janela terapêutica', 'Depuração'],
      ['A metabolização do fármaco no fígado antes de atingir a circulação sistêmica é o...', 'Efeito de primeira passagem', 'Efeito placebo', 'Efeito rebote', 'Efeito teto'],
    ]},
    { t: 'Farmacodinâmica', r: 'A farmacodinâmica estuda o efeito do fármaco no organismo. Agonistas ativam receptores; antagonistas bloqueiam. O índice terapêutico relaciona a dose tóxica à dose eficaz.', q: [
      ['Um fármaco que se liga ao receptor e o ativa é um...', 'Agonista', 'Antagonista', 'Placebo', 'Pró-fármaco'],
      ['Um fármaco que bloqueia o receptor sem ativá-lo é um...', 'Antagonista', 'Agonista pleno', 'Agonista parcial', 'Indutor enzimático'],
      ['Quanto maior o índice terapêutico de um fármaco, ele tende a ser...', 'Mais seguro', 'Mais tóxico', 'Menos eficaz', 'Mais caro'],
      ['A necessidade de doses cada vez maiores para obter o mesmo efeito é a...', 'Tolerância', 'Sinergia', 'Idiossincrasia', 'Biodisponibilidade'],
    ]},
  ]],

  // ───────────── HUMANAS E SOCIAIS ─────────────
  ['UHU', 'direito', [
    { t: 'Introdução ao Direito', r: 'O Direito se divide em público (constitucional, administrativo, penal) e privado (civil, empresarial). São fontes do Direito: a lei, os costumes, a jurisprudência e a doutrina.', q: [
      ['O conjunto de decisões reiteradas dos tribunais é a...', 'Jurisprudência', 'Doutrina', 'Analogia', 'Equidade'],
      ['Qual ramo do Direito regula as relações entre particulares, como contratos e família?', 'Direito Civil', 'Direito Penal', 'Direito Tributário', 'Direito Administrativo'],
      ['No Brasil, a norma de maior hierarquia é a...', 'Constituição Federal', 'Lei ordinária', 'Medida provisória', 'Portaria'],
      ['Os estudos e opiniões dos juristas formam a...', 'Doutrina', 'Jurisprudência', 'Legislação', 'Súmula'],
    ]},
    { t: 'Direito Constitucional', r: 'A Constituição de 1988 organiza o Estado em três poderes independentes e harmônicos. Os direitos fundamentais estão principalmente no artigo 5º. Cláusulas pétreas não podem ser abolidas.', q: [
      ['Qual artigo da Constituição reúne os principais direitos e garantias individuais?', 'Art. 5º', 'Art. 1º', 'Art. 37', 'Art. 144'],
      ['Qual tribunal é o guardião da Constituição?', 'STF', 'STJ', 'TSE', 'TST'],
      ['As matérias que não podem ser abolidas por emenda constitucional são as...', 'Cláusulas pétreas', 'Medidas provisórias', 'Leis complementares', 'Súmulas vinculantes'],
      ['O remédio constitucional que protege a liberdade de locomoção é o...', 'Habeas corpus', 'Habeas data', 'Mandado de injunção', 'Ação popular'],
    ]},
  ]],
  ['UHU', 'psicologia', [
    { t: 'Escolas da Psicologia', r: 'A psicanálise (Freud) destaca o inconsciente; o behaviorismo (Watson, Skinner) estuda o comportamento observável; o humanismo (Rogers, Maslow) valoriza o potencial humano; a psicologia cognitiva estuda os processos mentais.', q: [
      ['Quem é o fundador da psicanálise?', 'Sigmund Freud', 'Carl Jung', 'B. F. Skinner', 'Carl Rogers'],
      ['O condicionamento operante, com reforços e punições, foi estudado por...', 'Skinner', 'Pavlov', 'Freud', 'Piaget'],
      ['A pirâmide das necessidades humanas foi proposta por...', 'Maslow', 'Rogers', 'Bandura', 'Wundt'],
      ['Quem fundou o primeiro laboratório de psicologia experimental, em 1879?', 'Wilhelm Wundt', 'William James', 'John Watson', 'Jean Piaget'],
    ]},
    { t: 'Desenvolvimento e aprendizagem', r: 'Piaget descreveu estágios do desenvolvimento cognitivo. Vygotsky destacou a interação social e a zona de desenvolvimento proximal. Bandura estudou a aprendizagem por observação.', q: [
      ['A "zona de desenvolvimento proximal" é um conceito de...', 'Vygotsky', 'Piaget', 'Skinner', 'Freud'],
      ['Qual é o primeiro estágio do desenvolvimento cognitivo segundo Piaget?', 'Sensório-motor', 'Pré-operatório', 'Operatório concreto', 'Operatório formal'],
      ['A aprendizagem por observação e imitação de modelos foi estudada por...', 'Bandura', 'Watson', 'Erikson', 'Lacan'],
      ['O condicionamento clássico foi descoberto por Pavlov em experimentos com...', 'Cães', 'Pombos', 'Ratos', 'Macacos'],
    ]},
  ]],
  ['UHU', 'sociologia', [
    { t: 'Teoria sociológica clássica', r: 'Durkheim estudou a coesão social (solidariedade mecânica e orgânica); Weber analisou a racionalização e a burocracia; Marx, o modo de produção capitalista e o conflito de classes.', q: [
      ['Quem escreveu "A Ética Protestante e o Espírito do Capitalismo"?', 'Max Weber', 'Karl Marx', 'Émile Durkheim', 'Georg Simmel'],
      ['Para Durkheim, a solidariedade típica das sociedades modernas, com divisão do trabalho, é a...', 'Orgânica', 'Mecânica', 'Tradicional', 'Carismática'],
      ['Qual obra de Durkheim analisa um fenômeno individual como fato social?', 'O Suicídio', 'O Capital', 'Economia e Sociedade', 'A República'],
      ['Para Marx, a base econômica da sociedade é chamada de...', 'Infraestrutura', 'Superestrutura', 'Burocracia', 'Habitus'],
    ]},
    { t: 'Sociologia contemporânea e brasileira', r: 'Bourdieu criou os conceitos de habitus e campo; Foucault analisou as relações de poder. No Brasil, Gilberto Freyre, Sérgio Buarque de Holanda e Florestan Fernandes interpretaram a formação social do país.', q: [
      ['Quem escreveu "Casa-Grande & Senzala"?', 'Gilberto Freyre', 'Sérgio Buarque de Holanda', 'Florestan Fernandes', 'Caio Prado Júnior'],
      ['O conceito de "homem cordial" aparece em qual obra?', 'Raízes do Brasil', 'Os Sertões', 'Formação do Brasil Contemporâneo', 'O Povo Brasileiro'],
      ['Quem escreveu "Vigiar e Punir"?', 'Michel Foucault', 'Pierre Bourdieu', 'Erving Goffman', 'Norbert Elias'],
      ['O conceito de "habitus" foi desenvolvido por...', 'Pierre Bourdieu', 'Anthony Giddens', 'Jürgen Habermas', 'Talcott Parsons'],
    ]},
  ]],
  ['UHU', 'filosofia', [
    { t: 'Epistemologia e lógica', r: 'A epistemologia estuda o conhecimento. Popper propôs a falseabilidade como critério de ciência; Kuhn descreveu as revoluções científicas por mudanças de paradigma. Um silogismo deduz uma conclusão de duas premissas.', q: [
      ['O critério da falseabilidade para distinguir ciência de não ciência é de...', 'Karl Popper', 'Thomas Kuhn', 'Francis Bacon', 'Auguste Comte'],
      ['O conceito de "paradigma" científico foi proposto por...', 'Thomas Kuhn', 'Karl Popper', 'Imre Lakatos', 'Paul Feyerabend'],
      ['O raciocínio que parte de premissas gerais para uma conclusão particular é a...', 'Dedução', 'Indução', 'Abdução', 'Analogia'],
      ['Um argumento que parece válido, mas contém um erro de raciocínio, é uma...', 'Falácia', 'Tautologia', 'Premissa', 'Hipótese'],
    ]},
    { t: 'Filosofia moderna e contemporânea', r: 'Kant investigou os limites da razão; Hegel desenvolveu a dialética; a fenomenologia de Husserl estuda a experiência da consciência; Hannah Arendt refletiu sobre o totalitarismo e a "banalidade do mal".', q: [
      ['Quem escreveu a "Crítica da Razão Pura"?', 'Immanuel Kant', 'Hegel', 'Descartes', 'Spinoza'],
      ['A expressão "banalidade do mal" é de...', 'Hannah Arendt', 'Simone Weil', 'Theodor Adorno', 'Walter Benjamin'],
      ['Quem é o fundador da fenomenologia?', 'Edmund Husserl', 'Martin Heidegger', 'Jean-Paul Sartre', 'Merleau-Ponty'],
      ['A dialética de tese, antítese e síntese é associada a...', 'Hegel', 'Kant', 'Hume', 'Locke'],
    ]},
  ]],
  ['UHU', 'pedagogia', [
    { t: 'Teorias da educação', r: 'Paulo Freire defendeu uma educação libertadora e dialógica, em oposição à "educação bancária". O construtivismo entende que o aluno constrói ativamente o conhecimento. Montessori valorizou a autonomia da criança.', q: [
      ['Quem escreveu "Pedagogia do Oprimido"?', 'Paulo Freire', 'Anísio Teixeira', 'Darcy Ribeiro', 'Dermeval Saviani'],
      ['Para Paulo Freire, a educação que apenas "deposita" conteúdos no aluno é a educação...', 'Bancária', 'Libertadora', 'Dialógica', 'Popular'],
      ['Qual educadora italiana criou um método baseado na autonomia e em materiais sensoriais?', 'Maria Montessori', 'Emilia Ferreiro', 'Magda Soares', 'Helen Parkhurst'],
      ['A teoria segundo a qual o aluno constrói ativamente o conhecimento é o...', 'Construtivismo', 'Behaviorismo', 'Tecnicismo', 'Inatismo'],
    ]},
    { t: 'Legislação e organização escolar', r: 'A LDB (Lei 9.394/1996) organiza a educação brasileira em básica (infantil, fundamental e média) e superior. A BNCC define as aprendizagens essenciais da educação básica.', q: [
      ['Qual lei estabelece as diretrizes e bases da educação brasileira?', 'LDB', 'ECA', 'CLT', 'PNE'],
      ['O documento que define as aprendizagens essenciais da educação básica é a...', 'BNCC', 'LDB', 'Constituição', 'PCN'],
      ['Quantos anos dura o Ensino Fundamental no Brasil?', '9', '8', '5', '12'],
      ['O documento que expressa a identidade e os objetivos de cada escola é o...', 'Projeto Político-Pedagógico', 'Regimento do sindicato', 'Plano Diretor', 'Boletim escolar'],
    ]},
  ]],
];
