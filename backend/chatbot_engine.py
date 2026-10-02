"""
Motor de Inteligência Artificial & Processamento de Linguagem Natural (PLN)
MaisCacau — Brownies Recheados Artesanais | Chatbot Full-Stack
"""

import json
import os
import re
import string
import time
import unicodedata
import urllib.error
import urllib.request
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

# Carrega variáveis de ambiente do arquivo .env com suporte nativo e python-dotenv
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(CURRENT_DIR, ".env")

try:
    from dotenv import load_dotenv
    if os.path.exists(ENV_PATH):
        load_dotenv(ENV_PATH)
    else:
        load_dotenv()
except ImportError:
    pass

# Fallback nativo caso python-dotenv não esteja instalado
if not os.getenv("GROQ_API_KEY") and os.path.exists(ENV_PATH):
    try:
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip()
    except Exception:
        pass


class ChatbotEngine:
    """Classe responsável pelo processamento de mensagens, busca léxica na base

    de conhecimento da MaisCacau (RAG), orquestração com LLM (Groq / Llama-3)
    e gestão de métricas.
    """

    # Lista de stopwords comuns da língua portuguesa
    STOPWORDS = {
        "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
        "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "pelos", "pelas", "com",
        "para", "pra", "pro", "que", "se", "eu", "voce", "vocês", "ele", "ela", "eles",
        "elas", "nos", "meu", "minha", "seu", "sua", "nosso", "nossa", "e", "ou", "mas",
        "como", "qual", "quais", "quando", "onde", "por que", "porque", "esta", "este",
        "esse", "essa", "isso", "aquilo", "sao", "foi", "ser", "ter", "estou", "tem",
        "mais", "muito", "ja", "favor", "gostaria", "saber", "queria"
    }

    # Padrões comuns de saudações em português
    GREETING_KEYWORDS = [
        "ola", "olá", "oi", "oie", "bom dia", "boa tarde", "boa noite",
        "e ai", "e aí", "tudo bem", "como vai", "saudações", "opa"
    ]

    def __init__(self, knowledge_base_path: Optional[str] = None):
        """Inicializa o motor do chatbot carregando a base de conhecimento e configurações."""
        self.base_dir = os.path.dirname(os.path.abspath(__file__))

        # Caminho padrão da base de conhecimento
        if knowledge_base_path is None:
            self.knowledge_base_path = os.path.join(self.base_dir, "base_conhecimento.json")
        else:
            self.knowledge_base_path = knowledge_base_path

        # 1. Carrega a base de conhecimento JSON
        self.knowledge_base = self._load_knowledge_base()

        # 2. Configurações da LLM (Groq / Llama-3)
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self.groq_endpoint = "https://api.groq.com/openai/v1/chat/completions"

        # Histórico de conversação multi-turn por sessão: {session_id: [{"role": ..., "content": ...}]}
        self.conversation_sessions: Dict[str, List[Dict[str, str]]] = {}

        # 4. Gestão de Métricas de atendimento e satisfação
        self.metrics = {
            "total_messages": 0,
            "resolved_by_base": 0,
            "resolved_by_llm": 0,
            "fallbacks": 0,
            "positive_feedback": 0,
            "negative_feedback": 0,
        }

    def _load_knowledge_base(self) -> Dict[str, Any]:
        """Carrega e valida o arquivo JSON com a base de conhecimento da MaisCacau."""
        if not os.path.exists(self.knowledge_base_path):
            raise FileNotFoundError(
                f"Arquivo de base de conhecimento não encontrado em: {self.knowledge_base_path}"
            )

        with open(self.knowledge_base_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if "topicos" not in data or not isinstance(data["topicos"], list):
            raise ValueError("A base de conhecimento deve conter a chave 'topicos' com uma lista.")

        return data

    def _normalize_text(self, text: str) -> str:
        """Remove acentos, pontuações, converte para minúsculas e remove espaços extras."""
        if not text:
            return ""
        # Normalização NFD para decomposição de acentos
        nfkd_form = unicodedata.normalize("NFD", text)
        text_without_accents = "".join([c for c in nfkd_form if unicodedata.category(c) != "Mn"])
        text_clean = text_without_accents.lower()
        # Remove pontuações
        text_clean = text_clean.translate(str.maketrans("", "", string.punctuation))
        # Substitui múltiplos espaços por espaço único
        return re.sub(r"\s+", " ", text_clean).strip()

    def _tokenize(self, text: str) -> List[str]:
        """Gera tokens filtrando stopwords e termos vazios."""
        normalized = self._normalize_text(text)
        tokens = normalized.split()
        return [t for t in tokens if t not in self.STOPWORDS and len(t) > 1]

    def _calculate_similarity(self, query_tokens: List[str], target_text: str) -> float:
        """Calcula a similaridade ponderada por overlap de termos e correspondência direta."""
        if not query_tokens:
            return 0.0

        target_normalized = self._normalize_text(target_text)
        target_tokens = set(self._tokenize(target_text))

        if not target_tokens:
            return 0.0

        # Contagem de tokens coincidentes
        matches = sum(1 for token in query_tokens if token in target_tokens or token in target_normalized)
        jaccard_score = matches / (len(query_tokens) + len(target_tokens) - matches) if (len(query_tokens) + len(target_tokens) - matches) > 0 else 0.0
        overlap_ratio = matches / len(query_tokens)

        # Pontuação combinada (ponderando overlap e Jaccard)
        score = (overlap_ratio * 0.7) + (jaccard_score * 0.3)

        # Bônus para termos exatos da MaisCacau
        query_str = " ".join(query_tokens)
        if query_str in target_normalized:
            score = min(1.0, score + 0.35)

        return round(score, 4)

    def _is_greeting(self, text: str) -> bool:
        """Identifica se a mensagem do usuário é uma saudação inicial."""
        normalized = self._normalize_text(text)
        words = normalized.split()
        if not words:
            return False

        # Mensagens muito curtas contendo saudações
        if len(words) <= 4:
            for greeting in self.GREETING_KEYWORDS:
                if greeting in normalized:
                    return True
        return False

    def _find_best_topic(self, user_message: str, threshold: float = 0.20) -> Optional[Dict[str, Any]]:
        """Busca o tópico mais aderente na base de conhecimento usando PLN léxico-semântico."""
        query_tokens = self._tokenize(user_message)
        if not query_tokens:
            return None

        best_topic = None
        best_score = 0.0

        for topic in self.knowledge_base.get("topicos", []):
            topic_id = topic.get("id", "")
            perguntas = topic.get("perguntas_chave", [])
            resposta = topic.get("resposta", "")

            # Avalia similaridade com as perguntas-chave
            for pergunta in perguntas:
                score = self._calculate_similarity(query_tokens, pergunta)
                if score > best_score:
                    best_score = score
                    best_topic = topic

            # Avalia similaridade complementar com o ID e texto da resposta
            score_topic = self._calculate_similarity(query_tokens, topic_id.replace("_", " "))
            if score_topic > best_score:
                best_score = score_topic
                best_topic = topic

            score_resposta = self._calculate_similarity(query_tokens, resposta) * 0.75
            if score_resposta > best_score:
                best_score = score_resposta
                best_topic = topic

        if best_topic and best_score >= threshold:
            return {
                "topic": best_topic,
                "confidence": min(1.0, round(best_score, 2))
            }
        return None

    def _get_current_date_pt_br(self) -> str:
        """Retorna a data atual formatada por extenso em português."""
        meses = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ]
        now = datetime.now()
        mes_nome = meses[now.month - 1]
        return f"{now.day} de {mes_nome} de {now.year}"

    def _build_system_prompt(self) -> str:
        """Constrói o prompt de sistema completo da MaisCacau com todas as regras,

        cardápio, tabela de preços, cálculo de mini brownies e diretrizes.
        """
        data_atual = self._get_current_date_pt_br()

        # Monta a base de dados dos tópicos em texto estruturado
        topicos_text = []
        for topico in self.knowledge_base.get("topicos", []):
            topicos_text.append(
                f"- TÓPICO: {topico.get('id')}\n"
                f"  Perguntas associadas: {', '.join(topico.get('perguntas_chave', []))}\n"
                f"  Conteúdo oficial: {topico.get('resposta')}"
            )
        knowledge_context = "\n\n".join(topicos_text)

        system_prompt = f"""# BASE DE CONHECIMENTO OFICIAL & SYSTEM PROMPT — MAISCACAU

Você é a assistente virtual oficial e inteligente da **MaisCacau**, confeitaria artesanal especializada exclusivamente em brownies recheados de alta qualidade.
Data atual: {data_atual}.

## 1. IDENTIDADE DA EMPRESA
- Nome: MaisCacau
- Segmento: Confeitaria e produção artesanal de brownies
- Produto principal e único: Brownies recheados feitos à mão
- Fundadora: Maria Eduarda
- Fundação: Agosto de 2026

## 2. HISTÓRIA & PROPÓSITO
A MaisCacau foi fundada em agosto de 2026 por Maria Eduarda. Inicialmente criada para ajudar com as despesas e contas de casa, a empresa conquistou clientes, pedidos, reconhecimento e vendas, transformando-se em uma grande paixão, objetivo e responsabilidade.
Propósito: Transformar amor, carinho e cuidado em brownies deliciosos, feitos à mão com dedicação artesanal.
Frases que representam a marca:
- "MaisCacau nasceu de uma necessidade, cresceu com o carinho dos clientes e continua existindo para transformar amor e cuidado em brownies."
- "Mais recheio. Mais chocolate. MaisCacau."

## 3. SABORES DE BROWNIE RECHEADO
1. Doce de leite
2. Merengue
3. Chocolate tradicional
4. Casadinho
5. Limão
6. Maracujá
7. Brigadeiro branco
8. Ninho com morango
9. Ninho tradicional
10. Paçoca

## 4. SIGNIFICADO DO NOME "MAISCACAU"
- "Cacau": Ingrediente essencial do chocolate e do brownie.
- "Mais": O recheio especial que acrescenta sabor, carinho e qualidade ("mais sabor, mais recheio, mais carinho e mais qualidade").

## 5. VALORES & IDENTIDADE VISUAL
- Valores: Qualidade, Carinho, Amor, Artesanato (feito à mão), Dedicação, Satisfação do cliente e Crescimento sem perder a essência.
- Cores: Vermelho escuro/cereja (fundo), amarelo manteiga/creme (recheio), marrom chocolate.
- Conceito da Logo: Brownie com casquinha craquelada, nome MaisCacau em amarelo manteiga e gotas de chocolate caindo.
- Diferencial: Brownie feito à mão + recheio especial + cuidado em cada detalhe = MaisCacau.

## 6. TABELA DE PREÇOS & REGRA DE CÁLCULO
- Brownie sem recheio: R$ 7,00 a R$ 9,00 por unidade.
- Brownie recheado: R$ 10,00 a R$ 14,00 por unidade (varia conforme sabor/recheio).
- Encomendas de Mini Brownies (Eventos & Festas):
  Regra proporcional estrita: R$ 140,00 a cada 100 unidades (R$ 1,40 por unidade).
  * 50 mini brownies = R$ 70,00
  * 100 mini brownies (1 cento) = R$ 140,00
  * 150 mini brownies = R$ 210,00
  * 200 mini brownies (2 centos) = R$ 280,00
  * 250 mini brownies = R$ 350,00
  * 300 mini brownies = R$ 420,00
  * 400 mini brownies = R$ 560,00
  * 500 mini brownies = R$ 700,00
  Para qualquer quantidade solicitada, aplique essa regra proporcional.

## 7. DIRETRIZES DE RESPOSTA OBRIGATÓRIAS
1. Responda com simpatia, calor humano, delicadeza e formatação Markdown elegante (negrito, tópicos, emojis delicados: 🍫, 🤎, ✨, 🍓, 🧁).
2. Não invente produtos fora do escopo (a MaisCacau não vende salgados, tortas, bolos de festa tradicionais ou cupcakes; é especialista e focada em brownies).
3. Nunca invente dados não cadastrados. Se o usuário perguntar sobre detalhes não presentes na base de conhecimento (ex: frete exato para um CEP específico), oriente com carinho a consultar o atendimento direto da Maria Eduarda / MaisCacau.
4. Mantenha fidelidade factual total às informações abaixo.

## 8. PROTOCOLO DE ATENDIMENTO DE PROBLEMAS E RECLAMAÇÕES
Ao identificar que o cliente tem um PROBLEMA (pedido atrasado, sabor errado, brownie danificado, embalagem com defeito, produto diferente, reclamação, etc.), siga rigorosamente este protocolo:
1. **Ouça e entenda:** Pergunte detalhes específicos sobre o problema (número do pedido, sabor, data, o que aconteceu exatamente).
2. **Demonstre empatia:** Peça desculpas de forma sincera e acolhedora. Mostre que a MaisCacau se importa genuinamente.
3. **Ofereça uma solução possível:** Sugira caminhos como troca, reenvio ou contato direto com a Maria Eduarda para resolver.
4. **Encaminhe para atendimento humano:** Sempre forneça os canais oficiais para que o cliente finalize a resolução diretamente.
5. **NUNCA invente** informações sobre pedidos específicos, reembolsos, trocas, compensações ou prazos que não estejam nesta base. Quando não souber, oriente o contato direto.
6. **Objetivo:** Fazer o cliente se sentir ouvido, respeitado e bem atendido, mantendo a essência da MaisCacau.

## 9. CANAIS OFICIAIS DE CONTATO
Sempre que precisar direcionar o cliente para atendimento humano, utilize ESTES canais:
- 📸 **Instagram:** @maiscacauoficial
- 📱 **WhatsApp:** (11) 39467-8397

### BASE DE CONHECIMENTO OFICIAL (RAG):
{knowledge_context}
"""
        return system_prompt

    def _call_groq_llm(self, user_message: str, session_id: str) -> Optional[str]:
        """Executa a requisição HTTP para a API da Groq utilizando urllib mantendo histórico."""
        if not self.groq_api_key:
            return None

        # Inicializa sessão se não existir
        if session_id not in self.conversation_sessions:
            self.conversation_sessions[session_id] = [
                {"role": "system", "content": self._build_system_prompt()}
            ]

        history = self.conversation_sessions[session_id]
        history.append({"role": "user", "content": user_message})

        # Limita histórico recente (últimas 10 mensagens + system prompt)
        if len(history) > 11:
            history = [history[0]] + history[-10:]
            self.conversation_sessions[session_id] = history

        payload = {
            "model": self.groq_model,
            "messages": history,
            "temperature": 0.35,
            "max_tokens": 800,
        }

        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                self.groq_endpoint,
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "User-Agent": "MaisCacau-ChatbotEngine/1.0",
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    resp_body = response.read().decode("utf-8")
                    resp_json = json.loads(resp_body)
                    assistant_message = resp_json["choices"][0]["message"]["content"]
                    # Armazena resposta no histórico
                    history.append({"role": "assistant", "content": assistant_message})
                    return assistant_message
        except urllib.error.HTTPError as e:
            print(f"[ChatbotEngine] Erro HTTP ao chamar Groq API ({e.code}): {e.reason}")
        except Exception as e:
            print(f"[ChatbotEngine] Falha na requisição para Groq LLM: {e}")

        return None

    def process_message(self, message: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Processa a mensagem do usuário executando o pipeline:

        1. Detecção de saudação
        2. Chamada à LLM Generativa (se chave configurada)
        3. Motor Léxico sobre a Base de Conhecimento
        4. Fallback seguro e afetuoso
        """
        self.metrics["total_messages"] += 1
        msg_id = str(uuid.uuid4())
        session = session_id or "default_session"
        faq = self.knowledge_base.get("faq_rapido", [])

        # 1. Detecção de Saudações
        if self._is_greeting(message):
            self.metrics["resolved_by_base"] += 1
            greeting_reply = (
                "👋 **Olá! Seja muito bem-vindo(a) à MaisCacau!** 🍫🤎\n\n"
                "Eu sou a assistente virtual oficial dos nossos **brownies recheados artesanais**, feitos à mão com todo amor, carinho e dedicação pela **Maria Eduarda**.\n\n"
                "Como posso deixar o seu dia mais doce hoje?\n\n"
                "💡 *Você pode clicar em uma das opções abaixo ou me fazer qualquer pergunta sobre o cardápio, preços e encomendas:*"
            )
            return {
                "message_id": msg_id,
                "reply": greeting_reply,
                "source": "saudacao",
                "confidence": 0.98,
                "timestamp": round(time.time(), 3),
                "suggested_actions": faq[:4]
            }

        # 2. Tentativa via LLM Generativa (Groq API)
        if self.groq_api_key:
            llm_reply = self._call_groq_llm(message, session)
            if llm_reply:
                self.metrics["resolved_by_llm"] += 1
                return {
                    "message_id": msg_id,
                    "reply": llm_reply,
                    "source": "groq_llm",
                    "confidence": 0.95,
                    "timestamp": round(time.time(), 3),
                    "suggested_actions": faq[:3]
                }

        # 3. Motor Léxico e Semântico na Base de Conhecimento (Offline / Fallback RAG)
        match = self._find_best_topic(message, threshold=0.18)
        if match:
            self.metrics["resolved_by_base"] += 1
            topic = match["topic"]
            confidence = match["confidence"]

            # Sugestões derivadas de outros tópicos
            other_suggestions = [
                q for t in self.knowledge_base.get("topicos", [])
                if t.get("id") != topic.get("id")
                for q in t.get("perguntas_chave", [])[:1]
            ][:3]

            return {
                "message_id": msg_id,
                "reply": topic.get("resposta", ""),
                "source": "base_conhecimento",
                "confidence": confidence,
                "timestamp": round(time.time(), 3),
                "suggested_actions": other_suggestions or faq[:3]
            }

        # 4. Fallback Seguro quando não há correspondência
        self.metrics["fallbacks"] += 1
        fallback_reply = (
            "🤎 **Desculpe, ainda não tenho essa informação exata na minha base oficial.**\n\n"
            "Posso te ajudar com detalhes sobre nossos **10 Sabores de Brownies Recheados**, "
            "valores individuais, **encomendas de mini brownies para eventos** ou sobre a **história da MaisCacau**!\n\n"
            "Se você está com algum **problema com seu pedido**, me conte o que aconteceu que vou te ajudar! 💛\n\n"
            "📞 **Canais de Contato Oficiais:**\n"
            "- 📸 **Instagram:** [@maiscacauoficial](https://instagram.com/maiscacauoficial)\n"
            "- 📱 **WhatsApp:** **(11) 39467-8397**\n\n"
            "Veja algumas das perguntas mais comuns que você pode me fazer:"
        )

        return {
            "message_id": msg_id,
            "reply": fallback_reply,
            "source": "fallback",
            "confidence": 0.15,
            "timestamp": round(time.time(), 3),
            "suggested_actions": faq[:4]
        }

    def register_feedback(self, message_id: str, is_positive: bool) -> Dict[str, Any]:
        """Registra a avaliação de Like (positivo) ou Dislike (negativo) para alimentar as métricas."""
        if is_positive:
            self.metrics["positive_feedback"] += 1
        else:
            self.metrics["negative_feedback"] += 1

        total_feedback = self.metrics["positive_feedback"] + self.metrics["negative_feedback"]
        satisfaction_rate = (
            round((self.metrics["positive_feedback"] / total_feedback) * 100, 1)
            if total_feedback > 0 else 100.0
        )

        return {
            "status": "success",
            "message_id": message_id,
            "is_positive": is_positive,
            "current_satisfaction_rate": satisfaction_rate,
            "total_feedback_count": total_feedback
        }

    def get_metrics(self) -> Dict[str, Any]:
        """Retorna o consolidado de atendimentos e a taxa de satisfação calculada."""
        total_feedback = self.metrics["positive_feedback"] + self.metrics["negative_feedback"]
        satisfaction_rate = (
            round((self.metrics["positive_feedback"] / total_feedback) * 100, 1)
            if total_feedback > 0 else 100.0
        )

        return {
            "total_atendimentos": self.metrics["total_messages"],
            "taxa_satisfacao_pct": satisfaction_rate,
            "mensagens_resolvidas_base": self.metrics["resolved_by_base"],
            "mensagens_resolvidas_llm": self.metrics["resolved_by_llm"],
            "fallbacks": self.metrics["fallbacks"],
            "feedbacks_positivos": self.metrics["positive_feedback"],
            "feedbacks_negativos": self.metrics["negative_feedback"],
        }

    def get_knowledge_base(self) -> Dict[str, Any]:
        """Retorna a base de conhecimento carregada em memória."""
        return self.knowledge_base
