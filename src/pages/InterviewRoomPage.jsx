// import { useEffect, useRef, useState, useCallback } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useAuth } from '../contexts/AuthContext'
// import { useToast } from '../contexts/ToastContext'
// import { interviewApi, executeApi } from '../services/api'
// import { useWebRTC } from '../hooks/useWebRTC'
// import { useRoomSocket } from '../hooks/useRoomSocket'
// import { useResizablePanels } from '../hooks/useResizablePanels'
// import Editor from '@monaco-editor/react'
// import {
//   Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
//   PhoneOff, Send, Play, Code2, MessageSquare, Users,
//   Copy, ChevronDown
// } from 'lucide-react'

// const ALL_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

// /** Compact status dropdown for the room header */
// function RoomStatusSelector({ interview, onStatusChanged, canManage }) {
//   const toast = useToast()
//   const [busy, setBusy] = useState(false)

//   if (!interview) return null

//   if (!canManage) {
//     return (
//       <span className={`status-select ${interview.status?.toLowerCase()}`}
//         style={{ cursor: 'default', backgroundImage: 'none', paddingRight: 10 }}>
//         {interview.status?.replace('_', ' ')}
//       </span>
//     )
//   }

//   const handleChange = async (e) => {
//     const newStatus = e.target.value
//     if (newStatus === interview.status || busy) return
//     setBusy(true)
//     try {
//       const res = await interviewApi.updateStatus(interview.id, newStatus)
//       onStatusChanged(res.data)
//       toast.success(`Status → ${newStatus.replace('_', ' ')}`)
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update status')
//     } finally {
//       setBusy(false)
//     }
//   }

//   return (
//     <select
//       className={`status-select ${interview.status?.toLowerCase()}`}
//       value={interview.status}
//       onChange={handleChange}
//       disabled={busy}
//       title="Change interview status"
//     >
//       {ALL_STATUSES.map(s => (
//         <option key={s} value={s}>{s.replace('_', ' ')}</option>
//       ))}
//     </select>
//   )
// }

// // ─── Video Panel ──────────────────────────────────────────────
// function VideoPanel({ localStream, remoteStreams, camOn, micOn, localUser, peers }) {
//   const localVideoRef = useRef(null)

//   useEffect(() => {
//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream
//     }
//   }, [localStream])

//   const peerCount = 1 + Object.keys(remoteStreams).length
//   const gridClass = peerCount <= 1 ? 'peers-1' : peerCount === 2 ? 'peers-2' : 'peers-3'

//   return (
//     <div className={`video-grid ${gridClass}`} style={{ background: '#050811' }}>
//       {/* Local */}
//       <div className="video-tile">
//         {localStream && camOn ? (
//           <video ref={localVideoRef} autoPlay muted playsInline style={{ transform:'scaleX(-1)' }} />
//         ) : (
//           <div className="video-avatar-fallback">
//             <span>{localUser?.fullName?.substring(0,2)?.toUpperCase() || 'ME'}</span>
//           </div>
//         )}
//         <div className="video-tile-overlay">
//           <span className="video-tile-name">{localUser?.fullName || 'You'} (You)</span>
//           {!micOn && <MicOff size={14} className="video-tile-muted" />}
//         </div>
//       </div>
//       {/* Remote peers */}
//       {Object.values(remoteStreams).map(({ stream, peerId }) => (
//         <RemoteVideoTile key={peerId} stream={stream} peerName={peers?.[peerId]?.name || peerId?.substring(0,8)} />
//       ))}
//     </div>
//   )
// }

// function RemoteVideoTile({ stream, peerName }) {
//   const videoRef = useRef(null)
//   useEffect(() => {
//     if (videoRef.current && stream) videoRef.current.srcObject = stream
//   }, [stream])

//   return (
//     <div className="video-tile">
//       <video ref={videoRef} autoPlay playsInline />
//       <div className="video-tile-overlay">
//         <span className="video-tile-name">{peerName}</span>
//       </div>
//     </div>
//   )
// }

// // ─── Chat Panel ───────────────────────────────────────────────
// function ChatPanel({ messages, onSend, userId }) {
//   const [input, setInput] = useState('')
//   const bottomRef = useRef(null)

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages])

//   const handleSend = () => {
//     const trimmed = input.trim()
//     if (!trimmed) return
//     onSend(trimmed)
//     setInput('')
//   }

//   return (
//     <div className="chat-panel" style={{ height: '100%' }}>
//       <div className="chat-messages">
//         {messages.length === 0 && (
//           <div style={{ textAlign:'center', color:'var(--text-muted)', padding: 32, fontSize: 13 }}>
//             No messages yet. Say hello! 👋
//           </div>
//         )}
//         {messages.map((msg, i) => {
//           const isOwn = msg.senderId === userId
//           return (
//             <div key={i} className={`chat-msg ${isOwn ? 'own' : ''}`}>
//               <div className="chat-msg-avatar">
//                 {msg.senderName?.substring(0,2)?.toUpperCase() || '?'}
//               </div>
//               <div className="chat-bubble">
//                 {!isOwn && <div className="chat-bubble-name">{msg.senderName}</div>}
//                 <div className="chat-bubble-text">{msg.payload?.text}</div>
//                 <div className="chat-bubble-time">
//                   {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
//                 </div>
//               </div>
//             </div>
//           )
//         })}
//         <div ref={bottomRef} />
//       </div>
//       <div className="chat-input-row">
//         <input
//           className="chat-input"
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
//           placeholder="Send a message..."
//         />
//         <button className="btn btn-primary btn-icon" onClick={handleSend}><Send size={14} /></button>
//       </div>
//     </div>
//   )
// }

