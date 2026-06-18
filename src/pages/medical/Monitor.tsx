import { useEffect } from 'react'
import { useVitalSignsStore } from '@/store/useVitalSignsStore'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { Heart, Droplets, Thermometer, Activity, AlertTriangle, Bell, CheckCircle } from 'lucide-react'

export default function Monitor() {
  const { patients, alerts, acknowledgeAlert, refreshData } = useVitalSignsStore()
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged)

  useEffect(() => {
    const timer = setInterval(() => {
      refreshData()
    }, 5000)
    return () => clearInterval(timer)
  }, [refreshData])

  const isHrAbnormal = (hr: number) => hr > 100 || hr < 60
  const isBpAbnormal = (sys: number) => sys > 140
  const isO2Abnormal = (o2: number) => o2 < 95
  const isTempAbnormal = (t: number) => t > 37.3

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">住院监测</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          实时监测中 · 每5秒刷新
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            {patients.map((patient) => (
              <div
                key={patient.patientId}
                className={`card ${patient.isAbnormal ? 'border-danger-200 alert-pulse' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-semibold text-gray-900">{patient.patientName}</span>
                    <span className="ml-2 text-sm text-gray-500">{patient.bedNo}床</span>
                  </div>
                  {patient.isAbnormal && (
                    <span className="badge badge-danger">异常</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                    <Heart className={`w-3.5 h-3.5 ${isHrAbnormal(patient.heartRate) ? 'text-danger-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-[10px] text-gray-400">心率</p>
                      <p className={`text-sm font-mono font-bold ${isHrAbnormal(patient.heartRate) ? 'text-danger-500' : 'text-gray-900'}`}>
                        {patient.heartRate} <span className="text-[10px] font-normal text-gray-400">bpm</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                    <Activity className={`w-3.5 h-3.5 ${isBpAbnormal(patient.bloodPressureSys) ? 'text-danger-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-[10px] text-gray-400">血压</p>
                      <p className={`text-sm font-mono font-bold ${isBpAbnormal(patient.bloodPressureSys) ? 'text-danger-500' : 'text-gray-900'}`}>
                        {patient.bloodPressureSys}/{patient.bloodPressureDia}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                    <Droplets className={`w-3.5 h-3.5 ${isO2Abnormal(patient.oxygenLevel) ? 'text-danger-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-[10px] text-gray-400">血氧</p>
                      <p className={`text-sm font-mono font-bold ${isO2Abnormal(patient.oxygenLevel) ? 'text-danger-500' : 'text-gray-900'}`}>
                        {patient.oxygenLevel} <span className="text-[10px] font-normal text-gray-400">%</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1.5">
                    <Thermometer className={`w-3.5 h-3.5 ${isTempAbnormal(patient.temperature) ? 'text-danger-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-[10px] text-gray-400">体温</p>
                      <p className={`text-sm font-mono font-bold ${isTempAbnormal(patient.temperature) ? 'text-danger-500' : 'text-gray-900'}`}>
                        {patient.temperature} <span className="text-[10px] font-normal text-gray-400">°C</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patient.heartRateHistory}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={patient.isAbnormal ? '#FA5252' : '#0A6EBD'}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-danger-500" />
            <h2 className="font-semibold text-gray-900">预警通知</h2>
            {unacknowledgedAlerts.length > 0 && (
              <span className="badge badge-danger ml-auto">{unacknowledgedAlerts.length}</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {unacknowledgedAlerts.length === 0 ? (
              <p className="text-center text-gray-400 py-8">暂无未处理预警</p>
            ) : (
              unacknowledgedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-3 ${
                    alert.level === 'critical' ? 'border-danger-200 bg-danger-50/50' : 'border-amber-200 bg-amber-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className={`w-3.5 h-3.5 ${alert.level === 'critical' ? 'text-danger-500' : 'text-amber-500'}`} />
                    <span className={`badge ${alert.level === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                      {alert.level === 'critical' ? '严重' : '警告'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{alert.patientName} · {alert.bedNo}床</p>
                  <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium"
                  >
                    <CheckCircle className="w-3 h-3" />
                    确认
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
