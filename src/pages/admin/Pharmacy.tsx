import { useState } from 'react'
import { usePharmacyStore } from '@/store/usePharmacyStore'
import type { DispensingTask, DispensingDrug } from '@/types'
import { Cpu, ScanLine, CheckCircle2, Clock, AlertTriangle, Pill } from 'lucide-react'

const statusConfig: Record<DispensingTask['status'], { label: string; cls: string }> = {
  pending: { label: '待调配', cls: 'bg-gray-100 text-gray-600' },
  dispensing: { label: '调配中', cls: 'bg-blue-100 text-blue-600' },
  scanning: { label: '扫码中', cls: 'bg-amber-100 text-amber-600' },
  completed: { label: '已完成', cls: 'bg-success-50 text-success-600' },
}

const scanConfig: Record<DispensingDrug['scanStatus'], { label: string; icon: typeof CheckCircle2; cls: string }> = {
  pending: { label: '待扫码', icon: Clock, cls: 'text-gray-400' },
  verified: { label: '已核对', icon: CheckCircle2, cls: 'text-success-500' },
  mismatch: { label: '不匹配', icon: AlertTriangle, cls: 'text-danger-500' },
}

function RobotArmIcon({ status }: { status: DispensingTask['robotArmStatus'] }) {
  const anim = status !== 'idle' ? 'robot-arm-anim' : ''
  return (
    <div className="flex items-center gap-2">
      <Cpu className={`w-5 h-5 ${anim} ${status !== 'idle' ? 'text-primary-500' : 'text-gray-400'}`} />
      <span className="text-sm">
        {status === 'idle' ? '空闲' : status === 'moving' ? '移动中' : status === 'grabbing' ? '抓取中' : '放置中'}
      </span>
    </div>
  )
}

export default function Pharmacy() {
  const { tasks, advanceTask, verifyDrug } = usePharmacyStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const selectedTask = tasks.find((t) => t.taskId === selectedTaskId) ?? null

  const handleAction = (task: DispensingTask, action: 'start' | 'scan' | 'complete') => {
    advanceTask(task.taskId, action)
  }

  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const todayDone = tasks.filter((t) => t.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">药房发药管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">机械臂自动调配 · 扫码核对 · 追溯留档</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">待调配</span>
            <span className="badge-warning badge">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">今日完成</span>
            <span className="badge badge-success">{todayDone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">调配任务队列</h2>
          {tasks.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <Pill className="w-10 h-10 mx-auto mb-2" />
              <p>暂无调配任务，等处方审核通过后自动生成</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.taskId}
                className={`card cursor-pointer transition-all ${selectedTaskId === task.taskId ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => setSelectedTaskId(task.taskId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-500">{task.taskId}</span>
                    <span className="font-medium">{task.patientName}</span>
                    <span className="text-sm text-gray-400">处方: {task.prescriptionId}</span>
                  </div>
                  <span className={`badge ${statusConfig[task.status].cls}`}>
                    {statusConfig[task.status].label}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>进度</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${task.progress === 100 ? 'bg-success-500' : 'bg-primary-500'}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-3">
                    {task.drugs.map((d) => (
                      <span key={d.drugId} className="text-sm text-gray-600 flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        {d.drugName} ×{d.quantity}
                      </span>
                    ))}
                  </div>
                  <RobotArmIcon status={task.robotArmStatus} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          {selectedTask ? (
            <>
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">扫码核对面板</h3>
                  <span className={`badge ${statusConfig[selectedTask.status].cls}`}>
                    {statusConfig[selectedTask.status].label}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
                  <div className="flex justify-between mb-1">
                    <span>患者</span><span className="text-gray-700">{selectedTask.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>处方号</span><span className="text-gray-700 font-mono">{selectedTask.prescriptionId}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedTask.drugs.map((drug, idx) => {
                    const sc = scanConfig[drug.scanStatus]
                    return (
                      <div key={drug.drugId} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-sm">{drug.drugName}</span>
                          </div>
                          <button
                            className={`flex items-center gap-1 text-sm ${sc.cls}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (drug.scanStatus === 'pending') verifyDrug(selectedTask.taskId, drug.drugId)
                            }}
                          >
                            <sc.icon className="w-4 h-4" />
                            {sc.label}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">条码: {drug.barcode}</p>
                        <p className="text-xs text-gray-400">数量: {drug.quantity}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="card space-y-2">
                {selectedTask.status === 'pending' && (
                  <button className="btn-primary w-full" onClick={() => handleAction(selectedTask, 'start')}>开始调配</button>
                )}
                {selectedTask.status === 'dispensing' && (
                  <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => handleAction(selectedTask, 'scan')}>
                    <ScanLine className="w-4 h-4" />扫码核对
                  </button>
                )}
                {selectedTask.status === 'scanning' && (
                  <button
                    className={`w-full flex items-center justify-center gap-2 ${selectedTask.drugs.every((d) => d.scanStatus === 'verified') ? 'btn-success' : 'btn-secondary cursor-not-allowed opacity-60'}`}
                    disabled={!selectedTask.drugs.every((d) => d.scanStatus === 'verified')}
                    onClick={() => handleAction(selectedTask, 'complete')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {selectedTask.drugs.every((d) => d.scanStatus === 'verified') ? '完成发药' : '请完成全部扫码核对'}
                  </button>
                )}
                {selectedTask.status === 'completed' && (
                  <div className="flex items-center justify-center gap-2 text-success-600 py-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">发药完成</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card text-center text-gray-400 py-12">
              <Pill className="w-10 h-10 mx-auto mb-2" />
              <p>请选择一个调配任务</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
