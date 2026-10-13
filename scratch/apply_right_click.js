const fs = require('fs');

let cleanBlock = fs.readFileSync('scratch/clean_block.js', 'utf8');

// 1. Remove "- BA" from Olindina in clean_block.js
const oldOlindina = `        {
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
        }`;

const newOlindina = `        {
            id: 'unit_hosp_olindina',
            name: 'Hospital Municipal Maria Socorro Narciso Coelho',
            sub: 'Prefeitura Municipal de Olindina',
            addr: 'R. Princesa Isabel, s/n, Olindina.\\nTelefone: (75) 99939-6441',
            city: 'Olindina',
            cnes: '',
            tel: '(75) 99939-6441',
            logoPref: 'unibrasil_saude.jpeg',
            logoFarm: 'prefeitura_olindina.jpeg',
            badge: 'Hospital / Olindina',
            isDefault: false
        }`;

if (cleanBlock.includes(oldOlindina)) {
    cleanBlock = cleanBlock.replace(oldOlindina, newOlindina);
    console.log('1. Removed - BA from Olindina unit definition');
} else {
    console.warn('1. Old Olindina block not found exactly, doing replace on fields...');
    cleanBlock = cleanBlock.replace(
        "addr: 'R. Princesa Isabel, s/n, Olindina - BA.\\nTelefone: (75) 99939-6441'",
        "addr: 'R. Princesa Isabel, s/n, Olindina.\\nTelefone: (75) 99939-6441'"
    ).replace(
        "city: 'Olindina - BA'",
        "city: 'Olindina'"
    );
}

// 2. Bump CATALOG_VERSION in UnitsDB.get() to force fresh load of clean 6 units without - BA
cleanBlock = cleanBlock.replace(
    "const CATALOG_VERSION = 'v20261012_custom_units_clean_6';",
    "const CATALOG_VERSION = 'v20261012_olindina_no_ba';"
);

// 3. Replace the left-click listener with the new right-click context menu (Apple Style)
const oldClickHeader = `    // 6. CABEÇALHO DO RECEITUÁRIO CLICÁVEL (Clique direto na receita abre o seletor)
    document.addEventListener('click', function(e) {
        const headerEl = e.target.closest('#preview-container .header-mini, #preview-container .header-text-center');
        if (headerEl) {
            e.preventDefault();
            e.stopPropagation();
            if (window.App && typeof window.App.openUnitPortal === 'function') {
                window.App.openUnitPortal('list');
            }
        }
    });`;

