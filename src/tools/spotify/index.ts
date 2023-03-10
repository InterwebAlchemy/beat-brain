import { DynamicTool } from 'langchain/tools'

import SpotifyTracks from './tracks'
import SpotifyAnalysis from './analysis'
import SpotifyArtists from './artists'

const SpotifyAnalysisTool = new DynamicTool(SpotifyAnalysis)
const SpotifyTracksTool = new DynamicTool(SpotifyTracks)
const SpotifyArtistsTool = new DynamicTool(SpotifyArtists)

export default [SpotifyAnalysisTool, SpotifyArtistsTool, SpotifyTracksTool]
