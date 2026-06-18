import { useState } from 'react'
import { useReportsStore } from '@/store/useReportsStore'
import { FileText, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react'

export default function ReportReview() {
  const { reports, reviewStatus, setReviewStatus } = useReportsStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getDirectionLabel = (direction: string) => {
    if (direction === 'high') return '↑'
    if (direction === 'low') return '↓'
    return ''
  }

  const pendingCount = reports.filter((r) => (reviewStatus[r.reportId] || 'pending') === 'pending').length
  const approvedCount = reports.filter((r) => reviewStatus[r.reportId] === 'approved').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报告审核</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI 辅助异常识别 · 医师确认签发</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">待审核</span>
            <span className="badge badge-warning">{pendingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">已通过</span>
            <span className="badge badge-success">{approvedCount}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reports.map((report) => {
          const isExpanded = expandedId === report.reportId
          const status = reviewStatus[report.reportId] || 'pending'
          const abnormalCount = report.abnormalItems.length

          return (
            <div key={report.reportId} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleExpand(report.reportId)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-500" />
                  <div>
                    <span className="font-semibold text-gray-900">{report.patientName}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-600">{report.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {abnormalCount > 0 && (
                    <span className="badge badge-danger">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {abnormalCount}项异常
                    </span>
                  )}
                  {status === 'approved' && (
                    <span className="badge badge-success">已签发</span>
                  )}
                  {status === 'rejected' && (
                    <span className="badge badge-danger">已退回</span>
                  )}
                  {status === 'pending' && (
                    <span className="badge badge-warning">待审核</span>
                  )}
                  <span className="text-sm text-gray-400">{report.date}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-6 py-4 animate-fade-in">
                  <table className="w-full mb-4">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">检查项目</th>
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">结果</th>
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">参考范围</th>
                        <th className="text-left text-sm font-medium text-gray-500 pb-2">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="py-2 text-gray-900">{item.name}</td>
                          <td className={`py-2 font-mono ${item.isAbnormal ? 'text-danger-500 font-bold' : 'text-gray-900'}`}>
                            {item.value} {item.unit}{' '}
                            {item.isAbnormal && getDirectionLabel(item.direction)}
                          </td>
                          <td className="py-2 text-gray-500 text-sm">{item.referenceRange}</td>
                          <td className="py-2">
                            {item.isAbnormal ? (
                              <span className="badge badge-danger">异常</span>
                            ) : (
                              <span className="badge badge-success">正常</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="bg-primary-50/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary-500" />
                      <span className="font-medium text-primary-700 text-sm">AI辅助分析</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{report.aiSummary}</p>
                  </div>

                  {status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setReviewStatus(report.reportId, 'approved')}
                        className="btn-success flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        审核通过并签发
                      </button>
                      <button
                        onClick={() => setReviewStatus(report.reportId, 'rejected')}
                        className="btn-danger flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        退回修改
                      </button>
                    </div>
                  )}
                  {status === 'approved' && (
                    <div className="flex items-center gap-2 text-success-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">已签发，报告已推送至患者端</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
