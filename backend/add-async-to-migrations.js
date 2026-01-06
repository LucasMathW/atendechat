const fs = require("fs");
const path = require("path");

const migrationsDir = path.resolve(
  __dirname,
  "src/database/migrations"
);

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".ts"));

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  let updated = false;

  // up: (...) => {
  content = content.replace(
    /up\s*:\s*\(([^)]*)\)\s*=>\s*{/g,
    (_, params) => {
      updated = true;
      return `async up(${params}) {`;
    }
  );

  // down: (...) => {
  content = content.replace(
    /down\s*:\s*\(([^)]*)\)\s*=>\s*{/g,
    (_, params) => {
      updated = true;
      return `async down(${params}) {`;
    }
  );

  if (!updated) {
    console.log(`⏭️  Ignorado: ${file}`);
    return;
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Atualizado: ${file}`);
});

console.log("🎉 Conversão concluída.");
