import * as Dialog from '@radix-ui/react-dialog'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, Edit3, Trash2, Check, FileText } from 'lucide-react'
import { useState } from 'react'
import { Note } from '../hooks/useStorageV2'

interface NoteCardProps {
  note: Note
  onNoteDeleted: (id: string) => void
  onNoteEdited: (id: string, content: string) => void
}

export function NoteCard({ note, onNoteDeleted, onNoteEdited }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(note.content)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onNoteEdited(note.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(note.content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onNoteDeleted(note.id)
    setIsDialogOpen(false)
  }

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger className="rounded-md text-left flex flex-col bg-slate-800 p-5 gap-3 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 group">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">
            {formatDistanceToNow(note.date, {
              locale: ptBR,
              addSuffix: true,
            })}
          </span>
          <FileText className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
        </div>

        <p className="text-sm leading-6 text-slate-400 line-clamp-6">
          {note.content}
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>
          
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                {formatDistanceToNow(note.date, {
                  locale: ptBR,
                  addSuffix: true,
                })}
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
                title="Editar nota"
              >
                <Edit3 size={16} />
              </button>
            </div>

            {isEditing ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-slate-400 leading-6 resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-lime-400 text-lime-950 text-sm rounded hover:bg-lime-500 transition-colors flex items-center gap-1"
                  >
                    <Check size={14} />
                    Salvar
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-slate-600 text-slate-100 text-sm rounded hover:bg-slate-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-400 flex-1 overflow-y-auto">
                {note.content}
              </p>
            )}
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Deseja{' '}
              <span className="text-red-400 group-hover:underline">
                apagar essa nota
              </span>
              ?
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
