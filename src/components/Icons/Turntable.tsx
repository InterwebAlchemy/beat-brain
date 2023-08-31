import * as React from 'react'

const TurntableIcon = (props): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={40}
    height={40}
    style={{
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      strokeLinejoin: 'round',
      strokeMiterlimit: 2
    }}
    viewBox="0 0 32 32"
    {...props}>
    <path d="M28.002 7a3 3 0 0 0-3-3H7c-.796 0-1.559.316-2.121.879A2.996 2.996 0 0 0 4 7v18c0 .796.316 1.559.879 2.121A2.996 2.996 0 0 0 7 28h18.002a3 3 0 0 0 3-3V7Zm-2 0v18a1 1 0 0 1-1 1H7a.997.997 0 0 1-1-1V7a.997.997 0 0 1 1-1h18.002a1 1 0 0 1 1 1Z" />
    <path d="M14.006 8c-3.311 0-6 2.689-6 6s2.689 6 6 6c3.312 0 6-2.689 6-6s-2.688-6-6-6Zm0 2c2.208 0 4 1.792 4 4s-1.792 4-4 4c-2.207 0-4-1.792-4-4s1.793-4 4-4ZM22 9.021v7.565l-1.736 1.736a1 1 0 0 0 1.414 1.414l2.029-2.029A.997.997 0 0 0 24 17V9.021a1 1 0 0 0-2 0Z" />
    <circle cx={8.999} cy={22.999} r={1.001} />
    <circle cx={12.999} cy={22.999} r={1.001} />
    <circle cx={16.999} cy={22.999} r={1.001} />
    <circle cx={14.006} cy={13.995} r={1.001} />
  </svg>
)
export default TurntableIcon
