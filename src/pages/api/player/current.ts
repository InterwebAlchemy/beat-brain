import Spotify from '../../../services/spotify'

import requestHandler from '../../../utils/requestHandler'

const transferPlayback = async (req, res): Promise<void> => {
  const { accessToken } = req

  const spotify = new Spotify(accessToken)

  let track

  try {
    track = await spotify.getCurrentlyPlaying()

    if (typeof track !== 'undefined' && track !== null) {
      res.status(200).json(track)
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  } catch (error) {
    res.status(500).json({ error })
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['GET'],
      handler: transferPlayback
    },
    req,
    res
  )
}
