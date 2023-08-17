import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getRecentlyPlayedTracks = async (req, res): Promise<void> => {
  const { accessToken } = req

  const { uri, deviceId } = req.body

  console.log('NEED TO PLAY:', uri)

  try {
    const spotify = new Spotify(accessToken)

    await spotify.startPlaying({ track: uri, deviceId })

    res.status(202).json({ played: uri })
  } catch (error) {
    console.error(error)

    res.status(500)
  }
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
