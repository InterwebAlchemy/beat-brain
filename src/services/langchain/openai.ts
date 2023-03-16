import {
  Configuration,
  OpenAIApi,
  type CreateChatCompletionResponse,
  type ChatCompletionRequestMessage
} from 'openai'

import { OPENAI_MODEL } from './constants'

import { BEATBRAIN_INTRO, BEATBRAIN_PERSONA } from './prompts/system'

export const openAiChat = async (
  messages: ChatCompletionRequestMessage[]
): Promise<CreateChatCompletionResponse> => {
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })

    const openai = new OpenAIApi(config)

    const requestMessages: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: `${BEATBRAIN_INTRO}\n${BEATBRAIN_PERSONA}`
      },
      ...messages
    ]

    console.log(requestMessages)

    const completion = await openai.createChatCompletion({
      model: OPENAI_MODEL,
      messages: requestMessages
    })

    console.log(completion)

    return completion.data
  } catch (error) {
    if (typeof error?.response !== 'undefined') {
      console.error(error.response.status)
      console.error(error.response.data)
    } else {
      console.error(error.message)
    }

    throw error
  }
}
