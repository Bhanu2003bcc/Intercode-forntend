import { useEffect, useState } from 'react'
import { analyticsApi } from '../services/api'
import { BarChart3, Users, CheckCircle, Clock, TrendingUp, XCircle, PlayCircle, Code2 } from 'lucide-react'

function MetricBlock({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ textAlign:'center' }}>
      <div className="stat-icon" style={{ background:`${color}20`, margin:'0 auto 16px' }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.summary(), analyticsApi.users()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ textAlign:'center', padding: 80 }}>
      <span className="spinner" style={{ width:40,height:40,margin:'0 auto' }} />
    </div>
  )

  const totalCompleted = stats?.completedInterviews ?? 0
  const totalInterviews = stats?.totalInterviews ?? 1
  const completionRate = Math.round((totalCompleted / totalInterviews) * 100)

  return (
    <div>
      <div className="page-header">
        <h1>Analytics & Reports</h1>
        <p>Platform performance overview and key metrics</p>
      </div>

      <div className="stats-grid">
        <MetricBlock icon={BarChart3} label="Total Interviews" value={stats?.totalInterviews} color="var(--accent-primary)" />
        <MetricBlock icon={Clock} label="Scheduled" value={stats?.scheduledInterviews} color="var(--accent-cyan)" />
        <MetricBlock icon={PlayCircle} label="In Progress" value={stats?.inProgressInterviews} color="var(--accent-amber)" />
        <MetricBlock icon={CheckCircle} label="Completed" value={stats?.completedInterviews} color="var(--accent-green)" />
        <MetricBlock icon={XCircle} label="Cancelled" value={stats?.cancelledInterviews} color="var(--accent-red)" />
        <MetricBlock icon={Users} label="Candidates" value={stats?.totalCandidates} color="var(--accent-pink)" />
        <MetricBlock icon={Users} label="Interviewers" value={stats?.totalInterviewers} color="var(--accent-secondary)" />
        <MetricBlock icon={Code2} label="Code Submissions" value={stats?.totalSubmissions} color="var(--accent-cyan)" />
      </div>

      {/* Completion rate visual */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 24, marginTop: 8 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Interview Completion Rate</h3>
        <div style={{ display:'flex', alignItems:'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, background:'var(--bg-elevated)', borderRadius: 6, overflow:'hidden' }}>
              <div style={{
                height: '100%', width: `${completionRate}%`,
                background: 'var(--gradient-primary)', borderRadius: 6,
                transition: 'width 1s var(--ease-smooth)',
                boxShadow: 'var(--shadow-glow)'
              }} />
            </div>
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, color:'var(--accent-primary)' }}>{completionRate}%</span>
        </div>
        <p className="text-muted text-sm" style={{ marginTop: 8 }}>
          {totalCompleted} of {totalInterviews} interviews completed
        </p>
      </div>

      {/* User tables */}
      {users && (
        <div style={{ display: 'grid', gridTemplateColumns:'1fr 1fr', gap: 24 }}>
          <div className="table-container">
            <div className="table-header"><h3>Interviewers ({users.interviewers?.length ?? 0})</h3></div>
            <table>
              <thead><tr><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {(users.interviewers ?? []).map(u => (
                  <tr key={u.id}><td style={{ fontWeight:600 }}>{u.fullName}</td><td className="text-muted text-sm">{u.email}</td></tr>
                ))}
                {!users.interviewers?.length && (
                  <tr><td colSpan={2} style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No interviewers yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-container">
            <div className="table-header"><h3>Candidates ({users.candidates?.length ?? 0})</h3></div>
            <table>
              <thead><tr><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {(users.candidates ?? []).map(u => (
                  <tr key={u.id}><td style={{ fontWeight:600 }}>{u.fullName}</td><td className="text-muted text-sm">{u.email}</td></tr>
                ))}
                {!users.candidates?.length && (
                  <tr><td colSpan={2} style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No candidates yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
