import React, { useEffect, useState } from 'react'

import sampleSize from 'lodash.samplesize'

import { useSession } from '@supabase/auth-helpers-react'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'

const HomePage = (): React.ReactElement => {
  const session = useSession()

  const [greeting, setGreeting] = useState<string>('')
  const [output, setOutput] = useState<Record<string, any> | null>(null)

  const greet = async (): Promise<void> => {
    console.log('trying to greet the user')
    try {
      const { details } = await fetch('/api/spotify/info').then(
        async (response) => {
          return await response.json()
        }
      )

      console.log(details)

      const input = [
        {
          role: 'user',
          content: `Hey there! I'm ${details.me.display_name as string}.`
        },
        {
          role: 'user',
          content: `Some of my favorite artists are: ${
            sampleSize(
              details.topArtists.items
                .filter(({ type }) => type === 'artists')
                .map((artist) => artist.name)
            ).join(', ') as string
          }`
        }
      ]

      if (
        typeof details.currentTrack !== 'undefined' &&
        details.currentTrack !== null &&
        details.currentTrack !== '' &&
        details.currentTrack?.currently_playing_type === 'track'
      ) {
        input.push({
          role: 'user',
          content: `I'm currently listening to ${
            details.currentTrack.item.name as string
          } by ${
            details.currentTrack.item.artists
              .map((artist) => artist.name)
              .join(', ') as string
          }.`
        })
      }

      input.push({
        role: 'system',
        content: 'Greet the user.'
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'chat',
          input
        })
      }).then(async (response) => await response.json())

      console.log(response)

      setGreeting(response.response.choices[0].message.content)
    } catch (error) {
      console.error(error)
    }
  }

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

  // useEffect(() => {
  //   if (
  //     typeof profile?.first_name === 'undefined' ||
  //     profile?.first_name === null ||
  //     profile?.first_name === ''
  //   ) {
  //     // ask for first name
  //   }
  // }, [profile !== null])

  useEffect(() => {
    if (session !== null && greeting === '') {
      greet().catch((error) => {
        console.error(error)
      })
    }
  }, [session?.provider_token, greeting])

  if (session !== null) {
    return (
      <div className="interface">
        <nav className="navbar">
          <Login />
        </nav>
        <div className="container">
          <div className="player">
            <div className="greeting">{greeting}</div>
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
      <Login afterLogin={greet} />
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
