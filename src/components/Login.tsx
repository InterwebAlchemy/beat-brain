import React from 'react'

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import Image from 'next/image'

import SpotifySVG from '../public/assets/img/spotify.svg'

import Spotify from '../services/spotify/auth'

const Login = (): React.ReactElement => {
  const session = useSession()
  const supabase = useSupabaseClient()

  const onClick = (): void => {
    handleAuthentication().catch((error) => {
      console.error(error)
    })
  }

  const handleAuthentication = async (): Promise<void> => {
    if (session === null) {
      await supabase.auth.signInWithOAuth(Spotify)
    } else {
      await supabase.auth.signOut()
    }
  }

  return (
    <button onClick={onClick} className="button button__login">
      <Image src={SpotifySVG} width="40" height="40" alt="" />
      {session !== null ? 'Log Out' : 'Log In'}
    </button>
  )
}

export default Login
