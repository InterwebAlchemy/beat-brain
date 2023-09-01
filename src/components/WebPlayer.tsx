import React, { useEffect, useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import Image from 'next/image'
import Script from 'next/script'
import ReactMarkdown from 'react-markdown'
import type { Track } from '@spotify/web-api-ts-sdk'

import QueueIcon from './Icons/Queue'
import TurntableIcon from './Icons/Turntable'
import LikeIcon from './Icons/Like'
import PlayIcon from './Icons/Play'
import NextIcon from './Icons/Next'
import PauseIcon from './Icons/Pause'
import Robot from './Icons/Robot'

import useChat from '../hooks/useChat'
import { useInterval } from '../hooks/useInterval'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'
import formatArtistNames from '../utils/formatArtistNames'
import fetchHandler from '../utils/fetchHandler'

import PlaylistDetails from './PlaylistDetails'

import PlaylistThumbnail from '../public/assets/img/thumbnail.png'
import PrevIcon from './Icons/Prev'

const WebPlayer = (): React.ReactElement => {
  const session = useSession()

  const { getRecommendations, ready, conversation } = useChat()

  const [isPaused, setIsPaused] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [deviceId, setDeviceId] = useState<string>()
  const [player, setPlayer] = useState<Spotify.Player>()
  const [currentTrack, setCurrentTrack] = useState<Track>()
  const [showPlayer, setShowPlayer] = useState(true)
  const [playerState, setPlayerState] = useState<Spotify.PlaybackState | null>(
    null
  )
  const [playbackStartTime, setPlaybackStartTime] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [flipped, setFlipped] = useState<boolean>(false)
  const [recommendations, setRecommendations] = useState<Track[]>([])

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
        const previousTracksMessage = conversation?.addMessage(
          {
            message: {
              role: 'system',
              content: `${
                conversation.userHandle
              } has already listened to:\n${recommendations
                .map(
                  (track) =>
                    `<Track><Song>${track.name}</Song> - ${track.artists
                      .map((artist) => `<Artist>${artist.name}</Artist>`)
                      .join(', ')}</Track>`
                )
                .join('\n')}`
            }
          },
          'default',
          false
        )

        const playlist = await getRecommendations(
          {
            type: 'track',
            track: currentTrack,
            song: currentTrack.name,
            // @ts-expect-error
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
              if (typeof track !== 'undefined') {
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

                  if (typeof previousTracksMessage !== 'undefined') {
                    previousTracksMessage.memoryState = 'forgotten'
                  }

                  return queue
                } catch (error) {
                  console.error(error)
                }
              } else {
                // TODO: need to find another track
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

  const doesUserLikeTrack = async (): Promise<Record<string, boolean>> => {
    if (typeof currentTrack !== 'undefined' && currentTrack !== null) {
      try {
        const response = await fetchHandler<{ liked: boolean }>(
          `/api/spotify/like/${currentTrack?.id}`
        )

        return response
      } catch (error) {
        console.error(error)
      }
    }

    return { 0: false }
  }

  const renderCommentary = (): React.ReactElement[] => {
    const formatContent = (content: string = '', track: Track): string => {
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
              if (
                typeof currentTrack !== 'undefined' &&
                currentTrack.name.toLowerCase() === checkEntityName
              ) {
                content = content.replaceAll(
                  fullMatch,
                  `[${currentTrack.name}](${spotifyUriToUrl(currentTrack.uri)})`
                )
              } else if (
                typeof track !== 'undefined' &&
                track.name.toLowerCase() === checkEntityName
              ) {
                content = content.replaceAll(
                  fullMatch,
                  `[${track.name}](${spotifyUriToUrl(track.uri)})`
                )
              } else {
                content = content.replaceAll(fullMatch, entityName)
              }
            }

            break
          case 'Artist': {
            if (typeof currentTrack !== 'undefined') {
              const currentArtist = currentTrack.artists.find(
                (artist) => artist.name.toLowerCase() === checkEntityName
              )

              if (typeof currentArtist !== 'undefined') {
                content = content.replaceAll(
                  fullMatch,
                  `[${currentArtist.name}](${spotifyUriToUrl(
                    currentArtist.uri
                  )})`
                )
              } else if (typeof track !== 'undefined') {
                const suggestedArtist = track.artists.find(
                  (artist) => artist.name.toLowerCase() === checkEntityName
                )

                if (typeof suggestedArtist !== 'undefined') {
                  content = content.replaceAll(
                    fullMatch,
                    `[${suggestedArtist.name}](${spotifyUriToUrl(
                      suggestedArtist.uri
                    )})`
                  )
                } else {
                  content = content.replaceAll(fullMatch, entityName)
                }
              } else {
                content = content.replaceAll(fullMatch, entityName)
              }
            } else if (typeof track !== 'undefined') {
              const artist = track.artists.find(
                (artist) => artist.name.toLowerCase() === checkEntityName
              )

              if (typeof artist !== 'undefined') {
                content = content.replaceAll(
                  fullMatch,
                  `[${artist.name}](${spotifyUriToUrl(artist.uri)})`
                )
              } else {
                content = content.replaceAll(fullMatch, entityName)
              }
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
          // @ts-expect-error
          message.role === 'assistant' && message?.content?.tracks?.length > 0
      )
      .reverse()
      .map((messageObject) => {
        return (
          <li key={messageObject.id} className="beat-brain__suggestion">
            <div className="beat-brain__suggestion__notes">
              <ReactMarkdown linkTarget="_blank">
                {
                  // @ts-expect-error
                  messageObject?.message?.content?.tracks
                    ?.map(({ notes, track }) => formatContent(notes, track))
                    .join('\n')
                }
              </ReactMarkdown>
            </div>
          </li>
        )
      })
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
          // @ts-expect-error
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
    if (ready && !isActive && typeof deviceId !== 'undefined') {
      transferPlayback()
    } else if (ready && isActive) {
      fetch('/api/player/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId
        })
      }).catch((error) => {
        console.error(error)
      })
    }
  }, [ready, isActive, deviceId])

  useEffect(() => {
    if (
      ready &&
      typeof currentTrack !== 'undefined' &&
      currentTrack !== null &&
      currentTrack?.id !== null
    ) {
      doesUserLikeTrack()
        .then((liked) => {
          // @ts-expect-error
          currentTrack.liked = liked
        })
        .catch((error) => {
          console.error(error)
        })

      currentlyListeningTrackRecommendations().catch((error) => {
        console.error(error)
      })
    }

    return () => {
      recommendationRequest.abort()
      queueTrackRequest.abort()
    }
  }, [currentTrack?.id])

  if (ready && !isActive) {
    return (
      <>
        <h2>Transfer playback of Spotify to BeatBrain.</h2>
        <button
          className="btn-spotify btn-spotify__transfer"
          title="Connect to BeatBrain"
          // disabled={!ready || !isActive}
          onClick={transferPlayback}>
          <Robot fill="#fff" />
          <span>Listen</span>
        </button>
      </>
    )
  } else if (ready && isActive) {
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
                {!flipped ? (
                  <div className="player-controls">
                    <button
                      className="btn-spotify btn-spotify__previous"
                      title="Previous Track"
                      disabled={playerState?.disallows.skipping_prev}
                      onClick={() => {
                        player?.previousTrack().catch((error) => {
                          console.error(error)
                        })
                      }}>
                      <PrevIcon stroke="#fff" />
                    </button>

                    <button
                      className="btn-spotify btn-spotify__play-pause"
                      title={isPaused ? 'Play' : 'Pause'}
                      onClick={() => {
                        player?.togglePlay().catch((error) => {
                          console.error(error)
                        })
                      }}>
                      {isPaused ? (
                        <PlayIcon stroke="#fff" />
                      ) : (
                        <PauseIcon stroke="#fff" />
                      )}
                    </button>

                    <button
                      className="btn-spotify btn-spotify__next"
                      title="Next Track"
                      disabled={playerState?.disallows.skipping_next}
                      onClick={() => {
                        player?.nextTrack().catch((error) => {
                          console.error(error)
                        })
                      }}>
                      <NextIcon stroke="#fff" />
                    </button>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="main-wrapper__back">
                <div className="beat-brain__tracks">
                  <PlaylistDetails tracks={recommendations} visible={flipped} />
                </div>
              </div>
              <progress
                className="player-progress"
                max={playerState?.duration ?? 0}
                value={progress}></progress>
              {recommendations.length > 0 ? (
                <button
                  className={`flip-button${
                    flipped ? ' flip-button--flipped' : ''
                  }`}
                  title={flipped ? 'Now Playing' : 'Recommendations'}
                  onClick={onFlip}>
                  {flipped ? <TurntableIcon /> : <QueueIcon stroke="#f7f7f7" />}
                </button>
              ) : (
                <></>
              )}
            </div>
            {recommendations.length > 0 ? (
              <div
                className={`swap-button swap-button--${
                  showPlayer ? 'inactive' : 'active'
                }`}>
                <button onClick={onSwap} type="button">
                  <Image
                    src={PlaylistThumbnail}
                    alt=""
                    width="90"
                    height="90"
                  />
                </button>
              </div>
            ) : (
              <></>
            )}
            <div
              className={`beat-brain-container beat-brain-container--${
                showPlayer ? 'background' : 'foreground'
              }`}>
              <div className="beat-brain__commentary">
                <ol>{renderCommentary()}</ol>
              </div>
            </div>
          </div>
          {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
            <div className="now-playing">
              <button
                className="btn-spotify btn-spotify__play-pause"
                title={isPaused ? 'Play' : 'Pause'}
                onClick={() => {
                  player?.togglePlay().catch((error) => {
                    console.error(error)
                  })
                }}>
                {isPaused ? (
                  <PlayIcon stroke="#fff" />
                ) : (
                  <PauseIcon stroke="#fff" />
                )}
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
              <button
                className="btn-spotify btn-spotify__like"
                title={
                  // @ts-expect-error
                  currentTrack.liked === true ? 'Unlike' : 'Like'
                }
                onClick={() => {
                  fetchHandler(`/api/spotify/like/${currentTrack.id}`, {
                    // @ts-expect-error
                    method: currentTrack.liked === true ? 'DELETE' : 'POST'
                  })
                    .then((response) => {
                      // @ts-expect-error
                      currentTrack.liked = response[currentTrack?.id] ?? false
                    })
                    .catch((error) => {
                      console.error(error)
                    })
                }}>
                <LikeIcon
                  stroke={
                    // @ts-expect-error
                    currentTrack.liked === true ? '#1db954' : '#fff'
                  }
                />
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
        <Script src="https://sdk.scdn.co/spotify-player.js" async />
      </>
    )
  } else {
    return <>Loading...</>
  }
}

export default WebPlayer
