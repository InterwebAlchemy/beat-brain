// combine the conversation service and openai service into an integrated chat service
// make sure to udpate the conversation context when user sends a message
import type { CreateChatCompletionResponse } from 'openai'

import Conversations, { type Conversation } from './conversation'

import type { ConversationMessage } from '../../types'

import { OPEN_AI_DEFAULT_MODEL_NAME } from '../openai/constants'

export interface ChatInterface {
  model?: string
}

class Chat {
  model: string
  currentConversationId: string | null = null
  conversations: typeof Conversations
  stopExecution: AbortController

  constructor({ model = OPEN_AI_DEFAULT_MODEL_NAME }: ChatInterface) {
    this.currentConversationId = null
    this.model = model
    this.conversations = Conversations
    this.stopExecution = new AbortController()
  }

  currentConversation(): Conversation | null {
    if (this.currentConversationId === null) {
      return null
    }

    return this.conversations.getConversation(this.currentConversationId)
  }

  async execute({
    signal = this.stopExecution.signal
  }: {
    signal?: AbortSignal
  } = {}): Promise<CreateChatCompletionResponse | Record<string, any>> {
    const conversation = this.currentConversation()

    if (conversation !== null) {
      try {
        const messages = conversation
          .getConversationMessages()
          .map(({ message }) => message)

        const response = await fetch('/api/openai/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal,
          body: JSON.stringify({
            messages,
            settings: conversation.settings
          })
        }).then(async (response) => await response.json())

        return response
      } catch (error) {
        console.error(error)

        return error
      }
    }

    return {
      error: 'No conversation found'
    }
  }

  async add(message: Partial<ConversationMessage>): Promise<void> {
    const conversation = this.currentConversation()

    if (conversation !== null) {
      conversation.addMessage(message)
    }
  }

  async send(prompt: string): Promise<void> {
    const conversation = this.currentConversation()

    if (
      typeof prompt !== 'undefined' &&
      prompt !== '' &&
      conversation !== null
    ) {
      conversation.addRequest({
        role: 'user',
        content: prompt
      })

      try {
        const response = await this.execute({})

        conversation.addMessage(response)
      } catch (error) {
        conversation.addMessage(error.message)

        console.error(error)
      }
    }
  }

  start({ preamble, settings }: Partial<Conversation>): void {
    const conversation = this.conversations.startConversation({
      preamble,
      settings
    })

    this.currentConversationId = conversation.id
  }
}

export default Chat
