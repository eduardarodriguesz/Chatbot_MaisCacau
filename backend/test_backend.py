"""
Script de Testes Automatizados no Terminal
MaisCacau — Brownies Recheados Artesanais | Chatbot Full-Stack

Valida os cenários principais do ChatbotEngine para a MaisCacau:
1. Saudação do usuário ("Olá, tudo bem?")
2. Pergunta sobre Sabores e Cardápio ("Quais são os sabores de brownie?")
3. Pergunta sobre Encomendas de Mini Brownies ("Quanto custa 200 mini brownies?")
4. Pergunta sobre História e Fundadora ("Quem fundou a MaisCacau?")
"""

import sys
import os
import time

# Configura encoding UTF-8 no terminal Windows para suportar emojis e acentos sem falhas
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Garante que o diretório atual do script esteja no sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from chatbot_engine import ChatbotEngine


def format_divider(char="=", length=72) -> str:
    """Gera linha divisória com o caractere desejado."""
    return char * length


def print_banner(title: str):
    """Imprime um cabeçalho formatado no terminal."""
    print("\n" + format_divider("="))
    print(f"  {title.center(68)}")
    print(format_divider("="))


def print_llm_status(engine: ChatbotEngine):
    """Verifica e exibe no terminal o status da LLM e configurações de RAG."""
    api_key = engine.groq_api_key
    model = engine.groq_model
    total_topicos = len(engine.knowledge_base.get("topicos", []))
    total_faq = len(engine.knowledge_base.get("faq_rapido", []))

    print("\n📋 [STATUS DO SISTEMA & LLM]")
    print(format_divider("-"))

    if api_key:
        masked_key = api_key[:4] + "*" * (len(api_key) - 8) + api_key[-4:] if len(api_key) > 8 else "***"
        print(f"  • Provedor LLM:        Groq Cloud API")
        print(f"  • Modelo Configurado:  {model}")
        print(f"  • Chave de API:        Configurada ({masked_key})")
        print(f"  • Modo Operacional:    Híbrido (LLM Generativa + RAG Local)")
    else:
        print(f"  • Provedor LLM:        Groq Cloud API (Modo Offline / Sem Chave)")
        print(f"  • Modo Operacional:    RAG Local / Busca Léxico-Semântica Offline")
        print(f"  • Nota:                O sistema responderá com fidelidade total à base local.")

    print(f"  • Base de Conhecimento: Carregada ({total_topicos} tópicos, {total_faq} FAQs rápidos)")
    print(f"  • Empresa:             {engine.knowledge_base.get('empresa', 'MaisCacau')}")
    print(f"  • Fundadora:           {engine.knowledge_base.get('fundadora', 'Maria Eduarda')}")
    print(format_divider("-"))


def run_test_scenario(
    engine: ChatbotEngine,
    scenario_number: int,
    test_name: str,
    user_message: str,
    expected_keywords: list,
    min_confidence: float = 0.20
) -> bool:
    """Executa um cenário de teste automatizado e valida os critérios de qualidade."""
    print(f"\n🧪 [TESTE 0{scenario_number}] {test_name}")
    print(f"   Pergunta enviada: \"{user_message}\"")

    start_time = time.time()
    response = engine.process_message(user_message, session_id=f"test_session_{scenario_number}")
    elapsed_ms = round((time.time() - start_time) * 1000, 1)

    reply = response.get("reply", "").strip()
    source = response.get("source", "desconhecido")
    confidence = response.get("confidence", 0.0)
    suggested = response.get("suggested_actions", [])

    # Exibe métricas da resposta
    print(f"   ⏱️ Tempo de processamento: {elapsed_ms} ms")
    print(f"   🏷️ Origem da resposta:    {source.upper()}")
    print(f"   🎯 Confiança estimada:   {confidence * 100:.1f}% ({confidence})")

    # Exibe a resposta obtida
    print("   💬 Resposta obtida:")
    for line in reply.split("\n"):
        print(f"      {line}")

    if suggested:
        print(f"   💡 Ações sugeridas:      {len(suggested)} opções disponíveis")

    # Validações automáticas
    checks_passed = True
    reasons = []

    if not reply:
        checks_passed = False
        reasons.append("Resposta retornou vazia")

    if confidence < min_confidence:
        checks_passed = False
        reasons.append(f"Confiança ({confidence}) abaixo do mínimo esperado ({min_confidence})")

    # Verifica se pelo menos uma palavra-chave esperada foi encontrada na resposta
    reply_lower = reply.lower()
    keyword_matched = any(kw.lower() in reply_lower for kw in expected_keywords)
    if not keyword_matched:
        checks_passed = False
        reasons.append(f"Nenhuma das palavras-chave {expected_keywords} foi encontrada na resposta")

    if checks_passed:
        print(f"   ✅ Resultado: [OK] Cenário {scenario_number} aprovado com sucesso!")
        return True
    else:
        print(f"   ❌ Resultado: [FALHA] Falhas identificadas: {', '.join(reasons)}")
        return False


