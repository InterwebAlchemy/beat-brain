import React, { useState } from 'react'

import Image from 'next/image'

import PlaylistDetails from './PlaylistDetails'

import PlaylistThumbnail from '../public/assets/img/thumbnail.png'

export interface PlaylistTeaserProps {
  name: string
  tracks?: Array<Record<string, any>>
  commentary?: string[]
}

const PlaylistTeaser = ({ name, tracks, children }): React.ReactElement => {
  const [detailsVisible, setDetailsVisible] = useState(false)

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
        <div className="playlist-teaser__details">{children}</div>
      </div>
      <div className="playlist-teaser__extra">
        <PlaylistDetails tracks={tracks} visible={detailsVisible} />
      </div>
    </div>
  )
}

export default PlaylistTeaser
