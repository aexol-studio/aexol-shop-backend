import { VendureConfig } from "@vendure/core";
import { dummyPaymentHandler } from "./dummy-payment-handler";

export const paymentOptions: VendureConfig["paymentOptions"] = {
  paymentMethodHandlers: [dummyPaymentHandler],
};
