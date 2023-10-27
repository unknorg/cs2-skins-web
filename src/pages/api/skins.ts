import type {NextApiRequest, NextApiResponse} from 'next'
import {PlayerSkins, Serializable, ServerPlayer, WeaponSkinDefinition} from "@/shared/types";

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
    let response =
        new PlayerSkins(
            new ServerPlayer(33333, 22222),
            [
                new WeaponSkinDefinition("weapon_ak47", 6, 38, 1, 0.01),
                new WeaponSkinDefinition("weapon_deagle", 23, 38, 1, 0.01)
            ]
        );

    let writer = Serializable.createWriterFor(response);
    response.serializeBytes(writer);
    let readableStream = writer.getStream()
    res.setHeader("Content-Type", "application/octet-stream");
    readableStream.pipe(res);
}