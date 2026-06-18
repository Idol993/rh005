import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { User, Stethoscope, Settings, Crown } from 'lucide-react'
import type { UserRole } from '@/types'

const roles: { role: UserRole; label: string; desc: string; icon: React.ReactNode; color: string; path: string }[] = [
  { role: 'patient', label: '患者', desc: '挂号、候诊、查报告', icon: <User size={32} />, color: 'bg-primary-500', path: '/patient' },
  { role: 'medical', label: '医护', desc: '处方开具、住院监测', icon: <Stethoscope size={32} />, color: 'bg-success-500', path: '/medical' },
  { role: 'admin', label: '行政', desc: '药房管理、导诊调度', icon: <Settings size={32} />, color: 'bg-amber-500', path: '/admin' },
  { role: 'director', label: '院长', desc: '运营驾驶舱、数据分析', icon: <Crown size={32} />, color: 'bg-purple-600', path: '/director' },
]

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleLogin = (role: UserRole, path: string) => {
    login(role)
    navigate(path)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-500 to-primary-900 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">智慧医院管理系统</h1>
          <p className="text-gray-400">Smart Hospital Management System</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <p className="text-center text-gray-300 mb-6 text-sm">请选择您的身份进入系统</p>
          <div className="grid grid-cols-2 gap-4">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => handleLogin(r.role, r.path)}
                className="group bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-xl p-6 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${r.color} mb-4 transition-transform duration-200 group-hover:scale-110`}>
                  <span className="text-white">{r.icon}</span>
                </div>
                <div className="text-lg font-semibold text-white mb-1">{r.label}</div>
                <div className="text-sm text-gray-400">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          演示系统 · 点击角色卡片即可登录
        </p>
      </div>
    </div>
  )
}
