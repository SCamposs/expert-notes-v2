// Demonstração da implementação de compatibilidade com Opera GX

/**
 * 🎮 OPERA GX COMPATIBILITY GUIDE
 * 
 * Este arquivo demonstra como implementamos compatibilidade específica
 * para Opera GX, superando limitações da SpeechRecognition API.
 */

// 1. DETECÇÃO DE NAVEGADOR
function detectOperaGX() {
  const userAgent = navigator.userAgent
  return {
    isOpera: /Opera|OPR/.test(userAgent),
    isOperaGX: /Opera GX/.test(userAgent) || /OPR/.test(userAgent),
    browserName: /Opera GX/.test(userAgent) ? 'Opera GX' : 
                 /Opera|OPR/.test(userAgent) ? 'Opera' : 'Unknown'
  }
}

// 2. CONFIGURAÇÃO DE ÁUDIO OTIMIZADA PARA OPERA GX
function getOptimizedAudioConstraints(browserInfo) {
  if (browserInfo.isOperaGX || browserInfo.isOpera) {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 16000, // Taxa reduzida para melhor performance no Opera
      channelCount: 1,    // Mono para melhor compatibilidade
    }
  }
  
  // Configuração padrão para outros navegadores
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100,
    channelCount: 1,
  }
}

// 3. SELEÇÃO DE CODEC POR NAVEGADOR
function selectBestAudioCodec(browserInfo) {
  if (browserInfo.isOperaGX || browserInfo.isOpera) {
    // Opera funciona melhor com WebM + Opus
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      return 'audio/webm;codecs=opus'
    }
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm'
    }
  }
  
  // Fallback padrão
  return 'audio/webm'
}

// 4. ESTRATÉGIA DE FALLBACK PARA TRANSCRIÇÃO
function handleTranscriptionFallback(browserInfo, audioBlob) {
  if (browserInfo.isOperaGX || browserInfo.isOpera) {
    // Para Opera GX: Não tenta transcrição automática
    return {
      success: false,
      message: `Digite sua transcrição manualmente. O ${browserInfo.browserName} não suporta transcrição automática.`,
      requiresManualInput: true
    }
  }
  
  // Para outros navegadores: Tenta SpeechRecognition
  return {
    success: true,
    message: 'Transcrição automática disponível',
    requiresManualInput: false
  }
}

// 5. INTERFACE ADAPTATIVA PARA OPERA GX
function getOperaGXSpecificUI(browserInfo) {
  return {
    showCompatibilityWarning: browserInfo.isOperaGX,
    microphoneButtonTitle: browserInfo.isOperaGX 
      ? `Gravar áudio (sem transcrição automática no ${browserInfo.browserName})`
      : 'Iniciar gravação com transcrição automática',
    placeholderText: browserInfo.isOperaGX
      ? 'Gravando áudio... Digite aqui após parar a gravação'
      : 'Fale sua nota...',
    helpText: browserInfo.isOperaGX 
      ? 'Para transcrição automática, use Chrome ou Edge'
      : 'Transcrição automática disponível'
  }
}

// 6. EXEMPLO DE USO COMPLETO
async function createAdvancedAudioRecorder() {
  // Detectar navegador
  const browserInfo = detectOperaGX()
  
  // Configurar constraints de áudio
  const audioConstraints = getOptimizedAudioConstraints(browserInfo)
  
  // Obter stream de áudio
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: audioConstraints
  })
  
  // Configurar MediaRecorder com codec otimizado
  const mimeType = selectBestAudioCodec(browserInfo)
  const mediaRecorder = new MediaRecorder(stream, { mimeType })
  
  // Configurar interface baseada no navegador
  const uiConfig = getOperaGXSpecificUI(browserInfo)
  
  return {
    mediaRecorder,
    browserInfo,
    uiConfig,
    stream
  }
}

// 7. TESTES DE COMPATIBILIDADE
function runCompatibilityTests() {
  const results = {
    browserDetection: detectOperaGX(),
    mediaRecorderSupport: 'MediaRecorder' in window,
    speechRecognitionSupport: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    webAudioSupport: 'AudioContext' in window || 'webkitAudioContext' in window,
    getUserMediaSupport: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
  }
  
  console.table(results)
  return results
}

// 8. RELATÓRIO DE FUNCIONALIDADES POR NAVEGADOR
const BROWSER_FEATURE_MATRIX = {
  'Opera GX': {
    audioRecording: '✅ Full Support',
    speechRecognition: '❌ Not Available',
    manualInput: '✅ Full Support',
    audioPlayback: '✅ Full Support',
    fileDownload: '✅ Full Support',
    recommendation: 'Use manual input after recording'
  },
  'Chrome': {
    audioRecording: '✅ Full Support',
    speechRecognition: '✅ Full Support',
    manualInput: '✅ Full Support',
    audioPlayback: '✅ Full Support',
    fileDownload: '✅ Full Support',
    recommendation: 'Complete experience available'
  },
  'Edge': {
    audioRecording: '✅ Full Support',
    speechRecognition: '✅ Full Support',
    manualInput: '✅ Full Support',
    audioPlayback: '✅ Full Support',
    fileDownload: '✅ Full Support',
    recommendation: 'Complete experience available'
  },
  'Safari': {
    audioRecording: '⚠️ Limited',
    speechRecognition: '❌ Not Available',
    manualInput: '✅ Full Support',
    audioPlayback: '✅ Full Support',
    fileDownload: '✅ Full Support',
    recommendation: 'Use manual input after recording'
  }
}

// 9. EXPORT PARA USO NO PROJETO
export {
  detectOperaGX,
  getOptimizedAudioConstraints,
  selectBestAudioCodec,
  handleTranscriptionFallback,
  getOperaGXSpecificUI,
  createAdvancedAudioRecorder,
  runCompatibilityTests,
  BROWSER_FEATURE_MATRIX
}
