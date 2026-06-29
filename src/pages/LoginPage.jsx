import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import logoImg from '../assets/logo.png'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setError('')
    try {
      await login(email, password)
      navigate('/app/dashboard')
    } catch {
      setError('Demo login failed. Ensure backend is running.')
    }
  }

  return (
    <div className="auth-page">
      {/* Left side brand panel */}
      <div className="auth-side-panel">
        <div className="auth-side-content">
          <span className="auth-side-badge">✦ TECHNICAL INTERVIEWS</span>
          <h2 className="auth-side-title">THE NEW STANDARD FOR CODE ROOMS.</h2>
          <p className="auth-side-desc">
            Real-time workspace sync, interactive IDE, low-latency video calls, and instant scorecards — all in a single browser tab.
          </p>
        </div>
        <div className="auth-side-shapes">
          <div className="shape-circle" />
        </div>
      </div>

      {/* Right side form panel */}
      <div className="auth-form-panel" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <ThemeToggle />
        </div>
        <div className="auth-card">
          <div className="auth-logo">
            <img src={logoImg} alt="Selection Sure Logo" className="auth-logo-img" style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '12px' }} />
            <h1>SELECTION SURE</h1>
            <p>Welcome back. Please login to your account.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 40 }}
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="form-error" style={{ textAlign:'center', fontSize:13 }}>{error}</div>}

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          {import.meta.env.DEV && (
            <>
              <div className="auth-divider" style={{ marginTop: 24, marginBottom: 16 }}>Quick Demo Access</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="oauth-btn" onClick={() => demoLogin('admin@interview.dev', 'Admin@123')}>
                  <span>🛡️</span> Login as Admin
                </button>
                <button className="oauth-btn" onClick={() => demoLogin('interviewer@interview.dev', 'Interviewer@123')}>
                  <span>👤</span> Login as Interviewer
                </button>
                <button className="oauth-btn" onClick={() => demoLogin('candidate@interview.dev', 'Candidate@123')}>
                  <span>🎓</span> Login as Candidate
                </button>
              </div>
            </>
          )}

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24, fontWeight: 500 }}>
            Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
