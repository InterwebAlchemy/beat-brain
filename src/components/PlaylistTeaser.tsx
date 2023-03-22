import React, { useState } from 'react'

import Image from 'next/image'

import PlaylistDetails from './PlaylistDetails'

import PlaylistThumbnail from '../public/assets/img/thumbnail.png'

export interface PlaylistTeaserProps {
  name: string
  tracks?: Array<Record<string, any>>
  commentary?: string[]
}

const PlaylistTeaser = ({ name, tracks }): React.ReactElement => {
  const [detailsVisible, setDetailsVisible] = useState(false)

  const onListenClick = (): void => {
    // TODO: queue tracks in Spotify API and start playing the first one if it isn't already playing
  }

  const onAddToSpotifyClick = (): void => {
    // TODO: create playlist with the spotify API
  }

  const onAddToQueueClick = (): void => {
    // TODO: add tracks to Spotify queue via API
  }

  const toggleDetails = (): void => {
    // TODO: toggle visiblility of the playlist details
    setDetailsVisible((visible) => !visible)
  }

  return (
    <div className="playlist-teaser">
      <div className="playlist-teaser__main">
        <div className="playlist-teaser__thumbnail">
          <Image src={PlaylistThumbnail} alt="" width="90" height="90" />
        </div>
        <div className="playlist-teaser__details">
          <h4 className="playlist-teaser__name">{name}</h4>
          <div className="playlist-teaser__toolbar">
            <button
              className="playlist-teaser__toolbar__button playlist-teaser__toolbar__button--play"
              onClick={onListenClick}>
              Play
            </button>
            <button
              className="playlist-teaser__toolbar__button playlist-teaser__toolbar__button--save"
              onClick={onAddToSpotifyClick}>
              Save
            </button>
            <button
              className="playlist-teaser__toolbar__button playlist-teaser__toolbar__button--queue"
              onClick={onAddToQueueClick}>
              Queue
            </button>
          </div>
        </div>
        <button
          className="playlist-teaser__toolbar__button playlist-teaser__toolbar__button--toggle"
          onClick={toggleDetails}>
          Details
        </button>
      </div>
      <div className="playlist-teaser__extra">
        <PlaylistDetails tracks={tracks} visible={detailsVisible} />
      </div>
    </div>
  )
}

export default PlaylistTeaser
