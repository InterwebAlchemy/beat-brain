import React from 'react'

import type { CreateChatCompletionResponse } from 'openai'

import useChat from '../hooks/useChat'

import AuthenticatedScreen, {
  getAuthenticatedServerSideProps
} from '../components/AuthenticatedScreen'

import WebPlayer from '../components/WebPlayer'
import SidebarView from '../components/SidebarView'

import fetchHandler from '../utils/fetchHandler'

const PlayerView = ({ session, user, profile }): React.ReactElement => {
  const { ready, conversation } = useChat()

  const sendChat = async ({
    type,
    input
  }: Record<string, string>): Promise<void> => {
    if (ready) {
      fetchHandler<CreateChatCompletionResponse>('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          input
        })
      })
        .then((response) => {
          if (typeof response !== 'string') {
            conversation?.addResponse(response)
          } else {
            console.error(response)
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const form = e.currentTarget
    const formData = new FormData(form)
    const type = formData.get('type')
    const input = formData.get('input')

    sendChat({ type: type as string, input: input as string }).catch(
      (error) => {
        console.error(error)
      }
    )
  }

  return (
    <div className="container">
      <div className="player">
        <WebPlayer />
      </div>
      <div className="chat">
        <SidebarView />
        <form
          method="post"
          onSubmit={onSubmit}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}>
          <select name="type" disabled={!ready}>
            <option value="track">Track</option>
            <option value="mood">Mood</option>
          </select>
          <input type="text" name="input" disabled={!ready} />
          <button type="submit" disabled={!ready}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

const PlayerPage = ({ profile, session, user }): React.ReactElement => (
  <AuthenticatedScreen
    profile={profile}
    session={session}
    user={user}
    view={PlayerView}
  />
)

export { getAuthenticatedServerSideProps as getServerSideProps }

export default PlayerPage
