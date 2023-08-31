import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const spotifyQueue = async (req, res): Promise<void> => {
  const { accessToken } = req

  const { uri } = req.body

  const spotify = new Spotify(accessToken)

  switch (req.method) {
    case 'GET': {
      const queue = await spotify.getQueue()

      res.status(200).json({ queue })

      break
    }
    case 'POST':
      await spotify.queueTrack(uri)

      res.status(202).json({ queued: uri })

      break
    default:
      res.status(405).end()
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['GET', 'POST'],
      handler: spotifyQueue
    },
    req,
    res
  )
}
