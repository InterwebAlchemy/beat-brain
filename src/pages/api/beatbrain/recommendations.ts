import type { Track } from '@spotify/web-api-ts-sdk'

import { getRecommendation } from '../../../services/openai'
import Spotify from '../../../services/spotify'

import requestHandler from '../../../utils/requestHandler'

const getPlaylist = async (req, res): Promise<void> => {
  try {
    const { identifier, accessToken } = req
    const { messages, input } = req.body

    console.log(input)

    const spotify = new Spotify(accessToken)

    try {
      const track: Track = input.track

      if (typeof track !== 'undefined') {
        messages.push({
          role: 'system',
          content: `DO NOT RECOMMEND A <Track> FROM ${track.artists
            .map(({ name }) => `<Artist>${name}</Artist>`)
            .join(', ')}`
        })

        const response = await getRecommendation({
          user: identifier,
          messages
        })

        const suggestionMessage = response.choices[0].message

        console.log('suggestionMessage:', suggestionMessage)

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
                    const foundTrack = await spotify.search({
                      artist: track?.artist,
                      song: track?.song
                    })

                    console.log(foundTrack)

                    if (
                      typeof foundTrack !== 'undefined' &&
                      foundTrack !== null
                    ) {
                      track.track = foundTrack
                    } else {
                      // @ts-expect-error
                      track = {
                        error: true,
                        message: "That track doesn't exist"
                      }
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

            res.status(500).json(error)
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
