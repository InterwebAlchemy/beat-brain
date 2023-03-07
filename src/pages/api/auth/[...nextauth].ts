import NextAuth, { type AuthOptions } from 'next-auth'

import Spotify from '../../../services/spotify/auth'

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [Spotify],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (typeof account !== 'undefined') {
        token.userId = account?.id
        token.user = user
        token.accessToken = account?.access_token
        token.refreshToken = account?.refresh_token
        token.expires_at = account?.expires_at
      }

      if (typeof profile !== 'undefined') {
        // @ts-expect-error
        token.externalUrls = profile?.external_urls ?? {}
      }

      return token
    },
    async session({ session, token }) {
      // @ts-expect-error
      session.userId = token?.user?.id
      // @ts-expect-error
      session.accessToken = token?.accessToken

      return session
    }
  }
}

export default NextAuth(authOptions)
