import {
  Configuration,
  OpenAIApi,
  type CreateChatCompletionResponse,
  type CreateChatCompletionRequest
} from 'openai-edge'

import {
  OPEN_AI_RESPONSE_TOKENS,
  OPEN_AI_DEFAULT_TEMPERATURE
} from './constants'

export const getRecommendation = async ({
  messages,
  user = ''
}): Promise<CreateChatCompletionResponse> => {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })

  const openai = new OpenAIApi(config)

  const completionResponse = await openai.createChatCompletion({
    model: 'gpt-4',
    temperature: 0.8,
    stream: false,
    user,
    messages
  })

  const completion: CreateChatCompletionResponse =
    await completionResponse.json()

  return completion
}

export const openAICompletion = async ({
  /* eslint-disable @typescript-eslint/naming-convention */
  messages,
  temperature = OPEN_AI_DEFAULT_TEMPERATURE,
  max_tokens = OPEN_AI_RESPONSE_TOKENS,
  top_p = 1,
  frequency_penalty = 0,
  presence_penalty = 0,
  user = ''
}: /* eslint-enable @typescript-eslint/naming-convention */
CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> => {
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })

    const openai = new OpenAIApi(config)

    const completionResponse = await openai.createChatCompletion({
      model: 'gpt-4',
      temperature: 0.8,
      messages,
      stream: false,
      user
    })

    const completion: CreateChatCompletionResponse =
      await completionResponse.json()

    console.log(completion)

    return completion
  } catch (error) {
    if (typeof error?.response !== 'undefined') {
      console.error(error.response.status)
      console.error(error.response.data)
    } else {
      console.log(error.message)
    }

    throw error
  }
}
