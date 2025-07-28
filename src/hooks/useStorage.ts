import { useState } from 'react'

interface Note {
  id: string
  date: Date
  content: string
  type: 'note'
}

interface Todo {
  id: string
  date: Date
  content: string
  completed: boolean
  type: 'todo'
}

export type Item = Note | Todo

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', [])

  const addNote = (content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
      type: 'note'
    }

    setNotes(prev => [newNote, ...prev])
    return newNote
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  const updateNote = (id: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, content, date: new Date() } : note
    ))
  }

  return {
    notes,
    addNote,
    deleteNote,
    updateNote
  }
}

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])

  const addTodo = (content: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
      completed: false,
      type: 'todo'
    }

    setTodos(prev => [newTodo, ...prev])
    return newTodo
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const updateTodo = (id: string, content: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, content, date: new Date() } : todo
    ))
  }

  return {
    todos,
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo
  }
}
