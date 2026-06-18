import type {
  DoctorRecommendation,
  QueueItem,
  PrescriptionItem,
  ConflictAlert,
  LabReport,
  LabItem,
  VitalSigns,
  VitalAlert,
  DispensingTask,
  SettlementBill,
  BillingItem,
  DashboardMetrics,
  DepartmentMetric,
  User,
} from '@/types'

export const mockUsers: User[] = [
  { id: 'P001', name: '张三', role: 'patient' },
  { id: 'P002', name: '李四', role: 'patient' },
  { id: 'M001', name: '王医生', role: 'medical' },
  { id: 'M002', name: '陈护士', role: 'medical' },
  { id: 'A001', name: '赵管理员', role: 'admin' },
  { id: 'D001', name: '刘院长', role: 'director' },
]

export const mockDoctors: DoctorRecommendation[] = [
  { doctorId: 'D001', name: '王建国', department: '心内科', title: '主任医师', rating: 4.9, queueLength: 3, estimatedWait: 25, availability: 'available', specialty: '冠心病、高血压' },
  { doctorId: 'D002', name: '李明华', department: '心内科', title: '副主任医师', rating: 4.7, queueLength: 1, estimatedWait: 10, availability: 'idle', specialty: '心律失常、心肌病' },
  { doctorId: 'D003', name: '张秀芳', department: '呼吸科', title: '主任医师', rating: 4.8, queueLength: 8, estimatedWait: 60, availability: 'busy', specialty: '哮喘、慢阻肺' },
  { doctorId: 'D004', name: '陈伟民', department: '消化科', title: '副主任医师', rating: 4.6, queueLength: 2, estimatedWait: 15, availability: 'available', specialty: '胃炎、肝病' },
  { doctorId: 'D005', name: '刘晓红', department: '神经内科', title: '主任医师', rating: 4.9, queueLength: 5, estimatedWait: 40, availability: 'busy', specialty: '头痛、癫痫' },
  { doctorId: 'D006', name: '赵德才', department: '骨科', title: '副主任医师', rating: 4.5, queueLength: 0, estimatedWait: 5, availability: 'idle', specialty: '关节损伤、骨折' },
  { doctorId: 'D007', name: '孙丽娟', department: '内分泌科', title: '主治医师', rating: 4.4, queueLength: 4, estimatedWait: 30, availability: 'available', specialty: '糖尿病、甲状腺' },
  { doctorId: 'D008', name: '周志强', department: '呼吸科', title: '主治医师', rating: 4.3, queueLength: 2, estimatedWait: 15, availability: 'available', specialty: '肺炎、支气管炎' },
  { doctorId: 'D009', name: '吴慧敏', department: '消化科', title: '主任医师', rating: 4.8, queueLength: 6, estimatedWait: 45, availability: 'busy', specialty: '胃溃疡、肠炎' },
  { doctorId: 'D010', name: '郑国安', department: '骨科', title: '主任医师', rating: 4.7, queueLength: 3, estimatedWait: 20, availability: 'available', specialty: '脊柱疾病、运动损伤' },
]

export const mockQueueItems: QueueItem[] = [
  { queueNumber: 101, patientName: '张三', department: '心内科', doctorName: '王建国', status: 'consulting', estimatedWait: 0, priority: 1, patientId: 'P001' },
  { queueNumber: 102, patientName: '李四', department: '心内科', doctorName: '王建国', status: 'waiting', estimatedWait: 15, priority: 2, patientId: 'P002' },
  { queueNumber: 103, patientName: '王五', department: '呼吸科', doctorName: '张秀芳', status: 'waiting', estimatedWait: 30, priority: 3, patientId: 'P003' },
  { queueNumber: 104, patientName: '赵六', department: '消化科', doctorName: '陈伟民', status: 'called', estimatedWait: 0, priority: 1, patientId: 'P004' },
  { queueNumber: 105, patientName: '钱七', department: '神经内科', doctorName: '刘晓红', status: 'waiting', estimatedWait: 45, priority: 4, patientId: 'P005' },
  { queueNumber: 106, patientName: '孙八', department: '骨科', doctorName: '赵德才', status: 'waiting', estimatedWait: 5, priority: 1, patientId: 'P006' },
  { queueNumber: 107, patientName: '周九', department: '内分泌科', doctorName: '孙丽娟', status: 'waiting', estimatedWait: 20, priority: 2, patientId: 'P007' },
]

