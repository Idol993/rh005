import { create } from 'zustand'
import type { QueueItem } from '@/types'
import { mockQueueItems } from '@/mock/data'

interface QueueState {
  items: QueueItem[]
  currentNumber: number
  registrations: {
    queueNumber: number
    patientId: string
    patientName: string
    department: string
    doctorName: string
    estimatedWait: number
    createdAt: string
  }[]
  addRegistration: (params: {
    patientId: string
    patientName: string
    department: string
    doctorName: string
    estimatedWait: number
  }) => number
  callNext: () => void
  adjustPriority: (queueNumber: number, delta: number) => void
  recalculateWaitTimes: () => void
}

export const useQueueStore = create<QueueState>((set, get) => ({
  items: [...mockQueueItems],
  currentNumber: 101,
  registrations: [],

  addRegistration: ({ patientId, patientName, department, doctorName, estimatedWait }) => {
    const { items } = get()
    const newNumber = Math.max(...items.map((i) => i.queueNumber), ...mockQueueItems.map((i) => i.queueNumber)) + 1
    const waitingItems = items.filter((i) => i.status === 'waiting')
    const priority = waitingItems.length + 1
    const waitTime = waitingItems.reduce((sum) => sum + 15, 0) + estimatedWait
    const newItem: QueueItem = {
      queueNumber: newNumber,
      patientName,
      department,
      doctorName,
      status: 'waiting',
      estimatedWait: waitTime,
      priority,
      patientId,
    }
    set((state) => ({
      items: [...state.items, newItem],
      registrations: [
        ...state.registrations,
        { queueNumber: newNumber, patientId, patientName, department, doctorName, estimatedWait: waitTime, createdAt: new Date().toISOString() },
      ],
    }))
    get().recalculateWaitTimes()
    return newNumber
  },

  callNext: () => {
    const { items } = get()
    const waitingItems = items
      .filter((i) => i.status === 'waiting')
      .sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)
    if (waitingItems.length === 0) return
    const nextItem = waitingItems[0]
    const updated = items.map((i) => {
      if (i.queueNumber === nextItem.queueNumber) return { ...i, status: 'called' as const, estimatedWait: 0 }
      if (i.status === 'called') return { ...i, status: 'consulting' as const }
      if (i.status === 'consulting') return { ...i, status: 'done' as const }
      return i
    })
    set({ items: updated, currentNumber: nextItem.queueNumber })
    get().recalculateWaitTimes()
  },

  adjustPriority: (queueNumber: number, delta: number) => {
    const { items } = get()
    const target = items.find((i) => i.queueNumber === queueNumber && i.status === 'waiting')
    if (!target) return
    const waitingSorted = items
      .filter((i) => i.status === 'waiting')
      .sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)
    const currentIdx = waitingSorted.findIndex((i) => i.queueNumber === queueNumber)
    const newIdx = Math.max(0, Math.min(waitingSorted.length - 1, currentIdx - delta))
    if (currentIdx === newIdx) return
    const [moved] = waitingSorted.splice(currentIdx, 1)
    waitingSorted.splice(newIdx, 0, moved)
    const priorityMap = new Map(waitingSorted.map((it, idx) => [it.queueNumber, idx + 1]))
    const updated = items.map((i) => {
      const newPrio = priorityMap.get(i.queueNumber)
      if (newPrio !== undefined) return { ...i, priority: newPrio }
      return i
    })
    set({ items: updated })
    get().recalculateWaitTimes()
  },

  recalculateWaitTimes: () => {
    set((state) => {
      const perPatientWait = 15
      const waitingSorted = state.items
        .filter((i) => i.status === 'waiting')
        .sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)
      const waitMap = new Map<number, number>()
      waitingSorted.forEach((it, idx) => {
        waitMap.set(it.queueNumber, (idx + 1) * perPatientWait)
      })
      return {
        items: state.items.map((i) => {
          const wait = waitMap.get(i.queueNumber)
          if (wait !== undefined && i.status === 'waiting') return { ...i, estimatedWait: wait }
          return i
        }),
      }
    })
  },
}))
