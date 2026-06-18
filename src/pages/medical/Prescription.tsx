import { useState } from 'react'
import { usePrescriptionStore } from '@/store/usePrescriptionStore'
import { usePharmacyStore } from '@/store/usePharmacyStore'
import { mockDrugs } from '@/mock/data'
import type { PrescriptionItem } from '@/types'
import { Search, Plus, Trash2, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function Prescription() {
  const [search, setSearch] = useState('')
  const {
    draftItems,
    showConflictModal,
    conflicts,
    hasBlockingConflict,
    addDrug,
    removeDrug,
    reviewPrescription,
    dismissConflict,
  } = usePrescriptionStore()

  const filteredDrugs = mockDrugs.filter(
    (d) => d.name.includes(search) || d.category.includes(search)
  )

  const handleAddDrug = (drug: (typeof mockDrugs)[number]) => {
    const exists = draftItems.find((d) => d.drugId === drug.id)
    if (exists) return
    const item: PrescriptionItem = {
      drugId: drug.id,
      drugName: drug.name,
      dosage: '常规用量',
      frequency: '每日2次',
      duration: '7天',
      quantity: 14,
    }
    addDrug(item)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">处方开具</h1>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-3">药品搜索</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="搜索药品名称或分类..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1 max-h-[420px] overflow-y-auto">
            {filteredDrugs.map((drug) => {
              const added = draftItems.some((d) => d.drugId === drug.id)
              return (
                <div
                  key={drug.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-medium text-gray-900">{drug.name}</span>
                    <span className="ml-2 badge badge-primary">{drug.category}</span>
                  </div>
                  <button
                    onClick={() => handleAddDrug(drug)}
                    disabled={added}
                    className={`p-1.5 rounded-lg transition-colors ${
                      added ? 'text-gray-300 cursor-not-allowed' : 'text-primary-500 hover:bg-primary-50'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
            {filteredDrugs.length === 0 && (
              <p className="text-center text-gray-400 py-4">未找到匹配药品</p>
            )}
          </div>
        </div>

        <div className="col-span-3 card flex flex-col">
          <h2 className="font-semibold text-gray-900 mb-3">当前处方</h2>
          {draftItems.length === 0 ? (
            <p className="text-gray-400 text-center py-12">请从左侧选择药品添加到处方</p>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">药品</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">剂量</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">频次</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">疗程</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-2">数量</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {draftItems.map((item) => (
                    <tr key={item.drugId} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-900">{item.drugName}</td>
                      <td className="py-2 text-gray-600">{item.dosage}</td>
                      <td className="py-2 text-gray-600">{item.frequency}</td>
                      <td className="py-2 text-gray-600">{item.duration}</td>
                      <td className="py-2 text-gray-600">{item.quantity}</td>
                      <td className="py-2">
                        <button
                          onClick={() => removeDrug(item.drugId)}
                          className="p-1 rounded text-danger-500 hover:bg-danger-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="pt-4 border-t border-gray-100 mt-3">
            <button
              onClick={reviewPrescription}
              disabled={draftItems.length === 0}
              className={`btn-primary w-full ${draftItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              审核处方
            </button>
          </div>
        </div>
      </div>

      {showConflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`bg-white rounded-xl shadow-xl w-full max-w-lg animate-scale-in ${hasBlockingConflict ? 'border-2 border-danger-500' : 'border-2 border-amber-400'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasBlockingConflict ? 'bg-danger-50' : 'bg-amber-50'}`}>
                    <ShieldAlert className={`w-5 h-5 ${hasBlockingConflict ? 'text-danger-500' : 'text-amber-500'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${hasBlockingConflict ? 'text-danger-500' : 'text-amber-600'}`}>
                      {hasBlockingConflict ? '处方高风险冲突拦截' : '处方冲突提示'}
                    </h3>
                    {hasBlockingConflict && (
                      <p className="text-xs text-danger-500 mt-0.5">发现严重风险，禁止提交，请先修改处方</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6 max-h-72 overflow-y-auto">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className={`border rounded-lg p-3 ${conflict.severity === 'critical' ? 'border-danger-200 bg-danger-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`badge ${
                          conflict.severity === 'critical' ? 'badge-danger' : 'badge-warning'
                        }`}
                      >
                        {conflict.severity === 'critical' ? '高风险' : '注意'}
                      </span>
                      <AlertTriangle
                        className={`w-4 h-4 ${
                          conflict.severity === 'critical' ? 'text-danger-500' : 'text-amber-500'
                        }`}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 my-1">{conflict.message}</p>
                    <p className="text-xs text-gray-500">
                      相关药品：{conflict.relatedDrugs.join('、')}
                    </p>
                    <p className="text-xs text-primary-700 mt-1 bg-primary-50 p-2 rounded">建议：{conflict.suggestion}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={dismissConflict} className={`flex-1 ${hasBlockingConflict ? 'btn-primary w-full' : 'btn-secondary'}`}>
                  {hasBlockingConflict ? '返回修改处方' : '返回修改'}
                </button>
                {!hasBlockingConflict && (
                  <button
                    onClick={() => {
                      const s = usePrescriptionStore.getState()
                      const prescription = {
                        id: `PX-${Date.now()}`,
                        patientId: s.currentPatientId,
                        patientName: s.currentPatientName,
                        doctorId: 'M001',
                        doctorName: '王医生',
                        items: s.draftItems,
                        conflicts: s.conflicts,
                        status: 'approved' as const,
                        createdAt: new Date().toISOString(),
                      }
                      usePharmacyStore.getState().addDispensingTask({
                        prescriptionId: prescription.id,
                        patientId: s.currentPatientId,
                        patientName: s.currentPatientName,
                        drugs: s.draftItems.map((item) => ({
                          drugId: item.drugId,
                          drugName: item.drugName,
                          quantity: item.quantity,
                          barcode: `69${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`,
                          scanStatus: 'pending' as const,
                        })),
                      })
                      usePrescriptionStore.setState({
                        currentPrescription: prescription,
                        draftItems: [],
                        conflicts: [],
                        showConflictModal: false,
                        hasBlockingConflict: false,
                      })
                    }}
                    className="btn-danger flex-1"
                  >
                    告知后提交
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
