import React from 'react'
import ReactMarkdown from 'react-markdown'

export interface BeatBrainNoteProps {
  message: Record<string, any>
}

const BeatBrainNote = ({ message }: BeatBrainNoteProps): React.ReactElement => {
  if (typeof message === 'undefined') {
    return <></>
  }

  return typeof message?.message?.content?.renderTracks !== 'undefined' ? (
    <li key={message.id} className="beat-brain__suggestion">
      <div className="beat-brain__suggestion__notes">
        <ReactMarkdown linkTarget="_blank">
          {(message?.message?.content as Record<string, any>)?.renderTracks}
        </ReactMarkdown>
      </div>
    </li>
  ) : typeof message?.message?.content?.tracks?.[0]?.notes !== 'undefined' ? (
    <li key={message.id} className="beat-brain__suggestion">
      <div className="beat-brain__suggestion__notes">
        <ReactMarkdown linkTarget="_blank">
          {message?.message?.content?.tracks?.[0]?.notes as string}
        </ReactMarkdown>
      </div>
    </li>
  ) : (
    <React.Fragment key={message.id}></React.Fragment>
  )
}

export default BeatBrainNote
