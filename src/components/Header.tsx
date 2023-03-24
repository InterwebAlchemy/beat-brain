import React from 'react'

import Link from 'next/link'
import Image from 'next/image'

import type { Session } from '@supabase/supabase-js'

import UserMenu from './UserMenu'

import BeatBrainSVG from '../public/assets/img/beatbrain.svg'

import type { UserProfile } from '../types'

export interface HeaderProps {
  profile?: UserProfile
  session?: Session
}

const Header = ({ profile, session }: HeaderProps): React.ReactElement => {
  return (
    <header className="header">
      <nav className="nav-bar">
        <Link
          className="logo-link"
          href={
            typeof session !== 'undefined' && session !== null ? '/player' : '/'
          }>
          <Image src={BeatBrainSVG} width="30" height="30" alt="" />
          BeatBrain
        </Link>
        <UserMenu profile={profile} />
      </nav>
    </header>
  )
}

export default Header
