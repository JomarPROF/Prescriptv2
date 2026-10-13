const fs = require('fs');
const js = fs.readFileSync('settings-pro.js', 'utf8');

const start = js.indexOf('// 7. Configuração dos Eventos e Listeners dos Controles');
const end = js.indexOf('// 8. Salvar Configurações Globais');
const slice = js.substring(start, end);

const regex = /overlay\.querySelector\(['"]([^'"]+)['"]\)/g;
let m;
const set = new Set();
while ((m = regex.exec(slice)) !== null) {
  set.add(m[1]);
}
console.log('Selectors used in setupSettingsEvents:');
for (const s of set) {
  console.log(' - ' + s);
}
