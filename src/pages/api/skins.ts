import type {NextApiRequest, NextApiResponse} from 'next'
import {PlayerSkins, Serializable, ServerPlayer, WeaponSkinDefinition} from "@/shared/types";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
  switch (req.headers.accept) {
    case "application/octet-stream":
      octetHandler(req, res);
      break;
    default:
      jsonHandler(req, res);
      break;
  }
}

function getPlayerSkins() {
  return new PlayerSkins(
      new ServerPlayer(33333, 22222),
      [
        new WeaponSkinDefinition("weapon_deagle", 23, 37, 1, 0.01)
      ]
  );
}

function jsonHandler(req: NextApiRequest, res: NextApiResponse) {
  const playerSkins = getPlayerSkins();
  res.setHeader("Content-Type", "application/json");
  res.json(playerSkins.skins);
}

function octetHandler(req: NextApiRequest, res: NextApiResponse) {
  const playerSkins = getPlayerSkins();
  let writer = Serializable.createWriterFor(playerSkins);
  playerSkins.serializeBytes(writer);
  let readableStream = writer.getStream()
  res.setHeader("Content-Type", "application/octet-stream");
  readableStream.pipe(res);
}