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
        content: `<Track><Song>${song as string}</Song> - ${
          artist
            ?.split(', ')
            .map((name) => `<Artist>${name}</Artist>`)
            .join(', ') ?? ''
        }</Track>`,
        role
      }

    case 'artist':
      return {
        content: `<Artist>${artist as string}</Artist>`,
        role
      }

    case 'mood':
      return {
        content: `<Mood>${mood as string}</Mood>`,
        role
      }

    default:
      return {
        content: `<Mood>${[mood, artist, song].join(' ')}</Mood>`,
        role
      }
  }
}

export default formatRecommendationRequest
