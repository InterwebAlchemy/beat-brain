import React from 'react'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'

const HomePage = (): React.ReactElement => {
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

      console.log(response)
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

  return (
    <div>
      <h1>Welcome to BeatBrain!</h1>
      <Login />
      <WebPlayer />
      <form method="post" onSubmit={onSubmit}>
        <select name="type">
          <option value="track">Track</option>
          <option value="mood">Mood</option>
        </select>
        <input type="text" name="input" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default HomePage
