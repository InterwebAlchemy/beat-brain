import { createContext } from 'react'

import type { Conversation } from '../services/conversation/conversation'

import type { Database } from '../types/database.types'

export type UserProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'username' | 'avatar_url' | 'first_name' | 'last_seen' | 'bot_persona'
>

export interface ChatContextProps {
  conversation: Conversation | null
}

const ChatContext = createContext<ChatContextProps>({
  conversation: null
})

export default ChatContext
