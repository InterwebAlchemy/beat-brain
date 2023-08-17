import { useContext, useEffect, useState, useRef } from 'react'

import { useSession } from '@supabase/auth-helpers-react'

import sampleSize from 'lodash.samplesize'

import type { CreateChatCompletionResponse } from 'openai'

import type {
  PrivateUser,
  CurrentlyPlaying,
  Track
} from 'spotify-web-api-ts/types/types/SpotifyObjects'

import type { GetMyTopArtistsResponse } from 'spotify-web-api-ts/types/types/SpotifyResponses'

import useProfile from './useProfile'
import ChatContext from '../context/ChatContext'

import fetchHandler from '../utils/fetchHandler'

import type { Conversation } from '../services/conversation/conversation'

import type { RecommendationRequest } from '../types'
import formatRecommendationRequest from '../utils/formatRecommendationRequest'
import { BOT_HANDLE } from '../constants'

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
  const greeted = useRef(false)

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

        conversation.addPlaylist(playlist)

        // we don't want to remember every recommendation because it would
        // pollute our memory context and wast tokens
        message.memoryState = 'forgotten'

        result = playlist
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

  const seedingRequest = new AbortController()
  const greetingRequest = new AbortController()

  const greetUser = async (): Promise<void> => {
    if (
      typeof conversation !== 'undefined' &&
      conversation !== null &&
      !greeted.current
    ) {
      const requestMessage = conversation.addMessage(
        {
          message: {
            role: 'user',
            content: `Hey there, ${BOT_HANDLE}!`
          }
        },
        'default',
        false
      )

      executeConversation({
        signal: greetingRequest.signal
      }).catch((error) => {
        console.error(error)
      })

      requestMessage.memoryState = 'forgotten'
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

      const { details } = await fetchHandler<{
        details: {
          me: PrivateUser
          topArtists: GetMyTopArtistsResponse
          currentTrack: CurrentlyPlaying | string
        }
      }>('/api/spotify/info', {
        signal: seedingRequest.signal
      })

      if (typeof details !== 'undefined' && details !== null) {
        const inputs: string[] = []

        const sampledArtists = sampleSize(
          details.topArtists.items.filter(({ type }) => type === 'artist'),
          10
        )

        const artistNames = sampledArtists.map((artist) => artist.name.trim())

        inputs.push(`Favorite Artists: ${artistNames.join(', ')}`)

        const genreNames = sampledArtists.map((artist) => artist.genres).flat()

        if (
          typeof details.currentTrack !== 'undefined' &&
          details.currentTrack !== null &&
          details.currentTrack !== '' &&
          typeof details.currentTrack !== 'string' &&
          details.currentTrack?.currently_playing_type === 'track'
        ) {
          const { currentTrack } = details

          inputs.push(
            `Currently Playing: ${
              currentTrack?.item?.name?.trim?.() as string
            } by ${(currentTrack?.item as Track)?.artists
              .map((artist) => artist.name.trim())
              .join(', ')}.`
          )
        }

        inputs.push(`Favorite Genres: ${genreNames.join(', ')}`)

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
      }
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
            console.log('Seeding user details')
            seeded.current = true

            greetUser()
              .then(() => {
                greeted.current = true
              })
              .catch((error) => {
                console.error(error)
              })
          })
          .catch((error) => {
            console.error(error)
          })
      } else if (!greeted.current) {
        greetUser()
          .then(() => {
            console.log('Greeting user')
            greeted.current = true
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
  }, [conversation?.id, profile?.username])

  useEffect(() => {
    console.log(greeted.current, seeded.current)
    setReady(greeted?.current && seeded?.current)
  }, [greeted?.current, seeded?.current])

  useEffect(() => {
    return () => {
      seedingRequest.abort()
      greetingRequest.abort()
    }
  })

  return {
    ready,
    conversation,
    executeConversation,
    getRecommendations
  }
}

export default useChat
