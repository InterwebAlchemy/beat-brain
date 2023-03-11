import type { ChainValues } from 'langchain/chains'
import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse
} from 'openai'

import { openAiChat } from './openai'

import { bot } from './bot'
import { OPENAI_MODEL } from './constants'

export const chat = async (
  messages: ChatCompletionRequestMessage[]
): Promise<CreateChatCompletionResponse> => {
  try {
    console.log('MESSAGES:', messages)
    const response = await openAiChat(messages)

    return response
  } catch (error) {
    console.error(error)

    return {
      id: 'system-error',
      created: Math.round(+new Date() / 1000),
      object: 'error-message',
      model: OPENAI_MODEL,
      choices: [
        {
          message: {
            role: 'system',
            content: 'Could not communicate with BeatBrain'
          }
        }
      ]
    }
  }
}

export const agent = async (params): Promise<ChainValues> => {
  try {
    const response = await bot.call(params)

    return response
  } catch (error) {
    console.error(error)

    return {
      error: 'Could not communicate with BeatBrain'
    }
  }
}
