import type {NextApiRequest, NextApiResponse} from 'next'
import {constants} from "http2";
import {initORM, isValidToken} from "@/shared/serverutils";
import {getToken} from "next-auth/jwt";
import {Account} from "@/shared/entities";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
  const token = await getToken({req});
  if (!isValidToken(token, res)) {
    return;
  }

  if (!validate(req, res)) {
    return;
  }

  const repository = await initORM()
      .then(datasource => datasource.getRepository(Account));

  return repository.findOneBy({
    id: token.accountId as number
  }).then(acc => {
    if (!acc) {
      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("Internal server error");
      return;
    }

    sendToken(res, acc)
  });
}

function validate(req: NextApiRequest, res: NextApiResponse<string>): boolean {
  if (req.method !== 'GET') {
    res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).send("Only 'GET' method is allowed.");
    return false;
  }

  return true;
}

function sendToken(res: NextApiResponse<string>, account: Account) {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    token: `${account.id} ${account.token}`
  }))
}