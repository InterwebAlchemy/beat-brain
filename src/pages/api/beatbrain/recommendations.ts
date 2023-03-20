import { openAICompletion } from '../../../services/openai'
import Spotify from '../../../services/spotify'

import requestHandler from '../../../utils/requestHandler'

import formatHandle from '../../../services/openai/utils/formatHandle'

import { OPEN_AI_DEFAULT_MODEL_NAME } from '../../../services/openai/constants'
import { SYSTEM_HANDLE } from '../../../constants'

const getPlaylist = async (req, res): Promise<void> => {
  try {
    const { identifier, accessToken } = req
    const { messages, settings, input } = req.body

    const spotify = new Spotify(accessToken)

    let spotifyId: string | null = null

    const trackName = `${input?.song as string} - ${input?.artist as string}`

    if (input.type === 'track') {
      const entityTypeId = await spotify.entityType('track')

      try {
        const cachedItem = await spotify.checkEntityCache({
          entityName: trackName,
          entityTypeId
        })

        if (cachedItem !== null) {
          spotifyId = cachedItem.spotify_id
        }
      } catch (error) {
        console.error(error)

        // res.status(500).json(error)
      }
    }

    if (spotifyId === null) {
      try {
        const track = await spotify.getTrack({
          artist: input?.artist,
          song: input?.song
        })

        if (typeof track !== 'undefined' && track !== null) {
          try {
            const { error } = await spotify.cache
              .upsert({
                spotify_id: track.id,
                name: trackName,
                spotify_entity_type_id: await spotify.entityType('track')
                // last_updated: new Date().toISOString()
              })
              .select()

            if (typeof error !== 'undefined' && error !== null) {
              console.error(error)

              // res.status(500).json(error)
            }

            spotifyId = track.id
          } catch (error) {
            console.error(error)

            // res.status(500).json(error)
          }

          try {
            await Promise.all(
              track.artists.map(async (artist) => {
                try {
                  const { error } = await spotify.cache
                    .upsert({
                      spotify_id: artist.id,
                      name: artist.name,
                      spotify_entity_type_id: await spotify.entityType('artist')
                      // last_updated: new Date().toISOString()
                    })
                    .select()

                  if (typeof error !== 'undefined' && error !== null) {
                    console.error(error)

                    // res.status(500).json(error)
                  }
                } catch (error) {
                  console.error(error)

                  // res.status(500).json(error)
                }
              })
            )
          } catch (error) {
            console.error(error)

            // res.status(500).json(error)
          }
        }
      } catch (error) {
        console.error(error)

        // res.status(500).json(error)
      }
    }

    if (spotifyId !== null) {
      try {
        const analysis = await spotify.getAudioFeatures(spotifyId)

        messages.push({
          role: 'system',
          content: `Audio Features for "${trackName}": ${Object.entries(
            analysis
          )
            .filter(
              ([key]) =>
                ![
                  'type',
                  'id',
                  'uri',
                  'track_href',
                  'analysis_url',
                  'duration_ms'
                ].includes(key)
            )
            .map(([key, value]) => `${key}: ${value}`)
            .join(' / ')}`,
          name: formatHandle(SYSTEM_HANDLE)
        })
      } catch (error) {
        console.error(error)

        // res.status(500).json(error)
      }
    }

    const response = await openAICompletion({
      model: OPEN_AI_DEFAULT_MODEL_NAME,
      user: identifier,
      messages,
      ...settings
    })

    const suggestionMessage = response.choices[0].message

    if (typeof suggestionMessage?.content === 'string') {
      const parsedContentWithOutExtraSpaces = suggestionMessage.content
        .replace(/\s\s+/g, ' ')
        .replace(/\r?\n|\r/g, '')

      try {
        const REGEX = /```json(\{.*\})?```/gim

        const matches = REGEX.exec(parsedContentWithOutExtraSpaces)

        const playlist = JSON.parse(matches?.[1] ?? '{}')

        const { tracks } = playlist

        messages.push(suggestionMessage)

        // let tracksAreAvailable = false

        // while (!tracksAreAvailable) {
        playlist.tracks = await Promise.all(
          tracks.map(
            async (track: {
              artist: string
              song: string
              notes?: string
              spotifyId?: string
              artists?: Array<{ name: string; id: string }>
            }) => {
              const entityName = `${track?.song} - ${track?.artist}`
              if (entityName === trackName) {
                return {
                  ...track,
                  spotifyId
                }
              } else {
                try {
                  const cachedItem = await spotify.checkEntityCache({
                    entityName: `${track?.song} - ${track?.artist}`,
                    entityTypeId: await spotify.entityType('track')
                  })

                  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
                  if (cachedItem !== null && cachedItem?.spotify_id !== null) {
                    track.spotifyId = cachedItem.spotify_id
                  }

                  if (
                    typeof track?.spotifyId === 'undefined' ||
                    track?.spotifyId === null
                  ) {
                    const foundTrack = await spotify.getTrack({
                      artist: track?.artist,
                      song: track?.song
                    })

                    if (
                      typeof foundTrack !== 'undefined' &&
                      foundTrack !== null
                    ) {
                      try {
                        const { error } = await spotify.cache
                          .upsert({
                            spotify_id: foundTrack.id,
                            name: `${foundTrack.name} - ${foundTrack.artists
                              .map((artist) => artist.name)
                              .join(', ')}`,
                            spotify_entity_type_id: await spotify.entityType(
                              'track'
                            )
                            // last_updated: new Date().toISOString(),
                          })
                          .select()

                        if (typeof error !== 'undefined' && error !== null) {
                          console.error(error)

                          // res.status(500).json(error)
                        }

                        track.spotifyId = foundTrack.id
                      } catch (error) {
                        console.error(error)

                        // res.status(500).json(error)
                      }

                      try {
                        track.artists = await Promise.all(
                          foundTrack.artists.map(async (artist) => {
                            try {
                              const { error } = await spotify.cache
                                .upsert({
                                  spotify_id: artist.id,
                                  name: artist.name,
                                  spotify_entity_type_id:
                                    await spotify.entityType('artist')
                                  // last_updated: new Date().toISOString(),
                                })
                                .select()

                              if (
                                typeof error !== 'undefined' &&
                                error !== null
                              ) {
                                console.error(error)

                                // res.status(500).json(error)
                              }
                            } catch (error) {
                              console.error(error)

                              // res.status(500).json(error)
                            }

                            return {
                              name: artist.name,
                              id: artist.id
                            }
                          })
                        )
                      } catch (error) {
                        console.error(error)

                        // res.status(500).json(error)
                      }
                    }
                  }
                } catch (error) {
                  console.error(error)

                  // res.status(500).json(error)
                }
              }

              return track
            }
          )
        )

        const tracksAreAvailable: boolean = tracks.every(
          (track: { spotifyId: string | null }) => spotifyId
        )

        if (!tracksAreAvailable) {
          const unavailableTracks: Array<{
            song: string
            artist: string
            spotifyId?: string
          }> = tracks.filter(
            (track: { spotifyId: string | null }) =>
              typeof spotifyId === 'undefined' || spotifyId === null
          )

          console.log('UNAVAILABLE TRACKS', unavailableTracks)

          messages.push({
            role: 'system',
            content: `The following tracks are unavailable:
            
${unavailableTracks
  .map(
    (track: { artist: string; song: string }) =>
      `${track?.song} - ${track?.artist}`
  )
  .join('\n')}
  
Please recommend alternate tracks that are available on Spotify and would fit the theme of:

<Playlist>${playlist?.name as string}</Playlist>.

Provide your recommendations in a Markdown JSON codeblock, like:

\`\`\`json
{
  "tracks": [
    { "artist": "Artist Name", "song": "Song Name", "notes": "Optional notes" }
  ]
}\`\`\``,
            name: formatHandle(SYSTEM_HANDLE)
          })

          console.log(messages)
        }

        console.log('TRACKS ARE AVAILABLE', tracksAreAvailable)
        // }

        res.status(200).json({
          ...response,
          playlist
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      res.status(200).json(response)
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