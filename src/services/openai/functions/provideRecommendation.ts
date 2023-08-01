import { type ChatCompletionFunctions } from 'openai'

export const provideRecommendationFunctionName = 'provideRecommendation'

const provideRecommendationFunctionDefinition: ChatCompletionFunctions = {
  name: provideRecommendationFunctionName,
  description: 'Provide recommendation from Spotify based on the current track',
  parameters: {
    type: 'object',
    properties: {
      artist: {
        type: 'string',
        description: 'The artist of the current track'
      },
      song: {
        type: 'string',
        description: 'The song title of the current track'
      }
    },
    required: ['artist', 'song']
  }
}

export default provideRecommendationFunctionDefinition
