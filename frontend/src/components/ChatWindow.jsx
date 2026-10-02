import React, { useEffect, useRef } from 'react'
import { User, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react'
import FormattedMessage from './FormattedMessage'

/**
 * Helper para formatar o nome amigável da fonte da resposta
 * @param {string} src
 * @returns {string}
 */
const formatSourceName = (src) => {
  switch (src) {
    case 'groq_llm':
      return '🤖 MaisCacau IA (LLM)'
    case 'base_conhecimento':
      return '🍫 Cardápio & Base Oficial'
    case 'saudacao':
      return '🤎 Boas-vindas'
    case 'erro_conexao':
      return '⚠️ Erro de Conexão'
    case 'fallback':
      return '✨ Atendimento MaisCacau'
    default:
      return '🍫 MaisCacau'
  }
}

/**
 * Componente ChatWindow
 * Gerencia o container de mensagens, avatares, balões de texto formatados,
 * botões de avaliação, sugestões rápidas e scroll automático.
 *
 * @param {Object} props
 * @param {Array} props.messages - Lista de objetos de mensagem
 * @param {boolean} [props.isLoading=false] - Indica se o robô está processando/digitando
 * @param {(messageText: string) => void} props.onSendMessage - Callback para envio de mensagem rápida (chip)
 * @param {(messageId: string, isPositive: boolean) => void} [props.onFeedback] - Callback de avaliação da mensagem
 * @param {string} [props.botIcon='🍫'] - Ícone do avatar do bot
 */
export default function ChatWindow({
  messages = [],
  isLoading = false,
  onSendMessage,
  onFeedback,
  botIcon = '🍫'
}) {
  const messagesEndRef = useRef(null)

  // Scroll automático suave sempre que chegarem novas mensagens ou mudar o estado de loading
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  return (
    <main className="messages-container">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
        >
          {/* Avatar do Bot */}
          {msg.sender === 'bot' && (
            <div className="avatar bot-avatar-small" title="MaisCacau Atendimento">
              <span className="avatar-icon">{botIcon}</span>
            </div>
          )}

          {/* Balão de Mensagem */}
          <div className={`message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
            {/* Conteúdo formatado via componente FormattedMessage */}
            <FormattedMessage
              text={msg.text}
              isUser={msg.sender === 'user'}
            />

            {/* Rodapé com Metadados da Mensagem do Bot */}
            {msg.sender === 'bot' && (
              <div className="bubble-footer">
                {msg.source && (
                  <span className="source-badge">
                    {formatSourceName(msg.source)}
                  </span>
                )}
                {msg.confidence > 0 && (
                  <span title="Nível de precisão da resposta">
                    🎯 {Math.round(msg.confidence * 100)}%
                  </span>
                )}
                <span>{msg.time}</span>
              </div>
            )}

            {/* Botões de Feedback (Like / Dislike) */}
            {msg.sender === 'bot' && msg.source !== 'erro_conexao' && onFeedback && (
              <div className="feedback-actions">
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Essa resposta ajudou?
                </span>
                <button
                  type="button"
                  className={`feedback-btn ${msg.userFeedback === 'like' ? 'active-like' : ''}`}
                  onClick={() => onFeedback(msg.id, true)}
                  title="Gostei da resposta (Like)"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  type="button"
                  className={`feedback-btn ${msg.userFeedback === 'dislike' ? 'active-dislike' : ''}`}
                  onClick={() => onFeedback(msg.id, false)}
                  title="Não gostei (Dislike)"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            )}

            {/* Chips de Perguntas Rápidas Sugeridas */}
            {msg.suggested_actions && msg.suggested_actions.length > 0 && (
              <div className="quick-questions-wrapper">
                {msg.suggested_actions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chip-button"
                    onClick={() => onSendMessage && onSendMessage(action)}
                    disabled={isLoading}
                  >
                    <Sparkles size={12} />
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Rodapé da Mensagem do Usuário */}
            {msg.sender === 'user' && (
              <div className="bubble-footer">
                <span>{msg.time}</span>
              </div>
            )}
          </div>

          {/* Avatar do Usuário */}
          {msg.sender === 'user' && (
            <div className="avatar user-avatar-small" title="Você">
              <User size={18} />
            </div>
          )}
        </div>
      ))}

      {/* Indicador de Digitação (Typing Indicator) quando o bot está processando */}
      {isLoading && (
        <div className="message-row bot-row">
          <div className="avatar bot-avatar-small">
            <span className="avatar-icon">{botIcon}</span>
          </div>
          <div className="message-bubble bot-bubble">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        </div>
      )}

      {/* Referência para rolagem automática */}
      <div ref={messagesEndRef} />
    </main>
  )
}
