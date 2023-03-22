import { get_encoding } from '@dqbd/tiktoken'

const tokenCounter = (text: string): number => {
  // TODO: replace with model name once suport is ready
  // reference: https://github.com/dqbd/tiktoken/issues/17
  const enc = get_encoding('cl100k_base')

  return enc.encode(text).length
}

export default tokenCounter
