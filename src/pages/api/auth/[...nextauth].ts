import {NextApiRequest, NextApiResponse} from 'next'

import NextAuth, {Account as AuthAccount, Profile} from 'next-auth'
import {Account} from '@/shared/entities'
import GoogleProvider from "next-auth/providers/google";
import {initORM} from "@/shared/serverutils";
import * as crypto from "crypto";
import {TOKEN_SIZE} from "@/shared/constants";

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
    },
    callbacks: {
      async jwt({token, account, profile}) {
        // Persist the OAuth access_token and or the user id to the token right after signin
        if (account && profile) {
          const dbAccount = await accountEntity(account, profile)
          token.accessToken = account.access_token;
          token.accountId = dbAccount.id;
        }
        return token
      }
    }
  })
}

async function accountEntity(account: AuthAccount, profile: Profile): Promise<Account> {
  if (!profile.email) {
    throw new Error("Email field is required.");
  }

  const repository = await initORM()
      .then(datasource => datasource.getRepository(Account));

  return repository.findOneBy({
    provider: account.provider,
    email: profile.email
  }).then(res => {
    if (!res) {
      return repository.save(toEntity(account, profile))
    }
    return res;
  });
}

function toEntity(account: AuthAccount, profile: Profile): Account {
  const entity = new Account();
  entity.provider = account.provider;
  entity.name = profile.name ?? "unnamed";
  entity.email = profile.email!;
  entity.token = crypto.randomBytes(TOKEN_SIZE / 2).toString('hex')
  return entity;
}