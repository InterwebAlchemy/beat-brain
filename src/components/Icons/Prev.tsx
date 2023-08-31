import * as React from 'react'

const PrevIcon = (props): React.ReactElement => (
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
      strokeWidth={1.5}
      d="M5 18V6m14 0v12L9 12l10-6Z"
    />
  </svg>
)

export default PrevIcon
