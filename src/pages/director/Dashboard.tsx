import { useDashboardStore } from '@/store/useDashboardStore'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, BedDouble, Pill, Heart, AlertTriangle, ChevronDown } from 'lucide-react'
import type { DepartmentMetric } from '@/types'

function CircularProgress({ value, max }: { value: number; max: number }) {
  const pct = (value / max) * 100
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#3B82F6" strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 44 44)"
        className="transition-all duration-500" />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
        className="fill-gray-900 text-sm font-bold">{value}%</text>
    </svg>
  )
}

export default function Dashboard() {
  const { metrics, selectedDepartment, setDepartment } = useDashboardStore()

  const filtered = selectedDepartment === '全部'
    ? metrics.departmentMetrics
    : metrics.departmentMetrics.filter((d) => d.department === selectedDepartment)

  const departments = ['全部', ...metrics.departmentMetrics.map((d) => d.department)]

  const alertCls: Record<string, string> = {
    critical: 'text-danger-500 bg-danger-50',
    warning: 'text-amber-500 bg-amber-50',
    info: 'text-primary-500 bg-primary-50',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">院长驾驶舱</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">门诊量</span>
            <Activity className="w-5 h-5 text-primary-500" />
          </div>
          <p className="stat-value text-primary-500">{metrics.outpatientCount}</p>
          <div className="h-10 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.outpatientTrend}>
                <defs>
                  <linearGradient id="outpatientGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#outpatientGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">床位周转率</span>
            <BedDouble className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-center gap-4">
            <CircularProgress value={metrics.bedTurnoverRate} max={100} />
            <div>
              <p className="stat-value text-blue-500">{metrics.bedTurnoverRate}%</p>
              <p className="text-xs text-gray-400">{metrics.occupiedBeds}/{metrics.totalBeds}床位</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">药占比</span>
            <Pill className="w-5 h-5 text-amber-500" />
          </div>
          <p className="stat-value text-amber-500">{metrics.drugRatio}%</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            目标: &lt;40%
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">患者满意度</span>
            <Heart className="w-5 h-5 text-success-500" />
          </div>
          <p className="stat-value text-success-500">{metrics.patientSatisfaction}%</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-success-400" />
            较上周提升0.3%
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">科室筛选:</label>
        <div className="relative">
          <select
            className="input-field pr-8 appearance-none text-sm"
            value={selectedDepartment}
            onChange={(e) => setDepartment(e.target.value)}
          >
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-800 mb-3">科室对比</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">科室</th>
              <th className="pb-2 font-medium">门诊量</th>
              <th className="pb-2 font-medium">床位周转率</th>
              <th className="pb-2 font-medium">药占比</th>
              <th className="pb-2 font-medium">满意度</th>
              <th className="pb-2 font-medium">营收(万)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d: DepartmentMetric) => (
              <tr key={d.department} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 font-medium">{d.department}</td>
                <td className="py-2">{d.outpatientCount}</td>
                <td className="py-2">{d.bedTurnoverRate}%</td>
                <td className="py-2">{d.drugRatio}%</td>
                <td className="py-2">{d.satisfaction}%</td>
                <td className="py-2">{(d.revenue / 10000).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-800 mb-3">门诊趋势</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.outpatientTrend}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#trendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">最近告警</h2>
          <div className="space-y-3">
            {metrics.recentAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alertCls[a.type] || 'text-gray-400'}`} />
                <div>
                  <p className="text-sm text-gray-700">{a.message}</p>
                  <p className="text-xs text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
