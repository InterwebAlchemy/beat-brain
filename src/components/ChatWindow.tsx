import React from 'react'

import ChatBubble from './ChatBubble'

import { useChatScroll } from '../hooks/useChatScroll'

import useChat from '../hooks/useChat'

const ChatWindow = (): React.ReactElement => {
  const { conversation } = useChat()

  // TODO: include toggleScrolling state change
  const [scrollRef] = useChatScroll(conversation?.messages?.length)

  const renderConversation = (): React.ReactElement[] =>
    typeof conversation?.messages !== 'undefined' &&
    conversation?.messages?.length > 0
      ? conversation?.messages
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
      className="ai-research-assistant__conversation"
      // @ts-expect-error
      ref={scrollRef}>
      {renderConversation()}
    </div>
  )
}

export default ChatWindow
