import React from 'react'
import { useSession } from '@supabase/auth-helpers-react'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'

const HomePage = (): React.ReactElement => {
  const session = useSession()

  return (
    <>
      <div className="interface">
        <nav className="navbar">
          <h1>BeatBrain</h1>
          {typeof session !== 'undefined' && session !== null ? (
            <Login size="sm" />
          ) : (
            <></>
          )}
        </nav>
        <div className="container">
          <div className="player">
            {typeof session !== 'undefined' && session !== null ? (
              <WebPlayer />
            ) : (
              <>
                <Login />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default HomePage
