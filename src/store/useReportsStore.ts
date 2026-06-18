import { create } from 'zustand'
import type { LabReport, LabItem } from '@/types'
import { mockLabReports } from '@/mock/data'

interface ReportState {
  reports: LabReport[]
  reviewStatus: Record<string, 'pending' | 'approved' | 'rejected'>
  createReport: (params: {
    patientId: string
    patientName: string
    type: string
    items: { name: string; value: number; unit: string; referenceRange: string }[]
  }) => string
  setReviewStatus: (reportId: string, status: 'approved' | 'rejected') => void
  notifications: {
    id: string
    patientId: string
    type: 'new_report'
    title: string
    message: string
    reportId: string
    createdAt: string
    read: boolean
  }[]
  markNotificationRead: (id: string) => void
  getPatientNotifications: (patientId: string) => ReportState['notifications']
}

function buildReportId(reports: LabReport[]) {
  const allIds = [...mockLabReports, ...reports].map((r) =>
    parseInt(r.reportId.replace('R', ''), 10) || 0
  )
  const maxNum = Math.max(0, ...allIds)
  return `R${String(maxNum + 1).padStart(3, '0')}`
}

function analyzeItem(item: {
  name: string
  value: number
  unit: string
  referenceRange: string
}): LabItem {
  const match = item.referenceRange.match(/([\d.]+)\s*-\s*([\d.]+)/)
  let isAbnormal = false
  let direction: 'high' | 'low' | 'normal' = 'normal'

  if (match) {
    const low = parseFloat(match[1])
    const high = parseFloat(match[2])
    if (item.value < low) {
      isAbnormal = true
      direction = 'low'
    } else if (item.value > high) {
      isAbnormal = true
      direction = 'high'
    }
  }

  return {
    name: item.name,
    value: item.value,
    unit: item.unit,
    referenceRange: item.referenceRange,
    isAbnormal,
    direction,
  }
}

function generateAiSummary(type: string, abnormalItems: LabItem[], totalCount: number): string {
  if (abnormalItems.length === 0) {
    return `本次${type}检查全部${totalCount}项指标均在正常范围内，整体状态良好，建议继续保持健康的生活方式，定期复查。`
  }

  const highItems = abnormalItems.filter((i) => i.direction === 'high')
  const lowItems = abnormalItems.filter((i) => i.direction === 'low')
  const parts: string[] = []

  if (highItems.length > 0) {
    const names = highItems.slice(0, 3).map((i) => i.name).join('、')
    parts.push(`${names}${highItems.length > 3 ? '等' : ''}指标偏高`)
  }
  if (lowItems.length > 0) {
    const names = lowItems.slice(0, 3).map((i) => i.name).join('、')
    parts.push(`${names}${lowItems.length > 3 ? '等' : ''}指标偏低`)
  }

  const suggestMap: Record<string, string> = {
    '血常规': '提示可能存在感染或血液系统异常，建议结合临床症状进一步评估，必要时复查。',
    '肝功能': '提示肝细胞可能存在一定程度损伤，建议排查药物、饮酒、病毒性肝炎等因素，注意休息。',
    '血脂检查': '提示存在血脂代谢异常，建议调整饮食结构，减少高脂高糖摄入，适度运动，必要时启动降脂治疗。',
    '肾功能': '提示肾功能可能存在异常，建议结合蛋白尿、水肿等临床表现进一步评估。',
    '血糖': '提示血糖代谢异常，建议复查空腹血糖及糖化血红蛋白，排除糖尿病可能。',
  }
  const suggestion = suggestMap[type] || '建议结合临床症状进一步评估，定期复查。'

  return `本次${type}检查共${totalCount}项，发现${abnormalItems.length}项异常：${parts.join('；')}。${suggestion}`
}

const initialReviewStatus: Record<string, 'pending' | 'approved' | 'rejected'> = {}
mockLabReports.forEach((r) => {
  initialReviewStatus[r.reportId] = 'pending'
})

