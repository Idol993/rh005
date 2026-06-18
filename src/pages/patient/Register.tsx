import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Upload, Shield, Star, CheckCircle, ChevronRight, ChevronLeft, FileUp, X, Loader2, Stethoscope } from 'lucide-react'
import { symptomKeywords, mockDoctors } from '@/mock/data'
import type { DoctorRecommendation } from '@/types'
import { useQueueStore } from '@/store/useQueueStore'
import { useAuthStore } from '@/store/useAuthStore'

const steps = ['症状描述', '病史上传', '医保绑定', '推荐医生']

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { followUp?: { suggestedDepartment: string; recheckWithin: string; focusItems: string[]; reportType: string } } }
  const user = useAuthStore((s) => s.user)
  const addRegistration = useQueueStore((s) => s.addRegistration)
  const [step, setStep] = useState(0)
  const [symptoms, setSymptoms] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [recommendedDepts, setRecommendedDepts] = useState<string[]>([])
  const [files, setFiles] = useState<{ name: string; size: string }[]>([])
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrRunning, setOcrRunning] = useState(false)
  const [insuranceNo, setInsuranceNo] = useState('')
  const [insuranceError, setInsuranceError] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecommendation | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [assignedQueueNumber, setAssignedQueueNumber] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const followUp = location.state?.followUp

  useEffect(() => {
    if (followUp?.suggestedDepartment) {
      setRecommendedDepts([followUp.suggestedDepartment])
      setSymptoms(`复查${followUp.reportType}，重点关注：${followUp.focusItems.join('、')}`)
      setStep(3)
    }
  }, [followUp])

  const handleAnalyze = () => {
    if (!symptoms.trim()) return
    setAnalyzing(true)
    setTimeout(() => {
      const matched: string[] = []
      for (const [dept, keywords] of Object.entries(symptomKeywords)) {
        if (keywords.some((k) => symptoms.includes(k))) {
          matched.push(dept)
        }
      }
      setRecommendedDepts(matched.length > 0 ? matched : ['全科'])
      setAnalyzing(false)
    }, 1500)
  }

  const handleFileAdd = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFiles((prev) => [...prev, { name: f.name, size: `${(f.size / 1024).toFixed(1)}KB` }])
    setOcrRunning(true)
    setOcrProgress(0)
    const interval = setInterval(() => {
      setOcrProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setOcrRunning(false)
          return 100
        }
        return p + 10
      })
    }, 200)
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const validateInsurance = () => {
    if (!/^\d{16,20}$/.test(insuranceNo)) {
      setInsuranceError('请输入16-20位数字的医保卡号')
      return false
    }
    setInsuranceError('')
    return true
  }

  const handleNext = () => {
    if (step === 2 && !validateInsurance()) return
    setStep((s) => Math.min(s + 1, 3))
  }

  const handleSelectDoctor = (doc: DoctorRecommendation) => {
    if (!user) return
    const qn = addRegistration({
      patientId: user.id,
      patientName: user.name,
      department: doc.department,
      doctorName: doc.name,
      estimatedWait: doc.estimatedWait,
    })
    setSelectedDoctor(doc)
    setAssignedQueueNumber(qn)
    setConfirmed(true)
  }

  const availColor = (a: string) => {
    if (a === 'idle') return 'bg-success-500'
    if (a === 'available') return 'bg-amber-400'
    return 'bg-danger-500'
  }

  const availLabel = (a: string) => {
    if (a === 'idle') return '空闲'
    if (a === 'available') return '接诊中'
    return '繁忙'
  }

  const filteredDoctors = recommendedDepts.length > 0
    ? mockDoctors.filter((d) => recommendedDepts.includes(d.department))
    : mockDoctors

  if (confirmed && selectedDoctor) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="card">
          <CheckCircle size={56} className="text-success-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">挂号成功</h2>
          <p className="text-gray-500 mb-6">您的排队号已生成，请按时就诊</p>
          <div className="bg-primary-50 rounded-xl py-6 mb-6">
            <div className="text-sm text-primary-600 mb-1">您的排队号</div>
            <div className="text-4xl font-bold font-mono text-primary-500">{assignedQueueNumber}</div>
          </div>
          <div className="text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span className="text-gray-500">科室</span><span className="font-medium">{selectedDoctor.department}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">医生</span><span className="font-medium">{selectedDoctor.name} · {selectedDoctor.title}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">擅长</span><span className="font-medium text-right max-w-[60%]">{selectedDoctor.specialty}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/patient/queue')} className="btn-primary flex-1">查看排队</button>
            <button onClick={() => navigate('/patient')} className="btn-secondary flex-1">返回首页</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${i <= step ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">请描述您的症状</h2>
          <textarea
            className="input-field min-h-[120px] resize-none"
            placeholder="例如：胸闷、心悸、头晕..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={!symptoms.trim() || analyzing}
            className="btn-primary mt-4 flex items-center gap-2"
          >
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {analyzing ? 'AI 分析中...' : 'AI 智能分析'}
          </button>
          {recommendedDepts.length > 0 && (
            <div className="mt-4 p-4 bg-primary-50 rounded-xl">
              <div className="text-sm font-medium text-primary-700 mb-2">AI 推荐科室</div>
              <div className="flex flex-wrap gap-2">
                {recommendedDepts.map((d) => (
                  <span key={d} className="badge badge-primary">{d}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">上传病史资料</h2>
          <div
            onClick={handleFileAdd}
            className="border-2 border-dashed border-gray-200 hover:border-primary-300 rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            <FileUp size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-gray-400 mt-1">支持图片、PDF格式</p>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700">{f.name}<span className="text-gray-400 ml-2">{f.size}</span></div>
                  <button onClick={() => removeFile(i)}><X size={14} className="text-gray-400" /></button>
                </div>
              ))}
            </div>
          )}
          {ocrRunning && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>OCR 识别中...</span><span>{ocrProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">医保卡绑定</h2>
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl mb-4">
            <Shield size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">请输入您的医保卡号，绑定后可享受医保结算</p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">医保卡号</label>
          <input
            className={`input-field ${insuranceError ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''}`}
            placeholder="请输入16-20位医保卡号"
            value={insuranceNo}
            onChange={(e) => { setInsuranceNo(e.target.value); setInsuranceError('') }}
          />
          {insuranceError && <p className="text-xs text-danger-500 mt-1">{insuranceError}</p>}
        </div>
      )}

      {step === 3 && (
        <div className="card">
          {followUp && (
            <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
              <div className="flex items-start gap-2">
                <Stethoscope size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-primary-700">复诊挂号 · {followUp.reportType}复查</div>
                  <div className="text-primary-600 mt-0.5">
                    建议科室：{followUp.suggestedDepartment} · {followUp.recheckWithin}复查
                  </div>
                  <div className="text-primary-500 text-xs mt-0.5">
                    重点关注：{followUp.focusItems.join('、')}
                  </div>
                </div>
              </div>
            </div>
          )}
          <h2 className="font-semibold text-gray-800 mb-4">为您推荐以下医生</h2>
          <div className="space-y-3">
            {filteredDoctors.map((doc) => (
              <div key={doc.doctorId} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">{doc.name}</span>
                    <span className="badge badge-primary">{doc.department}</span>
                    <span className="text-xs text-gray-400">{doc.title}</span>
                    <span className={`w-2 h-2 rounded-full ${availColor(doc.availability)}`} title={availLabel(doc.availability)} />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">擅长：{doc.specialty}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-400" />{doc.rating}</span>
                    <span>排队 {doc.queueLength} 人</span>
                    <span>约 {doc.estimatedWait} 分钟</span>
                  </div>
                </div>
                <button onClick={() => handleSelectDoctor(doc)} className="btn-primary text-sm">选择</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          className={`btn-secondary flex items-center gap-1 ${step === 0 ? 'invisible' : ''}`}
        >
          <ChevronLeft size={16} />上一步
        </button>
        {step < 3 && (
          <button onClick={handleNext} className="btn-primary flex items-center gap-1">
            下一步<ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
