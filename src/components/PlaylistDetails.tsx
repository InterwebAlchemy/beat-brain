import React from 'react'
import type { Track } from '@spotify/web-api-ts-sdk'

import spotifyUriToUrl from '../utils/spotifyUriToUrl'
import fetchHandler from '../utils/fetchHandler'

export interface PlaylistDetailsProps {
  tracks: Track[]
  visible?: boolean
  deviceId?: string
}

const PlaylistDetails = ({
  tracks = [],
  visible = false,
  deviceId
}: PlaylistDetailsProps): React.ReactElement => {
  const linkClickHandler = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void => {
    e.stopPropagation()
  }

  const onPlayTrack = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    const uri = e.currentTarget.dataset.spotifyuri

    fetchHandler(`/api/spotify/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uri, deviceId })
    }).catch((error) => {
      console.error(error)
    })
  }

  const renderArtists = (track: Track): React.ReactElement[] =>
    track.artists.map((artist, index) => {
      return (
        <React.Fragment key={artist.id ?? index}>
          <a
            key={artist.id ?? index}
            onClick={linkClickHandler}
            href={spotifyUriToUrl(`spotify:artist:${artist.id}`)}>
            {artist.name}
          </a>
          {index < track.artists.length - 1 ? ', ' : ''}
        </React.Fragment>
      )
    })

  const rendertracks = (tracks: Track[]): React.ReactElement[] => {
    // remove duplicate suggestions; this happens a lot during development
    // borrowed from: https://stackoverflow.com/a/56768137
    return [...new Map(tracks.map((item) => [item.id, item])).values()].map(
      (item, index) => {
        return (
          <li key={item?.id ?? index} className="playlist-details__track">
            <button
              className="playlist-details__track__button"
              onClick={onPlayTrack}
              data-spotifyid={item?.id}
              data-spotifyuri={item?.uri}>
              <div className="playlist-details__track__header">
                <div className="playlist-details__track__image">
                  <img
                    src={item?.album?.images?.[0]?.url ?? ''}
                    className="now-playing__cover"
                    alt={`Album cover art for ${
                      item?.album?.name ?? 'Unknown'
                    }`}
                  />
                </div>
                <div className="playlist-details__track__info">
                  <h5 className="playlist-details__track__name">
                    <a
                      onClick={linkClickHandler}
                      href={spotifyUriToUrl(`spotify:track:${item?.id}`)}>
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
      }
    )
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
