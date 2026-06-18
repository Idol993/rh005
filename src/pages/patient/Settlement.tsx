import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { mockSettlementBills } from '@/mock/data'
import { CreditCard, Shield, Receipt, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const categoryIcon: Record<string, string> = {
  '检查费': '🔬',
  '药费': '💊',
  '床位费': '🛏️',
  '手术费': '🔪',
  '护理费': '🩺',
  '其他': '📋',
}

export default function Settlement() {
  const user = useAuthStore((s) => s.user)
  const bill = mockSettlementBills.find((b) => b.patientId === user?.id)
  const [paid, setPaid] = useState(false)

  if (!bill) {
    return (
      <div className="max-w-4xl text-center py-20">
        <Receipt size={48} className="mx-auto text-gray-200 mb-3" />
        <p className="text-gray-400">暂无结算信息</p>
      </div>
    )
  }

  const pieData = [
    { name: '医保支付', value: bill.insuranceCovered },
    { name: '自费部分', value: bill.selfPayAmount },
  ]
  const COLORS = ['#0A6EBD', '#FA5252']

  const handlePay = () => {
    setPaid(true)
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card bg-gradient-to-r from-primary-500 to-primary-700 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm mb-1">费用总计</p>
            <div className="text-3xl font-bold font-mono">¥{bill.totalAmount.toLocaleString()}</div>
            <p className="text-primary-200 text-xs mt-1">住院 {bill.daysAdmitted} 天 · {bill.admissionDate} 至 {bill.dischargeDate}</p>
          </div>
          <CreditCard size={48} className="text-white/20" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-sm text-gray-500 mb-1">费用总额</div>
          <div className="text-xl font-bold text-gray-800 font-mono">¥{bill.totalAmount.toLocaleString()}</div>
        </div>
        <div className="card text-center">
          <Shield size={18} className="text-primary-500 mx-auto mb-1" />
          <div className="text-sm text-gray-500 mb-1">医保支付</div>
          <div className="text-xl font-bold text-primary-500 font-mono">¥{bill.insuranceCovered.toLocaleString()}</div>
        </div>
        <div className="card text-center">
          <div className="text-sm text-gray-500 mb-1">自费金额</div>
          <div className="text-xl font-bold text-danger-500 font-mono">¥{bill.selfPayAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 card flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-700 mb-4">费用构成</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-3 card">
          <h3 className="text-sm font-medium text-gray-700 mb-4">费用明细</h3>
          <div className="space-y-3">
            {bill.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{categoryIcon[item.category] || '📋'}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{item.category}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-gray-800">¥{item.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    {item.insuranceCovered ? `医保 ${item.coverageRate * 100}% · 自费 ¥${item.selfPayAmount.toLocaleString()}` : '全自费'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {paid ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <CheckCircle size={24} className="text-success-500" />
            <span className="text-lg font-semibold text-success-500">支付成功</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 font-medium">自费应付金额</span>
              <span className="text-2xl font-bold text-danger-500 font-mono ml-3">¥{bill.selfPayAmount.toLocaleString()}</span>
            </div>
            <button onClick={handlePay} className="btn-primary flex items-center gap-2">
              <CreditCard size={16} />床旁支付
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
