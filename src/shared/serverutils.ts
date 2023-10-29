import {CacheEntry, CSGOAPI_Skin} from "@/shared/types";

async function getSkinsFromAPI(): Promise<CSGOAPI_Skin[]> {
  return fetch("https://bymykel.github.io/CSGO-API/api/en/skins.json")
      .then(r => r.json());
}

export const skinsCache: CacheEntry<CSGOAPI_Skin[]> = new CacheEntry<CSGOAPI_Skin[]>(3600, getSkinsFromAPI)