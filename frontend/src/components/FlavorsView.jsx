import React, { useState } from 'react'
import { MessageSquare, Sparkles, Coffee, Heart, CheckCircle2 } from 'lucide-react'
import { flavorsData } from '../data/flavorsData'

/**
 * Componente FlavorsView (Aba "Nossos Sabores")
 * Apresenta os 10 sabores oficiais da MaisCacau com descrição sensorial,
 * combinações sugeridas e a vibe única de cada sabor.
 */
export default function FlavorsView({ onAskInChat }) {
  const [selectedFlavorId, setSelectedFlavorId] = useState(flavorsData[0].id)

  const selectedFlavor = flavorsData.find((f) => f.id === selectedFlavorId) || flavorsData[0]

  const handleAskAboutFlavor = (flavorName) => {
    if (onAskInChat) {
      onAskInChat(`Me fale mais sobre o sabor de brownie de ${flavorName}!`)
    }
  }

  return (
    <div className="flavors-container">
      {/* Cabeçalho da Aba */}
      <div className="flavors-header-banner">
        <div className="banner-badge">
          <Sparkles size={14} />
          <span>Cardápio Artesanal MaisCacau</span>
        </div>
        <h2>Nossos 10 Sabores Irresistíveis</h2>
        <p>
          Cada brownie é recheado à mão pela <strong>Maria Eduarda</strong> com ingredientes de primeira qualidade e muito carinho.
        </p>
      </div>

      <div className="flavors-layout-grid">
        {/* Lista de Seleção de Sabores (Lado Esquerdo / Superior em mobile) */}
        <div className="flavors-selector-list">
          <h3>Escolha um Sabor:</h3>
          <div className="flavors-pills">
            {flavorsData.map((flavor) => {
              const isSelected = flavor.id === selectedFlavorId
              return (
                <button
                  key={flavor.id}
                  className={`flavor-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedFlavorId(flavor.id)}
                >
                  <span className="pill-icon">{flavor.icon}</span>
                  <div className="pill-text-group">
                    <span className="pill-name">{flavor.name}</span>
                    <span className="pill-tagline">{flavor.tagline}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="pill-check" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Detalhes do Sabor Selecionado (Lado Direito) */}
        <div className="flavor-detail-card">
          <div className="detail-card-header">
            <div className="detail-title-icon-group">
              <span className="detail-icon-large">{selectedFlavor.icon}</span>
              <div>
                <span className="detail-badge">{selectedFlavor.badge}</span>
                <h3>{selectedFlavor.name}</h3>
                <p className="detail-tagline">{selectedFlavor.tagline}</p>
              </div>
            </div>
          </div>

          <div className="detail-body-sections">
            {/* 1. Descrição Sensorial */}
            <div className="detail-section">
              <h4>
                <span className="sec-icon">🍫</span>
                <span>Como é o sabor:</span>
              </h4>
              <p className="sec-text">{selectedFlavor.description}</p>
              <p className="sec-subtext">{selectedFlavor.details}</p>
            </div>

            {/* 2. O que combina com ele */}
            <div className="detail-section">
              <h4>
                <Coffee size={18} className="sec-icon-lucide" />
                <span>O que combina com ele:</span>
              </h4>
              <ul className="combines-list">
                {selectedFlavor.combinesWith.map((item, idx) => (
                  <li key={idx}>
                    <span className="bullet-dot">☕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. A Vibe do Sabor */}
            <div className="detail-vibe-box">
              <div className="vibe-header">
                <Sparkles size={16} />
                <span>A Vibe deste Sabor:</span>
              </div>
              <p className="vibe-quote">{selectedFlavor.vibe}</p>
            </div>
          </div>

          {/* Rodapé do Card com Ação para o Chat */}
          <div className="detail-card-footer">
            <button
              className="ask-chat-btn"
              onClick={() => handleAskAboutFlavor(selectedFlavor.name)}
            >
              <MessageSquare size={16} />
              <span>Perguntar sobre {selectedFlavor.name} no Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
