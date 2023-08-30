// borrowed from: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
import { useEffect, useRef } from 'react'

export const useInterval = (callback: () => void, delay: number): void => {
  const savedCallback = useRef<() => void>()

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    const tick = (): void => {
      savedCallback?.current?.()
    }

    if (delay !== null) {
      const id = setInterval(tick, delay)

      return () => {
        clearInterval(id)
      }
    }
  }, [delay])
}
