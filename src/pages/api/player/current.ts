import { getServerSession } from 'next-auth/next'

import { authOptions } from '../auth/[...nextauth]'

import Spotify from '../../../services/spotify'

export default async function handler(req, res): Promise<void> {
  const session = await getServerSession(req, res, authOptions)

  if (typeof session !== 'undefined' && session !== null) {
    if (req.method === 'GET') {
      // @ts-expect-error
      const { accessToken } = session

      const spotify = new Spotify(accessToken)

      const track = await spotify.getCurrentlyPlaying()

      res.status(200).json(track)
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
