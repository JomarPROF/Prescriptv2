const fs = require('fs');

// We simulate what App object looks like in Prescript
global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};

global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  removeEventListener: () => {},
  documentElement: {
    style: {
      setProperty: (k, v) => {}
    }
  },
  body: {
    classList: {
      add: (c) => console.log('body.classList.add:', c),
      remove: (c) => console.log('body.classList.remove:', c),
      contains: () => false
    },
    appendChild: (el) => console.log('body.appendChild:', el.id || el.tagName)
  },
  getElementById: (id) => null,
  querySelectorAll: (sel) => [],
  querySelector: (sel) => null,
  createElement: (tag) => {
    const el = {
      tagName: tag,
      id: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      querySelector: (s) => null,
      querySelectorAll: (s) => [],
      appendChild: () => {},
      addEventListener: () => {},
      innerHTML: '',
      value: ''
    };
    return el;
  }
};

global.localStorage = {
  _data: {},
  getItem: (k) => global.localStorage._data[k] || null,
  setItem: (k, v) => { global.localStorage._data[k] = v; },
  removeItem: (k) => { delete global.localStorage._data[k]; }
};

global.requestAnimationFrame = (fn) => fn();

// Load script.js and see what App looks like
// Note: script.js might use export/import or might be standard JS. Let's check if it can be evaluated in vm.
console.log('Testing settings-pro.js execution...');
require('../settings-pro.js');

console.log('Now testing openSettingsPro with empty App...');
try {
  window.SettingsPro.open();
  console.log('openSettingsPro passed with empty App!');
} catch (e) {
  console.error('Error with empty App:', e);
}

// Now test with window.App having typical properties
console.log('Now testing openSettingsPro with typical App...');
window.App = {
  config: {
    theme: 'theme-modern',
    docname: 'Dr. Teste',
    doccrm: '12345/BA'
  },
  currentProfile: {
    name: 'Dr. Perfil',
    crm: '54321/BA'
  },
  UnitsDB: {
    get: () => [
      {
        id: 'unit_caps3_joao_carlos',
        name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
        sub: 'Secretaria Municipal de Saúde',
        addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
        city: 'Feira de Santana - BA',
        tel: '(75) 3612-6600',
        logoPref: 'prefeitura.png',
        logoFarm: 'farmacia.png'
      }
    ],
    getActiveUnit: () => ({
      id: 'unit_caps3_joao_carlos',
      name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
      sub: 'Secretaria Municipal de Saúde',
      addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
      city: 'Feira de Santana - BA',
      tel: '(75) 3612-6600',
      logoPref: 'prefeitura.png',
      logoFarm: 'farmacia.png'
    }),
    getActiveId: () => 'unit_caps3_joao_carlos',
    getUnit: (id) => null
  }
};

try {
  window.SettingsPro.open();
  console.log('openSettingsPro passed with populated App!');
} catch (e) {
  console.error('Error with populated App:', e);
}
process.exit(0);
