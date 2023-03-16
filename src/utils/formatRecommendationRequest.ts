import type { ChatCompletionRequestMessage } from 'openai'

import type { RecommendationRequest } from '../types'

const formatRecommendationRequest = (
  request: RecommendationRequest
): ChatCompletionRequestMessage => {
  const { type, artist, song, mood } = request

  const role = 'user'

  switch (type) {
    case 'track':
      return {
        content: `Track: ${song as string} - ${artist as string}`,
        role
      }

    case 'artist':
      return {
        content: `Artist: ${artist as string}`,
        role
      }

    case 'mood':
      return {
        content: `Mood: ${mood as string}`,
        role
      }

    default:
      return {
        content: `Mood: ${[mood, artist, song].join(' ')}`,
        role
      }
  }
}

export default formatRecommendationRequest
