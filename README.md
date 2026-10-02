# 🍫 MaisCacau — Chatbot Full-Stack de Atendimento

Assistente virtual inteligente desenvolvido especialmente para a **MaisCacau** (Brownies Recheados Artesanais, fundado por **Maria Eduarda**). O sistema opera em modo híbrido combinando **RAG (Recuperação de Informações da Base Factual)** com **LLM Generativa (Groq / Llama-3)** e interface moderna em **React + Vite** com reconhecimento de voz integrado (STT).

---

## 📁 Estrutura do Projeto

```text
Chatbot-FullStack/
├── backend/                  # API REST em Python com FastAPI
│   ├── base_conhecimento.json# Base de dados factual oficial da MaisCacau
│   ├── chatbot_engine.py    # Motor híbrido de IA (RAG + Groq LLM)
│   ├── main.py              # Servidor FastAPI com rotas HTTP e CORS
│   ├── requirements.txt     # Dependências Python
│   ├── test_backend.py      # Suíte de testes automatizados
│   └── .env.example         # Exemplo de variáveis de ambiente do backend
│
├── frontend/                 # Interface Web Responsiva em React + Vite
│   ├── src/                 # Componentes React, estilos e lógica
│   │   ├── components/      # ChatWindow, VoiceInput, AppHeader, etc.
│   │   ├── App.jsx          # Componente principal e integração com API
│   │   └── index.css        # Design System e temas visuais
│   ├── package.json         # Dependências Node.js
│   ├── vercel.json          # Configuração de rotas SPA para Vercel
│   └── .env.example         # Exemplo de variáveis de ambiente do frontend
│
├── Prompts/                  # Documentação de arquitetura e prompts de IA
├── .gitignore               # Proteção estrita contra vazamento de segredos (.env)
└── README.md                # Guia de instalação e deploy
```

---

## 🔒 Segurança e Gestão de Variáveis de Ambiente

> **IMPORTANTE:** O arquivo `.env` com chaves de API **NUNCA** deve ser commitado no GitHub ou enviado ao frontend.
> O projeto conta com regras estritas no `.gitignore` na raiz e nos subdiretórios para garantir que `.env`, chaves e credenciais permaneçam estritamente no seu ambiente local e seguro.

### 1. Variáveis do Backend (`backend/.env`)
Crie o arquivo `backend/.env` baseado no `backend/.env.example`:
```env
GROQ_API_KEY=sua_chave_groq_aqui
GROQ_MODEL=llama-3.3-70b-versatile
PORT=8000
HOST=127.0.0.1
```

### 2. Variáveis do Frontend (`frontend/.env`)
Crie o arquivo `frontend/.env` baseado no `frontend/.env.example`:
```env
# URL do backend FastAPI (local ou em produção)
VITE_API_URL=http://127.0.0.1:8000
```

---

## 🚀 Como Rodar Localmente

### 1. Iniciar o Backend (FastAPI)
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate

# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*O backend estará rodando em `http://127.0.0.1:8000` (documentação Swagger em `http://127.0.0.1:8000/docs`).*

### 2. Iniciar o Frontend (React + Vite)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
*O frontend estará disponível em `http://localhost:3000`.*

---

## 🌐 Guia de Deploy

### 1. Deploy do Frontend na **Vercel**
1. Acesse o painel da [Vercel](https://vercel.com) e clique em **"Add New" > "Project"**.
2. Conecte seu repositório GitHub `Chatbot_MaisCacau`.
3. Na seção **Root Directory**, clique em **Edit** e selecione a pasta `frontend`.
4. Em **Environment Variables**, adicione:
   - `VITE_API_URL`: URL do seu backend em produção (ex: `https://seu-backend.onrender.com`).
5. Clique em **Deploy**.

### 2. Deploy do Backend (Render / Railway / Fly.io)
Para que o chatbot funcione em produção com IA completa:
1. No [Render](https://render.com), crie um novo **Web Service** apontando para o repositório.
2. Defina:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Em **Environment Variables**, configure:
   - `GROQ_API_KEY`: sua chave de API da Groq.
   - `GROQ_MODEL`: `llama-3.3-70b-versatile`.
4. Copie a URL gerada e insira no `VITE_API_URL` da Vercel!

---

## 👩‍🍳 Autoria & Direitos
- **Projeto:** MaisCacau — Brownies Recheados Artesanais
- **Fundadora:** Maria Eduarda
- **Desenvolvido com carinho e dedicação!** 🤎✨
