import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import InterviewsPage from './pages/InterviewsPage'
import InterviewRoomPage from './pages/InterviewRoomPage'
import AnalyticsPage from './pages/AnalyticsPage'
import OAuth2Callback from './pages/OAuth2Callback'
import MainLayout from './components/layout/MainLayout'
import LandingPage from './pages/LandingPage'

/** Full-screen spinner shown while we read localStorage on first mount */
function AppLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <span className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth()
  if (initializing) return <AppLoader />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, initializing } = useAuth()
  if (initializing) return <AppLoader />
  return user ? <Navigate to="/app/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing landing page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/oauth2/callback" element={<OAuth2Callback />} />

      {/* Protected app shell */}
      <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Room is full-screen, no sidebar — still protected */}
      <Route path="/room/:roomToken" element={<ProtectedRoute><InterviewRoomPage /></ProtectedRoute>} />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/app/dashboard" replace /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><Navigate to="/app/interviews" replace /></ProtectedRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
