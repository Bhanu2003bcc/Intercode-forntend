import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Mail, Lock, User } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import logoImg from '../assets/logo.png'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'CANDIDATE' })
  const [error, setError] = useState('')
  const { register, loading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    try {
      await register(form)
      toast.success('Account created! Welcome to Selection Sure.')
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      {/* Left side brand panel */}
      <div className="auth-side-panel">
        <div className="auth-side-content">
          <span className="auth-side-badge">✦ BUILD YOUR PIPELINE</span>
          <h2 className="auth-side-title">HIRE TOP-TIER DEV TALENT.</h2>
          <p className="auth-side-desc">
            Equip your recruiters and engineers with the ultimate technical evaluation toolkit.
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
            <p>Create your recruiter or interviewer account today.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: 40 }} type="text" placeholder="Your full name"
                  value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: 40 }} type="email" placeholder="you@company.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: 40 }} type="password" placeholder="Min 8 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="CANDIDATE">Candidate</option>
                <option value="INTERVIEWER">Interviewer</option>
              </select>
            </div>

            {error && <div className="form-error" style={{ textAlign: 'center' }}>{error}</div>}

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24, fontWeight: 500 }}>
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
