const fs = require('fs');

let cleanBlock = fs.readFileSync('scratch/clean_block.js', 'utf8');

// 1. New CURATED_DEFAULT_UNITS and UnitsDB.get
const newCatalogSection = `    // 1. CATÁLOGO EXCLUSIVO DAS 6 UNIDADES OFICIAIS
    const CURATED_DEFAULT_UNITS = [
        {
            id: 'unit_caps3_joao_carlos',
            name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751.\\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'CAPS III',
            isDefault: true
        },
        {
            id: 'unit_caps_ad_gutemberg',
            name: 'CAPS AD Dr. Gutemberg de Almeida',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751.\\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'CAPS AD',
            isDefault: false
        },
        {
            id: 'unit_caps1_osvaldo',
            name: 'CAPS I Osvaldo Brasileiro Franco',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751.\\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'CAPS I',
            isDefault: false
        },
        {
            id: 'unit_caps2_silvio_luiz',
            name: 'CAPS II Dr. Silvio Luiz Santos Marques',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751.\\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'CAPS II',
            isDefault: false
        },
        {
            id: 'unit_caps2_oscar_marques',
            name: 'CAPS II Oscar Marques',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751.\\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'CAPS II',
            isDefault: false
        },
        {
            id: 'unit_hosp_olindina',
            name: 'Hospital Municipal Maria Socorro Narciso Coelho',
            sub: 'Prefeitura Municipal de Olindina',
            addr: 'R. Princesa Isabel, s/n, Olindina - BA.\\nTelefone: (75) 99939-6441',
            city: 'Olindina - BA',
            cnes: '',
            tel: '(75) 99939-6441',
            logoPref: 'unibrasil_saude.jpeg',
            logoFarm: 'prefeitura_olindina.jpeg',
            badge: 'Hospital / Olindina',
            isDefault: false
        }
    ];

    // 2. BANCO DE DADOS INTELIGENTE COM RESET EXCLUSIVO DE CATÁLOGO
    App.UnitsDB = {
        CURATED_DEFAULTS: CURATED_DEFAULT_UNITS,

        get() {
            const CATALOG_VERSION = 'v20261012_custom_units_clean_6';
            const currentVersion = localStorage.getItem('cerebrum_units_catalog_v');

            // Se for versão anterior, limpa tudo e define exatamente as 6 unidades solicitadas
            if (currentVersion !== CATALOG_VERSION) {
                const cleanList = JSON.parse(JSON.stringify(CURATED_DEFAULT_UNITS));
                localStorage.setItem('cerebrum_global_units_db', JSON.stringify(cleanList));
                localStorage.setItem('cerebrum_units_catalog_v', CATALOG_VERSION);

                const activeId = localStorage.getItem('cerebrum_active_unit_id');
                if (!cleanList.some(u => u.id === activeId)) {
                    localStorage.setItem('cerebrum_active_unit_id', 'unit_caps3_joao_carlos');
                }
                return cleanList;
            }

            let list = null;
            try {
                const db = localStorage.getItem('cerebrum_global_units_db');
                if (db) list = JSON.parse(db);
            } catch (e) {}

            if (!Array.isArray(list) || list.length === 0) {
                list = JSON.parse(JSON.stringify(CURATED_DEFAULT_UNITS));
                localStorage.setItem('cerebrum_global_units_db', JSON.stringify(list));
                localStorage.setItem('cerebrum_units_catalog_v', CATALOG_VERSION);
                return list;
            }

            return list;
        },`;

const startMarker = `    // 1. CATÁLOGO CURADO DE UNIDADES DE SAÚDE`;
const endMarker = `        save(data) {`;

const idx1 = cleanBlock.indexOf(startMarker);
const idx2 = cleanBlock.indexOf(endMarker);

if (idx1 === -1 || idx2 === -1) {
    console.error('Could not find catalog markers in clean_block.js! idx1:', idx1, 'idx2:', idx2);
    process.exit(1);
}

cleanBlock = cleanBlock.slice(0, idx1) + newCatalogSection + '\n\n' + cleanBlock.slice(idx2);
console.log('Successfully replaced catalog section in clean_block.js');

