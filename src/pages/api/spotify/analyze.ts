import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getCurrenltyPlayingTrack = async (req, res): Promise<void> => {
  const { accessToken } = req

  const { trackId, song, artist, input } = req.body

  console.log(accessToken, song, artist, trackId)

  const hasTrackId = typeof trackId !== 'undefined' && trackId !== null

  const spotify = new Spotify(accessToken)

  if (!hasTrackId) {
    const hasInput = typeof input !== 'undefined' && input !== null

    if (hasInput) {
      const track = await spotify.getTrack({ input })

      if (typeof track !== 'undefined' && track !== null) {
        const analysis = await spotify.getAudioAnalysis(track.id)

        res.status(200).json({ analysis })
      } else {
        res.status(400).json({ message: 'Bad request' })
      }
    } else {
      const hasSong = typeof song !== 'undefined' && song !== null
      const hasArtist = typeof artist !== 'undefined' && artist !== null

      if (!hasSong || !hasArtist) {
        res.status(400).json({ message: 'Bad request' })
      } else {
        const track = await spotify.getTrack({ song, artist })

        if (typeof track !== 'undefined' && track !== null) {
          const analysis = await spotify.getAudioAnalysis(track.id)

          res.status(200).json({ analysis })
        } else {
          res.status(400).json({ message: 'Bad request' })
        }
      }
    }
  } else {
    const analysis = await spotify.getAudioAnalysis(trackId)

    res.status(200).json({ analysis })
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: getCurrenltyPlayingTrack
    },
    req,
    res
  )
}
