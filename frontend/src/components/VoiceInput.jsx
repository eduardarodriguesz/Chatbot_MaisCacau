import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react'

/**
 * Componente VoiceInput
 * Reconhecimento de Voz nativo (Speech-to-Text) com Web Speech API.
 * 
 * Suporte completo para Desktop e Smartphones (Android Google Chrome / iOS Safari).
 * 
 * @param {Object} props
 * @param {(transcript: string) => void} props.onTranscript - Função de callback chamada ao transcrever a fala
 * @param {boolean} [props.disabled=false] - Se o botão de microfone está desabilitado
 */
export default function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)

  // Verifica se o navegador suporta a Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
    }

    // Cleanup ao desmontar componente
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          // Ignora erros ao abortar instância já finalizada
        }
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Limpa mensagens de erro após 5 segundos
  const showErrorToast = (msg) => {
    setErrorMessage(msg)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  // Verifica se o contexto é seguro (HTTPS ou localhost)
  const checkSecureContext = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!window.isSecureContext && !isLocalhost) {
      showErrorToast(
        '⚠️ O microfone no celular requer conexão HTTPS segura. Utilize o túnel do Localtunnel (https://) para testar no smartphone.'
      )
      return false
    }
    return true
  }

  const toggleListening = () => {
    if (disabled) return

    // Se já estiver escutando, para a gravação
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Fallback se já tiver parado
        }
      }
      setIsListening(false)
      return
    }

    // Validações prévias
    if (!isSupported) {
      showErrorToast('Seu navegador não suporta reconhecimento de voz nativo. Recomendamos usar o Google Chrome ou Safari.')
      return
    }

    if (!checkSecureContext()) {
      return
    }

    // Inicialização limpa a cada clique para máxima estabilidade em celulares
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.lang = 'pt-BR'
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setErrorMessage(null)
      }

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript
        if (transcript && transcript.trim()) {
          if (onTranscript && typeof onTranscript === 'function') {
            onTranscript(transcript.trim())
          }
        }
      }

      recognition.onerror = (event) => {
        setIsListening(false)
        console.warn('[VoiceInput] Erro na Web Speech API:', event.error)

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            showErrorToast('Permissão de microfone negada. Toque no ícone de cadeado/configurações do navegador e permita o microfone.')
            break
          case 'no-speech':
            showErrorToast('Nenhuma fala foi detectada. Tente falar mais perto do microfone.')
            break
          case 'network':
            showErrorToast('Erro de conexão no serviço de voz. Verifique sua conexão com a internet.')
            break
          case 'aborted':
            // Cancelamento intencional do usuário, não precisa alertar
            break
          default:
            showErrorToast(`Não foi possível reconhecer a voz (${event.error}). Tente novamente.`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('[VoiceInput] Falha ao iniciar reconhecimento:', err)
      setIsListening(false)
      showErrorToast('Falha ao acessar o microfone. Verifique as permissões do seu dispositivo.')
    }
  }

  return (
    <>
      {/* Botão de Microfone na barra de entrada */}
      <button
        type="button"
        className={`voice-button ${isListening ? 'is-recording' : ''}`}
        onClick={toggleListening}
        disabled={disabled}
        title={
          isListening
            ? 'Gravando voz... Clique para cancelar'
            : 'Falar com o assistente por voz (pt-BR)'
        }
        aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
      >
        {isListening ? (
          <MicOff size={19} className="mic-icon animate-pulse" />
        ) : (
          <Mic size={19} className="mic-icon" />
        )}
      </button>

      {/* Banner Flutuante de Gravação Ativa no Mobile/Desktop */}
      {isListening && (
        <div className="voice-listening-banner">
          <span className="voice-wave-dot"></span>
          <span>🎙️ <strong>Ouvindo no microfone...</strong> Fale sua dúvida agora!</span>
        </div>
      )}

      {/* Alerta / Toast de Erro Flutuante */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            right: '20px',
            background: 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 100,
            animation: 'message-slide-up 0.25s ease-out'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '0 4px'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
