import { useState, useEffect } from 'react'

export interface Note {
  id: string
  date: Date
  content: string
  type: 'note'
}

export interface Todo {
  id: string
  date: Date
  content: string
  completed: boolean
  type: 'todo'
}

export type Item = Note | Todo

interface UseStorageReturn {
  items: Item[]
  notes: Note[]
  todos: Todo[]
  addNote: (content: string) => void
  addTodo: (content: string) => void
  deleteItem: (id: string) => void
  toggleTodo: (id: string) => void
  editItem: (id: string, content: string) => void
  searchItems: (query: string) => Item[]
}

const STORAGE_KEY = 'expert-notes-v2'

export function useStorage(): UseStorageReturn {
  const [items, setItems] = useState<Item[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Array<
        | (Omit<Note, 'date'> & { date: string })
        | (Omit<Todo, 'date'> & { date: string })
      >
      return parsed.map((item) => ({
        ...item,
        date: new Date(item.date),
      })) as Item[]
    }
    return []
  })

  useEffect(() => {
    const itemsToStore = items.map((item) => ({
      ...item,
      date: item.date.toISOString(),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsToStore))
  }, [items])

  const notes = items.filter((item): item is Note => item.type === 'note')
  const todos = items.filter((item): item is Todo => item.type === 'todo')

  const addNote = (content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
      type: 'note',
    }
    setItems((prev) => [newNote, ...prev])
  }

  const addTodo = (content: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
      completed: false,
      type: 'todo',
    }
    setItems((prev) => [newTodo, ...prev])
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleTodo = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.type === 'todo'
          ? { ...item, completed: !item.completed }
          : item,
      ),
    )
  }

  const editItem = (id: string, content: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, content } : item)),
    )
  }

  const searchItems = (query: string): Item[] => {
    if (!query.trim()) return items
    
    const lowercaseQuery = query.toLowerCase()
    return items.filter((item) =>
      item.content.toLowerCase().includes(lowercaseQuery),
    )
  }

  return {
    items,
    notes,
    todos,
    addNote,
    addTodo,
    deleteItem,
    toggleTodo,
    editItem,
    searchItems,
  }
}
