import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { interviewApi, analyticsApi } from '../services/api'
import { Plus, Calendar, Clock, User, Video, Trash2, Copy } from 'lucide-react'

const ALL_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

function StatusBadge({ status }) {
  return <span className={`badge badge-${status?.toLowerCase()}`}>{status?.replace('_', ' ')}</span>
}

/** Interactive dropdown styled as a status badge — only rendered for participants */
function StatusSelect({ interview, onChanged }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const handleChange = async (e) => {
    const newStatus = e.target.value
    if (newStatus === interview.status || busy) return
    setBusy(true)
    try {
      const res = await interviewApi.updateStatus(interview.id, newStatus)
      onChanged(res.data)
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    } finally {
      setBusy(false)
    }
  }

  return (
    <select
      className={`status-select ${interview.status?.toLowerCase()}`}
      value={interview.status}
      onChange={handleChange}
      disabled={busy}
      title="Change interview status"
    >
      {ALL_STATUSES.map(s => (
        <option key={s} value={s}>{s.replace('_', ' ')}</option>
      ))}
    </select>
  )
}

function CreateInterviewModal({ onClose, onCreated }) {
  const { user, hasRole } = useAuth()
  const [form, setForm] = useState({
    title: '', description: '', scheduledAt: '', durationMinutes: 60,
    candidateEmail: '', interviewerEmail: ''
  })
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (user && (hasRole('INTERVIEWER') || hasRole('ADMIN'))) {
      setForm(f => ({ ...f, interviewerEmail: user.email }))
    }
  }, [user, hasRole])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: Number(form.durationMinutes)
      }
      const res = await interviewApi.create(payload)
      onCreated(res.data)
      toast.success('Interview scheduled!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">Schedule New Interview</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="input-label">Title *</label>
            <input className="input-field" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} required placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Interview focus areas, notes..." style={{ resize:'vertical' }} />
          </div>
          
          <div className="form-group">
            <label className="input-label">Candidate Email *</label>
            <input
              type="email"
              className="input-field"
              value={form.candidateEmail}
              onChange={e => setForm(f => ({ ...f, candidateEmail: e.target.value }))}
              required
              placeholder="candidate@example.com"
            />
          </div>

          <div className="form-group">
            <label className="input-label">Interviewer Email *</label>
            <input
              type="email"
              className="input-field"
              value={form.interviewerEmail}
              onChange={e => setForm(f => ({ ...f, interviewerEmail: e.target.value }))}
              required
              placeholder="interviewer@example.com"
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="input-label">Scheduled At *</label>
              <input className="input-field" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f=>({...f,scheduledAt:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="input-label">Duration (minutes)</label>
              <input className="input-field" type="number" min={15} max={240} value={form.durationMinutes} onChange={e => setForm(f=>({...f,durationMinutes:e.target.value}))} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"/> : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function InterviewCard({ interview, onEnter, onDelete, onStatusChanged, canDelete, canManageStatus }) {
  const toast = useToast()
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${interview.roomToken}`)
    toast.info('Room link copied!')
  }

  return (
    <div className="interview-card">
      <div className="interview-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="interview-card-title">{interview.title}</div>
          {interview.description && (
            <div className="text-sm text-muted" style={{ marginTop:4, lineClamp:2 }}>{interview.description}</div>
          )}
        </div>
        {canManageStatus
          ? <StatusSelect interview={interview} onChanged={onStatusChanged} />
          : <StatusBadge status={interview.status} />
        }
      </div>
      <div className="interview-card-meta">
        <div className="interview-card-meta-row">
          <Calendar size={14} />
          {new Date(interview.scheduledAt).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
          &nbsp;·&nbsp;
          {new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
        </div>
        <div className="interview-card-meta-row">
          <Clock size={14} /> {interview.durationMinutes} min
        </div>
        {(interview.candidate || interview.candidateEmail) && (
          <div className="interview-card-meta-row">
            <User size={14} /> Candidate: {interview.candidate ? `${interview.candidate.fullName} (${interview.candidateEmail})` : interview.candidateEmail}
          </div>
        )}
        {(interview.interviewer || interview.interviewerEmail) && (
          <div className="interview-card-meta-row">
            <User size={14} /> Interviewer: {interview.interviewer ? `${interview.interviewer.fullName} (${interview.interviewerEmail})` : interview.interviewerEmail}
          </div>
        )}
      </div>
      <div className="interview-card-actions">
        <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => onEnter(interview.roomToken)}>
          <Video size={14} /> Enter Room
        </button>
        <button className="btn btn-secondary btn-sm" onClick={copyLink} title="Copy invite link">
          <Copy size={14} />
        </button>
        {canDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(interview.id)} title="Delete">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function InterviewsPage() {
  const { user, hasRole } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const load = () => {
    setLoading(true)
    interviewApi.list().then(res => setInterviews(res.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async id => {
    if (!confirm('Delete this interview?')) return
    try {
      await interviewApi.delete(id)
      setInterviews(prev => prev.filter(i => i.id !== id))
      toast.success('Interview deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleStatusChanged = (updated) => {
    setInterviews(prev => prev.map(i => i.id === updated.id ? updated : i))
  }

  /** Returns true if the logged-in user can manage the status of the given interview */
  const canManageStatus = (interview) => {
    if (!user) return false
    if (hasRole('ADMIN')) return true
    if (hasRole('INTERVIEWER') && (interview.interviewer?.id === user.id || interview.interviewerEmail === user.email)) return true
    if (hasRole('CANDIDATE') && (interview.candidate?.id === user.id || interview.candidateEmail === user.email)) return true
    return false
  }

  const filtered = statusFilter === 'ALL' ? interviews : interviews.filter(i => i.status === statusFilter)

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Interviews</h1>
            <p>{interviews.length} total interview{interviews.length !== 1 ? 's' : ''}</p>
          </div>
          {hasRole('ADMIN', 'INTERVIEWER') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Schedule Interview
            </button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(s)}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding: 80 }}><span className="spinner" style={{ width:40,height:40,margin:'0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No {statusFilter !== 'ALL' ? statusFilter.toLowerCase().replace('_',' ') + ' ' : ''}interviews found</p>
          {hasRole('ADMIN', 'INTERVIEWER') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Schedule First Interview</button>
          )}
        </div>
      ) : (
        <div className="interviews-grid">
          {filtered.map(interview => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onEnter={token => navigate(`/room/${token}`)}
              onDelete={handleDelete}
              onStatusChanged={handleStatusChanged}
              canDelete={hasRole('ADMIN')}
              canManageStatus={canManageStatus(interview)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <CreateInterviewModal
          onClose={() => setShowModal(false)}
          onCreated={created => setInterviews(prev => [created, ...prev])}
        />
      )}
    </div>
  )
}
