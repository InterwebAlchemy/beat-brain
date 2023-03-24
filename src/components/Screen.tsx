import React from 'react'

import Header from './Header'
import Footer from './Footer'

const Screen = ({ children }: React.PropsWithChildren): React.ReactElement => {
  return (
    <div className="screen">
      <Header />
      <div className="view">{children}</div>
      <Footer />
    </div>
  )
}

export default Screen
