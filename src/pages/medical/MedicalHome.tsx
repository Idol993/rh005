import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { mockQueueItems, mockVitalSigns, mockDashboardMetrics } from '@/mock/data'
import { FileText, Activity, ClipboardCheck, Calendar, Pill, AlertTriangle, Users, ChevronRight } from 'lucide-react'

export default function MedicalHome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const todayAppointments = mockQueueItems.filter((q) => q.status !== 'done').length
  const pendingPrescriptions = 3
  const alertCount = mockVitalSigns.reduce((acc, v) => acc + v.alerts.filter((a) => !a.acknowledged).length, 0)

  const recentPatients = [
    { id: 'P001', name: '张三', dept: '心内科', status: '就诊中' },
    { id: 'P002', name: '李四', dept: '心内科', status: '候诊中' },
    { id: 'P008', name: '陈大明', dept: '住院', status: '监护中' },
    { id: 'P010', name: '方建国', dept: '住院', status: '监护中' },
  ]

  const quickActions = [
    { icon: Pill, label: '处方开具', desc: '开具和审核处方', color: 'bg-primary-50 text-primary-500', path: '/medical/prescription' },
    { icon: Activity, label: '住院监测', desc: '实时生命体征', color: 'bg-danger-50 text-danger-500', path: '/medical/monitor' },
    { icon: ClipboardCheck, label: '报告审核', desc: '审核检验报告', color: 'bg-success-50 text-success-500', path: '/medical/reports' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.name || '医生'}，早上好
          </h1>
          <p className="text-gray-500 mt-1">今天是{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">今日预约</p>
              <p className="stat-value text-primary-500">{todayAppointments}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待处理处方</p>
              <p className="stat-value text-amber-500">{pendingPrescriptions}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">预警通知</p>
              <p className="stat-value text-danger-500">{alertCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">快捷操作</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="card-hover text-left flex items-center gap-4 group"
              onClick={() => navigate(action.path)}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{action.label}</p>
                <p className="text-sm text-gray-500">{action.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">最近患者</h2>
        <div className="card p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">患者</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">科室</th>
                <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{p.dept}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${p.status === '就诊中' ? 'badge-primary' : p.status === '监护中' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mockDashboardMetrics.recentAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">最新预警</h2>
          <div className="space-y-2">
            {mockDashboardMetrics.recentAlerts.map((alert, i) => (
              <div key={i} className="card flex items-center gap-3 py-3">
                <AlertTriangle className={`w-4 h-4 ${alert.type === 'critical' ? 'text-danger-500' : 'text-amber-500'}`} />
                <span className="flex-1 text-sm text-gray-700">{alert.message}</span>
                <span className="text-xs text-gray-400">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
