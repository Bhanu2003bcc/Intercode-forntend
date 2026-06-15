// import { useEffect, useRef, useCallback, useState } from 'react'
// import { Client } from '@stomp/stompjs'
// import SockJS from 'sockjs-client'

// const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080'

// export function useRoomSocket({ roomToken, userId, guestId, guestName, onMessage, enabled = true }) {
//   const clientRef = useRef(null)
//   const [connected, setConnected] = useState(false)
//   const subscriptionRef = useRef(null)

//   const sendMessage = useCallback((msg) => {
//     if (clientRef.current?.connected) {
//       clientRef.current.publish({
//         destination: `/app/room/${roomToken}`,
//         body: JSON.stringify(msg),
//       })
//     }
//   }, [roomToken])

//   useEffect(() => {
//     if (!enabled || !roomToken) return

//     const token = localStorage.getItem('token')
//     const queryParams = new URLSearchParams()
//     if (token) queryParams.append('token', token)
//     if (guestId) queryParams.append('guestId', guestId)
//     if (guestName) queryParams.append('guestName', guestName)

//     const client = new Client({
//       webSocketFactory: () => new SockJS(`${WS_BASE}/ws?${queryParams.toString()}`),
//       reconnectDelay: 3000,
//       heartbeatIncoming: 10000,
//       heartbeatOutgoing: 10000,
//       onConnect: () => {
//         setConnected(true)
//         // Subscribe to the room topic
//         subscriptionRef.current = client.subscribe(
//           `/topic/room/${roomToken}`,
//           frame => {
//             try {
//               const msg = JSON.parse(frame.body)
//               onMessage(msg)
//             } catch {}
//           }
//         )
//         // Also subscribe to personal queue for WebRTC peer-to-peer signaling
//         client.subscribe(
//           `/user/queue/room/${roomToken}`,
//           frame => {
//             try {
//               const msg = JSON.parse(frame.body)
//               onMessage(msg)
//             } catch {}
//           }
//         )
//         // Announce join
//         client.publish({
//           destination: `/app/room/${roomToken}`,
//           body: JSON.stringify({ type: 'USER_JOIN', payload: { userId } })
//         })
//       },
//       onDisconnect: () => setConnected(false),
//       onStompError: () => setConnected(false),
//     })

//     client.activate()
//     clientRef.current = client

//     return () => {
//       if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
//       client.deactivate()
//     }
//   }, [roomToken, userId, enabled])

//   return { connected, sendMessage }
// }
import { useEffect, useRef, useCallback, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8080'

export function useRoomSocket({
  roomToken,
  userId,
  guestId,
  guestName,
  onMessage,
  enabled = true,
}) {
  const clientRef = useRef(null)
  const subscriptionRef = useRef(null)
  const [connected, setConnected] = useState(false)

  // FIX 2: Always call the latest onMessage, never a stale closure.
  // Wrap in a ref so the effect doesn't re-run when onMessage identity changes.
  const onMessageRef = useRef(onMessage)
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])

  const sendMessage = useCallback((msg) => {
    if (clientRef.current?.connected) {
      const enrichedMsg = {
        senderId: userId,
        senderName: guestName || 'Anonymous',
        ...msg
      }
      clientRef.current.publish({
        destination: `/app/room/${roomToken}`,
        body: JSON.stringify(enrichedMsg),
      })
    }
  }, [roomToken, userId, guestName])

  useEffect(() => {
    if (!enabled || !roomToken) return

    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()
    if (token) queryParams.append('token', token)
    if (guestId) queryParams.append('guestId', guestId)
    if (guestName) queryParams.append('guestName', guestName)

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_BASE}/ws?${queryParams.toString()}`),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        setConnected(true)

        // Room broadcast channel
        subscriptionRef.current = client.subscribe(
          `/topic/room/${roomToken}`,
          frame => {
            try { onMessageRef.current(JSON.parse(frame.body)) } catch {}
          }
        )

        // Personal queue for WebRTC peer-to-peer signaling
        client.subscribe(
          `/user/queue/room/${roomToken}`,
          frame => {
            try { onMessageRef.current(JSON.parse(frame.body)) } catch {}
          }
        )

        // FIX 1: USER_JOIN removed from here.
        // Publish it from your component AFTER startLocalMedia() resolves
        // so peers don't try to call you before your mic/camera are ready.
        // See usage example below.
      },

      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error('[Socket] STOMP error:', frame)
        setConnected(false)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      subscriptionRef.current?.unsubscribe()
      client.deactivate()
      setConnected(false)
    }
  }, [roomToken, userId, enabled]) // onMessage intentionally excluded — handled via ref

  return { connected, sendMessage }
}