import requestHandler from '../../../utils/requestHandler'

import { openAICompletion } from '../../../services/openai'

import { OPEN_AI_DEFAULT_MODEL_NAME } from '../../../services/openai/constants'

const getPlaylist = async (req, res): Promise<void> => {
  try {
    const { identifier } = req
    const { messages, settings } = req.body

    const response = await openAICompletion({
      model: OPEN_AI_DEFAULT_MODEL_NAME,
      user: identifier,
      messages,
      ...settings
    })

    const suggestionMessage = response.choices[0].message

    console.log(suggestionMessage)

    // const playlist =
    //   typeof suggestionMessage?.content === 'string'
    //     ? JSON.parse(suggestionMessage.content)
    //     : suggestionMessage

    // console.log(playlist)

    // check spotify to make sure each track in the playlist exists

    res.status(200).json(suggestionMessage)
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
      handler: getPlaylist
    },
    req,
    res
  )
}
