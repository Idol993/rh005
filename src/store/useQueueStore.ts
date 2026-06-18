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
  callNextForDoctor: (doctorName: string) => number | null
  adjustPriority: (queueNumber: number, delta: number) => void
  recalculateWaitTimes: () => void
  getLatestRegistrationForPatient: (patientId: string) => QueueItem | null
  getCurrentForDoctor: (doctorName: string) => QueueItem | null
  getDoctorQueue: (doctorName: string) => QueueItem[]
  getDoctors: () => { doctorName: string; department: string; waitingCount: number; currentNumber: number | null }[]
}

export const useQueueStore = create<QueueState>((set, get) => ({
  items: [...mockQueueItems],
  currentNumber: 101,
  registrations: [],

  addRegistration: ({ patientId, patientName, department, doctorName, estimatedWait }) => {
    const { items } = get()
    const existingNumbers = [...mockQueueItems, ...items].map((i) => i.queueNumber)
    const newNumber = Math.max(0, ...existingNumbers) + 1
    const doctorWaiting = items.filter((i) => i.status === 'waiting' && i.doctorName === doctorName)
    const priority = doctorWaiting.length + 1
    const newItem: QueueItem = {
      queueNumber: newNumber,
      patientName,
      department,
      doctorName,
      status: 'waiting',
      estimatedWait: estimatedWait,
      priority,
      patientId,
    }
    set((state) => ({
      items: [...state.items, newItem],
      registrations: [
        ...state.registrations,
        { queueNumber: newNumber, patientId, patientName, department, doctorName, estimatedWait, createdAt: new Date().toISOString() },
      ],
    }))
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

  callNextForDoctor: (doctorName) => {
    const { items } = get()
    const doctorWaiting = items
      .filter((i) => i.status === 'waiting' && i.doctorName === doctorName)
      .sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)
    if (doctorWaiting.length === 0) return null
    const nextItem = doctorWaiting[0]

    const updated = items.map((i) => {
      if (i.queueNumber === nextItem.queueNumber) return { ...i, status: 'called' as const, estimatedWait: 0 }
      if (i.doctorName === doctorName && i.status === 'called') return { ...i, status: 'consulting' as const }
      if (i.doctorName === doctorName && i.status === 'consulting') return { ...i, status: 'done' as const }
      return i
    })
    set({ items: updated, currentNumber: nextItem.queueNumber })
    get().recalculateWaitTimes()
    return nextItem.queueNumber
  },

  adjustPriority: (queueNumber: number, delta: number) => {
    const { items } = get()
    const target = items.find((i) => i.queueNumber === queueNumber && i.status === 'waiting')
    if (!target) return
    const doctorWaiting = items
      .filter((i) => i.status === 'waiting' && i.doctorName === target.doctorName)
      .sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)
    const currentIdx = doctorWaiting.findIndex((i) => i.queueNumber === queueNumber)
    const newIdx = Math.max(0, Math.min(doctorWaiting.length - 1, currentIdx + delta))
    if (currentIdx === newIdx) return
    const [moved] = doctorWaiting.splice(currentIdx, 1)
    doctorWaiting.splice(newIdx, 0, moved)
    const priorityMap = new Map(doctorWaiting.map((it, idx) => [it.queueNumber, idx + 1]))
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
      const doctorGroups = new Map<string, QueueItem[]>()
      state.items.forEach((i) => {
        if (i.status !== 'waiting') return
        const arr = doctorGroups.get(i.doctorName) || []
        arr.push(i)
        doctorGroups.set(i.doctorName, arr)
      })

      const waitMap = new Map<number, number>()
      doctorGroups.forEach((doctorItems) => {
        const sorted = [...doctorItems].sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)
        sorted.forEach((it, idx) => {
          waitMap.set(it.queueNumber, (idx + 1) * perPatientWait)
        })
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

  getLatestRegistrationForPatient: (patientId) => {
    const { items, registrations } = get()
    const myRegs = registrations.filter((r) => r.patientId === patientId)
    if (myRegs.length > 0) {
      const latest = myRegs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
      const found = items.find((i) => i.queueNumber === latest.queueNumber)
      if (found) return found
    }
    const fallback = items.filter((i) => i.patientId === patientId)
    if (fallback.length === 0) return null
    return fallback.sort((a, b) => b.queueNumber - a.queueNumber)[0]
  },

  getCurrentForDoctor: (doctorName) => {
    const { items } = get()
    const called = items.find((i) => i.doctorName === doctorName && i.status === 'called')
    if (called) return called
    const consulting = items.find((i) => i.doctorName === doctorName && i.status === 'consulting')
    if (consulting) return consulting
    return null
  },

  getDoctorQueue: (doctorName) => {
    const { items } = get()
    return items
      .filter((i) => i.doctorName === doctorName)
      .sort((a, b) => {
        const order = { called: 0, consulting: 1, waiting: 2, done: 3 }
        if (a.status !== b.status) return order[a.status] - order[b.status]
        if (a.status === 'waiting') return a.priority - b.priority
        return b.queueNumber - a.queueNumber
      })
  },

  getDoctors: () => {
    const { items } = get()
    const doctorMap = new Map<string, { doctorName: string; department: string; waitingCount: number; currentNumber: number | null }>()
    items.forEach((i) => {
      if (!doctorMap.has(i.doctorName)) {
        doctorMap.set(i.doctorName, {
          doctorName: i.doctorName,
          department: i.department,
          waitingCount: 0,
          currentNumber: null,
        })
      }
      const info = doctorMap.get(i.doctorName)!
      if (i.status === 'waiting') info.waitingCount++
      if (i.status === 'called') info.currentNumber = i.queueNumber
    })
    return Array.from(doctorMap.values())
  },
}))
