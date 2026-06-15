import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../services/api'

export default function OAuth2Callback() {
  const navigate = useNavigate()
  const { } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      authApi.me().then(res => {
        localStorage.setItem('user', JSON.stringify(res.data))
        navigate('/dashboard')
      }).catch(() => navigate('/login'))
    } else {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Completing sign in...</p>
      </div>
    </div>
  )
}
