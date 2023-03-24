import React from 'react'

import {
  createServerSupabaseClient,
  type Session,
  type User
} from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsResult, GetServerSideProps } from 'next'

import Header from './Header'
import Footer from './Footer'

import type { UserProfile } from '../types'

export interface AuthenticatedScreenProps {
  session?: Session
  user?: User
  profile?: UserProfile
}

export interface AuthenticatedViewProps extends AuthenticatedScreenProps {
  view: React.ComponentType<AuthenticatedScreenProps>
}

export const getAuthenticatedServerSideProps: GetServerSideProps = async (
  ctx
): Promise<GetServerSidePropsResult<AuthenticatedScreenProps>> => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx)

  // Check if we have a session
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (typeof session === 'undefined' || session === null) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const { user } = session

  let profile

  try {
    /* eslint-disable @typescript-eslint/no-floating-promises */
    profile = await supabase
      .from('profiles')
      .select(`username, first_name, avatar_url, last_seen, bot_persona`)
      .eq('id', user.id)
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (typeof error !== 'undefined') {
          console.error(error)
        }

        return data
      })
    /* eslint-enable @typescript-eslint/no-floating-promises */
  } catch (error) {
    console.error(error)
  }

  return {
    props: {
      session,
      user,
      profile
    }
  }
}

const AuthenticatedScreen = ({
  session,
  user,
  profile,
  view: View
}: React.PropsWithoutRef<AuthenticatedViewProps>): React.ReactElement => {
  return (
    <div className="screen">
      <Header profile={profile} session={session} />
      <div className="view">
        {typeof View !== 'undefined' ? (
          <View user={user} profile={profile} session={session} />
        ) : (
          <></>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AuthenticatedScreen
