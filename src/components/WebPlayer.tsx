import React, { useEffect, useState } from 'react'
import { useSession } from '@supabase/auth-helpers-react'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'

const WebPlayer = ({ setOutput }): React.ReactElement => {
  const session = useSession()

  const [isPaused, setIsPaused] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [deviceId, setDeviceId] = useState<string>()
  const [player, setPlayer] = useState<Spotify.Player>()
  const [currentTrack, setCurrentTrack] = useState<Spotify.Track>()

  const sendChat = async ({
    type,
    input
  }: Record<string, any>): Promise<void> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          input
        })
      }).then(async (response) => await response.json())

      setOutput(JSON.parse(response.response.output))

      console.log(response)
    } catch (error) {
      console.error(error)
    }
  }

  const getRecommendations = (): void => {
    sendChat({
      type: 'track',
      input: {
        song: currentTrack?.name,
        artist: currentTrack?.artists.map((artist) => artist.name).join(', ')
      }
    }).catch((error) => {
      console.error(error)
    })
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
      .then((data) => {
        setIsActive(true)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    if (session !== null) {
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

    return (): void => {
      if (typeof player !== 'undefined' && player !== null) {
        player.removeListener('ready')
        player.removeListener('not_ready')
        player.removeListener('player_state_changed')

        player.disconnect()
      }
    }
  }, [session?.provider_token])

  if (!isActive) {
    return (
      <div className="main-wrapper">
        <p>
          Instance not active. Transfer your playback to{' '}
          <strong>BeatBrain</strong> using your Spotify app
        </p>
        {typeof deviceId !== 'undefined' &&
        deviceId !== null &&
        deviceId !== '' ? (
          <button
            className="btn-transfer-playback"
            type="button"
            onClick={transferPlayback}>
            Listen in BeatBrain
          </button>
        ) : (
          <></>
        )}
      </div>
    )
  } else {
    return (
      <div className="main-wrapper">
        <div className="album-art">
          {typeof currentTrack !== 'undefined' && currentTrack !== null ? (
            <button
              className="btn-recommendations"
              type="button"
              onClick={getRecommendations}>
              Recommendations
            </button>
          ) : (
            <></>
          )}
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
    )
  }
}

export default WebPlayer
