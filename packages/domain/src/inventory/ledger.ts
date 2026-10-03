export interface StockBalanceState {
  onHand: number;
  reserved: number;
}

export class InventoryInvariantError extends Error {
  constructor(message: string, public readonly code: "INSUFFICIENT_STOCK" | "STATE_CONFLICT") {
    super(message);
    this.name = "InventoryInvariantError";
  }
}

export function calculateAvailableStock(onHand: number, reserved: number): number {
  if (reserved > onHand) {
    throw new InventoryInvariantError(
      `Invariant violation: reserved (${reserved}) exceeds on_hand (${onHand})`,
      "STATE_CONFLICT"
    );
  }
  return onHand - reserved;
}

/**
 * Asserts the fundamental invariant: 0 <= reserved <= on_hand
 */
export function assertBalanceInvariant(state: StockBalanceState): void {
  if (state.onHand < 0) {
    throw new InventoryInvariantError(`on_hand cannot be negative (${state.onHand})`, "STATE_CONFLICT");
  }
  if (state.reserved < 0) {
    throw new InventoryInvariantError(`reserved cannot be negative (${state.reserved})`, "STATE_CONFLICT");
  }
  if (state.reserved > state.onHand) {
    throw new InventoryInvariantError(
      `reserved (${state.reserved}) cannot exceed on_hand (${state.onHand})`,
      "STATE_CONFLICT"
    );
  }
}

/**
 * Reserves stock for an order confirmation.
 * Increments `reserved` by quantity without modifying `onHand`.
 */
export function reserveStock(current: StockBalanceState, quantity: number): StockBalanceState {
  if (quantity <= 0) {
    throw new InventoryInvariantError(`Reservation quantity must be positive (${quantity})`, "STATE_CONFLICT");
  }
  const available = calculateAvailableStock(current.onHand, current.reserved);
  if (quantity > available) {
    throw new InventoryInvariantError(
      `Insufficient available stock. Requested ${quantity}, available ${available}`,
      "INSUFFICIENT_STOCK"
    );
  }

  const nextState: StockBalanceState = {
    onHand: current.onHand,
    reserved: current.reserved + quantity
  };
  assertBalanceInvariant(nextState);
  return nextState;
}

/**
 * Cancels reservation before preparation.
 * Decrements `reserved` without touching `onHand`.
 */
export function releaseReservation(current: StockBalanceState, quantity: number): StockBalanceState {
  if (quantity <= 0) {
    throw new InventoryInvariantError(`Release quantity must be positive (${quantity})`, "STATE_CONFLICT");
  }
  if (quantity > current.reserved) {
    throw new InventoryInvariantError(
      `Cannot release ${quantity}; only ${current.reserved} is currently reserved`,
      "STATE_CONFLICT"
    );
  }

  const nextState: StockBalanceState = {
    onHand: current.onHand,
    reserved: current.reserved - quantity
  };
  assertBalanceInvariant(nextState);
  return nextState;
}

/**
 * Full preparation event: single outgoing-stock event.
 * Consumes reservation AND deducts onHand in the same atomic step.
 * Example: 10 on-hand, 3 reserved -> 7 on-hand, 0 reserved.
 */
export function consumePreparation(current: StockBalanceState, quantity: number): StockBalanceState {
  if (quantity <= 0) {
    throw new InventoryInvariantError(`Preparation quantity must be positive (${quantity})`, "STATE_CONFLICT");
  }
  if (quantity > current.reserved) {
    throw new InventoryInvariantError(
      `Cannot prepare unreserved stock: requested ${quantity}, reserved ${current.reserved}`,
      "STATE_CONFLICT"
    );
  }
  if (quantity > current.onHand) {
    throw new InventoryInvariantError(
      `Cannot prepare stock exceeding on_hand: requested ${quantity}, on_hand ${current.onHand}`,
      "STATE_CONFLICT"
    );
  }

  const nextState: StockBalanceState = {
    onHand: current.onHand - quantity,
    reserved: current.reserved - quantity
  };
  assertBalanceInvariant(nextState);
  return nextState;
}

/**
 * Explicit receipt confirmation: adds counted quantity to onHand.
 */
export function applyConfirmedReceipt(current: StockBalanceState, countedQty: number): StockBalanceState {
  if (countedQty < 0) {
    throw new InventoryInvariantError(`Counted quantity cannot be negative (${countedQty})`, "STATE_CONFLICT");
  }
  const nextState: StockBalanceState = {
    onHand: current.onHand + countedQty,
    reserved: current.reserved
  };
  assertBalanceInvariant(nextState);
  return nextState;
}
