import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, CheckCircle, Edit3, Trash2, Circle } from 'lucide-react'
import { useState } from 'react'
import { Todo } from '../hooks/useStorageV2'

interface TodoCardProps {
  todo: Todo
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onEdit: (id: string, content: string) => void
}

export function TodoCard({ todo, onDelete, onToggle, onEdit }: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(todo.content)

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(todo.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditContent(todo.content)
    setIsEditing(false)
  }

  return (
    <div className="rounded-md bg-slate-800 p-5 space-y-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-within:ring-2 focus-within:ring-lime-400 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">
          {formatDistanceToNow(todo.date, { locale: ptBR, addSuffix: true })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-slate-400 hover:text-slate-100 transition-colors"
            title="Editar todo"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Deletar todo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            className="w-full resize-none bg-transparent outline-none text-sm text-slate-400 leading-6"
            rows={3}
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
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(todo.id)}
            className={`mt-1 transition-colors ${
              todo.completed
                ? 'text-lime-400 hover:text-lime-300'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            title={
              todo.completed
                ? 'Marcar como não concluído'
                : 'Marcar como concluído'
            }
          >
            {todo.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
          <p
            className={`text-sm leading-6 transition-all ${
              todo.completed ? 'text-slate-500 line-through' : 'text-slate-400'
            }`}
          >
            {todo.content}
          </p>
        </div>
      )}
    </div>
  )
}
