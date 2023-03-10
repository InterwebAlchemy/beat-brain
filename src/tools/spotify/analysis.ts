import { SpotifyWebApi } from 'spotify-web-api-ts'

const SpotifyAnalysis = {
  name: 'Analyze Track',
  description: 'track -> Analyze a track on Spotify',
  func: async (trackName): Promise<string> => {
    console.log(`Analyzing ${trackName as string}...`)

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

      const analysis = await spotify.tracks.getAudioFeaturesForTrack(track.id)

      const analysisDescription: string[] = []

      if (analysis.acousticness > 0.7) {
        analysisDescription.push('This playlist should feature acoustic songs.')
      } else if (analysis.acousticness > 0.3) {
        analysisDescription.push(
          'This playlist should not feature acoustic songs.'
        )
      } else {
        analysisDescription.push(
          'This playlist can include acoustic songs if they fit the theme.'
        )
      }

      if (analysis.liveness > 0.7) {
        analysisDescription.push('This playlist should feature live songs.')
      } else if (analysis.liveness > 0.3) {
        analysisDescription.push('This playlist should not feature live songs.')
      } else {
        analysisDescription.push(
          'This playlist can include live songs if they fit the theme.'
        )
      }

      if (analysis.instrumentalness > 0.7) {
        analysisDescription.push(
          'This playlist should feature instrumental songs.'
        )
      } else if (analysis.instrumentalness > 0.3) {
        analysisDescription.push(
          'This playlist should not feature instrumental songs.'
        )
      } else {
        analysisDescription.push(
          'This playlist can include instrumental songs if they fit the theme.'
        )
      }

      if (analysis.speechiness > 0.7) {
        analysisDescription.push(
          'This playlist should feature songs with many lyrics.'
        )
      } else if (analysis.speechiness > 0.3) {
        analysisDescription.push(
          'This playlist should not feature songs with many lyrics.'
        )
      } else {
        analysisDescription.push(
          'This playlist can include songs with many lyrics if they fit the theme.'
        )
      }

      if (analysis.danceability > 0.7) {
        analysisDescription.push(
          'This playlist should feature danceable songs.'
        )
        analysisDescription.push(
          `This playlist should be around ${analysis.tempo} BPM.`
        )
      } else if (analysis.danceability > 0.3) {
        analysisDescription.push(
          `This playlist should be around ${analysis.tempo} BPM.`
        )
        analysisDescription.push(
          'This playlist should not feature danceable songs.'
        )
      } else {
        analysisDescription.push(`This playlist can include any BPM.`)
        analysisDescription.push(
          'This playlist can include danceable songs if they fit the theme.'
        )
      }

      if (analysis.energy > 0.7) {
        analysisDescription.push(
          'This playlist should feature energetic songs.'
        )
      } else if (analysis.energy > 0.3) {
        analysisDescription.push(
          'This playlist should not feature energetic songs.'
        )
      } else {
        analysisDescription.push(
          'This playlist can include energetic songs if they fit the theme.'
        )
      }

      if (analysis.valence > 0.7) {
        analysisDescription.push(
          'This playlist should feature fun, happy, cheerful, euphoric, etc. songs.'
        )
      } else if (analysis.valence > 0.3) {
        analysisDescription.push(
          'This playlist should feature moody, sad, depressed, angry, etc. songs.'
        )
      }

      return `
Playlist Features:
${analysisDescription.join('\n')}

Find Spotify Tracks that match the Playlist Features and your description of the originally provided Track.
`
    } catch (error) {
      console.error(error)
    }

    return 'Error: Could not analyze track'
  }
}

export default SpotifyAnalysis
