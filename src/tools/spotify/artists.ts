import { SpotifyWebApi } from 'spotify-web-api-ts'

const SpotifyAnalysis = {
  name: 'Spotify Artist Information',
  description: '"artist" Get relevant details for an Artist on Spotify',
  func: async (artistName): Promise<string> => {
    console.log(`Getting details for ${artistName as string} from Spotify...`)

    try {
      const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.NEXTAUTH_URL
      })

      const { access_token: accessToken } =
        await spotify.getTemporaryAppTokens()

      spotify.setAccessToken(accessToken)

      const artist = await spotify.artists.getArtist(artistName.toString())

      if (typeof artist !== 'undefined' && artist !== null) {
        const { popularity, genres } = artist

        const artistDescription: string[] = [
          `This playlist should feature songs from the following genres: ${genres.join(
            ', '
          )}.`
        ]

        if (popularity > 85) {
          artistDescription.push(
            'This playlist should feature songs from the most well-known artists.'
          )
        } else if (popularity > 70) {
          artistDescription.push(
            'This playlist should feature songs from very popular artists.'
          )
        } else if (popularity > 30) {
          artistDescription.push(
            'This playlist should feature songs from less popular artists.'
          )
        } else if (popularity > 10) {
          artistDescription.push(
            'This playlist should feature songs from relatively unknown artists.'
          )
        } else {
          artistDescription.push(
            'This playlist should feature songs from very obscure artists.'
          )
        }

        return artistDescription.join('\n')
      } else {
        return `${
          artistName as string
        } is not on Spotify. Please find another Artist.`
      }
    } catch (error) {
      console.error(error)
    }

    return 'Error: Could not find artist'
  }
}

export default SpotifyAnalysis
