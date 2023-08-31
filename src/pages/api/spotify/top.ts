import type { Artist, Track } from '@spotify/web-api-ts-sdk'

import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getTop = async (req, res): Promise<void> => {
  const { accessToken } = req

  const { type = 'artists' } = req.query

  const spotify = new Spotify(accessToken)

  let top: Artist[] | Track[] = []

  switch (type) {
    case 'artists':
      top = await spotify.getTopArtists()

      res.status(200).json({ top })

      break
    case 'tracks':
      top = await spotify.getTopTracks()

      res.status(200).json({ top })

      break
    default:
      res.status(400).json({ message: 'Bad request' })
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['GET'],
      handler: getTop
    },
    req,
    res
  )
}
