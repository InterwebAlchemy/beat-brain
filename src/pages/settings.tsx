import React from 'react'

import type { GetServerSidePropsResult } from 'next'

import * as Form from '@radix-ui/react-form'
import * as Switch from '@radix-ui/react-switch'

import AuthenticatedScreen, {
  getAuthenticatedServerSideProps,
  type AuthenticatedScreenProps
} from '../components/AuthenticatedScreen'

import { BOT_HANDLE } from '../constants'

const SettingsView = ({
  session,
  user,
  profile
}: AuthenticatedScreenProps): React.ReactElement => {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    // TODO: save back to supabase profile
    console.log(formData)
  }

  return (
    <div className="settings-view">
      <h2>BeatBrain Settings</h2>
      <Form.Root className="settings-form" onSubmit={onSubmit}>
        <Form.Field className="settings-form__field" name="first_name">
          <Form.Label className="settings-form__label">
            What should {BOT_HANDLE} call you?
          </Form.Label>
          <Form.Control asChild>
            <input
              className="settings-form__input"
              type="text"
              defaultValue={profile?.first_name ?? profile?.username ?? 'User'}
            />
          </Form.Control>
        </Form.Field>
        <Form.Field className="settings-form__field" name="playlist_visibility">
          <Form.FormLabel>
            When I save a playlist from {BOT_HANDLE} to Spotify, make it public.
          </Form.FormLabel>
          <Form.Control asChild>
            <Switch.Root
              className="settings-form__toggle__container"
              id="playlist_visibility">
              <Switch.Thumb
                className="settings-form__toggle__switch"
                defaultChecked={profile?.playlist_visibility === 'public'}
              />
            </Switch.Root>
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <button className="button button__submit">Update Settings</button>
        </Form.Submit>
      </Form.Root>
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
