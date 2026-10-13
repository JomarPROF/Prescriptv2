const fs = require('fs');

const scriptContent = fs.readFileSync('script.js', 'utf8');
const indexContent = fs.readFileSync('index.html', 'utf8');
const settingsProContent = fs.readFileSync('settings-pro.js', 'utf8');

console.log('--- Search for settings button IDs in script.js ---');
const btnRegex = /(?:id|class)=["']([^"']*(?:setting|config)[^"']*)["']/gi;
let m;
const found = new Set();
while ((m = btnRegex.exec(scriptContent)) !== null) {
  found.add(m[0]);
}
console.log('Script matches:', Array.from(found));

console.log('--- Search for settings button in index.html ---');
while ((m = btnRegex.exec(indexContent)) !== null) {
  console.log('Index match:', m[0]);
}

console.log('--- Search for onclick handlers calling settings in script.js ---');
const onclickRegex = /onclick=["']([^"']*(?:setting|config)[^"']*)["']/gi;
while ((m = onclickRegex.exec(scriptContent)) !== null) {
  console.log('Onclick:', m[0]);
}

console.log('--- Search for onclick handlers calling settings in index.html ---');
while ((m = onclickRegex.exec(indexContent)) !== null) {
  console.log('Index Onclick:', m[0]);
}
