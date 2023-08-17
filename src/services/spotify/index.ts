import { SpotifyWebApi } from 'spotify-web-api-ts'

import type {
  Track,
  CurrentlyPlaying,
  PrivateUser,
  AudioAnalysis,
  AudioFeatures
} from 'spotify-web-api-ts/types/types/SpotifyObjects'

import type { GetMyTopArtistsResponse } from 'spotify-web-api-ts/types/types/SpotifyResponses'

import type { PostgrestQueryBuilder } from '@supabase/postgrest-js'

import supabase from '../supabase'

import type { Database } from '../../types/database.types'

export interface GetTrackRequest {
  artist?: string
  song?: string
  input?: string
}

// const ENTITY_CACHE_EXPIRATION = 1000 * 60 * 60 * 24 * 7

const getEntityTypes = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('spotify_entity_types')
    .select('id, name')
    .eq('archived', false)

  if (typeof error !== 'undefined' && error !== null) {
    throw new Error(error.message, { cause: error })
  }

  return {
    artist: data.find((entityType) => entityType.name === 'Artist')?.id ?? 0,
    song: data.find((entityType) => entityType.name === 'Song')?.id ?? 0,
    track: data.find((entityType) => entityType.name === 'Track')?.id ?? 0,
    genre: data.find((entityType) => entityType.name === 'Genre')?.id ?? 0,
    playlist: data.find((entityType) => entityType.name === 'Playlist')?.id ?? 0
  }
}

class Spotify {
  api: SpotifyWebApi

  cache: PostgrestQueryBuilder<
    Database['public'],
    Database['public']['Tables']['spotify_entities']
  >

  entityTypes: Record<string, number> | null = null

  constructor(accessToken) {
    this.api = new SpotifyWebApi({
      accessToken,
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.NEXTAUTH_URL
    })

    this.cache = supabase.from('spotify_entities')
  }

  async entityType(typeName): Promise<number> {
    const hasEntityTypes = this.entityTypes !== null

    if (!hasEntityTypes) {
      const entityTypes = await getEntityTypes()

      this.entityTypes = entityTypes
    }

    return this?.entityTypes?.[typeName.toLowerCase()] ?? 0
  }

  async checkEntityCache({
    entityName,
    entityType,
    entityTypeId,
    entityId
  }: {
    entityName?: string
    entityType?: string
    entityTypeId?: number
    entityId?: string
  }): Promise<Pick<
    Database['public']['Tables']['spotify_entities']['Row'],
    'id' | 'name' | 'spotify_id'
  > | null> {
    const hasId = typeof entityId !== 'undefined' && entityId !== null
    const hasName = typeof entityName !== 'undefined' && entityName !== null
    const hasEntityTypeId =
      typeof entityTypeId !== 'undefined' && entityTypeId !== null
    const hasEntityTypeName =
      typeof entityType !== 'undefined' && entityType !== null

    let parsedEntityTypeId = 0

    if (hasEntityTypeId) {
      parsedEntityTypeId = entityTypeId
    } else if (hasEntityTypeName && this.entityTypes !== null) {
      parsedEntityTypeId = this.entityTypes[entityType.toLowerCase()] ?? 0
    }

    if (hasId) {
      const { data, error } = await this.cache
        .select('id, name, spotify_id')
        .eq('entity_id', entityId)
        .eq('spotify_entity_type_id', parsedEntityTypeId)
        // .eq('archived', false)
        // .lte(
        //   'last_updated',
        //   new Date(Date.now() - ENTITY_CACHE_EXPIRATION).toISOString()
        // )
        .limit(1)

      if (typeof error !== 'undefined' && error !== null) {
        throw new Error(error.message, { cause: error })
      }

      if (typeof data !== 'undefined' && data !== null && data.length > 0) {
        return data[0]
      }
    } else if (hasName) {
      const { data, error } = await this.cache
        .select('id, name, spotify_id')
        .eq('name', entityName)
        .eq('spotify_entity_type_id', parsedEntityTypeId)
        // .eq('archived', false)
        // .lte(
        //   'last_updated',
        //   new Date(Date.now() - ENTITY_CACHE_EXPIRATION).toISOString()
        // )
        .limit(1)

      if (typeof error !== 'undefined' && error !== null) {
        throw new Error(error.message, { cause: error })
      }

      if (typeof data !== 'undefined' && data !== null && data.length > 0) {
        return data[0]
      }
    }

    return null
  }

  async getMe(): Promise<PrivateUser> {
    const me = await this.api.users.getMe()

    return me
  }

  async startPlaying({ track, deviceId }): Promise<void> {
    await this.api.player.play({ device_id: deviceId, uris: [track] })
  }

  async transferPlayback({ deviceId }): Promise<void> {
    await this.api.player.transferPlayback(deviceId, { play: true })
  }

  async getCurrentlyPlaying(): Promise<CurrentlyPlaying | string> {
    const track = await this.api.player.getCurrentlyPlayingTrack()

    return track
  }

  async queueTrack(spotifyUri: string): Promise<void> {
    await this.api.player.addToQueue(spotifyUri)
  }

  async getAudioFeatures(trackId: string): Promise<AudioFeatures> {
    const features = await this.api.tracks.getAudioFeaturesForTrack(trackId)

    return features
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
        searchString = `track:${song} artist:${artist}`
      } else if (hasSong) {
        searchString = `track:${song}`
      } else if (hasArtist) {
        searchString = `artist:${artist}`
      }
    }

    const search = await this.api.search.searchTracks(searchString, {
      // HACK: for some reason a limit of 1 seems to pull up less reliable results
      limit: 2,
      market: 'US'
    })

    // TODO: check artists and song title for result and make sure it isn't some
    // remix that happened to show up in the results first - this happens a lot
    // because the Spotify's Search API is not ideal

    return search.items[0]
  }

  async getTrackById(trackId: string): Promise<Track> {
    const track = await this.api.tracks.getTrack(trackId)

    return track
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