export const reportTemplates: Record<string, { name: string; unit: string; referenceRange: string }[]> = {
  '血常规': [
    { name: '白细胞计数', unit: '×10⁹/L', referenceRange: '3.5-9.5' },
    { name: '红细胞计数', unit: '×10¹²/L', referenceRange: '4.3-5.8' },
    { name: '血红蛋白', unit: 'g/L', referenceRange: '130-175' },
    { name: '血小板计数', unit: '×10⁹/L', referenceRange: '125-350' },
    { name: '中性粒细胞%', unit: '%', referenceRange: '40-75' },
    { name: '淋巴细胞%', unit: '%', referenceRange: '20-50' },
  ],
  '肝功能': [
    { name: '谷丙转氨酶(ALT)', unit: 'U/L', referenceRange: '9-50' },
    { name: '谷草转氨酶(AST)', unit: 'U/L', referenceRange: '15-40' },
    { name: '总胆红素', unit: 'μmol/L', referenceRange: '5.1-28.0' },
    { name: '白蛋白', unit: 'g/L', referenceRange: '40-55' },
    { name: '碱性磷酸酶', unit: 'U/L', referenceRange: '45-125' },
  ],
  '血脂检查': [
    { name: '总胆固醇', unit: 'mmol/L', referenceRange: '2.8-5.7' },
    { name: '甘油三酯', unit: 'mmol/L', referenceRange: '0.56-1.70' },
    { name: '高密度脂蛋白', unit: 'mmol/L', referenceRange: '1.0-1.9' },
    { name: '低密度脂蛋白', unit: 'mmol/L', referenceRange: '1.5-3.4' },
  ],
  '肾功能': [
    { name: '肌酐', unit: 'μmol/L', referenceRange: '57-97' },
    { name: '尿素氮', unit: 'mmol/L', referenceRange: '2.9-8.2' },
    { name: '尿酸', unit: 'μmol/L', referenceRange: '208-428' },
    { name: '胱抑素C', unit: 'mg/L', referenceRange: '0.59-1.03' },
  ],
  '血糖': [
    { name: '空腹血糖', unit: 'mmol/L', referenceRange: '3.9-6.1' },
    { name: '糖化血红蛋白', unit: '%', referenceRange: '4.0-6.0' },
  ],
}

export const useReportsStore = create<ReportState>((set, get) => ({
  reports: [...mockLabReports],
  reviewStatus: initialReviewStatus,

  createReport: ({ patientId, patientName, type, items }) => {
    const analyzedItems = items.map(analyzeItem)
    const abnormalItems = analyzedItems.filter((i) => i.isAbnormal)
    const aiSummary = generateAiSummary(type, abnormalItems, analyzedItems.length)
    const reportId = buildReportId(get().reports)
    const report: LabReport = {
      reportId,
      patientId,
      patientName,
      date: new Date().toISOString().slice(0, 10),
      type,
      items: analyzedItems,
      abnormalItems,
      aiSummary,
    }
    set((s) => ({
      reports: [...s.reports, report],
      reviewStatus: { ...s.reviewStatus, [reportId]: 'pending' },
    }))
    return reportId
  },

  setReviewStatus: (reportId, status) => {
    set((s) => {
      const next: ReportState = {
        ...s,
        reviewStatus: { ...s.reviewStatus, [reportId]: status },
      }
      if (status === 'approved') {
        const report = s.reports.find((r) => r.reportId === reportId)
        if (report) {
          next.notifications = [
            {
              id: `N${Date.now()}-${reportId}`,
              patientId: report.patientId,
              type: 'new_report',
              title: '新报告已出具',
              message: `您的${report.type}报告已审核通过，共检测${report.items.length}项，${report.abnormalItems.length > 0 ? `发现${report.abnormalItems.length}项异常` : '全部正常'}`,
              reportId,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ]
        }
      }
      return next
    })
  },

  notifications: [],

  markNotificationRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  },

  getPatientNotifications: (patientId) => get().notifications.filter((n) => n.patientId === patientId),
}))
