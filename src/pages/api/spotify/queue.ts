import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getRecentlyPlayedTracks = async (req, res): Promise<void> => {
  const { accessToken } = req

  const { uri } = req.body

  console.log(uri)

  const spotify = new Spotify(accessToken)

  await spotify.queueTrack(uri)

  res.status(202).json({ queued: uri })
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: getRecentlyPlayedTracks
    },
    req,
    res
  )
}
