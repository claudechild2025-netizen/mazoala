import test from "node:test";
import assert from "node:assert/strict";
import {
  reserveStock,
  releaseReservation,
  consumePreparation,
  applyConfirmedReceipt,
  calculateAvailableStock
} from "./inventory/ledger.js";
import {
  assertCanPrepareOrder,
  validateOrderPricing,
  calculateDeliveryEffect
} from "./orders/order-engine.js";
import {
  calculateReceiptDifference,
  validateReceiptConfirmation
} from "./receiving/receipt-engine.js";
import {
  resolveWednesdayPeriod,
  getBusinessDayOfWeek
} from "./reporting/wednesday-period.js";

test("Inventory Ledger - Reserve, Available, and Preparation lifecycle", () => {
  // Start with 10 on-hand, 0 reserved
  let balance = { onHand: 10, reserved: 0 };
  assert.equal(calculateAvailableStock(balance.onHand, balance.reserved), 10);

  // Reserve 3 units
  balance = reserveStock(balance, 3);
  assert.equal(balance.onHand, 10);
  assert.equal(balance.reserved, 3);
  assert.equal(calculateAvailableStock(balance.onHand, balance.reserved), 7);

  // Trying to reserve 8 units should fail (only 7 available)
  assert.throws(() => reserveStock(balance, 8), /Insufficient available stock/);

  // Prepare the 3 units: consumes reservation and decrements onHand atomically
  balance = consumePreparation(balance, 3);
  assert.equal(balance.onHand, 7);
  assert.equal(balance.reserved, 0);
  assert.equal(calculateAvailableStock(balance.onHand, balance.reserved), 7);

  // Subsequent delivery event has ZERO stock effect
  const effect = calculateDeliveryEffect();
  assert.equal(effect.hasStockEffect, false);
});

test("Order Engine - Double preparation prevention", () => {
  // UNPREPARED order can be prepared
  assert.doesNotThrow(() => assertCanPrepareOrder("CONFIRMED", "UNPREPARED"));

  // PREPARED order cannot be prepared again
  assert.throws(
    () => assertCanPrepareOrder("CONFIRMED", "PREPARED"),
    /Order is already prepared/
  );
});

test("Order Engine - Missing price blocks unapproved orders (L07)", () => {
  assert.throws(
    () => validateOrderPricing([{ variantId: "var-1", quantity: 1, catalogPrice: null }]),
    /missing price in catalog/
  );

  // With approved override price, it succeeds
  assert.doesNotThrow(
    () => validateOrderPricing([{ variantId: "var-1", quantity: 1, catalogPrice: null, overridePrice: 25000 }])
  );
});

test("Receiving Engine - Count discrepancy and confirmation (L02)", () => {
  // Invoice 100, Count 98 -> difference -2
  const diff = calculateReceiptDifference(100, 98);
  assert.equal(diff, -2);

  // Confirmation with discrepancy requires reason / manager approval
  assert.throws(
    () => validateReceiptConfirmation([{ variantId: "v1", invoiceQty: 100, countedQty: 98 }], false),
    /Discrepancy of -2.*requires reason/
  );

  // Confirmation succeeds with reason and manager approval
  assert.doesNotThrow(
    () => validateReceiptConfirmation(
      [{ variantId: "v1", invoiceQty: 100, countedQty: 98, differenceReason: "Damaged box" }],
      true
    )
  );

  // Stock update applies counted quantity (98) once
  const initial = { onHand: 0, reserved: 0 };
  const updated = applyConfirmedReceipt(initial, 98);
  assert.equal(updated.onHand, 98);
  assert.equal(updated.reserved, 0);
});

test("Reporting Engine - Wednesday exclusive reporting rule (L04)", () => {
  // Sunday 2026-10-04 (which is today)
  const today = new Date("2026-10-04T01:42:00+08:00");
  const day = getBusinessDayOfWeek(today, "Asia/Ulaanbaatar");
  assert.equal(day, 0); // Sunday

  // Official run on Sunday must fail
  assert.throws(
    () => resolveWednesdayPeriod(today, false, "Asia/Ulaanbaatar"),
    /Official reports can only be generated on Wednesday/
  );

  // Preview run on Sunday succeeds
  const preview = resolveWednesdayPeriod(today, true, "Asia/Ulaanbaatar");
  assert.equal(preview.isOfficialWednesdayRun, false);

  // Official run on Wednesday 2026-10-07 succeeds
  const wednesday = new Date("2026-10-07T12:00:00+08:00");
  assert.equal(getBusinessDayOfWeek(wednesday, "Asia/Ulaanbaatar"), 3);
  const official = resolveWednesdayPeriod(wednesday, false, "Asia/Ulaanbaatar");
  assert.equal(official.isOfficialWednesdayRun, true);
});
