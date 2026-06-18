import { create } from 'zustand'
import type { LabReport } from '@/types'
import { mockLabReports } from '@/mock/data'

interface ReportState {
  reports: LabReport[]
  reviewStatus: Record<string, 'pending' | 'approved' | 'rejected'>
  addReport: (report: Omit<LabReport, 'abnormalItems'>) => string
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
  getPatientNotifications: (patientId: string) => typeof useReportsStore extends undefined ? never : ReportState['notifications']
}

function buildReportId() {
  const maxNum = Math.max(
    0,
    ...mockLabReports.map((r) => parseInt(r.reportId.replace('R', ''), 10) || 0)
  )
  return `R${String(maxNum + 1).padStart(3, '0')}`
}

const initialReviewStatus: Record<string, 'pending' | 'approved' | 'rejected'> = {}
mockLabReports.forEach((r) => {
  initialReviewStatus[r.reportId] = 'pending'
})

export const useReportsStore = create<ReportState>((set, get) => ({
  reports: [...mockLabReports],
  reviewStatus: initialReviewStatus,

  addReport: (partial) => {
    const reportId = buildReportId()
    const abnormalItems = partial.items.filter((i) => i.isAbnormal)
    const report: LabReport = {
      ...partial,
      reportId,
      abnormalItems,
    }
    set((s) => ({
      reports: [...s.reports, report],
      reviewStatus: { ...s.reviewStatus, [reportId]: 'pending' },
      notifications: [
        {
          id: `N${Date.now()}`,
          patientId: report.patientId,
          type: 'new_report',
          title: '新报告已出具',
          message: `您的${report.type}报告已审核通过，共检测${report.items.length}项，${abnormalItems.length > 0 ? `发现${abnormalItems.length}项异常` : '全部正常'}`,
          reportId,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ],
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
