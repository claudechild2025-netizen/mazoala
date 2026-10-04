import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });

const stockSheet = workbook.Sheets["Барааны үлдэгдэл"];
const stockRows = XLSX.utils.sheet_to_json(stockSheet, { header: 1 });

let currentProductName = "";
const allVariants = [];
const missingPriceVariants = [];
const missingCodeVariants = [];

for (let r = 6; r < stockRows.length; r++) {
  const row = stockRows[r];
  if (!row || row.length === 0) continue;

  const col1 = row[1]; // Product name
  const col2 = row[2]; // Item Code
  const col3 = row[3]; // Color
  const col12 = row[12]; // _Product helper

  // If this is a summary row
  if (col1 && (String(col1).includes("· НИЙТ") || String(col1).includes("НИЙТ ДҮН"))) {
    continue;
  }

  // Update product name
  if (col1) {
    currentProductName = String(col1).trim();
  } else if (col12) {
    currentProductName = String(col12).trim();
  }

  const itemCode = col2 ? String(col2).trim() : null;
  const color = col3 ? String(col3).trim() : null;
  const price = row[10] !== undefined && row[10] !== null && row[10] !== "" ? Number(row[10]) : null;
  const stock = row[9] !== undefined && row[9] !== null ? Number(row[9]) : 0;

  if (!itemCode && !color && !col1) continue;

  const variant = {
    rowNumber: r + 1,
    productName: currentProductName,
    itemCode,
    color,
    handoverStock: row[6],
    newStock: row[7],
    deliveredStock: row[8],
    currentStock: stock,
    unitPrice: price,
    totalValue: row[11],
    keyHelper: row[13]
  };

  allVariants.push(variant);

  if (price === null) {
    missingPriceVariants.push(variant);
  }
  if (!itemCode || itemCode === "" || itemCode.toLowerCase().includes("lid") || String(currentProductName).toLowerCase().includes("lid") || String(currentProductName).toLowerCase().includes("таг")) {
    missingCodeVariants.push(variant);
  }
}

console.log(`\n========================================`);
console.log(`TOTAL PARSED VARIANTS: ${allVariants.length}`);
console.log(`VARIANTS WITH MISSING PRICES (${missingPriceVariants.length}):`);
missingPriceVariants.forEach(v => {
  console.log(`Row ${v.rowNumber} | Code: ${v.itemCode} | Product: ${v.productName} | Color: ${v.color} | Stock: ${v.currentStock} | Price: ${v.unitPrice}`);
});

console.log(`\nVARIANTS WITH MISSING SKU / LIDS (${missingCodeVariants.length}):`);
missingCodeVariants.forEach(v => {
  console.log(`Row ${v.rowNumber} | Code: ${v.itemCode} | Product: ${v.productName} | Color: ${v.color} | Stock: ${v.currentStock}`);
});
