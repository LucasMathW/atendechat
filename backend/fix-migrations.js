const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.resolve("src/database/migrations");

fs.readdirSync(MIGRATIONS_DIR).forEach(file => {
  if (!file.endsWith(".ts")) return;

  const filePath = path.join(MIGRATIONS_DIR, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes("module.exports")) {
    content = content.replace(
      /module\.exports\s*=\s*{/,
      "export default {"
    );

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✔ Corrigido: ${file}`);
  }
});
