import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'

const WebPlayer = (): React.ReactElement => {
  const { data: session, status } = useSession()

  const [isPaused, setIsPaused] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [deviceId, setDeviceId] = useState<string>()
  const [player, setPlayer] = useState<Spotify.Player>()
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track>()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    if (status === 'authenticated') {
      document.body.appendChild(script)
    }

    window.onSpotifyWebPlaybackSDKReady = (): void => {
      const player = new window.Spotify.Player({
        name: 'BeatBrain',
        getOAuthToken: (cb) => {
          // @ts-expect-error
          cb(session.accessToken ?? '')
        },
        volume: 0.5
      })

      setPlayer(player)

      player.addListener('ready', (playerInstance) => {
        console.log('READY:', playerInstance)

        const { device_id: deviceId } = playerInstance

        setDeviceId(deviceId)

        console.log('Device ID: ', deviceId)
      })

      player.addListener('not_ready', (playerInstance) => {
        console.log('NOT READY:', playerInstance)

        const { device_id: deviceId } = playerInstance

        console.log(`Device ${deviceId} Disconnected...`)
      })

      player.addListener('autoplay_failed', () => {
        console.log('Could not autoplay...')
      })

      player.addListener('player_state_changed', (state) => {
        if (typeof state !== 'undefined' && state !== null) {
          setCurrentTrack(state.track_window.current_track)
          setIsPaused(state.paused)

          player
            .getCurrentState()
            .then((state) => {
              state === null ? setIsActive(false) : setIsActive(true)
            })
            .catch((error) => {
              console.error(error)
            })
        }
      })

      player
        .connect()
        .then(async (): Promise<void> => {
          console.log('Web Player connected')
        })
        .catch((error) => {
          console.error(error)
        })
    }
    // @ts-expect-error
  }, [session?.accessToken, status])

  useEffect(() => {
    if (typeof currentTrack !== 'undefined' && currentTrack !== null) {
      console.log(currentTrack)
    }
  }, [currentTrack])

  useEffect(() => {
    if (
      typeof deviceId !== 'undefined' &&
      deviceId !== null &&
      deviceId !== '' &&
      !isActive
    ) {
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
        .then((data) => {
          console.log('TRANSFERRED PLAYBACK')
          console.log(data)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }, [deviceId])

  useEffect(() => {}, [isActive])

  if (!isActive) {
    return (
      <div className="container">
        <div className="main-wrapper">
          <p>
            Instance not active. Transfer your playback to{' '}
            <strong>BeatBrain</strong> using your Spotify app
          </p>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container">
        <div className="main-wrapper">
          {typeof currentTrack !== 'undefined' ? (
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

          <div className="now-playing__side">
            {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
              <div className="now-playing__name">
                <a href={spotifyUriToUrl(currentTrack.uri)} target="_blank">
                  {currentTrack.name}
                </a>
              </div>
            ) : (
              <></>
            )}
            {typeof currentTrack !== 'undefined' ? (
              <div className="now-playing__artist">
                {currentTrack.artists.map((artist) => {
                  return (
                    <a
                      key={artist.uri}
                      href={spotifyUriToUrl(artist.uri)}
                      target="_blank">
                      {artist.name}
                    </a>
                  )
                })}
              </div>
            ) : (
              <></>
            )}

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
        </div>
      </div>
    )
  }
}

export default WebPlayer
