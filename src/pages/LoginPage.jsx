import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Code2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

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
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
  }

  const demoLogin = async (email, password) => {
    setForm({ email, password })
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Demo login failed. Ensure backend is running.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Code2 size={32} /></div>
          <h1>InterviewHub</h1>
          <p>Sign in to your account</p>
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

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24 }}>
          No account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  )
}
