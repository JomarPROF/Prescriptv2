const fs = require('fs');

const content = fs.readFileSync('settings-pro.js', 'utf8');

// Extract setupSettingsEvents function body
const start = content.indexOf('function setupSettingsEvents(overlay) {');
const end = content.indexOf('function renderSettingsProUnitCards() {');
const funcBody = content.substring(start, end);

console.log('setupSettingsEvents length:', funcBody.length);

// Find all querySelector and getElementById calls
const qRegex = /(?:overlay|document)\.(?:querySelector|getElementById)\(['"]([^'"]+)['"]\)/g;
let m;
const selectors = [];
while ((m = qRegex.exec(funcBody)) !== null) {
  selectors.push(m[1]);
}
console.log('Selectors used in setupSettingsEvents:');
console.log(selectors);
