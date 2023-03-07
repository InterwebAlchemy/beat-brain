import { getServerSession } from 'next-auth/next'

import { authOptions } from '../../auth/[...nextauth]'

import Spotify from '../../../../services/spotify'
import type {
  CurrentlyPlaying,
  Track
} from 'spotify-web-api-ts/types/types/SpotifyObjects'

export default async function handler(req, res): Promise<void> {
  const session = await getServerSession(req, res, authOptions)

  if (typeof session !== 'undefined' && session !== null) {
    if (req.method === 'GET') {
      // @ts-expect-error
      const { accessToken } = session

      const spotify = new Spotify(accessToken)

      const track = await spotify.getCurrentlyPlaying()

      if (
        typeof (track as CurrentlyPlaying)?.item !== 'undefined' &&
        (track as CurrentlyPlaying)?.item !== null &&
        (track as CurrentlyPlaying)?.currently_playing_type === 'track'
      ) {
        const analysis = await spotify.getAudioAnalysis(
          ((track as CurrentlyPlaying).item as Track).id
        )

        res.status(200).json({ analysis })
      } else {
        res.status(400).json({ message: 'Bad request' })
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
