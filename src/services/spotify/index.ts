import { SpotifyWebApi } from 'spotify-web-api-ts'

import type {
  Track,
  CurrentlyPlaying
} from 'spotify-web-api-ts/types/types/SpotifyObjects'

export interface GetTrackRequest {
  artist?: string
  song?: string
  input?: string
}

class Spotify {
  api: SpotifyWebApi

  constructor(accessToken) {
    this.api = new SpotifyWebApi({
      accessToken,
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.NEXTAUTH_URL
    })

    this.getMe()
      .then((me) => {
        console.log('Spotify API authenticated', me)
      })
      .catch((err) => {
        console.error('Spotify API authentication failed', err)
      })
  }

  async getMe(): Promise<any> {
    const me = await this.api.users.getMe()

    return me
  }

  async startPlaying({ deviceId, track }): Promise<void> {
    await this.api.player.play({ device_id: deviceId, uris: [track.uri] })
  }

  async transferPlayback({ deviceId }): Promise<void> {
    await this.api.player.transferPlayback(deviceId, { play: true })
  }

  async getCurrentlyPlaying(): Promise<CurrentlyPlaying | string> {
    const track = await this.api.player.getCurrentlyPlayingTrack()

    return track
  }

  async getAudioAnalysis(trackId: string): Promise<any> {
    const analysis = await this.api.tracks.getAudioAnalysisForTrack(trackId)

    return analysis
  }

  async getTrack({ artist, song, input }: GetTrackRequest): Promise<Track> {
    let searchString = ''

    if (typeof input !== 'undefined' && input !== null) {
      searchString = input
    } else {
      const hasArtist = typeof artist !== 'undefined' || artist === null
      const hasSong = typeof song !== 'undefined' || song === null

      if (hasArtist && hasSong) {
        searchString = `${song} - ${artist}`
      } else if (hasSong) {
        searchString = song
      } else if (hasArtist) {
        searchString = artist
      }
    }

    const search = await this.api.search.searchTracks(searchString, {
      limit: 1
    })

    return search.items[0]
  }
}

export default Spotify
