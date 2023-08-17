import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getTrack = async (req, res): Promise<void> => {
  const {
    accessToken,
    body: { artist, song }
  } = req

  const spotify = new Spotify(accessToken)

  const track = await spotify.getTrack({ artist, song })

  res.status(200).json({ track })
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: getTrack
    },
    req,
    res
  )
}
