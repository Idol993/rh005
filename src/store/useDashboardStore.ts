import { create } from 'zustand'
import type { DashboardMetrics } from '@/types'
import { mockDashboardMetrics } from '@/mock/data'

interface DashboardState {
  metrics: DashboardMetrics
  selectedDepartment: string
  setDepartment: (dept: string) => void
  refreshMetrics: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: mockDashboardMetrics,
  selectedDepartment: '全部',
  setDepartment: (dept) => set({ selectedDepartment: dept }),
  refreshMetrics: () => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        outpatientCount: state.metrics.outpatientCount + Math.floor(Math.random() * 10 - 3),
        patientSatisfaction: Math.round((state.metrics.patientSatisfaction + (Math.random() - 0.5) * 0.4) * 10) / 10,
      },
    }))
  },
}))
