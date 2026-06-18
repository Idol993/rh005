import { useState, useMemo } from 'react'
import { useReportsStore, reportTemplates } from '@/store/useReportsStore'
import { mockUsers } from '@/mock/data'
import {
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  Plus,
  X,
  Loader2,
} from 'lucide-react'

const templateTypes = Object.keys(reportTemplates)
const patientOptions = mockUsers.filter((u) => u.role === 'patient')

export default function ReportReview() {
  const { reports, reviewStatus, setReviewStatus, createReport } = useReportsStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [reportType, setReportType] = useState(templateTypes[0])
  const [itemValues, setItemValues] = useState<Record<string, number>>({})
  const [creating, setCreating] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const template = reportTemplates[reportType] || []

  const previewItems = useMemo(() => {
    return template.map((t) => {
      const rawVal = itemValues[t.name]
      const value = rawVal ?? 0
      const match = t.referenceRange.match(/([\d.]+)\s*-\s*([\d.]+)/)
      let isAbnormal = false
      let direction: 'high' | 'low' | 'normal' = 'normal'
      if (match && rawVal !== undefined) {
        const low = parseFloat(match[1])
        const high = parseFloat(match[2])
        if (value < low) {
          isAbnormal = true
          direction = 'low'
        } else if (value > high) {
          isAbnormal = true
          direction = 'high'
        }
      }
      return { ...t, value, isAbnormal, direction, filled: rawVal !== undefined }
    })
  }, [template, itemValues, reportType])

  const previewAbnormal = previewItems.filter((i) => i.isAbnormal && i.filled)
  const allFilled = template.length > 0 && template.every((t) => itemValues[t.name] !== undefined)

  const previewAiSummary = useMemo(() => {
    if (!allFilled) return '填写完整指标后，AI 将自动生成解读...'
    const abnormalNames = previewAbnormal.slice(0, 3).map((i) => i.name).join('、')
    const suggestMap: Record<string, string> = {
      '血常规': '提示可能存在感染或血液系统异常，建议结合临床症状进一步评估，必要时复查。',
      '肝功能': '提示肝细胞可能存在一定程度损伤，建议排查药物、饮酒、病毒性肝炎等因素，注意休息。',
      '血脂检查': '提示存在血脂代谢异常，建议调整饮食结构，减少高脂高糖摄入，适度运动，必要时启动降脂治疗。',
      '肾功能': '提示肾功能可能存在异常，建议结合蛋白尿、水肿等临床表现进一步评估。',
      '血糖': '提示血糖代谢异常，建议复查空腹血糖及糖化血红蛋白，排除糖尿病可能。',
    }
    const suggestion = suggestMap[reportType] || '建议结合临床症状进一步评估，定期复查。'
    if (previewAbnormal.length === 0) {
      return `本次${reportType}检查全部${template.length}项指标均在正常范围内，整体状态良好，建议继续保持健康的生活方式，定期复查。`
    }
    return `本次${reportType}检查共${template.length}项，发现${previewAbnormal.length}项异常：${abnormalNames}${previewAbnormal.length > 3 ? '等' : ''}指标异常。${suggestion}`
  }, [allFilled, previewAbnormal, template.length, reportType])

  const handleValueChange = (name: string, val: string) => {
    const num = val === '' ? undefined : parseFloat(val)
    setItemValues((prev) => {
      const next = { ...prev }
      if (num === undefined) {
        delete next[name]
      } else {
        next[name] = num
      }
      return next
    })
  }

  const handleTypeChange = (type: string) => {
    setReportType(type)
    setItemValues({})
    setCreatedId(null)
  }

  const handleCreate = () => {
    if (!patientId || !allFilled) return
    setCreating(true)
    setTimeout(() => {
      const patient = patientOptions.find((p) => p.id === patientId)
      const items = template.map((t) => ({
        name: t.name,
        value: itemValues[t.name] ?? 0,
        unit: t.unit,
        referenceRange: t.referenceRange,
      }))
      const newId = createReport({
        patientId,
        patientName: patient?.name || '',
        type: reportType,
        items,
      })
      setCreatedId(newId)
      setCreating(false)
      setExpandedId(newId)
    }, 800)
  }

  const resetCreate = () => {
    setShowCreate(false)
    setPatientId('')
    setReportType(templateTypes[0])
    setItemValues({})
    setCreatedId(null)
  }

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
          <button
            onClick={() => (showCreate ? resetCreate() : setShowCreate(true))}
            className={`${showCreate ? 'btn-danger' : 'btn-primary'} flex items-center gap-1.5`}
          >
            {showCreate ? (
              <><X size={16} />取消新建</>
            ) : (
              <><Plus size={16} />新建报告</>
            )}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="card border-primary-200 border bg-primary-50/30 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Plus size={18} className="text-primary-500" />
              新建检查报告
            </h2>
            {createdId && (
              <span className="badge badge-success">✓ 已生成 {createdId}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">患者</label>
              <select
                className="input-field"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                <option value="">请选择患者</option>
                {patientOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">检查类型</label>
              <select
                className="input-field"
                value={reportType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {templateTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
            <div className="text-sm font-medium text-gray-700 mb-3">检测指标</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">项目</th>
                  <th className="text-left py-2 text-gray-500 font-medium w-32">结果</th>
                  <th className="text-left py-2 text-gray-500 font-medium">单位</th>
                  <th className="text-left py-2 text-gray-500 font-medium">参考范围</th>
                  <th className="text-left py-2 text-gray-500 font-medium w-20">状态</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item, i) => (
                  <tr key={i} className={`border-b border-gray-50 last:border-0 ${item.isAbnormal && item.filled ? 'bg-danger-50/60' : ''}`}>
                    <td className="py-2 text-gray-800">{item.name}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 font-mono ${
                          item.isAbnormal && item.filled
                            ? 'border-danger-300 text-danger-600 font-bold'
                            : 'border-gray-200'
                        }`}
                        placeholder="--"
                        value={itemValues[item.name] ?? ''}
                        onChange={(e) => handleValueChange(item.name, e.target.value)}
                      />
                    </td>
                    <td className="py-2 text-gray-500">{item.unit}</td>
                    <td className="py-2 text-gray-400 text-xs">{item.referenceRange}</td>
                    <td className="py-2">
                      {!item.filled ? (
                        <span className="text-gray-300 text-xs">未填</span>
                      ) : item.isAbnormal ? (
                        <span className="badge badge-danger text-[10px]">
                          {getDirectionLabel(item.direction)} 异常
                        </span>
                      ) : (
                        <span className="badge badge-success text-[10px]">正常</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary-500" />
              <span className="font-medium text-primary-700 text-sm">AI 初步解读</span>
              {allFilled && previewAbnormal.length > 0 && (
                <span className="badge badge-danger text-[10px]">{previewAbnormal.length} 项异常</span>
              )}
              {allFilled && previewAbnormal.length === 0 && (
                <span className="badge badge-success text-[10px]">全部正常</span>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${allFilled ? 'text-gray-700' : 'text-gray-400'}`}>
              {previewAiSummary}
            </p>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button onClick={resetCreate} className="btn-secondary">
              重置
            </button>
            <button
              onClick={handleCreate}
              disabled={!patientId || !allFilled || creating}
              className="btn-primary flex items-center gap-1.5"
            >
              {creating ? (
                <><Loader2 size={16} className="animate-spin" />生成中...</>
              ) : (
                <>保存为待审核报告</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reports.map((report) => {
          const isExpanded = expandedId === report.reportId
          const status = reviewStatus[report.reportId] || 'pending'
          const abnormalCount = report.abnormalItems.length
          const isNew = createdId === report.reportId

          return (
            <div
              key={report.reportId}
              className={`card p-0 overflow-hidden ${isNew ? 'ring-2 ring-primary-300 animate-pulse-slow' : ''}`}
            >
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
                    {isNew && (
                      <span className="ml-2 badge badge-primary text-[10px]">新建</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {abnormalCount > 0 && (
                    <span className="badge badge-danger">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {abnormalCount}项异常
                    </span>
                  )}
                  {status === 'approved' && <span className="badge badge-success">已签发</span>}
                  {status === 'rejected' && <span className="badge badge-danger">已退回</span>}
                  {status === 'pending' && <span className="badge badge-warning">待审核</span>}
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
                  {status === 'rejected' && (
                    <div className="flex items-center gap-2 text-danger-600 text-sm">
                      <XCircle className="w-4 h-4" />
                      <span className="font-medium">已退回，需重新审核</span>
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
