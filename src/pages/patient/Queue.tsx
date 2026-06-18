import { useEffect, useMemo } from 'react'
import { useQueueStore } from '@/store/useQueueStore'
import { useAuthStore } from '@/store/useAuthStore'
import {
  Volume2,
  Clock,
  Users,
  RefreshCw,
  Pin,
  Stethoscope,
  ChevronRight,
} from 'lucide-react'

const statusLabel: Record<string, string> = {
  waiting: '等候中',
  called: '叫号中',
  consulting: '就诊中',
  done: '已完成',
}

const statusBadge: Record<string, string> = {
  waiting: 'badge-warning',
  called: 'badge-danger',
  consulting: 'badge-primary',
  done: 'badge-success',
}

export default function Queue() {
  const {
    items,
    getLatestRegistrationForPatient,
    registrations,
    getDoctors,
    getCurrentForDoctor,
    getDoctorQueue,
  } = useQueueStore()
  const user = useAuthStore((s) => s.user)

  const myItem = useMemo(() => {
    if (!user) return null
    return getLatestRegistrationForPatient(user.id)
  }, [user?.id, items, registrations, getLatestRegistrationForPatient])

  const doctors = useMemo(() => getDoctors(), [items])

  const myPosition = useMemo(() => {
    if (!myItem || myItem.status !== 'waiting') return null
    const doctorQueue = getDoctorQueue(myItem.doctorName)
    const waitingItems = doctorQueue.filter((i) => i.status === 'waiting')
    return waitingItems.findIndex((i) => i.queueNumber === myItem.queueNumber) + 1
  }, [myItem, items])

  const myDoctorCurrent = useMemo(() => {
    if (!myItem) return null
    return getCurrentForDoctor(myItem.doctorName)
  }, [myItem, items])

  useEffect(() => {
    const timer = setInterval(() => {
      useQueueStore.getState()
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="max-w-4xl space-y-6">
      {myItem && (
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope size={18} className="text-primary-200" />
            <span className="text-sm text-primary-100">我的就诊 · {myItem.department}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-primary-200 mb-1">当前叫号</div>
              <div className="text-3xl font-bold font-mono">
                {myDoctorCurrent ? myDoctorCurrent.queueNumber : '--'}
              </div>
              <div className="text-xs text-primary-200 mt-1">
                {myDoctorCurrent ? statusLabel[myDoctorCurrent.status] : '暂无'}
              </div>
            </div>
            <div className="text-center border-x border-primary-400/30">
              <div className="text-sm text-primary-200 mb-1">我的排队号</div>
              <div className="text-3xl font-bold font-mono">
                {myItem.queueNumber}
              </div>
              <div className="text-xs text-primary-200 mt-1">
                {myItem.status === 'waiting' && `前面还有 ${(myPosition ?? 1) - 1} 位`}
                {myItem.status === 'consulting' && '就诊中'}
                {myItem.status === 'called' && '正在叫号'}
                {myItem.status === 'done' && '已完成'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-primary-200 mb-1">预计等候</div>
              <div className="text-3xl font-bold font-mono">
                {myItem.estimatedWait > 0 ? `${myItem.estimatedWait}` : '0'}
                <span className="text-lg font-normal ml-0.5">分钟</span>
              </div>
              <div className="text-xs text-primary-200 mt-1">{myItem.doctorName}医生</div>
            </div>
          </div>
          {myItem.status === 'called' && (
            <div className="mt-4 bg-white/20 backdrop-blur rounded-lg p-3 text-center animate-pulse-slow">
              <Volume2 size={18} className="inline mr-2" />
              <span className="font-semibold">请 {myItem.patientName} 请到 {myItem.doctorName} 医生诊室就诊！</span>
            </div>
          )}
        </div>
      )}

      {!myItem && (
        <div className="card text-center py-10">
          <Users size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 mb-1">暂无挂号记录</p>
          <p className="text-xs text-gray-300">完成挂号后，这里会显示您的候诊信息</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <Stethoscope size={18} className="text-primary-500" />
          各诊室候诊情况
        </h2>
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-gray-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-xs text-gray-400">自动刷新</span>
        </div>
      </div>

      <div className="space-y-4">
        {doctors.map((doc) => {
          const queue = getDoctorQueue(doc.doctorName)
          const isMyDoctor = myItem?.doctorName === doc.doctorName
          const currentDoc = getCurrentForDoctor(doc.doctorName)

          return (
            <div
              key={doc.doctorName}
              className={`card overflow-hidden ${isMyDoctor ? 'ring-2 ring-primary-300' : ''}`}
            >
              <div className={`px-5 py-3 border-b border-gray-100 flex items-center justify-between ${isMyDoctor ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-primary-600`}>
                    {doc.doctorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {doc.doctorName}
                      {isMyDoctor && (
                        <span className="px-1.5 py-0.5 rounded bg-primary-500 text-white text-[10px] font-medium">
                          <Pin size={9} className="inline mr-0.5" />我的医生
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{doc.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">当前叫号</div>
                    <div className="font-mono font-bold text-primary-600">
                      {currentDoc ? currentDoc.queueNumber : '--'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">等待中</div>
                    <div className="font-mono font-bold text-amber-600">{doc.waitingCount}人</div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3">
                {queue.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">暂无患者</p>
                ) : (
                  <div className="space-y-1">
                    {queue.map((item) => {
                      const isMine = item.patientId === user?.id && item.queueNumber === myItem?.queueNumber
                      let rowClass = 'flex items-center justify-between py-2 px-3 rounded-lg '
                      if (isMine) rowClass += 'bg-primary-100 '
                      if (item.status === 'called') rowClass += 'bg-danger-50 '
                      if (item.status === 'consulting') rowClass += 'bg-primary-50 '
                      return (
                        <div key={item.queueNumber} className={rowClass.trim()}>
                          <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold w-14 ${item.status === 'waiting' ? 'text-gray-600' : 'text-primary-600'}`}>
                              {item.queueNumber}
                            </span>
                            <span className="text-sm text-gray-700">
                              {isMine ? '我' : item.patientName}
                            </span>
                            {isMine && <Pin size={12} className="text-primary-500" />}
                          </div>
                          <div className="flex items-center gap-3">
                            {item.status === 'waiting' && (
                              <span className="text-xs text-gray-400">
                                约 {item.estimatedWait} 分钟
                              </span>
                            )}
                            <span className={`badge ${statusBadge[item.status]} text-[10px]`}>
                              {statusLabel[item.status]}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
