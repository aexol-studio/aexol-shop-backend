import {
  StockDisplayStrategy,
  RequestContext,
  ProductVariant,
  VendureConfig,
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

export const catalogOptions: VendureConfig["catalogOptions"] = {
  stockDisplayStrategy: new ExactStockDisplayStrategy(),
};
