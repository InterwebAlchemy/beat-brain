import {
  SpotifyApi,
  type AccessToken,
  type Artist,
  type Queue,
  type User,
  type PlaybackState,
  type ItemTypes,
  type Track,
  type Page
} from '@spotify/web-api-ts-sdk'

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
  api: SpotifyApi

  cache: PostgrestQueryBuilder<
    Database['public'],
    Database['public']['Tables']['spotify_entities']
  >

  entityTypes: Record<string, number> | null = null

  constructor(token: AccessToken) {
    this.api = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID ?? '',
      token,
      {}
    )

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

  async getMe(): Promise<User> {
    const me = await this.api.currentUser.profile()

    return me
  }

  async startPlaying({ track, deviceId }): Promise<void> {
    await this.api.player.startResumePlayback(deviceId, track)
  }

  async transferPlayback({ deviceId }): Promise<void> {
    try {
      await this.api.player.transferPlayback([deviceId], true)
    } catch (error) {
      console.error('Could not transfer playback', error)
    }
  }

  async getCurrentlyPlaying(): Promise<PlaybackState | string> {
    const track = await this.api.player.getCurrentlyPlayingTrack()

    return track
  }

  async getQueue(): Promise<Queue> {
    const queue = await this.api.player.getUsersQueue()

    return queue
  }

  async queueTrack(spotifyUri: string): Promise<void> {
    await this.api.player.addItemToPlaybackQueue(spotifyUri)
  }

  async search({
    artist = '',
    song = '',
    input = ''
  }: GetTrackRequest): Promise<Track | undefined> {
    let searchString = ''

    const searchTypes: ItemTypes[] = []

    if (typeof input !== 'undefined' && input !== null && input !== '') {
      searchString = input
    } else {
      const hasArtist = typeof artist !== 'undefined' || artist !== null
      const hasSong = typeof song !== 'undefined' || song !== null

      if (hasArtist && hasSong) {
        searchTypes.push('track')
        searchString = `track:${song} artist:${artist}`
      } else if (hasSong) {
        searchTypes.push('track')
        searchString = `track:${song}`
      } else if (hasArtist) {
        searchTypes.push('artist')
        searchString = `artist:${artist}`
      }
    }

    // HACK: for some reason a limit of 1 seems to pull up less reliable results
    const search = await this.api.search(searchString, searchTypes, 'US', 3)

    // TODO: check artists and song title for result and make sure it isn't some
    // remix that happened to show up in the results first - this happens a lot
    // because the Spotify's Search API is not ideal

    const track = search.tracks.items.find((track) => {
      const hasArtist = track.artists.some(
        (item) => item.name.toLowerCase() === artist.toLowerCase()
      )

      // due to the way that some songs have (featuring ARTIST) or (with ARTIST) or (ft ARTIST)
      // in the title on Spotify, we can't look for an exact match
      const hasTitle =
        track.name.toLowerCase().startsWith(song.toLowerCase()) ||
        track.name.toLowerCase().includes(song.toLowerCase())

      return hasArtist && hasTitle
    })

    return track
  }

  async getTrackById(trackId: string): Promise<Track> {
    const track = await this.api.tracks.get(trackId)

    return track
  }

  async getTopArtists(): Promise<Artist[]> {
    const topArtists = await this.api.currentUser.topItems('artists')

    return topArtists.items
  }

  async getTopTracks(): Promise<Track[]> {
    // HACK: something is wrong with the topItems overloaded return type
    const topTracks: Page<Track> = (await this.api.currentUser.topItems(
      'tracks'
    )) as unknown as Page<Track>

    return topTracks.items
  }

  async isLiked(trackId: string): Promise<boolean> {
    const savedStatuses = await this.api.currentUser.tracks.hasSavedTracks([
      trackId
    ])

    return savedStatuses.every((status) => status)
  }

  async like(trackId: string): Promise<void> {
    await this.api.currentUser.tracks.saveTracks([trackId])
  }

  async dislike(trackId: string): Promise<void> {
    await this.api.currentUser.tracks.removeSavedTracks([trackId])
  }
}

export default Spotify
