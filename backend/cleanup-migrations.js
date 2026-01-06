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

  // 1️⃣ Promise.all([ a(), b(), ])
  content = content.replace(
    /return\s+Promise\.all\s*\(\s*\[([\s\S]*?)\]\s*\);?/g,
    (_, body) => {
      updated = true;

      const calls = body
        .split("\n")
        .map(l => l.trim())
        .filter(l => l && l !== ",");

      return calls
        .map(call => {
          call = call.replace(/,$/, "");
          return `await ${call}`;
        })
        .join("\n");
    }
  );

  // 2️⃣ return queryInterface...
  content = content.replace(
    /return\s+(queryInterface\.[^;]+);?/g,
    (_, expr) => {
      updated = true;
      return `await ${expr};`;
    }
  );

  // 3️⃣ return sequelize.query(...)
  content = content.replace(
    /return\s+(queryInterface\.sequelize\.[^;]+);?/g,
    (_, expr) => {
      updated = true;
      return `await ${expr};`;
    }
  );

  if (!updated) {
    console.log(`⏭️  Nenhuma alteração: ${file}`);
    return;
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Limpo: ${file}`);
});

console.log("\n🎉 Migrations normalizadas com async/await.");
