/**
 * ══════════════════════════════════════════════════════════════════════════════
 * APPLE EXECUTIVE SETTINGS PRO — CEREBRUM MEDICAL SUITE
 * Módulo Completo e 100% Funcional de Configurações, Customizações e Banco Clínico
 * ══════════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    window.App = window.App || {};

    if (!window.App.UnitsDB) {
        const DEFAULT_UNITS_DATA = [
            {
                id: 'unit_caps3_joao_carlos',
                name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
                sub: 'Secretaria Municipal de Saúde',
                addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
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
                addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
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
                addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
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
                addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
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
                addr: 'Avenida Getúlio Vargas, n 2751.\nTelefone (75) 3612-6600',
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
                addr: 'R. Princesa Isabel, s/n, Olindina.\nTelefone: (75) 99939-6441',
                city: 'Olindina',
                cnes: '',
                tel: '(75) 99939-6441',
                logoPref: 'unibrasil_saude.jpeg',
                logoFarm: 'prefeitura_olindina.jpeg',
                badge: 'Hospital / Olindina',
                isDefault: false
            }
        ];

        window.App.UnitsDB = {
            CURATED_DEFAULTS: DEFAULT_UNITS_DATA,
            get() {
                try {
                    const s = localStorage.getItem('cerebrum_global_units_db');
                    if (s) {
                        const parsed = JSON.parse(s);
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                    }
                } catch(e) {}
                return JSON.parse(JSON.stringify(DEFAULT_UNITS_DATA));
            },
            getActive() {
                return localStorage.getItem('cerebrum_active_unit_id') || 'unit_caps3_joao_carlos';
            },
            getActiveId() {
                return this.getActive();
            },
            getActiveUnit() {
                const list = this.get();
                const id = this.getActive();
                return list.find(u => u.id === id) || list[0];
            },
            setActive(id) {
                localStorage.setItem('cerebrum_active_unit_id', id);
            },
            getUnit(id) {
                return this.get().find(u => u.id === id) || null;
            },
            saveUnit(unit) {
                const list = this.get();
                const idx = list.findIndex(u => u.id === unit.id);
                if (idx >= 0) list[idx] = unit; else list.push(unit);
                localStorage.setItem('cerebrum_global_units_db', JSON.stringify(list));
                return unit;
            },
            deleteUnit(id) {
                let list = this.get().filter(u => u.id !== id);
                localStorage.setItem('cerebrum_global_units_db', JSON.stringify(list));
            }
        };
    }

    // 1. Áudio de Interface Web Audio API (Zero Dependências)
    let audioCtx = null;
    function playProSound(type) {
        if (localStorage.getItem('cerebrum_sound_enabled') !== 'true') return;
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) audioCtx = new AudioContext();
            }
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const now = audioCtx.currentTime;
            if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'toggle') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(980, now + 0.07);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
                osc.start(now);
                osc.stop(now + 0.07);
            } else if (type === 'success') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'delete') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (e) {
            // Audio silencioso em caso de restrição do navegador
        }
    }

    // 2. Paleta de Cores de Acento
    const ACCENT_PALETTES = [
        { id: 'cyan', label: 'Glacier Cyan', hex: '#38bdf8' },
        { id: 'emerald', label: 'Emerald Mint', hex: '#10b981' },
        { id: 'violet', label: 'Royal Violet', hex: '#a855f7' },
        { id: 'amber', label: 'Sunset Amber', hex: '#f59e0b' },
        { id: 'rose', label: 'Rose Coral', hex: '#f43f5e' },
        { id: 'blue', label: 'Electric Cobalt', hex: '#3b82f6' }
    ];

    // 3. Estrutura das Abas
    const SETTINGS_TABS = [
        { id: 'tab-aparencia', category: 'Sistema & Design', icon: '🎨', tile: 'sp-tile-blue', label: 'Aparência & Tema' },
        { id: 'tab-lote', category: 'Sistema & Design', icon: '⚡', tile: 'sp-tile-amber', label: 'Modo Lote & IA' },
        { id: 'tab-atalhos', category: 'Sistema & Design', icon: '⌨️', tile: 'sp-tile-slate', label: 'Teclas de Atalho' },

        { id: 'tab-medico', category: 'Corpo Clínico', icon: '👤', tile: 'sp-tile-indigo', label: 'Dados do Médico' },
        { id: 'tab-unidade', category: 'Corpo Clínico', icon: '🏥', tile: 'sp-tile-green', label: 'Unidade de Saúde' },
        { id: 'tab-assinatura', category: 'Corpo Clínico', icon: '✍️', tile: 'sp-tile-rose', label: 'Assinatura & Carimbo' },

        { id: 'tab-receita', category: 'Prescrição & Integração', icon: '📄', tile: 'sp-tile-cyan', label: 'Receituário & Folhas' },
        { id: 'tab-pep', category: 'Prescrição & Integração', icon: '📋', tile: 'sp-tile-blue', label: 'Cópia Prontuário (PEP)' },
        { id: 'tab-lme', category: 'Prescrição & Integração', icon: '💎', tile: 'sp-tile-purple', label: 'Formulário LME' },

        { id: 'tab-custom-meds', category: 'Banco & Segurança', icon: '🧪', tile: 'sp-tile-green', label: 'Medicamentos Base' },
        { id: 'tab-favoritos', category: 'Banco & Segurança', icon: '⭐', tile: 'sp-tile-yellow', label: 'Favoritos Clínicos' },
        { id: 'tab-backup', category: 'Banco & Segurança', icon: '💽', tile: 'sp-tile-slate', label: 'Backup & Armazenamento' }
    ];

    let tempCustomMeds = [];
    let tempSignatureImg = null;
    let sigPasteHandler = null;
    let tempLmeBg = null;
    let tempUnitLogoPref = null;
    let tempUnitLogoFarm = null;
    let activeTabId = 'tab-aparencia';

    // 4. Funções de Aplicação de Ajustes (Isoladas e Seguras)

    function applyAccentColor(hex) {
        document.documentElement.style.setProperty('--sp-accent', hex);
        localStorage.setItem('cerebrum_accent_color', hex);
    }

    function applySystemTheme(themeClass) {
        const validThemes = ['theme-modern', 'theme-blue', 'theme-dark', 'theme-light', 'theme-oled'];
        validThemes.forEach(t => document.body.classList.remove(t));
        document.body.classList.add(themeClass);
        localStorage.setItem('cerebrum_theme', themeClass);
        if (window.App) {
            if (!window.App.config) window.App.config = {};
            window.App.config.theme = themeClass;
        }
    }

    function applyPreviewScale(scaleVal) {
        localStorage.setItem('cerebrum_preview_font_scale', scaleVal);
        const numScale = parseFloat(scaleVal) || 100;
        document.documentElement.style.setProperty('--cerebrum-font-user-scale', (numScale / 100).toString());
        const container = document.getElementById('preview-container');
        if (container) {
            container.style.fontSize = `${scaleVal}%`;
        }
        if (window.App && typeof window.App.render === 'function') {
            window.App.render();
        }
    }

    function applyBlurEffect(enabled) {
        document.body.classList.toggle('sp-disable-blur', !enabled);
        localStorage.setItem('cerebrum_blur_disabled', enabled ? 'false' : 'true');
    }

    function applySignatureSettings(size, opacity) {
        localStorage.setItem('cerebrum_sig_size', size);
        localStorage.setItem('cerebrum_sig_opacity', opacity);
    }

    function applyLockSettings(isUnlockDefault, isLockHidden) {
        localStorage.setItem('cerebrum_lock_hidden', isLockHidden ? 'true' : 'false');
        localStorage.setItem('cerebrum_lock_unlocked', isUnlockDefault ? 'true' : 'false');
        localStorage.setItem('pz_unlock_default', isUnlockDefault ? '1' : '0');
        document.body.classList.toggle('hide-lock-master', isLockHidden);
        if (window.App) {
            window.App.isEditorLocked = !isUnlockDefault;
            if (typeof window.App.refreshEditorState === 'function') {
                window.App.refreshEditorState();
            }
        }
    }

    // 5. Abertura do Modal de Configurações
    function openSettingsPro(targetTab) {
        if (targetTab) activeTabId = targetTab;

        document.body.classList.add('hide-floating-menu');
        document.body.classList.remove('show-action-icons');

        const oldOverlays = document.querySelectorAll('#ent-settings-overlay, #settings-modal, #wipe-db-modal');
        oldOverlays.forEach(o => {
            if (o.id === 'settings-modal') o.style.display = 'none';
            else o.remove();
        });

        let overlay = document.getElementById('settings-pro-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'settings-pro-overlay';
            document.body.appendChild(overlay);
        }

        try {
            renderSettingsModalContent(overlay);
        } catch (err) {
            console.error('Erro ao renderizar modal de configurações:', err);
        }
        playProSound('click');

        overlay.classList.add('is-open');
        (window.requestAnimationFrame || setTimeout)(() => {
            overlay.classList.add('is-open');
            const sidebar = overlay.querySelector('.sp-sidebar');
            if (sidebar) sidebar.scrollTop = 0;
            const content = overlay.querySelector('.sp-content-area');
            if (content) content.scrollTop = 0;
        });
    }

    // Fechamento do Modal
    function closeSettingsPro() {
        document.body.classList.remove('hide-floating-menu');
        const overlay = document.getElementById('settings-pro-overlay');
        if (overlay) {
            overlay.classList.remove('is-open');
        }
        if (sigPasteHandler) {
            window.removeEventListener('paste', sigPasteHandler);
            sigPasteHandler = null;
        }
        tempSignatureImg = null;
        tempLmeBg = null;
        playProSound('click');
        if (document.body.classList.contains('logged-in')) {
            document.body.classList.add('show-action-icons');
        }
    }

    // 6. Renderização do Conteúdo HTML do Modal
    function renderSettingsModalContent(overlay) {
        const app = window.App || {};
        const cfg = app.config || {};
        const profile = app.currentProfile || {};

        const theme = localStorage.getItem('cerebrum_theme') || cfg.theme || 'theme-modern';
        const accentHex = localStorage.getItem('cerebrum_accent_color') || '#38bdf8';
        const fontScale = localStorage.getItem('cerebrum_preview_font_scale') || '100';
        const blurActive = localStorage.getItem('cerebrum_blur_disabled') !== 'true';
        const soundActive = localStorage.getItem('cerebrum_sound_enabled') === 'true';

        const docName = cfg.docname || profile.name || '';
        const docCrm = cfg.doccrm || profile.crm || '';
        const docSpecialty = cfg.docspecialty || profile.specialty || '';
        const docCns = cfg.doccns || profile.cns || '';
        const docTel = cfg.doctel || '';
        const docFooter = cfg.docfooter || '';

        const unitsList = (window.App && window.App.UnitsDB) ? window.App.UnitsDB.get() : [];
        const currentActiveUnit = (window.App && window.App.UnitsDB) ? window.App.UnitsDB.getActiveUnit() : null;
        const activeUnitId = currentActiveUnit ? currentActiveUnit.id : (unitsList[0] ? unitsList[0].id : 'unit_caps3_joao_carlos');
        const selectedUnit = unitsList.find(u => u.id === activeUnitId) || currentActiveUnit || unitsList[0] || {
            id: 'unit_caps3_joao_carlos',
            name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751 - Santa Mônica\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'Padrão / Saúde Mental'
        };

        const unitTitle = selectedUnit.name || cfg.title || profile.unit || '';
        const unitSub = selectedUnit.sub || cfg.sub || '';
        const unitCnes = selectedUnit.cnes || cfg.cnes || '';
        const unitAddr = selectedUnit.addr || cfg.addr || '';
        const unitCity = selectedUnit.city || cfg.city || 'Feira de Santana - BA';
        const unitTel = selectedUnit.tel || cfg.tel || '';
        tempUnitLogoPref = selectedUnit.logoPref || '';
        tempUnitLogoFarm = selectedUnit.logoFarm || '';

        const medsLimit = parseInt(localStorage.getItem('cerebrum_meds_limit')) || 5;
        const dateFormat = localStorage.getItem('cerebrum_date_format') || 'extenso';
        const autoDate = cfg.autoDateDefault !== false;
        const onlyFirstDate = cfg.onlyFirstDate !== false;
        const hideHeaderPrint = cfg.hideHeaderPrint === true;
        const hideFooterPrint = cfg.hideFooterPrint === true;
        const printHubEnabled = localStorage.getItem('cerebrum_print_hub_enabled') !== 'false' && cfg.printHubEnabled !== false;
        const dividerLines = localStorage.getItem('cerebrum_divider_lines') === 'true';
        const showPageNums = localStorage.getItem('cerebrum_page_nums') !== 'false';
        const unlockDefault = localStorage.getItem('pz_unlock_default') === '1' || cfg.defaultEditorUnlocked === true;
        const lockHidden = localStorage.getItem('cerebrum_lock_hidden') === 'true' || cfg.hideEditorBtn === true;

        const signatureSrc = cfg.signature || cfg.signatureImg || localStorage.getItem('cerebrum_signature_img') || '';
        const sigSize = parseInt(localStorage.getItem('cerebrum_sig_size')) || 80;
        const sigOpacity = parseInt(localStorage.getItem('cerebrum_sig_opacity')) || 95;
        const sigAlign = localStorage.getItem('cerebrum_sig_align') || 'center';
        const sigBlend = localStorage.getItem('cerebrum_sig_blend') !== 'false';

        const copyHeaderEnabled = localStorage.getItem('pz_copy_header_enabled') === 'true' || cfg.copyHeaderEnable === true;
        const copyHeaderText = localStorage.getItem('pz_copy_header_text') || cfg.copyHeaderText || 'Paciente solicita renovação de receituário.';
        const copyDateTime = localStorage.getItem('cerebrum_copy_datetime') === 'true';
        const copyFormat = localStorage.getItem('cerebrum_copy_format') || 'num';
        const postPrint = localStorage.getItem('cerebrum_post_print') || 'clear';

        const loteIntellisense = localStorage.getItem('cerebrum_lote_intellisense') !== 'false';
        const loteSanitize = localStorage.getItem('cerebrum_lote_autoclean') !== 'false';
        const loteTrades = localStorage.getItem('cerebrum_lote_tradename_convert') !== 'false';

        const scDrawer = cfg.shortcutDrawer || 'I';
        const scClear = cfg.shortcutClear || 'X';
        const scDate = cfg.shortcutDate || 'D';
        const scFraction = cfg.shortcutFraction || 'F';
        const scLote = cfg.shortcutLote || 'L';
        const scSpace = cfg.spaceToggle !== false;

        tempCustomMeds = Array.isArray(cfg.customMeds) ? JSON.parse(JSON.stringify(cfg.customMeds)) : [];
        const favsText = Array.isArray(cfg.favorites) ? cfg.favorites.join('\n') : '';
        const lmeBgSrc = cfg.lmeBg || '';

        // Agrupamento de Abas na Sidebar
        let currentCat = '';
        let navHtml = '';
        SETTINGS_TABS.forEach(tab => {
            if (tab.category !== currentCat) {
                currentCat = tab.category;
                navHtml += `<div class="sp-sidebar-header">${currentCat}</div>`;
            }
            const isActive = tab.id === activeTabId ? 'is-active' : '';
            navHtml += `
                <button type="button" class="sp-nav-item ${isActive}" data-tab="${tab.id}">
                    <div class="sp-nav-icon-tile ${tab.tile}">
                        <span>${tab.icon}</span>
                    </div>
                    <span>${tab.label}</span>
                </button>
            `;
        });

        overlay.innerHTML = `
            <div class="settings-pro-window">
                <!-- Titlebar macOS -->
                <div class="sp-titlebar">
                    <div class="sp-titlebar-left">
                        <div class="sp-traffic-lights">
                            <div class="sp-dot close" id="sp-close-dot" title="Fechar (Esc)"></div>
                            <div class="sp-dot min" title="Minimizar"></div>
                            <div class="sp-dot max" title="Expandir"></div>
                        </div>
                        <div class="sp-app-brand">
                            <span class="sp-app-logo">🩺</span>
                            <span class="sp-app-title">Prescript Pro</span>
                            <span class="sp-version-badge">Sequoia Pro</span>
                        </div>
                    </div>

                    <div class="sp-search-wrapper">
                        <span class="sp-search-icon">🔍</span>
                        <input type="text" class="sp-search-box" id="sp-search-box" placeholder="Buscar configurações..." autocomplete="off">
                        <span class="sp-search-clear" id="sp-search-clear" style="display: none;">✕</span>
                    </div>

                    <div class="sp-user-pill">
                        <div class="sp-user-pill-avatar">${(docName || 'D')[0].toUpperCase()}</div>
                        <span class="sp-user-pill-name">${docName ? (docName.startsWith('Dr') ? docName : 'Dr(a). ' + docName) : 'Médico Ativo'}</span>
                    </div>
                </div>

                <!-- Corpo da Janela -->
                <div class="sp-body">
                    <!-- Sidebar Agrupada -->
                    <div class="sp-sidebar">
                        <div class="sp-nav-group">
                            ${navHtml}
                        </div>
                    </div>

                    <!-- Área de Conteúdo -->
                    <div class="sp-content-area">
                        <!-- ══ ABA 1: APARÊNCIA & TEMA ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-aparencia' ? 'is-active' : ''}" id="pane-tab-aparencia">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">🎨 Aparência, Tema & Cores</h2>
                                <p class="sp-pane-desc">Personalize o visual e a sensação tátil do Prescript Pro com temas modernos e paletas dinâmicas.</p>
                            </div>

                            <div class="sp-card-group-title">Ambiente Visual do Sistema</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Tema do Aplicativo</div>
                                        <div class="sp-row-desc">Escolha entre temas escuros, clássicos, modo claro ou preto puro OLED.</div>
                                    </div>
                                    <select class="sp-select" id="sp-cfg-theme">
                                        <option value="theme-modern" ${theme === 'theme-modern' ? 'selected' : ''}>Modern Executive (Padrão)</option>
                                        <option value="theme-blue" ${theme === 'theme-blue' ? 'selected' : ''}>Executive Blue</option>
                                        <option value="theme-dark" ${theme === 'theme-dark' ? 'selected' : ''}>Dark Charcoal</option>
                                        <option value="theme-light" ${theme === 'theme-light' ? 'selected' : ''}>Classic Light</option>
                                        <option value="theme-oled" ${theme === 'theme-oled' ? 'selected' : ''}>True Black (OLED)</option>
                                    </select>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Cor de Destaque (Accent Color)</div>
                                        <div class="sp-row-desc">Acentua botões, seletores, badges e bordas interativas em todo o sistema.</div>
                                    </div>
                                    <div class="sp-color-palette" id="sp-palette-dots">
                                        ${ACCENT_PALETTES.map(p => `
                                            <div class="sp-color-dot ${accentHex.toLowerCase() === p.hex.toLowerCase() ? 'is-selected' : ''}" 
                                                 style="background: ${p.hex};" 
                                                 data-color="${p.hex}" 
                                                 title="${p.label}"></div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="sp-card-group-title">Efeitos & Tipografia</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Escala da Fonte da Receita</div>
                                        <div class="sp-row-desc">Ajuste o tamanho tipográfico na visualização e impressão da folha A4.</div>
                                    </div>
                                    <div class="sp-segmented" id="sp-seg-font-scale">
                                        <button type="button" class="sp-segment-btn ${fontScale === '90' ? 'is-active' : ''}" data-val="90">90%</button>
                                        <button type="button" class="sp-segment-btn ${fontScale === '95' ? 'is-active' : ''}" data-val="95">95%</button>
                                        <button type="button" class="sp-segment-btn ${fontScale === '100' ? 'is-active' : ''}" data-val="100">100%</button>
                                        <button type="button" class="sp-segment-btn ${fontScale === '105' ? 'is-active' : ''}" data-val="105">105%</button>
                                        <button type="button" class="sp-segment-btn ${fontScale === '110' ? 'is-active' : ''}" data-val="110">110%</button>
                                        <button type="button" class="sp-segment-btn ${fontScale === '120' ? 'is-active' : ''}" data-val="120">120%</button>
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Efeitos de Desfoque (Glassmorphism)</div>
                                        <div class="sp-row-desc">Ativa desfoque translúcido de fundo. Desative caso sinta lentidão em PCs antigos.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-blur" ${blurActive ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Sons de Interface (Feedback Tátil)</div>
                                        <div class="sp-row-desc">Reproduz sutis efeitos sonoros de confirmação ao clicar em botões e alternar switches.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-sounds" ${soundActive ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 2: MODO LOTE & IA ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-lote' ? 'is-active' : ''}" id="pane-tab-lote">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">⚡ Modo Lote & Assistente de Prescrição</h2>
                                <p class="sp-pane-desc">Ajuste o comportamento do motor de inteligência e prescrição contínua em massa.</p>
                            </div>

                            <div class="sp-card-group-title">Automação & Digitação Inteligente</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">IntelliSense Flutuante (Auto-Completar)</div>
                                        <div class="sp-row-desc">Sugere doses, formas de uso e medicamentos enquanto você digita no modo lote.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-lote-intellisense" ${loteIntellisense ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Higienização Instantânea ao Colar</div>
                                        <div class="sp-row-desc">Remove automaticamente cabeçalhos de prontuário, números de item e sujeiras textuais coladas.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-lote-sanitize" ${loteSanitize ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Conversão Automática de Marcas Comerciais</div>
                                        <div class="sp-row-desc">Traduz marcas conhecidas (ex: Rivotril, Haldol, Amplictil) para DCB com salvaguarda LASA.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-lote-tradenames" ${loteTrades ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 3: TECLAS DE ATALHO ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-atalhos' ? 'is-active' : ''}" id="pane-tab-atalhos">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">⌨️ Atalhos de Teclado (Produtividade)</h2>
                                <p class="sp-pane-desc">Personalize as teclas de disparo rápido para acelerar o atendimento ambulatorial.</p>
                            </div>

                            <div class="sp-card-group-title">Mapeamento de Atalhos (Alt + Tecla)</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Abrir/Fechar Prontuário Clínico (PEP)</div>
                                        <div class="sp-row-desc">Atalho para deslizar a gaveta lateral do histórico do paciente.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span class="sp-kbd-badge">Alt +</span>
                                        <input type="text" class="sp-input" id="sp-cfg-sc-drawer" value="${scDrawer}" maxlength="1" style="width: 50px; text-align: center; text-transform: uppercase; font-weight: bold;">
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Limpar Toda a Prescrição</div>
                                        <div class="sp-row-desc">Esvazia o receituário para iniciar um novo paciente rapidamente.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span class="sp-kbd-badge">Alt +</span>
                                        <input type="text" class="sp-input" id="sp-cfg-sc-clear" value="${scClear}" maxlength="1" style="width: 50px; text-align: center; text-transform: uppercase; font-weight: bold;">
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Inserir Data de Hoje</div>
                                        <div class="sp-row-desc">Aplica a data atual na linha de prescrição ativa.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span class="sp-kbd-badge">Alt +</span>
                                        <input type="text" class="sp-input" id="sp-cfg-sc-date" value="${scDate}" maxlength="1" style="width: 50px; text-align: center; text-transform: uppercase; font-weight: bold;">
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Alternar Modo Fracionado (1/2, 1/4)</div>
                                        <div class="sp-row-desc">Ativa ou desativa o botão de dosagem fracionada nos spinners de horário.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span class="sp-kbd-badge">Alt +</span>
                                        <input type="text" class="sp-input" id="sp-cfg-sc-fraction" value="${scFraction}" maxlength="1" style="width: 50px; text-align: center; text-transform: uppercase; font-weight: bold;">
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Alternar para o Modo Lote</div>
                                        <div class="sp-row-desc">Alterna entre o modo clássico e o editor em lote com um único toque.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span class="sp-kbd-badge">Alt +</span>
                                        <input type="text" class="sp-input" id="sp-cfg-sc-lote" value="${scLote}" maxlength="1" style="width: 50px; text-align: center; text-transform: uppercase; font-weight: bold;">
                                    </div>
                                </div>
                            </div>

                            <div class="sp-card-group-title">Comportamento dos Horários</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Barra de Espaço Alterna Horários</div>
                                        <div class="sp-row-desc">Permite passar de Manhã para Tarde/Noite pressionando Espaço no campo numérico.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-spacetoggle" ${scSpace ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 4: DADOS DO MÉDICO ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-medico' ? 'is-active' : ''}" id="pane-tab-medico">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">👤 Perfil Profissional do Médico</h2>
                                <p class="sp-pane-desc">Dados que constarão no cabeçalho, rodapé e nos carimbos oficiais das receitas geradas.</p>
                            </div>

                            <div class="sp-card-group-title">Identificação do Profissional</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Nome Completo</div>
                                        <div class="sp-row-desc">Como seu nome será impresso no rodapé e laudos.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-docname" value="${docName}" placeholder="Ex: Dr. Fulano de Tal">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">CRM e Estado (UF)</div>
                                        <div class="sp-row-desc">Registro no Conselho Regional de Medicina.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-doccrm" value="${docCrm}" placeholder="Ex: 12345/BA" style="width: 200px;">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Especialidade / RQE</div>
                                        <div class="sp-row-desc">Título de especialista ou área de atuação.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-docspecialty" value="${docSpecialty}" placeholder="Ex: Psiquiatria - RQE 9876">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Cartão Nacional de Saúde (CNS)</div>
                                        <div class="sp-row-desc">Número do CNS para preenchimento de LME e APAC SUS.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-doccns" value="${docCns}" placeholder="Ex: 700000000000000" style="width: 250px;">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Telefone Profissional / Contato</div>
                                        <div class="sp-row-desc">Telefone opcional para contato clínico ou dúvidas da farmácia.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-doctel" value="${docTel}" placeholder="Ex: (75) 99999-9999" style="width: 200px;">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Frase Personalizada no Rodapé</div>
                                        <div class="sp-row-desc">Texto sutil que pode aparecer sob o carimbo (ex: "Atendimento pelo SUS").</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-docfooter" value="${docFooter}" placeholder="Ex: Não dobre ou rasure este receituário">
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 5: UNIDADE DE SAÚDE & CABEÇALHOS DE ELITE (APPLE DESIGN) ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-unidade' ? 'is-active' : ''}" id="pane-tab-unidade">
                            <!-- Apple Section Header -->
                            <div class="sp-pane-header sp-apple-header">
                                <div class="sp-apple-header-icon">🏥</div>
                                <div>
                                    <h2 class="sp-pane-title">Unidades de Atendimento & Cabeçalho</h2>
                                    <p class="sp-pane-desc">Gerencie seus postos de trabalho, hospitais e clínicas com fidelidade visual absoluta no receituário oficial.</p>
                                </div>
                            </div>

                            <!-- 1. HERO RETINA PREVIEW: SIMULADOR A4 ESTILO APPLE QUICK LOOK -->
                            <div class="sp-apple-section-label">
                                <div class="sp-section-label-left">
                                    <span class="sp-apple-dot-tag"></span>
                                    <span>SIMULADOR DE CABEÇALHO A4 • TEMPO REAL</span>
                                </div>
                                <div class="sp-apple-live-indicator">
                                    <span class="sp-pulse-dot"></span>
                                    <span>SINCRONIZADO COM A IMPRESSÃO</span>
                                </div>
                            </div>

                            <div class="sp-unit-hero-card sp-apple-hero">
                                <div class="sp-apple-window-bar">
                                    <div class="sp-traffic-lights">
                                        <span class="traffic-dot close"></span>
                                        <span class="traffic-dot min"></span>
                                        <span class="traffic-dot max"></span>
                                    </div>
                                    <div class="sp-apple-window-title">
                                        <span>📄 Receituário Timbrado Oficial • Prévia de Impressão</span>
                                    </div>
                                    <div class="sp-apple-window-scale">Escala 100%</div>
                                </div>

                                <div class="sp-header-preview-paper" id="sp-live-header-paper">
                                    <div class="sp-header-paper-top">
                                        <div class="sp-paper-logo sp-paper-logo-left" id="sp-paper-logo-left">
                                            <img id="sp-paper-img-left" src="${selectedUnit.logoPref || 'prefeitura.png'}" alt="Logo Esq" style="max-height: 48px; max-width: 110px; object-fit: contain; ${selectedUnit.logoPref ? '' : 'display:none;'}">
                                            <span class="sp-paper-no-logo" id="sp-paper-no-logo-left" style="${selectedUnit.logoPref ? 'display:none;' : ''}">Sem brasão</span>
                                        </div>
                                        <div class="sp-paper-text" id="sp-paper-header-text">
                                            <b id="sp-paper-txt-title">${selectedUnit.name}</b><br>
                                            <span id="sp-paper-txt-sub">${selectedUnit.sub || ''}</span><br>
                                            <span id="sp-paper-txt-addr">${(selectedUnit.addr || '').replace(/\n/g, '<br>')}</span>
                                        </div>
                                        <div class="sp-paper-logo sp-paper-logo-right" id="sp-paper-logo-right">
                                            <img id="sp-paper-img-right" src="${selectedUnit.logoFarm || 'farmacia.png'}" alt="Logo Dir" style="max-height: 48px; max-width: 110px; object-fit: contain; ${selectedUnit.logoFarm ? '' : 'display:none;'}">
                                            <span class="sp-paper-no-logo" id="sp-paper-no-logo-right" style="${selectedUnit.logoFarm ? 'display:none;' : ''}">Sem selo</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="sp-unit-hero-info sp-apple-hero-footer">
                                    <div class="sp-hero-info-left">
                                        <div class="sp-hero-status-icon">🏥</div>
                                        <div>
                                            <div class="sp-unit-hero-title" id="sp-hero-unit-name">${selectedUnit.name}</div>
                                            <div class="sp-unit-hero-sub" id="sp-hero-unit-sub">${selectedUnit.sub || 'Secretaria Municipal de Saúde'} • ${selectedUnit.city || 'Feira de Santana - BA'}</div>
                                        </div>
                                    </div>
                                    <div class="sp-active-unit-chip" id="sp-hero-status-chip">
                                        <span class="sp-pulse-dot"></span>
                                        <span>UNIDADE ATIVA NA RECEITA</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 2. CATÁLOGO DE UNIDADES CADASTRADAS (APPLE GRID PICKER) -->
                            <div class="sp-apple-section-label" style="margin-top: 28px;">
                                <div class="sp-section-label-left">
                                    <span class="sp-apple-dot-tag"></span>
                                    <span>CATÁLOGO DE ESTABELECIMENTOS DE SAÚDE</span>
                                </div>
                                <button type="button" class="sp-btn-apple-add" id="sp-btn-new-unit">
                                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>
                                    <span>Nova Unidade</span>
                                </button>
                            </div>

                            <div class="sp-units-cards-grid" id="sp-units-cards-grid">
                                <!-- Cards gerados dinamicamente via JS com design Apple -->
                            </div>

                            <!-- 3. INSPECTOR DE DADOS (APPLE SYSTEM SETTINGS STYLE) -->
                            <div class="sp-apple-section-label" style="margin-top: 28px;">
                                <div class="sp-section-label-left">
                                    <span class="sp-apple-dot-tag"></span>
                                    <span>EDITOR DE DADOS INSTITUCIONAIS</span>
                                </div>
                                <span class="sp-apple-badge-id" id="sp-editing-unit-id-badge">ID: ${selectedUnit.id}</span>
                            </div>

                            <div class="sp-card-group sp-apple-grouped-table">
                                <input type="hidden" id="sp-cfg-unitid" value="${selectedUnit.id}">

                                <div class="sp-row sp-apple-row">
                                    <div class="sp-apple-icon-cell icon-blue">🏛️</div>
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Nome Oficial da Instituição</div>
                                        <div class="sp-row-desc">Título principal impresso em destaque no topo da receita.</div>
                                    </div>
                                    <input type="text" class="sp-input sp-apple-input" id="sp-cfg-unittitle" value="${selectedUnit.name}" placeholder="Ex: CAPS III Dr. João Carlos Lopes Cavalcante">
                                </div>

                                <div class="sp-row sp-apple-row">
                                    <div class="sp-apple-icon-cell icon-indigo">📋</div>
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Subtítulo / Secretaria de Saúde</div>
                                        <div class="sp-row-desc">Identificação do órgão ou departamento mantenedor.</div>
                                    </div>
                                    <input type="text" class="sp-input sp-apple-input" id="sp-cfg-unitsub" value="${selectedUnit.sub || ''}" placeholder="Ex: Secretaria Municipal de Saúde">
                                </div>

                                <div class="sp-row sp-apple-row">
                                    <div class="sp-apple-icon-cell icon-purple">🔢</div>
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Código CNES</div>
                                        <div class="sp-row-desc">Cadastro Nacional de Estabelecimentos de Saúde.</div>
                                    </div>
                                    <input type="text" class="sp-input sp-apple-input" id="sp-cfg-unitcnes" value="${selectedUnit.cnes || ''}" placeholder="Ex: 2798541" style="max-width: 200px;">
                                </div>

                                <div class="sp-row sp-apple-row">
                                    <div class="sp-apple-icon-cell icon-teal">📍</div>
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Cidade e Estado</div>
                                        <div class="sp-row-desc">Localidade impressa junto à data do receituário.</div>
                                    </div>
                                    <input type="text" class="sp-input sp-apple-input" id="sp-cfg-unitcity" value="${selectedUnit.city || 'Feira de Santana - BA'}" placeholder="Ex: Feira de Santana - BA" style="max-width: 260px;">
                                </div>

                                <div class="sp-row sp-apple-row">
                                    <div class="sp-apple-icon-cell icon-green">📞</div>
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Telefone de Atendimento</div>
                                        <div class="sp-row-desc">Contato oficial da recepção da unidade médica.</div>
                                    </div>
                                    <input type="text" class="sp-input sp-apple-input" id="sp-cfg-unittel" value="${selectedUnit.tel || ''}" placeholder="Ex: (75) 3612-6600" style="max-width: 220px;">
                                </div>

                                <div class="sp-row sp-apple-row" style="align-items: flex-start;">
                                    <div class="sp-apple-icon-cell icon-amber" style="margin-top: 4px;">🏠</div>
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Endereço Completo</div>
                                        <div class="sp-row-desc">Logradouro, número, bairro e complementos impressos no centro.</div>
                                    </div>
                                    <textarea class="sp-textarea sp-apple-input" id="sp-cfg-unitaddr" style="min-height: 70px;">${selectedUnit.addr || ''}</textarea>
                                </div>
                            </div>

                            <!-- 4. IDENTIDADE VISUAL & LOGOTIPOS (APPLE ASSET WELLS) -->
                            <div class="sp-apple-section-label" style="margin-top: 28px;">
                                <div class="sp-section-label-left">
                                    <span class="sp-apple-dot-tag"></span>
                                    <span>ESTÚDIO DE BRASÕES & LOGOTIPOS DO CABEÇALHO</span>
                                </div>
                                <span class="sp-apple-hint-txt">PNG transparente recomendado</span>
                            </div>

                            <div class="sp-logos-studio-grid sp-apple-asset-grid">
                                <!-- Logotipo Esquerdo (Prefeitura / Brasão) -->
                                <div class="sp-logo-studio-card sp-apple-asset-card">
                                    <div class="sp-logo-card-header">
                                        <div class="sp-asset-header-title">
                                            <span class="sp-asset-badge">ESQUERDA</span>
                                            <span class="sp-logo-card-title">Brasão Municipal / Prefeitura</span>
                                        </div>
                                    </div>
                                    <div class="sp-logo-card-preview sp-apple-asset-stage" id="sp-box-logo-pref">
                                        <img id="sp-thumb-logo-pref" src="${selectedUnit.logoPref || 'prefeitura.png'}" style="max-height: 75px; max-width: 85%; object-fit: contain; ${selectedUnit.logoPref ? '' : 'display:none;'}">
                                        <div class="sp-logo-empty-text" id="sp-empty-logo-pref" style="${selectedUnit.logoPref ? 'display:none;' : ''}">Nenhum brasão anexado</div>
                                    </div>
                                    <input type="file" id="sp-file-logo-pref" accept="image/png, image/jpeg, image/jpg" style="display:none;">
                                    <div class="sp-logo-card-buttons sp-apple-asset-toolbar">
                                        <button type="button" class="sp-btn-logo-action sp-apple-btn-asset primary" id="sp-btn-upload-logo-pref">
                                            📁 Carregar Imagem
                                        </button>
                                        <button type="button" class="sp-btn-logo-action secondary sp-apple-btn-asset" id="sp-btn-default-logo-pref">
                                            🏛️ Brasão Feira
                                        </button>
                                        <button type="button" class="sp-btn-logo-action danger sp-apple-btn-asset" id="sp-btn-clear-logo-pref">
                                            🗑️ Remover
                                        </button>
                                    </div>
                                </div>

                                <!-- Logotipo Direito (Farmácia / SUS / Clínica) -->
                                <div class="sp-logo-studio-card sp-apple-asset-card">
                                    <div class="sp-logo-card-header">
                                        <div class="sp-asset-header-title">
                                            <span class="sp-asset-badge">DIREITA</span>
                                            <span class="sp-logo-card-title">Selo Oficial / SUS / Farmácia</span>
                                        </div>
                                    </div>
                                    <div class="sp-logo-card-preview sp-apple-asset-stage" id="sp-box-logo-farm">
                                        <img id="sp-thumb-logo-farm" src="${selectedUnit.logoFarm || 'farmacia.png'}" style="max-height: 75px; max-width: 85%; object-fit: contain; ${selectedUnit.logoFarm ? '' : 'display:none;'}">
                                        <div class="sp-logo-empty-text" id="sp-empty-logo-farm" style="${selectedUnit.logoFarm ? 'display:none;' : ''}">Nenhum selo anexado</div>
                                    </div>
                                    <input type="file" id="sp-file-logo-farm" accept="image/png, image/jpeg, image/jpg" style="display:none;">
                                    <div class="sp-logo-card-buttons sp-apple-asset-toolbar">
                                        <button type="button" class="sp-btn-logo-action sp-apple-btn-asset primary" id="sp-btn-upload-logo-farm">
                                            📁 Carregar Imagem
                                        </button>
                                        <button type="button" class="sp-btn-logo-action secondary sp-apple-btn-asset" id="sp-btn-default-logo-farm">
                                            💊 Farmácia Padrão
                                        </button>
                                        <button type="button" class="sp-btn-logo-action danger sp-apple-btn-asset" id="sp-btn-clear-logo-farm">
                                            🗑️ Remover
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Barra de Ações Rápidas da Unidade (Apple Glass Action Deck) -->
                            <div class="sp-unit-action-bar sp-apple-dock">
                                <button type="button" class="sp-btn-unit-danger sp-apple-danger-btn" id="sp-btn-del-unit">
                                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h10M6 5V3h4v2M5 5l1 9h4l1-9"/></svg>
                                    <span>Excluir Unidade</span>
                                </button>
                                <div class="sp-apple-dock-right">
                                    <button type="button" class="sp-btn-unit-secondary sp-apple-secondary-btn" id="sp-btn-dup-unit">
                                        <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="8" height="8" rx="2"/><path d="M3 11V3h8"/></svg>
                                        <span>Duplicar Unidade</span>
                                    </button>
                                    <button type="button" class="sp-btn-unit-primary sp-apple-primary-btn" id="sp-btn-save-unit-now">
                                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 8.5 6.5 12 13 4"/></svg>
                                        <span>Salvar & Ativar no Receituário</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 6: ASSINATURA & CARIMBO (STUDIO PROFISSIONAL) ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-assinatura' ? 'is-active' : ''}" id="pane-tab-assinatura">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">✍️ Assinatura Digital & Carimbo Escaneado</h2>
                                <p class="sp-pane-desc">Adicione sua assinatura com carimbo médico. O sistema aplica remoção inteligente de fundo e alinhamento milimétrico para o receituário impresso.</p>
                            </div>

                            <div class="sp-card-group-title" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>📄 Papel de Impressão Simulado (Rodapé A4)</span>
                                <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 700; letter-spacing: 0.5px;">TEMPO REAL</span>
                            </div>

                            <div class="sp-card-group sp-sig-studio-group">
                                <!-- PAPEL FÍSICO BRANCO REALISTA -->
                                <div class="sp-real-paper-container">
                                    <div class="sp-real-paper" id="sp-paper-dropzone" title="Arraste uma foto aqui para carregar">
                                        <!-- Topo do papel com marca d'água técnica -->
                                        <div class="sp-paper-top-meta">
                                            <span class="sp-paper-meta-label">RODAPÉ OFICIAL DA PRESCRIÇÃO • SULFITE 75G / A4</span>
                                            <span class="sp-paper-meta-rule">📏 ALINHAMENTO MILIMÉTRICO</span>
                                        </div>

                                        <!-- Área Central do Rodapé -->
                                        <div class="sp-paper-footer-area" id="sp-paper-footer-area" data-align="${sigAlign}">
                                            <!-- Imagem ou Placeholder da Assinatura -->
                                            <div class="sp-paper-sig-slot" id="sp-paper-sig-slot">
                                                <img id="sp-sig-preview-img" 
                                                     src="${signatureSrc}" 
                                                     alt="Assinatura e Carimbo do Médico"
                                                     style="display: ${signatureSrc ? 'inline-block' : 'none'}; 
                                                            max-height: ${sigSize}px; 
                                                            opacity: ${sigOpacity / 100}; 
                                                            mix-blend-mode: ${sigBlend ? 'multiply' : 'normal'};">
                                                
                                                <div id="sp-sig-empty-placeholder" class="sp-sig-empty-box" style="display: ${signatureSrc ? 'none' : 'flex'};">
                                                    <div class="sp-sig-empty-icon">🪪</div>
                                                    <div class="sp-sig-empty-text">Arraste a foto do seu carimbo aqui</div>
                                                    <div class="sp-sig-empty-sub">ou clique nos botões abaixo • Suporta JPG, PNG ou Ctrl+V</div>
                                                </div>
                                            </div>

                                            <!-- Linha de Assinatura -->
                                            <div class="sp-paper-sig-line"></div>

                                            <!-- Metadados do Médico no Papel -->
                                            <div class="sp-paper-doctor-meta">
                                                <div class="sp-paper-caption">Assinatura e carimbo do médico</div>
                                                <div class="sp-paper-doc-name">${docName ? docName : 'Dr(a). Médico(a)'}</div>
                                                <div class="sp-paper-doc-crm">
                                                    ${docCrm ? `CRM ${docCrm}` : 'CRM 00000/UF'}
                                                    ${docSpecialty ? ` • ${docSpecialty}` : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Selo Digital no Canto -->
                                        <div class="sp-paper-seal-badge">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                            </svg>
                                            <span>Autenticação Certificada</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- BARRA DE AÇÕES DO PAPEL (BOTÕES ULTRA MODERNOS) -->
                                <div class="sp-sig-action-bar">
                                    <input type="file" id="sp-sig-file-input" accept="image/png, image/jpeg, image/webp" style="display: none;">
                                    
                                    <button type="button" class="sp-btn sp-btn-primary" id="sp-btn-upload-sig">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                        <span>Selecionar Imagem (JPG/PNG)</span>
                                    </button>

                                    <button type="button" class="sp-btn sp-btn-secondary" id="sp-btn-paste-sig" title="Cole da área de transferência (Ctrl + V)">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                                        </svg>
                                        <span>Colar Captura (Ctrl+V)</span>
                                    </button>

                                    <button type="button" class="sp-btn sp-btn-danger" id="sp-btn-del-sig" style="display: ${signatureSrc ? 'inline-flex' : 'none'};">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                        <span>Remover Assinatura</span>
                                    </button>
                                </div>
                            </div>

                            <div class="sp-card-group-title">Ajustes Finos de Proporção & Tinta</div>
                            <div class="sp-card-group">
                                <!-- 1. Altura da Imagem -->
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Tamanho / Altura da Imagem</div>
                                        <div class="sp-row-desc">Controle o tamanho da assinatura sobre a linha da receita.</div>
                                        <div class="sp-preset-chips" id="sp-chips-sig-size">
                                            <button type="button" class="sp-chip ${sigSize === 60 ? 'is-active' : ''}" data-val="60">60px</button>
                                            <button type="button" class="sp-chip ${sigSize === 80 ? 'is-active' : ''}" data-val="80">80px (Padrão)</button>
                                            <button type="button" class="sp-chip ${sigSize === 100 ? 'is-active' : ''}" data-val="100">100px</button>
                                            <button type="button" class="sp-chip ${sigSize === 120 ? 'is-active' : ''}" data-val="120">120px</button>
                                        </div>
                                    </div>
                                    <div class="sp-slider-control-box">
                                        <button type="button" class="sp-step-btn" id="sp-btn-size-minus" title="Diminuir 2px">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                        <div class="sp-slider-track-wrap">
                                            <input type="range" class="sp-range-slider" id="sp-sig-size" min="40" max="140" value="${sigSize}" step="2">
                                        </div>
                                        <button type="button" class="sp-step-btn" id="sp-btn-size-plus" title="Aumentar 2px">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                        <div class="sp-range-badge" id="sp-sig-size-val">${sigSize}px</div>
                                    </div>
                                </div>

                                <!-- 2. Intensidade da Tinta -->
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Intensidade / Opacidade da Tinta</div>
                                        <div class="sp-row-desc">Suaviza o traço da caneta para evitar excesso de contraste na impressão.</div>
                                        <div class="sp-preset-chips" id="sp-chips-sig-opacity">
                                            <button type="button" class="sp-chip ${sigOpacity === 70 ? 'is-active' : ''}" data-val="70">70% Suave</button>
                                            <button type="button" class="sp-chip ${sigOpacity === 85 ? 'is-active' : ''}" data-val="85">85% Realista</button>
                                            <button type="button" class="sp-chip ${sigOpacity === 95 ? 'is-active' : ''}" data-val="95">95% Padrão</button>
                                            <button type="button" class="sp-chip ${sigOpacity === 100 ? 'is-active' : ''}" data-val="100">100% Puro</button>
                                        </div>
                                    </div>
                                    <div class="sp-slider-control-box">
                                        <button type="button" class="sp-step-btn" id="sp-btn-opacity-minus" title="Diminuir 5%">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                        <div class="sp-slider-track-wrap">
                                            <input type="range" class="sp-range-slider" id="sp-sig-opacity" min="30" max="100" value="${sigOpacity}" step="5">
                                        </div>
                                        <button type="button" class="sp-step-btn" id="sp-btn-opacity-plus" title="Aumentar 5%">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        </button>
                                        <div class="sp-range-badge" id="sp-sig-opacity-val">${sigOpacity}%</div>
                                    </div>
                                </div>

                                <!-- 3. Alinhamento Horizontal -->
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Alinhamento do Carimbo sobre a Linha</div>
                                        <div class="sp-row-desc">Escolha a posição do carimbo e da assinatura em relação ao centro.</div>
                                    </div>
                                    <div class="sp-segmented" id="sp-seg-sig-align">
                                        <button type="button" class="sp-segment-btn ${sigAlign === 'left' ? 'is-active' : ''}" data-val="left">⬅️ Esquerda</button>
                                        <button type="button" class="sp-segment-btn ${sigAlign === 'center' ? 'is-active' : ''}" data-val="center">⏺️ Centralizado</button>
                                        <button type="button" class="sp-segment-btn ${sigAlign === 'right' ? 'is-active' : ''}" data-val="right">➡️ Direita</button>
                                    </div>
                                </div>

                                <!-- 4. Remoção de Fundo / Modo Tinta Pura -->
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Remoção de Fundo Inteligente (Modo Tinta Pura)</div>
                                        <div class="sp-row-desc">Mescla os traços da caneta na folha, eliminando o fundo cinza/branco da foto escaneada.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-sig-blend-mode" ${sigBlend ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <!-- CARD DE DICA PROFISSIONAL -->
                            <div class="sp-sig-pro-tip">
                                <div class="sp-tip-icon">💡</div>
                                <div class="sp-tip-content">
                                    <div class="sp-tip-title">Dica para o Melhor Resultado Clínico</div>
                                    <div class="sp-tip-text">Fotografe sua assinatura e carimbo com caneta azul ou preta em uma folha branca lisa, sob boa iluminação. Você também pode dar <strong>Ctrl + V</strong> a qualquer momento para colar diretamente uma captura de tela da assinatura.</div>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 7: RECEITUÁRIO & FOLHAS ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-receita' ? 'is-active' : ''}" id="pane-tab-receita">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">📄 Receituário, Folhas & Diagramação</h2>
                                <p class="sp-pane-desc">Controle como as prescrições são fatiadas em páginas A4 e as regras de impressão.</p>
                            </div>

                            <div class="sp-card-group-title">Divisão de Páginas</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Limite de Medicamentos por Folha (Receita Comum)</div>
                                        <div class="sp-row-desc">Quando atingir esse número, o sistema abrirá uma 2ª página automaticamente.</div>
                                    </div>
                                    <div class="sp-segmented" id="sp-seg-meds-limit">
                                        <button type="button" class="sp-segment-btn ${medsLimit === 4 ? 'is-active' : ''}" data-val="4">4 Itens</button>
                                        <button type="button" class="sp-segment-btn ${medsLimit === 5 ? 'is-active' : ''}" data-val="5">5 Itens</button>
                                        <button type="button" class="sp-segment-btn ${medsLimit === 6 ? 'is-active' : ''}" data-val="6">6 Itens</button>
                                        <button type="button" class="sp-segment-btn ${medsLimit === 7 ? 'is-active' : ''}" data-val="7">7 Itens</button>
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Formato de Data da Receita</div>
                                        <div class="sp-row-desc">Escolha entre extenso formal ou formato numérico condensado.</div>
                                    </div>
                                    <div class="sp-segmented" id="sp-seg-date-format">
                                        <button type="button" class="sp-segment-btn ${dateFormat === 'extenso' ? 'is-active' : ''}" data-val="extenso">Extenso (10 de Outubro...)</button>
                                        <button type="button" class="sp-segment-btn ${dateFormat === 'numerico' ? 'is-active' : ''}" data-val="numerico">Numérico (10/10/2026)</button>
                                    </div>
                                </div>
                            </div>

                            <div class="sp-card-group-title">Regras de Exibição & Impressão</div>
                            <div class="sp-card-group">
                                <div class="sp-row" style="background: rgba(56, 189, 248, 0.05); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; margin-bottom: 8px;">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label" style="color: #38bdf8; font-weight: 700;">🖨️ Central de Impressão & Seleção de Páginas (Print Hub)</div>
                                        <div class="sp-row-desc">Ao imprimir (Ctrl+P), exibe a tela ampliada para escolher quais páginas emitir e o formato (Impressão, PDF, HTML, DOCX). Se desativado, gera e imprime a receita direto.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-printhub" ${printHubEnabled ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Data Ativa por Padrão</div>
                                        <div class="sp-row-desc">Mantém o botão de data habilitado logo ao abrir qualquer nova receita.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-autodate" ${autoDate ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Data em Branco a partir da 2ª Via</div>
                                        <div class="sp-row-desc">Deixa os campos com traços (___/___/____) na segunda, terceira e quarta vias.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-firstdate" ${onlyFirstDate ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Linhas Divisórias Sutis entre Medicamentos</div>
                                        <div class="sp-row-desc">Insere uma linha pontilhada fina separando cada medicamento para clareza visual.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-dividerlines" ${dividerLines ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Numeração de Páginas no Receituário</div>
                                        <div class="sp-row-desc">Adiciona indicador sutil (ex: "Folha 1 de 2") no rodapé de cada via.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-pagenums" ${showPageNums ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Ocultar Cabeçalho na Impressão</div>
                                        <div class="sp-row-desc">Útil para clínicas que já utilizam folhas A4 timbradas na impressora.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-hideheader" ${hideHeaderPrint ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Ocultar Rodapé na Impressão</div>
                                        <div class="sp-row-desc">Oculta a área de assinatura pré-definida na folha física já timbrada.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-hidefooter" ${hideFooterPrint ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Iniciar Editor Livre Destrancado</div>
                                        <div class="sp-row-desc">Permite clicar e editar qualquer texto direto no papel sem precisar clicar no cadeado.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-unlockdefault" ${unlockDefault ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Ocultar Botão do Cadeado da Barra Principal</div>
                                        <div class="sp-row-desc">Esconde o botão flutuante para ganhar espaço na interface.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-lockhidden" ${lockHidden ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 8: CÓPIA PRONTUÁRIO (PEP) ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-pep' ? 'is-active' : ''}" id="pane-tab-pep">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">📋 Cópia para Prontuário Eletrônico (PEP)</h2>
                                <p class="sp-pane-desc">Ajuste o formato do texto copiado ao clicar no botão "Copiar Prescrição" para colar no prontuário.</p>
                            </div>

                            <div class="sp-card-group-title">Formatação do Texto Copiado</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Estilo de Listagem dos Itens</div>
                                        <div class="sp-row-desc">Como cada medicamento será prefixado no texto copiado.</div>
                                    </div>
                                    <div class="sp-segmented" id="sp-seg-copyformat">
                                        <button type="button" class="sp-segment-btn ${copyFormat === 'num' ? 'is-active' : ''}" data-val="num">1. 2. 3. (Numerado)</button>
                                        <button type="button" class="sp-segment-btn ${copyFormat === 'bullet' ? 'is-active' : ''}" data-val="bullet">• Marcador</button>
                                        <button type="button" class="sp-segment-btn ${copyFormat === 'hyphen' ? 'is-active' : ''}" data-val="hyphen">- Hífen</button>
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Incluir Registro de Data e Hora</div>
                                        <div class="sp-row-desc">Adiciona automaticamente [DD/MM/AAAA às HH:MM] no topo do texto copiado.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-copydatetime" ${copyDateTime ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Ativar Cabeçalho Personalizado no Prontuário</div>
                                        <div class="sp-row-desc">Insere uma frase inicial antes da lista de remédios.</div>
                                    </div>
                                    <label class="sp-switch">
                                        <input type="checkbox" id="sp-cfg-copyheader-enable" ${copyHeaderEnabled ? 'checked' : ''}>
                                        <span class="sp-slider"></span>
                                    </label>
                                </div>

                                <div class="sp-row" style="align-items: flex-start;">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Texto do Cabeçalho</div>
                                        <div class="sp-row-desc">Exemplo: "Paciente comparece solicitando renovação de receita."</div>
                                    </div>
                                    <textarea class="sp-textarea" id="sp-cfg-copyheader-text" style="min-height: 70px;">${copyHeaderText}</textarea>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Ação Pós-Impressão da Receita</div>
                                        <div class="sp-row-desc">Escolha se deseja limpar a tela ou manter a receita aberta após imprimir.</div>
                                    </div>
                                    <select class="sp-select" id="sp-cfg-postprint">
                                        <option value="clear" ${postPrint === 'clear' ? 'selected' : ''}>Limpar tela e preparar próximo paciente</option>
                                        <option value="keep" ${postPrint === 'keep' ? 'selected' : ''}>Manter receita intacta na tela</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 9: FORMULÁRIO LME ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-lme' ? 'is-active' : ''}" id="pane-tab-lme">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">💎 Formulário LME (Componente Especializado)</h2>
                                <p class="sp-pane-desc">Configure o fundo oficial A4 escaneado para preenchimento de Medicamentos de Alto Custo.</p>
                            </div>

                            <div class="sp-card-group-title">Folha de Fundo do LME</div>
                            <div class="sp-card-group" style="padding: 24px; display: flex; flex-direction: column; align-items: center;">
                                <div style="width: 200px; height: 280px; background: rgba(0,0,0,0.4); border: 2px dashed rgba(255,255,255,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                                    <img id="sp-lme-preview-thumb" src="${lmeBgSrc}" style="display: ${lmeBgSrc ? 'block' : 'none'}; width: 100%; height: 100%; object-fit: contain;">
                                    <span id="sp-lme-thumb-placeholder" style="display: ${lmeBgSrc ? 'none' : 'block'}; font-size: 11px; color: #64748b; text-align: center; padding: 10px;">Sem formulário carregado (Sairá em folha branca)</span>
                                </div>

                                <div style="display: flex; gap: 12px; margin-top: 20px;">
                                    <input type="file" id="sp-lme-file-input" accept="image/png, image/jpeg" style="display: none;">
                                    <button type="button" class="sp-btn sp-btn-secondary" id="sp-btn-upload-lme">📄 Carregar Fundo LME Oficial</button>
                                    <button type="button" class="sp-btn sp-btn-danger" id="sp-btn-del-lme" style="display: ${lmeBgSrc ? 'inline-flex' : 'none'};">🗑️ Limpar Imagem</button>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 10: MEDICAMENTOS BASE ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-custom-meds' ? 'is-active' : ''}" id="pane-tab-custom-meds">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">🧪 Medicamentos Personalizados & Base</h2>
                                <p class="sp-pane-desc">Cadastre fórmulas magistrais, medicações raras ou apresentações extras da sua unidade.</p>
                            </div>

                            <div class="sp-card-group-title">Novo Medicamento</div>
                            <div class="sp-card-group" style="padding: 16px;">
                                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                    <input type="text" class="sp-input" id="sp-new-med-name" placeholder="Ex: PREGABALINA 75MG" style="flex: 2; min-width: 220px; text-transform: uppercase;">
                                    <select class="sp-select" id="sp-new-med-type" style="flex: 1; min-width: 160px;">
                                        <option value="COMP">Comprimido / Cápsula</option>
                                        <option value="LIQUID">Gotas / Solução</option>
                                        <option value="INJECT">Injetável / Depot</option>
                                    </select>
                                    <button type="button" class="sp-btn sp-btn-primary" id="sp-btn-add-med">➕ Adicionar</button>
                                </div>
                            </div>

                            <div class="sp-card-group-title" style="justify-content: space-between;">
                                <span>Medicamentos Cadastrados</span>
                                <input type="text" class="sp-input" id="sp-filter-custom-meds" placeholder="Filtrar..." style="width: 180px; padding: 4px 10px; font-size: 11.5px;">
                            </div>
                            <div class="sp-card-group" style="padding: 0; max-height: 300px; overflow-y: auto;">
                                <div id="sp-custom-meds-table"></div>
                            </div>
                        </div>

                        <!-- ══ ABA 11: FAVORITOS CLÍNICOS ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-favoritos' ? 'is-active' : ''}" id="pane-tab-favoritos">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">⭐ Favoritos & Recomendações Prioritárias</h2>
                                <p class="sp-pane-desc">Defina as medicações mais frequentes da sua rotina para aparecerem no topo da busca com prioridade.</p>
                            </div>

                            <div class="sp-card-group-title" style="justify-content: space-between;">
                                <span>Editor em Lote (Um Medicamento por Linha)</span>
                                <button type="button" class="sp-btn sp-btn-ghost" id="sp-btn-sort-favs" style="padding: 4px 10px; font-size: 11px;">🔤 Ordenar A-Z</button>
                            </div>
                            <div class="sp-card-group" style="padding: 16px;">
                                <textarea class="sp-textarea" id="sp-cfg-favs" style="min-height: 280px; font-family: monospace; font-size: 13px;" placeholder="CLONAZEPAM 2MG&#10;DIPIRONA 500MG&#10;SERTRALINA 50MG&#10;RISPERIDONA 2MG">${favsText}</textarea>
                                <div style="margin-top: 10px; font-size: 11.5px; color: #94a3b8; display: flex; justify-content: space-between;">
                                    <span id="sp-favs-count">0 favoritos cadastrados</span>
                                    <span>Pressione Enter para adicionar outro</span>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 12: BACKUP & ARMAZENAMENTO ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-backup' ? 'is-active' : ''}" id="pane-tab-backup">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">💽 Armazenamento, Backup & Segurança</h2>
                                <p class="sp-pane-desc">Mantenha seus prontuários e configurações seguros com backups automáticos em arquivo JSON.</p>
                            </div>

                            <div class="sp-card-group-title">Métricas Locais de Armazenamento</div>
                            <div class="sp-card-group" style="padding: 16px;">
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;">
                                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 14px; border-radius: 10px; text-align: center;">
                                        <div style="font-size: 22px; font-weight: 800; color: #38bdf8;" id="sp-stat-kb">0 KB</div>
                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Uso de Memória Local</div>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 14px; border-radius: 10px; text-align: center;">
                                        <div style="font-size: 22px; font-weight: 800; color: #10b981;" id="sp-stat-profiles">0</div>
                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Perfis de Usuários</div>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 14px; border-radius: 10px; text-align: center;">
                                        <div style="font-size: 22px; font-weight: 800; color: #a855f7;" id="sp-stat-patients">0</div>
                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Pacientes no Histórico</div>
                                    </div>
                                </div>
                            </div>

                            <div class="sp-card-group-title">Exportação & Restauração Completa</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Gerar Arquivo de Backup (JSON)</div>
                                        <div class="sp-row-desc">Exporta todos os perfis, pacientes, histórico, atalhos e configurações para um arquivo seguro.</div>
                                    </div>
                                    <button type="button" class="sp-btn sp-btn-secondary" id="sp-btn-export-backup">💾 Fazer Backup Completo</button>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Restaurar de Arquivo de Backup</div>
                                        <div class="sp-row-desc">Carregue um arquivo JSON gerado anteriormente para recuperar todos os seus dados.</div>
                                    </div>
                                    <input type="file" id="sp-import-db-input" accept=".json" style="display: none;">
                                    <button type="button" class="sp-btn sp-btn-secondary" id="sp-btn-import-backup">📥 Importar Arquivo JSON</button>
                                </div>
                            </div>

                            <div class="sp-card-group-title" style="color: #f87171;">Zona de Perigo</div>
                            <div class="sp-card-group" style="border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.03);">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label" style="color: #f87171;">Apagar Histórico de Pacientes e Prontuários</div>
                                        <div class="sp-row-desc">Exclui todas as evoluções clínicas salvas no computador. Não afeta seus perfis ou receitas ativas.</div>
                                    </div>
                                    <button type="button" class="sp-btn sp-btn-danger" id="sp-btn-wipe-db">⚠️ Limpar Banco de Dados</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Rodapé de Ações macOS -->
                <div class="sp-footer">
                    <div class="sp-footer-left">
                        <span style="font-size: 11.5px; color: #64748b;">Alterações visuais e clínicas sincronizadas em tempo real.</span>
                    </div>
                    <div class="sp-footer-right">
                        <button type="button" class="sp-btn sp-btn-ghost" id="sp-btn-cancel">Fechar</button>
                        <button type="button" class="sp-btn sp-btn-primary" id="sp-btn-save-all">💾 Salvar Configurações</button>
                    </div>
                </div>
            </div>
        `;

        try { setupSettingsEvents(overlay); } catch (e) { console.error('Erro em setupSettingsEvents:', e); }
        try { renderCustomMedsTable(); } catch (e) { console.error('Erro em renderCustomMedsTable:', e); }
        try { updateFavoritesCount(); } catch (e) { console.error('Erro em updateFavoritesCount:', e); }
        try { updateStorageMetrics(); } catch (e) { console.error('Erro em updateStorageMetrics:', e); }
    }

    // 7. Configuração dos Eventos e Listeners dos Controles
    function setupSettingsEvents(overlay) {
        // Fechar janela
        const closeBtn = overlay.querySelector('#sp-close-dot');
        const cancelBtn = overlay.querySelector('#sp-btn-cancel');
        if (closeBtn) closeBtn.onclick = closeSettingsPro;
        if (cancelBtn) cancelBtn.onclick = closeSettingsPro;

        overlay.onclick = (e) => {
            if (e.target === overlay) closeSettingsPro();
        };

        // Navegação de abas na sidebar
        const navItems = overlay.querySelectorAll('.sp-nav-item');
        const panes = overlay.querySelectorAll('.sp-tab-pane');
        navItems.forEach(item => {
            item.onclick = () => {
                const tabId = item.dataset.tab;
                activeTabId = tabId;
                navItems.forEach(n => n.classList.remove('is-active'));
                panes.forEach(p => p.classList.remove('is-active'));
                item.classList.add('is-active');
                const targetPane = overlay.querySelector(`#pane-${tabId}`);
                if (targetPane) targetPane.classList.add('is-active');
                playProSound('click');
            };
        });

        // Mecanismo de Busca em Tempo Real
        const searchInput = overlay.querySelector('#sp-search-box');
        const searchClear = overlay.querySelector('#sp-search-clear');
        if (searchInput) {
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase().trim();
                if (searchClear) searchClear.style.display = term ? 'block' : 'none';

                if (!term) {
                    overlay.querySelectorAll('.sp-row, .sp-card-group-title, .sp-kb-card').forEach(el => el.style.display = '');
                    return;
                }

                let firstMatchPane = null;
                panes.forEach(pane => {
                    let hasMatchInPane = false;
                    const rows = pane.querySelectorAll('.sp-row, .sp-kb-card');
                    rows.forEach(r => {
                        const text = r.innerText.toLowerCase();
                        if (text.includes(term)) {
                            r.style.display = '';
                            hasMatchInPane = true;
                        } else {
                            r.style.display = 'none';
                        }
                    });

                    if (hasMatchInPane && !firstMatchPane) {
                        firstMatchPane = pane.id.replace('pane-', '');
                    }
                });

                if (firstMatchPane) {
                    navItems.forEach(n => n.classList.remove('is-active'));
                    panes.forEach(p => p.classList.remove('is-active'));
                    const navBtn = overlay.querySelector(`.sp-nav-item[data-tab="${firstMatchPane}"]`);
                    const paneEl = overlay.querySelector(`#pane-${firstMatchPane}`);
                    if (navBtn) navBtn.classList.add('is-active');
                    if (paneEl) paneEl.classList.add('is-active');
                }
            };

            if (searchClear) {
                searchClear.onclick = () => {
                    searchInput.value = '';
                    searchClear.style.display = 'none';
                    overlay.querySelectorAll('.sp-row, .sp-card-group-title, .sp-kb-card').forEach(el => el.style.display = '');
                    searchInput.focus();
                };
            }
        }

        // Seletor de Tema Imediato
        const themeSelect = overlay.querySelector('#sp-cfg-theme');
        if (themeSelect) {
            themeSelect.onchange = (e) => {
                applySystemTheme(e.target.value);
                playProSound('click');
            };
        }

        // Cores de Acento
        const dots = overlay.querySelectorAll('.sp-color-dot');
        dots.forEach(dot => {
            dot.onclick = () => {
                dots.forEach(d => d.classList.remove('is-selected'));
                dot.classList.add('is-selected');
                const hex = dot.dataset.color;
                applyAccentColor(hex);
                playProSound('click');
            };
        });

        // Escala de Fonte
        setupSegmentedControl(overlay, '#sp-seg-font-scale', (val) => {
            applyPreviewScale(val);
            playProSound('click');
        });

        // Efeito de Desfoque
        const blurToggle = overlay.querySelector('#sp-cfg-blur');
        if (blurToggle) {
            blurToggle.onchange = (e) => {
                applyBlurEffect(e.target.checked);
                playProSound('toggle');
            };
        }

        // Sons de Interface
        const soundToggle = overlay.querySelector('#sp-cfg-sounds');
        if (soundToggle) {
            soundToggle.onchange = (e) => {
                localStorage.setItem('cerebrum_sound_enabled', e.target.checked ? 'true' : 'false');
                playProSound('toggle');
            };
        }

        // Limite de Medicações
        setupSegmentedControl(overlay, '#sp-seg-meds-limit', (val) => {
            localStorage.setItem('cerebrum_meds_limit', val);
            if (window.App && typeof window.App.render === 'function') window.App.render();
            playProSound('click');
        });

        // Formato da Data
        setupSegmentedControl(overlay, '#sp-seg-date-format', (val) => {
            localStorage.setItem('cerebrum_date_format', val);
            if (window.App && typeof window.App.render === 'function') window.App.render();
            playProSound('click');
        });

        // Linhas Divisórias Sutis
        const dividerToggle = overlay.querySelector('#sp-cfg-dividerlines');
        if (dividerToggle) {
            dividerToggle.onchange = (e) => {
                localStorage.setItem('cerebrum_divider_lines', e.target.checked ? 'true' : 'false');
                playProSound('toggle');
            };
        }

        // Numeração de Páginas
        const pageNumsToggle = overlay.querySelector('#sp-cfg-pagenums');
        if (pageNumsToggle) {
            pageNumsToggle.onchange = (e) => {
                localStorage.setItem('cerebrum_page_nums', e.target.checked ? 'true' : 'false');
                playProSound('toggle');
            };
        }

        // Ocultação de Cabeçalho / Rodapé na Impressão
        const hideHeaderToggle = overlay.querySelector('#sp-cfg-hideheader');
        if (hideHeaderToggle) {
            hideHeaderToggle.onchange = (e) => {
                document.body.classList.toggle('sp-hide-header-print', e.target.checked);
                playProSound('toggle');
            };
        }

        const hideFooterToggle = overlay.querySelector('#sp-cfg-hidefooter');
        if (hideFooterToggle) {
            hideFooterToggle.onchange = (e) => {
                document.body.classList.toggle('sp-hide-footer-print', e.target.checked);
                playProSound('toggle');
            };
        }

        // Modo Lote & IA Toggles Imediatos
        const loteTradesToggle = overlay.querySelector('#sp-cfg-lote-tradenames');
        if (loteTradesToggle) {
            loteTradesToggle.onchange = (e) => {
                localStorage.setItem('cerebrum_lote_tradename_convert', e.target.checked ? 'true' : 'false');
                playProSound('toggle');
            };
        }

        const loteIntellisenseToggle = overlay.querySelector('#sp-cfg-lote-intellisense');
        if (loteIntellisenseToggle) {
            loteIntellisenseToggle.onchange = (e) => {
                const isChecked = !!e.target.checked;
                localStorage.setItem('cerebrum_lote_intellisense', isChecked ? 'true' : 'false');
                window.dispatchEvent(new CustomEvent('cerebrum_lote_intellisense_change', { detail: { enabled: isChecked } }));
                playProSound('toggle');
            };
        }

        const loteSanitizeToggle = overlay.querySelector('#sp-cfg-lote-sanitize');
        if (loteSanitizeToggle) {
            loteSanitizeToggle.onchange = (e) => {
                localStorage.setItem('cerebrum_lote_autoclean', e.target.checked ? 'true' : 'false');
                playProSound('toggle');
            };
        }

        // ══ STUDIO DE ASSINATURA & CARIMBO ══
        const sigSizeSlider = overlay.querySelector('#sp-sig-size');
        const sigSizeVal = overlay.querySelector('#sp-sig-size-val');
        const sigPreview = overlay.querySelector('#sp-sig-preview-img');
        const sigPlaceholder = overlay.querySelector('#sp-sig-empty-placeholder');
        const sigOpacitySlider = overlay.querySelector('#sp-sig-opacity');
        const sigOpacityVal = overlay.querySelector('#sp-sig-opacity-val');
        const btnUploadSig = overlay.querySelector('#sp-btn-upload-sig');
        const sigFileInput = overlay.querySelector('#sp-sig-file-input');
        const btnPasteSig = overlay.querySelector('#sp-btn-paste-sig');
        const btnDelSig = overlay.querySelector('#sp-btn-del-sig');
        const sigPaperDropzone = overlay.querySelector('#sp-paper-dropzone');
        const paperFooterArea = overlay.querySelector('#sp-paper-footer-area');
        const paperSigSlot = overlay.querySelector('#sp-paper-sig-slot');
        const segSigAlign = overlay.querySelector('#sp-seg-sig-align');
        const sigBlendToggle = overlay.querySelector('#sp-sig-blend-mode');

        const updateSigDisplay = (src) => {
            if (src) {
                if (sigPreview) {
                    sigPreview.src = src;
                    sigPreview.style.display = 'inline-block';
                }
                if (sigPlaceholder) sigPlaceholder.style.display = 'none';
                if (btnDelSig) btnDelSig.style.display = 'inline-flex';
            } else {
                if (sigPreview) {
                    sigPreview.src = '';
                    sigPreview.style.display = 'none';
                }
                if (sigPlaceholder) sigPlaceholder.style.display = 'flex';
                if (btnDelSig) btnDelSig.style.display = 'none';
            }
        };

        const updateSliderProgress = (slider) => {
            if (!slider) return;
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            const val = parseFloat(slider.value) || 0;
            const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
            slider.style.backgroundSize = `${pct}% 100%`;
        };

        const btnSizeMinus = overlay.querySelector('#sp-btn-size-minus');
        const btnSizePlus = overlay.querySelector('#sp-btn-size-plus');
        const btnOpacityMinus = overlay.querySelector('#sp-btn-opacity-minus');
        const btnOpacityPlus = overlay.querySelector('#sp-btn-opacity-plus');

        if (sigSizeSlider && sigSizeVal) {
            updateSliderProgress(sigSizeSlider);
            sigSizeSlider.oninput = (e) => {
                sigSizeVal.innerText = `${e.target.value}px`;
                updateSliderProgress(sigSizeSlider);
                if (sigPreview) sigPreview.style.maxHeight = `${e.target.value}px`;
                applySignatureSettings(e.target.value, sigOpacitySlider ? sigOpacitySlider.value : 95);
                // Atualiza chips ativos
                overlay.querySelectorAll('#sp-chips-sig-size .sp-chip').forEach(c => {
                    c.classList.toggle('is-active', parseInt(c.dataset.val) === parseInt(e.target.value));
                });
            };
        }

        if (btnSizeMinus && sigSizeSlider) {
            btnSizeMinus.onclick = () => {
                const cur = parseInt(sigSizeSlider.value) || 80;
                const next = Math.max(parseInt(sigSizeSlider.min) || 40, cur - 2);
                sigSizeSlider.value = next;
                sigSizeSlider.dispatchEvent(new Event('input'));
                playProSound('click');
            };
        }
        if (btnSizePlus && sigSizeSlider) {
            btnSizePlus.onclick = () => {
                const cur = parseInt(sigSizeSlider.value) || 80;
                const next = Math.min(parseInt(sigSizeSlider.max) || 140, cur + 2);
                sigSizeSlider.value = next;
                sigSizeSlider.dispatchEvent(new Event('input'));
                playProSound('click');
            };
        }

        // Chips de Tamanho
        const chipsSize = overlay.querySelector('#sp-chips-sig-size');
        if (chipsSize && sigSizeSlider) {
            chipsSize.querySelectorAll('.sp-chip').forEach(chip => {
                chip.onclick = () => {
                    sigSizeSlider.value = chip.dataset.val;
                    sigSizeSlider.dispatchEvent(new Event('input'));
                    playProSound('click');
                };
            });
        }

        if (sigOpacitySlider && sigOpacityVal) {
            updateSliderProgress(sigOpacitySlider);
            sigOpacitySlider.oninput = (e) => {
                sigOpacityVal.innerText = `${e.target.value}%`;
                updateSliderProgress(sigOpacitySlider);
                if (sigPreview) sigPreview.style.opacity = e.target.value / 100;
                applySignatureSettings(sigSizeSlider ? sigSizeSlider.value : 80, e.target.value);
                // Atualiza chips ativos
                overlay.querySelectorAll('#sp-chips-sig-opacity .sp-chip').forEach(c => {
                    c.classList.toggle('is-active', parseInt(c.dataset.val) === parseInt(e.target.value));
                });
            };
        }

        if (btnOpacityMinus && sigOpacitySlider) {
            btnOpacityMinus.onclick = () => {
                const cur = parseInt(sigOpacitySlider.value) || 95;
                const next = Math.max(parseInt(sigOpacitySlider.min) || 30, cur - 5);
                sigOpacitySlider.value = next;
                sigOpacitySlider.dispatchEvent(new Event('input'));
                playProSound('click');
            };
        }
        if (btnOpacityPlus && sigOpacitySlider) {
            btnOpacityPlus.onclick = () => {
                const cur = parseInt(sigOpacitySlider.value) || 95;
                const next = Math.min(parseInt(sigOpacitySlider.max) || 100, cur + 5);
                sigOpacitySlider.value = next;
                sigOpacitySlider.dispatchEvent(new Event('input'));
                playProSound('click');
            };
        }

        // Chips de Opacidade
        const chipsOpacity = overlay.querySelector('#sp-chips-sig-opacity');
        if (chipsOpacity && sigOpacitySlider) {
            chipsOpacity.querySelectorAll('.sp-chip').forEach(chip => {
                chip.onclick = () => {
                    sigOpacitySlider.value = chip.dataset.val;
                    sigOpacitySlider.dispatchEvent(new Event('input'));
                    playProSound('click');
                };
            });
        }

        // Alinhamento Horizontal (Segmented Control)
        if (segSigAlign) {
            segSigAlign.querySelectorAll('.sp-segment-btn').forEach(btn => {
                btn.onclick = () => {
                    segSigAlign.querySelectorAll('.sp-segment-btn').forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    const val = btn.dataset.val || 'center';
                    if (paperFooterArea) paperFooterArea.dataset.align = val;
                    if (paperSigSlot) paperSigSlot.style.textAlign = val;
                    localStorage.setItem('cerebrum_sig_align', val);
                    playProSound('click');
                };
            });
        }

        // Modo Tinta Pura (Multiply / Blend)
        if (sigBlendToggle) {
            sigBlendToggle.onchange = (e) => {
                const isMultiply = e.target.checked;
                if (sigPreview) sigPreview.style.mixBlendMode = isMultiply ? 'multiply' : 'normal';
                localStorage.setItem('cerebrum_sig_blend', isMultiply ? 'true' : 'false');
                playProSound('click');
            };
        }

        // Função Universal de Processamento de Imagem
        const processSigFile = (file) => {
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showProToast('Formato não suportado. Envie uma imagem JPG ou PNG.', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                tempSignatureImg = ev.target.result;
                updateSigDisplay(tempSignatureImg);
                playProSound('success');
                showProToast('Assinatura e carimbo carregados com sucesso!', 'success');
            };
            reader.readAsDataURL(file);
        };

        // Upload de Imagem via Botão
        if (btnUploadSig && sigFileInput) {
            btnUploadSig.onclick = () => sigFileInput.click();
            sigFileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) processSigFile(file);
            };
        }

        // Clique no Placeholder Vazio
        if (sigPlaceholder && sigFileInput) {
            sigPlaceholder.onclick = () => sigFileInput.click();
        }

        // Drag & Drop Diretamente no Papel Simulado
        if (sigPaperDropzone) {
            sigPaperDropzone.ondragover = (e) => {
                e.preventDefault();
                sigPaperDropzone.classList.add('drag-over');
            };
            sigPaperDropzone.ondragleave = (e) => {
                if (!sigPaperDropzone.contains(e.relatedTarget)) {
                    sigPaperDropzone.classList.remove('drag-over');
                }
            };
            sigPaperDropzone.ondrop = (e) => {
                e.preventDefault();
                sigPaperDropzone.classList.remove('drag-over');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                    processSigFile(e.dataTransfer.files[0]);
                }
            };
        }

        // Colar da Área de Transferência (Botão + Ctrl+V)
        if (btnPasteSig) {
            btnPasteSig.onclick = async () => {
                try {
                    if (navigator.clipboard && navigator.clipboard.read) {
                        const items = await navigator.clipboard.read();
                        for (const item of items) {
                            for (const type of item.types) {
                                if (type.startsWith('image/')) {
                                    const blob = await item.getType(type);
                                    processSigFile(blob);
                                    return;
                                }
                            }
                        }
                    }
                    showProToast('Pressione Ctrl + V na tela para colar a imagem copiada.', 'info');
                } catch(err) {
                    showProToast('Pressione Ctrl + V na tela para colar a imagem copiada.', 'info');
                }
            };
        }

        // Listener Global de Paste (Ctrl+V) enquanto na aba de assinatura
        if (sigPasteHandler) {
            window.removeEventListener('paste', sigPasteHandler);
        }
        sigPasteHandler = (e) => {
            const activeTab = overlay.querySelector('.sp-tab-pane.is-active');
            if (activeTab && activeTab.id === 'pane-tab-assinatura') {
                const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
                if (items) {
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                            const blob = items[i].getAsFile();
                            processSigFile(blob);
                            e.preventDefault();
                            break;
                        }
                    }
                }
            }
        };
        window.addEventListener('paste', sigPasteHandler);

        // Remover Assinatura
        if (btnDelSig) {
            btnDelSig.onclick = () => {
                tempSignatureImg = '';
                updateSigDisplay('');
                playProSound('delete');
                showProToast('Assinatura removida.', 'info');
            };
        }

        // Upload de LME
        const btnUploadLme = overlay.querySelector('#sp-btn-upload-lme');
        const lmeFileInput = overlay.querySelector('#sp-lme-file-input');
        const lmeThumb = overlay.querySelector('#sp-lme-preview-thumb');
        const lmePlaceholder = overlay.querySelector('#sp-lme-thumb-placeholder');
        const btnDelLme = overlay.querySelector('#sp-btn-del-lme');
        if (btnUploadLme && lmeFileInput) {
            btnUploadLme.onclick = () => lmeFileInput.click();
            lmeFileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        tempLmeBg = ev.target.result;
                        if (lmeThumb) {
                            lmeThumb.src = tempLmeBg;
                            lmeThumb.style.display = 'block';
                        }
                        if (lmePlaceholder) lmePlaceholder.style.display = 'none';
                        if (btnDelLme) btnDelLme.style.display = 'inline-flex';
                        playProSound('success');
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
        if (btnDelLme) {
            btnDelLme.onclick = () => {
                tempLmeBg = '';
                if (lmeThumb) {
                    lmeThumb.src = '';
                    lmeThumb.style.display = 'none';
                }
                if (lmePlaceholder) lmePlaceholder.style.display = 'block';
                btnDelLme.style.display = 'none';
                playProSound('delete');
            };
        }

        // Adicionar Medicamento Personalizado
        const btnAddMed = overlay.querySelector('#sp-btn-add-med');
        const newMedName = overlay.querySelector('#sp-new-med-name');
        const newMedType = overlay.querySelector('#sp-new-med-type');
        if (btnAddMed && newMedName && newMedType) {
            btnAddMed.onclick = () => {
                const name = newMedName.value.trim().toUpperCase();
                const type = newMedType.value;
                if (!name) {
                    alert("Por favor, digite o nome da medicação e sua concentração.");
                    return;
                }
                if (tempCustomMeds.some(m => m.name === name)) {
                    alert("Esta medicação já está cadastrada.");
                    return;
                }
                tempCustomMeds.unshift({ name, type });
                newMedName.value = '';
                renderCustomMedsTable();
                playProSound('success');

                // Sincroniza imediatamente com App
                if (window.App) {
                    if (!window.App.config) window.App.config = {};
                    window.App.config.customMeds = tempCustomMeds;
                    if (typeof window.App.invalidateMedsCache === 'function') window.App.invalidateMedsCache();
                    if (typeof window.App.renderCustomMedsList === 'function') window.App.renderCustomMedsList();
                }
            };
        }

        // Filtro de Medicamentos
        const filterMedsInput = overlay.querySelector('#sp-filter-custom-meds');
        if (filterMedsInput) {
            filterMedsInput.oninput = (e) => {
                const q = e.target.value.toLowerCase().trim();
                renderCustomMedsTable(q);
            };
        }

        // Favoritos: Ordenar A-Z e Contador
        const btnSortFavs = overlay.querySelector('#sp-btn-sort-favs');
        const favsArea = overlay.querySelector('#sp-cfg-favs');
        if (btnSortFavs && favsArea) {
            btnSortFavs.onclick = () => {
                const lines = favsArea.value.split('\n').map(l => l.trim()).filter(Boolean);
                lines.sort((a, b) => a.localeCompare(b, 'pt-BR'));
                favsArea.value = lines.join('\n');
                updateFavoritesCount();
                playProSound('click');
            };
            favsArea.oninput = updateFavoritesCount;
        }

        // ══════════════════════════════════════════════════════════════════════
        // ESTÚDIO DE UNIDADES DE ATENDIMENTO & CABEÇALHO ADAPTATIVO
        // ══════════════════════════════════════════════════════════════════════

        function showProToast(msg, type = 'info') {
            let toast = document.getElementById('sp-floating-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'sp-floating-toast';
                document.body.appendChild(toast);
            }
            toast.className = `sp-toast-notification sp-toast-${type}`;
            toast.innerHTML = `<span>${msg}</span>`;
            toast.style.display = 'flex';
            clearTimeout(toast._timeout);
            toast._timeout = setTimeout(() => {
                if (toast) toast.style.display = 'none';
            }, 3000);
        }

        function updateLivePaperSimulator() {
            const title = (overlay.querySelector('#sp-cfg-unittitle')?.value || '').trim() || 'NOME DA UNIDADE';
            const sub = (overlay.querySelector('#sp-cfg-unitsub')?.value || '').trim();
            const addr = (overlay.querySelector('#sp-cfg-unitaddr')?.value || '').trim();
            const city = (overlay.querySelector('#sp-cfg-unitcity')?.value || '').trim();

            const paperTitle = overlay.querySelector('#sp-paper-txt-title');
            const paperSub = overlay.querySelector('#sp-paper-txt-sub');
            const paperAddr = overlay.querySelector('#sp-paper-txt-addr');
            const heroName = overlay.querySelector('#sp-hero-unit-name');
            const heroSub = overlay.querySelector('#sp-hero-unit-sub');

            if (paperTitle) paperTitle.innerText = title;
            if (paperSub) paperSub.innerText = sub;
            if (paperAddr) paperAddr.innerHTML = addr.replace(/\n/g, '<br>');
            if (heroName) heroName.innerText = title;
            if (heroSub) heroSub.innerText = `${sub ? sub + ' • ' : ''}${city || 'Feira de Santana - BA'}`;

            // Left Logo (Prefeitura / Brasão)
            const imgLeft = overlay.querySelector('#sp-paper-img-left');
            const noLogoLeft = overlay.querySelector('#sp-paper-no-logo-left');
            const thumbLeft = overlay.querySelector('#sp-thumb-logo-pref');
            const emptyLeft = overlay.querySelector('#sp-empty-logo-pref');

            if (tempUnitLogoPref) {
                if (imgLeft) { imgLeft.src = tempUnitLogoPref; imgLeft.style.display = 'inline-block'; }
                if (noLogoLeft) noLogoLeft.style.display = 'none';
                if (thumbLeft) { thumbLeft.src = tempUnitLogoPref; thumbLeft.style.display = 'inline-block'; }
                if (emptyLeft) emptyLeft.style.display = 'none';
            } else {
                if (imgLeft) imgLeft.style.display = 'none';
                if (noLogoLeft) noLogoLeft.style.display = 'inline-block';
                if (thumbLeft) thumbLeft.style.display = 'none';
                if (emptyLeft) emptyLeft.style.display = 'inline-block';
            }

            // Right Logo (Farmácia / SUS / Clínica)
            const imgRight = overlay.querySelector('#sp-paper-img-right');
            const noLogoRight = overlay.querySelector('#sp-paper-no-logo-right');
            const thumbRight = overlay.querySelector('#sp-thumb-logo-farm');
            const emptyRight = overlay.querySelector('#sp-empty-logo-farm');

            if (tempUnitLogoFarm) {
                if (imgRight) { imgRight.src = tempUnitLogoFarm; imgRight.style.display = 'inline-block'; }
                if (noLogoRight) noLogoRight.style.display = 'none';
                if (thumbRight) { thumbRight.src = tempUnitLogoFarm; thumbRight.style.display = 'inline-block'; }
                if (emptyRight) emptyRight.style.display = 'none';
            } else {
                if (imgRight) imgRight.style.display = 'none';
                if (noLogoRight) noLogoRight.style.display = 'inline-block';
                if (thumbRight) thumbRight.style.display = 'none';
                if (emptyRight) emptyRight.style.display = 'inline-block';
            }
        }

        function populateUnitForm(unit) {
            if (!unit) return;
            const inputId = overlay.querySelector('#sp-cfg-unitid');
            const inputTitle = overlay.querySelector('#sp-cfg-unittitle');
            const inputSub = overlay.querySelector('#sp-cfg-unitsub');
            const inputCnes = overlay.querySelector('#sp-cfg-unitcnes');
            const inputCity = overlay.querySelector('#sp-cfg-unitcity');
            const inputTel = overlay.querySelector('#sp-cfg-unittel');
            const inputAddr = overlay.querySelector('#sp-cfg-unitaddr');
            const badgeId = overlay.querySelector('#sp-editing-unit-id-badge');

            if (inputId) inputId.value = unit.id || '';
            if (inputTitle) inputTitle.value = unit.name || '';
            if (inputSub) inputSub.value = unit.sub || '';
            if (inputCnes) inputCnes.value = unit.cnes || '';
            if (inputCity) inputCity.value = unit.city || 'Feira de Santana - BA';
            if (inputTel) inputTel.value = unit.tel || '';
            if (inputAddr) inputAddr.value = unit.addr || '';
            if (badgeId) badgeId.innerText = `ID: ${unit.id || 'novo'}`;

            tempUnitLogoPref = unit.logoPref || '';
            tempUnitLogoFarm = unit.logoFarm || '';

            updateLivePaperSimulator();
        }

        function renderSettingsProUnitCards() {
            const container = overlay.querySelector('#sp-units-cards-grid');
            if (!container || !window.App || !window.App.UnitsDB) return;

            try {
                const unitsDB = window.App.UnitsDB;
                const allUnits = (typeof unitsDB.get === 'function') ? unitsDB.get() : [];
                let activeId = 'unit_caps3_joao_carlos';
                if (typeof unitsDB.getActive === 'function') {
                    activeId = unitsDB.getActive();
                } else if (typeof unitsDB.getActiveId === 'function') {
                    activeId = unitsDB.getActiveId();
                } else if (typeof unitsDB.getActiveUnit === 'function') {
                    const u = unitsDB.getActiveUnit();
                    if (u && u.id) activeId = u.id;
                } else {
                    activeId = localStorage.getItem('cerebrum_active_unit_id') || (allUnits[0] ? allUnits[0].id : 'unit_caps3_joao_carlos');
                }
                const currentEditingId = overlay.querySelector('#sp-cfg-unitid')?.value || activeId;

            let html = '';
            allUnits.forEach(u => {
                const isActive = (u.id === activeId);
                const isEditing = (u.id === currentEditingId);
                const badgeLabel = u.badge || (u.isCustom ? 'Personalizada' : 'SUS Oficial');
                const isHospital = u.name.toLowerCase().includes('hospital');
                const iconCategory = isHospital ? '🏛️' : (u.name.toLowerCase().includes('ad') ? '💊' : '🏥');

                html += `
                    <div class="sp-unit-card ${isActive ? 'is-active-unit' : ''} ${isEditing ? 'is-editing-unit' : ''}" data-unit-id="${u.id}">
                        <div class="sp-unit-card-header">
                            <div class="sp-apple-badge-pill">
                                <span class="sp-apple-badge-icon">${iconCategory}</span>
                                <span class="sp-unit-badge-tag ${isActive ? 'badge-primary' : ''}">${badgeLabel}</span>
                            </div>
                            <div class="sp-apple-radio ${isActive ? 'is-selected' : ''}" title="${isActive ? 'Ativa no Receituário' : 'Clique para Selecionar'}">
                                ${isActive ? `
                                    <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5"></polyline>
                                    </svg>
                                ` : `
                                    <span class="sp-apple-radio-circle"></span>
                                `}
                            </div>
                        </div>

                        <div class="sp-unit-card-body">
                            <div class="sp-unit-card-title">${u.name}</div>
                            <div class="sp-unit-card-sub">${u.sub || 'Secretaria Municipal de Saúde'}</div>
                            <div class="sp-unit-card-meta">
                                <span class="sp-meta-chip">📍 ${u.city || 'Feira de Santana - BA'}</span>
                                ${u.tel ? `<span class="sp-meta-chip">📞 ${u.tel}</span>` : ''}
                            </div>
                        </div>

                        <div class="sp-unit-card-logos-row">
                            <div class="sp-unit-mini-logo" title="Brasão Municipal">
                                ${u.logoPref ? `<img src="${u.logoPref}" alt="Logo Esq">` : '<span class="sp-no-logo-hint">Sem Brasão</span>'}
                            </div>
                            <div class="sp-unit-mini-divider"></div>
                            <div class="sp-unit-mini-logo" title="Logo Farmácia/SUS">
                                ${u.logoFarm ? `<img src="${u.logoFarm}" alt="Logo Dir">` : '<span class="sp-no-logo-hint">Sem Selo</span>'}
                            </div>
                        </div>

                        <div class="sp-unit-card-actions">
                            ${!isActive ? `
                                <button type="button" class="sp-btn-card-use" data-action="apply" data-unit-id="${u.id}">
                                    ⚡ Usar na Receita
                                </button>
                            ` : `
                                <div class="sp-btn-card-current">
                                    <span class="sp-pulse-dot-small"></span> Ativa na Impressão
                                </div>
                            `}
                            <button type="button" class="sp-btn-card-edit" data-action="edit" data-unit-id="${u.id}" title="Carregar no Editor de Textos">
                                ✏️ Configurar
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll('[data-action="apply"]').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const uId = btn.dataset.unitId;
                    if (window.App && window.App.applyActiveUnit) {
                        const activated = window.App.applyActiveUnit(uId);
                        if (activated) {
                            populateUnitForm(activated);
                            renderSettingsProUnitCards();
                            playProSound('success');
                            showProToast(`🏥 Unidade alterada para: ${activated.name}`, 'success');
                        }
                    }
                };
            });

            container.querySelectorAll('[data-action="edit"]').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const uId = btn.dataset.unitId;
                    const u = window.App.UnitsDB.getUnit(uId);
                    if (u) {
                        populateUnitForm(u);
                        renderSettingsProUnitCards();
                        playProSound('click');
                    }
                };
            });

            container.querySelectorAll('.sp-unit-card').forEach(card => {
                card.onclick = () => {
                    const uId = card.dataset.unitId;
                    const u = window.App.UnitsDB.getUnit(uId);
                    if (u) {
                        populateUnitForm(u);
                        renderSettingsProUnitCards();
                        playProSound('click');
                    }
                };
            });
            } catch (err) {
                console.error('Erro ao renderizar cards de unidades:', err);
            }
        }

        // Sincronização em tempo real dos inputs com a prévia A4
        ['#sp-cfg-unittitle', '#sp-cfg-unitsub', '#sp-cfg-unitaddr', '#sp-cfg-unitcity'].forEach(sel => {
            const inp = overlay.querySelector(sel);
            if (inp) inp.oninput = updateLivePaperSimulator;
        });

        // Upload Logo Esquerdo (Prefeitura)
        const btnUploadLogoPref = overlay.querySelector('#sp-btn-upload-logo-pref');
        const fileLogoPref = overlay.querySelector('#sp-file-logo-pref');
        if (btnUploadLogoPref && fileLogoPref) {
            btnUploadLogoPref.onclick = () => fileLogoPref.click();
            fileLogoPref.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        tempUnitLogoPref = ev.target.result;
                        updateLivePaperSimulator();
                        playProSound('success');
                        showProToast('Brasão/Logo Esquerdo carregado!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        const btnDefaultLogoPref = overlay.querySelector('#sp-btn-default-logo-pref');
        if (btnDefaultLogoPref) {
            btnDefaultLogoPref.onclick = () => {
                tempUnitLogoPref = 'prefeitura.png';
                updateLivePaperSimulator();
                playProSound('click');
            };
        }

        const btnClearLogoPref = overlay.querySelector('#sp-btn-clear-logo-pref');
        if (btnClearLogoPref) {
            btnClearLogoPref.onclick = () => {
                tempUnitLogoPref = '';
                updateLivePaperSimulator();
                playProSound('delete');
            };
        }

        // Upload Logo Direito (Farmácia/SUS)
        const btnUploadLogoFarm = overlay.querySelector('#sp-btn-upload-logo-farm');
        const fileLogoFarm = overlay.querySelector('#sp-file-logo-farm');
        if (btnUploadLogoFarm && fileLogoFarm) {
            btnUploadLogoFarm.onclick = () => fileLogoFarm.click();
            fileLogoFarm.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        tempUnitLogoFarm = ev.target.result;
                        updateLivePaperSimulator();
                        playProSound('success');
                        showProToast('Logotipo Direito (Farmácia/SUS) carregado!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        const btnDefaultLogoFarm = overlay.querySelector('#sp-btn-default-logo-farm');
        if (btnDefaultLogoFarm) {
            btnDefaultLogoFarm.onclick = () => {
                tempUnitLogoFarm = 'farmacia.png';
                updateLivePaperSimulator();
                playProSound('click');
            };
        }

        const btnClearLogoFarm = overlay.querySelector('#sp-btn-clear-logo-farm');
        if (btnClearLogoFarm) {
            btnClearLogoFarm.onclick = () => {
                tempUnitLogoFarm = '';
                updateLivePaperSimulator();
                playProSound('delete');
            };
        }

        // Ações da Unidade
        const btnSaveUnitNow = overlay.querySelector('#sp-btn-save-unit-now');
        if (btnSaveUnitNow) {
            btnSaveUnitNow.onclick = () => {
                const id = overlay.querySelector('#sp-cfg-unitid')?.value || ('unit_custom_' + Date.now());
                const name = (overlay.querySelector('#sp-cfg-unittitle')?.value || '').trim();
                const sub = (overlay.querySelector('#sp-cfg-unitsub')?.value || '').trim();
                const cnes = (overlay.querySelector('#sp-cfg-unitcnes')?.value || '').trim();
                const city = (overlay.querySelector('#sp-cfg-unitcity')?.value || '').trim();
                const tel = (overlay.querySelector('#sp-cfg-unittel')?.value || '').trim();
                const addr = (overlay.querySelector('#sp-cfg-unitaddr')?.value || '').trim();

                if (!name) {
                    alert('Por favor, informe o Nome Oficial da Instituição.');
                    overlay.querySelector('#sp-cfg-unittitle')?.focus();
                    return;
                }

                if (window.App && window.App.UnitsDB) {
                    const existing = window.App.UnitsDB.getUnit(id) || {};
                    const unitObj = {
                        id: id,
                        name: name,
                        sub: sub,
                        cnes: cnes,
                        city: city,
                        tel: tel,
                        addr: addr,
                        logoPref: tempUnitLogoPref !== null ? tempUnitLogoPref : existing.logoPref,
                        logoFarm: tempUnitLogoFarm !== null ? tempUnitLogoFarm : existing.logoFarm,
                        badge: existing.badge || (id === 'unit_caps3_joao_carlos' ? 'Padrão / Saúde Mental' : 'Personalizada')
                    };

                    const saved = window.App.UnitsDB.saveUnit(unitObj);
                    window.App.applyActiveUnit(saved);
                    renderSettingsProUnitCards();
                    updateLivePaperSimulator();
                    playProSound('success');
                    showProToast(`🏥 Unidade "${name}" salva e ativada no receituário!`, 'success');
                }
            };
        }

        const btnNewUnit = overlay.querySelector('#sp-btn-new-unit');
        if (btnNewUnit) {
            btnNewUnit.onclick = () => {
                const newId = 'unit_custom_' + Date.now();
                const draftUnit = {
                    id: newId,
                    name: 'Nova Unidade de Saúde',
                    sub: 'Secretaria Municipal de Saúde',
                    cnes: '',
                    city: 'Feira de Santana - BA',
                    tel: '',
                    addr: 'Endereço da Unidade, nº 00 - Bairro\nTelefone: (75) 0000-0000',
                    logoPref: 'prefeitura.png',
                    logoFarm: 'farmacia.png',
                    badge: 'Nova Unidade'
                };
                populateUnitForm(draftUnit);
                playProSound('toggle');
                showProToast('Novo formulário de unidade pronto para preenchimento.', 'info');
                overlay.querySelector('#sp-cfg-unittitle')?.focus();
                overlay.querySelector('#sp-cfg-unittitle')?.select();
            };
        }

        const btnDupUnit = overlay.querySelector('#sp-btn-dup-unit');
        if (btnDupUnit) {
            btnDupUnit.onclick = () => {
                const curId = overlay.querySelector('#sp-cfg-unitid')?.value;
                if (!curId || !window.App || !window.App.UnitsDB) return;
                const src = window.App.UnitsDB.getUnit(curId);
                if (!src) return;

                const dup = JSON.parse(JSON.stringify(src));
                dup.id = 'unit_custom_' + Date.now();
                dup.name = (src.name || 'Unidade') + ' (Cópia)';
                dup.badge = 'Cópia';
                window.App.UnitsDB.saveUnit(dup);
                populateUnitForm(dup);
                renderSettingsProUnitCards();
                playProSound('success');
                showProToast(`Unidade duplicada: ${dup.name}`, 'success');
            };
        }

        const btnDelUnit = overlay.querySelector('#sp-btn-del-unit');
        if (btnDelUnit) {
            btnDelUnit.onclick = () => {
                const curId = overlay.querySelector('#sp-cfg-unitid')?.value;
                if (!curId || !window.App || !window.App.UnitsDB) return;
                if (curId === 'unit_caps3_joao_carlos') {
                    alert('A unidade padrão "CAPS III Dr. João Carlos Lopes Cavalcante" não pode ser excluída.');
                    return;
                }
                const all = window.App.UnitsDB.get();
                if (all.length <= 1) {
                    alert('Não é possível excluir a única unidade cadastrada.');
                    return;
                }
                const src = window.App.UnitsDB.getUnit(curId);
                const confirmDel = confirm(`Tem certeza que deseja excluir a unidade "${src ? src.name : curId}"?`);
                if (!confirmDel) return;

                window.App.UnitsDB.deleteUnit(curId);
                const remainingActive = window.App.UnitsDB.getActiveUnit();
                populateUnitForm(remainingActive);
                renderSettingsProUnitCards();
                if (window.App.applyActiveUnit) window.App.applyActiveUnit(remainingActive);
                playProSound('delete');
                showProToast('Unidade excluída com sucesso.', 'info');
            };
        }

        // Renderiza cards imediatamente ao carregar o painel
        renderSettingsProUnitCards();

        // Expõe sincronização externa caso o modal rápido altere a unidade
        window.syncSettingsProUnitUI = function(unit) {
            if (unit) {
                populateUnitForm(unit);
                renderSettingsProUnitCards();
            }
        };

        // Exportação e Importação de Backup
        const btnExport = overlay.querySelector('#sp-btn-export-backup');
        if (btnExport) {
            btnExport.onclick = () => {
                executeFullBackupExport();
                playProSound('success');
            };
        }

        const btnImport = overlay.querySelector('#sp-btn-import-backup');
        const fileImport = overlay.querySelector('#sp-import-db-input');
        if (btnImport && fileImport) {
            btnImport.onclick = () => fileImport.click();
            fileImport.onchange = (e) => {
                executeFullBackupImport(e);
            };
        }

        // Limpeza de Banco de Dados
        const btnWipe = overlay.querySelector('#sp-btn-wipe-db');
        if (btnWipe) {
            btnWipe.onclick = () => {
                const promptVal = prompt('ATENÇÃO: Isso apagará o histórico clínico local de todos os pacientes.\n\nPara confirmar, digite "RESETAR":');
                if (promptVal === 'RESETAR') {
                    localStorage.removeItem('caps_pro_master_db');
                    if (window.App && window.App.db) window.App.db = {};
                    alert("Banco de dados histórico reiniciado com sucesso.");
                    playProSound('delete');
                    updateStorageMetrics();
                    closeSettingsPro();
                }
            };
        }

        // Botão Salvar Todas as Configurações
        const btnSave = overlay.querySelector('#sp-btn-save-all');
        if (btnSave) {
            btnSave.onclick = saveSettingsPro;
        }
    }

    // Segmented Controls Helper
    function setupSegmentedControl(overlay, selector, callback) {
        const seg = overlay.querySelector(selector);
        if (!seg) return;
        const btns = seg.querySelectorAll('.sp-segment-btn');
        btns.forEach(btn => {
            btn.onclick = () => {
                btns.forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                if (callback) callback(btn.dataset.val);
            };
        });
    }

    // Tabela de Medicamentos Personalizados
    function renderCustomMedsTable(filterQuery = '') {
        const tableBody = document.getElementById('sp-custom-meds-table');
        if (!tableBody) return;

        let filtered = tempCustomMeds;
        if (filterQuery) {
            filtered = tempCustomMeds.filter(m => m.name.toLowerCase().includes(filterQuery));
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #64748b; font-size: 13px;">
                    ${filterQuery ? 'Nenhum medicamento encontrado para o filtro.' : 'Nenhum medicamento personalizado cadastrado.'}
                </div>
            `;
            return;
        }

        tableBody.innerHTML = filtered.map((med, idx) => {
            const typeLabel = med.type === 'LIQUID' ? 'Gotas/Solução' : (med.type === 'INJECT' ? 'Injetável' : 'Comprimido');
            const typeClass = med.type === 'LIQUID' ? 'liquid' : (med.type === 'INJECT' ? 'inject' : 'pill');
            return `
                <div class="sp-table-row">
                    <div style="font-weight: 600; color: #f8fafc;">${med.name}</div>
                    <div><span class="sp-pill-type ${typeClass}">${typeLabel}</span></div>
                    <div style="text-align: right;">
                        <button type="button" class="sp-btn-danger" style="padding: 3px 8px; font-size: 11px; border-radius: 6px; cursor: pointer;" onclick="window.SettingsPro.deleteCustomMed(${idx})">Excluir</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function deleteCustomMed(idx) {
        tempCustomMeds.splice(idx, 1);
        renderCustomMedsTable();
        playProSound('delete');
        if (window.App) {
            if (!window.App.config) window.App.config = {};
            window.App.config.customMeds = tempCustomMeds;
            if (typeof window.App.invalidateMedsCache === 'function') window.App.invalidateMedsCache();
        }
    }

    function updateFavoritesCount() {
        const area = document.getElementById('sp-cfg-favs');
        const countEl = document.getElementById('sp-favs-count');
        if (!area || !countEl) return;
        const text = (area.value !== undefined && area.value !== null) ? String(area.value) : '';
        const total = text.split('\n').map(l => l.trim()).filter(Boolean).length;
        countEl.innerText = `${total} favoritos cadastrados`;
    }

    function updateStorageMetrics() {
        const statKb = document.getElementById('sp-stat-kb');
        const statProfiles = document.getElementById('sp-stat-profiles');
        const statPatients = document.getElementById('sp-stat-patients');

        let totalBytes = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            totalBytes += (key.length + (val ? val.length : 0)) * 2;
        }

        const kb = (totalBytes / 1024).toFixed(1);
        if (statKb) statKb.innerText = `${kb} KB`;

        try {
            const profiles = JSON.parse(localStorage.getItem('caps_pro_profiles') || '[]');
            if (statProfiles) statProfiles.innerText = profiles.length;
        } catch (e) {}

        try {
            const masterDb = JSON.parse(localStorage.getItem('caps_pro_master_db') || '{}');
            const patientCount = Object.keys(masterDb).length;
            if (statPatients) statPatients.innerText = patientCount;
        } catch (e) {}
    }

    // 8. Exportação e Importação de Backup Completo
    function executeFullBackupExport() {
        const backupData = {
            suite: 'Prescript Pro Sequoia',
            exportedAt: new Date().toISOString(),
            masterDb: JSON.parse(localStorage.getItem('caps_pro_master_db') || '{}'),
            profiles: JSON.parse(localStorage.getItem('caps_pro_profiles') || '[]'),
            customMeds: tempCustomMeds,
            favorites: (document.getElementById('sp-cfg-favs')?.value || '').split('\n').map(l => l.trim().toUpperCase()).filter(Boolean),
            accentColor: localStorage.getItem('cerebrum_accent_color') || '#38bdf8',
            medsLimit: localStorage.getItem('cerebrum_meds_limit') || '5',
            dateFormat: localStorage.getItem('cerebrum_date_format') || 'extenso',
            sigSize: localStorage.getItem('cerebrum_sig_size') || '80',
            sigOpacity: localStorage.getItem('cerebrum_sig_opacity') || '95',
            copyFormat: localStorage.getItem('cerebrum_copy_format') || 'num',
            copyDateTime: localStorage.getItem('cerebrum_copy_datetime') || 'false'
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_prescript_pro_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function executeFullBackupImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.masterDb) localStorage.setItem('caps_pro_master_db', JSON.stringify(data.masterDb));
                if (data.profiles) localStorage.setItem('caps_pro_profiles', JSON.stringify(data.profiles));
                if (data.accentColor) localStorage.setItem('cerebrum_accent_color', data.accentColor);
                if (data.medsLimit) localStorage.setItem('cerebrum_meds_limit', data.medsLimit);
                if (data.dateFormat) localStorage.setItem('cerebrum_date_format', data.dateFormat);

                alert("✅ Backup importado com sucesso! O sistema será recarregado para sincronizar.");
                location.reload();
            } catch (err) {
                alert("Erro ao ler o arquivo de backup. Certifique-se que é um arquivo JSON válido do Prescript.");
            }
        };
        reader.readAsText(file);
    }

    // 9. SALVAMENTO GLOBAL DE TODAS AS CONFIGURAÇÕES
    function saveSettingsPro() {
        const app = window.App || {};
        if (!app.config) app.config = {};
        const profile = app.currentProfile || {};

        // 1. Tema & Visual
        const themeSelect = document.getElementById('sp-cfg-theme');
        if (themeSelect) {
            app.config.theme = themeSelect.value;
            applySystemTheme(themeSelect.value);
        }

        const activeScaleBtn = document.querySelector('#sp-seg-font-scale .sp-segment-btn.is-active');
        if (activeScaleBtn) {
            applyPreviewScale(activeScaleBtn.dataset.val);
        }

        const blurCheckbox = document.getElementById('sp-cfg-blur');
        if (blurCheckbox) {
            applyBlurEffect(blurCheckbox.checked);
        }

        const soundCheckbox = document.getElementById('sp-cfg-sounds');
        if (soundCheckbox) {
            localStorage.setItem('cerebrum_sound_enabled', soundCheckbox.checked ? 'true' : 'false');
        }

        // 2. Médico
        const docName = (document.getElementById('sp-cfg-docname')?.value || '').trim();
        const docCrm = (document.getElementById('sp-cfg-doccrm')?.value || '').trim();
        const docSpecialty = (document.getElementById('sp-cfg-docspecialty')?.value || '').trim();
        const docCns = (document.getElementById('sp-cfg-doccns')?.value || '').trim();
        const docTel = (document.getElementById('sp-cfg-doctel')?.value || '').trim();
        const docFooter = (document.getElementById('sp-cfg-docfooter')?.value || '').trim();

        if (docName) {
            app.config.docname = docName;
            profile.name = docName;
        }
        if (docCrm) {
            app.config.doccrm = docCrm;
            profile.crm = docCrm;
        }
        if (docSpecialty) {
            app.config.docspecialty = docSpecialty;
            profile.specialty = docSpecialty;
        }
        if (docCns) {
            app.config.doccns = docCns;
            profile.cns = docCns;
        }
        app.config.doctel = docTel;
        app.config.docfooter = docFooter;

        // Atualiza pílulas e nomes de perfil no cabeçalho
        document.querySelectorAll('.sp-user-pill-name, #active-profile-name, .profile-name').forEach(el => {
            if (el && docName) el.innerText = docName.startsWith('Dr') ? docName : `Dr(a). ${docName}`;
        });

        // 3. Unidade de Atendimento & Cabeçalho Adaptativo
        const unitId = document.getElementById('sp-cfg-unitid')?.value || 'unit_caps3_joao_carlos';
        const unitTitle = (document.getElementById('sp-cfg-unittitle')?.value || '').trim();
        const unitSub = (document.getElementById('sp-cfg-unitsub')?.value || '').trim();
        const unitCnes = (document.getElementById('sp-cfg-unitcnes')?.value || '').trim();
        const unitCity = (document.getElementById('sp-cfg-unitcity')?.value || '').trim();
        const unitTel = (document.getElementById('sp-cfg-unittel')?.value || '').trim();
        const unitAddr = (document.getElementById('sp-cfg-unitaddr')?.value || '').trim();

        if (window.App && window.App.UnitsDB) {
            const existingUnit = window.App.UnitsDB.getUnit(unitId) || {};
            const savedUnit = window.App.UnitsDB.saveUnit({
                id: unitId,
                name: unitTitle || existingUnit.name || 'Unidade de Atendimento',
                sub: unitSub,
                cnes: unitCnes,
                city: unitCity,
                tel: unitTel,
                addr: unitAddr,
                logoPref: tempUnitLogoPref !== null ? tempUnitLogoPref : existingUnit.logoPref,
                logoFarm: tempUnitLogoFarm !== null ? tempUnitLogoFarm : existingUnit.logoFarm,
                badge: existingUnit.badge || (unitId === 'unit_caps3_joao_carlos' ? 'Padrão / Saúde Mental' : 'Personalizada')
            });
            window.App.applyActiveUnit(savedUnit, { silent: true });
        } else {
            app.config.title = unitTitle;
            app.config.sub = unitSub;
            app.config.cnes = unitCnes;
            app.config.city = unitCity;
            app.config.tel = unitTel;
            app.config.addr = unitAddr;
            profile.unit = unitTitle;
        }

        // 4. Receituário & Impressão
        const activeLimitBtn = document.querySelector('#sp-seg-meds-limit .sp-segment-btn.is-active');
        if (activeLimitBtn) {
            const limit = parseInt(activeLimitBtn.dataset.val);
            localStorage.setItem('cerebrum_meds_limit', limit);
            app.config.medsLimit = limit;
        }

        const activeDateBtn = document.querySelector('#sp-seg-date-format .sp-segment-btn.is-active');
        if (activeDateBtn) {
            localStorage.setItem('cerebrum_date_format', activeDateBtn.dataset.val);
        }

        app.config.autoDateDefault = document.getElementById('sp-cfg-autodate')?.checked !== false;
        app.config.onlyFirstDate = document.getElementById('sp-cfg-firstdate')?.checked !== false;
        app.config.hideHeaderPrint = document.getElementById('sp-cfg-hideheader')?.checked === true;
        app.config.hideFooterPrint = document.getElementById('sp-cfg-hidefooter')?.checked === true;

        const printHubChecked = document.getElementById('sp-cfg-printhub')?.checked !== false;
        localStorage.setItem('cerebrum_print_hub_enabled', printHubChecked ? 'true' : 'false');
        app.config.printHubEnabled = printHubChecked;

        document.body.classList.toggle('sp-hide-header-print', app.config.hideHeaderPrint);
        document.body.classList.toggle('sp-hide-footer-print', app.config.hideFooterPrint);

        const dividerLines = document.getElementById('sp-cfg-dividerlines')?.checked === true;
        localStorage.setItem('cerebrum_divider_lines', dividerLines ? 'true' : 'false');

        const pageNums = document.getElementById('sp-cfg-pagenums')?.checked !== false;
        localStorage.setItem('cerebrum_page_nums', pageNums ? 'true' : 'false');

        const unlockDefault = document.getElementById('sp-cfg-unlockdefault')?.checked === true;
        const lockHidden = document.getElementById('sp-cfg-lockhidden')?.checked === true;
        applyLockSettings(unlockDefault, lockHidden);

        // 5. Assinatura Digital
        if (tempSignatureImg !== null) {
            app.config.signature = tempSignatureImg;
            app.config.signatureImg = tempSignatureImg;
            localStorage.setItem('cerebrum_signature_img', tempSignatureImg);
            const previewImg = document.getElementById('preview-signature');
            if (previewImg) {
                previewImg.src = tempSignatureImg;
                previewImg.style.display = tempSignatureImg ? 'inline-block' : 'none';
            }
        }

        const sigSize = document.getElementById('sp-sig-size')?.value || 80;
        const sigOpacity = document.getElementById('sp-sig-opacity')?.value || 95;
        applySignatureSettings(sigSize, sigOpacity);

        const activeAlignBtn = document.querySelector('#sp-seg-sig-align .sp-segment-btn.is-active');
        if (activeAlignBtn) {
            localStorage.setItem('cerebrum_sig_align', activeAlignBtn.dataset.val);
        }
        const sigBlendCheck = document.getElementById('sp-sig-blend-mode');
        if (sigBlendCheck) {
            localStorage.setItem('cerebrum_sig_blend', sigBlendCheck.checked ? 'true' : 'false');
        }

        // 6. Cópia PEP
        const copyHeaderEnabled = document.getElementById('sp-cfg-copyheader-enable')?.checked === true;
        const copyHeaderText = document.getElementById('sp-cfg-copyheader-text')?.value || '';
        localStorage.setItem('pz_copy_header_enabled', copyHeaderEnabled ? 'true' : 'false');
        localStorage.setItem('pz_copy_header_text', copyHeaderText);
        app.config.copyHeaderEnable = copyHeaderEnabled;
        app.config.copyHeaderText = copyHeaderText;

        if (typeof app.setCopyHeader === 'function') {
            app.setCopyHeader(copyHeaderEnabled, copyHeaderText);
        }

        const copyDateTime = document.getElementById('sp-cfg-copydatetime')?.checked === true;
        localStorage.setItem('cerebrum_copy_datetime', copyDateTime ? 'true' : 'false');

        const activeCopyFormat = document.querySelector('#sp-seg-copyformat .sp-segment-btn.is-active');
        if (activeCopyFormat) {
            localStorage.setItem('cerebrum_copy_format', activeCopyFormat.dataset.val);
        }

        const postPrint = document.getElementById('sp-cfg-postprint')?.value || 'clear';
        localStorage.setItem('cerebrum_post_print', postPrint);
        app.config.autoClearAfterPrint = postPrint === 'clear';

        // 7. Modo Lote
        const loteIntellisense = document.getElementById('sp-cfg-lote-intellisense')?.checked !== false;
        const loteSanitize = document.getElementById('sp-cfg-lote-sanitize')?.checked !== false;
        const loteTrades = document.getElementById('sp-cfg-lote-tradenames')?.checked !== false;
        localStorage.setItem('cerebrum_lote_intellisense', loteIntellisense ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent('cerebrum_lote_intellisense_change', { detail: { enabled: loteIntellisense } }));
        localStorage.setItem('cerebrum_lote_autoclean', loteSanitize ? 'true' : 'false');
        localStorage.setItem('cerebrum_lote_tradename_convert', loteTrades ? 'true' : 'false');

        // 8. Teclas de Atalho
        const scDrawer = (document.getElementById('sp-cfg-sc-drawer')?.value || 'I').toUpperCase();
        const scClear = (document.getElementById('sp-cfg-sc-clear')?.value || 'X').toUpperCase();
        const scDate = (document.getElementById('sp-cfg-sc-date')?.value || 'D').toUpperCase();
        const scFraction = (document.getElementById('sp-cfg-sc-fraction')?.value || 'F').toUpperCase();
        const scLote = (document.getElementById('sp-cfg-sc-lote')?.value || 'L').toUpperCase();
        const scSpace = document.getElementById('sp-cfg-spacetoggle')?.checked !== false;

        app.config.shortcutDrawer = scDrawer;
        app.config.shortcutClear = scClear;
        app.config.shortcutDate = scDate;
        app.config.shortcutFraction = scFraction;
        app.config.shortcutLote = scLote;
        app.config.spaceToggle = scSpace;

        // 9. Medicamentos e Favoritos
        app.config.customMeds = tempCustomMeds;

        const favsArea = document.getElementById('sp-cfg-favs');
        if (favsArea) {
            app.config.favorites = favsArea.value.split('\n').map(m => m.trim().toUpperCase()).filter(Boolean);
        }

        // 10. LME
        if (tempLmeBg !== null) {
            app.config.lmeBg = tempLmeBg;
            app.tempLmeBg = tempLmeBg;
            if (typeof app.checkBgImage === 'function') app.checkBgImage();
        }

        // 11. Persistência de Perfis
        if (app.currentProfile) {
            app.currentProfile.config = app.config;
            if (app.profiles && typeof app.currentProfileIndex === 'number') {
                app.profiles[app.currentProfileIndex] = app.currentProfile;
                localStorage.setItem('caps_pro_profiles', JSON.stringify(app.profiles));
            }
        }

        // Invalida caches do dicionário médico para incluir as novas medicações imediatamente
        if (typeof app.invalidateMedsCache === 'function') app.invalidateMedsCache();
        if (typeof app.refreshEditorState === 'function') app.refreshEditorState();
        if (typeof app.renderCustomMedsList === 'function') app.renderCustomMedsList();
        if (typeof app.renderFavoritesList === 'function') app.renderFavoritesList();
        if (typeof app.render === 'function') app.render();

        playProSound('success');
        closeSettingsPro();

        if (typeof app.showNotification === 'function') {
            app.showNotification("✨ Todas as configurações foram salvas e aplicadas!", "success");
        }
    }

    // 10. Vinculação com o App e Atalhos
    function hookAppSettings() {
        const targets = [];
        if (window.App) targets.push(window.App);
        if (typeof App !== 'undefined' && App && !targets.includes(App)) targets.push(App);

        targets.forEach(t => {
            t.openSettings = function (tab) { openSettingsPro(tab); };
            t.closeSettings = function () { closeSettingsPro(); };
            t.saveEnterpriseSettings = function () { saveSettingsPro(); };
            t.saveSettings = function () { saveSettingsPro(); };
        });

        // Vincula botão flutuante
        const floatBtn = document.getElementById('btn-float-settings');
        if (floatBtn && !floatBtn._proHooked) {
            floatBtn._proHooked = true;
            floatBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                openSettingsPro();
            };
        }
    }

    // 🌟 INTERCEPTADOR SUPREMO NO DOCUMENTO (CAPTURE PHASE)
    // Intercepta qualquer clique no botão flutuante de configurações ou chamadas openSettings,
    // garantindo que NENHUMA recriação de elemento no DOM ou sobrescrita inline impeça a abertura!
    document.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest && e.target.closest('#btn-float-settings, [data-tooltip*="Configurações"], button[data-tooltip*="Config"], [onclick*="openSettings"]');
        if (btn) {
            if (btn.id === 'btn-float-settings' || (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('openSettings')) || (btn.dataset && btn.dataset.tooltip && btn.dataset.tooltip.includes('Config'))) {
                e.preventDefault();
                e.stopPropagation();
                openSettingsPro();
            }
        }
    }, true);

    // Tecla Escape para fechar e Alt+C para abrir (em qualquer contexto)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('settings-pro-overlay');
            if (overlay && overlay.classList.contains('is-open')) {
                e.preventDefault();
                closeSettingsPro();
            }
        }
        if (e.altKey && (e.key === 'c' || e.key === 'C' || e.code === 'KeyC')) {
            e.preventDefault();
            e.stopPropagation();
            openSettingsPro();
        }
    }, true);

    // Observador contínuo para manter os ganchos ativos mesmo após logins e renderizações dinâmicas
    if (typeof MutationObserver !== 'undefined') {
        const proObserver = new MutationObserver(() => {
            const floatBtn = document.getElementById('btn-float-settings');
            if (floatBtn && !floatBtn._proHooked) {
                floatBtn._proHooked = true;
                floatBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openSettingsPro();
                };
            }
            if (window.App && window.App.openSettings !== openSettingsPro) {
                window.App.openSettings = function (tab) { openSettingsPro(tab); };
            }
        });
        proObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    function restoreInitialSettings() {
        try {
            const savedTheme = localStorage.getItem('cerebrum_theme') || (window.App && window.App.config && window.App.config.theme) || 'theme-modern';
            applySystemTheme(savedTheme);

            const savedScale = localStorage.getItem('cerebrum_preview_font_scale') || '100';
            const numScale = parseFloat(savedScale) || 100;
            document.documentElement.style.setProperty('--cerebrum-font-user-scale', (numScale / 100).toString());

            const savedAccent = localStorage.getItem('cerebrum_accent_color');
            if (savedAccent) applyAccentColor(savedAccent);

            const blurActive = localStorage.getItem('cerebrum_blur_disabled') !== 'true';
            applyBlurEffect(blurActive);
        } catch (e) {}
    }

    // Inicialização Contínua e Protegida contra Sobrescrita
    restoreInitialSettings();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            restoreInitialSettings();
            setTimeout(hookAppSettings, 100);
            setTimeout(hookAppSettings, 500);
            setTimeout(hookAppSettings, 1500);
            setTimeout(hookAppSettings, 3000);
            setTimeout(hookAppSettings, 6000);
        });
    } else {
        restoreInitialSettings();
        setTimeout(hookAppSettings, 100);
        setTimeout(hookAppSettings, 500);
        setTimeout(hookAppSettings, 1500);
        setTimeout(hookAppSettings, 3000);
        setTimeout(hookAppSettings, 6000);
    }

    // Exportação Global Direta
    window.openSettingsPro = openSettingsPro;
    window.closeSettingsPro = closeSettingsPro;
    window.saveSettingsPro = saveSettingsPro;
    window.SettingsPro = {
        open: openSettingsPro,
        close: closeSettingsPro,
        save: saveSettingsPro,
        deleteCustomMed: deleteCustomMed
    };

})();
