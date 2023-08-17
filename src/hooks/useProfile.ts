import { useEffect, useState } from 'react'

import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react'

import getUnixTimestamp from '../utils/getUnixTimestamp'

import type { Database } from '../types/database.types'

export type UserProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'first_name' | 'last_seen' | 'bot_persona'
>

const useProfile = (): UserProfile | null => {
  const supabase = useSupabaseClient<Database>()
  let session = useSession()
  let user = useUser()

  const [profile, setProfile] = useState<UserProfile | null>(null)

  const userRequest = new AbortController()

  useEffect(() => {
    if (session !== null) {
      const aboutToExpiredOrAlreadyExpired =
        typeof session?.expires_at !== 'undefined' &&
        getUnixTimestamp() - 5000 >= session?.expires_at

      if (aboutToExpiredOrAlreadyExpired) {
        console.log('Session needs refreshing...')
        supabase?.auth
          ?.refreshSession(session)
          .then((value) => {
            const { data, error } = value

            if (typeof error !== 'undefined' && error !== null) {
              console.error(error)
            }

            session = data.session
            user = data.user
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
  }, [session?.provider_refresh_token])

  useEffect(() => {
    const sessionExists = typeof session !== 'undefined' && session !== null
    const userExists = typeof user !== 'undefined' && user !== null

    if (sessionExists && userExists) {
      try {
        /* eslint-disable @typescript-eslint/no-floating-promises */
        supabase
          .from('profiles')
          .select(`username, first_name, avatar_url, last_seen, bot_persona`)
          .abortSignal(userRequest.signal)
          .eq('id', user?.id)
          .limit(1)
          .single()
          .then(({ data, error }) => {
            if (typeof error !== 'undefined') {
              console.error(error)
            }

            console.log('profile', data)
            setProfile(data)
          })
        /* eslint-enable @typescript-eslint/no-floating-promises */
      } catch (error) {
        console.error(error)
      }
    }

    // return () => {
    //   userRequest.abort()
    // }
  }, [session?.access_token, user?.id, profile?.username])

  return profile
}

export default useProfile
