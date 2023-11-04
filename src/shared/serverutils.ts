import {CacheEntry, CSGOAPI_Skin} from "@/shared/types";
import {STEAM_ID_64} from "@/shared/constants";
import {Liquibase, LiquibaseConfig, POSTGRESQL_DEFAULT_CONFIG} from "liquibase";

if (typeof window !== "undefined") {
  throw new Error("serverutils.ts is meant to be executed server-side only")
}

const liquibaseConfig: LiquibaseConfig = {
  ...POSTGRESQL_DEFAULT_CONFIG,
  url: 'jdbc:postgresql://localhost:5432/cs2skins',
  username: 'user',
  password: 'password',
  changeLogFile: 'migrations/db.changelog-root.xml'
};
export const liquibase = new Liquibase(liquibaseConfig);

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