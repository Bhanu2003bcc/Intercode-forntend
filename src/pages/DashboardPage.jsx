import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { analyticsApi, interviewApi } from '../services/api'
import { Calendar, Users, CheckCircle, Clock, TrendingUp, ArrowRight, Plus } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-value">{value ?? <span className="spinner" />}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function StatusBadge({ status }) {
  return <span className={`badge badge-${status?.toLowerCase()}`}>{status?.replace('_', ' ')}</span>
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      hasRole('ADMIN', 'INTERVIEWER') ? analyticsApi.summary().catch(() => null) : Promise.resolve(null),
      interviewApi.list().catch(() => null),
    ]).then(([statsRes, intRes]) => {
      if (statsRes?.data) setStats(statsRes.data)
      if (intRes?.data) setInterviews(intRes.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>{greeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p>Here's what's happening on Selection Sure today.</p>
          </div>
          {hasRole('ADMIN', 'INTERVIEWER') && (
            <button className="btn btn-primary" onClick={() => navigate('/app/interviews')}>
              <Plus size={16} /> Schedule Interview
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {hasRole('ADMIN', 'INTERVIEWER') && (
        <div className="stats-grid">
          <StatCard icon={Calendar} label="Total Interviews" value={stats?.totalInterviews}
            color="var(--accent-primary)" iconBg="var(--bg-base)" />
          <StatCard icon={Clock} label="Scheduled" value={stats?.scheduledInterviews}
            color="var(--accent-cyan)" iconBg="#E8F8F5" />
          <StatCard icon={TrendingUp} label="In Progress" value={stats?.inProgressInterviews}
            color="var(--accent-amber)" iconBg="#FEF9E7" />
          <StatCard icon={CheckCircle} label="Completed" value={stats?.completedInterviews}
            color="var(--accent-green)" iconBg="#EAF2F8" />
          <StatCard icon={Users} label="Candidates" value={stats?.totalCandidates}
            color="var(--accent-pink)" iconBg="#FADBD8" />
          <StatCard icon={Users} label="Submissions" value={stats?.totalSubmissions}
            color="var(--accent-secondary)" iconBg="#EBF5FB" />
        </div>
      )}

      {/* Recent Interviews */}
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Interviews</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/interviews')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" style={{ width:32,height:32,margin:'0 auto' }} /></div>
        ) : interviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No interviews yet</p>
            {hasRole('ADMIN', 'INTERVIEWER') && (
              <button className="btn btn-primary" onClick={() => navigate('/app/interviews')}>Schedule First Interview</button>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Candidate</th>
                <th>Interviewer</th>
                <th>Scheduled At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(i => (
                <tr key={i.id}>
                  <td style={{ fontWeight: 600 }}>{i.title}</td>
                  <td>{i.candidate?.fullName || '—'}</td>
                  <td>{i.interviewer?.fullName || '—'}</td>
                  <td className="text-sm text-muted">
                    {new Date(i.scheduledAt).toLocaleString()}
                  </td>
                  <td><StatusBadge status={i.status} /></td>
                  <td>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/room/${i.roomToken}`)}>
                      Enter Room
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
