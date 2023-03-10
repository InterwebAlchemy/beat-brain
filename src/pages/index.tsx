import React, { useEffect, useState } from 'react'

import { useSession, useUser } from '@supabase/auth-helpers-react'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'

const HomePage = (): React.ReactElement => {
  const session = useSession()
  const user = useUser()

  const [output, setOutput] = useState<Record<string, any> | null>(null)

  const sendChat = async ({
    type,
    input
  }: Record<string, string>): Promise<void> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          input
        })
      }).then(async (response) => await response.json())

      setOutput(response.response.output)
    } catch (error) {
      console.error(error)
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

  useEffect(() => {
    if (user !== null) {
      console.log(user)
    }
  }, [user?.id])

  useEffect(() => {
    console.log(session)
  }, [session?.provider_token])

  if (session !== null) {
    return (
      <div className="interface">
        <nav className="navbar">
          <Login />
        </nav>
        <div className="container">
          <div className="player">
            <WebPlayer setOutput={setOutput} />
          </div>
          <div className="chat">
            {output !== null ? (
              <div className="recommendations">
                <h3>{output?.name}</h3>
                <p>{output?.description}</p>
                <ul>
                  {output?.tracks.map((track) => (
                    <li key={track}>{track}</li>
                  ))}
                </ul>
                <p>{output?.notes}</p>
              </div>
            ) : (
              <></>
            )}
            <form method="post" onSubmit={onSubmit}>
              <select name="type">
                <option value="track">Track</option>
                <option value="mood">Mood</option>
              </select>
              <input type="text" name="input" />
              <button type="submit">Send</button>
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
