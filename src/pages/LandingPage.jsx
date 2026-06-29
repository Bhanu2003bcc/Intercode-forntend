/**
 * LandingPage.jsx
 * Selection Sure — Redesigned Marketing Landing Page
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Code2, Video, Zap, Shield, PlayCircle, BarChart2,
  Check, X as XIcon, ChevronDown, ArrowRight, Menu, X,
  Cpu, Database, Globe, Lock, Users, BookOpen, Briefcase,
  Wifi, Star, GitBranch, TerminalSquare, Layers
} from 'lucide-react'
import heroMockup from '../assets/hero-mockup.png'
import logoImg from '../assets/logo.png'
import ThemeToggle from '../components/ThemeToggle'
import './LandingPage.css'

/* ============================================================
   SCROLL REVEAL HOOK
   ============================================================ */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, revealed }
}

/* ============================================================
   STAGGERED REVEAL HOOK (applies to child items)
   ============================================================ */
function useStaggerReveal(count, threshold = 0.1) {
  const containerRef = useRef(null)
  const [revealed, setRevealed] = useState(Array(count).fill(false))

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          Array.from({ length: count }).forEach((_, i) => {
            setTimeout(() => {
              setRevealed(prev => { const next = [...prev]; next[i] = true; return next })
            }, i * 100)
          })
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [count, threshold])

  return { containerRef, revealed }
}

/* ============================================================
   NAVBAR
   ============================================================ */
function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features',    href: '#features'    },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Use Cases',   href: '#use-cases'   },
    { label: 'FAQ',         href: '#faq'         },
  ]

  const handleAnchor = useCallback((e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <>
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="lp-nav-logo" aria-label="Selection Sure home">
          <img src={logoImg} alt="Selection Sure Logo" className="lp-nav-logo-img" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
          <span className="lp-nav-logo-text">Selection Sure</span>
        </Link>

        {/* Desktop links */}
        <ul className="lp-nav-links" role="list">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <a href={href} onClick={e => handleAnchor(e, href)}>{label}</a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="lp-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="lp-nav-login">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started ✦</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lp-nav-hamburger"
          aria-expanded={mobileOpen}
          aria-controls="lp-mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div id="lp-mobile-menu" className={`lp-nav-mobile ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        {navLinks.map(({ label, href }) => (
          <a key={href} href={href} onClick={e => handleAnchor(e, href)}>{label}</a>
        ))}
        <div className="lp-nav-mobile-actions">
          <ThemeToggle />
          <Link to="/login"    className="btn btn-secondary" onClick={() => setMobileOpen(false)}>Log in</Link>
          <Link to="/register" className="btn btn-primary"   onClick={() => setMobileOpen(false)}>Get Started ✦</Link>
        </div>
      </div>
    </>
  )
}

/* ============================================================
   HERO
   ============================================================ */
