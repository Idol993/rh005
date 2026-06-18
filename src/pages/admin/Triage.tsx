import { useQueueStore } from '@/store/useQueueStore'
import { mockDoctors } from '@/mock/data'
import type { QueueItem } from '@/types'
import { Users, Clock, Megaphone, ArrowUp, ArrowDown, Stethoscope, ChevronRight } from 'lucide-react'

const statusLabel: Record<QueueItem['status'], { text: string; cls: string }> = {
  waiting: { text: '候诊中', cls: 'bg-gray-100 text-gray-600' },
  called: { text: '叫号中', cls: 'bg-amber-100 text-amber-600' },
  consulting: { text: '就诊中', cls: 'bg-primary-50 text-primary-600' },
  done: { text: '已完成', cls: 'bg-success-50 text-success-600' },
}

export default function Triage() {
  const { items, callNextForDoctor, adjustPriority, getDoctors, getDoctorQueue, getCurrentForDoctor } = useQueueStore()

  const doctors = getDoctors()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">导诊管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">按诊室分别叫号 · 支持优先级调整</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>共 {doctors.length} 位医生出诊</span>
          <span>·</span>
          <span>候诊 {items.filter(i => i.status === 'waiting').length} 人</span>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Stethoscope size={20} className="text-primary-500" />
          诊室状态
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doc) => {
            const queue = getDoctorQueue(doc.doctorName)
            const current = getCurrentForDoctor(doc.doctorName)
            const waitingCount = queue.filter((i) => i.status === 'waiting').length

            return (
              <div key={doc.doctorName} className="card p-0 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {doc.doctorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-800">{doc.doctorName}</div>
                      <div className="text-xs text-gray-500">{doc.department}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => callNextForDoctor(doc.doctorName)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    disabled={waitingCount === 0}
                  >
                    <Megaphone size={12} />
                    叫号
                  </button>
                </div>
                <div className="px-4 py-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">当前</div>
                    <div className="font-mono font-bold text-primary-600">
                      {current ? current.queueNumber : '--'}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {current ? statusLabel[current.status].text : '空闲'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">等待</div>
                    <div className="font-mono font-bold text-amber-600">{waitingCount}</div>
                    <div className="text-[10px] text-gray-400">人候诊</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">首候</div>
                    <div className="font-mono font-bold text-gray-600">
                      {queue.filter(i=>i.status==='waiting').length > 0
                        ? queue.find(i=>i.status==='waiting')?.queueNumber
                        : '--'}
                    </div>
                    <div className="text-[10px] text-gray-400">下一位</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-primary-500" />
          排队总览
        </h2>
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
                    {item.status === 'waiting' ? (
                      <div className="flex gap-1">
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => adjustPriority(item.queueNumber, -1)}
                          title="上移（提前）"
                        >
                          <ArrowUp className="w-4 h-4 text-success-500" />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          onClick={() => adjustPriority(item.queueNumber, 1)}
                          title="下移（延后）"
                        >
                          <ArrowDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
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
