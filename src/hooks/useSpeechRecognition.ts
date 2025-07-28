import { useState, useCallback, useRef } from 'react'

interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
}

interface SpeechRecognitionHook {
  isSupported: boolean
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export function useSpeechRecognition({
  onResult,
  onError,
  language = 'pt-BR'
}: UseSpeechRecognitionProps = {}): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Verifica se a API é suportada
  const isSupported = 
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = 'Speech Recognition não é suportado neste navegador'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    try {
      const SpeechRecognitionAPI = 
        window.SpeechRecognition || window.webkitSpeechRecognition

      recognitionRef.current = new SpeechRecognitionAPI()
      
      recognitionRef.current.lang = language
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('')
        
        setTranscript(currentTranscript)
        onResult?.(currentTranscript)
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMsg = `Erro na gravação: ${event.error}`
        setError(errorMsg)
        setIsListening(false)
        onError?.(errorMsg)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } catch (err) {
      const errorMsg = 'Erro ao iniciar gravação'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [isSupported, language, onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error
  }
}
