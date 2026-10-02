# 🍫 Prompt 11: Personalização do Negócio & Base de Conhecimento RAG (MaisCacau)

* **Projeto:** 01 — Chatbot de Suporte Full-Stack (AfesuTech)
* **Camada:** Camada 1 & 2 — Dados, Conhecimento Factual (RAG) & Backend
* **Arquivos Alvo:** `backend/base_conhecimento.json`, `backend/chatbot_engine.py`, `backend/test_backend.py`

---

## 🎯 Objetivo
Personalizar o chatbot com a identidade factual, história real, catálogo de produtos, tabela de preços, regras de cálculo proporcional para encomendas de festas e canais oficiais de atendimento da empresa artesanal da aluna: **MaisCacau** (fundada por Maria Eduarda em agosto de 2026).

---

## 🤖 Prompt para Copiar e Executar na IA

```text
Atue como Engenheiro de Conhecimento e Especialista em IA para Negócios.
Atualize e personalize toda a base factual do chatbot para o negócio real de brownies recheados artesanais "MaisCacau", fundado por Maria Eduarda.

Requisitos da Personalização:
1. "backend/base_conhecimento.json":
   - "empresa": "MaisCacau"
   - "fundadora": "Maria Eduarda" (Fundação: Agosto de 2026)
   - "segmento": "Confeitaria e produção artesanal de brownies"
   - "descricao": História inspiradora do início por necessidade para ajudar nas despesas de casa até virar paixão e propósito de vida.
   - Tópicos detalhados com perguntas-chave ricas e respostas formatadas em Markdown com emojis:
     * "sobre_historia": Origem, fundação e propósito da Maria Eduarda.
     * "sabores_cardapio": 10 sabores irresistíveis (Doce de Leite, Merengue, Chocolate Tradicional, Casadinho, Limão, Maracujá, Brigadeiro Branco, Ninho com Morango, Ninho Tradicional, Paçoca).
     * "precos_produtos": Valores unitários (Tradicional R$ 7 a R$ 9 / Recheado R$ 10 a R$ 14).
     * "mini_brownies_encomendas": Regra de cálculo proporcional para eventos (R$ 140,00 a cada 100 unidades / R$ 1,40 por unidade).
     * "significado_nome": "Mais" (recheio a mais) + "Cacau" (ingrediente nobre).
     * "proposito_valores_diferencial": Valores, carinho e produção 100% artesanal.
     * "identidade_visual": Paleta (tom cereja/vermelho escuro, amarelo manteiga, marrom chocolate) e conceito do logo.
     * "atendimento_problemas": Resolução de dúvidas/reclamações com canais oficiais (WhatsApp: (11) 39467-8397, Instagram: @maiscacauoficial).
   - "faq_rapido": Lista de perguntas frequentes para acesso rápido no chat.

2. "backend/chatbot_engine.py":
   - Atualizar saudações, prompts de sistema da LLM e respostas padrão com o tom acolhedor e artesanal da MaisCacau.

3. "backend/test_backend.py":
   - Atualizar a suíte de testes com cenários específicos da MaisCacau (sabores, encomendas de mini brownies, história da Maria Eduarda).
```

---

## 💡 Como Funciona & Benefícios
* **Fidelidade RAG:** O chatbot responde com precisão milimétrica a partir de dados reais da MaisCacau, calculando encomendas e apresentando o cardápio sem alucinações.
* **Humanização e Afeto:** O tom de voz reflete o carinho, a dedicação e o amor colocados pela Maria Eduarda em cada brownie.
