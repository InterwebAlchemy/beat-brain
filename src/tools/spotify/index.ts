import { DynamicTool } from 'langchain/tools'

import SpotifyTracks from './tracks'
import SpotifyPlaylists from './playlists'
import SpotifyAnalysis from './analysis'

const SpotifyTracksTool = new DynamicTool(SpotifyTracks)
const SpotifyPlaylistsTool = new DynamicTool(SpotifyPlaylists)
const SpotifyAnalysisTool = new DynamicTool(SpotifyAnalysis)

export default [SpotifyTracksTool, SpotifyPlaylistsTool, SpotifyAnalysisTool]
