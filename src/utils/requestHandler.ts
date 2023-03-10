import type { NextApiRequest, NextApiResponse } from 'next'

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export interface ExtendedNextApiRequest extends NextApiRequest {
  accessToken?: string
}

export type ExtendedNextApiHandler<T = any> = (
  req: ExtendedNextApiRequest,
  res: NextApiResponse<T>
) => unknown | Promise<unknown>

export interface RequestHandlerOptions {
  methods: Array<NextApiRequest['method']>
  authenticated: boolean
  handler: ExtendedNextApiHandler
}

const DEFAULT_HANDLER_OPTIONS: RequestHandlerOptions = {
  authenticated: true,
  methods: ['POST'],
  handler: async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    console.log(req)

    res.status(500).json({ message: 'Internal server error' })
  }
}

const requestHandler = async (
  handlerOptions: RequestHandlerOptions = DEFAULT_HANDLER_OPTIONS,
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const options = { ...DEFAULT_HANDLER_OPTIONS, ...handlerOptions }

  if (options.methods?.includes(req.method)) {
    if (options?.authenticated) {
      // Create authenticated Supabase Client
      const supabase = createServerSupabaseClient({ req, res })

      // Check if we have a session
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (typeof session !== 'undefined' && session !== null) {
        const accessToken = session?.provider_token

        if (typeof accessToken !== 'undefined' && accessToken !== null) {
          try {
            ;(req as ExtendedNextApiRequest).accessToken = accessToken

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
