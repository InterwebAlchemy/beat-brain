import requestHandler from '../../../utils/requestHandler'

import { bot } from '../../../services/chat'

const sendChatRequest = async (req, res): Promise<void> => {
  const { type, input } = req.body

  switch (type) {
    case 'mood':
      res.status(200).json({ message: 'Mood Submitted', input })

      break
    case 'track': {
      const { song, artist } = input

      console.log(song, artist)

      const response = await bot.call({
        mode: 'Track',
        input: `${song as string} - ${artist as string}`
      })

      console.log(response)

      res.status(200).json({ message: 'Track Submitted', input, response })

      break
    }
    default:
      res.status(400).json({ message: 'Invalid request', input })
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: sendChatRequest
    },
    req,
    res
  )
}