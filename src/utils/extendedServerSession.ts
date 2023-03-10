import { getServerSession as oldGetServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'

export interface ExtendedSession extends Session {
  userId?: string
  accessToken?: string
}

const getServerSession = async (
  req,
  res,
  authOptions
): Promise<ExtendedSession | null> =>
  await oldGetServerSession(req, res, authOptions)

export default getServerSession
