export const APPLICATION_URL = ['production', 'local'].includes(
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? ''
)
  ? process.env.NEXT_PUBLIC_APPLICATION_URL
  : `https://${process.env.NEXT_PUBLIC_VERCEL_URL ?? ''}`
