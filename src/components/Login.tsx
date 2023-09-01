import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import SpotifyIcon from './Icons/Spotify'

import Spotify from '../services/spotify/auth'

export interface LoginProps {
  size?: 'sm' | 'md' | 'lg'
  afterLogin?: () => Promise<void>
}

const Login = ({ afterLogin, size = 'lg' }: LoginProps): React.ReactElement => {
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
    <>
      <button
        id="connect-button"
        className={`${session !== null ? 'logout' : 'login'} size--${size}`}
        onClick={onClick}>
        <SpotifyIcon />{' '}
        <span>{session !== null ? 'Logout' : 'Login w/ Spotify'}</span>
      </button>
    </>
  )
}

export default Login