const newRightClickHeader = `    // 6. MENU DE CONTEXTO APPLE NO BOTÃO DIREITO DO CABEÇALHO DA RECEITA
    App.showUnitContextMenu = function(x, y) {
        let menu = document.getElementById('unit-context-menu');
        if (menu) menu.remove();

        const units = (App.UnitsDB && typeof App.UnitsDB.get === 'function') ? App.UnitsDB.get() : [];
        const activeId = (App.UnitsDB && typeof App.UnitsDB.getActive === 'function') ? App.UnitsDB.getActive() : null;
        const activeUnit = units.find(u => u.id === activeId) || units[0] || {};

        menu = document.createElement('div');
        menu.id = 'unit-context-menu';
        menu.className = 'unit-context-menu';

        const unitsHtml = units.map(u => {
            const isActive = u.id === activeId;
            return \`
                <button type="button" class="ucm-item \${isActive ? 'is-active' : ''}" onclick="event.stopPropagation(); (window.App||App).setGlobalActiveUnit('\${u.id}'); (window.App||App).closeUnitContextMenu();">
                    <span class="ucm-item-icon">
                        \${isActive ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<span style="font-size:8px; opacity:0.4;">●</span>'}
                    </span>
                    <span class="ucm-item-name" title="\${u.name}">\${u.name}</span>
                </button>
            \`;
        }).join('');

        menu.innerHTML = \`
            <div class="ucm-header">
                <span class="ucm-title">CABEÇALHO DA RECEITA</span>
                <span class="ucm-active-name">\${activeUnit.name || 'Unidade de Atendimento'}</span>
            </div>
            <div class="ucm-divider"></div>
            <div class="ucm-section-label">Trocar de Unidade</div>
            \${unitsHtml}
            <div class="ucm-divider"></div>
            <button type="button" class="ucm-item" onclick="event.stopPropagation(); (window.App||App).closeUnitContextMenu(); (window.App||App).openUnitPortal('list');">
                <span class="ucm-item-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </span>
                <span class="ucm-item-name">Ver Todas / Buscar Unidades...</span>
            </button>
            <button type="button" class="ucm-item" onclick="event.stopPropagation(); (window.App||App).closeUnitContextMenu(); (window.App||App).openUnitPortal('edit', '\${activeUnit.id}');">
                <span class="ucm-item-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </span>
                <span class="ucm-item-name">Editar Dados desta Unidade...</span>
            </button>
            <button type="button" class="ucm-item" onclick="event.stopPropagation(); (window.App||App).closeUnitContextMenu(); (window.App||App).openUnitPortal('new');">
                <span class="ucm-item-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </span>
                <span class="ucm-item-name">Cadastrar Nova Unidade...</span>
            </button>
        \`;

        document.body.appendChild(menu);

        const menuRect = menu.getBoundingClientRect();
        const padding = 12;
        let posX = x;
        let posY = y;

        if (posX + menuRect.width > window.innerWidth - padding) {
            posX = window.innerWidth - menuRect.width - padding;
        }
        if (posY + menuRect.height > window.innerHeight - padding) {
            posY = window.innerHeight - menuRect.height - padding;
        }
        if (posX < padding) posX = padding;
        if (posY < padding) posY = padding;

        menu.style.left = posX + 'px';
        menu.style.top = posY + 'px';
    };

    App.closeUnitContextMenu = function() {
        const menu = document.getElementById('unit-context-menu');
        if (menu) menu.remove();
    };

    document.addEventListener('click', function(e) {
        const menu = document.getElementById('unit-context-menu');
        if (menu && !menu.contains(e.target)) {
            menu.remove();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            App.closeUnitContextMenu();
        }
    });

    document.addEventListener('contextmenu', function(e) {
        const headerEl = e.target.closest('#preview-container .header-mini, #preview-container .header-text-center, .rx-paper .header-mini, .header-mini');
        if (headerEl) {
            e.preventDefault();
            e.stopPropagation();
            App.showUnitContextMenu(e.clientX, e.clientY);
        }
    });`;

if (cleanBlock.includes(oldClickHeader)) {
    cleanBlock = cleanBlock.replace(oldClickHeader, newRightClickHeader);
    console.log('2. Replaced old click listener with right-click context menu');
} else {
    console.warn('2. oldClickHeader not found exactly, checking alternatives...');
}

fs.writeFileSync('scratch/clean_block.js', cleanBlock, 'utf8');
console.log('Saved scratch/clean_block.js');

// 4. Splice updated clean_block.js into script.js
let js = fs.readFileSync('script.js', 'utf8');

const v6000Header = '// =========================================================================\r\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';
const v6000HeaderUnix = '// =========================================================================\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';

let idxStart = js.indexOf(v6000Header);
if (idxStart === -1) idxStart = js.indexOf(v6000HeaderUnix);

const v4500Header = '// =========================================================================\r\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';
const v4500HeaderUnix = '// =========================================================================\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';

let idxEnd = js.indexOf(v4500Header);
if (idxEnd === -1) idxEnd = js.indexOf(v4500HeaderUnix);

if (idxStart === -1 || idxEnd === -1) {
    console.error('Markers not found in script.js!');
    process.exit(1);
}

js = js.slice(0, idxStart) + cleanBlock + '\n\n' + js.slice(idxEnd);

// Also update any Olindina address in other sections if present
js = js.replace(
    /R\. Princesa Isabel, s\/n, Olindina - BA\./g,
    'R. Princesa Isabel, s/n, Olindina.'
);

fs.writeFileSync('script.js', js, 'utf8');
console.log('Successfully written script.js!');
