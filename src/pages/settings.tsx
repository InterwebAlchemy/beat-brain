import React from 'react'

import type { GetServerSidePropsResult } from 'next'

import AuthenticatedScreen, {
  getAuthenticatedServerSideProps,
  type AuthenticatedScreenProps
} from '../components/AuthenticatedScreen'

const SettingsView = ({
  session,
  user,
  profile
}: AuthenticatedScreenProps): React.ReactElement => {
  return (
    <div className="settings-view">
      <h2>BeatBrain Settings</h2>
      <p>Coming soon!</p>
    </div>
  )
}

const SettingsPage = ({ profile, user, session }): React.ReactElement => (
  <AuthenticatedScreen
    profile={profile}
    user={user}
    session={session}
    view={SettingsView}
  />
)

export async function getServerSideProps(
  context
): Promise<GetServerSidePropsResult<unknown>> {
  const props = await getAuthenticatedServerSideProps(context)

  return props
}

export default SettingsPage