export const mockDrugs: { id: string; name: string; category: string; interactions: string[] }[] = [
  { id: 'DR001', name: '阿司匹林', category: '解热镇痛', interactions: ['DR005', 'DR008'] },
  { id: 'DR002', name: '布洛芬', category: '解热镇痛', interactions: ['DR001', 'DR005'] },
  { id: 'DR003', name: '阿莫西林', category: '抗生素', interactions: ['DR010'] },
  { id: 'DR004', name: '头孢克洛', category: '抗生素', interactions: ['DR010'] },
  { id: 'DR005', name: '华法林', category: '抗凝血', interactions: ['DR001', 'DR002', 'DR008'] },
  { id: 'DR006', name: '硝苯地平', category: '降压药', interactions: ['DR012'] },
  { id: 'DR007', name: '二甲双胍', category: '降糖药', interactions: ['DR015'] },
  { id: 'DR008', name: '氯吡格雷', category: '抗血小板', interactions: ['DR001', 'DR005'] },
  { id: 'DR009', name: '奥美拉唑', category: '胃药', interactions: ['DR004'] },
  { id: 'DR010', name: '甲氨蝶呤', category: '免疫抑制剂', interactions: ['DR003', 'DR004'] },
  { id: 'DR011', name: '辛伐他汀', category: '降脂药', interactions: ['DR013'] },
  { id: 'DR012', name: '美托洛尔', category: '降压药', interactions: ['DR006'] },
  { id: 'DR013', name: '红霉素', category: '抗生素', interactions: ['DR011'] },
  { id: 'DR014', name: '氨氯地平', category: '降压药', interactions: [] },
  { id: 'DR015', name: '胰岛素', category: '降糖药', interactions: ['DR007'] },
]

export const mockPrescriptionItems: PrescriptionItem[] = [
  { drugId: 'DR001', drugName: '阿司匹林', dosage: '100mg', frequency: '每日1次', duration: '30天', quantity: 30 },
  { drugId: 'DR005', drugName: '华法林', dosage: '2.5mg', frequency: '每日1次', duration: '30天', quantity: 30 },
  { drugId: 'DR006', drugName: '硝苯地平', dosage: '30mg', frequency: '每日1次', duration: '30天', quantity: 30 },
]

export const mockConflictAlerts: ConflictAlert[] = [
  {
    id: 'C001',
    type: 'drug_interaction',
    severity: 'critical',
    message: '阿司匹林与华法林联用显著增加出血风险',
    relatedDrugs: ['阿司匹林', '华法林'],
    suggestion: '建议停用阿司匹林，或替换为氯吡格雷；如必须联用，需密切监测INR值',
  },
  {
    id: 'C002',
    type: 'allergy',
    severity: 'warning',
    message: '患者对青霉素类过敏，阿莫西林属青霉素类',
    relatedDrugs: ['阿莫西林'],
    suggestion: '建议更换为头孢类或其他非青霉素类抗生素',
  },
]

export const mockLabReports: LabReport[] = [
  {
    reportId: 'R001',
    patientId: 'P001',
    patientName: '张三',
    date: '2026-06-18',
    type: '血常规',
    items: [
      { name: '白细胞计数', value: 11.5, unit: '×10⁹/L', referenceRange: '3.5-9.5', isAbnormal: true, direction: 'high' },
      { name: '红细胞计数', value: 4.8, unit: '×10¹²/L', referenceRange: '4.3-5.8', isAbnormal: false, direction: 'normal' },
      { name: '血红蛋白', value: 145, unit: 'g/L', referenceRange: '130-175', isAbnormal: false, direction: 'normal' },
      { name: '血小板计数', value: 210, unit: '×10⁹/L', referenceRange: '125-350', isAbnormal: false, direction: 'normal' },
      { name: '中性粒细胞%', value: 82.3, unit: '%', referenceRange: '40-75', isAbnormal: true, direction: 'high' },
      { name: '淋巴细胞%', value: 12.1, unit: '%', referenceRange: '20-50', isAbnormal: true, direction: 'low' },
    ],
    aiSummary: '白细胞计数及中性粒细胞比例偏高，淋巴细胞比例偏低，提示可能存在细菌感染或炎症反应，建议结合临床症状进一步评估。',
    abnormalItems: [],
  },
  {
    reportId: 'R002',
    patientId: 'P001',
    patientName: '张三',
    date: '2026-06-17',
    type: '肝功能',
    items: [
      { name: '谷丙转氨酶(ALT)', value: 68, unit: 'U/L', referenceRange: '9-50', isAbnormal: true, direction: 'high' },
      { name: '谷草转氨酶(AST)', value: 45, unit: 'U/L', referenceRange: '15-40', isAbnormal: true, direction: 'high' },
      { name: '总胆红素', value: 18.2, unit: 'μmol/L', referenceRange: '5.1-28.0', isAbnormal: false, direction: 'normal' },
      { name: '白蛋白', value: 42, unit: 'g/L', referenceRange: '40-55', isAbnormal: false, direction: 'normal' },
      { name: '碱性磷酸酶', value: 95, unit: 'U/L', referenceRange: '45-125', isAbnormal: false, direction: 'normal' },
    ],
    aiSummary: '转氨酶轻度升高，提示肝细胞损伤可能，建议排除药物性肝损伤及病毒性肝炎，注意近期用药史。',
    abnormalItems: [],
  },
  {
    reportId: 'R003',
    patientId: 'P002',
    patientName: '李四',
    date: '2026-06-18',
    type: '血脂检查',
    items: [
      { name: '总胆固醇', value: 6.8, unit: 'mmol/L', referenceRange: '2.8-5.7', isAbnormal: true, direction: 'high' },
      { name: '甘油三酯', value: 2.4, unit: 'mmol/L', referenceRange: '0.56-1.70', isAbnormal: true, direction: 'high' },
      { name: '高密度脂蛋白', value: 0.9, unit: 'mmol/L', referenceRange: '1.0-1.9', isAbnormal: true, direction: 'low' },
      { name: '低密度脂蛋白', value: 4.2, unit: 'mmol/L', referenceRange: '1.5-3.4', isAbnormal: true, direction: 'high' },
    ],
    aiSummary: '血脂全面异常，总胆固醇、甘油三酯及低密度脂蛋白均偏高，高密度脂蛋白偏低，存在高脂血症，建议启动降脂治疗并调整饮食。',
    abnormalItems: [],
  },
]

