import { VendureConfig } from "@vendure/core";
import path from "path";
import { getEnvs } from "../../getEnvs";

const { DB_NAME, DB_SCHEMA, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD } =
  getEnvs();

export const dbConnectionOptions: VendureConfig["dbConnectionOptions"] = {
  type: "postgres",
  // See the README.md "Migrations" section for an explanation of
  // the `synchronize` and `migrations` options.
  synchronize: false,
  migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")],
  logging: false,
  database: DB_NAME,
  schema: DB_SCHEMA,
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
};
