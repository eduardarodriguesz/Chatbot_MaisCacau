import React, { useState } from 'react'
import { Sparkles, MessageSquare, ZoomIn, Heart, Star, Tag, X } from 'lucide-react'
import { galleryData } from '../data/galleryData'

/**
 * Componente GalleryView (Aba "Galeria")
 * Apresenta a vitrine visual de brownies artesanais da MaisCacau,
 * destacando texturas craqueladas, recheios fartos e detalhes de cada sabor.
 */
export default function GalleryView({ onAskInChat }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [activeModalItem, setActiveModalItem] = useState(null)

  const categories = ['Todos', 'Classicos', 'Especiais', 'Frutados', 'Eventos']

  const filteredItems = selectedCategory === 'Todos'
    ? galleryData
    : galleryData.filter((item) => item.category === selectedCategory)

  const handleOpenChatForFlavor = (title) => {
    setActiveModalItem(null)
    if (onAskInChat) {
      onAskInChat(`Quero encomendar o ${title}, como funciona?`)
    }
  }

  return (
    <div className="gallery-container">
      {/* Banner Superior */}
      <div className="gallery-header-banner">
        <div className="banner-badge">
          <Sparkles size={14} />
          <span>Vitrine & Texturas Artesanais</span>
        </div>
        <h2>Galeria de Brownies MaisCacau</h2>
        <p>
          Feitos à mão, com casquinha craquelada crocante, interior ultra chocolatudo e recheios generosos!
        </p>
      </div>

      {/* Filtros de Categoria */}
      <div className="gallery-categories-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'Classicos' ? 'Clássicos' : cat}
          </button>
        ))}
      </div>

      {/* Grid de Cards da Galeria */}
      <div className="gallery-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="gallery-card"
            onClick={() => setActiveModalItem(item)}
            tabIndex={0}
            role="button"
          >
            {/* Visual do Brownie (Ilustração estilizada de confeitaria) */}
            <div className="gallery-card-visual" style={{ '--accent-color': item.accentColor }}>
              <div className="brownie-visual-layer">
                <span className="brownie-visual-icon">{item.emoji}</span>
                <div className="visual-drips">
                  <span className="drip-dot d1"></span>
                  <span className="drip-dot d2"></span>
                  <span className="drip-dot d3"></span>
                </div>
              </div>
              <span className="gallery-badge">{item.badge}</span>
              <button className="zoom-btn" title="Ver detalhes">
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Conteúdo Textual do Card */}
            <div className="gallery-card-content">
              <div className="card-top-info">
                <h3>{item.title}</h3>
                <div className="rating-pill">
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <span>{item.rating}</span>
                </div>
              </div>

              <p className="card-texture-highlight">
                <strong>Textura:</strong> {item.texture}
              </p>

              <div className="card-vibe-mini">
                <Heart size={12} className="vibe-icon-mini" />
                <span>{item.vibe}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes / Zoom do Brownie */}
      {activeModalItem && (
        <div className="gallery-modal-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="gallery-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setActiveModalItem(null)}
              title="Fechar"
            >
              <X size={20} />
            </button>

            <div className="modal-visual-header" style={{ '--accent-color': activeModalItem.accentColor }}>
              <span className="modal-large-emoji">{activeModalItem.emoji}</span>
              <span className="modal-badge">{activeModalItem.badge}</span>
            </div>

            <div className="modal-body">
              <h3>{activeModalItem.title}</h3>
              <p className="modal-details-text">{activeModalItem.details}</p>

              <div className="modal-info-block">
                <h4>
                  <span>🍫</span> Textura & Ponto da Massa:
                </h4>
                <p>{activeModalItem.texture}</p>
              </div>

              <div className="modal-info-block vibe-block">
                <h4>
                  <Sparkles size={16} /> A Vibe deste Brownie:
                </h4>
                <p>"{activeModalItem.vibe}"</p>
              </div>

              <div className="modal-actions">
                <button
                  className="modal-chat-btn"
                  onClick={() => handleOpenChatForFlavor(activeModalItem.title)}
                >
                  <MessageSquare size={16} />
                  <span>Pedir ou Tirar Dúvidas no Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
