"""
Servidor de API REST com FastAPI
MaisCacau — Brownies Recheados Artesanais | Chatbot Full-Stack

Expõe o ChatbotEngine via endpoints HTTP REST com suporte a CORS,
validação de dados com Pydantic e monitoramento de métricas.
"""

import sys
import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Garante que o diretório atual do script esteja no sys.path para importações locais
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from chatbot_engine import ChatbotEngine

# -----------------------------------------------------------------------------
# 1. Inicialização do App FastAPI e Configuração de CORS
# -----------------------------------------------------------------------------
app = FastAPI(
    title="MaisCacau Chatbot API",
    description="API REST para o Chatbot de Atendimento Oficial da MaisCacau Brownies Artesanais.",
    version="1.0.0"
)

# Configuração de CORS liberando todas as origens para conexão com o frontend Vite/React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instância única do motor de IA
engine = ChatbotEngine()


# -----------------------------------------------------------------------------
# 2. Modelos Pydantic para Validação de Entrada e Saída
# -----------------------------------------------------------------------------
class MessageRequest(BaseModel):
    """Modelo de entrada para envio de mensagens ao chatbot."""
    message: str = Field(..., min_length=1, description="Mensagem de texto enviada pelo usuário")
    session_id: Optional[str] = Field(None, description="Identificador único da sessão de conversação")


class FeedbackRequest(BaseModel):
    """Modelo de entrada para registro de feedback (Like / Dislike)."""
    message_id: str = Field(..., description="ID da mensagem avaliada")
    is_positive: bool = Field(..., description="True para Like (positivo), False para Dislike (negativo)")


class ChatResponse(BaseModel):
    """Modelo de resposta gerado pelo motor do chatbot."""
    reply: str = Field(..., description="Texto da resposta gerada pelo chatbot")
    source: str = Field(..., description="Origem da resposta: 'saudacao', 'base_conhecimento', 'groq_llm' ou 'fallback'")
    confidence: float = Field(..., description="Nível de confiança da resposta entre 0.0 e 1.0")
    timestamp: float = Field(..., description="Timestamp Unix do momento da resposta")
    suggested_actions: List[str] = Field(default_factory=list, description="Lista de ações ou perguntas sugeridas")
    message_id: Optional[str] = Field(None, description="ID único da mensagem para vínculo de feedback")


# -----------------------------------------------------------------------------
# 3. Endpoints da API REST
# -----------------------------------------------------------------------------
@app.get("/", summary="Status da API e Rotas Disponíveis")
def get_root():
    """Retorna o status de saúde da API e a lista de endpoints disponíveis."""
    return {
        "status": "online",
        "service": "MaisCacau Chatbot API",
        "version": "1.0.0",
        "endpoints": [
            {"path": "/", "method": "GET", "description": "Status da API e lista de endpoints"},
            {"path": "/api/chat", "method": "POST", "description": "Processa uma mensagem no motor de IA e retorna a resposta"},
            {"path": "/api/knowledge-base", "method": "GET", "description": "Retorna os dados da base de conhecimento carregada"},
            {"path": "/api/metrics", "method": "GET", "description": "Retorna o total de atendimentos e taxa de satisfação (%)"},
            {"path": "/api/feedback", "method": "POST", "description": "Registra avaliação de Like/Dislike de uma resposta"}
        ]
    }


@app.post("/api/chat", response_model=ChatResponse, summary="Processar Mensagem do Chatbot")
def post_chat(request: MessageRequest):
    """Recebe uma mensagem de texto, submete ao ChatbotEngine e retorna a resposta estruturada."""
    try:
        result = engine.process_message(
            message=request.message,
            session_id=request.session_id
        )
        return ChatResponse(
            reply=result["reply"],
            source=result["source"],
            confidence=result["confidence"],
            timestamp=result["timestamp"],
            suggested_actions=result.get("suggested_actions", []),
            message_id=result.get("message_id")
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno ao processar a mensagem: {str(e)}"
        )


@app.get("/api/knowledge-base", summary="Obter Base de Conhecimento")
def get_knowledge_base():
    """Retorna o conteúdo completo da base de conhecimento factual (RAG) em memória."""
    return engine.get_knowledge_base()


@app.get("/api/metrics", summary="Obter Métricas de Atendimento e Satisfação")
def get_metrics():
    """Retorna o total de atendimentos realizados e a taxa calculada de satisfação (%)."""
    return engine.get_metrics()


@app.post("/api/feedback", summary="Registrar Avaliação (Like / Dislike)")
def post_feedback(request: FeedbackRequest):
    """Registra uma avaliação do usuário (Like/Dislike) associada a uma mensagem específica."""
    try:
        return engine.register_feedback(
            message_id=request.message_id,
            is_positive=request.is_positive
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao registrar feedback: {str(e)}"
        )


# -----------------------------------------------------------------------------
# 4. Bloco de Execução Principal com Uvicorn na Porta 8000
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("[MaisCacau] Iniciando servidor FastAPI em http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
