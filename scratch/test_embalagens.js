const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const selectPart = html.slice(html.indexOf('id="pack-type"'), html.indexOf('</select>', html.indexOf('id="pack-type"')));
const matches = [...selectPart.matchAll(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g)];

console.log('Total pack-type options found in index.html:', matches.length);
matches.forEach((m, i) => console.log(`${i + 1}. value="${m[1]}" text="${m[2].trim()}"`));

// Check script.js syntax
require('child_process').execSync('node -c script.js');
console.log('script.js syntax OK!');
