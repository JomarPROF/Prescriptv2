const fs = require('fs');

const content = fs.readFileSync('settings-pro.js', 'utf8');

// Let's create an environment with mock elements that record missing IDs
const elementsFound = new Set();
const missingElements = [];

// Extract the big HTML template from renderSettingsModalContent
const htmlStart = content.indexOf('overlay.innerHTML = `');
const htmlEnd = content.indexOf('`;\n\n        setupSettingsEvents(overlay);');
const htmlString = content.substring(htmlStart + 'overlay.innerHTML = `'.length, htmlEnd);

// Find all id="..." in the HTML template
const idMatches = htmlString.match(/id="([^"]+)"/g) || [];
const idsInHtml = new Set(idMatches.map(m => m.replace('id="', '').replace('"', '')));

console.log('Total IDs found in settings template:', idsInHtml.size);

// Now find all overlay.querySelector('#...') in setupSettingsEvents
const eventsStart = content.indexOf('function setupSettingsEvents(overlay) {');
const eventsEnd = content.indexOf('function renderSettingsProUnitCards() {');
const eventsCode = content.substring(eventsStart, eventsEnd);

const qMatches = eventsCode.match(/overlay\.querySelector\(['"]#([^'"]+)['"]\)/g) || [];
const queriedIds = qMatches.map(m => m.match(/#([^'"]+)/)[1]);

console.log('Total #id queries in setupSettingsEvents:', queriedIds.length);

queriedIds.forEach(id => {
  if (!idsInHtml.has(id)) {
    console.log('WARNING: Queried ID NOT IN HTML TEMPLATE:', id);
  }
});

// Also check document.getElementById calls in setupSettingsEvents or renderSettingsModalContent
const dMatches = eventsCode.match(/document\.getElementById\(['"]([^'"]+)['"]\)/g) || [];
dMatches.forEach(m => {
  const id = m.match(/['"]([^'"]+)['"]/)[1];
  if (!idsInHtml.has(id)) {
    console.log('Document getElementById queried ID:', id, 'In HTML template?', idsInHtml.has(id));
  }
});
