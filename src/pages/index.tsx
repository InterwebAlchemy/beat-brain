import React from 'react'
import Script from 'next/script'
import { useSession } from '@supabase/auth-helpers-react'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'
// import SidebarView from '../components/SidebarView'

const HomePage = (): React.ReactElement => {
  const session = useSession()

  return (
    <>
      <div className="interface">
        <div className="container">
          <div className="player">
            {typeof session !== 'undefined' && session !== null ? (
              <WebPlayer />
            ) : (
              <Login />
            )}
          </div>
        </div>
      </div>
      <Script src="https://sdk.scdn.co/spotify-player.js" async />
    </>
  )
}

export default HomePage
