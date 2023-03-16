import { useState } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import {
  SessionContextProvider,
  type Session
} from '@supabase/auth-helpers-react'

import { type AppProps } from 'next/app'

import ChatContext from '../context/ChatContext'

import { Conversation } from '../services/conversation/conversation'

import { BEATBRAIN_PREAMBLE } from '../constants/prompts'

import '../styles/base.css'

function BeatBrainApp({
  Component,
  pageProps
}: AppProps<{
  initialSession: Session
}>): React.ReactElement {
  const [supabase] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}>
      <ChatContext.Provider
        value={{
          conversation: new Conversation({ preamble: BEATBRAIN_PREAMBLE })
        }}>
        <Component {...pageProps} />
      </ChatContext.Provider>
    </SessionContextProvider>
  )
}
export default BeatBrainApp
