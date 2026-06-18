export type UserRole = 'patient' | 'medical' | 'admin' | 'director'

export interface User {
  id: string
  name: string
  role: UserRole
  avatar?: string
}

export interface DoctorRecommendation {
  doctorId: string
  name: string
  department: string
  title: string
  rating: number
  queueLength: number
  estimatedWait: number
  availability: 'busy' | 'available' | 'idle'
  specialty: string
}

export interface RegistrationRequest {
  patientId: string
  symptoms: string
  medicalHistory: string[]
  insuranceCardNo: string
}

export interface QueueItem {
  queueNumber: number
  patientName: string
  department: string
  doctorName: string
  status: 'waiting' | 'called' | 'consulting' | 'done'
  estimatedWait: number
  priority: number
  patientId: string
}

export interface PrescriptionItem {
  drugId: string
  drugName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
}

export interface ConflictAlert {
  id: string
  type: 'drug_interaction' | 'allergy'
  severity: 'warning' | 'critical'
  message: string
  relatedDrugs: string[]
  suggestion: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  items: PrescriptionItem[]
  conflicts: ConflictAlert[]
  status: 'draft' | 'reviewing' | 'approved' | 'rejected'
  createdAt: string
}

export interface LabItem {
  name: string
  value: number
  unit: string
  referenceRange: string
  isAbnormal: boolean
  direction: 'high' | 'low' | 'normal'
}

export interface LabReport {
  reportId: string
  patientId: string
  patientName: string
  date: string
  type: string
  items: LabItem[]
  aiSummary: string
  abnormalItems: LabItem[]
}

export interface VitalSigns {
  patientId: string
  patientName: string
  bedNo: string
  heartRate: number
  bloodPressureSys: number
  bloodPressureDia: number
  oxygenLevel: number
  temperature: number
  timestamp: string
  isAbnormal: boolean
  alerts: VitalAlert[]
  heartRateHistory: { time: string; value: number }[]
  bpHistory: { time: string; sys: number; dia: number }[]
  oxygenHistory: { time: string; value: number }[]
  tempHistory: { time: string; value: number }[]
}

export interface VitalAlert {
  id: string
  type: 'heart_rate' | 'blood_pressure' | 'oxygen' | 'temperature'
  level: 'warning' | 'critical'
  message: string
  value: number
  threshold: number
  patientName: string
  bedNo: string
  timestamp: string
  acknowledged: boolean
}

export interface DispensingDrug {
  drugId: string
  drugName: string
  quantity: number
  barcode: string
  scanStatus: 'pending' | 'verified' | 'mismatch'
}

export interface DispensingTask {
  taskId: string
  prescriptionId: string
  patientId: string
  patientName: string
  drugs: DispensingDrug[]
  status: 'pending' | 'dispensing' | 'scanning' | 'completed'
  robotArmStatus: 'idle' | 'moving' | 'grabbing' | 'placing'
  progress: number
  createdAt: string
}

export interface BillingItem {
  category: '检查费' | '药费' | '床位费' | '手术费' | '护理费' | '其他'
  description: string
  amount: number
  insuranceCovered: boolean
  coverageRate: number
  insuranceAmount: number
  selfPayAmount: number
}

export interface SettlementBill {
  patientId: string
  patientName: string
  admissionDate: string
  dischargeDate: string
  totalAmount: number
  insuranceCovered: number
  selfPayAmount: number
  items: BillingItem[]
  status: 'pending' | 'paid'
  daysAdmitted: number
}

export interface DepartmentMetric {
  department: string
  outpatientCount: number
  bedTurnoverRate: number
  drugRatio: number
  satisfaction: number
  revenue: number
}

export interface DashboardMetrics {
  outpatientCount: number
  outpatientTrend: { date: string; value: number }[]
  bedTurnoverRate: number
  drugRatio: number
  patientSatisfaction: number
  totalBeds: number
  occupiedBeds: number
  departmentMetrics: DepartmentMetric[]
  recentAlerts: { type: string; message: string; time: string }[]
}
