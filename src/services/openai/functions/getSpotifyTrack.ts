import { type ChatCompletionFunctions } from 'openai'

export const getSpotifyTrackFunctionName = 'getSpotifyTrack'

const getSpotifyTrackFunctionDefinition: ChatCompletionFunctions = {
  name: getSpotifyTrackFunctionName,
  description: 'Get spotify link to a recommended track to give it to the user',
  parameters: {
    type: 'object',
    properties: {
      artist: {
        type: 'string',
        description: 'The artist of the recommended track'
      },
      song: {
        type: 'string',
        description: 'The song title of the recommended track'
      }
    },
    required: ['artist', 'song']
  }
}

export default getSpotifyTrackFunctionDefinition
