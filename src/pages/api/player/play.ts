import Spotify from '../../../services/spotify'

import requestHandler from '../../../utils/requestHandler'

const transferPlayback = async (req, res): Promise<void> => {
  const { accessToken } = req

  const { deviceId } = req.body

  const spotify = new Spotify(accessToken)

  try {
    await spotify.transferPlayback({ deviceId })

    res.status(200).json({ message: 'Playback started' })
  } catch (error) {
    res.status(500).json({ error })
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
