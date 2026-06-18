import { create } from 'zustand'
import type { PrescriptionItem, ConflictAlert, Prescription, DispensingDrug } from '@/types'
import { mockDrugs, patientAllergies } from '@/mock/data'
import { usePharmacyStore } from '@/store/usePharmacyStore'

interface PrescriptionState {
  currentPrescription: Prescription | null
  draftItems: PrescriptionItem[]
  conflicts: ConflictAlert[]
  showConflictModal: boolean
  hasBlockingConflict: boolean
  currentPatientId: string
  currentPatientName: string
  setCurrentPatient: (id: string, name: string) => void
  addDrug: (drug: PrescriptionItem) => void
  removeDrug: (drugId: string) => void
  reviewPrescription: () => void
  dismissConflict: () => void
  reset: () => void
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  currentPrescription: null,
  draftItems: [],
  conflicts: [],
  showConflictModal: false,
  hasBlockingConflict: false,
  currentPatientId: 'P001',
  currentPatientName: '张三',

  setCurrentPatient: (id, name) => set({ currentPatientId: id, currentPatientName: name }),

  addDrug: (drug) => {
    set((state) => ({ draftItems: [...state.draftItems, drug] }))
  },
  removeDrug: (drugId) => {
    set((state) => ({ draftItems: state.draftItems.filter((d) => d.drugId !== drugId) }))
  },

  reviewPrescription: () => {
    const { draftItems, currentPatientId, currentPatientName } = get()
    const foundConflicts: ConflictAlert[] = []
    let hasBlocking = false

    for (let i = 0; i < draftItems.length; i++) {
      const item = draftItems[i]
      const drugInfo = mockDrugs.find((d) => d.id === item.drugId)
      if (!drugInfo) continue

      for (let j = i + 1; j < draftItems.length; j++) {
        const other = draftItems[j]
        if (drugInfo.interactions.includes(other.drugId)) {
          const exists = foundConflicts.find(
            (c) => c.type === 'drug_interaction' && c.relatedDrugs.includes(item.drugName) && c.relatedDrugs.includes(other.drugName)
          )
          if (!exists) {
            const isSevere = ['阿司匹林', '华法林', '氯吡格雷'].some((n) => item.drugName.includes(n) || other.drugName.includes(n))
            foundConflicts.push({
              id: `C-${Date.now()}-${Math.random()}`,
              type: 'drug_interaction',
              severity: isSevere ? 'critical' : 'warning',
              message: `${item.drugName}与${other.drugName}存在${isSevere ? '严重' : '潜在'}药物相互作用${isSevere ? '，显著增加出血风险' : ''}`,
              relatedDrugs: [item.drugName, other.drugName],
              suggestion: isSevere
                ? `【高风险】禁止联用！请立即调整用药方案，咨询临床药师；如必须联用需签知情同意书并加强监测`
                : `建议调整用药方案，或密切监测患者反应`,
            })
            if (isSevere) hasBlocking = true
          }
        }
      }
    }

    const allergies = patientAllergies[currentPatientId] || []
    allergies.forEach((allergy) => {
      draftItems.forEach((item) => {
        const hit =
          (allergy === '青霉素' && item.drugName.includes('阿莫')) ||
          (allergy === '头孢类' && item.drugName.includes('头孢')) ||
          item.drugName.includes(allergy.replace('类', ''))
        if (hit) {
          const exists = foundConflicts.find(
            (c) => c.type === 'allergy' && c.relatedDrugs.includes(item.drugName)
          )
          if (!exists) {
            foundConflicts.push({
              id: `C-${Date.now()}-${Math.random()}`,
              type: 'allergy',
              severity: 'critical',
              message: `患者对${allergy}过敏，${item.drugName}可能引起过敏反应`,
              relatedDrugs: [item.drugName],
              suggestion: `【高风险】禁用${item.drugName}！请更换为非${allergy}替代药品`,
            })
            hasBlocking = true
          }
        }
      })
    })

    if (foundConflicts.length > 0) {
      set({ conflicts: foundConflicts, showConflictModal: true, hasBlockingConflict: hasBlocking })
      return
    }

    const prescription: Prescription = {
      id: `PX-${Date.now()}`,
      patientId: currentPatientId,
      patientName: currentPatientName,
      doctorId: 'M001',
      doctorName: '王医生',
      items: draftItems,
      conflicts: [],
      status: 'approved',
      createdAt: new Date().toISOString(),
    }

    const dispensingDrugs: DispensingDrug[] = draftItems.map((item) => ({
      drugId: item.drugId,
      drugName: item.drugName,
      quantity: item.quantity,
      barcode: `69${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`,
      scanStatus: 'pending',
    }))
    usePharmacyStore.getState().addDispensingTask({
      prescriptionId: prescription.id,
      patientName: currentPatientName,
      drugs: dispensingDrugs,
    })

    set({ currentPrescription: prescription, draftItems: [], conflicts: [], showConflictModal: false, hasBlockingConflict: false })
  },

  dismissConflict: () => {
    set({ conflicts: [], showConflictModal: false, hasBlockingConflict: false })
  },

  reset: () => set({ currentPrescription: null, draftItems: [], conflicts: [], showConflictModal: false, hasBlockingConflict: false }),
}))
