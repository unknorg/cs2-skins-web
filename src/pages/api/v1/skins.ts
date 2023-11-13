import type {NextApiRequest, NextApiResponse} from 'next'
import {AccountNotFoundError, InvalidTokenError, Serializable} from "@/shared/types";
import {defaultStorage} from "@/shared/storage";
import {constants} from "http2";
import {isValidToken} from "@/shared/serverutils";
import {getToken, JWT} from "next-auth/jwt";
import {TOKEN_SIZE} from "@/shared/constants";

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

  switch (req.headers.accept) {
    case "application/octet-stream":
      return octetHandler(req, res);
    default:
      return jsonHandler(token, req, res);
  }
}

function validate(req: NextApiRequest, res: NextApiResponse<string>): boolean {
  if (req.method !== 'GET') {
    res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).send("Only 'GET' method is allowed.");
    return false;
  }

  if (!defaultStorage) {
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("");
    return false;
  }

  return true;
}

async function jsonHandler(token: JWT, req: NextApiRequest, res: NextApiResponse) {
  const accountId = token.accountId as number;
  if (!accountId) {
    res.status(constants.HTTP_STATUS_UNAUTHORIZED).send("Not authorized");
    return;
  }

  res.setHeader("Content-Type", "application/json");
  return defaultStorage?.fetch(accountId).then(ps => ps.skins)
      .then(res.json)
      .catch(err => {
        if (err instanceof AccountNotFoundError) {
          res.status(constants.HTTP_STATUS_NOT_FOUND).send("Account not found.")
        } else {
          res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("")
        }
      });
}

const tokenRegExp = new RegExp(`^([1-9]\\d*)\\|([a-z0-9]{${TOKEN_SIZE}})$`)

async function octetHandler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.query.accountToken;
  if (!token || typeof token !== 'string') {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Bad request parameter: accountToken");
    return;
  }

  if (!tokenRegExp.test(token)) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Invalid request parameter: accountToken");
    return;
  }

  const matches = token.match(tokenRegExp)!;
  const accountId = matches[1];
  const playerToken = matches[2];

  defaultStorage!.fetch(Number(accountId), playerToken)
      .then(playerSkins => {
        let writer = Serializable.createWriterFor(playerSkins);
        playerSkins.serializeBytes(writer);
        let readableStream = writer.getStream()
        res.setHeader("Content-Type", "application/octet-stream");
        readableStream.pipe(res);
      })
      .catch(err => {
        if (err instanceof InvalidTokenError) {
          res.status(constants.HTTP_STATUS_FORBIDDEN).send("Invalid token.")
        } else if (err instanceof AccountNotFoundError) {
          res.status(constants.HTTP_STATUS_NOT_FOUND).send("Account not found.")
        } else {
          res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("")
        }
      })
}