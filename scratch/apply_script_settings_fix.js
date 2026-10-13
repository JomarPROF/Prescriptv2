const fs = require('fs');

const scriptPath = 'script.js';
let s = fs.readFileSync(scriptPath, 'utf8');

// The replacement pattern at the beginning of each App.openSettings:
// if (window.SettingsPro && typeof window.SettingsPro.open === 'function') return window.SettingsPro.open(arguments[0]);
// if (typeof openSettingsPro === 'function') return openSettingsPro(arguments[0]);

const checks = [
  {
    target: '    App.openSettings = function() {\n        document.body.classList.add(\'hide-floating-menu\'); \n        document.body.classList.remove(\'show-action-icons\');\n\n        let existing = document.getElementById(\'ent-settings-overlay\');',
    replacement: '    App.openSettings = function(tab) {\n        if (window.SettingsPro && typeof window.SettingsPro.open === \'function\') return window.SettingsPro.open(tab);\n        if (typeof openSettingsPro === \'function\') return openSettingsPro(tab);\n        document.body.classList.add(\'hide-floating-menu\'); \n        document.body.classList.remove(\'show-action-icons\');\n\n        let existing = document.getElementById(\'ent-settings-overlay\');'
  },
  {
    target: '        App.openSettings = function() {\n            App.originalOpenSettingsForDate.call(this);\n            setTimeout(() => {',
    replacement: '        App.openSettings = function(tab) {\n            if (window.SettingsPro && typeof window.SettingsPro.open === \'function\') return window.SettingsPro.open(tab);\n            if (typeof openSettingsPro === \'function\') return openSettingsPro(tab);\n            App.originalOpenSettingsForDate.call(this);\n            setTimeout(() => {'
  },
  {
    target: '        App.openSettings = function() {\n            // Abre o painel normalmente\n            App.originalOpenSettingsForSignature.call(this);\n            \n            // Injeta o campo de assinatura na aba "Receituário" (#e-tab-doc)',
    replacement: '        App.openSettings = function(tab) {\n            if (window.SettingsPro && typeof window.SettingsPro.open === \'function\') return window.SettingsPro.open(tab);\n            if (typeof openSettingsPro === \'function\') return openSettingsPro(tab);\n            // Abre o painel normalmente\n            App.originalOpenSettingsForSignature.call(this);\n            \n            // Injeta o campo de assinatura na aba "Receituário" (#e-tab-doc)'
  },
  {
    target: '        App.openSettings = function() {\n            if (originalOpenSettings) originalOpenSettings.apply(this, arguments);\n            setTimeout(() => {',
    replacement: '        App.openSettings = function(tab) {\n            if (window.SettingsPro && typeof window.SettingsPro.open === \'function\') return window.SettingsPro.open(tab);\n            if (typeof openSettingsPro === \'function\') return openSettingsPro(tab);\n            if (originalOpenSettings) originalOpenSettings.apply(this, arguments);\n            setTimeout(() => {'
  },
  {
    target: '    App.openSettings = function() {\n        // Chama a sua função original para construir a tela base (mesmo a duplicada)\n        if (origOpenSettings) origOpenSettings.apply(this, arguments);',
    replacement: '    App.openSettings = function(tab) {\n        if (window.SettingsPro && typeof window.SettingsPro.open === \'function\') return window.SettingsPro.open(tab);\n        if (typeof openSettingsPro === \'function\') return openSettingsPro(tab);\n        // Chama a sua função original para construir a tela base (mesmo a duplicada)\n        if (origOpenSettings) origOpenSettings.apply(this, arguments);'
  }
];

let applied = 0;
checks.forEach((c, idx) => {
  const count = s.split(c.target).length - 1;
  console.log(`Check ${idx}: matches ${count}`);
  if (count > 0) {
    s = s.replaceAll(c.target, c.replacement);
    applied += count;
  }
});

// Also check line 21185
const line21185Target = '    // Exporta explicitamente no window para chamadas inline HTML\n    window.App = App;\n    window.openUnitPortal = App.openUnitPortal;';
const line21185Replacement = `    // Exporta explicitamente no window para chamadas inline HTML
    window.App = App;
    window.openUnitPortal = App.openUnitPortal;
    if (window.SettingsPro && typeof window.SettingsPro.open === 'function') {
        App.openSettings = window.SettingsPro.open;
        window.App.openSettings = window.SettingsPro.open;
    }`;

console.log('Line 21185 match:', s.includes(line21185Target));
if (s.includes(line21185Target)) {
  s = s.replace(line21185Target, line21185Replacement);
  applied++;
}

console.log(`Total replacements applied: ${applied}`);
fs.writeFileSync(scriptPath, s, 'utf8');
console.log('Saved script.js successfully');
