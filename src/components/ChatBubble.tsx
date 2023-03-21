import React from 'react'

import PlaylistTeaser from './PlaylistTeaser'

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
        className={`conversation__item conversation__item${
          isUserMessage ? '--user' : '--bot'
        }`}>
        <div className="conversation__item__container">
          <div className="conversation__item__playlist">
            {typeof playlist?.commentary?.[0] !== 'undefined' &&
            playlist?.commentary?.[0] !== '' ? (
              <p>{playlist.commentary[0]}</p>
            ) : (
              <></>
            )}

            <PlaylistTeaser
              name={playlist.name}
              description={playlist.description}
              tracks={playlist.tracks}
            />

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

            {playlist?.commentary?.slice(1).map((item, index) => {
              return <p key={index}>{item}</p>
            })}
          </div>
        </div>
        <div className="conversation__item__footer">
          {isBotMessage || isUserMessage ? (
            <div className="conversation__item__speaker">
              {message?.message?.name}
            </div>
          ) : (
            <></>
          )}
          <div className="conversation__item__timestamp">
            {converstUnixTimestampToISODate(message.created)}
          </div>
        </div>
      </div>
    )
  } else {
    return messageContent !== '' ? (
      <div
        className={`conversation__item conversation__item${
          isUserMessage ? '--user' : '--bot'
        }`}>
        <div className="conversation__item__container">
          <div className="conversation__item__text">
            {messageContent.trim()}
          </div>
        </div>
        <div className="conversation__item__footer">
          {isBotMessage || isUserMessage ? (
            <div className="conversation__item__speaker">
              {message?.message?.name}
            </div>
          ) : (
            <></>
          )}
          <div className="conversation__item__timestamp">
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
