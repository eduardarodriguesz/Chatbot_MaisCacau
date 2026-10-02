import React, { useState } from 'react'
import { Clock, Users, ChefHat, Sparkles, MessageSquare, Lightbulb, CheckCircle, Flame } from 'lucide-react'
import { recipesData } from '../data/recipesData'

/**
 * Componente RecipesView (Aba "Receitas")
 * Disponibiliza a receita completa de Brownie Tradicional Artesanal MaisCacau,
 * ingredientes, modo de preparo passo a passo, tempos e dicas de ouro.
 */
export default function RecipesView({ onAskInChat }) {
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0)
  const currentRecipe = recipesData[activeRecipeIndex] || recipesData[0]

  return (
    <div className="recipes-container">
      {/* Banner Superior da Aba */}
      <div className="recipes-header-banner">
        <div className="banner-badge">
          <ChefHat size={14} />
          <span>Caderno de Receitas MaisCacau</span>
        </div>
        <h2>Aprenda a Fazer Brownies Artesanais</h2>
        <p>
          Segredos, medidas e dicas da confeiteira <strong>Maria Eduarda</strong> para você preparar brownies inesquecíveis em casa!
        </p>
      </div>

      {/* Seletor de Receitas (caso haja mais de uma) */}
      <div className="recipes-tabs-nav">
        {recipesData.map((rec, idx) => (
          <button
            key={rec.id}
            className={`recipe-tab-btn ${activeRecipeIndex === idx ? 'active' : ''}`}
            onClick={() => setActiveRecipeIndex(idx)}
          >
            <span className="recipe-tab-icon">{rec.icon}</span>
            <span>{rec.title}</span>
          </button>
        ))}
      </div>

      {/* Card Principal da Receita */}
      <div className="recipe-main-card">
        <div className="recipe-card-header">
          <div className="recipe-title-wrapper">
            <span className="recipe-badge">{currentRecipe.badge}</span>
            <h3>{currentRecipe.title}</h3>
            <p className="recipe-subtitle">{currentRecipe.subtitle}</p>
          </div>

          {/* Badges de Tempo e Rendimento */}
          <div className="recipe-stats-row">
            <div className="stat-pill">
              <Clock size={15} />
              <span><strong>Preparo:</strong> {currentRecipe.prepTime}</span>
            </div>
            <div className="stat-pill">
              <Flame size={15} />
              <span><strong>Forno:</strong> {currentRecipe.bakeTime}</span>
            </div>
            <div className="stat-pill">
              <Users size={15} />
              <span><strong>Rendimento:</strong> {currentRecipe.yield}</span>
            </div>
          </div>
        </div>

        <p className="recipe-description-intro">{currentRecipe.description}</p>

        <div className="recipe-grid-content">
          {/* Coluna 1: Ingredientes */}
          <div className="recipe-ingredients-box">
            <h4>
              <span className="sec-emoji">🥣</span>
              <span>Ingredientes:</span>
            </h4>
            <ul className="ingredients-checklist">
              {currentRecipe.ingredients.map((ing, i) => (
                <li key={i}>
                  <div className="ing-bullet"></div>
                  <div className="ing-content">
                    <span className="ing-item">{ing.item}</span>
                    <span className="ing-amount">{ing.amount}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 2: Passo a Passo & Dicas de Ouro */}
          <div className="recipe-steps-box">
            <h4>
              <span className="sec-emoji">👩‍🍳</span>
              <span>Modo de Preparo (Passo a Passo):</span>
            </h4>
            <div className="steps-timeline">
              {currentRecipe.stepByStep.map((stepItem) => (
                <div key={stepItem.step} className="step-card">
                  <div className="step-number-badge">{stepItem.step}</div>
                  <div className="step-content">
                    <h5>{stepItem.title}</h5>
                    <p>{stepItem.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dicas de Ouro da Maria Eduarda */}
            {currentRecipe.goldenTips && (
              <div className="golden-tips-box">
                <div className="tips-header">
                  <Lightbulb size={18} />
                  <h5>Dicas de Ouro da Maria Eduarda:</h5>
                </div>
                <ul className="tips-list">
                  {currentRecipe.goldenTips.map((tip, tIdx) => (
                    <li key={tIdx}>
                      <span className="tip-bullet">✨</span>
                      <span>{tip.replace(/\*\*/g, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com atalho para o Chatbot */}
        <div className="recipe-card-footer">
          <p>Ficou com alguma dúvida sobre o ponto do brownie ou sabores?</p>
          <button
            className="ask-chat-btn"
            onClick={() => onAskInChat && onAskInChat('Como é o processo de produção dos brownies da MaisCacau?')}
          >
            <MessageSquare size={16} />
            <span>Tirar dúvidas com a Assistente Virtual</span>
          </button>
        </div>
      </div>
    </div>
  )
}