// // ─── IDE Panel ────────────────────────────────────────────────
// const LANGS = [
//   { value: 'PYTHON', label: 'Python', monaco: 'python', starter: 'print("Hello, World!")' },
//   { value: 'JAVA',   label: 'Java',   monaco: 'java',   starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
//   { value: 'GO',     label: 'Go',     monaco: 'go',     starter: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
//   { value: 'CPP',    label: 'C++',    monaco: 'cpp',    starter: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
//   { value: 'C',      label: 'C',      monaco: 'c',      starter: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
// ]

// function IDEPanel({
//   code, onCodeChange,
//   langValue, onLangChange,
//   running, result,
//   interviewId, onRun,
// }) {
//   const lang = LANGS.find(l => l.value === langValue) || LANGS[0]
//   const [stdin, setStdin] = useState('')

//   const handleLangChange = (val) => {
//     const selected = LANGS.find(l => l.value === val)
//     onLangChange(selected)
//   }

//   const outputClass = running ? 'running' : result?.exitCode === 0 ? 'success' : result ? 'error' : ''

//   return (
//     <div className="ide-panel" style={{ display:'flex', flexDirection:'column', height:'100%' }}>
//       <div className="ide-toolbar">
//         <Code2 size={14} style={{ color:'var(--accent-primary)' }} />
//         <select className="lang-selector" value={lang.value} onChange={e => handleLangChange(e.target.value)}>
//           {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
//         </select>
//         <div style={{ flex:1 }} />
//         <button className="btn btn-primary btn-sm" onClick={() => onRun(lang.value, stdin)} disabled={running}>
//           {running ? <span className="spinner" style={{width:14,height:14}} /> : <Play size={14} />}
//           {running ? 'Running...' : 'Run'}
//         </button>
//       </div>
//       <div className="ide-editor-wrap" style={{ flex:1, overflow:'hidden' }}>
//         <Editor
//           height="100%"
//           language={lang.monaco}
//           value={code}
//           onChange={val => onCodeChange(val || '')}
//           theme="vs-dark"
//           options={{
//             fontSize: 14,
//             fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
//             minimap: { enabled: false },
//             scrollBeyondLastLine: false,
//             automaticLayout: true,
//             tabSize: 4,
//             wordWrap: 'on',
//             lineNumbers: 'on',
//             renderWhitespace: 'selection',
//             cursorBlinking: 'smooth',
//             smoothScrolling: true,
//             padding: { top: 12, bottom: 12 },
//           }}
//         />
//       </div>
//       <div className="ide-output">
//         <div className="ide-output-header">
//           <span className="ide-output-label">Output</span>
//           {result && (
//             <span style={{ fontSize:11, color: result.exitCode === 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
//               {result.timedOut ? '⏱ Timed Out' : result.exitCode === 0 ? '✓ Success' : `✗ Exit ${result.exitCode}`}
//               {result.stdout && !result.timedOut ? ` · ${result.executionTimeMs ?? '?'}ms` : ''}
//             </span>
//           )}
//         </div>
//         <div className={`ide-output-body ${outputClass}`}>
//           {running && '⏳ Executing...'}
//           {!running && result && (result.stdout || result.stderr || 'No output')}
//           {!running && !result && <span style={{ color:'var(--text-muted)' }}>Run code to see output here</span>}
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─── Main Room Page ────────────────────────────────────────────
// export default function InterviewRoomPage() {
//   const { roomToken } = useParams()
//   const navigate = useNavigate()
//   const { user, hasRole } = useAuth()
//   const toast = useToast()

//   const [interview, setInterview] = useState(null)

//   const [guestUser, setGuestUser] = useState(() => {
//     const savedId = sessionStorage.getItem(`guest_id_${roomToken}`)
//     const savedName = sessionStorage.getItem(`guest_name_${roomToken}`)
//     if (savedId && savedName) {
//       return { id: savedId, fullName: savedName }
//     }
//     return null
//   })

//   const [guestInput, setGuestInput] = useState('')

//   const effectiveUser = user || guestUser

//   /** Returns true if the logged-in user may manage status in this room */
//   const canManageStatus = useCallback((iv) => {
//     if (!user || !iv) return false
//     if (hasRole('ADMIN')) return true
//     if (hasRole('INTERVIEWER') && iv.interviewer?.id === user.id) return true
//     if (hasRole('CANDIDATE')  && iv.candidate?.id  === user.id) return true
//     return false
//   }, [user, hasRole])

//   // ── Shared editor state (lifted from IDEPanel so we can sync it) ──
//   const [code, setCode]         = useState('print("Hello, World!")')
//   const [langValue, setLangValue] = useState('PYTHON')
//   const [running, setRunning]   = useState(false)
//   const [result, setResult]     = useState(null)

//   const [chatMessages, setChatMessages] = useState([])
//   const [peers, setPeers] = useState({})  // userId -> { name }
//   const [activePanel, setActivePanel] = useState('all')
//   const { sizes, containerRef, startDrag, setSizes } = useResizablePanels([25, 50, 25])

