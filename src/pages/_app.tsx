import { useState } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import {
  SessionContextProvider,
  type Session
} from '@supabase/auth-helpers-react'
import { type AppProps } from 'next/app'

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
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
export default BeatBrainApp
