import type { ChatCompletionRequestMessage } from 'openai'
import type { Track } from '@spotify/web-api-ts-sdk'

export type MemoryState =
  | 'default'
  | 'core'
  | 'remembered'
  | 'forgotten'
  | 'system'
  | 'error'

export interface ExtendedChatCompletionRequestMessage {
  role: ChatCompletionRequestMessage['role']
  name?: ChatCompletionRequestMessage['name']
  content: Record<string, any>
}

export interface ConversationMessage {
  id: string
  memoryState: MemoryState
  displayMessage: boolean
  created: number
  messageType: 'message' | 'playlist' | 'recommendation'
  message: ChatCompletionRequestMessage | ExtendedChatCompletionRequestMessage
}

export interface BeatBrainPersona {
  id: string
  name: string
  prompt: string
}

export interface RecommendationRequest {
  type: 'track' | 'artist' | 'mood'
  track: Track
  artist?: string
  song?: string
  mood?: string
}

export interface BeatBrainResponse {
  // playlist name
  name?: string
  // playlist description
  description?: string
  // sometimes BeatBrain thinks it's clever and provides
  // what looks like a valid Spotify Track Object, but the
  // URI and other details are often hallucinated
  tracks?: string[] | Array<Record<string, unknown>>
  // this is kind of some freeform text it can use
  // so we have no idea what it will look like
  beatbrain: unknown
}
