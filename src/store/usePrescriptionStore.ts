import { create } from 'zustand'
import type { PrescriptionItem, ConflictAlert, Prescription } from '@/types'
import { mockDrugs, mockConflictAlerts } from '@/mock/data'

interface PrescriptionState {
  currentPrescription: Prescription | null
  draftItems: PrescriptionItem[]
  conflicts: ConflictAlert[]
  showConflictModal: boolean
  addDrug: (drug: PrescriptionItem) => void
  removeDrug: (drugId: string) => void
  reviewPrescription: () => void
  dismissConflict: () => void
  forceSubmit: () => void
  reset: () => void
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  currentPrescription: null,
  draftItems: [],
  conflicts: [],
  showConflictModal: false,
  addDrug: (drug) => {
    set((state) => ({ draftItems: [...state.draftItems, drug] }))
  },
  removeDrug: (drugId) => {
    set((state) => ({ draftItems: state.draftItems.filter((d) => d.drugId !== drugId) }))
  },
  reviewPrescription: () => {
    const { draftItems } = get()
    const foundConflicts: ConflictAlert[] = []
    draftItems.forEach((item) => {
      const drugInfo = mockDrugs.find((d) => d.id === item.drugId)
      if (!drugInfo) return
      draftItems.forEach((other) => {
        if (other.drugId === item.drugId) return
        if (drugInfo.interactions.includes(other.drugId)) {
          const existing = foundConflicts.find(
            (c) => c.type === 'drug_interaction' && c.relatedDrugs.includes(item.drugName) && c.relatedDrugs.includes(other.drugName)
          )
          if (!existing) {
            foundConflicts.push({
              id: `C-${Date.now()}-${Math.random()}`,
              type: 'drug_interaction',
              severity: 'critical',
              message: `${item.drugName}与${other.drugName}存在药物相互作用`,
              relatedDrugs: [item.drugName, other.drugName],
              suggestion: `建议调整用药方案，咨询临床药师`,
            })
          }
        }
      })
    })
    if (mockConflictAlerts.some((c) => c.type === 'allergy' && draftItems.some((d) => c.relatedDrugs.includes(d.drugName)))) {
      foundConflicts.push(mockConflictAlerts[1])
    }
    if (foundConflicts.length > 0) {
      set({ conflicts: foundConflicts, showConflictModal: true })
    } else {
      const prescription: Prescription = {
        id: `PX-${Date.now()}`,
        patientId: 'P001',
        patientName: '张三',
        doctorId: 'M001',
        doctorName: '王医生',
        items: draftItems,
        conflicts: [],
        status: 'approved',
        createdAt: new Date().toISOString(),
      }
      set({ currentPrescription: prescription, draftItems: [], conflicts: [], showConflictModal: false })
    }
  },
  dismissConflict: () => {
    set({ conflicts: [], showConflictModal: false })
  },
  forceSubmit: () => {
    const { draftItems } = get()
    const prescription: Prescription = {
      id: `PX-${Date.now()}`,
      patientId: 'P001',
      patientName: '张三',
      doctorId: 'M001',
      doctorName: '王医生',
      items: draftItems,
      conflicts: get().conflicts,
      status: 'approved',
      createdAt: new Date().toISOString(),
    }
    set({ currentPrescription: prescription, draftItems: [], conflicts: [], showConflictModal: false })
  },
  reset: () => set({ currentPrescription: null, draftItems: [], conflicts: [], showConflictModal: false }),
}))
