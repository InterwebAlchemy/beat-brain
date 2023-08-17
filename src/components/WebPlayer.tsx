import React, { useEffect, useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import type { CurrentlyPlaying } from 'spotify-web-api-ts/types/types/SpotifyObjects'

import useChat from '../hooks/useChat'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'
import formatArtistNames from '../utils/formatArtistNames'
import fetchHandler from '../utils/fetchHandler'

import PlaylistTeaser from './PlaylistTeaser'

const WebPlayer = (): React.ReactElement => {
  const session = useSession()

  const { getRecommendations, ready } = useChat()

  const [isPaused, setIsPaused] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [deviceId, setDeviceId] = useState<string>()
  const [player, setPlayer] = useState<Spotify.Player>()
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track>()

  const recommendationRequest = new AbortController()
  const queueTrackRequest = new AbortController()
  const playTrackRequest = new AbortController()

  const currentlyListeningTrackRecommendations = async (): Promise<void> => {
    if (typeof currentTrack !== 'undefined' && currentTrack.type === 'track') {
      try {
        const playlist = await getRecommendations(
          {
            type: 'track',
            // TODO: figure out why this Track type is different
            // @ts-expect-error
            track: currentTrack,
            song: currentTrack.name,
            artist: formatArtistNames(currentTrack.artists)
          },
          {
            signal: recommendationRequest.signal
          }
        )

        const { tracks } = playlist

        if (tracks.length > 0) {
          await Promise.all(
            tracks.map(async (track) => {
              const { spotifyUri } = track

              console.log('QUEUING:', spotifyUri)

              const queue = await fetchHandler<CurrentlyPlaying | string>(
                '/api/spotify/queue',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    uri: spotifyUri
                  }),
                  signal: queueTrackRequest.signal
                }
              )

              console.log('QUEUED:', spotifyUri)

              return queue
            })
          )
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const transferPlayback = (): void => {
    fetch('/api/player/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deviceId
      })
    })
      .then(async (response) => await response.json())
      .then((response) => {
        console.log(response)
        console.log(currentTrack)

        setIsActive(true)

        // if (
        //   typeof currentTrack === 'undefined' ||
        //   currentTrack === null ||
        //   (typeof currentTrack !== 'undefined' && currentTrack?.id === null)
        // ) {
        //   setInitialTrack().catch((error) => {
        //     console.error(error)
        //   })
        // }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const setInitialTrack = async (): Promise<void> => {
    try {
      let track

      const playlist = await getRecommendations(track, {
        signal: recommendationRequest.signal
      })

      const { tracks } = playlist

      console.log(tracks)

      if (tracks.length > 0) {
        const track = tracks[0]

        const { spotifyUri } = track

        console.log('PLAYING:', spotifyUri)

        await fetchHandler('/api/spotify/play', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uri: spotifyUri,
            deviceId
          }),
          signal: playTrackRequest.signal
        })

        setCurrentTrack(track)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    if (
      session !== null &&
      typeof session.provider_token !== 'undefined' &&
      session.provider_token !== null
    ) {
      document.body.appendChild(script)
    }

    window.onSpotifyWebPlaybackSDKReady = (): void => {
      const player = new window.Spotify.Player({
        name: 'BeatBrain',
        getOAuthToken: (func) => {
          func(session?.provider_token ?? '')
        },
        volume: 0.5
      })

      setPlayer(player)

      player.addListener('ready', (playerInstance) => {
        const { device_id: deviceId } = playerInstance

        console.log(playerInstance)

        setDeviceId(deviceId)
      })

      player.addListener('not_ready', () => {
        setIsActive(false)
      })

      player.addListener('player_state_changed', (state) => {
        if (typeof state !== 'undefined' && state !== null) {
          setCurrentTrack(state.track_window.current_track)
          setIsPaused(state.paused)
        }
      })

      player.connect().catch((error) => {
        console.error(error)
      })
    }
  }, [session?.provider_token])

  useEffect(() => {
    return () => {
      recommendationRequest.abort()
      queueTrackRequest.abort()
      playTrackRequest.abort()
    }
  }, [])

  // when the app loads, transfer playback
  useEffect(() => {
    if (ready) {
      if (!isActive) {
        console.log('READY')

        transferPlayback()
      } else {
        if (
          typeof currentTrack === 'undefined' ||
          currentTrack === null ||
          (typeof currentTrack !== 'undefined' && currentTrack?.id === null)
        ) {
          setInitialTrack().catch((error) => {
            console.error(error)
          })
        }
      }
    } else {
      console.log('NOT READY')
    }
  }, [ready, isActive])

  useEffect(() => {
    if (
      ready &&
      typeof currentTrack !== 'undefined' &&
      currentTrack !== null &&
      currentTrack?.id !== null
    ) {
      console.log('PLAYING:', currentTrack)

      currentlyListeningTrackRecommendations().catch((error) => {
        console.error(error)
      })
    }
  }, [currentTrack?.id])

  return (
    <div className="main-wrapper">
      <button
        className="btn-spotify"
        onClick={() => {
          player?.previousTrack().catch((error) => {
            console.error(error)
          })
        }}>
        &lt;&lt;
      </button>

      <button
        className="btn-spotify"
        onClick={() => {
          player?.togglePlay().catch((error) => {
            console.error(error)
          })
        }}>
        {isPaused ? 'PLAY' : 'PAUSE'}
      </button>

      <button
        className="btn-spotify"
        onClick={() => {
          player?.nextTrack().catch((error) => {
            console.error(error)
          })
        }}>
        &gt;&gt;
      </button>
      <div className="album-art">
        {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
          <a href={spotifyUriToUrl(currentTrack.uri)} target="_blank">
            <img
              src={currentTrack.album.images[0].url}
              className="now-playing__cover"
              alt={`Album cover art for ${currentTrack.album.name}`}
            />
          </a>
        ) : (
          <></>
        )}
      </div>

      <PlaylistTeaser name="BeatBrain Recommends" tracks={[]}>
        <div className="now-playing">
          {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
            <div className="now-playing__song">
              <a href={spotifyUriToUrl(currentTrack.uri)} target="_blank">
                {currentTrack.name}
              </a>
            </div>
          ) : (
            <></>
          )}
          {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
            <div className="now-playing__artist">
              {currentTrack.artists.map((artist, index) => {
                return (
                  <React.Fragment key={artist.uri}>
                    <a href={spotifyUriToUrl(artist.uri)} target="_blank">
                      {artist.name}
                    </a>
                    {index !== currentTrack.artists.length - 1 ? ', ' : ''}
                  </React.Fragment>
                )
              })}
            </div>
          ) : (
            <></>
          )}
        </div>
      </PlaylistTeaser>
    </div>
  )
  // }
}

export default WebPlayer
