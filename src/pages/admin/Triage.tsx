import { useQueueStore } from '@/store/useQueueStore'
import { mockDoctors } from '@/mock/data'
import type { QueueItem } from '@/types'
import { Users, Clock, Megaphone, ArrowUp, ArrowDown, Stethoscope } from 'lucide-react'

const statusLabel: Record<QueueItem['status'], { text: string; cls: string }> = {
  waiting: { text: '候诊中', cls: 'bg-gray-100 text-gray-600' },
  called: { text: '叫号中', cls: 'bg-amber-100 text-amber-600' },
  consulting: { text: '就诊中', cls: 'bg-primary-50 text-primary-600' },
  done: { text: '已完成', cls: 'bg-success-50 text-success-600' },
}

export default function Triage() {
  const { items, callNext, currentNumber } = useQueueStore()

  const departments = mockDoctors.reduce<Record<string, { queueLength: number; estimatedWait: number }>>((acc, d) => {
    if (!acc[d.department]) {
      acc[d.department] = { queueLength: 0, estimatedWait: 0 }
    }
    acc[d.department].queueLength += d.queueLength
    acc[d.department].estimatedWait = Math.max(acc[d.department].estimatedWait, d.estimatedWait)
    return acc
  }, {})

  const deptQueueMap = items.reduce<Record<string, QueueItem[]>>((acc, item) => {
    if (!acc[item.department]) acc[item.department] = []
    acc[item.department].push(item)
    return acc
  }, {})

  const adjustPriority = (queueNumber: number, delta: number) => {
    const item = items.find((i) => i.queueNumber === queueNumber)
    if (item && item.priority + delta >= 1) {
      item.priority += delta
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">导诊管理</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">当前叫号: <span className="font-mono font-bold text-primary-500">{currentNumber}</span></span>
          <button className="btn-primary flex items-center gap-2" onClick={callNext}>
            <Megaphone className="w-4 h-4" />叫号
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">科室状态</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(departments).map(([dept, info]) => (
            <div key={dept} className="card">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-sm">{dept}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>排队: {deptQueueMap[dept]?.filter((i) => i.status === 'waiting').length ?? 0}人</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>预计: {info.estimatedWait}分钟</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">排队总览</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">序号</th>
                <th className="pb-3 font-medium">患者</th>
                <th className="pb-3 font-medium">科室</th>
                <th className="pb-3 font-medium">医生</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">预计等待</th>
                <th className="pb-3 font-medium">优先级</th>
                <th className="pb-3 font-medium">调整</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.queueNumber} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-mono">{item.queueNumber}</td>
                  <td className="py-3">{item.patientName}</td>
                  <td className="py-3">{item.department}</td>
                  <td className="py-3">{item.doctorName}</td>
                  <td className="py-3">
                    <span className={`badge ${statusLabel[item.status].cls}`}>{statusLabel[item.status].text}</span>
                  </td>
                  <td className="py-3">{item.estimatedWait > 0 ? `${item.estimatedWait}分钟` : '-'}</td>
                  <td className="py-3 font-mono">{item.priority}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button className="p-1 rounded hover:bg-gray-100" onClick={() => adjustPriority(item.queueNumber, -1)}>
                        <ArrowUp className="w-4 h-4 text-success-500" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-100" onClick={() => adjustPriority(item.queueNumber, 1)}>
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
