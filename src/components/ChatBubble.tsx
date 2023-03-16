import React from 'react'

import converstUnixTimestampToISODate from '../utils/getISODate'

import type { ConversationMessage } from '../types'

export interface ChatBubbleProps {
  message: ConversationMessage
}

const ChatBubble = ({ message }: ChatBubbleProps): React.ReactElement => {
  const isUserMessage = message?.message.role === 'user'
  const isBotMessage = message?.message.role === 'assistant'

  const messageContent = message?.message?.content ?? ''

  return messageContent !== '' ? (
    <div
      className={`ai-research-assistant__conversation__item ai-research-assistant__conversation__item${
        isUserMessage ? '--user' : '--bot'
      }`}>
      <div className="ai-research-assistant__conversation__item__container">
        <div className="ai-research-assistant__conversation__item__text">
          {messageContent.trim()}
        </div>
      </div>
      <div className="ai-research-assistant__conversation__item__footer">
        {isBotMessage || isUserMessage ? (
          <div className="ai-research-assistant__conversation__item__speaker">
            {message?.message?.name}
          </div>
        ) : (
          <></>
        )}
        <div className="ai-research-assistant__conversation__item__timestamp">
          {converstUnixTimestampToISODate(message.created)}
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default ChatBubble
