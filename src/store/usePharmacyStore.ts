import { create } from 'zustand'
import type { DispensingTask, DispensingDrug } from '@/types'
import { mockDispensingTasks } from '@/mock/data'

function randomUsage(drugName: string): string {
  const patterns = [
    '每日1次，每次1片，饭后服用',
    '每日2次，每次1片，早晚服用',
    '每日3次，每次1片，饭后服用',
    '每晚1次，每次1片，睡前服用',
    '每日1次，每次1片，晨起空腹服用',
  ]
  const idx = (drugName.length + drugName.charCodeAt(0)) % patterns.length
  return patterns[idx]
}

interface PharmacyState {
  tasks: DispensingTask[]
  addDispensingTask: (task: Omit<DispensingTask, 'taskId' | 'progress' | 'robotArmStatus' | 'status' | 'createdAt'>) => string
  advanceTask: (taskId: string, action: 'start' | 'scan' | 'complete') => void
  verifyDrug: (taskId: string, drugId: string) => void
  markAsPicked: (taskId: string) => void
  getNextTaskId: () => string
}

export const usePharmacyStore = create<PharmacyState>((set, get) => ({
  tasks: [...mockDispensingTasks],

  getNextTaskId: () => {
    const { tasks } = get()
    const allIds = [...mockDispensingTasks, ...tasks].map((t) =>
      parseInt(t.taskId.replace('DT', ''), 10) || 0
    )
    const maxNum = Math.max(0, ...allIds)
    return `DT${String(maxNum + 1).padStart(3, '0')}`
  },

  addDispensingTask: (partial) => {
    const taskId = get().getNextTaskId()
    const drugsWithUsage: DispensingDrug[] = partial.drugs.map((d) => ({
      ...d,
      usage: randomUsage(d.drugName),
    }))
    const newTask: DispensingTask = {
      ...partial,
      drugs: drugsWithUsage,
      taskId,
      status: 'pending',
      robotArmStatus: 'idle',
      progress: 0,
      createdAt: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    }
    set((s) => ({ tasks: [...s.tasks, newTask] }))
    return taskId
  },

  advanceTask: (taskId, action) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.taskId !== taskId) return t
        switch (action) {
          case 'start':
            return { ...t, status: 'dispensing', robotArmStatus: 'grabbing', progress: 30 }
          case 'scan':
            return {
              ...t,
              status: 'scanning',
              robotArmStatus: 'placing',
              progress: 75,
            }
          case 'complete':
            return {
              ...t,
              status: 'completed',
              robotArmStatus: 'idle',
              progress: 100,
              pickupWindow: `${1 + (parseInt(t.taskId.replace('DT', '')) % 5)}号窗口`,
              drugs: t.drugs.map((d: DispensingDrug) => ({ ...d, scanStatus: 'verified' as const })),
            }
        }
      }),
    }))
  },

  verifyDrug: (taskId, drugId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.taskId !== taskId) return t
        return {
          ...t,
          drugs: t.drugs.map((d: DispensingDrug) =>
            d.drugId === drugId ? { ...d, scanStatus: 'verified' as const } : d
          ),
        }
      }),
    }))
  },

  markAsPicked: (taskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.taskId === taskId ? { ...t, status: 'picked' as const } : t)),
    }))
  },
}))
