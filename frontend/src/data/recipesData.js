/**
 * Receitas e Dicas Artesanais da MaisCacau
 * Receitas simples, práticas e deliciosas com segredos da Maria Eduarda.
 */
export const recipesData = [
  {
    id: 'brownie_tradicional',
    title: 'Brownie Tradicional Artesanal MaisCacau',
    subtitle: 'A receita clássica com interior macio/úmido e a famosa casquinha craquelada brilhante',
    badge: 'Receita Oficial',
    difficulty: 'Fácil',
    prepTime: '15 min',
    bakeTime: '25 a 30 min',
    totalTime: '40 a 45 min',
    yield: '12 a 16 fatias',
    icon: '🍫',
    description: 'A base perfeita desenvolvida pela Maria Eduarda para quem busca aquele brownie denso, chocolatudo (fudgy), úmido por dentro e com aquela casquinha craquelada crocante que quebra a cada mordida.',
    ingredients: [
      { item: 'Chocolate meio amargo nobre (picado ou gotas)', amount: '200g' },
      { item: 'Manteiga sem sal (em cubos)', amount: '100g (ou 5 colheres de sopa)' },
      { item: 'Ovos inteiros em temperatura ambiente', amount: '3 unidades' },
      { item: 'Açúcar refinado', amount: '1 xícara (chá) — 180g' },
      { item: 'Açúcar mascavo (para umidade extra e toque caramelo)', amount: '1/2 xícara (chá) — 90g' },
      { item: 'Cacau em pó 50% ou 100% (peneirado)', amount: '1/2 xícara (chá) — 45g' },
      { item: 'Farinha de trigo tradicional (peneirada)', amount: '1 xícara (chá) — 120g' },
      { item: 'Pitada de sal (para realçar o cacau)', amount: '1 pitada generosa' },
      { item: 'Extrato ou essência de baunilha', amount: '1 colher (chá)' }
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Derreter o Chocolate com a Manteiga',
        desc: 'Em banho-maria ou no micro-ondas (em potência média de 30 em 30 segundos), derreta o chocolate nobre junto com a manteiga até obter uma ganache lisa, brilhante e homogênea. Reserve para amornar levemente.'
      },
      {
        step: 2,
        title: 'Bater os Ovos e Açúcares (O Segredo da Casquinha!)',
        desc: 'Na batedeira ou com um batedor de arame (fouet), bata os 3 ovos com o açúcar refinado e o açúcar mascavo por cerca de 3 a 4 minutos, até formar um creme claro, fofo e aerado. Esse processo dissolve o açúcar e cria a película brilhante e craquelada no forno.'
      },
      {
        step: 3,
        title: 'Incorporar o Chocolate Derretido e a Baunilha',
        desc: 'Despeje a mistura de chocolate e manteiga derretidos sobre o creme de ovos batidos. Misture delicadamente com uma espátula ou fouet em movimentos circulares de baixo para cima. Adicione a baunilha.'
      },
      {
        step: 4,
        title: 'Adicionar os Secos (Sem Bater em Excesso)',
        desc: 'Peneire a farinha de trigo, o cacau em pó e a pitada de sal diretamente sobre a tigela. Misture delicadamente apenas até a farinha sumir na massa. Não bata a massa para não desenvolver o glúten — queremos uma textura densa e macia, não um bolo fofo.'
      },
      {
        step: 5,
        title: 'Forno e Ponto de Assamento Perfeito',
        desc: 'Despeje a massa em uma forma retangular (aprox. 20x30cm) forrada com papel manteiga untado. Leve ao forno pré-aquecido a 180°C por 25 a 30 minutos. O ponto exato é quando a superfície estiver com casquinha craquelada e o palito sair levemente úmido (com migalhas úmidas aderidas, e não líquido).'
      },
      {
        step: 6,
        title: 'Resfriamento e Corte Preciso',
        desc: 'Retire do forno e deixe esfriar completamente na forma (se puder, leve à geladeira por 30 minutos antes de cortar). Isso garante quadrados perfeitos e firmes sem despedaçar!'
      }
    ],
    goldenTips: [
      '✨ **O Segredo da Casquinha:** Bater muito bem os ovos com o açúcar até formar uma espuma clara antes de juntar o chocolate derretido.',
      '🍫 **Chocolate Nobre:** Utilize chocolate de boa qualidade em barra ou gotas. Evite coberturas fracionadas para garantir sabor autêntico.',
      '⏱️ **Cuidado com o Tempo de Forno:** Se assar demais, o brownie vira bolo seco! O palito NUNCA deve sair 100% limpo e seco como em bolos.',
      '📐 **Corte Uniforme:** Use uma faca afiada e limpe a lâmina com papel toalha úmido a cada corte para manter as fatias impecáveis.'
    ]
  },
  {
    id: 'brownie_recheado_dicas',
    title: 'Como Rechear Brownies como a MaisCacau',
    subtitle: 'Técnicas artesanais para aplicar recheios generosos sem desestruturar a massa',
    badge: 'Técnica & Dicas',
    difficulty: 'Intermediário',
    prepTime: '20 min',
    bakeTime: '25 min',
    totalTime: '45 min',
    yield: '12 fatias recheadas',
    icon: '🍯',
    description: 'Aprenda os dois métodos profissionais utilizados pela MaisCacau: o recheio intercalado antes de assar ou o recheio clássico em duas camadas de brownie estruturado.',
    ingredients: [
      { item: 'Massa de Brownie Tradicional MaisCacau assada e fria', amount: '1 receita' },
      { item: 'Recheio de sua preferência (Doce de Leite firme, Brigadeiro Branco ou Ninho)', amount: '350g a 400g' },
      { item: 'Saco de confeitar com bico perlê ou pitanga (opcional)', amount: '1 unidade' }
    ],
    stepByStep: [
      {
        step: 1,
        title: 'Ponto do Recheio',
        desc: 'O recheio deve estar em ponto de brigadeiro de colher encorpado ou doce de leite firme, em temperatura ambiente, para manter altura e cremosidade.'
      },
      {
        step: 2,
        title: 'Corte ao Meio ou Sanduíche',
        desc: 'Com o brownie bem frio, corte os quadrados uniformes de 6x6cm e abra cada um delicadamente ao meio com uma faca de serra.'
      },
      {
        step: 3,
        title: 'Aplicação Generosa',
        desc: 'Aplique cerca de 35g a 40g de recheio no centro e nas bordas, cobrindo com a outra metade do brownie com suave pressão.'
      }
    ],
    goldenTips: [
      '🍯 **Temperatura do Recheio:** Nunca aplique recheio quente sobre o brownie para não derreter a gordura da massa.',
      '🎀 **Embalagem Especial:** Embale em papel celofane com fita de cetim para manter a umidade e frescor por até 7 dias.'
    ]
  }
]
