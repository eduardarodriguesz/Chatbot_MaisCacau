# 💬 Prompt 09: Componente ChatWindow (Fluxo de Conversa, Mensagens & Interações)

* **Projeto:** 01 — Chatbot de Suporte Full-Stack (AfesuTech)
* **Camada:** Camada 4 — Interface & Componentes React
* **Arquivo Alvo:** `frontend/src/components/ChatWindow.jsx`

---

## 🎯 Objetivo
Construir o componente React `ChatWindow.jsx` para encapsular toda a área central da conversa do Chatbot: renderização de mensagens do usuário e da IA, avatares personalizados, metadados (fonte da resposta e nível de confiança), botões de avaliação (Like / Dislike), chips de sugestão de perguntas rápidas, animação de digitação (typing indicator) e rolagem automática suave (auto-scroll).

---

## 🤖 Prompt para Copiar e Executar na IA

```text
Crie um componente React chamado "ChatWindow.jsx" na pasta "frontend/src/components/" para gerenciar a exibição e as interações do fluxo de conversa do Chatbot.

Requisitos do componente:
1. Receber as seguintes props:
   - "messages": lista de objetos de mensagens contendo id, sender ('user' | 'bot'), text, time, source, confidence, suggested_actions e userFeedback.
   - "isLoading": booleano indicando se a IA está digitando/processando.
   - "onSendMessage": função de callback disparada ao clicar em um chip de pergunta rápida sugerida.
   - "onFeedback": função de callback (messageId, isPositive) disparada ao clicar nos botões de Like ou Dislike.
2. Renderização de cada mensagem com balões distintos:
   - Balão do Usuário: alinhado à direita com avatar de usuário (ícone Lucide "User").
   - Balão da IA: alinhado à esquerda com avatar do bot (ícone/emoji de chocolate ou marca).
   - Renderizar o conteúdo de texto de forma segura utilizando o componente <FormattedMessage />.
3. Metadados e Rodapé da Mensagem:
   - Exibir badge com o nome amigável da fonte da resposta (ex: LLM, Base de Conhecimento, Boas-vindas).
   - Exibir porcentagem de confiança/precisão (ex: 🎯 95%) quando disponível.
   - Exibir horário formatado da mensagem.
4. Interatividade e Feedback:
   - Botões de Like (ThumbsUp) e Dislike (ThumbsDown) para avaliar as respostas da IA, destacando o botão ativo.
   - Chips com perguntas rápidas sugeridas (ícone "Sparkles"), acionando "onSendMessage(action)".
5. Indicador de Digitação (Typing Indicator):
   - Exibir balão pulsante com três pontos quando "isLoading" for verdadeiro.
6. Auto-scroll:
   - Rolagem automática suave para o final da lista sempre que novas mensagens forem adicionadas ou o estado de carregamento mudar.
7. Atualizar o "App.jsx" para utilizar o novo componente <ChatWindow />.
```

---

## 💡 Como Funciona & Benefícios
* **Separação de Preocupações:** O `App.jsx` passa a orquestrar apenas o estado geral (mensagens, conexão com a API e envio), delegando toda a renderização visual da conversa para o `ChatWindow`.
* **UX Enriquecida:** O usuário tem feedback imediato com rolagem suave automática e botões de interação intuitivos.
