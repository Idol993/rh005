import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { ClipboardList, ArrowRightLeft, FileText, CreditCard, Calendar, Heart, Clock, ChevronRight } from 'lucide-react'
import { mockLabReports } from '@/mock/data'

const quickActions = [
  { label: '挂号', icon: <ClipboardList size={24} />, path: '/patient/register', color: 'bg-primary-500', desc: '智能导诊挂号' },
  { label: '候诊查询', icon: <ArrowRightLeft size={24} />, path: '/patient/queue', color: 'bg-success-500', desc: '实时排队信息' },
  { label: '检查报告', icon: <FileText size={24} />, path: '/patient/reports', color: 'bg-amber-500', desc: '查看检验报告' },
  { label: '出院结算', icon: <CreditCard size={24} />, path: '/patient/settlement', color: 'bg-purple-500', desc: '费用查询结算' },
]

export default function PatientHome() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const myReports = mockLabReports.filter((r) => r.patientId === user?.id)
  const abnormalCount = myReports.reduce((sum, r) => sum + r.abnormalItems.length, 0)

  return (
    <div className="space-y-6 max-w-5xl">
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
            <span className="text-xs text-gray-400">查看全部</span>
          </div>
          <div className="space-y-3">
            {[
              { dept: '心内科', doctor: '王建国', time: '今天 14:30', status: '候诊中' },
              { dept: '呼吸科', doctor: '张秀芳', time: '明天 09:00', status: '已预约' },
              { dept: '消化科', doctor: '陈伟民', time: '06-20 10:30', status: '已预约' },
            ].map((apt, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Calendar size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{apt.dept} · {apt.doctor}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />{apt.time}
                    </div>
                  </div>
                </div>
                <span className={apt.status === '候诊中' ? 'badge badge-primary' : 'badge badge-success'}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
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
                className="w-full flex items-center justify-center gap-1 text-sm text-primary-500 hover:text-primary-600 mt-2"
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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}
