const fs = require("fs");
const s = fs.readFileSync("supabase/migrations/0048_product_copy_refresh.sql", "utf8");
const re = /\('([^']+)', \$d\$([\s\S]*?)\$d\$\)/g;
let m;
let n = 0;
while ((m = re.exec(s))) {
  n++;
  const lines = m[2].split(/\n/);
  const h = lines.filter((l) => l.startsWith("### ")).length;
  const l = lines.filter((l) => l.startsWith("- ")).length;
  console.log(n, m[1], "lines", lines.length, "H", h, "L", l);
}
console.log("total", n);
