import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });

console.log("Searching across all sheets for 'lid', 'таг', or items without code...");

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const line = JSON.stringify(row).toLowerCase();
    if (line.includes("lid") || line.includes("таг")) {
      console.log(`Sheet "${sheetName}" Row ${r + 1}:`, JSON.stringify(row));
    }
  }
}
