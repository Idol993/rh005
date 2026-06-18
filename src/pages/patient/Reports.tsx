import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useReportsStore } from '@/store/useReportsStore'
import { FileText, Calendar, AlertTriangle, ChevronRight, Lock } from 'lucide-react'

export default function Reports() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { reports, reviewStatus } = useReportsStore()
  const myReports = reports
    .filter((r) => r.patientId === user?.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  const approvedCount = myReports.filter((r) => reviewStatus[r.reportId] === 'approved').length
  const pendingCount = myReports.filter((r) => (reviewStatus[r.reportId] ?? 'pending') === 'pending').length
  const rejectedCount = myReports.filter((r) => reviewStatus[r.reportId] === 'rejected').length

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">检查报告</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI 自动提取异常指标 · 医师签发后可见</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">已签发</span>
            <span className="badge badge-success">{approvedCount}</span>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">待签发</span>
              <span className="badge badge-warning">{pendingCount}</span>
            </div>
          )}
          {rejectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">待修改</span>
              <span className="badge badge-danger">{rejectedCount}</span>
            </div>
          )}
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="card bg-amber-50 border-amber-200 border flex items-start gap-3">
          <Lock size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">有 {pendingCount} 份报告待医师签发</p>
            <p className="text-amber-700">报告将在医师审核通过后展示详情</p>
          </div>
        </div>
      )}

      {myReports.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 mb-1">暂无检查报告</p>
          <p className="text-sm text-gray-300 mb-4">完成相关检查后，报告会在这里出现</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {myReports.map((report) => {
            const status = reviewStatus[report.reportId] ?? 'pending'
            const isApproved = status === 'approved'
            const isRejected = status === 'rejected'
            return (
              <button
                key={report.reportId}
                onClick={() => navigate(`/patient/report/${report.reportId}`)}
                className="card-hover text-left group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isApproved ? 'bg-primary-50' : isRejected ? 'bg-danger-50' : 'bg-gray-100'
                    }`}>
                      {isApproved ? (
                        <FileText size={20} className="text-primary-500" />
                      ) : isRejected ? (
                        <AlertTriangle size={18} className="text-danger-400" />
                      ) : (
                        <Lock size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{report.type}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />{report.date}
                      </div>
                    </div>
                  </div>
                  {isApproved ? (
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors mt-1.5" />
                  ) : isRejected ? (
                    <span className="badge badge-danger">待修改</span>
                  ) : (
                    <span className="badge badge-warning">待签发</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">检测项目 {report.items.length} 项</span>
                  {isApproved ? (
                    report.abnormalItems.length > 0 ? (
                      <span className="badge badge-danger flex items-center gap-1">
                        <AlertTriangle size={10} />{report.abnormalItems.length} 项异常
                      </span>
                    ) : (
                      <span className="badge badge-success">全部正常</span>
                    )
                  ) : isRejected ? (
                    <span className="text-xs text-danger-500">请联系医师修改</span>
                  ) : (
                    <span className="text-xs text-gray-400">签发后可见详情</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
