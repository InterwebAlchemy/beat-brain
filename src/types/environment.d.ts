declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string

      SPOTIFY_CLIENT_ID: string
      SPOTIFY_CLIENT_SECRET: string

      NEXTAUTH_URL: string
    }
  }
}
