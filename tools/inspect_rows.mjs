import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });

const stockSheet = workbook.Sheets["Барааны үлдэгдэл"];
const stockRows = XLSX.utils.sheet_to_json(stockSheet, { header: 1 });

console.log("Dumping rows 7 to 25 to understand merged/sub-variant structure:");
for (let r = 6; r <= 25; r++) {
  console.log(`Row ${r + 1}:`, JSON.stringify(stockRows[r]));
}
