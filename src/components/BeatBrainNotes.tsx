import React from 'react'
import type { Artist, SimplifiedArtist, Track } from '@spotify/web-api-ts-sdk'

import BeatBrainNote from './BeatBrainNote'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'
import type { Conversation } from '../services/conversation/conversation'

export interface BeatBrainNoteProps {
  showPlayer: boolean
  trackStore: Record<string, Track>
  artistStore: Record<string, Artist | SimplifiedArtist>
  conversation: Conversation | null
}

const BeatBrainNotes = ({
  showPlayer,
  conversation,
  artistStore,
  trackStore
}): React.ReactElement => {
  const renderCommentary = (): React.ReactElement[] => {
    const formatContent = (content: string = ''): string => {
      const entityTagRegex =
        /<(Track|Song|Artist)>(.*?)<\/(Track|Song|Artist)>/gim

      const foundEntities = content.matchAll(entityTagRegex)

      for (const entity of foundEntities) {
        const [fullMatch, entityType, entityName] = entity

        const checkEntityName = entityName.trim().toLowerCase()

        switch (entityType) {
          case 'Track':
          case 'Song':
            // see if the track contains just a string or also some tagged entities
            // if it does, our matchAll from before will pick it up and we can just remove the track tags
            // if it doesn't, we need to do a lookup for the track and replace the tags with the track name
            if (
              (entityType === 'Track' && !entityTagRegex.test(entityName)) ||
              entityType === 'Song'
            ) {
              const foundTrackDetails = Object.values(trackStore).find(
                (track) => {
                  // @ts-expect-error
                  if (track.name.trim().toLowerCase() === checkEntityName) {
                    return track
                  }

                  return false
                }
              )

              if (typeof foundTrackDetails !== 'undefined') {
                content = content.replaceAll(
                  fullMatch,
                  // @ts-expect-error
                  `[${foundTrackDetails?.name as string}](${spotifyUriToUrl(
                    // @ts-expect-error
                    foundTrackDetails.uri
                  )})`
                )
              } else {
                content = content.replaceAll(fullMatch, entityName)
              }
            }

            break
          case 'Artist': {
            const foundArtistDetails = Object.values(artistStore).find(
              (artist) => {
                // @ts-expect-error
                if (artist.name.trim().toLowerCase() === checkEntityName) {
                  return artist
                }

                return false
              }
            )

            if (typeof foundArtistDetails !== 'undefined') {
              content = content.replaceAll(
                fullMatch,
                // @ts-expect-error
                `[${foundArtistDetails?.name as string}](${spotifyUriToUrl(
                  // @ts-expect-error
                  foundArtistDetails.uri
                )})`
              )
            } else {
              content = content.replaceAll(fullMatch, entityName)
            }

            break
          }
        }
      }

      return content
    }

    if (conversation === null) {
      return [<></>]
    }

    return conversation.messages
      .filter(
        ({ message }) =>
          message.role === 'assistant' && message?.content?.tracks?.length > 0
      )
      .reverse()
      .map((messageObject) => {
        // TODO: fix all these type errors instead of ignoring them
        if (typeof messageObject.message.content.renderTracks === 'undefined') {
          messageObject.message.content.renderTracks =
            messageObject?.message?.content?.tracks
              ?.map(({ notes }) => formatContent(notes))
              .join('\n')
        }

        return <BeatBrainNote message={messageObject} key={messageObject.id} />
      })
  }

  return (
    <div
      className={`beat-brain-container beat-brain-container--${
        showPlayer === true ? 'background' : 'foreground'
      }`}>
      <div className="beat-brain__commentary">
        <ol>{renderCommentary()}</ol>
      </div>
    </div>
  )
}

export default BeatBrainNotes
