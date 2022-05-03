const fs = require("fs");
const path = require("path");

const pathToRemove = [
  path.resolve(process.cwd(), "node_modules/roughjs/bundled/rough.js"),
  path.resolve(
    process.cwd(),
    "node_modules/@types/react-color/node_modules/@types/react"
  ),
  path.resolve(
    process.cwd(),
    "node_modules/@types/reactcss/node_modules/@types/react"
  ),
];

for (const path of pathToRemove) {
  fs.rmSync(path, { force: true, recursive: true });
}
