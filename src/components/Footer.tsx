import React from 'react'

import Image from 'next/image'

import SpotifySVG from '../public/assets/img/spotify.svg'
import OpenAISVG from '../public/assets/img/openai.svg'

const Footer = (): React.ReactElement => {
  return (
    <footer className="footer">
      <div className="powered-by">
        Powered by{' '}
        <a href="https://www.spotify.com">
          <Image src={SpotifySVG} width="18" height="18" alt="" />
          Spotify
        </a>
        {' and '}
        <a href="https://www.openai.com">
          <Image src={OpenAISVG} width="18" height="18" alt="" />
          OpenAI
        </a>
      </div>
    </footer>
  )
}

export default Footer
