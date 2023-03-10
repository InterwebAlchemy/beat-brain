import type { ChainValues } from 'langchain/chains'

import { bot } from './bot'

export const chat = async (params): Promise<ChainValues> => {
  try {
    const response = await bot.call(params)

    return response
  } catch (error) {
    console.error(error)

    return {
      error: 'Could not communicate with BeatBrain'
    }
  }
}
