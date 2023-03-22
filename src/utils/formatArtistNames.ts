const formatArtistNames = (artists: Spotify.Entity[]): string => {
  return artists.map((artist) => artist.name).join(', ')
}

export default formatArtistNames
