import { ChangeEvent, useState, useMemo } from 'react'
import { Search, Filter, FileText, CheckSquare, RotateCcw } from 'lucide-react'
import { NewNoteCard } from './components/new-note-card'
import { NewTodoCard } from './components/new-todo-card'
import { NoteCard } from './components/note-card'
import { TodoCard } from './components/todo-card'
import { useStorage } from './hooks/useStorageV2'
import { toast } from 'sonner'

type FilterType = 'all' | 'notes' | 'todos' | 'completed' | 'pending'

export function App() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  
  const {
    items,
    notes,
    todos,
    addNote,
    addTodo,
    deleteItem,
    toggleTodo,
    editItem,
  } = useStorage()

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value)
  }

  function handleNoteCreated(content: string) {
    addNote(content)
  }

  function handleTodoCreated(content: string) {
    addTodo(content)
  }

  function handleItemDeleted(id: string) {
    deleteItem(id)
    toast.success('Item deletado com sucesso!')
  }

  function handleTodoToggled(id: string) {
    toggleTodo(id)
  }

  function handleItemEdited(id: string, content: string) {
    editItem(id, content)
    toast.success('Item editado com sucesso!')
  }

  // Filtrar e buscar itens
  const filteredItems = useMemo(() => {
    let itemsToFilter = items
    
    // Aplicar filtro por tipo
    switch (filter) {
      case 'notes':
        itemsToFilter = notes
        break
      case 'todos':
        itemsToFilter = todos
        break
      case 'completed':
        itemsToFilter = todos.filter((todo) => todo.completed)
        break
      case 'pending':
        itemsToFilter = todos.filter((todo) => !todo.completed)
        break
      default:
        itemsToFilter = items
    }

    // Aplicar busca
    if (search.trim()) {
      return itemsToFilter.filter((item) =>
        item.content.toLowerCase().includes(search.toLowerCase()),
      )
    }
    
    return itemsToFilter
  }, [items, notes, todos, search, filter])

  const stats = {
    totalNotes: notes.length,
    totalTodos: todos.length,
    completedTodos: todos.filter((todo) => todo.completed).length,
    pendingTodos: todos.filter((todo) => !todo.completed).length,
  }

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <h1 className="text-4xl font-bold text-slate-100 tracking-tight">
        expert-notes <span className="text-lime-400">v2</span>
      </h1>

      {/* Search and Stats */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            className="w-full bg-slate-800/50 text-xl font-semibold tracking-tight outline-none placeholder:text-slate-500 pl-11 pr-4 py-3 rounded-lg border border-slate-700 focus:border-lime-400 transition-colors"
            type="text"
            placeholder="Busque em suas notas e tarefas..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-400">Notas</span>
            </div>
            <p className="text-2xl font-bold text-slate-200">
              {stats.totalNotes}
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-400">Tarefas</span>
            </div>
            <p className="text-2xl font-bold text-slate-200">
              {stats.totalTodos}
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-lime-400" />
              <span className="text-sm text-slate-400">Concluídas</span>
            </div>
            <p className="text-2xl font-bold text-slate-200">
              {stats.completedTodos}
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-400">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-slate-200">
              {stats.pendingTodos}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {[
          { key: 'all', label: 'Todos', count: items.length },
          { key: 'notes', label: 'Notas', count: stats.totalNotes },
          { key: 'todos', label: 'Tarefas', count: stats.totalTodos },
          { key: 'pending', label: 'Pendentes', count: stats.pendingTodos },
          {
            key: 'completed',
            label: 'Concluídas',
            count: stats.completedTodos,
          },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as FilterType)}
            className={`px-3 py-1 text-sm rounded-full transition-colors flex-shrink-0 ${
              filter === key
                ? 'bg-lime-400 text-lime-950 font-medium'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="h-px bg-slate-700" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] gap-6">
        {/* Sempre mostrar os cards de criação quando não há filtro específico */}
        {(filter === 'all' || filter === 'notes') && (
          <NewNoteCard onNoteCreated={handleNoteCreated} />
        )}
        {(filter === 'all' || filter === 'todos' || filter === 'pending') && (
          <NewTodoCard onTodoCreated={handleTodoCreated} />
        )}
        
        {/* Renderizar itens filtrados */}
        {filteredItems.map((item) => {
          if (item.type === 'note') {
            return (
              <NoteCard
                key={item.id}
                note={item}
                onNoteDeleted={handleItemDeleted}
                onNoteEdited={handleItemEdited}
              />
            )
          } else {
            return (
              <TodoCard
                key={item.id}
                todo={item}
                onDelete={handleItemDeleted}
                onToggle={handleTodoToggled}
                onEdit={handleItemEdited}
              />
            )
          }
        })}
      </div>

      {/* Empty state */}
      {filteredItems.length === 0 && search.trim() && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-slate-500">
            Tente buscar por outros termos ou crie uma nova nota/tarefa.
          </p>
        </div>
      )}
    </div>
  )
}
