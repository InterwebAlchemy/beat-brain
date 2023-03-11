import { useEffect, useState } from 'react'

import {
  useSession,
  useSupabaseClient,
  useUser
} from '@supabase/auth-helpers-react'

import type { Database } from '../types/database.types'

export type UserProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'first_name'
>

const useProfile = (): UserProfile | null => {
  const supabase = useSupabaseClient<Database>()
  const session = useSession()
  const user = useUser()

  const [profile, setProfile] = useState<UserProfile | null>(null)

  const getUserProfile = async (userId): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`username, first_name, avatar_url`)
      .eq('id', userId)
      .limit(1)
      .single()

    if (error !== null) {
      console.error(error)
    }

    return data
  }

  useEffect(() => {
    const sessionExists = typeof session !== 'undefined' && session !== null
    const userExists = typeof user !== 'undefined' && user !== null

    if (sessionExists && userExists) {
      getUserProfile(user.id)
        .then((profile) => {
          setProfile(profile)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [session?.access_token, user?.id])

  return profile
}

export default useProfile
