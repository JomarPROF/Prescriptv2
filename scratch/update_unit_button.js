const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

const targetOldSelectorCSSAndFn = `    // 2. CSS DO SELETOR INTEGRADO NO LOGIN
    const styleId = 'integrated-unit-selector-css';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = \`
            #integrated-unit-selector {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.95) 100%) !important;
                border: 1px solid rgba(56, 189, 248, 0.35) !important;
                border-radius: 18px !important;
                padding: 12px 20px !important;
                width: 100% !important;
                max-width: 440px !important;
                margin: 0 auto 24px auto !important;
                cursor: pointer !important;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
                box-shadow: 0 10px 30px -5px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1) !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
                z-index: 100 !important;
                pointer-events: auto !important;
                user-select: none !important;
                box-sizing: border-box !important;
            }
            #integrated-unit-selector:hover {
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%) !important;
                border-color: #38bdf8 !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 14px 35px rgba(0,0,0,0.7), 0 0 25px rgba(56, 189, 248, 0.3) !important;
            }
            #integrated-unit-selector:active {
                transform: translateY(1px) scale(0.98) !important;
            }
            .ius-icon {
                font-size: 20px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(56, 189, 248, 0.15) !important;
                border: 1px solid rgba(56, 189, 248, 0.3) !important;
                width: 40px !important;
                height: 40px !important;
                border-radius: 12px !important;
                margin-right: 14px !important;
                flex-shrink: 0 !important;
                color: #38bdf8 !important;
            }
            .ius-texts {
                text-align: left !important;
                flex: 1 !important;
                min-width: 0 !important;
            }
            .ius-label {
                font-size: 9.5px !important;
                color: #38bdf8 !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.8px !important;
                margin-bottom: 2px !important;
            }
            .ius-value {
                font-size: 13.5px !important;
                color: #f8fafc !important;
                font-weight: 800 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-width: 230px !important;
            }
            .ius-btn {
                background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%) !important;
                color: #ffffff !important;
                font-size: 11px !important;
                font-weight: 800 !important;
                padding: 8px 16px !important;
                border-radius: 10px !important;
                text-transform: uppercase !important;
                letter-spacing: 0.6px !important;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                cursor: pointer !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35) !important;
                flex-shrink: 0 !important;
            }
            .ius-btn:hover {
                background: linear-gradient(135deg, #0369a1 0%, #38bdf8 100%) !important;
                box-shadow: 0 6px 18px rgba(56, 189, 248, 0.5) !important;
                transform: scale(1.04) !important;
            }
        \`;
        document.head.appendChild(style);
    }

    // 3. FUNÇÃO PARA DESENHAR O BOTÃO DENTRO DA ÁREA DE PERFIS
    App.injectIntegratedUnitSelector = function() {
        const wrapper = document.getElementById('local-profiles-wrapper');
        if (!wrapper) return;

        const banner = document.getElementById('global-unit-banner');
        if (banner) banner.remove();

        const floatingHud = document.getElementById('live-unit-hud-wrap');
        if (floatingHud) floatingHud.remove();

        wrapper.querySelectorAll('.apple-label, .unit-filter-container').forEach(el => {
            el.style.display = 'none';
        });

        let selector = document.getElementById('integrated-unit-selector');
        if (!selector) {
            selector = document.createElement('div');
            selector.id = 'integrated-unit-selector';
            const carousel = wrapper.querySelector('.apple-carousel-area');
            if (carousel) {
                carousel.parentNode.insertBefore(selector, carousel);
            } else {
                wrapper.appendChild(selector);
            }
        }

        const units = (App.UnitsDB && typeof App.UnitsDB.get === 'function') ? App.UnitsDB.get() : [];
        const activeId = (App.UnitsDB && typeof App.UnitsDB.getActive === 'function') ? App.UnitsDB.getActive() : null;
        const activeUnit = units.find(u => u.id === activeId) || units[0] || { name: 'CAPS III Dr. João Carlos Lopes Cavalcante' };

        selector.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.App && typeof window.App.openUnitPortal === 'function') {
                window.App.openUnitPortal('list');
            } else if (typeof App !== 'undefined' && typeof App.openUnitPortal === 'function') {
                App.openUnitPortal('list');
            }
        };

        selector.innerHTML = \`
            <div style="display: flex; align-items: center; max-width: 70%; pointer-events: none;">
                <div class="ius-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path>
                        <path d="M10 9h4"></path>
                        <path d="M12 7v4"></path>
                    </svg>
                </div>
                <div class="ius-texts">
                    <div class="ius-label">Unidade de Atendimento</div>
                    <div class="ius-value">\${activeUnit.name}</div>
                </div>
            </div>
            <button type="button" class="ius-btn" onclick="event.stopPropagation(); (window.App||App).openUnitPortal('list');">Trocar</button>
        \`;
    };`;

