import {CacheEntry, CSGOAPI_Skin} from "@/shared/types";
import {STEAM_ID_64} from "@/shared/constants";


function getSkinsFromAPI(): Promise<Map<string, CSGOAPI_Skin>> {
  return fetch("https://bymykel.github.io/CSGO-API/api/en/skins.json")
      .then(r => r.json())
      .then((arr: CSGOAPI_Skin[]) =>
          arr.reduce((map, val) => map.set(val.weapon.id + "-" + val.paint_index, val), new Map<string, CSGOAPI_Skin>()));
}

export const skinsCache = new CacheEntry(3600, await getSkinsFromAPI(), getSkinsFromAPI)

export function getSessionSteamId64(): number | undefined {
  return STEAM_ID_64;
}