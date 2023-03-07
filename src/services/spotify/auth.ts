import SpotifyProvider from 'next-auth/providers/spotify'

import { API_SCOPES } from './constants'

const Spotify = SpotifyProvider({
  clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
  authorization: {
    params: {
      scope: API_SCOPES.join(' ')
    }
  }
})

export default Spotify
