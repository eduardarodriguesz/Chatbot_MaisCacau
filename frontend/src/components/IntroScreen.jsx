import React, { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, Heart } from 'lucide-react'

/**
 * Componente IntroScreen (Tela de Introdução Animada da MaisCacau)
 * Apresenta logo, nome MaisCacau, slogan e animações acolhedoras de chocolate.
 * Ao clicar em qualquer parte da tela, inicia a experiência principal.
 */
export default function IntroScreen({ onEnter }) {
  const [isClosing, setIsClosing] = useState(false)

  const handleEnter = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      onEnter()
    }, 400)
  }

  // Permite pressionar qualquer tecla (como Enter ou Espaço) para entrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleEnter()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      className={`intro-screen-overlay ${isClosing ? 'fade-out' : ''}`}
      onClick={handleEnter}
      role="button"
      tabIndex={0}
      title="Clique em qualquer lugar para entrar no chatbot"
    >
      {/* Elementos flutuantes de chocolate e cacau no fundo */}
      <div className="chocolate-particles">
        <span className="choco-drop drop-1">🍫</span>
        <span className="choco-drop drop-2">✨</span>
        <span className="choco-drop drop-3">🤎</span>
        <span className="choco-drop drop-4">🧁</span>
        <span className="choco-drop drop-5">🍫</span>
        <span className="choco-drop drop-6">✨</span>
      </div>

      <div className="intro-card" onClick={(e) => e.stopPropagation()}>
        {/* Logo Ilustrativa e Animada */}
        <div className="intro-logo-container">
          <div className="intro-logo-badge">
            <div className="brownie-art-logo">
              <span className="brownie-cake-icon">🍫</span>
              <div className="chocolate-drip drip-left"></div>
              <div className="chocolate-drip drip-center"></div>
              <div className="chocolate-drip drip-right"></div>
            </div>
          </div>
          <span className="sparkle-badge top-right">
            <Sparkles size={16} />
          </span>
        </div>

        {/* Nome da Marca e Tagline */}
        <div className="intro-title-group">
          <span className="intro-tag">FEITO À MÃO • ARTESANAL</span>
          <h1 className="intro-brand-name">
            Mais<span>Cacau</span>
          </h1>
          <p className="intro-slogan">
            “Mais recheio. Mais chocolate. MaisCacau.”
          </p>
        </div>

        {/* Descrição Acolhedora */}
        <p className="intro-description">
          Brownies recheados artesanais feitos com carinho, amor e dedicação por <strong>Maria Eduarda</strong>.
        </p>

        {/* Botão de Ação Principal */}
        <button
          className="intro-enter-btn"
          onClick={handleEnter}
          autoFocus
        >
          <span>Entrar no Atendimento</span>
          <ArrowRight size={18} />
        </button>

        <div className="intro-footer-hint">
          <Heart size={13} className="heart-pulse" />
          <span>Clique em qualquer lugar da tela para começar</span>
        </div>
      </div>
    </div>
  )
}
