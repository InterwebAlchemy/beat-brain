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
        <React.Fragment key={artist.id ?? index}>
          <a
            key={artist.id ?? index}
            onClick={linkClickHandler}
            href={spotifyUriToUrl(`spotify:artist:${artist.id as string}`)}>
            {artist.name}
          </a>
          {index < track.artists.length - 1 ? ', ' : ''}
        </React.Fragment>
      )
    })

  const rendertracks = (tracks): React.ReactElement[] => {
    return tracks.map((item, index) => {
      return (
        <li key={item?.id ?? index} className="playlist-details__track">
          <button
            className="playlist-details__track__button"
            onClick={onPlayTrack}
            data-spotifyid={item?.id}>
            <div className="playlist-details__track__header">
              <div className="playlist-details__track__image">
                <img
                  src={item?.album?.images?.[0]?.url ?? ''}
                  className="now-playing__cover"
                  alt={`Album cover art for ${
                    (item?.album?.name as string) ?? 'Unknown'
                  }`}
                />
              </div>
              <div className="playlist-details__track__info">
                <h5 className="playlist-details__track__name">
                  <a
                    onClick={linkClickHandler}
                    href={spotifyUriToUrl(
                      `spotify:track:${item?.id as string}`
                    )}>
                    {item.name}
                  </a>
                </h5>
                <h6 className="playlist-details__track__artist">
                  {renderArtists(item)}
                </h6>
              </div>
            </div>
          </button>
        </li>
      )
    })
  }

  return (
    <div
      className={`playlist-details ${
        visible ? ' playlist-details--visible' : 'playlist-details--hidden'
      }`}>
      <div className="playlist-details__container">
        <div className="playlist-details__tracks">
          <ol className="playlist-details__tracks__list">
            {rendertracks(tracks)}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default PlaylistDetails
