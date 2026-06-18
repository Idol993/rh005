import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { FileText, Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import { mockLabReports } from '@/mock/data'

export default function Reports() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const myReports = mockLabReports.filter((r) => r.patientId === user?.id)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">检查报告</h1>
        <span className="text-sm text-gray-400">共 {myReports.length} 份报告</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {myReports.map((report) => (
          <button
            key={report.reportId}
            onClick={() => navigate(`/patient/report/${report.reportId}`)}
            className="card-hover text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FileText size={20} className="text-primary-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{report.type}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} />{report.date}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">检测项目 {report.items.length} 项</span>
              {report.abnormalItems.length > 0 ? (
                <span className="badge badge-danger flex items-center gap-1">
                  <AlertTriangle size={10} />{report.abnormalItems.length} 项异常
                </span>
              ) : (
                <span className="badge badge-success">全部正常</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {myReports.length === 0 && (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">暂无检查报告</p>
        </div>
      )}
    </div>
  )
}
