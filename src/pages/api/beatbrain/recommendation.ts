import { getRecommendation } from '../../../services/openai'
import Spotify from '../../../services/spotify'

import requestHandler from '../../../utils/requestHandler'

import formatHandle from '../../../services/openai/utils/formatHandle'

import { SYSTEM_HANDLE } from '../../../constants'

const getTrack = async (req, res): Promise<void> => {
  try {
    const { identifier, accessToken } = req
    const { messages, track } = req.body

    const spotify = new Spotify(accessToken)
  } catch (error) {
    console.error(error)

    res.status(500).json(error)
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['POST'],
      handler: getTrack
    },
    req,
    res
  )
}
