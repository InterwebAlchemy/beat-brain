import React from 'react'

import { useSession } from '@supabase/auth-helpers-react'

import Login from '../components/Login'
import WebPlayer from '../components/WebPlayer'
import SidebarView from '../components/SidebarView'

const HomePage = (): React.ReactElement => {
  const session = useSession()

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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome">
      <Login />
    </div>
  )
}

export default HomePage
