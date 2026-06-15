// import { useRef, useEffect, useCallback, useState } from 'react'

// const ICE_SERVERS = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' },
//     { urls: 'stun:stun1.l.google.com:19302' },
//   ]
// }

// export function useWebRTC({ roomToken, localUserId, sendSignal, maxPeers = 3 }) {
//   const localStreamRef = useRef(null)
//   const peerConnections = useRef({})  // peerId -> RTCPeerConnection
//   const [localStream, setLocalStream] = useState(null)
//   const [remoteStreams, setRemoteStreams] = useState({})  // peerId -> { stream, peerId, peerName }
//   const [camOn, setCamOn] = useState(true)
//   const [micOn, setMicOn] = useState(true)
//   const [screenSharing, setScreenSharing] = useState(false)
//   const screenTrackRef = useRef(null)
//   const [mediaReady, setMediaReady] = useState(false)

//   const getOrCreatePC = useCallback((peerId) => {
//     if (peerConnections.current[peerId]) return peerConnections.current[peerId]

//     const pc = new RTCPeerConnection(ICE_SERVERS)

//     pc.onicecandidate = e => {
//       if (e.candidate) {
//         sendSignal({ type: 'ICE_CANDIDATE', targetPeerId: peerId, payload: e.candidate })
//       }
//     }

//     pc.ontrack = e => {
//       setRemoteStreams(prev => ({
//         ...prev,
//         [peerId]: { stream: e.streams[0], peerId }
//       }))
//     }

//     pc.onconnectionstatechange = () => {
//       if (['disconnected','failed','closed'].includes(pc.connectionState)) {
//         setRemoteStreams(prev => { const n = { ...prev }; delete n[peerId]; return n })
//         delete peerConnections.current[peerId]
//       }
//     }

//     // Add local tracks
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => {
//         pc.addTrack(track, localStreamRef.current)
//       })
//     }

//     peerConnections.current[peerId] = pc
//     return pc
//   }, [sendSignal])

//   const startLocalMedia = useCallback(async () => {
//     setMediaReady(false)
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       localStreamRef.current = stream
//       setLocalStream(stream)
//       setCamOn(true)
//       setMicOn(true)
//       return stream
//     } catch (err) {
//       console.warn("Failed to get both video and audio, trying audio only...", err)
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
//         localStreamRef.current = stream
//         setLocalStream(stream)
//         setCamOn(false)
//         setMicOn(true)
//         return stream
//       } catch (err2) {
//         console.warn("Failed to get audio stream, trying video only...", err2)
//         try {
//           const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//           localStreamRef.current = stream
//           setLocalStream(stream)
//           setCamOn(true)
//           setMicOn(false)
//           return stream
//         } catch (err3) {
//           console.error("All media device requests failed:", err3)
//           localStreamRef.current = null
//           setLocalStream(null)
//           setCamOn(false)
//           setMicOn(false)
//           return null
//         }
//       }
//     } finally {
//       setMediaReady(true)
//     }
//   }, [])

//   const initiateCall = useCallback(async (peerId) => {
//     const pc = getOrCreatePC(peerId)
//     const offer = await pc.createOffer()
//     await pc.setLocalDescription(offer)
//     sendSignal({ type: 'WEBRTC_OFFER', targetPeerId: peerId, payload: offer })
//   }, [getOrCreatePC, sendSignal])

//   const handleOffer = useCallback(async (fromId, offer) => {
//     const pc = getOrCreatePC(fromId)
//     await pc.setRemoteDescription(new RTCSessionDescription(offer))
//     const answer = await pc.createAnswer()
//     await pc.setLocalDescription(answer)
//     sendSignal({ type: 'WEBRTC_ANSWER', targetPeerId: fromId, payload: answer })
//   }, [getOrCreatePC, sendSignal])

//   const handleAnswer = useCallback(async (fromId, answer) => {
//     const pc = peerConnections.current[fromId]
//     if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer))
//   }, [])

//   const handleIceCandidate = useCallback(async (fromId, candidate) => {
//     const pc = peerConnections.current[fromId]
//     if (pc) {
//       try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch {}
//     }
//   }, [])

//   const toggleCamera = useCallback(() => {
//     if (localStreamRef.current) {
//       const tracks = localStreamRef.current.getVideoTracks()
//       if (tracks.length > 0) {
//         tracks.forEach(t => {
//           t.enabled = !t.enabled
//         })
//         setCamOn(prev => !prev)
//       }
//     }
//   }, [])

//   const toggleMic = useCallback(() => {
//     if (localStreamRef.current) {
//       const tracks = localStreamRef.current.getAudioTracks()
//       if (tracks.length > 0) {
//         tracks.forEach(t => {
//           t.enabled = !t.enabled
//         })
//         setMicOn(prev => !prev)
//       }
//     }
//   }, [])

//   const toggleScreenShare = useCallback(async () => {
//     if (screenSharing) {
//       // Stop screen sharing, revert to camera
//       if (screenTrackRef.current) {
//         screenTrackRef.current.stop()
//         screenTrackRef.current = null
//       }
//       const videoTrack = localStreamRef.current?.getVideoTracks()[0]
//       Object.values(peerConnections.current).forEach(pc => {
//         const sender = pc.getSenders().find(s => s.track?.kind === 'video')
//         if (sender) {
//           sender.replaceTrack(videoTrack || null)
//         }
//       })
//       setScreenSharing(false)
//     } else {
//       try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
//         const screenTrack = screenStream.getVideoTracks()[0]
//         screenTrackRef.current = screenTrack
//         Object.values(peerConnections.current).forEach(pc => {
//           const sender = pc.getSenders().find(s => s.track?.kind === 'video')
//           if (sender) {
//             sender.replaceTrack(screenTrack)
//           } else {
//             pc.addTrack(screenTrack, screenStream)
//           }
//         })
//         screenTrack.onended = () => {
//           const videoTrack = localStreamRef.current?.getVideoTracks()[0]
//           Object.values(peerConnections.current).forEach(pc => {
//             const sender = pc.getSenders().find(s => s.track?.kind === 'video')
//             if (sender) {
//               sender.replaceTrack(videoTrack || null)
//             }
//           })
//           setScreenSharing(false)
//           screenTrackRef.current = null
//         }
//         setScreenSharing(true)
//       } catch (err) {
//         console.warn('Screen sharing failed:', err)
//       }
//     }
//   }, [screenSharing])

//   const cleanup = useCallback(() => {
//     localStreamRef.current?.getTracks().forEach(t => t.stop())
//     Object.values(peerConnections.current).forEach(pc => pc.close())
//     peerConnections.current = {}
//   }, [])

//   return {
//     localStream, remoteStreams, camOn, micOn, screenSharing, mediaReady,
//     startLocalMedia, initiateCall, handleOffer, handleAnswer, handleIceCandidate,
//     toggleCamera, toggleMic, toggleScreenShare, cleanup
//   }
// }
import { useRef, useCallback, useState } from 'react'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // TURN servers — required when peers are behind NAT/firewall (most real networks)
    // These are FREE public servers for TESTING ONLY — replace with your own for production
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ]
}

