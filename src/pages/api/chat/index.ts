import requestHandler from '../../../utils/requestHandler'

import { chat, agent } from '../../../services/langchain'

const sendChatRequest = async (req, res): Promise<void> => {
  const { type, input } = req.body

  switch (type) {
    case 'mood':
      res.status(200).json({ message: 'Mood Submitted', input })

      break
    case 'track': {
      const { song, artist } = input

      try {
        const response = await agent({
          mode: 'Track',
          input: `${song as string} - ${artist as string}`
        })

        console.log(response)

        res.status(200).json({ message: 'Track Submitted', input, response })
      } catch (error) {
        console.error(error)

        res.status(500).json({ error })
      }
      break
    }
    case 'chat':
    default:
      try {
        let chatInput = input

        if (typeof input === 'string') {
          chatInput = [
            {
              role: 'user',
              content: input
            }
          ]
        }

        const response = await chat(chatInput)

        console.log(response)

        res.status(200).json({ message: 'Chat Submitted', input, response })
      } catch (error) {
        console.error(error)

        res.status(500).json({ error })
      }
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
