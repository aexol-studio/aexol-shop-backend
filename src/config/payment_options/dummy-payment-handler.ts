import { LanguageCode, PaymentMethodHandler } from "@vendure/core";

export const dummyPaymentHandler = new PaymentMethodHandler({
  code: "dummy-payment-handler",
  description: [
    {
      languageCode: LanguageCode.en,
      value:
        "A dummy payment provider intended for testing and development only.",
    },
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
    const properMetadata = JSON.parse(metadata as unknown as string) as {
      shouldDecline: boolean;
      shouldError: boolean;
      shouldErrorOnSettle: boolean;
    };

    if (properMetadata.shouldDecline) {
      return {
        amount,
        state: "Declined",
        metadata: { errorMessage: "Simulated decline" },
      };
    } else if (properMetadata.shouldError) {
      return {
        amount,
        state: "Error",
        errorMessage: "Simulated error",
        metadata: { errorMessage: "Simulated error" },
      };
    } else {
      return {
        amount,
        state: args.automaticSettle ? "Settled" : "Authorized",
        transactionId: Math.random().toString(36).substr(3),
        metadata,
      };
    }
  },
  settlePayment: async (ctx, order, payment, args, method) => {
    const properMetadata = JSON.parse(
      payment.metadata as unknown as string
    ) as {
      shouldDecline: boolean;
      shouldError: boolean;
      shouldErrorOnSettle: boolean;
    };
    if (properMetadata.shouldErrorOnSettle) {
      return {
        success: false,
        errorMessage: "Simulated settlement error",
      };
    }
    return {
      success: true,
    };
  },
  cancelPayment: (ctx, order, payment) => {
    return {
      success: true,
      metadata: {
        cancellationDate: new Date().toISOString(),
      },
    };
  },
});
