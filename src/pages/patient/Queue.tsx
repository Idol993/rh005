import { useEffect } from 'react'
import { useQueueStore } from '@/store/useQueueStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Volume2, Clock, Users, RefreshCw } from 'lucide-react'

const statusLabel: Record<string, string> = {
  waiting: '等候中',
  called: '叫号中',
  consulting: '就诊中',
  done: '已完成',
}

const statusBadge: Record<string, string> = {
  waiting: 'badge-warning',
  called: 'badge-danger',
  consulting: 'badge-primary',
  done: 'badge-success',
}

export default function Queue() {
  const { items, currentNumber, callNext } = useQueueStore()
  const user = useAuthStore((s) => s.user)

  const myItem = items.find((i) => i.patientId === user?.id)
  const myPosition = items.filter(
    (i) => i.status === 'waiting' && i.priority < (myItem?.priority ?? Infinity)
  ).length + 1

  const waitingCount = items.filter((i) => i.status === 'waiting').length

  useEffect(() => {
    const timer = setInterval(() => {
      useQueueStore.getState()
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0 text-center">
          <Volume2 size={24} className="mx-auto mb-2 text-primary-200" />
          <div className="text-sm text-primary-100 mb-1">当前叫号</div>
          <div className="stat-value text-white">{currentNumber}</div>
        </div>

        <div className="card text-center">
          <Users size={24} className="mx-auto mb-2 text-gray-300" />
          <div className="text-sm text-gray-500 mb-1">您的排队号</div>
          <div className="stat-value text-primary-500">{myItem?.queueNumber ?? '--'}</div>
          {myItem && myItem.status === 'waiting' && (
            <div className="text-xs text-gray-400 mt-1">前方还有 {myPosition - 1} 人</div>
          )}
        </div>

        <div className="card text-center">
          <Clock size={24} className="mx-auto mb-2 text-gray-300" />
          <div className="text-sm text-gray-500 mb-1">预计等候</div>
          <div className="stat-value text-amber-500">{myItem?.estimatedWait ?? 0}<span className="text-base ml-1">分钟</span></div>
        </div>
      </div>

      {myItem && myItem.status === 'called' && (
        <div className="card border-2 border-danger-500 bg-danger-50 animate-pulse-slow">
          <div className="flex items-center justify-center gap-3 text-danger-600">
            <Volume2 size={24} />
            <span className="text-lg font-bold">请 {myItem.patientName} 到 {myItem.department} 就诊！</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800">排队列表</h2>
            <span className="badge badge-primary">{waitingCount} 人等候</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-gray-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-xs text-gray-400">自动刷新</span>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 text-gray-500 font-medium">排队号</th>
              <th className="text-left py-2.5 text-gray-500 font-medium">患者</th>
              <th className="text-left py-2.5 text-gray-500 font-medium">科室</th>
              <th className="text-left py-2.5 text-gray-500 font-medium">医生</th>
              <th className="text-left py-2.5 text-gray-500 font-medium">状态</th>
              <th className="text-left py-2.5 text-gray-500 font-medium">预计等候</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.queueNumber}
                className={`border-b border-gray-50 ${item.patientId === user?.id ? 'bg-primary-50/50' : ''} ${item.status === 'called' ? 'bg-danger-50/50' : ''}`}
              >
                <td className="py-2.5 font-mono font-medium">{item.queueNumber}</td>
                <td className="py-2.5">{item.patientName}</td>
                <td className="py-2.5">{item.department}</td>
                <td className="py-2.5">{item.doctorName}</td>
                <td className="py-2.5"><span className={`badge ${statusBadge[item.status]}`}>{statusLabel[item.status]}</span></td>
                <td className="py-2.5 text-gray-500">{item.estimatedWait > 0 ? `${item.estimatedWait}分钟` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card flex items-center justify-between">
        <span className="text-sm text-gray-500">管理员测试：模拟叫号</span>
        <button onClick={callNext} className="btn-primary flex items-center gap-2">
          <Volume2 size={16} />叫号
        </button>
      </div>
    </div>
  )
}
