import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getCurrent = async (req, res): Promise<void> => {
  const { accessToken } = req

  const spotify = new Spotify(accessToken)

  const current = await spotify.getCurrentlyPlaying()

  res.status(200).json({ current })
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['GET'],
      handler: getCurrent
    },
    req,
    res
  )
}
