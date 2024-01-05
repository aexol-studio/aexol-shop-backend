import { VendureConfig } from "@vendure/core";

export const apiOptions: VendureConfig["apiOptions"] = {
  port: 3000,
  adminApiPath: "admin-api",
  shopApiPath: "shop-api",
  // The following options are useful in development mode,
  // but are best turned off for production for security
  // reasons.
  //   ...(IS_DEV
  //     ? {
  //         adminApiPlayground: {
  //           settings: { "request.credentials": "include" },
  //         },
  //         adminApiDebug: true,
  //         shopApiPlayground: {
  //           settings: { "request.credentials": "include" },
  //         },
  //         shopApiDebug: true,
  //       }
  //     : {}),
};
