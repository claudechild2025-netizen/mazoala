import { Variant, Product, Color } from "@mazoala/contracts";

export interface CatalogLookupTuple {
  productName: string;
  itemCode: string;
  colorName: string;
}

export function normalizeItemCode(rawCode: string): string {
  // Safe trimming and uppercase ASCII normalization without silent merges
  return rawCode.trim().toUpperCase();
}

export class CatalogResolutionError extends Error {
  constructor(message: string, public readonly code: "SKU_MISMATCH" | "ITEM_QUARANTINED" | "PRICE_REQUIRED") {
    super(message);
    this.name = "CatalogResolutionError";
  }
}

export function validateSellableVariant(variant: Variant, product: Product, color: Color): void {
  if (variant.isQuarantined) {
    throw new CatalogResolutionError(
      `Variant '${variant.itemCode}' is quarantined: ${variant.quarantineReason ?? "Awaiting SKU approval"}`,
      "ITEM_QUARANTINED"
    );
  }

  if (!variant.isSellable) {
    throw new CatalogResolutionError(
      `Variant '${variant.itemCode}' is marked not sellable`,
      "SKU_MISMATCH"
    );
  }

  if (!product.isActive) {
    throw new CatalogResolutionError(
      `Product '${product.name}' is inactive`,
      "SKU_MISMATCH"
    );
  }
}
