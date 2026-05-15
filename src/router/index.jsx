import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/features/auth/LoginPage'
import WalletPage from '@/features/wallet/WalletPage'
import LeadsPage from '@/features/leads/LeadsPage'

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/wallet" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Login — redirects to /wallet if already authenticated */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

      {/* Authenticated app */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        {/* /wallet is the landing page */}
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/leads"  element={<LeadsPage />} />
      </Route>

      {/* Root redirect — always goes to /wallet */}
      <Route path="/"   element={<Navigate to="/wallet" replace />} />
      <Route path="*"   element={<Navigate to="/wallet" replace />} />
    </Routes>
  )
}