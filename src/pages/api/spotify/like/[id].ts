import requestHandler from '../../../../utils/requestHandler'

import Spotify from '../../../../services/spotify'

const like = async (req, res): Promise<void> => {
  const { accessToken } = req

  const id = req.url.split('/').pop()

  console.log(id)

  const spotify = new Spotify(accessToken)

  switch (req.method) {
    case 'GET': {
      const liked = await spotify.isLiked(id)

      res.status(200).json({ [id]: liked })

      break
    }
    case 'POST':
      await spotify.like(id)

      res.status(202).json({ [id]: true })

      break
    case 'DELETE':
      await spotify.dislike(id)

      res.status(202).json({ [id]: false })

      break
    default:
      res.status(405).end()
  }
}

export default async function handler(req, res): Promise<void> {
  await requestHandler(
    {
      authenticated: true,
      methods: ['GET', 'POST', 'DELETE'],
      handler: like
    },
    req,
    res
  )
}
