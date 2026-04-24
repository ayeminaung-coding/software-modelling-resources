const fs = require('fs');
const path = require('path');

const root = process.cwd();
const EXCLUDED_DIRS = new Set(['node_modules', 'exports', '.git']);
const stylesheetRe = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && full.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(root);
let total = 0;
let ok = 0;
let bad = 0;
const badRows = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(stylesheetRe);
  if (!m) continue;

  total++;
  const href = m[1];

  if (/^https?:\/\//i.test(href)) {
    ok++;
    continue;
  }

  const target = path.resolve(path.dirname(file), href);
  if (fs.existsSync(target)) {
    ok++;
  } else {
    bad++;
    badRows.push({
      file: path.relative(root, file),
      href,
      resolvedTo: path.relative(root, target)
    });
  }
}

console.log(`TOTAL_WITH_STYLESHEET ${total}`);
console.log(`OK ${ok}`);
console.log(`BAD ${bad}`);

for (const row of badRows) {
  console.log(`BAD_FILE ${row.file}`);
  console.log(`  HREF ${row.href}`);
  console.log(`  RESOLVES_TO ${row.resolvedTo}`);
}
