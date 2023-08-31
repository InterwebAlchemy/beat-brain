import type { Track } from '@spotify/web-api-ts-sdk'

import { getRecommendation } from '../../../services/openai'
import Spotify from '../../../services/spotify'

import requestHandler from '../../../utils/requestHandler'

const getPlaylist = async (req, res): Promise<void> => {
  try {
    const { identifier, accessToken } = req
    const { messages, input } = req.body

    const spotify = new Spotify(accessToken)

    try {
      const track = await spotify.getTrack({
        artist: input?.artist,
        song: input?.song
      })

      if (typeof track !== 'undefined') {
        messages.push({
          role: 'system',
          content: `Choose a <Track> from an <Artist> not in this list: ${track.artists
            .map(({ name }) => `<Artist>${name}</Artist>`)
            .join(', ')}`
        })

        const response = await getRecommendation({
          user: identifier,
          messages
        })

        const suggestionMessage = response.choices[0].message

        if (typeof suggestionMessage?.content === 'string') {
          const parsedContentWithOutExtraSpaces = suggestionMessage.content
            .replace(/\s\s+/g, ' ')
            .replace(/\r?\n|\r/g, '')

          try {
            const REGEX = /(?:```)?\s*(?:json)?\s*(\{.*\})\s*(?:```)/gim

            const matches = REGEX.exec(parsedContentWithOutExtraSpaces)

            const playlist = JSON.parse(matches?.[1] ?? '{}')

            const { tracks } = playlist

            messages.push(suggestionMessage)

            playlist.tracks = await Promise.all(
              tracks.map(
                async (track: {
                  artist: string
                  song: string
                  notes?: string
                  track?: Track
                }) => {
                  try {
                    const foundTrack = await spotify.getTrack({
                      artist: track?.artist,
                      song: track?.song
                    })

                    if (
                      typeof foundTrack !== 'undefined' &&
                      foundTrack !== null
                    ) {
                      track.track = foundTrack
                    }
                  } catch (error) {
                    console.error(error)
                  }

                  return track
                }
              )
            )

            res.status(200).json({
              ...response,
              playlist
            })
          } catch (error) {
            console.error(error)
          }
        } else {
          res.status(500)
        }
      } else {
        res.status(500)
      }
    } catch (error) {
      console.error(error)

      res.status(500).json(error)
    }
  } catch (error) {
    console.error(error)

    res.status(500).json(error)
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: getPlaylist
    },
    req,
    res
  )
}
