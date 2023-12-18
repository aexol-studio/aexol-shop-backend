import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  VendureConfig,
  EntityHydrator,
  LanguageCode,
} from "@vendure/core";
import { defaultEmailHandlers, EmailPlugin } from "@vendure/email-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { StripePlugin } from "@vendure/payments-plugin/package/stripe";
import "dotenv/config";
import path from "path";

const IS_DEV = process.env.APP_ENV === "dev";

export const config: VendureConfig = {
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
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {
    // Known as Tax Number in Poland
    Address: [{ name: "NIP", type: "string", nullable: true }],
    // Very useful price marking
    ProductVariant: [
      {
        name: "beforePrice",
        type: "int",
        nullable: true,
        ui: { component: "currency-form-input" },
        label: [
          {
            languageCode: LanguageCode.pl,
            value: "Cena przed promocją",
          },
          {
            languageCode: LanguageCode.en,
            value: "Price before promotion",
          },
        ],
      },
    ],
  },
  plugins: [
    StripePlugin.init({
      storeCustomersInStripe: true,
      //TODO: Verify all Stripe settings
      paymentIntentCreateParams: (injector, ctx, order) => {
        const entityHydrator = injector.get(EntityHydrator);

        return {
          currency: "pln",
          automatic_payment_methods: { enabled: false },
          payment_method_types: ["card", "blik", "p24"],
          metadata: {
            orderId: order.id,
          },
        };
      },
      customerCreateParams: async (injector, ctx, order) => {
        const entityHydrator = injector.get(EntityHydrator);
        const customer = order.customer;
        if (!customer) return {};
        await entityHydrator.hydrate(ctx, customer, {
          relations: ["addresses"],
        });
        const defaultBillingAddress =
          customer.addresses.find((a) => a.defaultBillingAddress) ??
          customer.addresses[0];
        return {
          address: {
            line1:
              defaultBillingAddress.streetLine1 ||
              order.shippingAddress?.streetLine1,
            postal_code:
              defaultBillingAddress.postalCode ||
              order.shippingAddress?.postalCode,
            city: defaultBillingAddress.city || order.shippingAddress?.city,
            state:
              defaultBillingAddress.province || order.shippingAddress?.province,
            country:
              defaultBillingAddress.country.code ||
              order.shippingAddress?.countryCode,
          },
        };
      },
    }),
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(__dirname, "../static/assets"),
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : "https://www.my-shop.com/assets",
    }),
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
        verifyEmailAddressUrl: "http://localhost:3001/verify",
        passwordResetUrl: "http://localhost:3001/password-reset",
        changeEmailAddressUrl:
          "http://localhost:3001/verify-email-address-change",
      },
    }),
    AdminUiPlugin.init({
      route: "admin",
      port: 3002,
      adminUiConfig: {
        apiPort: 3000,
      },
    }),
  ],
};
