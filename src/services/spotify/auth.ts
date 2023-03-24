import type { SignInWithOAuthCredentials } from '@supabase/supabase-js'

import { APPLICATION_URL } from '../../constants'
import { API_SCOPES } from './constants'

const Spotify: SignInWithOAuthCredentials = {
  provider: 'spotify',
  options: {
    scopes: API_SCOPES.join(' '),
    redirectTo: `${APPLICATION_URL ?? ''}/player`
  }
}

export default Spotify