//   // ── WebSocket message handler ────────────────────────────────
//   const handleSocketMessage = useCallback((msg) => {
//     switch (msg.type) {
//       case 'WEBRTC_OFFER':
//         if (msg.targetPeerId === effectiveUser?.id) {
//           handleOffer(msg.senderId, msg.payload)
//         }
//         break
//       case 'WEBRTC_ANSWER':
//         if (msg.targetPeerId === effectiveUser?.id) {
//           handleAnswer(msg.senderId, msg.payload)
//         }
//         break
//       case 'ICE_CANDIDATE':
//         if (msg.targetPeerId === effectiveUser?.id) {
//           handleIceCandidate(msg.senderId, msg.payload)
//         }
//         break
//       case 'CODE_SYNC':
//         if (msg.senderId !== effectiveUser?.id) {
//           setCode(msg.payload?.code ?? '')
//         }
//         break
//       case 'LANG_SYNC':
//         if (msg.senderId !== effectiveUser?.id && msg.payload?.lang) {
//           setLangValue(msg.payload.lang)
//           if (msg.payload?.code !== undefined) {
//             setCode(msg.payload.code)
//           }
//         }
//         break
//       case 'EXECUTION_RUNNING':
//         if (msg.senderId !== effectiveUser?.id) {
//           setRunning(true)
//           setResult(null)
//         }
//         break
//       case 'EXECUTION_RESULT':
//         if (msg.senderId !== effectiveUser?.id) {
//           setRunning(false)
//           setResult(msg.payload)
//         }
//         break
//       case 'CHAT':
//         if (msg.senderId !== effectiveUser?.id) {
//           setChatMessages(prev => [...prev, msg])
//         }
//         break
//       case 'USER_JOIN':
//         setPeers(prev => ({ ...prev, [msg.senderId]: { name: msg.senderName } }))
//         if (msg.senderId !== effectiveUser?.id) {
//           setTimeout(() => initiateCall(msg.senderId), 500)
//           toast.info(`${msg.senderName || 'Someone'} joined the room`)
//         }
//         break
//       case 'USER_LEAVE':
//         setPeers(prev => { const n = { ...prev }; delete n[msg.senderId]; return n })
//         toast.info(`${msg.senderName || 'Someone'} left the room`)
//         break
//       case 'PANEL_RESIZE':
//         if (msg.senderId !== effectiveUser?.id && msg.payload?.sizes) {
//           setSizes(msg.payload.sizes)
//         }
//         break
//       // ── Status sync from another participant ─────────────────
//       case 'STATUS_SYNC':
//         if (msg.senderId !== effectiveUser?.id && msg.payload?.status) {
//           setInterview(prev => prev ? { ...prev, status: msg.payload.status } : prev)
//           toast.info(`Interview marked as ${msg.payload.status.replace('_', ' ')}`)
//         }
//         break
//     }
//   }, [effectiveUser?.id])

//   const sendMessageRef = useRef(null)
//   const sendSignal = useCallback((msg) => {
//     if (sendMessageRef.current) {
//       sendMessageRef.current(msg)
//     }
//   }, [])

//   const {
//     localStream, remoteStreams, camOn, micOn, screenSharing, mediaReady,
//     startLocalMedia, initiateCall, handleOffer, handleAnswer, handleIceCandidate,
//     toggleCamera, toggleMic, toggleScreenShare, cleanup
//   } = useWebRTC({ roomToken, localUserId: effectiveUser?.id, sendSignal })

//   const { connected, sendMessage } = useRoomSocket({
//     roomToken,
//     userId: effectiveUser?.id,
//     guestId: guestUser?.id,
//     guestName: guestUser?.fullName,
//     onMessage: handleSocketMessage,
//     enabled: mediaReady && !!effectiveUser
//   })

//   useEffect(() => {
//     sendMessageRef.current = sendMessage
//   }, [sendMessage])

//   // ── Load interview + auto-transition SCHEDULED → IN_PROGRESS ──
//   useEffect(() => {
//     interviewApi.getByRoom(roomToken).then(async res => {
//       const iv = res.data
//       setInterview(iv)
//       // Auto-transition: move from SCHEDULED to IN_PROGRESS when entering
//       if (iv.status === 'SCHEDULED' && canManageStatus(iv)) {
//         try {
//           const updated = await interviewApi.updateStatus(iv.id, 'IN_PROGRESS')
//           setInterview(updated.data)
//           // Notify all peers about the status change
//           sendMessage({ type: 'STATUS_SYNC', payload: { status: 'IN_PROGRESS' } })
//         } catch { /* non-critical — ignore */ }
//       }
//     }).catch(() => {})
//   }, [roomToken])

//   useEffect(() => {
//     if (effectiveUser) {
//       startLocalMedia()
//     }
//     return () => cleanup()
//   }, [roomToken, effectiveUser])

//   // ── Code sync (debounced — only send if user typed) ──────────
//   const codeSyncTimer = useRef(null)
//   const handleCodeChange = useCallback((newCode) => {
//     setCode(newCode)
//     if (codeSyncTimer.current) clearTimeout(codeSyncTimer.current)
//     codeSyncTimer.current = setTimeout(() => {
//       sendMessage({ type: 'CODE_SYNC', payload: { code: newCode } })
//     }, 150)
//   }, [sendMessage])

//   // ── Language change: broadcast immediately ────────────────────
//   const handleLangChange = useCallback((selected) => {
//     setLangValue(selected.value)
//     setCode(selected.starter)
//     sendMessage({ type: 'LANG_SYNC', payload: { lang: selected.value, code: selected.starter } })
//   }, [sendMessage])

//   // ── Run code: broadcast running state + result ────────────────
//   const handleRun = useCallback(async (langVal, stdin) => {
//     setRunning(true)
//     setResult(null)
//     // Notify peers that execution started
//     sendMessage({ type: 'EXECUTION_RUNNING', payload: { langVal } })
//     try {
//       const res = await executeApi.run({
//         interviewId: interview?.id,
//         language: langVal,
//         code,
//         stdin,
//       })
//       const r = res.data
//       setResult(r)
//       setRunning(false)
//       // Broadcast the result to all peers
//       sendMessage({ type: 'EXECUTION_RESULT', payload: r })
//     } catch (err) {
//       const errorResult = { stderr: 'Execution failed: ' + (err.response?.data?.message || err.message), exitCode: 1 }
//       setResult(errorResult)
//       setRunning(false)
//       sendMessage({ type: 'EXECUTION_RESULT', payload: errorResult })
//     }
//   }, [sendMessage, interview?.id, code])

