import * as React from 'react'

const QueueIcon = (props): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    viewBox="0 0 24 24"
    {...props}>
    <path
      stroke={props.stroke ?? '#000'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M16 5v13m0 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2ZM4 5h8M4 9h8m-8 4h4m8-9 4-1v4l-4 1V4Z"
    />
  </svg>
)

export default QueueIcon
