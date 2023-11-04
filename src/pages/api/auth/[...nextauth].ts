import {NextApiRequest, NextApiResponse} from 'next'

import NextAuth from 'next-auth'
import GoogleProvider from "next-auth/providers/google";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!
      })
    ],
    session: {
      strategy: "jwt"
    }
  })
}