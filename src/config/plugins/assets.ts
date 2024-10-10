import {
  AssetServerPlugin,
  configureS3AssetStorage,
} from "@vendure/asset-server-plugin";
import { DefaultAssetNamingStrategy } from "@vendure/core";
import path from "path";
import { getEnvs } from "../../getEnvs";

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
  getEnvs();

const { S3_ENDPOINT, S3_FORCE_PATH_STYLE } = process.env;

export const AssetsPlugin = AssetServerPlugin.init({
  route: "assets",
  assetUploadDir: path.join(__dirname, "assets"),
  namingStrategy: new DefaultAssetNamingStrategy(),
  storageStrategyFactory: configureS3AssetStorage({
    bucket: "vendure-dev",
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    nativeS3Configuration: {
      ...(S3_ENDPOINT && { endpoint: S3_ENDPOINT }),
      ...(S3_FORCE_PATH_STYLE === "1" && { forcePathStyle: true }),
      signatureVersion: "v4",
      // The `region` is required by the AWS SDK even when using MinIO,
      // so we just use a dummy value here.
      region: "eu-west-1",
    },
  }),
});
