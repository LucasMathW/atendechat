const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'node_modules', '@mui', 'base');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js')) {
      fixFile(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1️⃣ Substituir optional chaining de propriedade (obj?.prop) por obj && obj.prop
  content = content.replace(/(\w+)\?\.(\w+)/g, (_, obj, prop) => `${obj} && ${obj}.${prop}`);

  // 2️⃣ Substituir nullish coalescing (??) por || ''
  content = content.replace(/\?\?/g, "|| ''");

  // ⚠️ Ignora optional chaining de chamada de função (?.())

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Patch applied to', filePath);
}

walk(targetDir);

console.log('✅ Finished fixing @mui/base. Now create the patch with patch-package.');
