import { create } from 'zustand'
import type { QueueItem } from '@/types'
import { mockQueueItems } from '@/mock/data'

interface QueueState {
  items: QueueItem[]
  currentNumber: number
  callNext: () => void
  resetQueue: () => void
}

export const useQueueStore = create<QueueState>((set, get) => ({
  items: mockQueueItems,
  currentNumber: 101,
  callNext: () => {
    const { items, currentNumber } = get()
    const waitingItems = items.filter((i) => i.status === 'waiting')
    if (waitingItems.length === 0) return
    const nextItem = waitingItems.sort((a, b) => a.priority - b.priority || a.queueNumber - b.queueNumber)[0]
    const updated = items.map((i) => {
      if (i.queueNumber === nextItem.queueNumber) return { ...i, status: 'called' as const, estimatedWait: 0 }
      if (i.status === 'called') return { ...i, status: 'consulting' as const }
      return i
    })
    set({ items: updated, currentNumber: nextItem.queueNumber })
  },
  resetQueue: () => set({ items: mockQueueItems, currentNumber: 101 }),
}))
