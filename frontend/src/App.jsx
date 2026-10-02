import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import VoiceInput from './components/VoiceInput'
import ChatWindow from './components/ChatWindow'
import AppHeader from './components/AppHeader'
import IntroScreen from './components/IntroScreen'
import FlavorsView from './components/FlavorsView'
import RecipesView from './components/RecipesView'
import GalleryView from './components/GalleryView'
import { processLocalMessage } from './services/localChatbotEngine'

// URL base do backend FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'flavors' | 'recipes' | 'gallery'
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9))
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: '👋 **Olá! Seja muito bem-vindo(a) à MaisCacau!** 🍫🤎\n\nEu sou a sua assistente virtual de brownies recheados artesanais, feitos à mão com todo carinho, amor e dedicação pela **Maria Eduarda**. Como posso deixar seu dia mais doce hoje?\n\n💡 *Você pode clicar em uma das perguntas rápidas abaixo, usar o microfone ou digitar sua dúvida:*',
      time: formatCurrentTime(),
      source: 'saudacao',
      confidence: 1.0,
      suggested_actions: [
        'Quais são os sabores disponíveis?',
        'Quanto custa a encomenda de mini brownies?',
        'Qual o valor dos brownies recheados?',
        '👩‍🍳 Quer descobrir como um brownie é produzido?',
        'Me conte a história da MaisCacau!'
      ],
      userFeedback: null // 'like' | 'dislike' | null
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isApiOnline, setIsApiOnline] = useState(true)

  // Checa a conectividade com o backend FastAPI ao carregar
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/`, { method: 'GET' })
        if (res.ok) {
          setIsApiOnline(true)
        } else {
          setIsApiOnline(false)
        }
      } catch (err) {
        setIsApiOnline(false)
      }
    }

    checkApiStatus()
    const interval = setInterval(checkApiStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  function formatCurrentTime() {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Envio de mensagem com fallback inteligente
  const sendMessage = async (messageText) => {
    const textToSend = (messageText || inputText).trim()
    if (!textToSend || isLoading) return

    // Garante que o usuário veja a aba do chat se enviou uma pergunta
    if (activeTab !== 'chat') {
      setActiveTab('chat')
    }

    const userMessageId = 'user_' + Date.now()
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: textToSend,
        time: formatCurrentTime()
      }
    ]

    setMessages(newMessages)
    setInputText('')
    setIsLoading(true)

    // Tenta primeiro conectar com o Backend FastAPI se configurado
    let answered = false
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
      const isLocalhostHttp = API_BASE_URL.startsWith('http://127.0.0.1') || API_BASE_URL.startsWith('http://localhost')

      if (!(isHttps && isLocalhostHttp)) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 4000)

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: textToSend,
            session_id: sessionId
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          setIsApiOnline(true)

          const botMessage = {
            id: data.message_id || 'bot_' + Date.now(),
            sender: 'bot',
            text: data.reply,
            time: formatCurrentTime(),
            source: data.source || 'base_conhecimento',
            confidence: data.confidence || 0.95,
            suggested_actions: data.suggested_actions || [],
            userFeedback: null
          }

          setMessages((prev) => [...prev, botMessage])
          answered = true
        }
      }
    } catch (err) {
      console.warn('[ChatApp] Backend remoto indisponível, processando com IA local:', err)
    }

    // Se o backend remoto não respondeu, processa com o Motor Local RAG Inteligente
    if (!answered) {
      try {
        const localResult = processLocalMessage(textToSend, sessionId)
        if (localResult) {
          const botMessage = {
            id: localResult.message_id || 'local_' + Date.now(),
            sender: 'bot',
            text: localResult.reply,
            time: formatCurrentTime(),
            source: localResult.source || 'base_conhecimento',
            confidence: localResult.confidence || 0.95,
            suggested_actions: localResult.suggested_actions || [],
            userFeedback: null
          }
          setMessages((prev) => [...prev, botMessage])
          setIsApiOnline(true)
          answered = true
        }
      } catch (localErr) {
        console.error('[ChatApp] Erro no processamento local:', localErr)
      }
    }

    // Fallback final caso ocorra qualquer imprevisto
    if (!answered) {
      const fallbackMsg = {
        id: 'error_' + Date.now(),
        sender: 'bot',
        text: '🤎 **Olá! Estou pronta para te atender.**\n\nVocê pode me perguntar sobre nossos sabores de brownies recheados, valores individuais, encomendas para eventos ou a história da MaisCacau!\n\n📱 Para falar diretamente com a **Maria Eduarda**, chame no WhatsApp: **(11) 39467-8397**!',
        time: formatCurrentTime(),
        source: 'fallback',
        confidence: 0.9,
        suggested_actions: [
          'Quais são os sabores disponíveis?',
          'Quanto custa a encomenda de mini brownies?',
          'Qual o valor dos brownies recheados?',
          '👩‍🍳 Quer descobrir como um brownie é produzido?'
        ],
        userFeedback: null
      }
      setMessages((prev) => [...prev, fallbackMsg])
    }

    setIsLoading(false)
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    sendMessage()
  }

  // Callback de reconhecimento de voz
  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      setInputText(transcript)
      sendMessage(transcript)
    }
  }

  // Registro de Feedback (Like / Dislike)
  const handleFeedback = async (messageId, isPositive) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, userFeedback: isPositive ? 'like' : 'dislike' }
          : msg
      )
    )

    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          is_positive: isPositive
        })
      })
    } catch (err) {
      console.warn('[ChatApp] Erro ao registrar feedback:', err)
    }
  }

  // Dispara uma pergunta originada de outra aba (Sabores, Receitas, Galeria)
  const handleAskFromTab = (questionText) => {
    setActiveTab('chat')
    sendMessage(questionText)
  }

  return (
    <div className="chat-layout">
      {/* 1. Tela de Introdução Animada */}
      {showIntro && (
        <IntroScreen onEnter={() => setShowIntro(false)} />
      )}

      {/* 2. Cabeçalho com Navegação por Abas */}
      <AppHeader
        isOnline={isApiOnline}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        onOpenIntro={() => setShowIntro(true)}
      />

      {/* 3. Renderização Dinâmica do Conteúdo das Abas */}
      <main className="tab-content-area">
        {/* ABA 1: CHATBOT ATENDIMENTO OFICIAL */}
        {activeTab === 'chat' && (
          <div className="chat-tab-wrapper">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onFeedback={handleFeedback}
            />

            {/* Rodapé com Entrada de Texto, Botão de Voz e Envio */}
            <footer className="input-area">
              <form onSubmit={handleSubmit} className="input-form">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Pergunte sobre sabores, encomendas de mini brownies..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />

                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  className="send-button"
                  disabled={!inputText.trim() || isLoading}
                  title="Enviar mensagem"
                  aria-label="Enviar mensagem"
                >
                  <Send size={18} />
                </button>
              </form>
            </footer>
          </div>
        )}

        {/* ABA 2: NOSSOS SABORES */}
        {activeTab === 'flavors' && (
          <FlavorsView onAskInChat={handleAskFromTab} />
        )}

        {/* ABA 3: RECEITAS */}
        {activeTab === 'recipes' && (
          <RecipesView onAskInChat={handleAskFromTab} />
        )}

        {/* ABA 4: GALERIA */}
        {activeTab === 'gallery' && (
          <GalleryView onAskInChat={handleAskFromTab} />
        )}
      </main>
    </div>
  )
}
