const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const settingsPro = fs.readFileSync('settings-pro.js', 'utf8');

console.log('--- ALL BUTTONS OR ELEMENTS CONTAINING CONFIG / SETTINGS ---');
const btnRegex = /<button[^>]*>[\s\S]*?<\/button>/gi;
let m;
while ((m = btnRegex.exec(html)) !== null) {
  if (/config|ajuste|setting/i.test(m[0])) {
    console.log('[HTML BTN]', m[0].replace(/\s+/g, ' '));
  }
}

while ((m = btnRegex.exec(script)) !== null) {
  if (/config|ajuste|setting/i.test(m[0])) {
    console.log('[SCRIPT BTN]', m[0].replace(/\s+/g, ' '));
  }
}

console.log('--- SEARCHING FOR openSettings / SettingsPro in script.js ---');
const regexOpen = /openSettings/g;
let count = 0;
while ((m = regexOpen.exec(script)) !== null) {
  count++;
}
console.log('Total occurrences of openSettings in script.js:', count);

console.log('--- SEARCHING FOR openSettings in settings-pro.js ---');
count = 0;
while ((m = regexOpen.exec(settingsPro)) !== null) {
  count++;
}
console.log('Total occurrences of openSettings in settings-pro.js:', count);
