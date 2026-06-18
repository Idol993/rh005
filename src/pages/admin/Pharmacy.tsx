import { useState } from 'react'
import { usePharmacyStore } from '@/store/usePharmacyStore'
import type { DispensingTask } from '@/types'
import {
  Pill,
  Package,
  CheckCircle2,
  Clock,
  ScanLine,
  Bot,
  ChevronRight,
  AlertCircle,
  Barcode,
  ArrowRight,
} from 'lucide-react'

const statusLabel: Record<string, string> = {
  pending: '待调配',
  dispensing: '调配中',
  scanning: '扫码核对',
  completed: '已完成',
}

const statusBadge: Record<string, string> = {
  pending: 'badge-warning',
  dispensing: 'badge-primary',
  scanning: 'badge-info',
  completed: 'badge-success',
}

const robotArmLabel: Record<string, string> = {
  idle: '待机中',
  moving: '移动中',
  grabbing: '抓取中',
  placing: '放置中',
}

export default function Pharmacy() {
  const { tasks, advanceTask, verifyDrug } = usePharmacyStore()
  const [selectedId, setSelectedId] = useState<string | null>(tasks[0]?.taskId ?? null)
  const selected = tasks.find((t) => t.taskId === selectedId) ?? null

  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const inProgressCount = tasks.length - pendingCount - completedCount

  const allVerified = selected ? selected.drugs.every((d) => d.scanStatus === 'verified') : false

  const handleStart = () => {
    if (!selected || selected.status !== 'pending') return
    advanceTask(selected.taskId, 'start')
  }

  const handleScan = () => {
    if (!selected || selected.status !== 'dispensing') return
    advanceTask(selected.taskId, 'scan')
  }

  const handleComplete = () => {
    if (!selected || selected.status !== 'scanning' || !allVerified) return
    advanceTask(selected.taskId, 'complete')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">药房管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">处方自动调配 · 机械臂发药 · 扫码核对</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">待调配</span>
            <span className="badge badge-warning">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">进行中</span>
            <span className="badge badge-primary">{inProgressCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">已完成</span>
            <span className="badge badge-success">{completedCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-1">调配任务列表</div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <button
                key={task.taskId}
                onClick={() => setSelectedId(task.taskId)}
                className={`w-full text-left card p-4 transition-all ${
                  selectedId === task.taskId
                    ? 'ring-2 ring-primary-400 shadow-md'
                    : 'hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-primary-600">{task.taskId}</span>
                  <span className={`badge ${statusBadge[task.status]} text-[10px]`}>
                    {statusLabel[task.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{task.patientName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">处方 {task.prescriptionId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      <Pill size={10} className="inline mr-1" />
                      {task.drugs.length} 种药品
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{task.createdAt}</div>
                  </div>
                </div>
                {task.status !== 'pending' && task.status !== 'completed' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                      <span>进度</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-8">
          {selected ? (
            <div className="card h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-800">
                      调配任务 {selected.taskId}
                    </h2>
                    <span className={`badge ${statusBadge[selected.status]}`}>
                      {statusLabel[selected.status]}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    处方号：{selected.prescriptionId}
                    <span className="mx-2 text-gray-300">|</span>
                    患者：{selected.patientName}
                    <span className="mx-2 text-gray-300">|</span>
                    开单时间：{selected.createdAt}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <Pill size={14} className="text-primary-500" />
                  处方药品 · 共 {selected.drugs.length} 种
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">药品名称</th>
                      <th className="text-left py-2 text-gray-500 font-medium">数量</th>
                      <th className="text-left py-2 text-gray-500 font-medium">条码</th>
                      <th className="text-left py-2 text-gray-500 font-medium">扫码状态</th>
                      <th className="text-right py-2 text-gray-500 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.drugs.map((drug) => (
                      <tr key={drug.drugId} className="border-b border-gray-50 last:border-0">
                        <td className="py-2.5">
                          <div className="font-medium text-gray-800">{drug.drugName}</div>
                          <div className="text-[10px] text-gray-400">{drug.drugId}</div>
                        </td>
                        <td className="py-2.5 text-gray-700">{drug.quantity} 片/粒</td>
                        <td className="py-2.5">
                          <span className="font-mono text-xs text-gray-600 flex items-center gap-1">
                            <Barcode size={12} />
                            {drug.barcode}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {drug.scanStatus === 'verified' ? (
                            <span className="badge badge-success text-[10px]">✓ 已核对</span>
                          ) : drug.scanStatus === 'mismatch' ? (
                            <span className="badge badge-danger text-[10px]">✕ 不匹配</span>
                          ) : (
                            <span className="badge badge-warning text-[10px]">待核对</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {drug.scanStatus !== 'verified' && selected.status === 'scanning' ? (
                            <button
                              onClick={() => verifyDrug(selected.taskId, drug.drugId)}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              扫码核对
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <Bot size={14} className="text-primary-500" />
                  机械臂调配状态
                </h3>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">当前步骤</span>
                      <span className="font-medium text-primary-600">
                        {robotArmLabel[selected.robotArmStatus]}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${selected.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{selected.progress}%</div>
                    <div className="text-xs text-gray-500">完成度</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                  {['待调配', '机械臂取药', '扫码核对', '发药完成'].map((step, i) => {
                    const stepThreshold = [0, 30, 75, 100]
                    const isDone = selected.progress >= stepThreshold[i]
                    const isCurrent = selected.progress < stepThreshold[i] && (i === 0 || selected.progress >= stepThreshold[i - 1])
                    return (
                      <div key={step} className="flex-1 text-center">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium ${
                          isDone ? 'bg-success-500 text-white' :
                          isCurrent ? 'bg-primary-500 text-white animate-pulse' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <div className={`text-xs mt-1.5 ${isDone ? 'text-success-600' : isCurrent ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                          {step}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                {selected.status === 'pending' && (
                  <button onClick={handleStart} className="btn-primary flex items-center gap-1.5">
                    <Package size={16} />
                    开始调配
                  </button>
                )}
                {selected.status === 'dispensing' && (
                  <button onClick={handleScan} className="btn-primary flex items-center gap-1.5">
                    <ScanLine size={16} />
                    进入扫码核对
                  </button>
                )}
                {selected.status === 'scanning' && (
                  <button
                    onClick={handleComplete}
                    disabled={!allVerified}
                    className="btn-success flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    完成发药
                  </button>
                )}
                {selected.status === 'completed' && (
                  <div className="flex items-center gap-2 text-success-600">
                    <CheckCircle2 size={18} />
                    <span className="font-medium">发药完成，患者可取药</span>
                  </div>
                )}
              </div>

              {selected.status === 'scanning' && !allVerified && (
                <div className="mt-3 flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>还有 {selected.drugs.filter(d => d.scanStatus !== 'verified').length} 种药品未扫码核对，请逐个核对后再完成发药。</span>
                </div>
              )}
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center py-20">
                <Package size={48} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400">请选择左侧任务查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
