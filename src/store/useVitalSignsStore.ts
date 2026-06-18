import { create } from 'zustand'
import type { VitalSigns, VitalAlert } from '@/types'
import { mockVitalSigns } from '@/mock/data'

interface VitalSignsState {
  patients: VitalSigns[]
  alerts: VitalAlert[]
  acknowledgeAlert: (alertId: string) => void
  refreshData: () => void
}

function simulateVitalUpdate(vs: VitalSigns): VitalSigns {
  const hr = Math.round(vs.heartRate + (Math.random() - 0.5) * 6)
  const sys = Math.round(vs.bloodPressureSys + (Math.random() - 0.5) * 8)
  const dia = Math.round(vs.bloodPressureDia + (Math.random() - 0.5) * 4)
  const o2 = Math.round((vs.oxygenLevel + (Math.random() - 0.5) * 2) * 10) / 10
  const temp = Math.round((vs.temperature + (Math.random() - 0.5) * 0.3) * 10) / 10
  const isAbnormal = hr > 120 || hr < 50 || sys > 140 || o2 < 93 || temp > 38
  const newAlerts: VitalAlert[] = []
  if (hr > 120) newAlerts.push({ id: `VA-${Date.now()}-hr`, type: 'heart_rate', level: 'critical', message: `心率骤升至${hr}次/分`, value: hr, threshold: 120, patientName: vs.patientName, bedNo: vs.bedNo, timestamp: new Date().toISOString(), acknowledged: false })
  if (sys > 140) newAlerts.push({ id: `VA-${Date.now()}-bp`, type: 'blood_pressure', level: 'warning', message: `血压偏高: ${sys}/${dia}mmHg`, value: sys, threshold: 140, patientName: vs.patientName, bedNo: vs.bedNo, timestamp: new Date().toISOString(), acknowledged: false })
  if (o2 < 93) newAlerts.push({ id: `VA-${Date.now()}-o2`, type: 'oxygen', level: 'warning', message: `血氧饱和度偏低: ${o2}%`, value: o2, threshold: 93, patientName: vs.patientName, bedNo: vs.bedNo, timestamp: new Date().toISOString(), acknowledged: false })
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return {
    ...vs,
    heartRate: hr,
    bloodPressureSys: sys,
    bloodPressureDia: dia,
    oxygenLevel: o2,
    temperature: temp,
    isAbnormal,
    alerts: [...vs.alerts, ...newAlerts],
    timestamp: new Date().toISOString(),
    heartRateHistory: [...vs.heartRateHistory.slice(-19), { time, value: hr }],
    bpHistory: [...vs.bpHistory.slice(-19), { time, sys, dia }],
    oxygenHistory: [...vs.oxygenHistory.slice(-19), { time, value: o2 }],
    tempHistory: [...vs.tempHistory.slice(-19), { time, value: temp }],
  }
}

export const useVitalSignsStore = create<VitalSignsState>((set, get) => ({
  patients: mockVitalSigns,
  alerts: mockVitalSigns.flatMap((v) => v.alerts),
  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
      patients: state.patients.map((p) => ({
        ...p,
        alerts: p.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
      })),
    }))
  },
  refreshData: () => {
    const updated = get().patients.map(simulateVitalUpdate)
    set({ patients: updated, alerts: updated.flatMap((v) => v.alerts) })
  },
}))
