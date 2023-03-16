import { SpotifyWebApi } from 'spotify-web-api-ts'

const SpotifyAnalysis = {
  name: 'Analyze Track',
  description: "$Track -> Analyze a Track's audio features on Spotify",
  func: async (trackName): Promise<string> => {
    try {
      const spotify = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: process.env.NEXTAUTH_URL
      })

      try {
        const { access_token: accessToken } =
          await spotify.getTemporaryAppTokens()

        spotify.setAccessToken(accessToken)

        try {
          const search = await spotify.search.searchTracks(
            trackName.toString(),
            {
              limit: 1
            }
          )

          const track = search.items[0]

          try {
            const analysis = await spotify.tracks.getAudioFeaturesForTrack(
              track.id
            )

            const analysisDescription: string[] = []

            if (analysis.acousticness > 0.7) {
              analysisDescription.push('feature acoustic songs')
            } else if (analysis.acousticness > 0.3) {
              analysisDescription.push('not feature acoustic songs')
            }

            if (analysis.liveness > 0.7) {
              analysisDescription.push('feature live songs')
            } else if (analysis.liveness > 0.3) {
              analysisDescription.push('not feature live songs')
            }

            if (analysis.instrumentalness > 0.7) {
              analysisDescription.push('feature instrumental songs')
            } else if (analysis.instrumentalness > 0.3) {
              analysisDescription.push('not feature instrumental songs')
            }

            if (analysis.speechiness > 0.7) {
              analysisDescription.push('feature lyrical songs')
            } else if (analysis.speechiness > 0.3) {
              analysisDescription.push('not feature lyrical songs')
            }

            if (analysis.danceability > 0.7) {
              analysisDescription.push('feature danceable songs')
            } else if (analysis.danceability > 0.3) {
              analysisDescription.push('not feature danceable songs')
            }

            if (analysis.energy > 0.7) {
              analysisDescription.push('feature energetic songs')
            } else if (analysis.energy > 0.3) {
              analysisDescription.push('not feature energetic songs')
            }

            if (analysis.valence > 0.7) {
              analysisDescription.push(
                'be fun, happy, cheerful, euphoric, etc.'
              )
            } else if (analysis.valence > 0.3) {
              analysisDescription.push('be moody, sad, depressed, angry, etc.')
            }

            return `
${trackName as string} is available on Spotify.

This playlist should ${analysisDescription.join(', ')}
`
          } catch (error) {
            console.error(error)
          }
        } catch (error) {
          console.error(error)
        }
      } catch (error) {
        console.error(error)
      }
    } catch (error) {
      console.error(error)
    }

    return 'Error: Could not analyze track'
  }
}

export default SpotifyAnalysis
