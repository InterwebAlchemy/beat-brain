import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

import Spotify from '../services/spotify/auth'

export interface LoginProps {
  afterLogin?: () => Promise<void>
}

const Login = ({ afterLogin }: LoginProps): React.ReactElement => {
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
    <button onClick={onClick}>{session !== null ? 'Log Out' : 'Log In'}</button>
  )
}

export default Login
