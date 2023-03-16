import type {
  ChatCompletionRequestMessage,
  CreateCompletionResponse
} from 'openai'

import requestHandler, {
  type ExtendedNextApiHandler
} from '../../../utils/requestHandler'

import { openAICompletion } from '../../../services/openai'

import type { Conversation } from '../../../services/conversation/conversation'
import { OPEN_AI_DEFAULT_MODEL_NAME } from '../../../services/openai/constants'

const completeChatRequest: ExtendedNextApiHandler<
  {
    messages: ChatCompletionRequestMessage[]
    settings: Conversation['settings']
  },
  CreateCompletionResponse | unknown
> = async (req, res): Promise<void> => {
  try {
    const { identifier } = req
    const { messages, settings } = req.body

    const response = await openAICompletion({
      model: OPEN_AI_DEFAULT_MODEL_NAME,
      user: identifier,
      messages,
      ...settings
    })

    res.status(200).json(response)
  } catch (error) {
    console.error(error)

    res.status(500).json({ error })
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler<
    {
      messages: ChatCompletionRequestMessage[]
      settings: Conversation['settings']
    },
    CreateCompletionResponse
  >(
    {
      authenticated: true,
      methods: ['POST'],
      handler: completeChatRequest
    },
    req,
    res
  )
}
