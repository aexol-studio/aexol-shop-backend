import {
  VendureConfig,
  DefaultLogger,
  LogLevel,
  LanguageCode,
  SessionService,
  InternalServerError,
} from "@vendure/core";
import {
  apiOptions,
  authOptions,
  catalogOptions,
  dbConnectionOptions,
  paymentOptions,
  plugins,
} from "./config";

import {
  ActiveOrderStrategy,
  Injector,
  Order,
  OrderService,
  RequestContext,
  TransactionalConnection,
} from "@vendure/core";

class OrderStrategy implements ActiveOrderStrategy {
  readonly name = "active-order-strategy";

  private connection: TransactionalConnection;
  private orderService: OrderService;
  private sessionService: SessionService;

  init(injector: Injector) {
    this.connection = injector.get(TransactionalConnection);
    this.orderService = injector.get(OrderService);
    this.sessionService = injector.get(SessionService);
  }

  createActiveOrder(ctx: RequestContext) {
    return this.orderService.create(ctx, ctx.activeUserId);
  }

  async determineActiveOrder(ctx: RequestContext) {
    if (!ctx.session) {
      throw new InternalServerError("error.no-active-session");
    }
    let order = ctx.session.activeOrderId
      ? await this.connection
          .getRepository(ctx, Order)
          .createQueryBuilder("order")
          .leftJoin("order.channels", "channel")
          .where("order.id = :orderId", { orderId: ctx.session.activeOrderId })
          .andWhere("channel.id = :channelId", { channelId: ctx.channelId })
          .getOne()
      : undefined;
    if (order && order.active === false) {
      await this.sessionService.unsetActiveOrder(ctx, ctx.session);
      order = undefined;
    }
    if (!order) {
      if (ctx.activeUserId) {
        order = await this.orderService.getActiveOrderForUser(
          ctx,
          ctx.activeUserId
        );
      }
    }

    // HERE is the change than core have (we recalculate price adjustments, because it gives better results)
    if (!order) return undefined;
    const fullOrder = await this.orderService.findOne(ctx, order?.id);
    if (!fullOrder) return undefined;
    return this.orderService.applyPriceAdjustments(ctx, fullOrder);
  }
}

export const config: VendureConfig = {
  logger: new DefaultLogger({ level: LogLevel.Debug }),
  catalogOptions,
  paymentOptions,
  apiOptions,
  authOptions,
  dbConnectionOptions,
  customFields: {},
  plugins,
  orderOptions: {
    activeOrderStrategy: new OrderStrategy(),
  },
};
