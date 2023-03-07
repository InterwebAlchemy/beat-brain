const SPOTIFY_BASE_URL = 'https://open.spotify.com'

const spotifyUriToUrl = (uri: string): string => {
  const [, type, id] = uri.split(':')

  const url = new URL(`/${type}/${id}`, SPOTIFY_BASE_URL)

  return url.toString()
}

export default spotifyUriToUrl
