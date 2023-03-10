declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string

      SPOTIFY_CLIENT_ID: string
      SPOTIFY_CLIENT_SECRET: string

      NEXT_PUBLIC_APPLICATION_URL: string
      NEXT_PUBLIC_VERCEL_URL: string
      NEXT_PUBLIC_VERCEL_ENV: string

      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      NEXT_PUBLIC_SUPABASE_REDIRECT_URL: string
    }
  }
}
