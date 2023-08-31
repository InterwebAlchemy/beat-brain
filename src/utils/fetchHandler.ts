import { APPLICATION_URL } from '../constants'

const fetchHandler = async <T = string>(
  input: string | URL,
  init?: (RequestInit & { query?: Record<string, string> }) | undefined
): Promise<T> => {
  try {
    let url

    try {
      url = new URL(input.toString())
    } catch (error) {
      console.error(error)

      url = new URL(input.toString(), APPLICATION_URL)
    }

    if (typeof init?.query !== 'undefined') {
      Object.entries(init.query).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await fetch(url, {
      ...init,
      next: {
        revalidate: 60,
        ...init?.next
      }
    })

    if (response.ok) {
      const responseText = await response.text()

      try {
        const data = JSON.parse(responseText) satisfies T

        return data
      } catch (error) {
        return responseText as unknown as T
      }
    }

    throw new Error(response.statusText)
  } catch (error) {
    console.error(error)

    throw error
  }
}

export default fetchHandler
