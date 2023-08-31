import React, { useEffect, useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import Script from 'next/script'

import useChat from '../hooks/useChat'
import { useInterval } from '../hooks/useInterval'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'
import formatArtistNames from '../utils/formatArtistNames'
import fetchHandler from '../utils/fetchHandler'

import PlaylistDetails from './PlaylistDetails'

import PlaylistThumbnail from '../public/assets/img/thumbnail.png'

const WebPlayer = (): React.ReactElement => {
  const session = useSession()

  const { getRecommendations, ready } = useChat()

  const [isPaused, setIsPaused] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [deviceId, setDeviceId] = useState<string>()
  const [player, setPlayer] = useState<Spotify.Player>()
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track>()
  const [showPlayer, setShowPlayer] = useState(true)
  const [playerState, setPlayerState] = useState<Spotify.PlaybackState | null>(
    null
  )
  const [playbackStartTime, setPlaybackStartTime] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [flipped, setFlipped] = useState<boolean>(false)
  const [recommendations, setRecommendations] = useState<Spotify.Track[]>([])

  const recommendationRequest = new AbortController()
  const queueTrackRequest = new AbortController()

  const getStatePosition = (): void => {
    if (playerState !== null) {
      if (playerState?.paused) {
        setProgress(playerState?.position ?? 0)
      }

      const position =
        playerState.position + (performance.now() - playbackStartTime)

      setProgress(
        position > playerState.duration ? playerState.duration : position
      )
    }
  }

  const currentlyListeningTrackRecommendations = async (): Promise<void> => {
    if (typeof currentTrack !== 'undefined' && currentTrack.type === 'track') {
      try {
        const playlist = await getRecommendations(
          {
            type: 'track',
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
            tracks.map(async ({ track }) => {
              const { uri } = track

              try {
                const queue = await fetchHandler<{ queued: string }>(
                  '/api/spotify/queue',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      uri
                    }),
                    signal: queueTrackRequest.signal
                  }
                )

                setRecommendations((recommendations) => [
                  track,
                  ...recommendations
                ])

                return queue
              } catch (error) {
                console.error(error)
              }
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
        setIsActive(true)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const onSwap = (): void => {
    setShowPlayer((showPlayer) => !showPlayer)
  }

  const onFlip = (): void => {
    setFlipped((flipped) => !flipped)
  }

  useInterval(getStatePosition, isPaused ? null : 200)

  useEffect(() => {
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

        setDeviceId(deviceId)
      })

      player.addListener('not_ready', () => {
        setIsActive(false)
      })

      player.addListener('player_state_changed', (state) => {
        if (typeof state !== 'undefined' && state !== null) {
          setCurrentTrack(state.track_window.current_track)
          setIsPaused(state.paused)
          setPlayerState(state)
          setPlaybackStartTime(performance.now())
        }
      })

      player.connect().catch((error) => {
        console.error(error)
      })
    }
  }, [])

  // when the app loads, transfer playback
  useEffect(() => {
    if (ready) {
      if (!isActive) {
        console.log('READY')

        transferPlayback()
      } else {
        console.log('ALREADY ACTIVE')
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
      currentlyListeningTrackRecommendations().catch((error) => {
        console.error(error)
      })
    }

    return () => {
      recommendationRequest.abort()
      queueTrackRequest.abort()
    }
  }, [currentTrack?.id])

  return (
    <>
      <div className="app-container">
        <div className="swap-wrapper">
          <div
            className={`main-wrapper main-wrapper--${
              showPlayer ? 'foreground' : 'background'
            }${flipped ? ' main-wrapper--flipped' : ''}`}>
            <div className="main-wrapper__front">
              <div className="album-art">
                {typeof currentTrack !== 'undefined' &&
                currentTrack !== null ? (
                  <a href={spotifyUriToUrl(currentTrack.uri)} target="_blank">
                    <img
                      src={currentTrack?.album?.images?.[0]?.url ?? ''}
                      className="now-playing__cover"
                      alt={`Album cover art for ${
                        currentTrack?.album?.name ?? 'Unknown'
                      }`}
                    />
                  </a>
                ) : (
                  <></>
                )}
              </div>
              <div className="player-controls">
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
              </div>
              <progress
                className="player-progress"
                max={playerState?.duration ?? 0}
                value={progress}></progress>
            </div>
            <div className="main-wrapper__back">
              <div className="beta-brain-tracks">
                <PlaylistDetails tracks={recommendations} visible={flipped} />
              </div>
            </div>
            <button className="flip-button" onClick={onFlip}>
              Queue
            </button>
          </div>
          <div
            className={`swap-button swap-button--${
              showPlayer ? 'inactive' : 'active'
            }`}>
            <button onClick={onSwap} type="button">
              <Image src={PlaylistThumbnail} alt="" width="90" height="90" />
            </button>
          </div>
          <div
            className={`beat-brain-container beat-brain-container--${
              showPlayer ? 'background' : 'foreground'
            }`}>
            <div className="beta-brain-commentary">
              <PlaylistDetails tracks={[]} visible={!showPlayer} />
            </div>
          </div>
        </div>
        <div className="now-playing">
          {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
            <>
              <button
                className="btn-spotify"
                onClick={() => {
                  player?.togglePlay().catch((error) => {
                    console.error(error)
                  })
                }}>
                {isPaused ? 'PLAY' : 'PAUSE'}
              </button>
              <div className="now-playing__details">
                <div className="now-playing__song">
                  <a href={spotifyUriToUrl(currentTrack.uri)} target="_blank">
                    {currentTrack.name}
                  </a>
                </div>
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
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <Script src="https://sdk.scdn.co/spotify-player.js" async />
    </>
  )
}

export default WebPlayer