//   // ── Panel resize sync ────────────────────────────────────────
//   const handleDragWithSync = useCallback((idx, e) => {
//     startDrag(idx, e)
//     document.addEventListener('mouseup', () => {
//       sendMessage({ type: 'PANEL_RESIZE', payload: { sizes } })
//     }, { once: true })
//   }, [startDrag, sendMessage, sizes])

//   // ── Chat: optimistic add for own messages ─────────────────────
//   const handleChat = useCallback((text) => {
//     const msg = {
//       type: 'CHAT', senderId: effectiveUser?.id, senderName: effectiveUser?.fullName,
//       payload: { text }, timestamp: Date.now()
//     }
//     // Add own message immediately (optimistic)
//     setChatMessages(prev => [...prev, msg])
//     // Broadcast to peers
//     sendMessage({ type: 'CHAT', payload: { text } })
//   }, [sendMessage, effectiveUser])

//   const handleLeave = () => {
//     sendMessage({ type: 'USER_LEAVE', payload: {} })
//     cleanup()
//     navigate('/interviews')
//   }

//   const copyRoomLink = () => {
//     navigator.clipboard.writeText(window.location.href)
//     toast.info('Room link copied!')
//   }

//   /** Called when the in-room status dropdown changes */
//   const handleRoomStatusChanged = useCallback((updated) => {
//     setInterview(updated)
//     // Broadcast the new status to all room peers
//     sendMessage({ type: 'STATUS_SYNC', payload: { status: updated.status } })
//   }, [sendMessage])

//   const handleJoinAsGuest = (name) => {
//     const trimmed = name.trim()
//     if (!trimmed) return
//     const id = 'guest_' + Math.random().toString(36).substring(2, 11)
//     sessionStorage.setItem(`guest_id_${roomToken}`, id)
//     sessionStorage.setItem(`guest_name_${roomToken}`, trimmed)
//     setGuestUser({ id, fullName: trimmed })
//   }

//   if (!effectiveUser) {
//     return (
//       <div className="login-container" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#050811' }}>
//         <div className="card" style={{ width:'100%', maxWidth:400, padding:32, textAlign:'center' }}>
//           <div style={{ width:48, height:48, borderRadius:12, background:'var(--gradient-primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
//             <Code2 size={24} color="white" />
//           </div>
//           <h2 style={{ fontSize:24, fontWeight:600, color:'white', marginBottom:8 }}>Join Interview</h2>
//           <p style={{ color:'var(--text-muted)', fontSize:14, marginBottom:24 }}>
//             {interview ? `You have been invited to "${interview.title}"` : 'Enter your name to join the room.'}
//           </p>
//           <form onSubmit={(e) => { e.preventDefault(); handleJoinAsGuest(guestInput) }}>
//             <div className="form-group" style={{ marginBottom:20, textAlign:'left' }}>
//               <label className="input-label">Your Name</label>
//               <input
//                 className="input-field"
//                 value={guestInput}
//                 onChange={e => setGuestInput(e.target.value)}
//                 required
//                 placeholder="Enter your name"
//                 autoFocus
//               />
//             </div>
//             <button type="submit" className="btn btn-primary" style={{ width:'100%' }}>
//               Join Meeting
//             </button>
//           </form>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="room-layout">
//       {/* Header */}
//       <div className="room-header">
//         <div className="room-header-left">
//           <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//             <div style={{ width:28,height:28,borderRadius:6,background:'var(--gradient-primary)',display:'flex',alignItems:'center',justifyContent:'center' }}>
//               <Code2 size={14} color="white" />
//             </div>
//             <span className="room-title">{interview?.title || 'Interview Room'}</span>
//           </div>
//           <div className="room-badge">
//             <div className={`room-badge-dot`} style={{ background: connected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
//             {connected ? 'Live' : 'Connecting...'}
//           </div>
//           <span className="text-muted text-sm">
//             {1 + Object.keys(remoteStreams).length}/{3} participants
//           </span>
//         </div>
//         <div className="room-header-controls">
//           {/* Status selector — visible to all participants, editable only for authorized ones */}
//           <RoomStatusSelector
//             interview={interview}
//             onStatusChanged={handleRoomStatusChanged}
//             canManage={canManageStatus(interview)}
//           />
//           <button className="btn btn-secondary btn-sm" onClick={copyRoomLink}>
//             <Copy size={14} /> Invite
//           </button>
//           <button className="btn btn-danger btn-sm" onClick={handleLeave}>
//             <PhoneOff size={14} /> Leave
//           </button>
//         </div>
//       </div>

//       {/* Main 3-panel body */}
//       <div className="room-body" ref={containerRef} style={{ display:'flex', flex:1, overflow:'hidden' }}>
//         {/* Video Panel */}
//         <div className="panel video-panel" style={{ width: `${sizes[0]}%`, minWidth: 160 }}>
//           <div className="panel-header">
//             <span className="panel-header-title"><Users size={12} /> Video</span>
//           </div>
//           <div className="panel-body">
//             <VideoPanel
//               localStream={localStream}
//               remoteStreams={remoteStreams}
//               camOn={camOn} micOn={micOn}
//               localUser={effectiveUser}
//               peers={peers}
//             />
//           </div>
//         </div>

//         {/* Drag handle 1 */}
//         <div className="drag-handle drag-handle-h" onMouseDown={e => handleDragWithSync(0, e)} />