export function useWebRTC({ roomToken, localUserId, sendSignal, maxPeers = 3 }) {
  const localStreamRef = useRef(null)
  const peerConnections = useRef({})        // peerId -> RTCPeerConnection
  const pendingCandidates = useRef({})      // peerId -> RTCIceCandidate[]  (buffered before remoteDesc is set)

  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({})  // peerId -> { stream, peerId }
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [mediaReady, setMediaReady] = useState(false)

  const screenTrackRef = useRef(null)

  // ─── helpers ────────────────────────────────────────────────────────────────

  /** Attach every local track to a PC. Called after media is confirmed ready. */
  const _addLocalTracks = useCallback((pc) => {
    const stream = localStreamRef.current
    if (!stream) {
      console.warn('[WebRTC] _addLocalTracks called before local media is ready — no tracks added')
      return
    }
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
  }, [])

  /** Flush any ICE candidates that arrived before setRemoteDescription. */
  const _flushPendingCandidates = useCallback(async (peerId, pc) => {
    const queue = pendingCandidates.current[peerId] || []
    for (const candidate of queue) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)) } catch {}
    }
    delete pendingCandidates.current[peerId]
  }, [])

  // ─── core PC factory ────────────────────────────────────────────────────────

  /**
   * FIX: getOrCreatePC no longer tries to add tracks itself.
   * Tracks are added explicitly AFTER startLocalMedia() resolves,
   * removing the race condition that caused audio (and sometimes video) to be missing.
   */
  const getOrCreatePC = useCallback((peerId) => {
    if (peerConnections.current[peerId]) return peerConnections.current[peerId]

    const pc = new RTCPeerConnection(ICE_SERVERS)

    pc.onicecandidate = e => {
      if (e.candidate) {
        sendSignal({ type: 'ICE_CANDIDATE', targetPeerId: peerId, payload: e.candidate })
      }
    }

    pc.ontrack = e => {
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: { stream: e.streams[0], peerId }
      }))
    }

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setRemoteStreams(prev => { const n = { ...prev }; delete n[peerId]; return n })
        delete peerConnections.current[peerId]
      }
    }

    peerConnections.current[peerId] = pc
    return pc
  }, [sendSignal])

  // ─── media ──────────────────────────────────────────────────────────────────

  const startLocalMedia = useCallback(async () => {
    setMediaReady(false)

    let stream = null

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setCamOn(true)
      setMicOn(true)
    } catch (err) {
      console.warn('[WebRTC] video+audio failed, trying audio-only:', err)
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        setCamOn(false)
        setMicOn(true)
      } catch (err2) {
        console.warn('[WebRTC] audio-only failed, trying video-only:', err2)
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          setCamOn(true)
          setMicOn(false)
        } catch (err3) {
          console.error('[WebRTC] All media requests failed:', err3)
          setCamOn(false)
          setMicOn(false)
        }
      }
    }

    localStreamRef.current = stream
    setLocalStream(stream)
    setMediaReady(true)
    return stream
  }, [])

  // ─── call signalling ─────────────────────────────────────────────────────────

  /**
   * FIX: await startLocalMedia() before creating the PC so that
   * _addLocalTracks() always has a live stream with both audio + video tracks.
   */
  const initiateCall = useCallback(async (peerId) => {
    // Ensure media is ready before creating/using the PC
    if (!localStreamRef.current) {
      await startLocalMedia()
    }

    const pc = getOrCreatePC(peerId)

    // Add all local tracks NOW — media is guaranteed to be ready
    _addLocalTracks(pc)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    sendSignal({ type: 'WEBRTC_OFFER', targetPeerId: peerId, payload: offer })
  }, [getOrCreatePC, sendSignal, startLocalMedia, _addLocalTracks])

  /**
   * FIX: same guard here — the answering side also needs local tracks
   * attached before negotiation completes, otherwise the remote caller
   * receives a one-way stream (they can hear/see you but you can't hear them
   * because your audio sender was never added to the PC).
   */
  const handleOffer = useCallback(async (fromId, offer) => {
    // Ensure media is ready before responding to an offer
    if (!localStreamRef.current) {
      await startLocalMedia()
    }

    const pc = getOrCreatePC(fromId)

    // Add all local tracks NOW
    _addLocalTracks(pc)

    await pc.setRemoteDescription(new RTCSessionDescription(offer))

    // Flush any ICE candidates that arrived before this offer
    await _flushPendingCandidates(fromId, pc)

    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    sendSignal({ type: 'WEBRTC_ANSWER', targetPeerId: fromId, payload: answer })
  }, [getOrCreatePC, sendSignal, startLocalMedia, _addLocalTracks, _flushPendingCandidates])

  const handleAnswer = useCallback(async (fromId, answer) => {
    const pc = peerConnections.current[fromId]
    if (!pc) return
    await pc.setRemoteDescription(new RTCSessionDescription(answer))
    // Flush buffered ICE candidates for this peer
    await _flushPendingCandidates(fromId, pc)
  }, [_flushPendingCandidates])

  /**
   * FIX: Buffer ICE candidates that arrive before setRemoteDescription is called.
   * Previously, candidates were silently dropped if the PC wasn't ready,
   * which can cause ICE failures and one-directional or broken audio.
   */
  const handleIceCandidate = useCallback(async (fromId, candidate) => {
    const pc = peerConnections.current[fromId]
    if (!pc || !pc.remoteDescription) {
      // Buffer it — remoteDescription not set yet
      if (!pendingCandidates.current[fromId]) {
        pendingCandidates.current[fromId] = []
      }
      pendingCandidates.current[fromId].push(candidate)
      return
    }
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (err) {
      console.warn('[WebRTC] Failed to add ICE candidate:', err)
    }
  }, [])

  // ─── controls ────────────────────────────────────────────────────────────────

  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() || []
    if (tracks.length === 0) return
    tracks.forEach(t => { t.enabled = !t.enabled })
    setCamOn(prev => !prev)
  }, [])

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() || []
    if (tracks.length === 0) return
    tracks.forEach(t => { t.enabled = !t.enabled })
    setMicOn(prev => !prev)
  }, [])

  const toggleScreenShare = useCallback(async () => {
    if (screenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop()
        screenTrackRef.current = null
      }
      // Revert all video senders back to camera track
      const videoTrack = localStreamRef.current?.getVideoTracks()[0] ?? null
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender && videoTrack) sender.replaceTrack(videoTrack)
      })
      setScreenSharing(false)
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]
        screenTrackRef.current = screenTrack

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(screenTrack)
          } else {
            pc.addTrack(screenTrack, screenStream)
          }
        })

        // Auto-revert when user stops sharing via browser UI
        screenTrack.onended = () => {
          const videoTrack = localStreamRef.current?.getVideoTracks()[0] ?? null
          Object.values(peerConnections.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video')
            if (sender && videoTrack) sender.replaceTrack(videoTrack)
          })
          setScreenSharing(false)
          screenTrackRef.current = null
        }

        setScreenSharing(true)
      } catch (err) {
        console.warn('[WebRTC] Screen sharing failed:', err)
      }
    }
  }, [screenSharing])

  // ─── cleanup ─────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    Object.values(peerConnections.current).forEach(pc => pc.close())
    peerConnections.current = {}
    pendingCandidates.current = {}
    setLocalStream(null)
    setRemoteStreams({})
    setMediaReady(false)
  }, [])

  // ─── public API ──────────────────────────────────────────────────────────────

  return {
    localStream, remoteStreams, camOn, micOn, screenSharing, mediaReady,
    startLocalMedia, initiateCall, handleOffer, handleAnswer, handleIceCandidate,
    toggleCamera, toggleMic, toggleScreenShare, cleanup
  }
}