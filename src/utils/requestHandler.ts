import { createHash } from 'node:crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { AccessToken } from '@spotify/web-api-ts-sdk'

export const dynamic = 'force-dynamic'
export interface ExtendedNextApiRequest<T = unknown> extends NextApiRequest {
  accessToken?: AccessToken
  identifier?: string
  body: T
}

export type ExtendedNextApiHandler<Req = unknown, Res = unknown> = (
  req: ExtendedNextApiRequest<Req>,
  res: NextApiResponse<Res>
) => unknown | Promise<unknown>

export interface RequestHandlerOptions<Req = unknown, Res = unknown> {
  methods: Array<NextApiRequest['method']>
  authenticated: boolean
  handler: ExtendedNextApiHandler<Req, Res>
}

const DEFAULT_HANDLER_OPTIONS: RequestHandlerOptions = {
  authenticated: true,
  methods: ['POST'],
  handler: async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    console.debug(req)

    res.status(500).json({ message: 'Internal server error' })
  }
}

const requestHandler = async <Req, Res>(
  handlerOptions: RequestHandlerOptions<Req, Res> = DEFAULT_HANDLER_OPTIONS,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const supabase = createPagesServerClient(
    { req, res },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_SERVICE_KEY
    }
  )

  const options = { ...DEFAULT_HANDLER_OPTIONS, ...handlerOptions }

  if (options.methods?.includes(req.method)) {
    if (options?.authenticated) {
      // Check if we have a session
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (typeof session !== 'undefined' && session !== null) {
        const {
          /* eslint-disable @typescript-eslint/naming-convention */
          // expires_at,
          // expires_in,
          provider_refresh_token,
          provider_token,
          token_type
          /* eslint-enable @typescript-eslint/naming-convention */
        } = session

        const token = {
          refresh_token: provider_refresh_token,
          access_token: provider_token,
          token_type
        }

        const accessToken = session?.provider_token

        if (typeof accessToken !== 'undefined' && accessToken !== null) {
          try {
            // HACK: figure out a better way to deal with the type mismatches
            // @ts-expect-error
            ;(req as ExtendedNextApiRequest).accessToken = token
            ;(req as ExtendedNextApiRequest).identifier = createHash('sha256')
              .update(session?.user?.identities?.[0]?.id ?? '')
              .digest('hex')

            await options.handler(req, res)
          } catch (error) {
            console.error(error)

            res.status(500).json({ message: 'Internal server error' })
          }
        } else {
          res.status(401).json({ message: 'Unauthorized' })
        }
      } else {
        res.status(401).json({ message: 'Unauthorized' })
      }
    } else {
      try {
        await options.handler(req, res)
      } catch (error) {
        console.error(error)

        res.status(500).json({ message: 'Internal server error' })
      }
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default requestHandler
