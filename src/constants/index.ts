export const APPLICATION_URL = ['production', 'local'].includes(
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? ''
)
  ? process.env.NEXT_PUBLIC_APPLICATION_URL
  : `https://${process?.env?.NEXT_PUBLIC_VERCEL_URL ?? ''}`

export const SYSTEM_MESSAGE_OBJECT_TYPE = 'system_message'

export const USER_MESSAGE_OBJECT_TYPE = `user_message`

export const BOT_HANDLE = 'BeatBrain'
export const SYSTEM_HANDLE = 'Music Genome Project'

export const DEFAULT_MAX_MEMORY_COUNT = 10
