import { create } from 'zustand'
import type { DispensingTask, DispensingDrug } from '@/types'
import { mockDispensingTasks } from '@/mock/data'

interface PharmacyState {
  tasks: DispensingTask[]
  addDispensingTask: (task: Omit<DispensingTask, 'taskId' | 'progress' | 'robotArmStatus' | 'status' | 'createdAt'>) => string
  advanceTask: (taskId: string, action: 'start' | 'scan' | 'complete') => void
  verifyDrug: (taskId: string, drugId: string) => void
}

function buildTaskId() {
  const maxNum = Math.max(
    0,
    ...mockDispensingTasks.map((t) => parseInt(t.taskId.replace('DT', ''), 10) || 0)
  )
  return `DT${String(maxNum + 1).padStart(3, '0')}`
}

export const usePharmacyStore = create<PharmacyState>((set, get) => ({
  tasks: [...mockDispensingTasks],

  addDispensingTask: (partial) => {
    const taskId = buildTaskId()
    const newTask: DispensingTask = {
      ...partial,
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
}))