const replacementNewSelector = `    // 2. CSS DO SELETOR INTEGRADO NO LOGIN (MINIMALISTA APPLE / COMPACTO / DISCRETO)
    const styleId = 'integrated-unit-selector-css';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = \`
        #integrated-unit-selector {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(15, 23, 42, 0.65) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            border-radius: 999px !important;
            padding: 5px 12px 5px 8px !important;
            width: auto !important;
            max-width: 380px !important;
            margin: 0 auto 16px auto !important;
            cursor: pointer !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
            z-index: 100 !important;
            pointer-events: auto !important;
            user-select: none !important;
            box-sizing: border-box !important;
        }
        #integrated-unit-selector:hover {
            background: rgba(30, 41, 59, 0.85) !important;
            border-color: rgba(56, 189, 248, 0.4) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), 0 0 12px rgba(56, 189, 248, 0.12) !important;
        }
        #integrated-unit-selector:active {
            transform: translateY(1px) scale(0.98) !important;
        }
        .ius-pill-inner {
            display: flex !important;
            align-items: center !important;
            gap: 7px !important;
            min-width: 0 !important;
        }
        .ius-icon-circle {
            width: 22px !important;
            height: 22px !important;
            border-radius: 50% !important;
            background: rgba(56, 189, 248, 0.12) !important;
            border: 1px solid rgba(56, 189, 248, 0.25) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
            color: #38bdf8 !important;
        }
        .ius-text-group {
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
            min-width: 0 !important;
        }
        .ius-tag {
            font-size: 9.5px !important;
            font-weight: 700 !important;
            color: #38bdf8 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.6px !important;
            white-space: nowrap !important;
        }
        .ius-dot {
            font-size: 8px !important;
            color: rgba(255, 255, 255, 0.3) !important;
        }
        .ius-unit-name {
            font-size: 12px !important;
            font-weight: 600 !important;
            color: #f1f5f9 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            max-width: 200px !important;
        }
        .ius-action-link {
            display: inline-flex !important;
            align-items: center !important;
            gap: 3px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            color: #94a3b8 !important;
            margin-left: 6px !important;
            padding-left: 8px !important;
            border-left: 1px solid rgba(255, 255, 255, 0.12) !important;
            white-space: nowrap !important;
            transition: color 0.15s ease !important;
        }
        #integrated-unit-selector:hover .ius-action-link {
            color: #38bdf8 !important;
        }
    \`;

    // 3. FUNÇÃO PARA DESENHAR O BOTÃO COMPACTO DENTRO DA ÁREA DE PERFIS
    App.injectIntegratedUnitSelector = function() {
        const wrapper = document.getElementById('local-profiles-wrapper');
        if (!wrapper) return;

        const banner = document.getElementById('global-unit-banner');
        if (banner) banner.remove();

        const floatingHud = document.getElementById('live-unit-hud-wrap');
        if (floatingHud) floatingHud.remove();

        wrapper.querySelectorAll('.apple-label, .unit-filter-container').forEach(el => {
            el.style.display = 'none';
        });

        let selector = document.getElementById('integrated-unit-selector');
        if (!selector) {
            selector = document.createElement('div');
            selector.id = 'integrated-unit-selector';
            selector.setAttribute('role', 'button');
            selector.setAttribute('tabindex', '0');
            const carousel = wrapper.querySelector('.apple-carousel-area');
            if (carousel) {
                carousel.parentNode.insertBefore(selector, carousel);
            } else {
                wrapper.appendChild(selector);
            }
        }

        const units = (App.UnitsDB && typeof App.UnitsDB.get === 'function') ? App.UnitsDB.get() : [];
        const activeId = (App.UnitsDB && typeof App.UnitsDB.getActive === 'function') ? App.UnitsDB.getActive() : null;
        const activeUnit = units.find(u => u.id === activeId) || units[0] || { name: 'CAPS III Dr. João Carlos Lopes Cavalcante' };

        selector.title = 'Unidade ativa: ' + activeUnit.name + ' (Clique para trocar)';
        selector.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.App && typeof window.App.openUnitPortal === 'function') {
                window.App.openUnitPortal('list');
            } else if (typeof App !== 'undefined' && typeof App.openUnitPortal === 'function') {
                App.openUnitPortal('list');
            }
        };

        selector.innerHTML = \`
            <div class="ius-pill-inner">
                <div class="ius-icon-circle">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18"></path>
                        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                        <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path>
                        <path d="M10 9h4"></path>
                        <path d="M12 7v4"></path>
                    </svg>
                </div>
                <div class="ius-text-group">
                    <span class="ius-tag">Unidade</span>
                    <span class="ius-dot">•</span>
                    <span class="ius-unit-name" title="\${activeUnit.name}">\${activeUnit.name}</span>
                </div>
                <span class="ius-action-link">
                    <span>Alternar</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
            </div>
        \`;
    };`;

if (!scriptContent.includes(targetOldSelectorCSSAndFn)) {
    console.error('Target not found in script.js!');
    process.exit(1);
}

scriptContent = scriptContent.replace(targetOldSelectorCSSAndFn, replacementNewSelector);
fs.writeFileSync(scriptPath, scriptContent, 'utf8');
console.log('Successfully updated integrated unit selector in script.js');
