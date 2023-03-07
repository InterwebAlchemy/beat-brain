import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

// import executor from '../../services/chat'

export default async function handler(req, res): Promise<void> {
  const session = await getServerSession(req, res, authOptions)

  if (typeof session !== 'undefined' && session !== null) {
    if (req.method === 'POST') {
      const { type, input } = req.body

      switch (type) {
        case 'mood':
          res.status(200).json({ message: 'Mood Submitted', input })
          break
        case 'track':
          res.status(200).json({ message: 'Track Submitted', input })
          break
        default:
          res.status(400).json({ message: 'Invalid request', input })
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
