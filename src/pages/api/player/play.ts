import Spotify from '../../../services/spotify'
import type { CurrentlyPlaying } from 'spotify-web-api-ts/types/types/SpotifyObjects'

import requestHandler from '../../../utils/requestHandler'

const transferPlayback = async (req, res): Promise<void> => {
  const { accessToken } = req

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
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: transferPlayback
    },
    req,
    res
  )
}
