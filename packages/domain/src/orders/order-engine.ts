import { OrderState, FulfillmentState, DeliveryState, PaymentState } from "@mazoala/contracts";

export class OrderDomainError extends Error {
  constructor(
    message: string,
    public readonly code: "ALREADY_PREPARED" | "STATE_CONFLICT" | "PRICE_REQUIRED" | "INSUFFICIENT_STOCK"
  ) {
    super(message);
    this.name = "OrderDomainError";
  }
}

export interface OrderItemCheck {
  variantId: string;
  quantity: number;
  catalogPrice: number | null;
  overridePrice?: number | null;
}

export function validateOrderPricing(items: OrderItemCheck[]): void {
  for (const item of items) {
    if (item.catalogPrice === null && (item.overridePrice === null || item.overridePrice === undefined)) {
      throw new OrderDomainError(
        `Variant ${item.variantId} has missing price in catalog and no approved price override was provided`,
        "PRICE_REQUIRED"
      );
    }
  }
}

export function assertCanConfirmOrder(orderState: OrderState): void {
  if (orderState !== "DRAFT") {
    throw new OrderDomainError(`Cannot confirm order in state '${orderState}'`, "STATE_CONFLICT");
  }
}

export function assertCanPrepareOrder(orderState: OrderState, fulfillmentState: FulfillmentState): void {
  if (fulfillmentState === "PREPARED") {
    throw new OrderDomainError(`Order is already prepared`, "ALREADY_PREPARED");
  }
  if (orderState !== "CONFIRMED" || fulfillmentState !== "UNPREPARED") {
    throw new OrderDomainError(
      `Cannot prepare order. Expected orderState=CONFIRMED and fulfillmentState=UNPREPARED, got ${orderState}/${fulfillmentState}`,
      "STATE_CONFLICT"
    );
  }
}

export function calculateDeliveryEffect(): { hasStockEffect: false } {
  // Couriers, in transit, delivered, failed all have ZERO stock effect
  return { hasStockEffect: false };
}
