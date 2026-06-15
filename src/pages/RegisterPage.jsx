import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Code2, Mail, Lock, User } from 'lucide-react'

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
      toast.success('Account created! Welcome to InterviewHub.')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Code2 size={32} /></div>
          <h1>InterviewHub</h1>
          <p>Create your account</p>
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

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)', marginTop: 24 }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
