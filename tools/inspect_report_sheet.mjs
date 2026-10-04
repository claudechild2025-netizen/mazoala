import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });

const reportSheet = workbook.Sheets["7 хоногийн тайлан"];
const rows = XLSX.utils.sheet_to_json(reportSheet, { header: 1 });

console.log("Dumping '7 хоногийн тайлан' headers and first 20 rows:");
for (let r = 0; r < Math.min(25, rows.length); r++) {
  if (rows[r] && rows[r].length > 0) {
    console.log(`Row ${r + 1}:`, JSON.stringify(rows[r]));
  }
}
