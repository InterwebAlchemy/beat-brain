import { SpotifyWebApi } from 'spotify-web-api-ts'

import type {
  Track,
  CurrentlyPlaying,
  PrivateUser,
  AudioAnalysis
} from 'spotify-web-api-ts/types/types/SpotifyObjects'

import type { GetMyTopArtistsResponse } from 'spotify-web-api-ts/types/types/SpotifyResponses'

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
  }

  async getMe(): Promise<PrivateUser> {
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

  async getAudioAnalysis(trackId: string): Promise<AudioAnalysis> {
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

  async getTopArtists(): Promise<GetMyTopArtistsResponse> {
    const topArtists = await this.api.personalization.getMyTopArtists()

    return topArtists
  }

  async getInitialDetails(): Promise<{
    me: PrivateUser
    topArtists: GetMyTopArtistsResponse
    currentTrack: CurrentlyPlaying | string
  }> {
    const [me, topArtists, currentTrack] = await Promise.all([
      this.getMe(),
      this.getTopArtists(),
      this.getCurrentlyPlaying()
    ])

    return {
      me,
      topArtists,
      currentTrack
    }
  }
}

export default Spotify
