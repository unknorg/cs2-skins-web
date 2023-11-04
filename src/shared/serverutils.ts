import {CacheEntry, CSGOAPI_Skin} from "@/shared/types";
import {Liquibase, LiquibaseConfig, POSTGRESQL_DEFAULT_CONFIG} from "liquibase";
import {DataSource} from "typeorm";
import {Account, Skin} from "@/shared/entities";
import {constants} from "http2";
import {NextApiResponse} from "next";
import {JWT} from "next-auth/jwt";

if (typeof window !== "undefined") {
  throw new Error("serverutils.ts is meant to be executed server-side only")
}

//region liquibase
const liquibaseConfig: LiquibaseConfig = {
  ...POSTGRESQL_DEFAULT_CONFIG,
  url: 'jdbc:postgresql://localhost:5432/cs2skins',
  username: 'user',
  password: 'password',
  changeLogFile: 'migrations/db.changelog-root.xml'
};
export const liquibase = new Liquibase(liquibaseConfig);
//endregion

//region typeorm
const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password",
  database: "cs2skins",
  synchronize: false,
  logging: true,
  entities: [Account, Skin],
  subscribers: [],
  migrations: [],
});

export function initORM(): Promise<DataSource> {
  return AppDataSource.isInitialized ? Promise.resolve(AppDataSource) : AppDataSource.initialize();
}

//endregion

export function isValidToken(token: JWT | null, res: NextApiResponse): token is JWT {
  if (!token) {
    res.status(constants.HTTP_STATUS_UNAUTHORIZED).send("");
    return false;
  }

  if (typeof token.accountId !== "number") {
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send("");
    return false;
  }

  return true;
}

function getSkinsFromAPI(): Promise<Map<string, CSGOAPI_Skin>> {
  return fetch("https://bymykel.github.io/CSGO-API/api/en/skins.json")
      .then(r => r.json())
      .then((arr: CSGOAPI_Skin[]) =>
          arr.reduce((map, val) => map.set(val.weapon.id + "-" + val.paint_index, val), new Map<string, CSGOAPI_Skin>()));
}

export const skinsCache = new CacheEntry(3600, await getSkinsFromAPI(), getSkinsFromAPI)