mockLabReports.forEach((r) => {
  r.abnormalItems = r.items.filter((i) => i.isAbnormal)
})

function generateVitalHistory(baseValue: number, variance: number, count: number) {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(now - (count - i) * 300000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    value: Math.round((baseValue + (Math.random() - 0.5) * variance) * 10) / 10,
  }))
}

function generateBPHistory(baseSys: number, baseDia: number, count: number) {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(now - (count - i) * 300000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    sys: Math.round(baseSys + (Math.random() - 0.5) * 20),
    dia: Math.round(baseDia + (Math.random() - 0.5) * 10),
  }))
}

export const mockVitalSigns: VitalSigns[] = [
  {
    patientId: 'P001', patientName: '张三', bedNo: 'A-301',
    heartRate: 78, bloodPressureSys: 135, bloodPressureDia: 85,
    oxygenLevel: 97, temperature: 36.8,
    timestamp: new Date().toISOString(),
    isAbnormal: false,
    alerts: [],
    heartRateHistory: generateVitalHistory(78, 10, 20),
    bpHistory: generateBPHistory(135, 85, 20),
    oxygenHistory: generateVitalHistory(97, 3, 20),
    tempHistory: generateVitalHistory(36.8, 0.5, 20),
  },
  {
    patientId: 'P008', patientName: '陈大明', bedNo: 'A-305',
    heartRate: 132, bloodPressureSys: 168, bloodPressureDia: 98,
    oxygenLevel: 91, temperature: 38.5,
    timestamp: new Date().toISOString(),
    isAbnormal: true,
    alerts: [
      { id: 'VA001', type: 'heart_rate', level: 'critical', message: '心率骤升至132次/分', value: 132, threshold: 120, patientName: '陈大明', bedNo: 'A-305', timestamp: new Date().toISOString(), acknowledged: false },
      { id: 'VA002', type: 'blood_pressure', level: 'warning', message: '血压偏高: 168/98mmHg', value: 168, threshold: 140, patientName: '陈大明', bedNo: 'A-305', timestamp: new Date().toISOString(), acknowledged: false },
      { id: 'VA003', type: 'oxygen', level: 'warning', message: '血氧饱和度偏低: 91%', value: 91, threshold: 93, patientName: '陈大明', bedNo: 'A-305', timestamp: new Date().toISOString(), acknowledged: false },
    ],
    heartRateHistory: generateVitalHistory(110, 40, 20),
    bpHistory: generateBPHistory(155, 95, 20),
    oxygenHistory: generateVitalHistory(93, 6, 20),
    tempHistory: generateVitalHistory(38.2, 1, 20),
  },
  {
    patientId: 'P009', patientName: '何小兰', bedNo: 'B-201',
    heartRate: 65, bloodPressureSys: 122, bloodPressureDia: 78,
    oxygenLevel: 98, temperature: 36.5,
    timestamp: new Date().toISOString(),
    isAbnormal: false,
    alerts: [],
    heartRateHistory: generateVitalHistory(65, 8, 20),
    bpHistory: generateBPHistory(122, 78, 20),
    oxygenHistory: generateVitalHistory(98, 2, 20),
    tempHistory: generateVitalHistory(36.5, 0.3, 20),
  },
  {
    patientId: 'P010', patientName: '方建国', bedNo: 'B-204',
    heartRate: 88, bloodPressureSys: 145, bloodPressureDia: 92,
    oxygenLevel: 95, temperature: 37.2,
    timestamp: new Date().toISOString(),
    isAbnormal: true,
    alerts: [
      { id: 'VA004', type: 'blood_pressure', level: 'warning', message: '血压偏高: 145/92mmHg', value: 145, threshold: 140, patientName: '方建国', bedNo: 'B-204', timestamp: new Date().toISOString(), acknowledged: false },
    ],
    heartRateHistory: generateVitalHistory(88, 12, 20),
    bpHistory: generateBPHistory(140, 90, 20),
    oxygenHistory: generateVitalHistory(95, 3, 20),
    tempHistory: generateVitalHistory(37.0, 0.8, 20),
  },
]

