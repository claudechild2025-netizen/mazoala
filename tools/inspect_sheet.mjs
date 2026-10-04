import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
console.log("Reading file:", filePath);

const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });
console.log("Sheet names in workbook:", workbook.SheetNames);

for (const name of workbook.SheetNames) {
  const sheet = workbook.Sheets[name];
  const ref = sheet["!ref"] || "A1:A1";
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n========================================`);
  console.log(`Sheet: "${name}" | Range: ${ref} | Total Rows: ${rows.length}`);
  console.log("First 6 rows:");
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    console.log(`Row ${i + 1}:`, JSON.stringify(rows[i]));
  }
}
