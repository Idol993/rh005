import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useQueueStore } from '@/store/useQueueStore'
import { useReportsStore } from '@/store/useReportsStore'
import {
  ClipboardList,
  ArrowRightLeft,
  FileText,
  CreditCard,
  Calendar,
  Heart,
  Clock,
  ChevronRight,
  Bell,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const quickActions = [
  { label: '挂号', icon: <ClipboardList size={24} />, path: '/patient/register', color: 'bg-primary-500', desc: '智能导诊挂号' },
  { label: '候诊查询', icon: <ArrowRightLeft size={24} />, path: '/patient/queue', color: 'bg-success-500', desc: '实时排队信息' },
  { label: '检查报告', icon: <FileText size={24} />, path: '/patient/reports', color: 'bg-amber-500', desc: '查看检验报告' },
  { label: '出院结算', icon: <CreditCard size={24} />, path: '/patient/settlement', color: 'bg-purple-500', desc: '费用查询结算' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

export default function PatientHome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const registrations = useQueueStore((s) => s.registrations)
  const items = useQueueStore((s) => s.items)
  const reports = useReportsStore((s) => s.reports)
  const notifications = useReportsStore((s) => s.notifications)
  const markRead = useReportsStore((s) => s.markNotificationRead)

  const [dismissedNotif, setDismissedNotif] = useState<string | null>(null)

  const myRegs = registrations.filter((r) => r.patientId === user?.id)
  const myRegsWithStatus = myRegs
    .map((r) => {
      const queue = items.find((i) => i.queueNumber === r.queueNumber)
      return {
        ...r,
        status: queue?.status || 'waiting',
        estimatedWait: queue?.estimatedWait ?? r.estimatedWait,
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const myReports = reports.filter((r) => r.patientId === user?.id)
  const abnormalCount = myReports.reduce((sum, r) => sum + r.abnormalItems.length, 0)

  const myUnreadNotif = notifications.find(
    (n) => n.patientId === user?.id && !n.read && n.id !== dismissedNotif
  )

  const statusBadge = (s: string) => {
    switch (s) {
      case 'consulting': return 'badge-primary'
      case 'called': return 'badge-danger'
      case 'done': return 'badge-success'
      default: return 'badge-warning'
    }
  }
  const statusLabel = (s: string) => {
    switch (s) {
      case 'consulting': return '就诊中'
      case 'called': return '叫号中'
      case 'done': return '已完成'
      default: return '候诊中'
    }
  }

  useEffect(() => {
    if (myUnreadNotif) {
      const t = setTimeout(() => markRead(myUnreadNotif.id), 30000)
      return () => clearTimeout(t)
    }
  }, [myUnreadNotif, markRead])

  return (
    <div className="space-y-6 max-w-5xl relative">
      {myUnreadNotif && (
        <div className="animate-slide-in bg-gradient-to-r from-amber-50 to-primary-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 text-sm">{myUnreadNotif.title}</div>
            <div className="text-xs text-gray-600 mt-0.5">{myUnreadNotif.message}</div>
            <button
              onClick={() => { markRead(myUnreadNotif.id); navigate(`/patient/report/${myUnreadNotif.reportId}`) }}
              className="text-xs text-primary-500 font-medium mt-1.5 hover:text-primary-600 flex items-center gap-0.5"
            >
              查看详情 <ChevronRight size={12} />
            </button>
          </div>
          <button
            onClick={() => setDismissedNotif(myUnreadNotif.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {getGreeting()}，{user?.name}
            </h1>
            <p className="text-primary-100 text-sm">祝您身体健康，以下是您的就诊概览</p>
          </div>
          <Heart size={48} className="text-white/20" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="card-hover text-center group"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${action.color} text-white mb-3 transition-transform group-hover:scale-110`}>
              {action.icon}
            </div>
            <div className="font-semibold text-gray-800 mb-0.5">{action.label}</div>
            <div className="text-xs text-gray-400">{action.desc}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">近期预约</h2>
            <button
              onClick={() => navigate('/patient/queue')}
              className="text-xs text-gray-400 hover:text-primary-500"
            >
              查看全部
            </button>
          </div>
          {myRegsWithStatus.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">暂无预约记录，点击「挂号」开始预约</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRegsWithStatus.map((apt, idx) => (
                <div
                  key={apt.queueNumber}
                  className={`flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 rounded-lg ${
                    idx === 0 ? 'bg-primary-50/60 px-2 -mx-2' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 ${
                      idx === 0 ? 'ring-2 ring-primary-300' : ''
                    }`}>
                      <Calendar size={18} className="text-primary-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        {apt.department} · {apt.doctorName}
                        {idx === 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-primary-500 text-white text-[10px] font-medium">
                            本次
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />排队号 {apt.queueNumber} · 预计 {apt.estimatedWait} 分钟
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${statusBadge(apt.status)}`}>
                    {statusLabel(apt.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">健康概览</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">检验报告</span>
              <span className="text-lg font-bold text-gray-800">{myReports.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">异常指标</span>
              <span className={`text-lg font-bold ${abnormalCount > 0 ? 'text-danger-500' : 'text-success-500'}`}>{abnormalCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">过敏记录</span>
              <span className="text-lg font-bold text-amber-500">1项</span>
            </div>
            {myReports.length > 0 && (
              <button
                onClick={() => navigate('/patient/reports')}
                className="w-full flex items-center justify-center gap-1 text-sm text-primary-500 hover:text-primary-600 mt-2 border-t border-gray-50 pt-3"
              >
                查看报告详情 <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
