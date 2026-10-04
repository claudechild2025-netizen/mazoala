import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });

const stockSheet = workbook.Sheets["Барааны үлдэгдэл"];
const stockRows = XLSX.utils.sheet_to_json(stockSheet, { header: 1, range: 5 });

const realVariants = [];
const missingPriceVariants = [];

for (let i = 1; i < stockRows.length; i++) {
  const row = stockRows[i];
  if (!row || !row[1]) continue;
  const name = String(row[1]).trim();
  if (name.includes("· НИЙТ") || name.toUpperCase().includes("НИЙТ ДҮН") || name.startsWith("Нийт")) {
    continue; // summary row
  }

  const item = {
    rowNum: i + 6,
    num: row[0],
    productName: name,
    itemCode: row[2],
    color: row[3],
    supplierItemCode: row[4],
    modelNumber: row[5],
    handoverStock: row[6],
    newStock: row[7],
    delivered: row[8],
    currentStock: row[9],
    unitPrice: row[10],
    totalValue: row[11]
  };

  realVariants.push(item);

  if (item.unitPrice === null || item.unitPrice === undefined || item.unitPrice === "" || item.unitPrice === 0) {
    missingPriceVariants.push(item);
  }
}

console.log(`Real Variants count: ${realVariants.length}`);
console.log(`Variants missing price count: ${missingPriceVariants.length}`);
missingPriceVariants.forEach(v => {
  console.log(`Row ${v.rowNum} | ${v.productName} | Code: ${v.itemCode} | Color: ${v.color} | Qty: ${v.currentStock} | Price: ${v.unitPrice}`);
});

console.log("\nChecking 'Шинэ бараа бүртгэл' (New Goods / Invoices)...");
const newGoodsSheet = workbook.Sheets["Шинэ бараа бүртгэл"];
const newGoodsRows = XLSX.utils.sheet_to_json(newGoodsSheet, { header: 1, range: 5 });
const newGoods = [];
for (let i = 1; i < newGoodsRows.length; i++) {
  const row = newGoodsRows[i];
  if (!row || !row[1] || String(row[1]).includes("НИЙТ")) continue;
  newGoods.push({
    rowNum: i + 6,
    name: row[1],
    itemCode: row[2],
    color: row[3],
    invoiceQty: row[4],
    countedQty: row[7],
    difference: row[8],
    checked: row[9],
    status: row[10]
  });
}
console.log(`New Goods rows count: ${newGoods.length}`);
console.log("Sample New Goods rows (first 5):");
newGoods.slice(0, 5).forEach(g => console.log(JSON.stringify(g)));
