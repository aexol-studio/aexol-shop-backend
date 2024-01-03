import { bootstrap } from "@vendure/core";
import { populate } from "@vendure/core/cli";
import initialData from "@vendure/create/assets/initial-data.json";
import path from "path";
import { config } from "./vendure-config";

populate(
  async () =>
    await bootstrap({
      ...config,
      importExportOptions: {
        importAssetsDir: path.join(
          require.resolve("@vendure/create/assets/products.csv"),
          "../images"
        ),
      },
    }),
  initialData,
  require.resolve("@vendure/create/assets/products.csv")
)
  .then((app) => app.close())
  .then(
    () => process.exit(0),
    (err) => {
      console.log(err);
      process.exit(1);
    }
  );
