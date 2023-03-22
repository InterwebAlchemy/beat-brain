import React from 'react'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'

export interface PlaylistDetailsProps {
  tracks: Array<Record<string, any>>
  visible?: boolean
}

const PlaylistDetails = ({
  tracks,
  visible = false
}: PlaylistDetailsProps): React.ReactElement => {
  const linkClickHandler = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void => {
    e.stopPropagation()
  }

  const onPlayTrack = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    const spotifyId = e.currentTarget.dataset.spotifyid

    // TODO: play track via Spotify API
    console.log('play track', spotifyId)
  }

  const renderArtists = (track): React.ReactElement[] =>
    track.artists.map((artist, index) => {
      return (
        <>
          <a
            onClick={linkClickHandler}
            href={spotifyUriToUrl(`spotify:artist:${artist.id as string}`)}>
            {artist.name}
          </a>
          {index !== track.artists.length - 1 ? ', ' : ''}
        </>
      )
    })

  return (
    <div
      className={`playlist-details ${
        visible ? ' playlist-details--visible' : 'playlist-details--hidden'
      }`}>
      <div className="playlist-details__container">
        <div className="playlist-details__tracks">
          <ol className="playlist-details__tracks__list">
            {tracks.map((item, index) => (
              <li
                key={item.spotifyId ?? index}
                className="playlist-details__track">
                <button
                  className="playlist-details__track__button"
                  onClick={onPlayTrack}
                  data-spotifyid={item.spotifyId}>
                  <div className="playlist-details__track__header">
                    <div className="playlist-details__track__number">
                      {index + 1}
                    </div>
                    <div className="playlist-details__track__info">
                      <h5 className="playlist-details__track__name">
                        <a
                          onClick={linkClickHandler}
                          href={spotifyUriToUrl(
                            `spotify:track:${item.spotifyId as string}`
                          )}>
                          {item.song}
                        </a>
                      </h5>
                      <h6 className="playlist-details__track__artist">
                        {renderArtists(item)}
                      </h6>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default PlaylistDetails
