const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
const cleanBlockPath = path.join(__dirname, 'clean_block.js');

let scriptContent = fs.readFileSync(scriptPath, 'utf8');
let cleanContent = fs.readFileSync(cleanBlockPath, 'utf8');

console.log('Script size before:', scriptContent.length);

// ============================================================
// 1. In applyActiveUnit: avoid clashing selectors & unnecessary reassignments
// ============================================================
const targetApply = `        // D. Atualização direta do DOM nos cabeçalhos já renderizados
        // Lado Esquerdo (Prefeitura / Brasão)
        document.querySelectorAll('img[src*="prefeitura"], img.logo-img:first-child, .header-mini > div:first-child').forEach(el => {
            if (el.tagName === 'IMG') {
                if (activeUnit.logoPref) {
                    el.src = activeUnit.logoPref;
                    el.style.display = 'inline-block';
                    el.style.opacity = '1';
                } else {
                    el.style.display = 'none';
                }
            } else if (el.style) {
                if (activeUnit.logoPref) {
                    el.style.backgroundImage = \`url("\${activeUnit.logoPref}")\`;
                    el.style.display = 'block';
                } else {
                    el.style.backgroundImage = 'none';
                }
            }
        });

        // Lado Direito (Farmácia / SUS / Clínica)
        document.querySelectorAll('img[src*="farmacia"], img.logo-img:last-child, .header-mini > div:last-child').forEach(el => {
            if (el.tagName === 'IMG') {
                if (activeUnit.logoFarm) {
                    el.src = activeUnit.logoFarm;
                    el.style.display = 'inline-block';
                    el.style.opacity = '1';
                } else {
                    el.style.display = 'none';
                }
            } else if (el.style) {
                if (activeUnit.logoFarm) {
                    el.style.backgroundImage = \`url("\${activeUnit.logoFarm}")\`;
                    el.style.display = 'block';
                } else {
                    el.style.backgroundImage = 'none';
                }
            }
        });`;

const replacementApply = `        // D. Atualização direta do DOM nos cabeçalhos já renderizados (Sem conflito cruzado entre logos)
        const isLogoMatch = (imgEl, targetSrc) => {
            if (!imgEl || !targetSrc) return false;
            const curAttr = imgEl.getAttribute('src') || '';
            const curSrc = imgEl.src || '';
            return curAttr === targetSrc || curSrc === targetSrc || curSrc.endsWith('/' + targetSrc) || curSrc.endsWith('/' + encodeURI(targetSrc));
        };

        // Lado Esquerdo (Prefeitura / Brasão / UniBrasil)
        document.querySelectorAll('#preview-container .header-mini > img:first-child, .rx-paper .header-mini > img:first-child, .header-mini > .logo-img-left, .header-mini > div:first-child').forEach(el => {
            if (el.tagName === 'IMG') {
                if (activeUnit.logoPref) {
                    if (!isLogoMatch(el, activeUnit.logoPref)) el.src = activeUnit.logoPref;
                    el.style.display = 'inline-block';
                    el.style.opacity = '1';
                } else {
                    el.style.display = 'none';
                }
            } else if (el.style) {
                if (activeUnit.logoPref) {
                    el.style.backgroundImage = \`url("\${activeUnit.logoPref}")\`;
                    el.style.display = 'block';
                } else {
                    el.style.backgroundImage = 'none';
                }
            }
        });

        // Lado Direito (Farmácia / SUS / Prefeitura Olindina)
        document.querySelectorAll('#preview-container .header-mini > img:last-child, .rx-paper .header-mini > img:last-child, .header-mini > .logo-img-right, .header-mini > div:last-child').forEach(el => {
            if (el.tagName === 'IMG') {
                if (activeUnit.logoFarm) {
                    if (!isLogoMatch(el, activeUnit.logoFarm)) el.src = activeUnit.logoFarm;
                    el.style.display = 'inline-block';
                    el.style.opacity = '1';
                } else {
                    el.style.display = 'none';
                }
            } else if (el.style) {
                if (activeUnit.logoFarm) {
                    el.style.backgroundImage = \`url("\${activeUnit.logoFarm}")\`;
                    el.style.display = 'block';
                } else {
                    el.style.backgroundImage = 'none';
                }
            }
        });`;

