import {
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  VendureConfig,
  EntityHydrator,
  LanguageCode,
  PaymentMethodHandler,
  DefaultAssetNamingStrategy,
  RequestContext,
  StockDisplayStrategy,
  ProductVariant,
  DefaultLogger,
  LogLevel,
} from "@vendure/core";
import { defaultEmailHandlers, EmailPlugin } from "@vendure/email-plugin";
import {
  AssetServerPlugin,
  configureS3AssetStorage,
} from "@vendure/asset-server-plugin";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { StripePlugin } from "@vendure/payments-plugin/package/stripe";
import "dotenv/config";
import path from "path";

const IS_DEV = process.env.APP_ENV === "dev";
export const dummyPaymentHandler = new PaymentMethodHandler({
  code: "dummy-payment-handler",
  description: [
    /* omitted for brevity */
  ],
  args: {
    automaticSettle: {
      type: "boolean",
      label: [
        {
          languageCode: LanguageCode.en,
          value: "Authorize and settle in 1 step",
        },
      ],
      description: [
        {
          languageCode: LanguageCode.en,
          value: 'If enabled, Payments will be created in the "Settled" state.',
        },
      ],
      required: true,
      defaultValue: false,
    },
  },
  createPayment: async (ctx, order, amount, args, metadata, method) => {
    console.log("createPayment");
    const properMetadata = JSON.parse(metadata as unknown as string) as {
      shouldDecline: boolean;
      shouldCancel: boolean;
      shouldError: boolean;
      shouldErrorOnSettle: boolean;
    };

    if (properMetadata.shouldDecline) {
      return {
        amount,
        state: "Declined",
      };
    }

    if (properMetadata.shouldCancel) {
      return {
        amount,
        state: "Cancelled",
      };
    }

    if (properMetadata.shouldError) {
      throw new Error("Error in payment");
    }

    return { amount, state: "Authorized" };
  },
  settlePayment: async (ctx, order, payment, args, metadata) => {
    console.dir("settlePayment", metadata);
    console.dir("payment", payment);

    return { success: true };
  },
});

export class ExactStockDisplayStrategy implements StockDisplayStrategy {
  getStockLevel(
    ctx: RequestContext,
    productVariant: ProductVariant,
    saleableStockLevel: number
  ): string {
    return saleableStockLevel.toString();
  }
}

const AssetsPlugin = AssetServerPlugin.init({
  route: "assets",
  assetUploadDir: path.join(__dirname, "assets"),
  namingStrategy: new DefaultAssetNamingStrategy(),
  storageStrategyFactory: configureS3AssetStorage({
    bucket: "vendure-dev",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.MINIO_SECRET_ACCESS_KEY || "",
    },
    nativeS3Configuration: {
      endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
      forcePathStyle: true,
      signatureVersion: "v4",
      // The `region` is required by the AWS SDK even when using MinIO,
      // so we just use a dummy value here.
      region: "eu-west-1",
    },
  }),
});

export const config: VendureConfig = {
  catalogOptions: {
    stockDisplayStrategy: new ExactStockDisplayStrategy(),
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  logger: new DefaultLogger({ level: LogLevel.Debug }),
  apiOptions: {
    port: 3000,
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    ...(IS_DEV
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
  },
  authOptions: {
    tokenMethod: ["bearer", "cookie"],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
  },
  dbConnectionOptions: {
    type: "postgres",
    // See the README.md "Migrations" section for an explanation of
    // the `synchronize` and `migrations` options.
    synchronize: false,
    migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {},
  plugins: [
    AssetsPlugin,
    // StripePlugin.init({
    //   storeCustomersInStripe: true,
    //   //TODO: Verify all Stripe settings
    //   paymentIntentCreateParams: (injector, ctx, order) => {
    //     const entityHydrator = injector.get(EntityHydrator);

    //     return {
    //       currency: "pln",
    //       automatic_payment_methods: { enabled: false },
    //       payment_method_types: ["card", "blik", "p24"],
    //       metadata: {
    //         orderId: order.id,
    //       },
    //     };
    //   },
    //   customerCreateParams: async (injector, ctx, order) => {
    //     const entityHydrator = injector.get(EntityHydrator);
    //     const customer = order.customer;
    //     if (!customer) return {};
    //     await entityHydrator.hydrate(ctx, customer, {
    //       relations: ["addresses"],
    //     });
    //     const defaultBillingAddress =
    //       customer.addresses.find((a) => a.defaultBillingAddress) ??
    //       customer.addresses[0];
    //     return {
    //       address: {
    //         line1:
    //           defaultBillingAddress.streetLine1 ||
    //           order.shippingAddress?.streetLine1,
    //         postal_code:
    //           defaultBillingAddress.postalCode ||
    //           order.shippingAddress?.postalCode,
    //         city: defaultBillingAddress.city || order.shippingAddress?.city,
    //         state:
    //           defaultBillingAddress.province || order.shippingAddress?.province,
    //         country:
    //           defaultBillingAddress.country?.code ||
    //           order.shippingAddress?.countryCode,
    //       },
    //     };
    //   },
    // }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, "../static/email/test-emails"),
      route: "mailbox",
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, "../static/email/templates"),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        // Here we are assuming a storefront running at http://localhost:8080.
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: "http://localhost:3001/customer/verify",
        passwordResetUrl: "http://localhost:3001/customer/reset-password",
        changeEmailAddressUrl:
          "http://localhost:3001/customer/verify-email-address-change",
      },
    }),
    AdminUiPlugin.init({
      route: "admin",
      port: 3002,
      adminUiConfig: {},
    }),
  ],
};
