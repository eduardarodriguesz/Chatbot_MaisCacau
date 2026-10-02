/**
 * Motor Local de Inteligência Artificial & RAG para a MaisCacau (Frontend)
 * Garante que o chatbot responda de forma autônoma, rápida e precisa
 * diretamente no navegador ou quando o backend FastAPI estiver offline.
 */

import { knowledgeBase } from '../data/knowledgeBase'

const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas', 'por', 'pelo', 'pela', 'pelos', 'pelas', 'com',
  'para', 'pra', 'pro', 'que', 'se', 'eu', 'voce', 'voces', 'ele', 'ela', 'eles',
  'elas', 'nos', 'meu', 'minha', 'seu', 'sua', 'nosso', 'nossa', 'e', 'ou', 'mas',
  'como', 'qual', 'quais', 'quando', 'onde', 'por que', 'porque', 'esta', 'este',
  'esse', 'essa', 'isso', 'aquilo', 'sao', 'foi', 'ser', 'ter', 'estou', 'tem',
  'mais', 'muito', 'ja', 'favor', 'gostaria', 'saber', 'queria', 'me', 'diga'
])

const GREETING_KEYWORDS = [
  'ola', 'olá', 'oi', 'oie', 'bom dia', 'boa tarde', 'boa noite',
  'e ai', 'e aí', 'tudo bem', 'como vai', 'saudações', 'opa', 'hello', 'hey'
]

/**
 * Normaliza o texto removendo acentos, pontuações e convertendo para minúsculas.
 */
