const fetchHandler = async <T = string>(
  input: RequestInfo | URL,
  init?: RequestInit | undefined
): Promise<T> => {
  try {
    const response = await fetch(input, {
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
