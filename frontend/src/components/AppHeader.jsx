import React from 'react'
import { MessageSquare, Sparkles, BookOpen, Image as ImageIcon, Sparkle } from 'lucide-react'

/**
 * Componente AppHeader
 * Renderiza o cabeçalho superior com avatar da marca, títulos, badge, indicador de status
 * e barra de navegação entre abas (Chatbot, Nossos Sabores, Receitas, Galeria).
 */
export default function AppHeader({
  title = 'MaisCacau',
  badge = 'Brownies Artesanais',
  icon = '🍫',
  isOnline = true,
  activeTab = 'chat',
  onTabChange,
  onOpenIntro
}) {
  const tabs = [
    { id: 'chat', label: 'Chatbot', icon: <MessageSquare size={16} /> },
    { id: 'flavors', label: 'Nossos Sabores', icon: <Sparkles size={16} /> },
    { id: 'recipes', label: 'Receitas', icon: <BookOpen size={16} /> },
    { id: 'gallery', label: 'Galeria', icon: <ImageIcon size={16} /> }
  ]

  return (
    <header className="chat-header">
      <div className="header-top-row">
        <div
          className="header-brand"
          onClick={onOpenIntro}
          role="button"
          tabIndex={0}
          title="Clique para ver a apresentação da MaisCacau"
        >
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

        {/* Botão sutil para reabrir apresentação */}
        <button
          className="header-intro-replay-btn"
          onClick={onOpenIntro}
          title="Ver tela de boas-vindas"
        >
          <Sparkles size={14} />
          <span>Apresentação</span>
        </button>
      </div>

      {/* Barra de Navegação por Abas */}
      <nav className="header-tabs-nav" aria-label="Navegação principal">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className={`header-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {isActive && <span className="tab-indicator-line" />}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
