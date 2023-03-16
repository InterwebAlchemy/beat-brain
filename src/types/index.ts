import type { ChatCompletionRequestMessage } from 'openai'

export type MemoryState =
  | 'default'
  | 'core'
  | 'remembered'
  | 'forgotten'
  | 'system'
  | 'error'

export interface ConversationMessage {
  id: string
  memoryState: MemoryState
  displayMessage: boolean
  created: number
  message: ChatCompletionRequestMessage
}

export interface BeatBrainPersona {
  id: string
  name: string
  prompt: string
}

export interface RecommendationRequest {
  type: 'track' | 'artist' | 'mood'
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
