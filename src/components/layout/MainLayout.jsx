import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import ThemeToggle from '../ThemeToggle'
import logoImg from '../../assets/logo.png'
import { 
  LayoutDashboard, Calendar, BarChart3, LogOut, Menu, X
} from 'lucide-react'

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN','INTERVIEWER','CANDIDATE'] },
  { path: '/app/interviews', label: 'Interviews', icon: Calendar, roles: ['ADMIN','INTERVIEWER','CANDIDATE'] },
  { path: '/app/analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN','INTERVIEWER'] },
]

function RoleBadge({ role }) {
  return <span className={`badge badge-${role?.toLowerCase()}`}>{role}</span>
}

export default function MainLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '?'

  const handleLogout = () => { logout(); navigate('/login') }

  const filteredNav = navItems.filter(item => item.roles.some(r => hasRole(r)))

  return (
    <div className="main-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src={logoImg} alt="Selection Sure" className="sidebar-logo-img" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span className="sidebar-logo-text">Selection Sure</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon"><item.icon size={18} /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name truncate">{user?.fullName}</div>
            <RoleBadge role={user?.role} />
          </div>
          <button className="btn btn-icon btn-secondary" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button
            className="btn btn-icon btn-secondary"
            style={{ display: 'none' }}
            id="sidebar-toggle"
            onClick={() => setSidebarOpen(s => !s)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <style>{`@media(max-width:1024px){#sidebar-toggle{display:flex!important}}`}</style>
          <div /> {/* spacer */}
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.fullName}</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
