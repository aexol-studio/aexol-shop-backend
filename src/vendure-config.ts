import { VendureConfig, DefaultLogger, LogLevel } from "@vendure/core";
import {
  apiOptions,
  authOptions,
  catalogOptions,
  dbConnectionOptions,
  paymentOptions,
  plugins,
} from "./config";

export const config: VendureConfig = {
  logger: new DefaultLogger({ level: LogLevel.Debug }),
  catalogOptions,
  paymentOptions,
  apiOptions,
  authOptions,
  dbConnectionOptions,
  customFields: {},
  plugins,
};