//         {/* IDE Panel */}
//         <div className="panel ide-panel" style={{ width: `${sizes[1]}%`, minWidth: 250 }}>
//           <div className="panel-header">
//             <span className="panel-header-title"><Code2 size={12} /> Code Editor</span>
//             <span className="text-xs text-muted">Shared — visible to all participants</span>
//           </div>
//           <div className="panel-body" style={{ height: '100%' }}>
//             <IDEPanel
//               code={code}
//               onCodeChange={handleCodeChange}
//               langValue={langValue}
//               onLangChange={handleLangChange}
//               running={running}
//               result={result}
//               interviewId={interview?.id}
//               onRun={handleRun}
//             />
//           </div>
//         </div>

//         {/* Drag handle 2 */}
//         <div className="drag-handle drag-handle-h" onMouseDown={e => handleDragWithSync(1, e)} />

//         {/* Chat Panel */}
//         <div className="panel chat-panel" style={{ width: `${sizes[2]}%`, minWidth: 180 }}>
//           <div className="panel-header">
//             <span className="panel-header-title"><MessageSquare size={12} /> Chat</span>
//           </div>
//           <div className="panel-body" style={{ height:'100%' }}>
//             <ChatPanel
//               messages={chatMessages}
//               onSend={handleChat}
//               userId={effectiveUser?.id}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Controls Bar */}
//       <div className="controls-bar">
//         <button
//           className={`control-btn ${!micOn ? 'muted' : ''}`}
//           onClick={toggleMic}
//           title={micOn ? 'Mute microphone' : 'Unmute microphone'}
//         >
//           {micOn ? <Mic size={20} /> : <MicOff size={20} />}
//         </button>

//         <button
//           className={`control-btn ${!camOn ? 'muted' : ''}`}
//           onClick={toggleCamera}
//           title={camOn ? 'Turn off camera' : 'Turn on camera'}
//         >
//           {camOn ? <Video size={20} /> : <VideoOff size={20} />}
//         </button>

//         <button
//           className={`control-btn ${screenSharing ? 'active' : ''}`}
//           onClick={toggleScreenShare}
//           title={screenSharing ? 'Stop sharing' : 'Share screen'}
//         >
//           {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
//         </button>

//         <div style={{ width:1, height:32, background:'var(--border-subtle)' }} />

//         <button className="control-btn danger" onClick={handleLeave} title="Leave interview">
//           <PhoneOff size={20} />
//         </button>
//       </div>
//     </div>
//   )
// }

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { interviewApi, executeApi } from '../services/api'
import { useWebRTC } from '../hooks/useWebRTC'
import { useRoomSocket } from '../hooks/useRoomSocket'
import { useResizablePanels } from '../hooks/useResizablePanels'
import Editor from '@monaco-editor/react'
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, Send, Play, Code2, MessageSquare, Users,
  Copy, ChevronDown
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'

const ALL_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

