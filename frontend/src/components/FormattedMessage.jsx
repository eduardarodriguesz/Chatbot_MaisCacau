import React, { useMemo } from 'react'
import { marked } from 'marked'

/**
 * Customiza o renderer do Marked para:
 * 1. Abrir links em nova aba (target="_blank")
 * 2. Prevenir vulnerabilidades de segurança (rel="noopener noreferrer")
 * 3. Filtrar esquemas perigosos (ex: javascript:)
 */
const renderer = new marked.Renderer()

renderer.link = function (arg1, arg2, arg3) {
  let href = ''
  let title = ''
  let text = ''

  // marked v12+ passa um objeto { href, title, text, tokens }
  if (typeof arg1 === 'object' && arg1 !== null) {
    href = arg1.href || ''
    title = arg1.title || ''
    text = arg1.text || ''
  } else {
    // Versões anteriores passam argumentos posicionais
    href = arg1 || ''
    title = arg2 || ''
    text = arg3 || ''
  }

  // Validação estrita de protocolos seguros para links
  const isSafeProtocol = /^(https?:|mailto:|tel:|\/|#)/i.test(href.trim())
  const safeHref = isSafeProtocol ? href.trim() : '#'
  const titleAttribute = title ? ` title="${title}"` : ''

  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttribute}>${text}</a>`
}

// Configurações globais do parser de Markdown
marked.setOptions({
  renderer,
  breaks: true, // Quebras de linha automáticas (Enter gera <br>)
  gfm: true     // GitHub Flavored Markdown (tabelas, listas, etc.)
})

/**
 * Componente FormattedMessage
 * Renderiza textos de mensagens com formatação Markdown segura e elegante.
 *
 * @param {Object} props
 * @param {string} [props.text] - Texto da mensagem com possíveis marcações Markdown
 * @param {string} [props.content] - Alias para a prop text
 * @param {boolean} [props.isUser=false] - Indica se a mensagem pertence ao usuário (evita injeção e preserva quebras)
 * @param {string} [props.className='message-content'] - Classe CSS opcional para estilização adicional
 */
export default function FormattedMessage({
  text,
  content,
  isUser = false,
  className = 'message-content'
}) {
  const messageText = text ?? content ?? ''

  // Processa o Markdown em HTML apenas quando o texto mudar
  const parsedHtml = useMemo(() => {
    // Se for mensagem enviada pelo usuário, não precisamos de HTML processado
    if (isUser) {
      return null
    }

    try {
      return marked.parse(messageText)
    } catch (error) {
      console.warn('[FormattedMessage] Erro ao processar Markdown:', error)
      return null
    }
  }, [messageText, isUser])

  // Mensagem do usuário ou fallback em caso de erro do parser
  if (isUser || parsedHtml === null) {
    return (
      <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
        {messageText}
      </div>
    )
  }

  // Mensagem da IA com Markdown formatado
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  )
}
