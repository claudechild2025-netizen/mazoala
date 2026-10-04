import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const filePath = path.resolve("sources/Бараа_бүртгэл_тоо_тулган_шалгах_2026.xlsx");
const workbook = XLSX.readFile(filePath, { cellFormula: true });

const reportSheet = workbook.Sheets["7 хоногийн тайлан"];
console.log("Formulas in 7 хоногийн тайлан:");
console.log("B3 formula/val:", reportSheet["B3"]);
console.log("D3 formula/val:", reportSheet["D3"]);
console.log("F3 formula/val:", reportSheet["F3"]);
console.log("F4 formula/val:", reportSheet["F4"]);
console.log("D8 formula/val:", reportSheet["D8"]); // 7 хоногт зарсан for SC002
console.log("G8 formula/val:", reportSheet["G8"]); // Борлуулалтын дүн for SC002
