export interface ReceiptValidationItem {
  variantId: string;
  invoiceQty: number;
  countedQty: number | null;
  differenceReason?: string | null;
}

export class ReceiptDomainError extends Error {
  constructor(message: string, public readonly code: "DISCREPANCY_APPROVAL_REQUIRED" | "STATE_CONFLICT") {
    super(message);
    this.name = "ReceiptDomainError";
  }
}

export function calculateReceiptDifference(invoiceQty: number, countedQty: number | null): number | null {
  if (countedQty === null || countedQty === undefined) return null;
  return countedQty - invoiceQty;
}

export function validateReceiptConfirmation(items: ReceiptValidationItem[], isManagerApproved: boolean): void {
  for (const item of items) {
    if (item.countedQty === null || item.countedQty === undefined) {
      throw new ReceiptDomainError(
        `Variant ${item.variantId} has not been counted yet`,
        "STATE_CONFLICT"
      );
    }
    const diff = calculateReceiptDifference(item.invoiceQty, item.countedQty)!;
    if (diff !== 0 && !isManagerApproved && !item.differenceReason) {
      throw new ReceiptDomainError(
        `Discrepancy of ${diff} for variant ${item.variantId} requires reason and manager approval`,
        "DISCREPANCY_APPROVAL_REQUIRED"
      );
    }
  }
}