function RoomStatusSelector({ interview, onStatusChanged, canManage }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  if (!interview) return null

  if (!canManage) {
    return (
      <span className={`status-select ${interview.status?.toLowerCase()}`}
        style={{ cursor: 'default', backgroundImage: 'none', paddingRight: 10 }}>
        {interview.status?.replace('_', ' ')}
      </span>
    )
  }

  const handleChange = async (e) => {
    const newStatus = e.target.value
    if (newStatus === interview.status || busy) return
    setBusy(true)
    try {
      const res = await interviewApi.updateStatus(interview.id, newStatus)
      onStatusChanged(res.data)
      toast.success(`Status → ${newStatus.replace('_', ' ')}`)
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

// ─── Video Panel ──────────────────────────────────────────────
function VideoPanel({ localStream, remoteStreams, camOn, micOn, localUser, peers }) {
  const localVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const peerCount = 1 + Object.keys(remoteStreams).length
  const gridClass = peerCount <= 1 ? 'peers-1' : peerCount === 2 ? 'peers-2' : 'peers-3'

  return (
    <div className={`video-grid ${gridClass}`} style={{ background: '#050811' }}>
      <div className="video-tile">
        {localStream && camOn ? (
          <video ref={localVideoRef} autoPlay muted playsInline style={{ transform: 'scaleX(-1)' }} />
        ) : (
          <div className="video-avatar-fallback">
            <span>{localUser?.fullName?.substring(0, 2)?.toUpperCase() || 'ME'}</span>
          </div>
        )}
        <div className="video-tile-overlay">
          <span className="video-tile-name">{localUser?.fullName || 'You'} (You)</span>
          {!micOn && <MicOff size={14} className="video-tile-muted" />}
        </div>
      </div>
      {Object.values(remoteStreams).map(({ stream, peerId }) => (
        <RemoteVideoTile key={peerId} stream={stream} peerName={peers?.[peerId]?.name || peerId?.substring(0, 8)} />
      ))}
    </div>
  )
}

function RemoteVideoTile({ stream, peerName }) {
  const videoRef = useRef(null)
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay playsInline />
      <div className="video-tile-overlay">
        <span className="video-tile-name">{peerName}</span>
      </div>
    </div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────
function ChatPanel({ messages, onSend, userId }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="chat-panel" style={{ height: '100%' }}>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontSize: 13 }}>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === userId
          return (
            <div key={i} className={`chat-msg ${isOwn ? 'own' : ''}`}>
              <div className="chat-msg-avatar">
                {msg.senderName?.substring(0, 2)?.toUpperCase() || '?'}
              </div>
              <div className="chat-bubble">
                {!isOwn && <div className="chat-bubble-name">{msg.senderName}</div>}
                <div className="chat-bubble-text">{msg.payload?.text}</div>
                <div className="chat-bubble-time">
                  {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Send a message..."
        />
        <button className="btn btn-primary btn-icon" onClick={handleSend}><Send size={14} /></button>
      </div>
    </div>
  )
}

// ─── IDE Panel ────────────────────────────────────────────────
const LANGS = [
  { value: 'PYTHON', label: 'Python', monaco: 'python', starter: 'print("Hello, World!")' },
  { value: 'JAVA',   label: 'Java',   monaco: 'java',   starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { value: 'GO',     label: 'Go',     monaco: 'go',     starter: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { value: 'CPP',    label: 'C++',    monaco: 'cpp',    starter: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  { value: 'C',      label: 'C',      monaco: 'c',      starter: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
]

function IDEPanel({ code, onCodeChange, langValue, onLangChange, running, result, interviewId, onRun, theme }) {
  const lang = LANGS.find(l => l.value === langValue) || LANGS[0]
  const [stdin, setStdin] = useState('')

  const handleLangChange = (val) => {
    const selected = LANGS.find(l => l.value === val)
    onLangChange(selected)
  }

  const outputClass = running ? 'running' : result?.exitCode === 0 ? 'success' : result ? 'error' : ''

  return (
    <div className="ide-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="ide-toolbar">
        <Code2 size={14} style={{ color: 'var(--accent-primary)' }} />
        <select className="lang-selector" value={lang.value} onChange={e => handleLangChange(e.target.value)}>
          {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" onClick={() => onRun(lang.value, stdin)} disabled={running}>
          {running ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Play size={14} />}
          {running ? 'Running...' : 'Run'}
        </button>
      </div>
      <div className="ide-editor-wrap" style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={lang.monaco}
          value={code}
          onChange={val => onCodeChange(val || '')}
          theme={theme === 'classic' || theme === 'github' ? 'light' : 'vs-dark'}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
      <div className="ide-output">
        <div className="ide-output-header">
          <span className="ide-output-label">Output</span>
          {result && (
            <span style={{ fontSize: 11, color: result.exitCode === 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {result.timedOut ? '⏱ Timed Out' : result.exitCode === 0 ? '✓ Success' : `✗ Exit ${result.exitCode}`}
              {result.stdout && !result.timedOut ? ` · ${result.executionTimeMs ?? '?'}ms` : ''}
            </span>
          )}
        </div>
        <div className={`ide-output-body ${outputClass}`}>
          {running && '⏳ Executing...'}
          {!running && result && (result.stdout || result.stderr || 'No output')}
          {!running && !result && <span style={{ color: 'var(--text-muted)' }}>Run code to see output here</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Main Room Page ────────────────────────────────────────────
export default function InterviewRoomPage() {
  const { roomToken } = useParams()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const toast = useToast()
  const { theme } = useTheme()

  const [interview, setInterview] = useState(null)

  const [guestUser, setGuestUser] = useState(() => {
    const savedId = sessionStorage.getItem(`guest_id_${roomToken}`)
    const savedName = sessionStorage.getItem(`guest_name_${roomToken}`)
    if (savedId && savedName) return { id: savedId, fullName: savedName }
    return null
  })

  const [guestInput, setGuestInput] = useState('')
  const effectiveUser = user || guestUser

  const canManageStatus = useCallback((iv) => {
    if (!user || !iv) return false
    if (hasRole('ADMIN')) return true
    if (hasRole('INTERVIEWER') && iv.interviewer?.id === user.id) return true
    if (hasRole('CANDIDATE') && iv.candidate?.id === user.id) return true
    return false
  }, [user, hasRole])

  const [code, setCode] = useState('print("Hello, World!")')
  const [langValue, setLangValue] = useState('PYTHON')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [peers, setPeers] = useState({})
  const { sizes, containerRef, startDrag, setSizes } = useResizablePanels([25, 50, 25])

  // ── sendSignal via stable ref (avoids circular dependency with useWebRTC) ──
  const sendMessageRef = useRef(null)
  const sendSignal = useCallback((msg) => {
    sendMessageRef.current?.(msg)
  }, [])

  // ── WebRTC hook — always mounted, socket enabled only after media ready ──
  const {
    localStream, remoteStreams, camOn, micOn, screenSharing, mediaReady,
    startLocalMedia, initiateCall, handleOffer, handleAnswer, handleIceCandidate,
    toggleCamera, toggleMic, toggleScreenShare, cleanup,
  } = useWebRTC({ roomToken, localUserId: effectiveUser?.id, sendSignal })

  // ── WebSocket message handler ────────────────────────────────
  // FIX 1: handleOffer/handleAnswer/handleIceCandidate are now defined BEFORE
  // handleSocketMessage so the callback always has their latest reference.
  // Previously they were referenced before being declared, causing stale closures
  // where ICE candidates and offers were routed to old no-op function references.
  const handleSocketMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'WEBRTC_OFFER':
        if (msg.targetPeerId === effectiveUser?.id) {
          handleOffer(msg.senderId, msg.payload)
        }
        break
      case 'WEBRTC_ANSWER':
        if (msg.targetPeerId === effectiveUser?.id) {
          handleAnswer(msg.senderId, msg.payload)
        }
        break
      case 'ICE_CANDIDATE':
        if (msg.targetPeerId === effectiveUser?.id) {
          handleIceCandidate(msg.senderId, msg.payload)
        }
        break
      case 'CODE_SYNC':
        if (msg.senderId !== effectiveUser?.id) setCode(msg.payload?.code ?? '')
        break
      case 'LANG_SYNC':
        if (msg.senderId !== effectiveUser?.id && msg.payload?.lang) {
          setLangValue(msg.payload.lang)
          if (msg.payload?.code !== undefined) setCode(msg.payload.code)
        }
        break
      case 'EXECUTION_RUNNING':
        if (msg.senderId !== effectiveUser?.id) { setRunning(true); setResult(null) }
        break
      case 'EXECUTION_RESULT':
        if (msg.senderId !== effectiveUser?.id) { setRunning(false); setResult(msg.payload) }
        break
      case 'CHAT':
        if (msg.senderId !== effectiveUser?.id) setChatMessages(prev => [...prev, msg])
        break
      case 'USER_JOIN':
        setPeers(prev => ({ ...prev, [msg.senderId]: { name: msg.senderName } }))
        if (msg.senderId !== effectiveUser?.id) {
          // FIX 2: removed the 500ms setTimeout — it was a band-aid that still
          // lost the race on slow connections. The fixed useWebRTC.initiateCall()
          // now awaits startLocalMedia() internally, so it's safe to call immediately.
          initiateCall(msg.senderId)
          toast.info(`${msg.senderName || 'Someone'} joined the room`)
        }
        break
      case 'USER_LEAVE':
        setPeers(prev => { const n = { ...prev }; delete n[msg.senderId]; return n })
        toast.info(`${msg.senderName || 'Someone'} left the room`)
        break
      case 'PANEL_RESIZE':
        if (msg.senderId !== effectiveUser?.id && msg.payload?.sizes) setSizes(msg.payload.sizes)
        break
      case 'STATUS_SYNC':
        if (msg.senderId !== effectiveUser?.id && msg.payload?.status) {
          setInterview(prev => prev ? { ...prev, status: msg.payload.status } : prev)
          toast.info(`Interview marked as ${msg.payload.status.replace('_', ' ')}`)
        }
        break
    }
  }, [effectiveUser?.id, handleOffer, handleAnswer, handleIceCandidate, initiateCall, setSizes, toast])

  // FIX 3: Socket is enabled as soon as effectiveUser exists.
  // USER_JOIN is no longer sent from useRoomSocket — we send it ourselves
  // after mediaReady (see useEffect below), so peers won't try to call us
  // before our mic/camera tracks exist.
  const { connected, sendMessage } = useRoomSocket({
    roomToken,
    userId: effectiveUser?.id,
    guestId: guestUser?.id,
    guestName: effectiveUser?.fullName,
    onMessage: handleSocketMessage,
    enabled: !!effectiveUser,   // connect immediately; we gate USER_JOIN separately
  })

  useEffect(() => {
    sendMessageRef.current = sendMessage
  }, [sendMessage])

  // FIX 4: Announce presence only after BOTH socket is connected AND media is
  // ready. Previously USER_JOIN was sent inside useRoomSocket onConnect before
  // startLocalMedia() had resolved, so peers called initiateCall() on us while
  // localStreamRef was still null — audio/video tracks were never attached.
  const joinAnnouncedRef = useRef(false)
  useEffect(() => {
    if (!connected || !mediaReady || joinAnnouncedRef.current) return
    joinAnnouncedRef.current = true
    sendMessage({
      type: 'USER_JOIN',
      payload: { userId: effectiveUser?.id },
    })
  }, [connected, mediaReady, effectiveUser?.id, sendMessage])

  // Reset join flag if user/room changes so they re-announce on reconnect
  useEffect(() => {
    joinAnnouncedRef.current = false
  }, [roomToken, effectiveUser?.id])

  // ── Start media as soon as we have a user ────────────────────
  useEffect(() => {
    if (!effectiveUser) return
    startLocalMedia()
    return () => cleanup()
  }, [roomToken, effectiveUser?.id])

  // ── Load interview + auto-transition SCHEDULED → IN_PROGRESS ──
  useEffect(() => {
    interviewApi.getByRoom(roomToken).then(async res => {
      const iv = res.data
      setInterview(iv)
      if (iv.status === 'SCHEDULED' && canManageStatus(iv)) {
        try {
          const updated = await interviewApi.updateStatus(iv.id, 'IN_PROGRESS')
          setInterview(updated.data)
          sendMessage({ type: 'STATUS_SYNC', payload: { status: 'IN_PROGRESS' } })
        } catch { /* non-critical */ }
      }
    }).catch(() => {})
  }, [roomToken])

  // ── Code sync (debounced) ─────────────────────────────────────
  const codeSyncTimer = useRef(null)
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode)
    if (codeSyncTimer.current) clearTimeout(codeSyncTimer.current)
    codeSyncTimer.current = setTimeout(() => {
      sendMessage({ type: 'CODE_SYNC', payload: { code: newCode } })
    }, 150)
  }, [sendMessage])

  // ── Language change ───────────────────────────────────────────
  const handleLangChange = useCallback((selected) => {
    setLangValue(selected.value)
    setCode(selected.starter)
    sendMessage({ type: 'LANG_SYNC', payload: { lang: selected.value, code: selected.starter } })
  }, [sendMessage])

  // ── Run code ──────────────────────────────────────────────────
  const handleRun = useCallback(async (langVal, stdin) => {
    setRunning(true)
    setResult(null)
    sendMessage({ type: 'EXECUTION_RUNNING', payload: { langVal } })
    try {
      const res = await executeApi.run({ interviewId: interview?.id, language: langVal, code, stdin })
      const r = res.data
      setResult(r)
      setRunning(false)
      sendMessage({ type: 'EXECUTION_RESULT', payload: r })
    } catch (err) {
      const errorResult = { stderr: 'Execution failed: ' + (err.response?.data?.message || err.message), exitCode: 1 }
      setResult(errorResult)
      setRunning(false)
      sendMessage({ type: 'EXECUTION_RESULT', payload: errorResult })
    }
  }, [sendMessage, interview?.id, code])

  // ── Panel resize sync ─────────────────────────────────────────
  const handleDragWithSync = useCallback((idx, e) => {
    startDrag(idx, e)
    document.addEventListener('mouseup', () => {
      sendMessage({ type: 'PANEL_RESIZE', payload: { sizes } })
    }, { once: true })
  }, [startDrag, sendMessage, sizes])

  // ── Chat ──────────────────────────────────────────────────────
  const handleChat = useCallback((text) => {
    const msg = {
      type: 'CHAT', senderId: effectiveUser?.id, senderName: effectiveUser?.fullName,
      payload: { text }, timestamp: Date.now(),
    }
    setChatMessages(prev => [...prev, msg])
    sendMessage({ type: 'CHAT', payload: { text } })
  }, [sendMessage, effectiveUser])

  const handleLeave = () => {
    sendMessage({ type: 'USER_LEAVE', payload: {} })
    cleanup()
    navigate('/interviews')
  }

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.info('Room link copied!')
  }

  const handleRoomStatusChanged = useCallback((updated) => {
    setInterview(updated)
    sendMessage({ type: 'STATUS_SYNC', payload: { status: updated.status } })
  }, [sendMessage])

  const handleJoinAsGuest = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = 'guest_' + Math.random().toString(36).substring(2, 11)
    sessionStorage.setItem(`guest_id_${roomToken}`, id)
    sessionStorage.setItem(`guest_name_${roomToken}`, trimmed)
    setGuestUser({ id, fullName: trimmed })
  }

  if (!effectiveUser) {
    return (
      <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050811' }}>
        <div className="card" style={{ width: '100%', maxWidth: 400, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Code2 size={24} color="white" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'white', marginBottom: 8 }}>Join Interview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            {interview ? `You have been invited to "${interview.title}"` : 'Enter your name to join the room.'}
          </p>
          <form onSubmit={(e) => { e.preventDefault(); handleJoinAsGuest(guestInput) }}>
            <div className="form-group" style={{ marginBottom: 20, textAlign: 'left' }}>
              <label className="input-label">Your Name</label>
              <input
                className="input-field"
                value={guestInput}
                onChange={e => setGuestInput(e.target.value)}
                required
                placeholder="Enter your name"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Join Meeting
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="room-layout">
      <div className="room-header">
        <div className="room-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={14} color="white" />
            </div>
            <span className="room-title">{interview?.title || 'Interview Room'}</span>
          </div>
          <div className="room-badge">
            <div className="room-badge-dot" style={{ background: connected ? 'var(--accent-green)' : 'var(--accent-red)' }} />
            {connected ? 'Live' : 'Connecting...'}
          </div>
          <span className="text-muted text-sm">
            {1 + Object.keys(remoteStreams).length}/{3} participants
          </span>
        </div>
        <div className="room-header-controls">
          <ThemeToggle />
          <RoomStatusSelector
            interview={interview}
            onStatusChanged={handleRoomStatusChanged}
            canManage={canManageStatus(interview)}
          />
          <button className="btn btn-secondary btn-sm" onClick={copyRoomLink}>
            <Copy size={14} /> Invite
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLeave}>
            <PhoneOff size={14} /> Leave
          </button>
        </div>
      </div>

      <div className="room-body" ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div className="panel video-panel" style={{ width: `${sizes[0]}%`, minWidth: 160 }}>
          <div className="panel-header">
            <span className="panel-header-title"><Users size={12} /> Video</span>
          </div>
          <div className="panel-body">
            <VideoPanel
              localStream={localStream}
              remoteStreams={remoteStreams}
              camOn={camOn} micOn={micOn}
              localUser={effectiveUser}
              peers={peers}
            />
          </div>
        </div>

        <div className="drag-handle drag-handle-h" onMouseDown={e => handleDragWithSync(0, e)} />

        <div className="panel ide-panel" style={{ width: `${sizes[1]}%`, minWidth: 250 }}>
          <div className="panel-header">
            <span className="panel-header-title"><Code2 size={12} /> Code Editor</span>
            <span className="text-xs text-muted">Shared — visible to all participants</span>
          </div>
          <div className="panel-body" style={{ height: '100%' }}>
            <IDEPanel
              code={code}
              onCodeChange={handleCodeChange}
              langValue={langValue}
              onLangChange={handleLangChange}
              running={running}
              result={result}
              interviewId={interview?.id}
              onRun={handleRun}
              theme={theme}
            />
          </div>
        </div>

        <div className="drag-handle drag-handle-h" onMouseDown={e => handleDragWithSync(1, e)} />

        <div className="panel chat-panel" style={{ width: `${sizes[2]}%`, minWidth: 180 }}>
          <div className="panel-header">
            <span className="panel-header-title"><MessageSquare size={12} /> Chat</span>
          </div>
          <div className="panel-body" style={{ height: '100%' }}>
            <ChatPanel
              messages={chatMessages}
              onSend={handleChat}
              userId={effectiveUser?.id}
            />
          </div>
        </div>
      </div>

      <div className="controls-bar">
        <button className={`control-btn ${!micOn ? 'muted' : ''}`} onClick={toggleMic} title={micOn ? 'Mute microphone' : 'Unmute microphone'}>
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button className={`control-btn ${!camOn ? 'muted' : ''}`} onClick={toggleCamera} title={camOn ? 'Turn off camera' : 'Turn on camera'}>
          {camOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button className={`control-btn ${screenSharing ? 'active' : ''}`} onClick={toggleScreenShare} title={screenSharing ? 'Stop sharing' : 'Share screen'}>
          {screenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>
        <div style={{ width: 1, height: 32, background: 'var(--border-subtle)' }} />
        <button className="control-btn danger" onClick={handleLeave} title="Leave interview">
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  )
}