export const mockDispensingTasks: DispensingTask[] = [
  {
    taskId: 'DT001', prescriptionId: 'PX001', patientName: '张三',
    drugs: [
      { drugId: 'DR001', drugName: '阿司匹林', quantity: 30, barcode: '6901234567001', scanStatus: 'verified' },
      { drugId: 'DR006', drugName: '硝苯地平', quantity: 30, barcode: '6901234567002', scanStatus: 'verified' },
    ],
    status: 'completed', robotArmStatus: 'idle', progress: 100, createdAt: '2026-06-18 09:30',
  },
  {
    taskId: 'DT002', prescriptionId: 'PX002', patientName: '李四',
    drugs: [
      { drugId: 'DR007', drugName: '二甲双胍', quantity: 60, barcode: '6901234567003', scanStatus: 'verified' },
      { drugId: 'DR011', drugName: '辛伐他汀', quantity: 30, barcode: '6901234567004', scanStatus: 'pending' },
    ],
    status: 'scanning', robotArmStatus: 'placing', progress: 75, createdAt: '2026-06-18 10:15',
  },
  {
    taskId: 'DT003', prescriptionId: 'PX003', patientName: '王五',
    drugs: [
      { drugId: 'DR003', drugName: '阿莫西林', quantity: 21, barcode: '6901234567005', scanStatus: 'pending' },
      { drugId: 'DR009', drugName: '奥美拉唑', quantity: 14, barcode: '6901234567006', scanStatus: 'pending' },
    ],
    status: 'dispensing', robotArmStatus: 'grabbing', progress: 40, createdAt: '2026-06-18 10:45',
  },
  {
    taskId: 'DT004', prescriptionId: 'PX004', patientName: '赵六',
    drugs: [
      { drugId: 'DR014', drugName: '氨氯地平', quantity: 30, barcode: '6901234567007', scanStatus: 'pending' },
      { drugId: 'DR012', drugName: '美托洛尔', quantity: 30, barcode: '6901234567008', scanStatus: 'pending' },
    ],
    status: 'pending', robotArmStatus: 'idle', progress: 0, createdAt: '2026-06-18 11:00',
  },
]

export const mockSettlementBills: SettlementBill[] = [
  {
    patientId: 'P001', patientName: '张三',
    admissionDate: '2026-06-01', dischargeDate: '2026-06-18',
    totalAmount: 28560, insuranceCovered: 19992, selfPayAmount: 8568,
    daysAdmitted: 17,
    status: 'pending',
    items: [
      { category: '床位费', description: '普通病房17天', amount: 3400, insuranceCovered: true, coverageRate: 0.8, insuranceAmount: 2720, selfPayAmount: 680 },
      { category: '药费', description: '住院期间用药', amount: 8600, insuranceCovered: true, coverageRate: 0.7, insuranceAmount: 6020, selfPayAmount: 2580 },
      { category: '检查费', description: '血常规/肝功能/心电图', amount: 4200, insuranceCovered: true, coverageRate: 0.75, insuranceAmount: 3150, selfPayAmount: 1050 },
      { category: '手术费', description: '冠脉造影术', amount: 9800, insuranceCovered: true, coverageRate: 0.7, insuranceAmount: 6860, selfPayAmount: 2940 },
      { category: '护理费', description: '一级护理17天', amount: 2040, insuranceCovered: true, coverageRate: 0.6, insuranceAmount: 1224, selfPayAmount: 816 },
      { category: '其他', description: '材料费/诊疗费', amount: 520, insuranceCovered: false, coverageRate: 0, insuranceAmount: 0, selfPayAmount: 520 },
    ],
  },
  {
    patientId: 'P008', patientName: '陈大明',
    admissionDate: '2026-06-10', dischargeDate: '2026-06-18',
    totalAmount: 15200, insuranceCovered: 9960, selfPayAmount: 5240,
    daysAdmitted: 8,
    status: 'paid',
    items: [
      { category: '床位费', description: '普通病房8天', amount: 1600, insuranceCovered: true, coverageRate: 0.8, insuranceAmount: 1280, selfPayAmount: 320 },
      { category: '药费', description: '住院期间用药', amount: 5400, insuranceCovered: true, coverageRate: 0.7, insuranceAmount: 3780, selfPayAmount: 1620 },
      { category: '检查费', description: 'CT/血常规', amount: 3800, insuranceCovered: true, coverageRate: 0.75, insuranceAmount: 2850, selfPayAmount: 950 },
      { category: '护理费', description: '二级护理8天', amount: 960, insuranceCovered: true, coverageRate: 0.6, insuranceAmount: 576, selfPayAmount: 384 },
      { category: '其他', description: '材料费/诊疗费', amount: 3440, insuranceCovered: false, coverageRate: 0, insuranceAmount: 0, selfPayAmount: 3440 },
    ],
  },
]

