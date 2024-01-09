import { VendureConfig } from "@vendure/core";

export const apiOptions: VendureConfig["apiOptions"] = {
  port: 3000,
  adminApiPath: "admin-api",
  shopApiPath: "shop-api",
  ...(process.env.APP_ENV === "dev"
    ? {
        adminApiPlayground: {
          settings: { "request.credentials": "include" },
        },
        adminApiDebug: true,
        shopApiPlayground: {
          settings: { "request.credentials": "include" },
        },
        shopApiDebug: true,
      }
    : {}),
};
