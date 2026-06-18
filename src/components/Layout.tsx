import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import {
  Stethoscope,
  ClipboardList,
  FileText,
  CreditCard,
  Pill,
  Activity,
  LayoutDashboard,
  UserCog,
  ArrowRightLeft,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  icon: ReactNode
  path: string
}

const roleNavItems: Record<string, NavItem[]> = {
  patient: [
    { label: '首页', icon: <Home size={18} />, path: '/patient' },
    { label: '智能挂号', icon: <ClipboardList size={18} />, path: '/patient/register' },
    { label: '候诊排队', icon: <ArrowRightLeft size={18} />, path: '/patient/queue' },
    { label: '检查报告', icon: <FileText size={18} />, path: '/patient/reports' },
    { label: '出院结算', icon: <CreditCard size={18} />, path: '/patient/settlement' },
  ],
  medical: [
    { label: '首页', icon: <Home size={18} />, path: '/medical' },
    { label: '处方开具', icon: <Stethoscope size={18} />, path: '/medical/prescription' },
    { label: '住院监测', icon: <Activity size={18} />, path: '/medical/monitor' },
    { label: '报告审核', icon: <FileText size={18} />, path: '/medical/reports' },
  ],
  admin: [
    { label: '首页', icon: <Home size={18} />, path: '/admin' },
    { label: '药房发药', icon: <Pill size={18} />, path: '/admin/pharmacy' },
    { label: '导诊管理', icon: <UserCog size={18} />, path: '/admin/triage' },
  ],
  director: [
    { label: '驾驶舱', icon: <LayoutDashboard size={18} />, path: '/director' },
    { label: '运营月报', icon: <FileText size={18} />, path: '/director/report' },
  ],
}

const roleLabels: Record<string, string> = {
  patient: '患者端',
  medical: '医护端',
  admin: '行政端',
  director: '院长端',
}

const roleColors: Record<string, string> = {
  patient: 'bg-primary-500',
  medical: 'bg-success-500',
  admin: 'bg-amber-500',
  director: 'bg-purple-600',
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!user) return null

  const navItems = roleNavItems[user.role] || []
  const breadcrumbs = location.pathname.split('/').filter(Boolean)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5]">
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-dark-500 text-white flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
          <div className={`w-8 h-8 rounded-lg ${roleColors[user.role]} flex items-center justify-center flex-shrink-0`}>
            <Stethoscope size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <div className="text-sm font-bold leading-tight">智慧医院</div>
              <div className="text-[10px] text-gray-400">{roleLabels[user.role]}</div>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-white border-r-2 border-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 px-1 py-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className={`w-8 h-8 rounded-full ${roleColors[user.role]} flex items-center justify-center flex-shrink-0 text-xs font-bold`}>
              {user.name[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-[10px] text-gray-400">{roleLabels[user.role]}</div>
              </div>
            )}
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-2 px-2 py-2 text-xs text-gray-400 hover:text-danger-400 transition-colors rounded-lg hover:bg-white/5 mt-1"
            title="退出登录"
          >
            <LogOut size={14} />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <span>{roleLabels[user.role]}</span>
              {breadcrumbs.map((bc, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <ChevronRight size={12} />
                  <span className={i === breadcrumbs.length - 1 ? 'text-gray-800 font-medium' : ''}>{bc}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
