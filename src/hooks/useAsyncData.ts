import { useEffect, useState } from 'react'

export interface UseAsyncData<T> {
  response: Promise<T>
  abort: AbortController['abort']
  loading: boolean
  completed: boolean
  error: Error | null
}

const useAsyncData = <T>(url, config): UseAsyncData<T> => {
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const abortController = new AbortController()

  let { headers = {}, signal, ...remainingConfig } = config

  const requestHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers
  }

  if (typeof signal === 'undefined') {
    signal = abortController.signal
  }

  const requestConfig = {
    headers: requestHeaders,
    signal,
    ...remainingConfig
  }

  const response: Promise<T> = fetch(url, requestConfig)
    .then(async (response) => {
      return await response.json()
    })
    .then((response) => {
      setCompleted(true)

      return response
    })
    .catch((e) => {
      console.error(e)

      setError(error)
    })
    .finally(() => {
      setLoading(false)
    })

  useEffect(() => {
    setLoading(true)

    return () => {
      abortController.abort()
    }
  }, [])

  return {
    response,
    loading,
    error,
    completed,
    abort: abortController.abort
  }
}

export default useAsyncData
