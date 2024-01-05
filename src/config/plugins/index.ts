import {
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  VendureConfig,
} from "@vendure/core";
import { AssetsPlugin } from "./assets";
import { AdminUiPlugin } from "./admin";
import { EmailPlugin } from "./email";

export const plugins: VendureConfig["plugins"] = [
  AssetsPlugin,
  DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
  DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
  EmailPlugin,
  AdminUiPlugin,
];
