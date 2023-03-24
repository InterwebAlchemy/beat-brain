import React from 'react'

import Screen from '../components/Screen'

import Login from '../components/Login'

const HomePage = (): React.ReactElement => {
  return (
    <Screen>
      <p>Please login with Spotify to use BeatBrain.</p>
      <Login />
      <p>
        <strong>Note:</strong> BeatBrain is best with Spotify Premium.
      </p>
    </Screen>
  )
}

export default HomePage
