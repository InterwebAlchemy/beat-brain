import React from 'react'

import * as Avatar from '@radix-ui/react-avatar'

import type { UserProfile } from '../types'

export interface UserAvatarProps {
  profile?: UserProfile
}

const UserAvatar = ({ profile }: UserAvatarProps): React.ReactElement => {
  return (
    <Avatar.Root className="user-avatar">
      {typeof profile?.avatar_url === 'string' ? (
        <Avatar.Image
          className="user-avatar__image"
          src={profile?.avatar_url}
          alt={`${profile.username as string}'s avatar`}
        />
      ) : (
        <></>
      )}
      <Avatar.Fallback>
        {profile?.first_name?.slice(0, 1).toUpperCase() ??
          profile?.username?.slice(0, 1).toUpperCase() ??
          'U'}
      </Avatar.Fallback>
    </Avatar.Root>
  )
}

export default UserAvatar
