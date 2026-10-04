import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });

const stockSheet = workbook.Sheets["Барааны үлдэгдэл"];
const stockRows = XLSX.utils.sheet_to_json(stockSheet, { header: 1 });

console.log("Analyzing all non-empty rows in 'Барааны үлдэгдэл'...");
let filledRows = 0;
const variantList = [];

for (let r = 5; r < stockRows.length; r++) {
  const row = stockRows[r];
  if (!row || row.length === 0) continue;
  filledRows++;
  // print non-empty rows
  const col0 = row[0]; // №
  const col1 = row[1]; // Product name
  const col2 = row[2]; // Item Code
  const col3 = row[3]; // Color
  const col9 = row[9]; // Current stock
  const col10 = row[10]; // Unit price

  if (col1 && !String(col1).includes("НИЙТ") && !String(col1).startsWith("№")) {
    variantList.push({
      row: r + 1,
      num: col0,
      name: col1,
      code: col2,
      color: col3,
      stock: col9,
      price: col10
    });
  }
}

console.log(`Total filled rows: ${filledRows}`);
console.log(`Found variant-like rows: ${variantList.length}`);
console.log("All variant-like rows:");
variantList.forEach(v => {
  console.log(`Row ${v.row}: №=${v.num} | Code=${v.code} | Name=${v.name} | Color=${v.color} | Stock=${v.stock} | Price=${v.price}`);
});
