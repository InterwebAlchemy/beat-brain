import type { SignInWithOAuthCredentials } from '@supabase/supabase-js'

import { API_SCOPES } from './constants'

const Spotify: SignInWithOAuthCredentials = {
  provider: 'spotify',
  options: {
    scopes: API_SCOPES.join(' ')
  }
}

export default Spotify