function normalizeText(text = '') {
  if (!text) return ''
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tokeniza uma frase filtrando stopwords.
 */
function tokenize(text = '') {
  const normalized = normalizeText(text)
  return normalized
    .split(' ')
    .filter((token) => !STOPWORDS.has(token) && token.length > 1)
}

/**
 * Calcula a similaridade léxica ponderada (Overlap + Jaccard + bônus exato).
 */
function calculateSimilarity(queryTokens, targetText) {
  if (!queryTokens.length || !targetText) return 0.0

  const targetNormalized = normalizeText(targetText)
  const targetTokens = new Set(tokenize(targetText))

  if (!targetTokens.size) return 0.0

  let matches = 0
  for (const token of queryTokens) {
    if (targetTokens.has(token) || targetNormalized.includes(token)) {
      matches += 1
    }
  }

  const unionSize = queryTokens.length + targetTokens.size - matches
  const jaccardScore = unionSize > 0 ? matches / unionSize : 0.0
  const overlapRatio = matches / queryTokens.length

  let score = overlapRatio * 0.7 + jaccardScore * 0.3

  const queryStr = queryTokens.join(' ')
  if (targetNormalized.includes(queryStr)) {
    score = Math.min(1.0, score + 0.35)
  }

  return score
}

/**
 * Verifica se a mensagem é uma saudação.
 */
function isGreeting(text = '') {
  const normalized = normalizeText(text)
  const words = normalized.split(' ')
  if (words.length <= 4) {
    for (const greeting of GREETING_KEYWORDS) {
      if (normalized === greeting || normalized.startsWith(greeting + ' ') || normalized.endsWith(' ' + greeting)) {
        return true
      }
    }
  }
  return false
}

/**
 * Detecta se a mensagem é uma pergunta de cálculo para mini brownies (ex: "quanto custa 200 mini brownies?").
 */
function calculateMiniBrowniesQuote(message = '') {
  const normalized = normalizeText(message)
  if (
    normalized.includes('mini') ||
    normalized.includes('cento') ||
    normalized.includes('festa') ||
    normalized.includes('evento') ||
    normalized.includes('unidade')
  ) {
    const numberMatch = normalized.match(/(\d+)/)
    if (numberMatch) {
      const quantity = parseInt(numberMatch[1], 10)
      if (quantity > 0 && quantity <= 5000) {
        const total = (quantity * 1.40).toFixed(2).replace('.', ',')
        const centos = (quantity / 100).toFixed(1).replace('.0', '').replace('.', ',')
        
        return {
          reply: `🎉 **Orçamento Personalizado — Encomenda de Mini Brownies**\n\n` +
            `Para a quantidade solicitada de **${quantity} mini brownies** (aprox. ${centos} cento${quantity >= 200 ? 's' : ''}):\n\n` +
            `💰 **Valor Total:** **R$ ${total}** *(R$ 1,40 por unidade)*\n\n` +
            `📐 **Regra de Cálculo MaisCacau:**\n` +
            `• **100 mini brownies (1 cento):** R$ 140,00\n` +
            `• **50 mini brownies:** R$ 70,00\n\n` +
            `✨ Todos os mini brownies são preparados artesanalmente com ingredientes selecionados e acabamento impecável para o seu evento!\n\n` +
            `📱 Deseja fechar a sua encomenda com a **Maria Eduarda**? Fale conosco no WhatsApp: **(11) 39467-8397** ou Instagram **@maiscacauoficial**!`,
          source: 'calculo_proporcional',
          confidence: 0.99,
          suggested_actions: [
            'Quais são os sabores disponíveis?',
            'Qual o valor dos brownies recheados?',
            'Tenho um problema com meu pedido'
          ]
        }
      }
    }
  }
  return null
}

/**
 * Processa a mensagem usando o motor local RAG.
 */
export function processLocalMessage(message = '', sessionId = '') {
  const cleanMessage = message.trim()
  if (!cleanMessage) return null

  // 1. Saudação
  if (isGreeting(cleanMessage)) {
    return {
      message_id: 'local_msg_' + Date.now(),
      reply: '👋 **Olá! Seja muito bem-vindo(a) à MaisCacau!** 🍫🤎\n\n' +
        'Eu sou a assistente virtual oficial dos nossos **brownies recheados artesanais**, feitos à mão com todo amor, carinho e dedicação pela **Maria Eduarda**.\n\n' +
        'Como posso deixar o seu dia mais doce hoje?\n\n' +
        '💡 *Você pode clicar em uma das opções abaixo ou me fazer qualquer pergunta sobre o cardápio, preços e encomendas:*',
      source: 'saudacao',
      confidence: 0.98,
      suggested_actions: knowledgeBase.faq_rapido.slice(0, 4)
    }
  }

  // 2. Cálculo dinâmico de Mini Brownies
  const quote = calculateMiniBrowniesQuote(cleanMessage)
  if (quote) {
    return {
      message_id: 'local_msg_' + Date.now(),
      ...quote
    }
  }

  // 3. Busca Léxico-Semântica na Base de Conhecimento RAG
  const queryTokens = tokenize(cleanMessage)
  let bestTopic = null
  let bestScore = 0.0

  for (const topic of knowledgeBase.topicos) {
    // Avalia similaridade com perguntas-chave
    for (const pergunta of topic.perguntas_chave) {
      const score = calculateSimilarity(queryTokens, pergunta)
      if (score > bestScore) {
        bestScore = score
        bestTopic = topic
      }
    }

    // Avalia similaridade com o ID do tópico
    const scoreId = calculateSimilarity(queryTokens, topic.id.replace(/_/g, ' '))
    if (scoreId > bestScore) {
      bestScore = scoreId
      bestTopic = topic
    }

    // Avalia similaridade com o conteúdo da resposta
    const scoreResposta = calculateSimilarity(queryTokens, topic.resposta) * 0.75
    if (scoreResposta > bestScore) {
      bestScore = scoreResposta
      bestTopic = topic
    }
  }

  if (bestTopic && bestScore >= 0.16) {
    const otherSuggestions = knowledgeBase.topicos
      .filter((t) => t.id !== bestTopic.id)
      .map((t) => t.perguntas_chave[0])
      .slice(0, 3)

    return {
      message_id: 'local_msg_' + Date.now(),
      reply: bestTopic.resposta,
      source: 'base_conhecimento',
      confidence: Math.min(1.0, Math.round(bestScore * 100) / 100),
      suggested_actions: otherSuggestions.length ? otherSuggestions : knowledgeBase.faq_rapido.slice(0, 3)
    }
  }

  // 4. Fallback Seguro e Afetuoso
  return {
    message_id: 'local_msg_' + Date.now(),
    reply: '🤎 **Desculpe, ainda não encontrei essa informação exata na minha base.**\n\n' +
      'Posso te ajudar com detalhes sobre nossos **10 Sabores de Brownies Recheados**, ' +
      'valores individuais, **encomendas de mini brownies para festas** ou sobre a **história da MaisCacau**!\n\n' +
      'Se você está com alguma dúvida ou precisa de atendimento personalizado com a **Maria Eduarda**, entre em contato:\n\n' +
      '📞 **Canais de Contato Oficiais:**\n' +
      '- 📸 **Instagram:** [@maiscacauoficial](https://instagram.com/maiscacauoficial)\n' +
      '- 📱 **WhatsApp:** **(11) 39467-8397**\n\n' +
      '💡 *Você também pode clicar em uma das dúvidas frequentes abaixo:*',
    source: 'fallback',
    confidence: 0.2,
    suggested_actions: knowledgeBase.faq_rapido.slice(0, 4)
  }
}
