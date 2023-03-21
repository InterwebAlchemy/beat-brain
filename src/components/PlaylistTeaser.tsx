import React from 'react'

import Image from 'next/image'

import PlaylistThumbnail from '../public/assets/img/thumbnail.png'

export interface PlaylistTeaserProps {
  name: string
  description?: string
  tracks?: Array<Record<string, any>>
  commentary?: string[]
}

const PlaylistTeaser = ({ name, description, tracks }): React.ReactElement => {
  const onListenClick = (): void => {
    // TODO: queue tracks in Spotify API and start playing the first one if it isn't already playing
  }

  const onAddToSpotifyClick = (): void => {
    // TODO: create playlist with the spotify API
  }

  return (
    <div className="playlist-teaser">
      <div className="playlist-teaser__main">
        <div className="playlist-teaser__thumbnail">
          <Image src={PlaylistThumbnail} alt="" width="90" height="90" />
        </div>
        <div className="playlist-teaser__details">
          <h4>{name}</h4>
          <div className="playlist-teaser__toolbar">
            <button
              className="playlist-teaser__toolbar__button playlist-teaser__toolbar__button--play"
              onClick={onListenClick}>
              Listen
            </button>
            <button
              className="playlist-teaser__toolbar__button playlist-teaser__toolbar__button--save"
              onClick={onAddToSpotifyClick}>
              Add to Spotify
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaylistTeaser
