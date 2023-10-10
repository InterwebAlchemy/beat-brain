import { useContext, useEffect, useState, useRef } from 'react'

import { useSession } from '@supabase/auth-helpers-react'

import type { Track, PlaybackState, Artist } from '@spotify/web-api-ts-sdk'

import sampleSize from 'lodash.samplesize'

import type { CreateChatCompletionResponse } from 'openai'

import useProfile from './useProfile'
import ChatContext from '../context/ChatContext'

import fetchHandler from '../utils/fetchHandler'

import type { Conversation } from '../services/conversation/conversation'

import type { RecommendationRequest } from '../types'
import formatRecommendationRequest from '../utils/formatRecommendationRequest'

const useChat = (): {
  ready: boolean
  conversation: Conversation | null
  executeConversation: (init?: RequestInit) => Promise<void>
  getRecommendations: (
    request: RecommendationRequest,
    init?: RequestInit
  ) => Promise<Record<string, any>>
} => {
  const session = useSession()

  const profile = useProfile()

  const { conversation } = useContext(ChatContext)

  const [ready, setReady] = useState(false)

  const seeded = useRef(false)

  const topArtistsRequest = new AbortController()
  const currentTrackRequest = new AbortController()

  const getRecommendations = async (
    request: RecommendationRequest,
    init: RequestInit = {}
  ): Promise<Record<string, any>> => {
    let result = {}

    if (typeof conversation !== 'undefined' && conversation !== null) {
      const requestMessage = formatRecommendationRequest(request)

      const message = conversation.addMessage(
        {
          message: requestMessage
        },
        'default',
        false
      )

      const messages = conversation
        .getConversationMessages()
        .map(({ message }) => message)

      try {
        const response = await fetchHandler<
          CreateChatCompletionResponse & { playlist: Record<string, any> }
        >('/api/beatbrain/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages,
            input: request,
            settings: conversation.settings
          }),
          ...init
        })

        conversation.addResponse(response, 'forgotten', false)

        const { playlist } = response

        const missingTracks = playlist.tracks.some(({ error }) => error)

        if (missingTracks === true) {
          const newResult = await getRecommendations(request, init)

          return newResult
        } else {
          conversation.addPlaylist(playlist)

          // we don't want to remember every recommendation because it would
          // pollute our memory context and wast tokens
          message.memoryState = 'forgotten'

          result = playlist
        }
      } catch (error) {
        console.error(error)

        result = error
      }
    }

    return result
  }

  const executeConversation = async (init: RequestInit = {}): Promise<void> => {
    if (typeof conversation !== 'undefined' && conversation !== null) {
      const messages = conversation
        .getConversationMessages()
        .map(({ message }) => message)

      try {
        const response = await fetchHandler<CreateChatCompletionResponse>(
          '/api/openai/completion',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messages,
              settings: conversation.settings
            }),
            ...init
          }
        )

        conversation.addResponse(response)
      } catch (error) {
        console.error(error)

        conversation.addMessage(
          {
            message: {
              role: 'system',
              content: error.message
            }
          },
          'forgotten',
          false
        )
      }
    }
  }

  const seedUserDetails = async (): Promise<void> => {
    if (
      typeof session !== 'undefined' &&
      session !== null &&
      typeof conversation !== 'undefined' &&
      conversation !== null &&
      typeof profile !== 'undefined' &&
      profile !== null &&
      !seeded.current
    ) {
      const userName = profile?.first_name ?? (profile?.username as string)

      conversation?.setUserHandle(userName)

      const inputs: string[] = [`User: ${userName}`]

      if (
        typeof profile?.last_seen !== 'undefined' &&
        profile?.last_seen !== null
      ) {
        inputs.push(
          `Current Date: ${new Date().toLocaleDateString()}`,
          `Last Listening Session: ${new Date(
            profile?.last_seen
          ).toLocaleDateString()}`
        )
      }

      const getTopArtists = fetchHandler<{ top: Artist[] }>(
        '/api/spotify/top',
        {
          signal: topArtistsRequest.signal,
          query: {
            type: 'artists'
          }
        }
      )

      const getCurrentlyPlaying = fetchHandler<{
        current: PlaybackState | string
      }>('/api/spotify/current', {
        signal: currentTrackRequest.signal
      })

      const [topArtists = { top: [] }, currentTrack = { current: '' }]: [
        { top: Artist[] },
        { current: PlaybackState | string }
      ] = await Promise.all([getTopArtists, getCurrentlyPlaying])

      const sampledArtists = sampleSize(
        topArtists.top.filter(({ type }) => type === 'artist'),
        10
      )

      const artistNames = sampledArtists.map((artist) => artist.name.trim())
      const genreNames = sampledArtists.map((artist) => artist.genres).flat()

      inputs.push(
        `Favorite Artists: ${artistNames
          .map((artist) => `<Artist>${artist}</Artist>`)
          .join(', ')}`
      )

      inputs.push(`Favorite Genres: ${genreNames.join(', ')}`)

      if (
        typeof currentTrack?.current !== 'undefined' &&
        currentTrack.current !== null &&
        currentTrack.current !== '' &&
        typeof currentTrack.current !== 'string' &&
        currentTrack.current?.currently_playing_type === 'track'
      ) {
        inputs.push(
          `Currently Listening to:\n` +
            `<Track>\n` +
            `  <Song>${currentTrack?.current?.item?.name?.trim?.()}<Song>\n` +
            `  ${(currentTrack?.current?.item as Track)?.artists
              .map((artist) => `<Artist>${artist.name.trim()}</Artist>`)
              .join('\n')}\n` +
            `</Track>`
        )
      }

      conversation?.addMessage(
        {
          message: {
            role: 'system',
            content: inputs.join('\n')
          }
        },
        'core',
        false
      )
    } else {
      throw new Error('Could not seed conversation.')
    }
  }

  useEffect(() => {
    if (
      typeof conversation !== 'undefined' &&
      conversation !== null &&
      profile !== null &&
      !ready
    ) {
      if (!seeded.current) {
        seedUserDetails()
          .then(() => {
            seeded.current = true

            setReady(true)
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }

    return () => {
      topArtistsRequest.abort()
      currentTrackRequest.abort()
    }
  }, [conversation?.id, profile?.username])

  return {
    ready,
    conversation,
    executeConversation,
    getRecommendations
  }
}

export default useChat
