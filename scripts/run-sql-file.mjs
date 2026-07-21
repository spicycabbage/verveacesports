import fs from "node:fs";
const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/run-sql-file.mjs <path>");
  process.exit(1);
}
process.stdout.write(fs.readFileSync(file, "utf8"));
