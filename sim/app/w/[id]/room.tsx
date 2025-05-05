'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ClientSideSuspense, LiveblocksProvider, RoomProvider } from '@liveblocks/react/suspense'
import { createLogger } from '@/lib/logs/console-logger'

const logger = createLogger('Room')

export function Room({ children }: { children: ReactNode }) {
  const params = useParams()
  const workflowId = params.id as string
  const [connectionFailed, setConnectionFailed] = useState(false)

  // Handle connection failures by monitoring WebSocket errors
  useEffect(() => {
    const handleConnectionError = () => {
      logger.error('Liveblocks WebSocket connection failed - CSP may be blocking the connection')
      setConnectionFailed(true)
    }

    // Listen for WebSocket errors which could be CSP related
    window.addEventListener(
      'error',
      (event) => {
        if (event.target instanceof WebSocket && event.target.url.includes('liveblocks.io')) {
          handleConnectionError()
        }
      },
      true
    )

    return () => {
      window.removeEventListener('error', handleConnectionError, true)
    }
  }, [])

  // If connection fails, just render the children directly
  if (connectionFailed) {
    console.log('Rendering without Liveblocks collaboration due to connection issues')
    return <>{children}</>
  }

  return (
    <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY as string}>
      <RoomProvider
        id={`workflow-${workflowId}`}
        initialPresence={{
          cursor: null,
          selectedBlocks: [],
        }}
      >
        <ClientSideSuspense fallback={<></>}>{children}</ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
