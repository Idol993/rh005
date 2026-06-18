import { useDashboardStore } from '@/store/useDashboardStore'
import { FileDown, Printer, BarChart3, Activity, BedDouble, Pill, Heart } from 'lucide-react'
import type { DepartmentMetric } from '@/types'

export default function Report() {
  const { metrics } = useDashboardStore()

  const handleExport = (type: string) => {
    alert(`${type}导出功能模拟执行成功！`)
  }

  const summaryCards = [
    { label: '门诊量', value: metrics.outpatientCount, icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: '床位周转率', value: `${metrics.bedTurnoverRate}%`, icon: BedDouble, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: '药占比', value: `${metrics.drugRatio}%`, icon: Pill, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: '患者满意度', value: `${metrics.patientSatisfaction}%`, icon: Heart, color: 'text-success-500', bg: 'bg-success-50' },
  ]

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">月度运营报告</h1>
          <p className="text-gray-500 mt-1">2026年6月</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />打印
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => handleExport('PDF')}>
            <FileDown className="w-4 h-4" />导出PDF
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => handleExport('Excel')}>
            <BarChart3 className="w-4 h-4" />导出Excel
          </button>
        </div>
      </div>

      <div className="card print:shadow-none print:border print:p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">核心指标概览</h2>
        <p className="text-sm text-gray-400 mb-4">报告期: 2026年6月1日 - 2026年6月18日</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((s) => (
            <div key={s.label} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${s.bg} p-2 rounded-lg`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span className="text-sm text-gray-500">{s.label}</span>
              </div>
              <p className="stat-value text-2xl">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card print:shadow-none print:border">
          <h3 className="font-semibold text-gray-800 mb-3">床位利用情况</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">总床位数</span>
              <span className="font-medium">{metrics.totalBeds}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">已占用</span>
              <span className="font-medium">{metrics.occupiedBeds}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">占用率</span>
              <span className="font-medium text-primary-500">{((metrics.occupiedBeds / metrics.totalBeds) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="bg-primary-500 h-3 rounded-full" style={{ width: `${(metrics.occupiedBeds / metrics.totalBeds) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="card print:shadow-none print:border">
          <h3 className="font-semibold text-gray-800 mb-3">门诊趋势摘要</h3>
          <div className="space-y-2">
            {metrics.outpatientTrend.map((t) => (
              <div key={t.date} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{t.date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(t.value / 900) * 100}%` }} />
                  </div>
                  <span className="font-mono w-10 text-right">{t.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card print:shadow-none print:border overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">科室运营明细</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">科室</th>
              <th className="pb-2 font-medium">门诊量</th>
              <th className="pb-2 font-medium">床位周转率</th>
              <th className="pb-2 font-medium">药占比</th>
              <th className="pb-2 font-medium">满意度</th>
              <th className="pb-2 font-medium">营收(万元)</th>
            </tr>
          </thead>
          <tbody>
            {metrics.departmentMetrics.map((d: DepartmentMetric) => (
              <tr key={d.department} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 font-medium">{d.department}</td>
                <td className="py-2">{d.outpatientCount}</td>
                <td className="py-2">{d.bedTurnoverRate}%</td>
                <td className="py-2">
                  <span className={d.drugRatio > 40 ? 'text-danger-500' : 'text-success-500'}>
                    {d.drugRatio}%
                  </span>
                </td>
                <td className="py-2">{d.satisfaction}%</td>
                <td className="py-2 font-mono">{(d.revenue / 10000).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-gray-800">
              <td className="pt-2">合计/平均</td>
              <td className="pt-2">{metrics.departmentMetrics.reduce((s, d) => s + d.outpatientCount, 0)}</td>
              <td className="pt-2">{(metrics.departmentMetrics.reduce((s, d) => s + d.bedTurnoverRate, 0) / metrics.departmentMetrics.length).toFixed(0)}%</td>
              <td className="pt-2">{metrics.drugRatio}%</td>
              <td className="pt-2">{metrics.patientSatisfaction}%</td>
              <td className="pt-2 font-mono">{(metrics.departmentMetrics.reduce((s, d) => s + d.revenue, 0) / 10000).toFixed(1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card print:shadow-none print:border">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">最近告警记录</h2>
        <div className="space-y-2">
          {metrics.recentAlerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                a.type === 'critical' ? 'bg-danger-50 text-danger-500' :
                a.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-primary-50 text-primary-500'
              }`}>{a.type === 'critical' ? '严重' : a.type === 'warning' ? '警告' : '信息'}</span>
              <span className="text-sm text-gray-700 flex-1 ml-3">{a.message}</span>
              <span className="text-xs text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
