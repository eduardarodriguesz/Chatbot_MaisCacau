import React from 'react'

/**
 * Componente AppHeader
 * Renderiza o cabeçalho superior com avatar da marca, títulos, badge e indicador pulsante de status da API.
 *
 * @param {Object} props
 * @param {string} [props.title='MaisCacau'] - Nome da empresa ou do assistente
 * @param {string} [props.badge='Brownies Artesanais'] - Badge / Tag descritiva da empresa
 * @param {string} [props.icon='🍫'] - Ícone ou emoji exibido no avatar
 * @param {boolean} [props.isOnline=true] - Estado de conexão com a API backend
 */
export default function AppHeader({
  title = 'MaisCacau',
  badge = 'Brownies Artesanais',
  icon = '🍫',
  isOnline = true
}) {
  return (
    <header className="chat-header">
      <div className="header-brand">
        <div className="bot-avatar">
          <span className="brand-icon">{icon}</span>
        </div>
        <div className="header-title-group">
          <h1>
            {title}
            {badge && <span className="header-badge">{badge}</span>}
          </h1>
          <div className="status-indicator">
            <span className="status-dot online"></span>
            <span className="status-text">
              {isOnline ? 'Atendimento Online' : 'Atendimento Online (IA MaisCacau)'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
