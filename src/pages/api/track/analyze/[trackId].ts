import { getServerSession } from 'next-auth/next'

import { authOptions } from '../../auth/[...nextauth]'

import Spotify from '../../../../services/spotify'

export default async function handler(req, res): Promise<void> {
  const session = await getServerSession(req, res, authOptions)

  if (typeof session !== 'undefined' && session !== null) {
    if (req.method === 'GET') {
      // @ts-expect-error
      const { accessToken } = session

      const { trackId } = req.query

      const spotify = new Spotify(accessToken)

      if (typeof trackId !== 'undefined') {
        const analysis = await spotify.getAudioAnalysis(trackId)

        res.status(200).json(analysis)
      }

      res.status(400).json({ message: 'Bad request' })
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
