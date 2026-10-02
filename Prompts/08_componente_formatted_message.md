# 💬 Prompt 08: Componente FormattedMessage (Renderização de Markdown & Segurança)

* **Projeto:** 01 — Chatbot de Suporte Full-Stack (AfesuTech)
* **Camada:** Camada 4 — Interface & Componentes React
* **Arquivo Alvo:** `frontend/src/components/FormattedMessage.jsx`

---

## 🎯 Objetivo
Construir o componente React `FormattedMessage.jsx` responsável por processar e renderizar as mensagens do Chatbot em Markdown com suporte rico (negrito, itálico, listas, tabelas, código e links seguros), garantindo higienização de links (`target="_blank"` e `rel="noopener noreferrer"`), proteção contra scripts maliciosos e fallback resiliente.

---

## 🤖 Prompt para Copiar e Executar na IA

```text
Crie um componente React chamado "FormattedMessage.jsx" na pasta "frontend/src/components/" para renderizar o texto das mensagens do Chatbot formatado em Markdown com alta segurança e estética.

Requisitos do componente:
1. Utilizar a biblioteca "marked" para processar o Markdown em HTML.
2. Configurar o marked com:
   - "breaks: true" para respeitar quebras de linha automáticas (Enter).
   - "gfm: true" (GitHub Flavored Markdown) para suporte a listas, tabelas e links.
3. Customizar o renderizador de links com segurança:
   - Forçar links externos a abrirem em nova aba (target="_blank" e rel="noopener noreferrer").
   - Validar protocolos permitidos (apenas http, https, mailto, tel) prevenindo injeções javascript:.
4. Suporte a propriedades flexíveis:
   - Aceitar "text" ou "content" (string com o conteúdo da mensagem).
   - Aceitar "isUser" (booleano: se true, renderiza texto do usuário de forma segura sem risco de injeção).
   - Aceitar "className" adicional (padrão: "message-content").
5. Tratamento de erro resiliente com try/catch: caso a formatação falhe, exibe o texto original em segurança sem travar a interface.
6. Atualizar o "App.jsx" para importar e utilizar o <FormattedMessage /> no balão de mensagens do bot e do usuário.
```

---

## 💡 Como Funciona & Boas Práticas
* **Segurança (Prevenção de XSS):** Garante que links gerados pela IA ou inseridos na base de conhecimento abram com segurança sem capturar o foco da janela original (`rel="noopener noreferrer"`).
* **Modularidade React:** Separa a responsabilidade de formatação visual de texto do componente principal `App.jsx`, tornando o código limpo, sustentável e fácil de testar.
* **Acessibilidade & Tipografia:** O Markdown formatado respeita a hierarquia visual do tema (negrito em dourado, links sublinhados e blocos de código legíveis).
