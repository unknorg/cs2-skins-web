import type {NextApiRequest, NextApiResponse} from 'next'
import {Serializable} from "@/shared/types";
import {defaultStorage} from "@/shared/storage";
import {constants} from "http2";
import {isValidToken} from "@/shared/serverutils";
import {getToken, JWT} from "next-auth/jwt";

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
      return octetHandler(token, req, res);
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
      .then(res.json);
}

async function octetHandler(token: JWT, req: NextApiRequest, res: NextApiResponse) {
  const accountId = req.query.accountId;
  if (!accountId || typeof accountId !== 'string' || isNaN(Number(accountId))) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Bad request parameter: accountId");
    return;
  }

  const playerSkins = await defaultStorage!.fetch(Number(accountId))
  let writer = Serializable.createWriterFor(playerSkins);
  playerSkins.serializeBytes(writer);
  let readableStream = writer.getStream()
  res.setHeader("Content-Type", "application/octet-stream");
  readableStream.pipe(res);
}