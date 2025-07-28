import * as Dialog from '@radix-ui/react-dialog'
import {
  X,
  FileText,
  Mic,
  MicOff,
  AlertCircle,
  Keyboard,
  Volume2,
} from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useAudioRecording } from '../hooks/useAudioRecording'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  } = useAudioRecording()

  // Detectar navegadores incompatíveis que NÃO devem ter gravação de áudio
  const isOperaBased = /Opera|OPR/.test(navigator.userAgent)
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  const isIncompatible = isOperaBased || isSafari

  // Usa o transcript quando está gravando, senão usa o content manual
  const currentContent = isRecording || transcript ? transcript : content
  const browserName = isOperaBased
    ? 'Opera GX'
    : isSafari
      ? 'Safari'
      : 'seu navegador'

  function handleStartEditor() {
    setShouldShowOnboarding(false)
  }

  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if (event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    const finalContent = currentContent.trim()
    if (finalContent === '') {
      return
    }

    onNoteCreated(finalContent)

    // Reset everything
    setContent('')
    resetTranscript()
    setShouldShowOnboarding(true)
    setIsDialogOpen(false)

    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording() {
    // Se o navegador é incompatível, não deveria chegar aqui, mas por segurança...
    if (isIncompatible) {
      toast.error(
        `Gravação de voz não disponível no ${browserName}. Use digitação manual.`,
      )
      setShouldShowOnboarding(false)
      return
    }

    setShouldShowOnboarding(false)
    startRecording()
  }

  function handleStopRecording() {
    stopRecording()
  }

  function handleDialogClose() {
    setIsDialogOpen(false)
    setContent('')
    resetTranscript()
    setShouldShowOnboarding(true)
    if (isRecording) {
      stopRecording()
    }
  }
  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger className="flex flex-col rounded-md bg-slate-700 text-left outline-none p-5 gap-3 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <FileText className="w-6 h-6 text-lime-400" />
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          {isIncompatible
            ? `Digite uma nota no editor de texto (${browserName})`
            : 'Grave uma nota em áudio que será convertida para texto automaticamente'}
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close
            className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100"
            onClick={handleDialogClose}
          >
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col" onSubmit={handleSaveNote}>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">
                  Adicionar nota
                </span>
                
                {/* Só mostrar botão de microfone se o navegador realmente suportar transcrição */}
                {isSupported && !isIncompatible && (
                  <button
                    type="button"
                    onClick={
                      isRecording ? handleStopRecording : handleStartRecording
                    }
                    className={`p-2 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                    title={
                      isRecording
                        ? 'Parar gravação'
                        : 'Iniciar gravação com transcrição automática'
                    }
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
              </div>

              {/* Mensagens informativas baseadas na compatibilidade */}
              {isIncompatible && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <Keyboard className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs text-blue-200 font-medium">
                      Modo Digitação - {browserName}
                    </p>
                    <p className="text-xs text-blue-300/80">
                      Gravação de voz não disponível neste navegador
                    </p>
                  </div>
                </div>
              )}

              {!isIncompatible && isSupported && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <Volume2 className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-green-200">
                    ✅ Gravação de voz com transcrição automática disponível
                  </p>
                </div>
              )}

              {!isSupported && !isIncompatible && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-red-200">
                    Gravação de voz não suportada neste navegador
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-red-200">{error}</p>
                </div>
              )}

              {shouldShowOnboarding ? (
                isIncompatible ? (
                  <p className="text-sm leading-6 text-slate-400">
                    <button
                      type="button"
                      onClick={handleStartEditor}
                      className="font-medium text-lime-400 hover:underline"
                    >
                      Clique aqui para digitar sua nota
                    </button>
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece{' '}
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="font-medium text-lime-400 hover:underline"
                      disabled={!isSupported}
                    >
                      gravando uma nota
                    </button>{' '}
                    em áudio ou se preferir{' '}
                    <button
                      type="button"
                      onClick={handleStartEditor}
                      className="font-medium text-lime-400 hover:underline"
                    >
                      utilize apenas texto
                    </button>
                  </p>
                )
              ) : (
                <textarea
                  autoFocus
                  onChange={handleContentChanged}
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  value={currentContent}
                  placeholder={
                    isRecording
                      ? 'Fale sua nota...'
                      : isIncompatible
                        ? 'Digite sua nota aqui...'
                        : 'Digite sua nota ou clique no microfone para gravar'
                  }
                  readOnly={isRecording}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100 transition-all"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                Gravando (clique p/ interromper)
              </button>
            ) : (
              <button
                type="submit"
                disabled={currentContent.trim() === ''}
                className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
