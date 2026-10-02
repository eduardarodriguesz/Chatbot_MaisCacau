# 💬 Prompt 10: Componente AppHeader (Cabeçalho da Aplicação & Status do Sistema)

* **Projeto:** 01 — Chatbot de Suporte Full-Stack (AfesuTech)
* **Camada:** Camada 4 — Interface & Componentes React
* **Arquivo Alvo:** `frontend/src/components/AppHeader.jsx`

---

## 🎯 Objetivo
Construir o componente React `AppHeader.jsx` para isolar o cabeçalho superior do Chatbot, exibindo o logotipo/avatar da marca com efeito Glassmorphism, o nome do negócio, o selo (badge) de categoria e o indicador dinâmico de status da API (Online/Offline) com animação pulsante em tempo real.

---

## 🤖 Prompt para Copiar e Executar na IA

```text
Crie um componente React chamado "AppHeader.jsx" na pasta "frontend/src/components/" para gerenciar o cabeçalho superior do Chatbot.

Requisitos do componente:
1. Receber as seguintes props:
   - "title" (string opcional, padrão: "MaisCacau"): Nome da empresa ou assistente.
   - "badge" (string opcional, padrão: "Brownies Artesanais"): Selo de subtítulo ou categoria.
   - "icon" (string opcional, padrão: "🍫"): Emoji ou símbolo do avatar.
   - "isOnline" (booleano, obrigatório): Indica se o servidor backend FastAPI está respondendo.
2. Estrutura e Estilização:
   - Utilizar a tag semântica <header className="chat-header">.
   - Exibir o container do logotipo com a classe "bot-avatar" e o ícone estilizado.
   - Exibir o grupo de título ("header-title-group") com <h1>, o nome da marca e a etiqueta "header-badge".
   - Exibir o indicador de status ("status-indicator"):
     * Ponto pulsante ("status-dot online" ou "status-dot offline").
     * Texto informativo ("Atendimento Online" ou "Servidor Offline (porta 8000)").
3. Atualizar o "App.jsx" importando e utilizando o <AppHeader isOnline={isApiOnline} />.
```

---

## 💡 Como Funciona & Benefícios
* **Modularidade Total:** O `App.jsx` atua como o maestro do estado da aplicação, enquanto o cabeçalho fica encapsulado em um componente limpo e reutilizável.
* **Transparência de Conexão:** O usuário sabe instantaneamente se o backend FastAPI está ativo e pronto para responder perguntas.
