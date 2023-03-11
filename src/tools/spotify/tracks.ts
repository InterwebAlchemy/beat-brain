import { SpotifyWebApi } from 'spotify-web-api-ts'

const SpotifyTracks = {
  name: 'Track Availability',
  description: '$Track -> Make sure Tracks is available on Spotify',
  func: async (trackName): Promise<string> => {
    try {
      const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.NEXTAUTH_URL
      })

      const { access_token: accessToken } =
        await spotify.getTemporaryAppTokens()

      spotify.setAccessToken(accessToken)

      const search = await spotify.search.searchTracks(trackName.toString(), {
        limit: 1
      })

      const track = search.items[0]

      if (typeof track !== 'undefined' && track !== null) {
        const { id, type, is_playable: isPlayable } = track

        if (
          typeof id === 'undefined' ||
          id === null ||
          type !== 'track' ||
          isPlayable === false
        ) {
          return `${
            trackName as string
          } is not a playable track on Spotify. Please recommend another track.`
        }

        return `${trackName as string} is available on Spotify.`
      } else {
        return `${
          trackName as string
        } does not exist on Spotify. Please recommend another track.`
      }
    } catch (error) {
      console.error(error)
    }

    return 'Error: Could not analyze track'
  }
}

export default SpotifyTracks
