'use client'

import { useState } from 'react'
import { useOthers, useSelf } from '@liveblocks/react/suspense'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserAvatar } from './components/user-avatar/user-avatar'

// Define the type for user info
interface UserInfo {
  name?: string
  color?: string
  id?: string
  [key: string]: any
}

export function UserAvatarStack() {
  const others = useOthers()
  const currentUser = useSelf()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Maximum number of avatars to show (excluding current user)
  const MAX_DISPLAYED_USERS = 1 // Only show 1 other user + current user
  const visibleOthers = others.slice(0, MAX_DISPLAYED_USERS)
  const hiddenOthers = others.slice(MAX_DISPLAYED_USERS)
  const hasMoreUsers = others.length > MAX_DISPLAYED_USERS
  const additionalUsersCount = others.length - MAX_DISPLAYED_USERS

  // If there are no other users (not counting current user), don't render anything
  if (others.length === 0) {
    return null
  }

  // Get current user info or default to empty object
  const currentUserInfo = (currentUser?.info || {}) as UserInfo

  // Generate tooltip content for a user
  const generateTooltipContent = (
    connectionId: number,
    info: any,
    isCurrentUser: boolean = false
  ) => {
    const userInfo = (info || {}) as UserInfo
    return (
      <div className="flex flex-col">
        <span className="font-medium">
          {userInfo.name || (isCurrentUser ? 'You' : `User ${connectionId}`)}
        </span>
        <span className="text-xs text-muted-foreground">
          {isCurrentUser ? 'Current user' : 'Connected'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center ml-2">
      <div className="flex -space-x-2">
        {/* Show current user first */}
        {currentUser && (
          <UserAvatar
            connectionId={currentUser.connectionId}
            name={currentUserInfo.name || 'You'}
            color={currentUserInfo.color}
            size="sm"
            index={0} // Current user always on top (z-index)
            tooltipContent={generateTooltipContent(
              currentUser.connectionId,
              currentUser.info,
              true
            )}
          />
        )}

        {/* Show limited number of other users */}
        {visibleOthers.map(({ connectionId, presence, info }, idx) => {
          const userInfo = (info || {}) as UserInfo

          return (
            <UserAvatar
              key={connectionId}
              connectionId={connectionId}
              name={userInfo.name || `U${connectionId}`}
              color={userInfo.color}
              size="sm"
              index={idx + 1} // +1 as current user is index 0
              tooltipContent={generateTooltipContent(connectionId, info)}
            />
          )
        })}

        {/* Show dropdown for additional users */}
        {hasMoreUsers && (
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center bg-muted text-[10px] font-medium text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                style={{ marginLeft: '-0.5rem' }}
              >
                +{additionalUsersCount}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 p-2 max-h-60 overflow-y-auto"
              side="bottom"
              align="start"
              sideOffset={5}
            >
              <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                All Users in Room
              </div>

              {/* List current user first */}
              {currentUser && (
                <div className="flex items-center gap-2 p-1 rounded hover:bg-muted/50 mb-1">
                  <UserAvatar
                    connectionId={currentUser.connectionId}
                    name={currentUserInfo.name || 'You'}
                    color={currentUserInfo.color}
                    size="sm"
                    tooltipContent={null}
                  />
                  <div className="overflow-hidden">
                    <div className="font-medium text-sm truncate">
                      {currentUserInfo.name || 'You'}
                    </div>
                    <div className="text-xs text-muted-foreground">Current user</div>
                  </div>
                </div>
              )}

              {/* List all other users */}
              {others.map(({ connectionId, presence, info }) => {
                const userInfo = (info || {}) as UserInfo

                return (
                  <div
                    key={connectionId}
                    className="flex items-center gap-2 p-1 rounded hover:bg-muted/50"
                  >
                    <UserAvatar
                      connectionId={connectionId}
                      name={userInfo.name || `U${connectionId}`}
                      color={userInfo.color}
                      size="sm"
                      tooltipContent={null}
                    />
                    <div className="overflow-hidden">
                      <div className="font-medium text-sm truncate">
                        {userInfo.name || `User ${connectionId}`}
                      </div>
                      <div className="text-xs text-muted-foreground">Connected</div>
                    </div>
                  </div>
                )
              })}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}
