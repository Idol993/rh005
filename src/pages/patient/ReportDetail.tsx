import { useParams, useNavigate } from 'react-router-dom'
import { ArrowUp, ArrowDown, ArrowLeft, Sparkles, AlertTriangle, FileText, Lock, Stethoscope, Calendar, ClipboardList } from 'lucide-react'
import { useReportsStore } from '@/store/useReportsStore'

export default function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { reports, reviewStatus } = useReportsStore()
  const report = reports.find((r) => r.reportId === reportId)

  if (!report) {
    return (
      <div className="max-w-4xl text-center py-20">
        <FileText size={48} className="mx-auto text-gray-200 mb-3" />
        <p className="text-gray-400">未找到该报告</p>
        <button onClick={() => navigate('/patient/reports')} className="btn-primary mt-4">返回报告列表</button>
      </div>
    )
  }

  const status = reviewStatus[report.reportId] ?? 'pending'
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'

  return (
    <div className="max-w-4xl space-y-6">
      <button
        onClick={() => navigate('/patient/reports')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 transition-colors"
      >
        <ArrowLeft size={16} />返回报告列表
      </button>

      {isRejected ? (
        <div className="card text-center py-12 border-danger-200 border">
          <AlertTriangle size={48} className="mx-auto text-danger-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">报告待修改</h2>
          <p className="text-gray-500 mb-4">这份报告状态为：
            <span className="badge badge-danger ml-2">已退回修改</span>
          </p>
          <p className="text-sm text-gray-400">医师对报告有修改意见，请联系检验科重新复核</p>
        </div>
      ) : !isApproved ? (
        <div className="card text-center py-12 border-amber-200 border">
          <Lock size={48} className="mx-auto text-amber-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">报告待签发</h2>
          <p className="text-gray-500 mb-4">这份报告目前状态为：
            <span className="badge badge-warning ml-2">待签发</span>
          </p>
          <p className="text-sm text-gray-400">请等待医师完成审核签发，签发后即可查看完整详情</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{report.type}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{report.date} · {report.patientName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-success">医师已签发</span>
                {report.abnormalItems.length > 0 && (
                  <span className="badge badge-danger flex items-center gap-1">
                    <AlertTriangle size={12} />{report.abnormalItems.length} 项异常
                  </span>
                )}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-gray-500 font-medium">项目</th>
                  <th className="text-left py-2.5 text-gray-500 font-medium">结果</th>
                  <th className="text-left py-2.5 text-gray-500 font-medium">单位</th>
                  <th className="text-left py-2.5 text-gray-500 font-medium">参考范围</th>
                  <th className="text-left py-2.5 text-gray-500 font-medium">方向</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((item) => (
                  <tr key={item.name} className={`border-b border-gray-50 ${item.isAbnormal ? 'bg-danger-50/50' : ''}`}>
                    <td className="py-2.5 font-medium">{item.name}</td>
                    <td className={`py-2.5 font-mono ${item.isAbnormal ? 'text-danger-500 font-bold' : 'text-gray-800'}`}>{item.value}</td>
                    <td className="py-2.5 text-gray-500">{item.unit}</td>
                    <td className="py-2.5 text-gray-400">{item.referenceRange}</td>
                    <td className="py-2.5">
                      {item.direction === 'high' && <span className="flex items-center gap-1 text-danger-500"><ArrowUp size={14} />偏高</span>}
                      {item.direction === 'low' && <span className="flex items-center gap-1 text-amber-500"><ArrowDown size={14} />偏低</span>}
                      {item.direction === 'normal' && <span className="text-gray-400">正常</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-primary-500" />
              <h2 className="font-semibold text-primary-800">AI 健康解读</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{report.aiSummary}</p>
          </div>

          {report.abnormalItems.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-danger-500" />
                <h2 className="font-semibold text-gray-800">异常指标</h2>
              </div>
              <div className="space-y-3">
                {report.abnormalItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-danger-500 font-mono font-bold">{item.value} {item.unit}</span>
                      <span className="text-gray-400 mx-2">·</span>
                      <span className="text-sm text-gray-500">参考: {item.referenceRange}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-sm font-medium ${item.direction === 'high' ? 'text-danger-500' : 'text-amber-500'}`}>
                      {item.direction === 'high' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {item.direction === 'high' ? '偏高' : '偏低'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.followUp && (
            <div className="card bg-gradient-to-br from-amber-50 to-primary-50 border-amber-100">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope size={18} className="text-amber-600" />
                <h2 className="font-semibold text-amber-800">复诊建议</h2>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <ClipboardList size={12} />建议科室
                  </div>
                  <div className="text-lg font-bold text-gray-800">{report.followUp.suggestedDepartment}</div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Calendar size={12} />复查时间
                  </div>
                  <div className="text-lg font-bold text-gray-800">{report.followUp.recheckWithin}</div>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">需关注指标</div>
                  <div className="text-sm font-bold text-danger-600">{report.followUp.focusItems.length}项</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-800">重点关注：{report.followUp.focusItems.join('、')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">建议在 {report.followUp.recheckWithin} 前往 {report.followUp.suggestedDepartment} 复诊</div>
                </div>
                <button
                  onClick={() => navigate('/patient/register', {
                    state: {
                      followUp: {
                        ...report.followUp,
                        reportType: report.type,
                      },
                    },
                  })}
                  className="btn-primary flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Stethoscope size={14} />
                  一键复诊挂号
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
