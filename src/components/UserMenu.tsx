import React from 'react'

import Link from 'next/link'

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import UserAvatar from './UserAvatar'
import Login from './Login'

import type { UserProfile } from '../types'

export interface UserMenuProps {
  profile?: UserProfile
}

const UserMenu = ({ profile }: UserMenuProps): React.ReactElement => {
  const session = useSession()
  const supabase = useSupabaseClient()

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
  }

  const logout = (): void => {
    signOut()
      .then(() => {
        window.location.reload()
      })
      .catch((error) => {
        console.error(error)
      })
  }

  if (session === null) {
    return <Login />
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="user-menu" aria-label="Menu">
          <UserAvatar profile={profile} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="user-menu__dropdown">
          <DropdownMenu.Group>
            <DropdownMenu.Item className="user-menu__dropdown__item">
              <Link href="/player">BeatBrain</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item className="user-menu__dropdown__item">
              <Link href="/settings">Settings</Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            className="user-menu__dropdown__item menu-action__logout"
            onSelect={logout}>
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default UserMenu
