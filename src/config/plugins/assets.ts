import {
  AssetServerPlugin,
  configureS3AssetStorage,
} from "@vendure/asset-server-plugin";
import { DefaultAssetNamingStrategy } from "@vendure/core";
import path from "path";
import { getEnvs } from "../../getEnvs";

const { MINIO_ACCESS_KEY_ID, MINIO_ENDPOINT, MINIO_SECRET_ACCESS_KEY } =
  getEnvs();

export const AssetsPlugin = AssetServerPlugin.init({
  route: "assets",
  assetUploadDir: path.join(__dirname, "assets"),
  namingStrategy: new DefaultAssetNamingStrategy(),
  storageStrategyFactory: configureS3AssetStorage({
    bucket: "vendure-dev",
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY_ID,
      secretAccessKey: MINIO_SECRET_ACCESS_KEY,
    },
    nativeS3Configuration: {
      endpoint: MINIO_ENDPOINT,
      forcePathStyle: true,
      signatureVersion: "v4",
      // The `region` is required by the AWS SDK even when using MinIO,
      // so we just use a dummy value here.
      region: "eu-west-1",
    },
  }),
});
