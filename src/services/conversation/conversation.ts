import { v4 as uuidv4 } from 'uuid'

import type {
  ChatCompletionRequestMessage,
  CreateChatCompletionResponse
} from 'openai'

import formatInput from '../../utils/formatInput'
import getUnixTimestamp from '../../utils/getUnixTimestamp'
import formatHandle from '../openai/utils/formatHandle'

import {
  DEFAULT_MAX_MEMORY_COUNT,
  SYSTEM_HANDLE,
  BOT_HANDLE
} from '../../constants'

import { OPEN_AI_BOT_SETTINGS } from '../openai/constants'

import type { ConversationMessage, MemoryState } from '../../types'

export interface ConversationSettings {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface ConversationInterface {
  id: string
  preamble: string
  timestamp: number
  messages: ConversationMessage[]
  settings: ConversationSettings
  userHandle: string
  systemHandle: string
  botHandle: string
}

export class Conversation {
  id: ConversationInterface['id']
  preamble: ConversationInterface['preamble']
  timestamp: ConversationInterface['timestamp']
  messages: ConversationInterface['messages']
  settings: ConversationSettings
  temperature: number
  userHandle = 'User'
  systemHandle = SYSTEM_HANDLE
  botHandle = BOT_HANDLE

  constructor({
    preamble = '',
    timestamp = getUnixTimestamp(),
    id = uuidv4(),
    messages = [],
    settings = OPEN_AI_BOT_SETTINGS
  }: Partial<ConversationInterface>) {
    this.id = id
    this.preamble = preamble
    this.timestamp = timestamp
    this.messages = messages

    const conversationSettings = {
      maxTokens: OPEN_AI_BOT_SETTINGS.maxTokens,
      temperature: OPEN_AI_BOT_SETTINGS.temperature,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      ...settings
    }

    this.settings = conversationSettings
  }

  start({
    messages,
    userHandle
  }: {
    messages: ConversationMessage[]
    userHandle: string
  }): void {
    this.messages = messages

    this.setUserHandle(userHandle)
  }

  setUserHandle(userHandle: string = 'User'): void {
    this.userHandle = userHandle
  }

  getNumberofMemoriesForState(state: MemoryState): number {
    return this.getMemories(state).length
  }

  getTotalNumberOfMemories(): number {
    return this.getMemories(['default', 'core', 'remembered']).length
  }

  getMemories(
    state: MemoryState | MemoryState[],
    messages?: ConversationMessage[]
  ): ConversationMessage[] {
    const comparison = (memoryState: MemoryState): boolean =>
      Array.isArray(state) ? state.includes(memoryState) : memoryState === state

    return (typeof messages !== 'undefined' ? messages : this.messages).filter(
      (message) => comparison(message.memoryState)
    )
  }

  getContext(includePreamble: boolean = false): string {
    // TODO: summarize the prompt (or maybe the response from OpenAI) and add it to the context
    // instead of just appending the message
    const contextMessages: ConversationMessage[] = []
    const coreMemories: ConversationMessage[] = []

    const maxMemories = DEFAULT_MAX_MEMORY_COUNT

    // get all memories that haven't been forgotten
    const memories = this.getMemories(['default', 'remembered', 'core'])

    // core memories take precedence
    // and we don't limit how many we include
    coreMemories.push(...this.getMemories('core', memories))

    // if we still need more memories, add remembered memories
    if (contextMessages.length < maxMemories) {
      // specific memories come next
      contextMessages.push(
        ...this.getMemories('remembered', memories)
          // grab the most recent memories that we can fit
          // borrowed from: https://stackoverflow.com/a/6473869/656011
          .slice(Math.max(contextMessages.length - maxMemories, 0))
      )
    }

    // if we still need more memories, add latest messages that weren't forgotten
    if (contextMessages.length < maxMemories) {
      // most recent mesages come last
      contextMessages.push(
        // make sure we're looking at the default memories
        ...this.getMemories('default', memories)
          // grab the most recent number of messages we can fit
          // borrowed from: https://stackoverflow.com/a/6473869/656011
          .slice(Math.max(contextMessages.length - maxMemories, 0))
      )
    }

    const formattedContextMessages = [...coreMemories, ...contextMessages]
      // because we've added memories of different types to the memory stack at different times
      // we want to sort it chronologically so the final order of the memories will make sense
      .sort((a, b) => a.created - b.created)

      // get formatted message text
      .map((message) => {
        if (message.message.role === 'user') {
          return `${this.userHandle}: ${message.message.content as string}`
        } else if (message.message.role === 'assistant') {
          return `${this.botHandle}: ${message.message.content as string}`
        } else {
          return `${this.systemHandle}: ${message.message.content as string}`
        }
      })

    // if we want to include our preamble in the context, add it to the beginning of the array
    if (includePreamble && this.preamble !== '') {
      formattedContextMessages.unshift(this.preamble)
    }

    return formatInput(formattedContextMessages.join('\n'))
  }

