import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import PatientHome from '@/pages/patient/PatientHome'
import Register from '@/pages/patient/Register'
import Queue from '@/pages/patient/Queue'
import Reports from '@/pages/patient/Reports'
import ReportDetail from '@/pages/patient/ReportDetail'
import Settlement from '@/pages/patient/Settlement'
import MedicalHome from '@/pages/medical/MedicalHome'
import Prescription from '@/pages/medical/Prescription'
import Monitor from '@/pages/medical/Monitor'
import ReportReview from '@/pages/medical/ReportReview'
import AdminHome from '@/pages/admin/AdminHome'
import Pharmacy from '@/pages/admin/Pharmacy'
import Triage from '@/pages/admin/Triage'
import Dashboard from '@/pages/director/Dashboard'
import Report from '@/pages/director/Report'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientHome /></ProtectedRoute>} />
        <Route path="/patient/register" element={<ProtectedRoute allowedRoles={['patient']}><Register /></ProtectedRoute>} />
        <Route path="/patient/queue" element={<ProtectedRoute allowedRoles={['patient']}><Queue /></ProtectedRoute>} />
        <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['patient']}><Reports /></ProtectedRoute>} />
        <Route path="/patient/report/:id" element={<ProtectedRoute allowedRoles={['patient']}><ReportDetail /></ProtectedRoute>} />
        <Route path="/patient/settlement" element={<ProtectedRoute allowedRoles={['patient']}><Settlement /></ProtectedRoute>} />
        <Route path="/medical" element={<ProtectedRoute allowedRoles={['medical']}><MedicalHome /></ProtectedRoute>} />
        <Route path="/medical/prescription" element={<ProtectedRoute allowedRoles={['medical']}><Prescription /></ProtectedRoute>} />
        <Route path="/medical/monitor" element={<ProtectedRoute allowedRoles={['medical']}><Monitor /></ProtectedRoute>} />
        <Route path="/medical/reports" element={<ProtectedRoute allowedRoles={['medical']}><ReportReview /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/pharmacy" element={<ProtectedRoute allowedRoles={['admin']}><Pharmacy /></ProtectedRoute>} />
        <Route path="/admin/triage" element={<ProtectedRoute allowedRoles={['admin']}><Triage /></ProtectedRoute>} />
        <Route path="/director" element={<ProtectedRoute allowedRoles={['director']}><Dashboard /></ProtectedRoute>} />
        <Route path="/director/report" element={<ProtectedRoute allowedRoles={['director']}><Report /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
