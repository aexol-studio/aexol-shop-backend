import {
  StockDisplayStrategy,
  RequestContext,
  ProductVariant,
} from "@vendure/core";

export class ExactStockDisplayStrategy implements StockDisplayStrategy {
  getStockLevel(
    ctx: RequestContext,
    productVariant: ProductVariant,
    saleableStockLevel: number
  ): string {
    return saleableStockLevel.toString();
  }
}
