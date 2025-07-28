import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

interface AudioRecorderConfig {
  sampleRate?: number
  channels?: number
  bitDepth?: number
}

interface BrowserInfo {
  isOpera: boolean
  isOperaGX: boolean
  isChrome: boolean
  isSafari: boolean
  isFirefox: boolean
  supportsSpeechRecognition: boolean
  supportsMediaRecorder: boolean
  supportsWebAudio: boolean
  browserName: string
}

interface UseAdvancedAudioRecordingReturn {
  isRecording: boolean
  isListening: boolean
  transcript: string
  audioBlob: Blob | null
  browserInfo: BrowserInfo
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetTranscript: () => void
  transcribeAudio: () => Promise<void>
  error: string | null
}

export function useAdvancedAudioRecording(
  config: AudioRecorderConfig = {},
): UseAdvancedAudioRecordingReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Detectar navegador
  const browserInfo = useMemo((): BrowserInfo => {
    const userAgent = navigator.userAgent
    const isOpera = /Opera|OPR/.test(userAgent)
    const isOperaGX = /Opera GX/.test(userAgent) || /OPR/.test(userAgent)
    const isChrome = /Chrome/.test(userAgent) && !isOpera
    const isSafari = /Safari/.test(userAgent) && !/Chrome|Opera|OPR/.test(userAgent)
    const isFirefox = /Firefox/.test(userAgent)
    
    let browserName = 'Unknown'
    if (isOperaGX) browserName = 'Opera GX'
    else if (isOpera) browserName = 'Opera'
    else if (isChrome) browserName = 'Chrome'
    else if (isSafari) browserName = 'Safari'
    else if (isFirefox) browserName = 'Firefox'

    return {
      isOpera,
      isOperaGX,
      isChrome,
      isSafari,
      isFirefox,
      supportsSpeechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      supportsMediaRecorder: 'MediaRecorder' in window,
      supportsWebAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
      browserName,
    }
  }, [])

  return {
    isRecording,
    isListening,
    transcript,
    audioBlob,
    browserInfo,
    startRecording: () => Promise.resolve(),
    stopRecording: () => {},
    resetTranscript: () => {},
    transcribeAudio: () => Promise.resolve(),
    error,
  }
}

  // Configurar SpeechRecognition se disponível
  useEffect(() => {
    if (browserInfo.supportsSpeechRecognition) {
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
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [browserInfo.supportsSpeechRecognition])

  const startRecording = useCallback(async () => {
    setError(null)
    audioChunksRef.current = []

    try {
      // Configuração de áudio otimizada para diferentes navegadores
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: config.sampleRate || 44100,
          channelCount: config.channels || 1,
        }
      }

      // OperaGX/Opera precisa de configurações específicas
      if (browserInfo.isOpera || browserInfo.isOperaGX) {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Menor taxa de amostragem para Opera
          channelCount: 1,
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Tentar usar SpeechRecognition primeiro (Chrome, Edge)
      if (browserInfo.supportsSpeechRecognition && speechRecognitionRef.current && !browserInfo.isOpera) {
        try {
          speechRecognitionRef.current.start()
          setIsListening(true)
        } catch (speechError) {
          console.warn('SpeechRecognition failed, falling back to MediaRecorder:', speechError)
        }
      }

      // Sempre usar MediaRecorder para gravação de backup
      if (browserInfo.supportsMediaRecorder) {
        const options: MediaRecorderOptions = {}
        
        // Configurar codec baseado no navegador
        if (browserInfo.isOpera || browserInfo.isOperaGX) {
          // Opera funciona melhor com webm
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options.mimeType = 'audio/webm;codecs=opus'
          } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            options.mimeType = 'audio/webm'
          }
        } else if (browserInfo.isChrome) {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            options.mimeType = 'audio/webm;codecs=opus'
          }
        } else if (browserInfo.isSafari) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            options.mimeType = 'audio/mp4'
          }
        } else if (browserInfo.isFirefox) {
          if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            options.mimeType = 'audio/ogg;codecs=opus'
          }
        }

        mediaRecorderRef.current = new MediaRecorder(stream, options)
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
          })
          setAudioBlob(audioBlob)
          
          // Se não temos transcrição automática, sugerir transcrição manual
          if (!browserInfo.supportsSpeechRecognition || browserInfo.isOpera) {
            setTranscript('🎤 Áudio gravado! Clique em "Transcrever" ou digite manualmente.')
          }
        }

        mediaRecorderRef.current.start(100) // Chunk de 100ms para melhor responsividade
      }

      setIsRecording(true)

    } catch (error) {
      console.error('Error starting recording:', error)
      setError(`Erro ao iniciar gravação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }, [browserInfo, config])

  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current && isListening) {
      speechRecognitionRef.current.stop()
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    setIsRecording(false)
    setIsListening(false)
  }, [isListening, isRecording])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setAudioBlob(null)
    setError(null)
  }, [])

  // Transcrição usando Web Speech API ou serviços externos
  const transcribeAudio = useCallback(async () => {
    if (!audioBlob) {
      setError('Nenhum áudio disponível para transcrever')
      return
    }

    setError(null)
    
    try {
      // Para OperaGX e outros navegadores sem SpeechRecognition
      // Aqui você pode integrar com serviços como:
      // - Google Speech-to-Text API
      // - Azure Speech Services
      // - AssemblyAI
      // - Deepgram
      
      // Exemplo de integração (você precisaria configurar as chaves de API):
      /*
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      setTranscript(result.transcript)
      */
      
      // Por enquanto, mostrar mensagem para entrada manual
      setTranscript(prev => 
        prev.includes('🎤 Áudio gravado!') 
          ? 'Digite sua transcrição aqui ou use um navegador compatível com reconhecimento de voz automático.'
          : prev
      )
      
    } catch (error) {
      console.error('Error transcribing audio:', error)
      setError('Erro ao transcrever áudio. Digite manualmente.')
    }
  }, [audioBlob])

  return {
    isRecording,
    isListening,
    transcript,
    audioBlob,
    browserInfo,
    startRecording,
    stopRecording,
    resetTranscript,
    transcribeAudio,
    error,
  }
}
