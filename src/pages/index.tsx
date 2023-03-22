import React from 'react'

import { useSession } from '@supabase/auth-helpers-react'

import type { CreateChatCompletionResponse } from 'openai'

import useChat from '../hooks/useChat'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'
import SidebarView from '../components/SidebarView'

import fetchHandler from '../utils/fetchHandler'

const HomePage = (): React.ReactElement => {
  const session = useSession()

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

  if (session !== null) {
    return (
      <div className="interface">
        <nav className="navbar">
          <Login />
        </nav>
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
      </div>
    )
  }

  return (
    <div className="welcome">
      <h1>Welcome to BeatBrain!</h1>
      <p>
        BeatBrain is a music recommendation algorithm based on "Imaginary
        Computing" that leverages OpenAI's ChatGPT API and LangChain to create
        short playlists of recommended tracks on Spotify.
      </p>
      <p>
        <strong>
          BeatBrain is currently in Alpha Testing and is only available to
          specific testers.
        </strong>
      </p>
      <Login />
      <div className="waitlist">
        <h2>Join the Waitlist</h2>
        <p>
          If you would like to be notified when BeatBrain is available to the
          public, please enter your email address below.
        </p>
        <p>
          <em>Coming soon...</em>
        </p>
      </div>
    </div>
  )
}

export default HomePage
