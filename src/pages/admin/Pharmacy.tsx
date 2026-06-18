import { useState } from 'react'
import { mockDispensingTasks } from '@/mock/data'
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
  const [tasks, setTasks] = useState<DispensingTask[]>(mockDispensingTasks)
  const [selectedTask, setSelectedTask] = useState<DispensingTask | null>(null)

  const handleAction = (task: DispensingTask, action: 'start' | 'scan' | 'complete') => {
    const updated = tasks.map((t) => {
      if (t.taskId !== task.taskId) return t
      switch (action) {
        case 'start':
          return { ...t, status: 'dispensing' as const, robotArmStatus: 'grabbing' as const, progress: 30 }
        case 'scan':
          return {
            ...t,
            status: 'scanning' as const,
            robotArmStatus: 'placing' as const,
            progress: 75,
            drugs: t.drugs.map((d) => ({ ...d, scanStatus: 'verified' as const })),
          }
        case 'complete':
          return { ...t, status: 'completed' as const, robotArmStatus: 'idle' as const, progress: 100 }
      }
    })
    setTasks(updated)
    setSelectedTask({ ...task, ...updated.find((t) => t.taskId === task.taskId)! })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">药房发药管理</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">调配任务队列</h2>
          {tasks.map((task) => (
            <div key={task.taskId} className={`card cursor-pointer transition-all ${selectedTask?.taskId === task.taskId ? 'ring-2 ring-primary-500' : ''}`} onClick={() => setSelectedTask(task)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-gray-500">{task.taskId}</span>
                  <span className="font-medium">{task.patientName}</span>
                  <span className="text-sm text-gray-400">处方: {task.prescriptionId}</span>
                </div>
                <span className={`badge ${statusConfig[task.status].cls}`}>{statusConfig[task.status].label}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>进度</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
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
          ))}
        </div>

        <div className="space-y-4">
          {selectedTask ? (
            <>
              <div className="card">
                <h3 className="font-semibold mb-3">扫码核对面板</h3>
                <div className="space-y-3">
                  {selectedTask.drugs.map((drug) => {
                    const sc = scanConfig[drug.scanStatus]
                    return (
                      <div key={drug.drugId} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{drug.drugName}</span>
                          <span className={`flex items-center gap-1 text-sm ${sc.cls}`}>
                            <sc.icon className="w-4 h-4" />
                            {sc.label}
                          </span>
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
                  <button className="btn-success w-full flex items-center justify-center gap-2" onClick={() => handleAction(selectedTask, 'complete')}>
                    <CheckCircle2 className="w-4 h-4" />完成发药
                  </button>
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
