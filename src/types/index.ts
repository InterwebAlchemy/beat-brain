import type { ChatCompletionRequestMessage } from 'openai'

import type { Database } from '../types/database.types'

export type UserProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'first_name' | 'last_seen' | 'bot_persona'
>

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
