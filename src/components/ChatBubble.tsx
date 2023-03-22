import React from 'react'

import PlaylistTeaser from './PlaylistTeaser'

import converstUnixTimestampToISODate from '../utils/getISODate'
import spotifyUriToUrl from '../utils/spotifyUriToUrl'

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
            <div className="playlist__description">{playlist.description}</div>

            <PlaylistTeaser name={playlist.name} tracks={playlist.tracks} />

            {typeof playlist?.commentary?.[0] !== 'undefined' &&
            playlist?.commentary?.[0] !== '' ? (
              <p>{playlist.commentary[0]}</p>
            ) : (
              <></>
            )}

            <ol>
              {playlist.tracks.map((item, index) => {
                return (
                  <li key={item?.id ?? index}>
                    <strong>
                      <a
                        href={spotifyUriToUrl(
                          `spotify:track:${item.spotifyId as string}`
                        )}>
                        {item.song}
                      </a>
                    </strong>
                    : {item.notes ?? 'No notes for this track'}
                  </li>
                )
              })}
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