def main():
    """Função principal que orquestra a suíte de testes automatizados."""
    print_banner("MAISCACAU CHATBOT — SUÍTE DE TESTES AUTOMATIZADOS (TERMINAL)")

    # 1. Inicializa o motor
    try:
        engine = ChatbotEngine()
    except Exception as e:
        print(f"\n❌ [ERRO CRÍTICO] Falha ao instanciar ChatbotEngine: {e}")
        sys.exit(1)

    # 2. Exibe status da LLM e configurações
    print_llm_status(engine)

    # 3. Lista de cenários da MaisCacau
    test_scenarios = [
        {
            "id": 1,
            "name": "Validação de Saudação do Usuário",
            "message": "Olá, tudo bem?",
            "keywords": ["olá", "bem-vindo", "maiscacau", "brownie", "maria eduarda"],
            "min_confidence": 0.50,
        },
        {
            "id": 2,
            "name": "Validação de Sabores e Cardápio",
            "message": "Quais são os sabores de brownie recheado?",
            "keywords": ["doce de leite", "ninho", "chocolate", "morango", "merengue", "sabores"],
            "min_confidence": 0.20,
        },
        {
            "id": 3,
            "name": "Validação de Encomendas de Mini Brownies",
            "message": "Quanto custa 200 mini brownies para festa?",
            "keywords": ["mini brownies", "140,00", "280,00", "cento", "proporcional", "encomendas"],
            "min_confidence": 0.20,
        },
        {
            "id": 4,
            "name": "Validação de História e Fundação da Empresa",
            "message": "Quem fundou a MaisCacau e qual a história?",
            "keywords": ["maria eduarda", "agosto de 2026", "despesas", "amor", "carinho"],
            "min_confidence": 0.20,
        }
    ]

    results = []

    # 4. Executa cada teste automatizado
    for test in test_scenarios:
        success = run_test_scenario(
            engine=engine,
            scenario_number=test["id"],
            test_name=test["name"],
            user_message=test["message"],
            expected_keywords=test["keywords"],
            min_confidence=test["min_confidence"]
        )
        results.append((test["id"], test["name"], success))

    # 5. Validação complementar de Métricas e Feedback
    print("\n🧪 [TESTE 05] Registro de Feedback e Consistência de Métricas")
    sample_response = engine.process_message("Teste de métrica rápida")
    feedback_result = engine.register_feedback(sample_response["message_id"], is_positive=True)
    metrics = engine.get_metrics()
    metrics_ok = (
        feedback_result.get("status") == "success"
        and metrics.get("total_atendimentos", 0) > 0
        and metrics.get("taxa_satisfacao_pct", 0) > 0
    )
    if metrics_ok:
        print(f"   📊 Métricas coletadas com sucesso: {metrics['total_atendimentos']} mensagens processadas.")
        print(f"   👍 Taxa de satisfação: {metrics['taxa_satisfacao_pct']}%")
        print("   ✅ Resultado: [OK] Cenário de Métricas e Feedback aprovado com sucesso!")
        results.append((5, "Validação de Métricas e Feedback", True))
    else:
        print("   ❌ Resultado: [FALHA] Falha no cálculo de métricas")
        results.append((5, "Validação de Métricas e Feedback", False))

    # 6. Painel Resumo e Confirmação [OK]
    print("\n" + format_divider("="))
    print("                      RELATÓRIO CONSOLIDADO")
    print(format_divider("="))

    total_tests = len(results)
    passed_tests = sum(1 for _, _, ok in results if ok)

    for test_id, name, ok in results:
        status_tag = "[OK]" if ok else "[FALHOU]"
        symbol = "✅" if ok else "❌"
        print(f"  {symbol} Teste {test_id:02d}: {status_tag:<9} | {name}")

    print(format_divider("-"))
    print(f"  Total de Testes: {total_tests} | Aprovados: {passed_tests} | Falhas: {total_tests - passed_tests}")
    print(format_divider("-"))

    if passed_tests == total_tests:
        print("\n" + format_divider("*"))
        print("   🎉 [OK] TODOS OS TESTES PASSARAM COM SUCESSO! QUALIDADE APROVADA.")
        print(format_divider("*") + "\n")
        sys.exit(0)
    else:
        print("\n⚠️ [FALHA] Alguns testes não foram aprovados. Verifique as mensagens acima.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
