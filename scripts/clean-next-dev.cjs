// Drop `.next/dev` before build so stale dev route types are not typechecked (Windows path mismatch in Next 16).
const fs = require("fs");
const path = require("path");

const target = path.join(process.cwd(), ".next", "dev");
if (fs.existsSync(target)) {
  fs.rmSync(target, { recursive: true, force: true });
}
