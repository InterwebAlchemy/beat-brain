import { useEffect, useState } from 'react'

import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react'

import SpotifyAuthProvider from '../services/spotify/auth'

import getUnixTimestamp from '../utils/getUnixTimestamp'

import type { Database } from '../types/database.types'

export type UserProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'first_name' | 'last_seen' | 'bot_persona'
>

const useProfile = (): UserProfile | null => {
  const supabase = useSupabaseClient<Database>()
  const session = useSession()
  const user = useUser()

  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (session !== null) {
      const aboutToExpiredOrAlreadyExpired =
        typeof session?.expires_at !== 'undefined' &&
        getUnixTimestamp() - 5000 >= session?.expires_at

      const missingProviderToken =
        typeof session?.provider_token === 'undefined' ||
        session?.provider_token === null ||
        session?.provider_token === ''

      if (aboutToExpiredOrAlreadyExpired || missingProviderToken) {
        supabase?.auth
          ?.refreshSession(session)
          .then((value) => {
            const { error } = value

            if (typeof error !== 'undefined' && error !== null) {
              console.error(error)
            } else {
              supabase.auth
                .signInWithOAuth(SpotifyAuthProvider)
                .catch((error) => {
                  console.error('could not log in', error)
                })
            }
          })
          .catch((error) => {
            console.error(error)
          })
      }
    } else {
      supabase.auth.signInWithOAuth(SpotifyAuthProvider).catch((error) => {
        console.error('could not log in', error)
      })
    }
  }, [session?.access_token])

  useEffect(() => {
    const userRequest = new AbortController()

    const sessionExists = typeof session !== 'undefined' && session !== null
    const userExists = typeof user !== 'undefined' && user !== null

    if (sessionExists && userExists) {
      try {
        /* eslint-disable @typescript-eslint/no-floating-promises */
        supabase
          .from('profiles')
          .select(`username, first_name, avatar_url, last_seen, bot_persona`)
          .abortSignal(userRequest.signal)
          .eq('id', user?.id ?? '')
          .limit(1)
          .single()
          .then(({ data, error }) => {
            if (typeof error !== 'undefined') {
              console.error(error)
            }

            setProfile(data)
          })
        /* eslint-enable @typescript-eslint/no-floating-promises */
      } catch (error) {
        console.error(error)
      }
    }

    return () => {
      userRequest.abort()
    }
  }, [session?.access_token, user?.id, profile?.username])

  return profile
}

export default useProfile
