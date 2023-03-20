import React from 'react'

import converstUnixTimestampToISODate from '../utils/getISODate'

import type { ConversationMessage } from '../types'

export interface ChatBubbleProps {
  message: ConversationMessage
}

const ChatBubble = ({ message }: ChatBubbleProps): React.ReactElement => {
  const isUserMessage = message?.message.role === 'user'
  const isBotMessage = message?.message.role === 'assistant'

  const messageType = message?.messageType

  const messageContent = message?.message?.content ?? ''

  if (messageType === 'playlist') {
    const playlist = messageContent as Record<string, any>
    return (
      <div
        className={`ai-research-assistant__conversation__item ai-research-assistant__conversation__item${
          isUserMessage ? '--user' : '--bot'
        }`}>
        <div className="ai-research-assistant__conversation__item__container">
          <div className="ai-research-assistant__conversation__item__playlist">
            {typeof playlist?.commentary?.intro !== 'undefined' &&
            playlist?.commentary?.intro !== '' ? (
              <p>{playlist.commentary.intro}</p>
            ) : (
              <></>
            )}
            <h4>{playlist.name as string}</h4>
            <p>{playlist.description as string}</p>
            <ol>
              {playlist.tracks.map((item, index) => (
                <li key={item.spotifyId ?? index}>
                  <strong>
                    {item.song} - {item.artist}
                  </strong>
                  {typeof item?.notes !== 'undefined' && item.notes !== ''
                    ? `: ${item.notes as string}`
                    : ''}
                </li>
              ))}
            </ol>
            {typeof playlist?.commentary?.notes !== 'undefined' &&
            playlist?.commentary?.notes !== '' ? (
              <p>{playlist.commentary.notes}</p>
            ) : (
              <></>
            )}
            {typeof playlist?.commentary?.outro !== 'undefined' &&
            playlist?.commentary?.outro !== '' ? (
              <p>{playlist.commentary.outro}</p>
            ) : (
              <></>
            )}
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
    )
  } else {
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
}

export default ChatBubble