if (!scriptContent.includes(targetApply)) {
    console.error('Error: targetApply not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetApply, replacementApply);
if (cleanContent.includes(targetApply)) {
    cleanContent = cleanContent.replace(targetApply, replacementApply);
}
console.log('1. applyActiveUnit patched');

// ============================================================
// 2. In App.render hook: avoid querying img[src*="prefeitura"]
// ============================================================
const targetRenderHook = `        const activeUnit = App.UnitsDB.getActiveUnit();
        if (activeUnit) {
            setTimeout(() => {
                if (activeUnit.logoPref) {
                    document.querySelectorAll('img[src*="prefeitura"]').forEach(img => img.src = activeUnit.logoPref);
                }
                if (activeUnit.logoFarm) {
                    document.querySelectorAll('img[src*="farmacia"]').forEach(img => img.src = activeUnit.logoFarm);
                }
                App.injectLiveUnitPill(); // Garante remoção de pílulas antigas
            }, 50);
        }`;

const replacementRenderHook = `        const activeUnit = App.UnitsDB.getActiveUnit();
        if (activeUnit) {
            setTimeout(() => {
                const lp = activeUnit.logoPref || 'prefeitura.png';
                const lf = activeUnit.logoFarm || 'farmacia.png';
                document.querySelectorAll('#preview-container .header-mini > img:first-child, .rx-paper .header-mini > img:first-child, .header-mini > .logo-img-left').forEach(img => {
                    const c = img.src || '';
                    if (!c.endsWith(lp) && !c.endsWith(encodeURI(lp))) img.src = lp;
                    img.style.opacity = '1';
                    img.style.display = 'inline-block';
                });
                document.querySelectorAll('#preview-container .header-mini > img:last-child, .rx-paper .header-mini > img:last-child, .header-mini > .logo-img-right').forEach(img => {
                    const c = img.src || '';
                    if (!c.endsWith(lf) && !c.endsWith(encodeURI(lf))) img.src = lf;
                    img.style.opacity = '1';
                    img.style.display = 'inline-block';
                });
                App.injectLiveUnitPill(); // Garante remoção de pílulas antigas
            }, 50);
        }`;

if (!scriptContent.includes(targetRenderHook)) {
    console.error('Error: targetRenderHook not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetRenderHook, replacementRenderHook);
if (cleanContent.includes(targetRenderHook)) {
    cleanContent = cleanContent.replace(targetRenderHook, replacementRenderHook);
}
console.log('2. renderHook patched');

// ============================================================
// 3. In Radar Patch V5000: avoid infinite reload flicker and opacity transition
// ============================================================
const targetRadar = `    const styleId = 'logo-proportions-css';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = \`
            #preview-container .header-mini img,
            #preview-container img[src*="prefeitura"],
            #preview-container img[src*="farmacia"],
            .rx-paper .header-mini img {
                object-fit: contain !important;
                max-width: 140px !important;
                max-height: 55px !important;
                transition: opacity 0.3s ease;
            }
        \`;
        document.head.appendChild(style);
    }

    // 2. O MOTOR DO RADAR (Roda a cada 400 milissegundos)
    setInterval(() => {
        try {
            // A. Tenta puxar a unidade atual gravada na memória RAM do navegador
            let units = [];
            let activeId = 'unit_default';
            
            const dbStr = localStorage.getItem('cerebrum_global_units_db');
            if (dbStr) units = JSON.parse(dbStr);
            
            const activeStr = localStorage.getItem('cerebrum_active_unit_id');
            if (activeStr) activeId = activeStr;

            // Encontra os dados da unidade (Nomes e Imagens em Base64)
            const activeUnit = units.find(u => u.id === activeId) || units[0];
            if (!activeUnit) return;

            // B. CAÇA AS IMAGENS DA ESQUERDA (Prefeitura)
            document.querySelectorAll('#preview-container .header-mini > img:first-child, .rx-paper .header-mini > img:first-child').forEach(img => {
                if (activeUnit.logoPref) {
                    // Se a unidade tem uma foto customizada, injeta-a à força!
                    if (img.src !== activeUnit.logoPref) {
                        img.src = activeUnit.logoPref;
                    }
                    img.style.opacity = '1';
                    img.style.display = 'inline-block';
                } else {
                    // Se NÃO tem foto customizada, esconde o ícone de "imagem quebrada" caso o arquivo .png não exista no seu PC
                    img.onerror = function() { this.style.opacity = '0'; };
                }
            });

            // C. CAÇA AS IMAGENS DA DIREITA (Clínica / Farmácia)
            document.querySelectorAll('#preview-container .header-mini > img:last-child, .rx-paper .header-mini > img:last-child').forEach(img => {
                if (activeUnit.logoFarm) {
                    if (img.src !== activeUnit.logoFarm) {
                        img.src = activeUnit.logoFarm;
                    }
                    img.style.opacity = '1';
                    img.style.display = 'inline-block';
                } else {
                    img.onerror = function() { this.style.opacity = '0'; };
                }
            });
            
        } catch (e) {
            // Failsafe silencioso para não poluir a consola
        }
    }, 400);`;

const replacementRadar = `    const styleId = 'logo-proportions-css';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = \`
            #preview-container .header-mini img,
            .rx-paper .header-mini img {
                object-fit: contain !important;
                max-width: 140px !important;
                max-height: 55px !important;
            }
        \`;
        document.head.appendChild(style);
    }

    // 2. O MOTOR DO RADAR (Roda a cada 400 milissegundos com comparação exata para evitar recargas e piscar)
    const isRadarMatch = (imgEl, targetSrc) => {
        if (!imgEl || !targetSrc) return false;
        const curAttr = imgEl.getAttribute('src') || '';
        const curSrc = imgEl.src || '';
        return curAttr === targetSrc || curSrc === targetSrc || curSrc.endsWith('/' + targetSrc) || curSrc.endsWith('/' + encodeURI(targetSrc));
    };

    setInterval(() => {
        try {
            let activeUnit = null;
            if (window.App && window.App.UnitsDB && typeof window.App.UnitsDB.getActiveUnit === 'function') {
                activeUnit = window.App.UnitsDB.getActiveUnit();
            } else {
                let units = [];
                let activeId = 'unit_default';
                const dbStr = localStorage.getItem('cerebrum_global_units_db');
                if (dbStr) units = JSON.parse(dbStr);
                const activeStr = localStorage.getItem('cerebrum_active_unit_id');
                if (activeStr) activeId = activeStr;
                activeUnit = units.find(u => u.id === activeId) || units[0];
            }
            if (!activeUnit) return;

            // B. CAÇA AS IMAGENS DA ESQUERDA (Prefeitura / UniBrasil)
            document.querySelectorAll('#preview-container .header-mini > img:first-child, .rx-paper .header-mini > img:first-child, .header-mini > .logo-img-left').forEach(img => {
                if (activeUnit.logoPref) {
                    if (!isRadarMatch(img, activeUnit.logoPref)) {
                        img.src = activeUnit.logoPref;
                    }
                    img.style.opacity = '1';
                    img.style.display = 'inline-block';
                } else {
                    img.onerror = function() { this.style.opacity = '0'; };
                }
            });

            // C. CAÇA AS IMAGENS DA DIREITA (Clínica / Farmácia / Olindina)
            document.querySelectorAll('#preview-container .header-mini > img:last-child, .rx-paper .header-mini > img:last-child, .header-mini > .logo-img-right').forEach(img => {
                if (activeUnit.logoFarm) {
                    if (!isRadarMatch(img, activeUnit.logoFarm)) {
                        img.src = activeUnit.logoFarm;
                    }
                    img.style.opacity = '1';
                    img.style.display = 'inline-block';
                } else {
                    img.onerror = function() { this.style.opacity = '0'; };
                }
            });
            
        } catch (e) {
            // Failsafe silencioso para não poluir a consola
        }
    }, 400);`;

if (!scriptContent.includes(targetRadar)) {
    console.error('Error: targetRadar not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetRadar, replacementRadar);
console.log('3. radar patched');

// ============================================================
// 4. In masterPrescription: inject activeUnit logos directly
// ============================================================
const targetMasterPresc = `        const safeTitle = (this.config && this.config.title) ? this.config.title : '';
        const safeSub = (this.config && this.config.sub) ? \`<br>\${this.config.sub}\` : '';
        const safeAddr = (this.config && this.config.addr) ? \`<br>\${this.config.addr.replace(/\\n/g, '<br>')}\` : '';
        
        const headerHtml = \`<div class="header-mini" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:\${space}px;"><img src="prefeitura.png" class="logo-img" style="max-height:\${logoSize}px; object-fit:contain;"><div class="header-text-center" style="text-align:center; flex:1; font-size:\${headFont}px; line-height:1.0; color:#000; font-weight:normal;">\${safeTitle}\${safeSub}\${safeAddr}</div><img src="farmacia.png" class="logo-img" style="max-height:\${logoSize}px; object-fit:contain;"></div>\`;`;

const replacementMasterPresc = `        const safeTitle = (this.config && this.config.title) ? this.config.title : '';
        const safeSub = (this.config && this.config.sub) ? \`<br>\${this.config.sub}\` : '';
        const safeAddr = (this.config && this.config.addr) ? \`<br>\${this.config.addr.replace(/\\n/g, '<br>')}\` : '';
        
        let activeLogoPref = 'prefeitura.png';
        let activeLogoFarm = 'farmacia.png';
        try {
            const curUnit = (App.UnitsDB && typeof App.UnitsDB.getActiveUnit === 'function') ? App.UnitsDB.getActiveUnit() : null;
            if (curUnit) {
                if (curUnit.logoPref) activeLogoPref = curUnit.logoPref;
                if (curUnit.logoFarm) activeLogoFarm = curUnit.logoFarm;
            }
        } catch(e) {}

        const headerHtml = \`<div class="header-mini" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:\${space}px;"><img src="\${activeLogoPref}" class="logo-img logo-img-left" style="max-height:\${logoSize}px; object-fit:contain;"><div class="header-text-center" style="text-align:center; flex:1; font-size:\${headFont}px; line-height:1.0; color:#000; font-weight:normal;">\${safeTitle}\${safeSub}\${safeAddr}</div><img src="\${activeLogoFarm}" class="logo-img logo-img-right" style="max-height:\${logoSize}px; object-fit:contain;"></div>\`;`;

if (!scriptContent.includes(targetMasterPresc)) {
    console.error('Error: targetMasterPresc not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetMasterPresc, replacementMasterPresc);
console.log('4. masterPrescription patched');

// ============================================================
// 5. In masterSixMonth: inject activeUnit logos directly
// ============================================================
const targetMasterSix = `        const safeTitle = this.config && this.config.title ? this.config.title : '';
        const safeSub = this.config && this.config.sub ? '<br>' + this.config.sub : '';
        const safeAddr = this.config && this.config.addr ? '<br>' + this.config.addr.replace(/\\n/g, '<br>') : '';
        
        const headerHtml = \`<div class="header-mini" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:\${space}px;"><img src="prefeitura.png" class="logo-img" style="max-height:\${logoSize}px; object-fit:contain;"><div class="header-text-center" style="text-align:center; flex:1; font-size:\${headFont}px; line-height:1.0; color:#000; font-weight:normal;">\${safeTitle}\${safeSub}\${safeAddr}</div><img src="farmacia.png" class="logo-img" style="max-height:\${logoSize}px; object-fit:contain;"></div>\`;`;

const replacementMasterSix = `        const safeTitle = this.config && this.config.title ? this.config.title : '';
        const safeSub = this.config && this.config.sub ? '<br>' + this.config.sub : '';
        const safeAddr = this.config && this.config.addr ? '<br>' + this.config.addr.replace(/\\n/g, '<br>') : '';
        
        let activeLogoPrefSix = 'prefeitura.png';
        let activeLogoFarmSix = 'farmacia.png';
        try {
            const curUnit = (App.UnitsDB && typeof App.UnitsDB.getActiveUnit === 'function') ? App.UnitsDB.getActiveUnit() : null;
            if (curUnit) {
                if (curUnit.logoPref) activeLogoPrefSix = curUnit.logoPref;
                if (curUnit.logoFarm) activeLogoFarmSix = curUnit.logoFarm;
            }
        } catch(e) {}

        const headerHtml = \`<div class="header-mini" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:\${space}px;"><img src="\${activeLogoPrefSix}" class="logo-img logo-img-left" style="max-height:\${logoSize}px; object-fit:contain;"><div class="header-text-center" style="text-align:center; flex:1; font-size:\${headFont}px; line-height:1.0; color:#000; font-weight:normal;">\${safeTitle}\${safeSub}\${safeAddr}</div><img src="\${activeLogoFarmSix}" class="logo-img logo-img-right" style="max-height:\${logoSize}px; object-fit:contain;"></div>\`;`;

if (!scriptContent.includes(targetMasterSix)) {
    console.error('Error: targetMasterSix not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetMasterSix, replacementMasterSix);
console.log('5. masterSixMonth patched');

// ============================================================
// 6. In masterExams: inject activeUnit logos directly
// ============================================================
const targetMasterExams = `            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 5px; flex-shrink: 0;">
                <img src="prefeitura.png" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='prefeitura.jpg';}else{this.style.opacity=0;}">
                <div style="text-align: center; flex: 1; font-size: 11pt; line-height: 1.0; color: #000; padding: 0 15px; font-weight: normal;">
                    \${safeTitle}\${safeSub}\${safeAddr}
                </div>
                <img src="farmacia.png" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='farmacia.jpg';}else{this.style.opacity=0;}">
            </div>`;

const replacementMasterExams = `            let activeLogoPrefExam = 'prefeitura.png';
            let activeLogoFarmExam = 'farmacia.png';
            try {
                const curUnit = (App.UnitsDB && typeof App.UnitsDB.getActiveUnit === 'function') ? App.UnitsDB.getActiveUnit() : null;
                if (curUnit) {
                    if (curUnit.logoPref) activeLogoPrefExam = curUnit.logoPref;
                    if (curUnit.logoFarm) activeLogoFarmExam = curUnit.logoFarm;
                }
            } catch(e) {}

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 5px; flex-shrink: 0;">
                <img src="\${activeLogoPrefExam}" class="logo-img-left" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='prefeitura.jpg';}else{this.style.opacity=0;}">
                <div style="text-align: center; flex: 1; font-size: 11pt; line-height: 1.0; color: #000; padding: 0 15px; font-weight: normal;">
                    \${safeTitle}\${safeSub}\${safeAddr}
                </div>
                <img src="\${activeLogoFarmExam}" class="logo-img-right" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='farmacia.jpg';}else{this.style.opacity=0;}">
            </div>`;

// Wait, notice that targetMasterExams is INSIDE a template literal `let content = \`...`!
// So we cannot just insert JavaScript statement inside the template literal!
// The JavaScript statement let activeLogoPrefExam... must go BEFORE `let content = \``!
const targetMasterExamsBlock = `        const safeTitle = this.config && this.config.title ? this.config.title : '';
        const safeSub = this.config && this.config.sub ? '<br>' + this.config.sub : '';
        const safeAddr = this.config && this.config.addr ? '<br>' + this.config.addr.replace(/\\n/g, '<br>') : '';

        let content = \`
        <div style="width: 100%; height: 100%; padding: 18mm 30mm; display: flex; flex-direction: column; box-sizing: border-box; background: white; color: black; font-family: Arial, sans-serif;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 5px; flex-shrink: 0;">
                <img src="prefeitura.png" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='prefeitura.jpg';}else{this.style.opacity=0;}">
                <div style="text-align: center; flex: 1; font-size: 11pt; line-height: 1.0; color: #000; padding: 0 15px; font-weight: normal;">
                    \${safeTitle}\${safeSub}\${safeAddr}
                </div>
                <img src="farmacia.png" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='farmacia.jpg';}else{this.style.opacity=0;}">
            </div>`;

const replacementMasterExamsBlock = `        const safeTitle = this.config && this.config.title ? this.config.title : '';
        const safeSub = this.config && this.config.sub ? '<br>' + this.config.sub : '';
        const safeAddr = this.config && this.config.addr ? '<br>' + this.config.addr.replace(/\\n/g, '<br>') : '';

        let activeLogoPrefExam = 'prefeitura.png';
        let activeLogoFarmExam = 'farmacia.png';
        try {
            const curUnit = (App.UnitsDB && typeof App.UnitsDB.getActiveUnit === 'function') ? App.UnitsDB.getActiveUnit() : null;
            if (curUnit) {
                if (curUnit.logoPref) activeLogoPrefExam = curUnit.logoPref;
                if (curUnit.logoFarm) activeLogoFarmExam = curUnit.logoFarm;
            }
        } catch(e) {}

        let content = \`
        <div style="width: 100%; height: 100%; padding: 18mm 30mm; display: flex; flex-direction: column; box-sizing: border-box; background: white; color: black; font-family: Arial, sans-serif;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 5px; flex-shrink: 0;">
                <img src="\${activeLogoPrefExam}" class="logo-img-left" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='prefeitura.jpg';}else{this.style.opacity=0;}">
                <div style="text-align: center; flex: 1; font-size: 11pt; line-height: 1.0; color: #000; padding: 0 15px; font-weight: normal;">
                    \${safeTitle}\${safeSub}\${safeAddr}
                </div>
                <img src="\${activeLogoFarmExam}" class="logo-img-right" style="width: 3cm; height: 3cm; object-fit: contain;" onerror="if(this.src.includes('png')){this.src='farmacia.jpg';}else{this.style.opacity=0;}">
            </div>`;

if (!scriptContent.includes(targetMasterExamsBlock)) {
    console.error('Error: targetMasterExamsBlock not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetMasterExamsBlock, replacementMasterExamsBlock);
console.log('6. masterExams patched');

// ============================================================
// 7. In mySafeLogos (around line 23055): remove > 50 check
// ============================================================
const targetSafeLogos = `    // Função de resgate de Logos
    const mySafeLogos = () => {
        let l1 = 'prefeitura.png'; let l2 = 'farmacia.png';
        try {
            const activeId = localStorage.getItem('cerebrum_active_unit_id') || 'unit_default';
            const dbStr = localStorage.getItem('cerebrum_global_units_db');
            if (dbStr) {
                const units = JSON.parse(dbStr); const activeUnit = units.find(u => u.id === activeId) || units[0];
                if (activeUnit) { 
                    if (activeUnit.logoPref && activeUnit.logoPref.length > 50) l1 = activeUnit.logoPref; 
                    if (activeUnit.logoFarm && activeUnit.logoFarm.length > 50) l2 = activeUnit.logoFarm; 
                }
            }
        } catch(e) {}
        return { l1, l2 };
    };`;

const replacementSafeLogos = `    // Função de resgate de Logos
    const mySafeLogos = () => {
        let l1 = 'prefeitura.png'; let l2 = 'farmacia.png';
        try {
            const curUnit = (window.App && window.App.UnitsDB && typeof window.App.UnitsDB.getActiveUnit === 'function') ? window.App.UnitsDB.getActiveUnit() : null;
            if (curUnit) {
                if (curUnit.logoPref) l1 = curUnit.logoPref;
                if (curUnit.logoFarm) l2 = curUnit.logoFarm;
            } else {
                const activeId = localStorage.getItem('cerebrum_active_unit_id') || 'unit_default';
                const dbStr = localStorage.getItem('cerebrum_global_units_db');
                if (dbStr) {
                    const units = JSON.parse(dbStr); const activeUnit = units.find(u => u.id === activeId) || units[0];
                    if (activeUnit) { 
                        if (activeUnit.logoPref) l1 = activeUnit.logoPref; 
                        if (activeUnit.logoFarm) l2 = activeUnit.logoFarm; 
                    }
                }
            }
        } catch(e) {}
        return { l1, l2 };
    };`;

if (!scriptContent.includes(targetSafeLogos)) {
    console.error('Error: targetSafeLogos not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(targetSafeLogos, replacementSafeLogos);
console.log('7. mySafeLogos patched');

// ============================================================
// 8. In 5.5s override (around line 23755)
// ============================================================
const target5500Logos = `        let l1 = 'prefeitura.png'; let l2 = 'farmacia.png';
        try { const activeId = localStorage.getItem('cerebrum_active_unit_id'); const dbStr = localStorage.getItem('cerebrum_global_units_db'); if (dbStr) { const units = JSON.parse(dbStr); const activeUnit = units.find(u => u.id === activeId) || units[0]; if (activeUnit) { if (activeUnit.logoPref) l1 = activeUnit.logoPref; if (activeUnit.logoFarm) l2 = activeUnit.logoFarm; } } } catch(e) {}`;

const replacement5500Logos = `        let l1 = 'prefeitura.png'; let l2 = 'farmacia.png';
        try { 
            const curUnit = (window.App && window.App.UnitsDB && typeof window.App.UnitsDB.getActiveUnit === 'function') ? window.App.UnitsDB.getActiveUnit() : null;
            if (curUnit) {
                if (curUnit.logoPref) l1 = curUnit.logoPref;
                if (curUnit.logoFarm) l2 = curUnit.logoFarm;
            } else {
                const activeId = localStorage.getItem('cerebrum_active_unit_id'); 
                const dbStr = localStorage.getItem('cerebrum_global_units_db'); 
                if (dbStr) { 
                    const units = JSON.parse(dbStr); 
                    const activeUnit = units.find(u => u.id === activeId) || units[0]; 
                    if (activeUnit) { 
                        if (activeUnit.logoPref) l1 = activeUnit.logoPref; 
                        if (activeUnit.logoFarm) l2 = activeUnit.logoFarm; 
                    } 
                } 
            }
        } catch(e) {}`;

if (!scriptContent.includes(target5500Logos)) {
    console.error('Error: target5500Logos not found in script.js');
    process.exit(1);
}
scriptContent = scriptContent.replace(target5500Logos, replacement5500Logos);
console.log('8. 5.5s override logos patched');

fs.writeFileSync(scriptPath, scriptContent, 'utf8');
fs.writeFileSync(cleanBlockPath, cleanContent, 'utf8');

console.log('All changes written to script.js and clean_block.js successfully!');
