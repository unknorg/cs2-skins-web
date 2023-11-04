import type {NextApiRequest, NextApiResponse} from 'next'
import {WeaponSkinDefinition} from "@/shared/types";
import {constants} from "http2";
import {WeaponIds} from "@/shared/weaponid";
import {isValidToken, skinsCache} from "@/shared/serverutils";
import {defaultStorage} from "@/shared/storage";
import {getToken} from "next-auth/jwt";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
  const token = await getToken({req});
  // TODO: validate using middleware ?
  if (!isValidToken(token, res)) {
    return;
  }

  if (!validate(req, res)) {
    return;
  }

  const accountId = token.accountId as number;
  const skinDef = req.body as WeaponSkinDefinition;
  const weaponId = WeaponIds[skinDef.weaponName as keyof typeof WeaponIds];

  if (skinDef.skinId === 0) {
    await defaultStorage!.delete(accountId, weaponId);
    res.status(200).send("");
  }

  const skin = skinsCache.get().get(skinDef.weaponName + "-" + skinDef.skinId);
  if (!skin || skin.weapon.id !== skinDef.weaponName) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST)
        .send(`Invalid body: skin ${skin?.pattern?.name} is not applicable to weapon ${skinDef.weaponName}`);
    return;
  }

  const definition = WeaponSkinDefinition.copy({
    ...skinDef,
    weaponId
  } as WeaponSkinDefinition)

  return defaultStorage!.persist(accountId, definition)
      .then(() => res.send(""))
      .catch(err => {
        console.log("Database persist error:", err);
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("Unexpected error");
      });
}

function validate(req: NextApiRequest, res: NextApiResponse<string>): boolean {
  if (req.method !== 'POST') {
    res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).send("Only 'POST' method is allowed.");
    return false;
  }

  if (!defaultStorage) {
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("");
    return false;
  }

  const body = req.body as WeaponSkinDefinition;
  if (!body) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Empty body");
    return false;
  }

  if (body.seed === undefined || body.seed > 1023 || body.seed < 0) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Invalid body: seed value must be between 0 and 1023");
    return false;
  }

  if (!body.wear || body.wear > 1 || body.wear < 0) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Invalid body: wear value must be between 0 and 1");
    return false;
  }

  if (!body.weaponName || WeaponIds[body.weaponName as keyof typeof WeaponIds] === undefined) {
    res.status(constants.HTTP_STATUS_BAD_REQUEST).send("Invalid body: unknown/unsupported weapon name");
    return false;
  }

  return true;
}