  getConversationMessages(): ConversationMessage[] {
    // TODO: summarize the prompt (or maybe the response from OpenAI) and add it to the context
    // instead of just appending the message
    const contextMessages: ConversationMessage[] = []

    const maxMemories = DEFAULT_MAX_MEMORY_COUNT

    // get all memories that haven't been forgotten
    const memories = this.getMemories(['default', 'remembered', 'core'])

    // core memories take precedence
    // and we don't limit how many we include
    contextMessages.push(...this.getMemories('core', memories))

    // if we still need more memories, add remembered memories
    if (contextMessages.length < maxMemories) {
      // specific memories come next
      contextMessages.push(
        ...this.getMemories('remembered', memories)
          // grab the most recent memories that we can fit
          // borrowed from: https://stackoverflow.com/a/6473869/656011
          .slice(Math.max(contextMessages.length - maxMemories, 0))
      )
    }

    // if we still need more memories, add latest messages that weren't forgotten
    if (contextMessages.length < maxMemories) {
      // most recent mesages come last
      contextMessages.push(
        // make sure we're looking at the default memories
        ...this.getMemories('default', memories)
          // grab the most recent number of messages we can fit
          // borrowed from: https://stackoverflow.com/a/6473869/656011
          .slice(Math.max(contextMessages.length - maxMemories, 0))
      )
    }

    contextMessages.unshift({
      id: '0',
      memoryState: 'system' as MemoryState,
      displayMessage: false,
      created: this.timestamp,
      messageType: 'message',
      message: this.formatMessage({
        role: 'system',
        content: this.preamble
      })
    })

    return contextMessages
  }

  getMessageHandle(message: Partial<ChatCompletionRequestMessage>): string {
    switch (message?.role) {
      case 'user':
        return formatHandle(this.userHandle)
      case 'assistant':
        return formatHandle(this.botHandle)
      case 'system':
      default:
        return formatHandle(this.systemHandle)
    }
  }

  formatMessage(
    message: Partial<ChatCompletionRequestMessage>
  ): ChatCompletionRequestMessage {
    const defaultMessage: ChatCompletionRequestMessage = {
      role: 'system' as ChatCompletionRequestMessage['role'],
      content: ''
    }

    defaultMessage.name = this.getMessageHandle(defaultMessage)

    const thisMessage = {
      ...message,
      name: this.getMessageHandle(message)
    }

    return {
      ...defaultMessage,
      ...thisMessage
    }
  }

  addMessage(
    message: Partial<ConversationMessage>,
    memoryState: MemoryState = 'default',
    displayMessage: boolean = true
  ): ConversationMessage {
    const conversationMessage: ConversationMessage = {
      id: uuidv4(),
      memoryState,
      displayMessage,
      created: getUnixTimestamp(),
      messageType: 'message',
      message: this.formatMessage(
        (message?.message as ChatCompletionRequestMessage) ?? {}
      )
    }

    this.messages.push(conversationMessage)

    return conversationMessage
  }

  addRequest(
    request: ChatCompletionRequestMessage,
    memoryState: MemoryState = 'default',
    displayMessage: boolean = true
  ): ConversationMessage {
    const message = this.formatMessage(request)

    const conversationMessage: ConversationMessage = {
      id: uuidv4(),
      memoryState,
      displayMessage,
      created: getUnixTimestamp(),
      messageType: 'message',
      message
    }

    this.messages.push(conversationMessage)

    return conversationMessage
  }

  addResponse(
    response: CreateChatCompletionResponse,
    memoryState: MemoryState = 'default',
    displayMessage: boolean = true
  ): ConversationMessage {
    const message = this.formatMessage(response.choices[0].message ?? {})

    const conversationMessage: ConversationMessage = {
      id: response?.id ?? uuidv4(),
      created: response?.created ?? getUnixTimestamp(),
      memoryState,
      displayMessage,
      messageType: 'message',
      message
    }

    if (typeof message !== 'undefined') {
      if (message.role === 'assistant' || message.role === 'user') {
        conversationMessage.memoryState = memoryState ?? 'default'
      } else {
        conversationMessage.memoryState = memoryState ?? 'system'
        conversationMessage.displayMessage = false
      }
    }

    this.messages.push(conversationMessage)

    return conversationMessage
  }

  addPlaylist(playlist: Record<string, any>): ConversationMessage {
    const message = {
      role: 'assistant' as ChatCompletionRequestMessage['role'],
      content: playlist,
      name: this.getMessageHandle({ role: 'assistant' })
    }

    const conversationMessage: ConversationMessage = {
      id: uuidv4(),
      memoryState: 'forgotten',
      displayMessage: true,
      created: getUnixTimestamp(),
      messageType: 'playlist',
      message
    }

    this.messages.push(conversationMessage)

    return conversationMessage
  }
}

export interface ConversationManagerInterface {
  conversations: Record<string, Conversation>
}

export class ConversationManager {
  conversations: ConversationManagerInterface['conversations']
  currentConversationId: string | null = null

  constructor() {
    this.conversations = {}
  }

  startConversation({
    preamble,
    settings
  }: Partial<Conversation>): Conversation {
    const conversation = new Conversation({
      preamble,
      settings
    })

    this.conversations[conversation.id] = conversation

    this.currentConversationId = conversation.id

    return conversation
  }

  currentConversation(): Conversation | null {
    if (this.currentConversationId === null) {
      return null
    }

    return this.conversations[this.currentConversationId]
  }

  getConversation(id: string): Conversation | null {
    if (typeof this.conversations[id] !== 'undefined') {
      return this.conversations[id]
    }

    return null
  }

  addMessage(id: string, message: ConversationMessage): void {
    this.conversations[id].addMessage(message)
  }
}

const Conversations = new ConversationManager()

export default Conversations