function HeroSection() {
  return (
    <section className="lp-hero" aria-labelledby="hero-heading">
      <div className="lp-hero-bg" aria-hidden="true" />

      <div className="lp-hero-grid">
        {/* Copy column */}
        <div className="lp-hero-copy">
          <span className="lp-hero-tag" aria-label="Now in beta">
            ✦ LIVE &amp; REAL-TIME · NOW IN BETA
          </span>

          <h1 id="hero-heading" className="lp-hero-h1">
            THE INTERVIEW ROOM
            <span>BUILT FOR ENGINEERS. ✦</span>
          </h1>

          <p className="lp-hero-sub">
            One shared link. Low-latency P2P video, a synchronized Monaco code editor, and instant workspace sync — 
            so you can focus on the talent, not the tooling.
          </p>

          <div className="lp-hero-ctas">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta-primary">
              Start an Interview <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Link>
            <a
              href="#how-it-works"
              className="lp-btn-ghost"
              id="hero-cta-secondary"
              onClick={e => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              <PlayCircle size={18} /> See How it Works
            </a>
          </div>
        </div>

        {/* Visual column */}
        <div className="lp-hero-visual">
          <img
            src={heroMockup}
            alt="Selection Sure room showing live video tiles alongside a shared code editor with syntax-highlighted JavaScript"
            className="lp-hero-mockup"
            width="960"
            height="720"
            loading="eager"
            fetchPriority="high"
          />

          {/* Floating badges */}
          <div className="lp-hero-badge lp-hero-badge-live" aria-hidden="true">
            <span className="dot" /> Session live · 2 participants
          </div>
          <div className="lp-hero-badge lp-hero-badge-latency" aria-hidden="true">
            <Zap size={13} style={{ fill: 'currentColor' }} /> &lt;50ms latency
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   TRUST STRIP
   ============================================================ */
const techBadges = [
  { icon: <Globe size={15} />,          label: 'WebRTC P2P Video'     },
  { icon: <Zap size={15} />,            label: 'STOMP / SockJS'       },
  { icon: <Layers size={15} />,         label: 'Spring Boot Server'   },
  { icon: <Database size={15} />,       label: 'Redis Cache'          },
  { icon: <TerminalSquare size={15} />, label: 'Monaco Editor'        },
  { icon: <Shield size={15} />,         label: 'JWT Token Security'   },
]

function TrustStrip() {
  return (
    <div className="lp-trust" aria-label="Technology stack">
      <div className="lp-trust-inner">
        <span className="lp-trust-label">✦ DEPLOYED ON STATE-OF-THE-ART STACK</span>
        <div className="lp-trust-badges" role="list">
          {techBadges.map(({ icon, label }) => (
            <div key={label} className="lp-trust-badge" role="listitem">
              {icon} {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   PROBLEM → SOLUTION
   ============================================================ */
const painItems = [
  {
    icon: <XIcon size={16} />,
    title: 'FRAGMENTED INTERVIEW STACK',
    desc: 'Zoom for video, CoderPad for editing, Google Docs for notes. Constant tab-switching breaks the interview flow.',
  },
  {
    icon: <XIcon size={16} />,
    title: 'SETUP AND CONNECTION DELAYS',
    desc: 'Candidates spend the first 10 minutes troubleshooting audio, screen shares, or environment configurations.',
  },
  {
    icon: <XIcon size={16} />,
    title: 'DISCONNECTED COLLABORATIVE DATA',
    desc: 'Evaluations get lost in Slack threads or external docs. Code snapshots disappear immediately after the call.',
  },
]

const solutionItems = [
  {
    icon: <Check size={16} />,
    title: 'EVERYTHING IN A SINGLE ROOM',
    desc: 'Video, high-fidelity editor, and instant chat load together in one secure URL. Zero install required.',
  },
  {
    icon: <Check size={16} />,
    title: 'SECURE CANDIDATE ENTRY',
    desc: 'A robust time-limited room token lets candidates jump in instantly. Secure JWT keeps interviews private.',
  },
  {
    icon: <Check size={16} />,
    title: 'BUILT-IN SCORECARDS',
    desc: 'Standardize evaluation metrics. Write reviews and score candidate performance directly next to the active workspace.',
  },
]

function ProblemSolution() {
  const { ref, revealed } = useScrollReveal()
  return (
    <section className="lp-problem lp-section-full" id="problem-solution" aria-labelledby="problem-heading">
      <div className="lp-problem-inner lp-section">
        <div style={{ textAlign: 'center' }}>
          <span className="lp-section-tag">▲ The Problem</span>
          <h2 id="problem-heading" className="lp-section-heading">
            TECHNICAL INTERVIEWS ARE BROKEN BY DEFAULT.
          </h2>
          <p className="lp-section-subheading center">
            Hiring teams shouldn't have to stitch together multiple platforms. 
            We integrated the entire loop into a single optimized workspace.
          </p>
        </div>

        <div className="lp-problem-grid" ref={ref} style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'none' : 'translateY(24px)', transition: 'opacity 0.6s, transform 0.6s' }}>
          {/* Pain */}
          <div>
            <h3 className="lp-problem-col-label pain">▼ WITHOUT SELECTION SURE</h3>
            <div className="lp-pain-items">
              {painItems.map(item => (
                <div key={item.title} className="lp-pain-item">
                  <div className="lp-item-icon">{item.icon}</div>
                  <div className="lp-item-body"><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div>
            <h3 className="lp-problem-col-label solution">▲ WITH SELECTION SURE</h3>
            <div className="lp-solution-items">
              {solutionItems.map(item => (
                <div key={item.title} className="lp-solution-item">
                  <div className="lp-item-icon">{item.icon}</div>
                  <div className="lp-item-body"><h4>{item.title}</h4><p>{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURES GRID
   ============================================================ */
const features = [
  {
    accent: 'indigo',
    icon: <Video size={20} />,
    title: 'PEER-TO-PEER WEBRTC VIDEO',
    desc: 'High-quality P2P media connections directly inside the browser. Encrypted, low overhead, and requires zero software installation.',
  },
  {
    accent: 'cyan',
    icon: <Zap size={20} />,
    title: 'REAL-TIME WORKSPACE SYNC',
    desc: 'SockJS + STOMP messaging engine ensures code edits, cursors, and user actions synchronize between participants in under 50ms.',
  },
  {
    accent: 'green',
    icon: <Code2 size={20} />,
    title: 'VS-CODE POWERED MONACO IDE',
    desc: 'Fully featured Monaco editor supporting multiple programming languages, smart code autocomplete, and customized code display.',
  },
  {
    accent: 'amber',
    icon: <Shield size={20} />,
    title: 'JWT SECURITY PROTOCOLS',
    desc: 'Every interview session is cryptographically secured. Temporary tokens prevent unauthorized guest access to private rooms.',
  },
  {
    accent: 'violet',
    icon: <PlayCircle size={20} />,
    title: 'TIMELINE SESSION LOGS',
    desc: 'Record editor edits, state changes, and workspace messages during the room lifecycle. Scrub back to inspect candidate code history.',
  },
  {
    accent: 'pink',
    icon: <BarChart2 size={20} />,
    title: 'INTEGRATED CORE SCORECARDS',
    desc: 'Evaluate candidate problem-solving, communications, and language mastery inside structured tables beside the editor.',
  },
]

function FeaturesGrid() {
  const { containerRef, revealed } = useStaggerReveal(features.length)
  return (
    <section className="lp-section" id="features" aria-labelledby="features-heading">
      <div style={{ textAlign: 'center' }}>
        <span className="lp-section-tag">✦ FEATURES</span>
        <h2 id="features-heading" className="lp-section-heading">
          EVERYTHING YOU NEED.
          <br />
          NOTHING YOU DON'T.
        </h2>
        <p className="lp-section-subheading center">
          Selection Sure cuts the fat. No complex setup, no unnecessary plugins. Just pure interview performance.
        </p>
      </div>

      <div className="lp-features-grid" ref={containerRef} role="list">
        {features.map((f, i) => (
          <article
            key={f.title}
            className={`lp-feature-card ${revealed[i] ? 'revealed' : ''}`}
            data-accent={f.accent}
            role="listitem"
            style={{ transitionDelay: `${i * 80}ms` }}
            aria-label={f.title}
          >
            <div className={`lp-feature-icon ${f.accent}`} aria-hidden="true">{f.icon}</div>
            <h3 className="lp-feature-title">{f.title}</h3>
            <p className="lp-feature-desc">{f.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
const steps = [
  {
    num: '01',
    icon: <GitBranch size={20} />,
    title: 'SETUP INTERVIEW ROOM',
    desc: 'Generate a room in seconds via the dashboard. Pick the language and candidate configuration.',
  },
  {
    num: '02',
    icon: <Users size={20} />,
    title: 'SEND PRIVATE SECURE LINK',
    desc: 'Candidates enter the interview with a one-time token link. No account creation needed.',
  },
  {
    num: '03',
    icon: <Code2 size={20} />,
    title: 'CODE LIVE IN SYNC',
    desc: 'Build solution logic, test testcases, and communicate over stable WebRTC video inside a unified UI.',
  },
  {
    num: '04',
    icon: <BarChart2 size={20} />,
    title: 'SCORE AND ALIGN',
    desc: 'Log feedback metrics immediately. Share the room snapshot and session logs with the rest of your team.',
  },
]

function HowItWorks() {
  const { containerRef, revealed } = useStaggerReveal(steps.length, 0.1)
  return (
    <section className="lp-steps lp-section-full" id="how-it-works" aria-labelledby="steps-heading">
      <div className="lp-steps-inner lp-section">
        <div style={{ textAlign: 'center' }}>
          <span className="lp-section-tag">✦ STEP BY STEP</span>
          <h2 id="steps-heading" className="lp-section-heading">
            FROM ZERO TO INTERVIEW
            <br />
            IN UNDER 2 MINUTES.
          </h2>
          <p className="lp-section-subheading center">
            We removed the friction points. Four steps, one tab, outstanding technical hiring.
          </p>
        </div>

        <ol className="lp-steps-grid" ref={containerRef} aria-label="How it works steps">
          {steps.map((step, i) => (
            <li
              key={step.num}
              className={`lp-step ${revealed[i] ? 'revealed' : ''}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="lp-step-num" aria-hidden="true">{step.num}</div>
              <div className="lp-step-icon-wrap" aria-hidden="true">{step.icon}</div>
              <h3 className="lp-step-title">{step.title}</h3>
              <p className="lp-step-desc">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ============================================================
   USE CASES
   ============================================================ */
const useCases = [
  { emoji: '🏢', title: 'ENGINEERING TEAMS',   desc: 'Standardize evaluation metrics, share session workspace replays, and calibrate scoring across multiple hiring leads.' },
  { emoji: '🎯', title: 'TECHNICAL RECRUITERS', desc: 'Pre-screen candidate code quality and environment mastery quickly before scheduling expensive engineering syncs.' },
  { emoji: '🚀', title: 'FAST STARTUPS',        desc: 'Save engineering time. Send clean rooms to candidates in seconds without custom enterprise pricing setups.' },
  { emoji: '🎓', title: 'BOOTCAMPS & EDTECH',   desc: 'Deliver live mock challenges to student developers and submit structured code evaluations.' },
]

function UseCases() {
  const { containerRef, revealed } = useStaggerReveal(useCases.length, 0.1)
  return (
    <section className="lp-section" id="use-cases" aria-labelledby="usecases-heading">
      <div style={{ textAlign: 'center' }}>
        <span className="lp-section-tag">✦ WHO IT IS FOR</span>
        <h2 id="usecases-heading" className="lp-section-heading">
          BUILT FOR EVERY TEAM
          <br />
          THAT HIRES ENGINEERS.
        </h2>
        <p className="lp-section-subheading center">
          From high-volume screening pipelines to granular technical reviews, Selection Sure is built to scale.
        </p>
      </div>

      <div className="lp-usecases-grid" ref={containerRef}>
        {useCases.map((uc, i) => (
          <article
            key={uc.title}
            className={`lp-usecase-card ${revealed[i] ? 'revealed' : ''}`}
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <span className="lp-usecase-emoji" role="img" aria-label={uc.title}>{uc.emoji}</span>
            <h3 className="lp-usecase-title">{uc.title}</h3>
            <p className="lp-usecase-desc">{uc.desc}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   TECH ARCHITECTURE HIGHLIGHT
   ============================================================ */
const techStack = [
  {
    icon: '☕',
    iconBg: '#FEF9E7',
    name: 'SPRING BOOT API',
    role: 'Robust core routing, strict JWT token validation, and secure room state handlers.',
  },
  {
    icon: '📡',
    iconBg: '#E8F8F5',
    name: 'P2P WEBRTC',
    role: 'Ultra-low latency audio/video direct connection, keeping bandwidth costs and latency zero.',
  },
  {
    icon: '⚡',
    iconBg: '#EBF5FB',
    name: 'STOMP SYSTEM',
    role: 'Real-time WebSocket wrapper ensuring fast client-to-client sync of editor workspaces.',
  },
  {
    icon: '🗄️',
    iconBg: '#FCF3CF',
    name: 'REDIS CACHING',
    role: 'Fast state store caching active session locks and pub/sub message synchronization.',
  },
  {
    icon: '🐘',
    iconBg: '#E8F8F5',
    name: 'POSTGRES STORE',
    role: 'Durable metadata database storing past analytics summaries and customized scorecards.',
  },
]

function TechHighlight() {
  const { containerRef, revealed } = useStaggerReveal(techStack.length, 0.1)
  return (
    <section className="lp-tech lp-section-full" id="tech" aria-labelledby="tech-heading">
      <div className="lp-tech-inner lp-section">
        <span className="lp-section-tag">✦ ARCHITECTURE</span>
        <h2 id="tech-heading" className="lp-section-heading">
          STABILITY IS A REQUIREMENT,
          <br />
          NOT AN AFTERTHOUGHT.
        </h2>
        <p className="lp-section-subheading center">
          We built Selection Sure from the ground up for microsecond latency. A solid interview experience starts with solid code.
        </p>

        <div className="lp-tech-grid" ref={containerRef}>
          {techStack.map((t, i) => (
            <article
              key={t.name}
              className={`lp-tech-card ${revealed[i] ? 'revealed' : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="lp-tech-icon" style={{ background: t.iconBg }} role="img" aria-label={t.name}>
                {t.icon}
              </div>
              <h3 className="lp-tech-name">{t.name}</h3>
              <p className="lp-tech-role">{t.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
const faqs = [
  {
    q: 'Which browsers are supported?',
    a: 'Selection Sure works on all modern Chromium-based browsers (Chrome 90+, Edge 90+, Brave) and Firefox 90+. Safari 15.4+ is supported for video and audio. No external downloads are required.',
  },
  {
    q: 'Is session data private and secure?',
    a: 'Yes. Peer video streams are connected directly client-to-client via WebRTC and never touch our servers. Room tokens are generated as secure, time-locked JWTs that expire immediately after the interview window closing.',
  },
  {
    q: 'What languages does the editor support?',
    a: 'The Monaco-based editor currently supports Javascript, Typescript, Python, Java, C++, Go, Rust, and Ruby with complete syntax highlighting, automatic indentations, and smart brackets styling.',
  },
  {
    q: 'Is Selection Sure free to use?',
    a: 'Selection Sure is currently in its public beta phase, which is completely free for all developer and recruiting accounts. Standard pricing models will be introduced later with special early adopter packages.',
  },
  {
    q: 'Can candidates join without creating accounts?',
    a: 'Yes. Candidates join simply by clicking the secure interview URL and entering their names. No login, registrations, or phone verifications are required for candidates.',
  },
  {
    q: 'How does session logs tracking work?',
    a: 'When an interview session is active, workspace code edits and chat logs are tracked periodically. This allows interviewers to inspect the progression of a candidate\'s code blocks inside their dashboard.',
  },
]

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState(null)
  const toggle = (i) => setOpenIdx(prev => prev === i ? null : i)

  return (
    <section className="lp-section" id="faq" aria-labelledby="faq-heading">
      <div className="lp-faq-inner">
        <span className="lp-section-tag">✦ FREQUENTLY ASKED</span>
        <h2 id="faq-heading" className="lp-section-heading">QUESTIONS &amp; ANSWERS</h2>
        <p className="lp-section-subheading center" style={{ marginBottom: 40 }}>
          Here are answers to our most common platform questions.
        </p>

        <dl className="lp-faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`lp-faq-item ${openIdx === i ? 'open' : ''}`}>
              <dt>
                <button
                  className="lp-faq-question"
                  id={`faq-q-${i}`}
                  aria-expanded={openIdx === i}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => toggle(i)}
                >
                  {faq.q}
                  <ChevronDown size={18} className="lp-faq-chevron" aria-hidden="true" />
                </button>
              </dt>
              <dd
                id={`faq-a-${i}`}
                className="lp-faq-answer"
                aria-labelledby={`faq-q-${i}`}
                role="region"
              >
                <div className="lp-faq-answer-inner">{faq.a}</div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ============================================================
   FINAL CTA BANNER
   ============================================================ */
function CtaBanner() {
  const { ref, revealed } = useScrollReveal(0.2)
  return (
    <section className="lp-cta-banner" aria-labelledby="cta-heading">
      <div className="lp-cta-banner-bg" aria-hidden="true" />
      <div
        className="lp-cta-banner-inner"
        ref={ref}
        style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'none' : 'translateY(32px)', transition: 'opacity 0.7s, transform 0.7s' }}
      >
        <h2 id="cta-heading">
          STOP STITCHING TOOLS.
          <span>RUN BETTER INTERVIEWS. ✦</span>
        </h2>
        <p>
          Join engineering leads and recruiters who have replaced their multi-tool stacks with Selection Sure's unified, zero-friction workspaces.
        </p>
        <div className="lp-cta-banner-actions">
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-primary">
            Get Started Free <ArrowRight size={18} style={{ marginLeft: 4 }} />
          </Link>
          <Link to="/login" className="lp-btn-ghost" id="cta-login">
            Access My Account
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="lp-footer" role="contentinfo">
      <div className="lp-footer-inner">
        <div className="lp-footer-top">
          {/* Brand column */}
          <div className="lp-footer-brand">
            <Link to="/" className="lp-nav-logo" aria-label="Selection Sure home" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img src={logoImg} alt="Selection Sure Logo" className="lp-nav-logo-img" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              <span className="lp-nav-logo-text">Selection Sure</span>
            </Link>
            <p>Unified real-time collaborative workspace supporting WebRTC media connections, Monaco IDE coding, and direct evaluator rating dashboards.</p>
          </div>

          {/* Product links */}
          <nav className="lp-footer-col" aria-label="Product">
            <h4 className="lp-footer-col-title">Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#use-cases">Use Cases</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>

          {/* Platform links */}
          <nav className="lp-footer-col" aria-label="Platform">
            <h4 className="lp-footer-col-title">Platform</h4>
            <ul>
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
              <li><Link to="/app/dashboard">Dashboard</Link></li>
            </ul>
          </nav>

          {/* Legal links */}
          <nav className="lp-footer-col" aria-label="Legal">
            <h4 className="lp-footer-col-title">Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="lp-footer-bottom">
          <p>© {year} Selection Sure. All rights reserved.</p>
          <div className="lp-footer-socials" aria-label="Social media">
            <a href="#" className="lp-footer-social-btn" aria-label="GitHub" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.06 1.82 2.79 1.29 3.47.99.11-.77.42-1.29.76-1.59-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a href="#" className="lp-footer-social-btn" aria-label="LinkedIn" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.44-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.37 4.25 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.21 24 24 23.23 24 22.27V1.73C24 .77 23.21 0 22.22 0z"/>
              </svg>
            </a>
            <a href="#" className="lp-footer-social-btn" aria-label="Twitter / X" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.44h2.04L6.48 3.24H4.3l13.31 17.35z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   PAGE ROOT
   ============================================================ */
export default function LandingPage() {
  return (
    <div className="lp-page" id="landing-page">
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <TrustStrip />
        <ProblemSolution />
        <FeaturesGrid />
        <HowItWorks />
        <UseCases />
        <TechHighlight />
        <FaqAccordion />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
