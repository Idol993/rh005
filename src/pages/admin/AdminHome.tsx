import { useAuthStore } from '@/store/useAuthStore'
import { mockDispensingTasks, mockQueueItems } from '@/mock/data'
import { FileText, Pill, Users, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const pendingPrescriptions = mockDispensingTasks.filter(
    (t) => t.status === 'pending'
  ).length
  const todayDispensing = mockDispensingTasks.filter(
    (t) => t.status !== 'completed'
  ).length
  const waitingQueue = mockQueueItems.filter(
    (i) => i.status === 'waiting'
  ).length

  const stats = [
    { label: '待处理处方', value: pendingPrescriptions, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '今日调配任务', value: todayDispensing, icon: Pill, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: '候诊排队', value: waitingQueue, icon: Users, color: 'text-success-500', bg: 'bg-success-50' },
  ]

  const quickActions = [
    { label: '药房发药', desc: '管理调配任务与扫码发药', icon: Pill, path: '/admin/pharmacy', color: 'from-primary-500 to-primary-600' },
    { label: '导诊管理', desc: '科室叫号与排队管理', icon: Users, path: '/admin/triage', color: 'from-success-500 to-success-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          欢迎回来，{user?.name || '管理员'}
        </h1>
        <p className="text-gray-500 mt-1">智慧医院管理后台</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl`}>
              <s.icon className={`w-6 h-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="stat-value text-2xl">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((a) => (
            <div
              key={a.label}
              className="card-hover cursor-pointer group"
              onClick={() => navigate(a.path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`bg-gradient-to-br ${a.color} p-3 rounded-xl`}>
                    <a.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.label}</h3>
                    <p className="text-sm text-gray-500">{a.desc}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
