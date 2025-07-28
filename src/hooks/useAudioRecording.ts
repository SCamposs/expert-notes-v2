import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

interface UseAudioRecordingReturn {
  isRecording: boolean
  isListening: boolean
  transcript: string
  isSupported: boolean
  browserSupport: {
    speechRecognition: boolean
    mediaRecorder: boolean
  }
  startRecording: () => void
  stopRecording: () => void
  resetTranscript: () => void
  error: string | null
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  
  // Verifica suporte do navegador
  const browserSupport = useMemo(
    () => ({
      speechRecognition:
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      mediaRecorder: 'MediaRecorder' in window,
    }),
    [],
  )

  const isSupported =
    browserSupport.speechRecognition || browserSupport.mediaRecorder

  // Inicializa o SpeechRecognition se disponível
  useEffect(() => {
    if (browserSupport.speechRecognition) {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognitionAPI) {
        speechRecognitionRef.current = new SpeechRecognitionAPI()
        const recognition = speechRecognitionRef.current

        recognition.lang = 'pt-BR'
        recognition.continuous = true
        recognition.maxAlternatives = 1
        recognition.interimResults = true

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('')

          setTranscript(transcript)
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setError(`Erro no reconhecimento de voz: ${event.error}`)
          setIsListening(false)
          setIsRecording(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [browserSupport.speechRecognition])

  const startRecording = useCallback(async () => {
    setError(null)
    
    if (browserSupport.speechRecognition && speechRecognitionRef.current) {
      // Usa SpeechRecognition API (preferido)
      try {
        speechRecognitionRef.current.start()
        setIsListening(true)
        setIsRecording(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setError('Erro ao iniciar reconhecimento de voz')
      }
    } else if (browserSupport.mediaRecorder) {
      // Fallback para MediaRecorder (sem transcrição automática)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        mediaRecorderRef.current = new MediaRecorder(stream)
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          // Aqui você poderia implementar um serviço de transcrição externo
          console.log('Audio data available:', event.data)
        }
        
        mediaRecorderRef.current.start()
        setIsRecording(true)
        setTranscript(
          '🎤 Gravando áudio... (transcrição automática não disponível neste navegador)',
        )
      } catch (error) {
        console.error('Error starting media recorder:', error)
        setError('Erro ao acessar o microfone')
      }
    } else {
      setError('Seu navegador não suporta gravação de áudio')
    }
  }, [browserSupport])

  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop()
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop())
    }
    
    setIsRecording(false)
    setIsListening(false)
  }, [isListening, isRecording])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return {
    isRecording,
    isListening,
    transcript,
    isSupported,
    browserSupport,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  }
}