// 2. Update default button handlers in renderEditor to handle Olindina
const oldDefaultPref = `if (btnDefaultPref) {
                btnDefaultPref.onclick = () => {
                    tempLogoPref = 'prefeitura.png';
                    if (previewPrefBox) previewPrefBox.innerHTML = \`<img id="ue-img-pref" class="up-logo-thumb-img" src="\${tempLogoPref}" alt="Logo Pref">\`;
                    updateSimulator();
                };
            }`;

const newDefaultPref = `if (btnDefaultPref) {
                btnDefaultPref.onclick = () => {
                    tempLogoPref = (unitObj && unitObj.id === 'unit_hosp_olindina') ? 'unibrasil_saude.jpeg' : 'prefeitura.png';
                    if (previewPrefBox) previewPrefBox.innerHTML = \`<img id="ue-img-pref" class="up-logo-thumb-img" src="\${tempLogoPref}" alt="Logo Pref">\`;
                    updateSimulator();
                };
            }`;

const oldDefaultFarm = `if (btnDefaultFarm) {
                btnDefaultFarm.onclick = () => {
                    tempLogoFarm = 'farmacia.png';
                    if (previewFarmBox) previewFarmBox.innerHTML = \`<img id="ue-img-farm" class="up-logo-thumb-img" src="\${tempLogoFarm}" alt="Logo Farm">\`;
                    updateSimulator();
                };
            }`;

const newDefaultFarm = `if (btnDefaultFarm) {
                btnDefaultFarm.onclick = () => {
                    tempLogoFarm = (unitObj && unitObj.id === 'unit_hosp_olindina') ? 'prefeitura_olindina.jpeg' : 'farmacia.png';
                    if (previewFarmBox) previewFarmBox.innerHTML = \`<img id="ue-img-farm" class="up-logo-thumb-img" src="\${tempLogoFarm}" alt="Logo Farm">\`;
                    updateSimulator();
                };
            }`;

if (cleanBlock.includes(oldDefaultPref)) {
    cleanBlock = cleanBlock.replace(oldDefaultPref, newDefaultPref);
    console.log('Replaced btnDefaultPref');
}
if (cleanBlock.includes(oldDefaultFarm)) {
    cleanBlock = cleanBlock.replace(oldDefaultFarm, newDefaultFarm);
    console.log('Replaced btnDefaultFarm');
}

fs.writeFileSync('scratch/clean_block.js', cleanBlock, 'utf8');
console.log('Updated scratch/clean_block.js');

// 3. Now apply clean_block.js into script.js
let js = fs.readFileSync('script.js', 'utf8');

const v6000Header = '// =========================================================================\r\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';
const v6000HeaderUnix = '// =========================================================================\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';

let idxStart = js.indexOf(v6000Header);
if (idxStart === -1) idxStart = js.indexOf(v6000HeaderUnix);

const v4500Header = '// =========================================================================\r\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';
const v4500HeaderUnix = '// =========================================================================\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';

let idxEnd = js.indexOf(v4500Header);
if (idxEnd === -1) idxEnd = js.indexOf(v4500HeaderUnix);

console.log('Splice script.js: idxStart:', idxStart, 'idxEnd:', idxEnd);
if (idxStart === -1 || idxEnd === -1) {
    console.error('Markers not found in script.js!');
    process.exit(1);
}

js = js.slice(0, idxStart) + cleanBlock + '\n\n' + js.slice(idxEnd);

// Also make sure the background radar interval in Patch V5000 supports any logos on the active unit
const oldRadarPref = `document.querySelectorAll('#preview-container img[src*="prefeitura"], .rx-paper img[src*="prefeitura"]').forEach(img => {`;
const newRadarPref = `document.querySelectorAll('#preview-container .header-mini > img:first-child, .rx-paper .header-mini > img:first-child').forEach(img => {`;

const oldRadarFarm = `document.querySelectorAll('#preview-container img[src*="farmacia"], .rx-paper img[src*="farmacia"]').forEach(img => {`;
const newRadarFarm = `document.querySelectorAll('#preview-container .header-mini > img:last-child, .rx-paper .header-mini > img:last-child').forEach(img => {`;

if (js.includes(oldRadarPref)) {
    js = js.replace(oldRadarPref, newRadarPref);
    console.log('Updated radar pref selector to first-child');
}
if (js.includes(oldRadarFarm)) {
    js = js.replace(oldRadarFarm, newRadarFarm);
    console.log('Updated radar farm selector to last-child');
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('Successfully written script.js!');