const departmentMetrics: DepartmentMetric[] = [
  { department: '心内科', outpatientCount: 186, bedTurnoverRate: 92, drugRatio: 38.5, satisfaction: 94.2, revenue: 285600 },
  { department: '呼吸科', outpatientCount: 152, bedTurnoverRate: 88, drugRatio: 42.1, satisfaction: 91.8, revenue: 218400 },
  { department: '消化科', outpatientCount: 134, bedTurnoverRate: 85, drugRatio: 35.8, satisfaction: 93.5, revenue: 196800 },
  { department: '神经内科', outpatientCount: 128, bedTurnoverRate: 79, drugRatio: 40.2, satisfaction: 90.6, revenue: 182400 },
  { department: '骨科', outpatientCount: 98, bedTurnoverRate: 76, drugRatio: 28.9, satisfaction: 95.1, revenue: 312000 },
  { department: '内分泌科', outpatientCount: 112, bedTurnoverRate: 82, drugRatio: 44.7, satisfaction: 92.3, revenue: 168000 },
]

export const mockDashboardMetrics: DashboardMetrics = {
  outpatientCount: 810,
  outpatientTrend: [
    { date: '06-12', value: 745 }, { date: '06-13', value: 820 },
    { date: '06-14', value: 690 }, { date: '06-15', value: 560 },
    { date: '06-16', value: 780 }, { date: '06-17', value: 835 },
    { date: '06-18', value: 810 },
  ],
  bedTurnoverRate: 84,
  drugRatio: 38.4,
  patientSatisfaction: 92.9,
  totalBeds: 320,
  occupiedBeds: 269,
  departmentMetrics,
  recentAlerts: [
    { type: 'critical', message: 'A-305床 陈大明 心率骤升至132次/分', time: '2分钟前' },
    { type: 'warning', message: 'B-204床 方建国 血压偏高 145/92mmHg', time: '5分钟前' },
    { type: 'warning', message: '药房DT003任务 机械臂运行中', time: '8分钟前' },
    { type: 'info', message: '今日门诊量较昨日上升3.2%', time: '15分钟前' },
  ],
}

export const symptomKeywords: Record<string, string[]> = {
  '心内科': ['胸闷', '心悸', '胸痛', '气短', '心绞痛', '心跳', '血压', '心律不齐', '水肿'],
  '呼吸科': ['咳嗽', '咳痰', '喘息', '气喘', '呼吸困难', '喉咙痛', '发热', '肺炎', '哮喘'],
  '消化科': ['胃痛', '腹痛', '腹泻', '恶心', '呕吐', '便秘', '腹胀', '胃酸', '食欲'],
  '神经内科': ['头痛', '头晕', '失眠', '麻木', '癫痫', '震颤', '记忆力', '偏头痛'],
  '骨科': ['腰痛', '关节痛', '骨折', '扭伤', '颈椎', '腰椎', '膝盖', '肩痛'],
  '内分泌科': ['多饮', '多尿', '消瘦', '肥胖', '甲状腺', '血糖', '糖尿病', '甲亢'],
}

export const patientAllergies: Record<string, string[]> = {
  'P001': ['青霉素'],
  'P002': [],
  'P003': ['磺胺类', '碘造影剂'],
  'P004': ['青霉素', '头孢类'],
  'P005': [],
}
