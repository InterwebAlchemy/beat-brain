import { getServerSession } from 'next-auth/next'

import { authOptions } from '../auth/[...nextauth]'

import Spotify from '../../../services/spotify'
import type { CurrentlyPlaying } from 'spotify-web-api-ts/types/types/SpotifyObjects'

export default async function handler(req, res): Promise<void> {
  const session = await getServerSession(req, res, authOptions)

  if (typeof session !== 'undefined' && session !== null) {
    console.log('SESSION:', session)

    if (req.method === 'POST') {
      // @ts-expect-error
      const { accessToken } = session

      const { deviceId } = req.body

      const spotify = new Spotify(accessToken)

      const track = await spotify.getCurrentlyPlaying()

      if ((track as CurrentlyPlaying).currently_playing_type === 'track') {
        try {
          await spotify.transferPlayback({ deviceId })

          res.status(200).json({ message: 'Playback started' })
        } catch (error) {
          res.status(500).json({ error })
        }
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
