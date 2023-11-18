import {CacheEntry, CSGOAPI_Skin} from "@/shared/types";
import {Liquibase, LiquibaseConfig, LiquibaseLogLevels, POSTGRESQL_DEFAULT_CONFIG} from "liquibase";
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
  url: `jdbc:postgresql://${variable("DATABASE_HOST")}:${variable("DATABASE_PORT")}/${variable("DATABASE_NAME")}`,
  username: variable("DATABASE_USERNAME"),
  password: variable("DATABASE_PASSWORD"),
  logLevel: logLevel() < 2 ? LiquibaseLogLevels.Debug : LiquibaseLogLevels.Info,
  changeLogFile: 'migrations/db.changelog-root.xml'
};
export const liquibase = new Liquibase(liquibaseConfig);
//endregion

//region typeorm
const AppDataSource = new DataSource({
  type: "postgres",
  host: variable("DATABASE_HOST"),
  port: Number(variable("DATABASE_PORT")),
  username: variable("DATABASE_USERNAME"),
  password: variable("DATABASE_PASSWORD"),
  database: variable("DATABASE_NAME"),
  synchronize: false,   // We manage our own schemas using liquibase.
  logging: logLevel() < 2,
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

export function variable(varName: string): string {
  const value = process.env[varName];
  if (value == undefined || value == "") {
    throw new Error(`Variable '${varName}' not defined.`);
  }
  return value;
}

function logLevel(): number {
  const level = [
    "trace",
    "debug",
    "info",
    "warn",
    "error"
  ].indexOf(process.env.LOG_LEVEL ?? "");
  return level !== -1 ? level : 2;
}

export const skinsCache = new CacheEntry(3600, await getSkinsFromAPI(), getSkinsFromAPI)