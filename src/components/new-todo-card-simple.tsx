import { useState } from "react";
import {
  CheckSquare,
  Mic,
  MicOff,
  AlertCircle,
  Keyboard,
  Volume2,
} from "lucide-react";
import { useAudioRecording } from "../hooks/useAudioRecording";

interface NewTodoCardProps {
  onTodoCreated: (content: string) => void;
}

export function NewTodoCard({ onTodoCreated }: NewTodoCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [manualInput, setManualInput] = useState("");

  const {
    isRecording,
    transcript,
    isSupported,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
  } = useAudioRecording();

  // Detectar navegadores incompatíveis que NÃO devem ter gravação de áudio
  const isOperaBased = /Opera|OPR/.test(navigator.userUser);
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isIncompatible = isOperaBased || isSafari;

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setManualInput(event.target.value);
    if (event.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveTodo() {
    const content = (transcript || manualInput).trim();
    if (content === "") {
      return;
    }

    onTodoCreated(content);
    resetTranscript();
    setManualInput("");
    setShouldShowOnboarding(true);
  }

  function handleStartRecording() {
    startRecording();
    setShouldShowOnboarding(false);
  }

  const currentContent = transcript || manualInput;
  const browserName = isOperaBased
    ? "Opera GX"
    : isSafari
      ? "Safari"
      : "seu navegador";

  return (
    <div className="rounded-md bg-slate-700 p-5 flex flex-col text-center gap-y-3 hover:ring-2 hover:ring-slate-600 focus-within:ring-2 focus-within:ring-lime-400 transition-all">
      <CheckSquare className="w-6 h-6 text-lime-400 mx-auto" />

      {shouldShowOnboarding ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">
            Adicionar nova tarefa
          </h3>

          {/* Diferentes instruções baseadas na compatibilidade */}
          {isIncompatible ? (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                Digite sua tarefa no campo de texto abaixo.
              </p>
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
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                Grave uma tarefa em áudio que será convertida para texto
                automaticamente.
              </p>
              {isSupported && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <Volume2 className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-green-200">
                    ✅ Gravação de voz com transcrição automática disponível
                  </p>
                </div>
              )}
              {!isSupported && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-red-200">
                    Gravação de voz não suportada neste navegador
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleStartEditor}
            className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 font-medium hover:bg-lime-500 transition-colors rounded-md"
          >
            {isIncompatible ? "Digitar tarefa" : "Criar nova tarefa"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {isRecording ? "Gravando tarefa..." : "Nova tarefa"}
            </span>

            {/* Só mostrar botão de microfone se o navegador realmente suportar transcrição */}
            {isSupported && !isIncompatible && (
              <button
                type="button"
                onClick={isRecording ? stopRecording : handleStartRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                }`}
                title={
                  isRecording
                    ? "Parar gravação"
                    : "Iniciar gravação com transcrição automática"
                }
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-200">{error}</p>
            </div>
          )}

          <textarea
            value={currentContent}
            onChange={handleContentChanged}
            placeholder={
              isRecording
                ? "Fale sua tarefa..."
                : isIncompatible
                  ? "Digite sua tarefa aqui..."
                  : "Digite sua tarefa ou clique no microfone para gravar"
            }
            className="w-full resize-none bg-transparent outline-none text-sm text-slate-400 leading-6"
            autoFocus
            rows={4}
            readOnly={isRecording}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveTodo}
              disabled={currentContent.trim() === ""}
              className="flex-1 bg-lime-400 py-3 text-center text-sm text-lime-950 font-medium hover:bg-lime-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors rounded-md"
            >
              Salvar tarefa
            </button>

            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="px-4 py-3 bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors rounded-md"
              >
                Parar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
