import type {NextApiRequest, NextApiResponse} from 'next'
import {Serializable} from "@/shared/types";
import {defaultStorage} from "@/shared/storage";
import {constants} from "http2";
import {getSessionSteamId64} from "@/shared/serverutils";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
  if (!validate(req, res)) {
    return;
  }

  switch (req.headers.accept) {
    case "application/octet-stream":
      octetHandler(req, res);
      break;
    default:
      jsonHandler(req, res);
      break;
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

function jsonHandler(req: NextApiRequest, res: NextApiResponse) {
  const steamId64 = getSessionSteamId64();
  if (!steamId64) {
    res.status(constants.HTTP_STATUS_UNAUTHORIZED).send("Not authorized");
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.json(defaultStorage?.fetch(steamId64).skins ?? []);
}

function octetHandler(req: NextApiRequest, res: NextApiResponse) {
  const steamId64 = req.query.steamId64;
  if (!steamId64 || typeof steamId64 !== 'string' || isNaN(Number(steamId64))) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Bad request parameter: steamId64");
    return false;
  }

  const playerSkins = defaultStorage!.fetch(Number(steamId64))
  let writer = Serializable.createWriterFor(playerSkins);
  playerSkins.serializeBytes(writer);
  let readableStream = writer.getStream()
  res.setHeader("Content-Type", "application/octet-stream");
  readableStream.pipe(res);
}