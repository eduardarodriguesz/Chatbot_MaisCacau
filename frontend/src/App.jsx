import React, { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import VoiceInput from './components/VoiceInput'
import ChatWindow from './components/ChatWindow'
import AppHeader from './components/AppHeader'

// URL base do backend FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function App() {
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

  // Envio de mensagem
  const sendMessage = async (messageText) => {
    const textToSend = (messageText || inputText).trim()
    if (!textToSend || isLoading) return

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

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          session_id: sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      setIsApiOnline(true)

      const botMessage = {
        id: data.message_id || 'bot_' + Date.now(),
        sender: 'bot',
        text: data.reply,
        time: formatCurrentTime(),
        source: data.source || 'base_conhecimento',
        confidence: data.confidence || 0.9,
        suggested_actions: data.suggested_actions || [],
        userFeedback: null
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      console.error('[ChatApp] Falha ao conectar ao servidor:', err)
      setIsApiOnline(false)

      // Resposta offline / fallback de conexão amigável
      const offlineReply = {
        id: 'error_' + Date.now(),
        sender: 'bot',
        text: '⚠️ **Não foi possível conectar ao servidor backend no momento.**\n\nPor favor, certifique-se de que o backend FastAPI está rodando (`python main.py` na porta 8000).\n\nPara encomendas e dúvidas urgentes, fale diretamente com a **Maria Eduarda**!',
        time: formatCurrentTime(),
        source: 'erro_conexao',
        confidence: 0.0,
        suggested_actions: ['Tentar novamente'],
        userFeedback: null
      }

      setMessages((prev) => [...prev, offlineReply])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    sendMessage()
  }

  // Callback de reconhecimento de voz
  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      setInputText(transcript)
      // Envia diretamente a transcrição para a IA
      sendMessage(transcript)
    }
  }

  // Registro de Feedback (Like / Dislike)
  const handleFeedback = async (messageId, isPositive) => {
    // Atualiza estado local imediatamente
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



  return (
    <div className="chat-layout">
      {/* 1. Cabeçalho (AppHeader) */}
      <AppHeader isOnline={isApiOnline} />

      {/* 2. Container de Mensagens (ChatWindow) */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onFeedback={handleFeedback}
      />

      {/* 3. Rodapé com Entrada de Texto, Botão de Voz e Envio */}
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

          {/* Componente de Reconhecimento de Voz (STT) */}
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />

          {/* Botão de Envio de Texto */}
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
  )
}
