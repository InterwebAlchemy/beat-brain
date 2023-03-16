import {
  Configuration,
  OpenAIApi,
  type CreateChatCompletionResponse,
  type CreateChatCompletionRequest
} from 'openai'

import {
  OPEN_AI_RESPONSE_TOKENS,
  OPEN_AI_DEFAULT_TEMPERATURE,
  OPEN_AI_BOT_SETTINGS,
  OPEN_AI_DEFAULT_MODEL_NAME
} from './constants'

export const openAICompletion = async ({
  /* eslint-disable @typescript-eslint/naming-convention */
  messages,
  temperature = OPEN_AI_DEFAULT_TEMPERATURE,
  max_tokens = OPEN_AI_RESPONSE_TOKENS,
  top_p = 1,
  frequency_penalty = 0,
  presence_penalty = 0,
  stream = false
}: /* eslint-enable @typescript-eslint/naming-convention */
CreateChatCompletionRequest): Promise<CreateChatCompletionResponse> => {
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })

    const openai = new OpenAIApi(config)

    console.log(messages)

    const { maxTokens, modelName } = OPEN_AI_BOT_SETTINGS

    const completion = await openai.createChatCompletion({
      model: modelName ?? OPEN_AI_DEFAULT_MODEL_NAME,
      max_tokens: maxTokens ?? max_tokens,
      top_p,
      frequency_penalty,
      presence_penalty,
      temperature,
      messages,
      stream
    })

    console.log(completion)

    return completion.data
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
