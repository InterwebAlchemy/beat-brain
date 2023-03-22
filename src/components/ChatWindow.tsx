import React from 'react'

import ChatBubble from './ChatBubble'

import { useChatScroll } from '../hooks/useChatScroll'

import type { ConversationMessage } from '../types'

export interface ChatWindowProps {
  messages: ConversationMessage[]
}

const ChatWindow = ({ messages = [] }: ChatWindowProps): React.ReactElement => {
  // TODO: include toggleScrolling state change
  const [scrollRef] = useChatScroll(messages?.length)

  const renderConversation = (): React.ReactElement[] =>
    typeof messages !== 'undefined' && messages?.length > 0
      ? messages
          .filter(({ displayMessage, message: { role } }) => displayMessage)
          .map((message, index) => (
            <ChatBubble
              key={message.id ?? `message-${index}`}
              message={message}
            />
          ))
      : [<React.Fragment key="no-results"></React.Fragment>]

  return (
    <div
      className="conversation"
      // @ts-expect-error
      ref={scrollRef}>
      {renderConversation()}
    </div>
  )
}

export default ChatWindow
