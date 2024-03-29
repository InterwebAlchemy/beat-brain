import requestHandler from '../../../utils/requestHandler'

import Spotify from '../../../services/spotify'

const getUser = async (req, res): Promise<void> => {
  const { accessToken } = req

  const spotify = new Spotify(accessToken)

  const details = await spotify.getMe()

  res.status(200).json({ details })
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['GET'],
      handler: getUser
    },
    req,
    res
  )
}
