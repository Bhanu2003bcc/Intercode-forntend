import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Palette, ChevronDown } from 'lucide-react'

const THEMES = [
  { id: 'classic', label: 'Classic', bg: '#f6f2ea', accent: '#7c3aed', isDark: false },
  { id: 'cyberpunk', label: 'Cyberpunk', bg: '#0b0f19', accent: '#06b6d4', isDark: true },
  { id: 'github', label: 'GitHub', bg: '#ffffff', accent: '#0969da', isDark: false },
  { id: 'dracula', label: 'Dracula', bg: '#282a36', accent: '#ff79c6', isDark: true },
  { id: 'terminal', label: 'Terminal', bg: '#0d1117', accent: '#39d353', isDark: true }
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="theme-toggle-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', fontWeight: 800 }}
      >
        <Palette size={16} />
        <span style={{ fontSize: 12 }}>{THEMES.find(t => t.id === theme)?.label || 'Theme'}</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div 
          className="theme-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 180,
            background: 'var(--bg-surface)',
            border: '2px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 300,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                width: '100%',
                background: theme === t.id ? 'var(--bg-base)' : 'transparent',
                border: theme === t.id ? '1.5px solid var(--border-color)' : '1.5px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--text-primary)',
                transition: 'all 0.15s'
              }}
            >
              <span>{t.label}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.bg, border: '1px solid var(--border-color)' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.accent, border: '1px solid var(--border-color)' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
