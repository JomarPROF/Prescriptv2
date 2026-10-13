/**
 * ══════════════════════════════════════════════════════════════════════════════
 * APPLE EXECUTIVE SETTINGS PRO — CEREBRUM MEDICAL SUITE
 * Módulo Completo e 100% Funcional de Configurações, Customizações e Banco Clínico
 * ══════════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

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
    let tempLmeBg = null;
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

        renderSettingsModalContent(overlay);
        playProSound('click');

        requestAnimationFrame(() => {
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
        tempSignatureImg = null;
        tempLmeBg = null;
        playProSound('click');
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

        const unitTitle = cfg.title || profile.unit || '';
        const unitSub = cfg.sub || '';
        const unitCnes = cfg.cnes || '';
        const unitAddr = cfg.addr || '';
        const unitCity = cfg.city || 'Feira de Santana - BA';
        const unitTel = cfg.tel || '';

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

                        <!-- ══ ABA 5: UNIDADE DE SAÚDE ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-unidade' ? 'is-active' : ''}" id="pane-tab-unidade">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">🏥 Unidade de Saúde & Cabeçalho</h2>
                                <p class="sp-pane-desc">Configure os dados institucionais que aparecem no topo do receituário impresso.</p>
                            </div>

                            <div class="sp-card-group-title">Dados Institucionais</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Nome da Instituição (Título Principal)</div>
                                        <div class="sp-row-desc">Exemplo: CAPS III - Dr. João Silva, Policlínica Municipal.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-unittitle" value="${unitTitle}" placeholder="Ex: CAPS III - SAÚDE MENTAL">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Subtítulo / Secretaria</div>
                                        <div class="sp-row-desc">Linha secundária do cabeçalho.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-unitsub" value="${unitSub}" placeholder="Ex: SECRETARIA MUNICIPAL DE SAÚDE">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Código CNES</div>
                                        <div class="sp-row-desc">Cadastro Nacional de Estabelecimentos de Saúde.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-unitcnes" value="${unitCnes}" placeholder="Ex: 2798541" style="width: 180px;">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Cidade e Estado Padrão</div>
                                        <div class="sp-row-desc">Localidade que precede a data da receita.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-unitcity" value="${unitCity}" placeholder="Ex: Feira de Santana - BA" style="width: 250px;">
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Telefone da Unidade</div>
                                        <div class="sp-row-desc">Telefone fixo ou recepção do posto de saúde.</div>
                                    </div>
                                    <input type="text" class="sp-input" id="sp-cfg-unittel" value="${unitTel}" placeholder="Ex: (75) 3602-0000" style="width: 200px;">
                                </div>

                                <div class="sp-row" style="align-items: flex-start;">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Endereço Completo</div>
                                        <div class="sp-row-desc">Rua, número, bairro e CEP que constarão no centro do cabeçalho.</div>
                                    </div>
                                    <textarea class="sp-textarea" id="sp-cfg-unitaddr" style="min-height: 70px;">${unitAddr}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- ══ ABA 6: ASSINATURA & CARIMBO ══ -->
                        <div class="sp-tab-pane ${activeTabId === 'tab-assinatura' ? 'is-active' : ''}" id="pane-tab-assinatura">
                            <div class="sp-pane-header">
                                <h2 class="sp-pane-title">✍️ Assinatura Digital & Carimbo Escaneado</h2>
                                <p class="sp-pane-desc">Adicione sua assinatura com carimbo. O sistema aplica remoção de fundo e posicionamento automático.</p>
                            </div>

                            <div class="sp-card-group-title">Papel de Impressão Simulado</div>
                            <div class="sp-card-group" style="padding: 24px; display: flex; flex-direction: column; align-items: center;">
                                <div class="sp-sig-paper-simulator">
                                    <div style="font-size: 11px; color: #64748b; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.5px;">Pré-visualização do Rodapé da Receita</div>
                                    <img id="sp-sig-preview-img" src="${signatureSrc}" style="display: ${signatureSrc ? 'block' : 'none'}; max-height: ${sigSize}px; opacity: ${sigOpacity / 100}; mix-blend-mode: multiply; margin: 0 auto;">
                                    <div class="sp-sig-line"></div>
                                    <div class="sp-sig-paper-caption">Assinatura e carimbo do médico</div>
                                    ${docName ? `<div style="font-size: 11px; font-weight: bold; margin-top: 4px; color: #1e293b;">${docName}</div>` : ''}
                                    ${docCrm ? `<div style="font-size: 10px; color: #475569;">CRM ${docCrm}</div>` : ''}
                                </div>

                                <div style="display: flex; gap: 12px; margin-top: 20px;">
                                    <input type="file" id="sp-sig-file-input" accept="image/png, image/jpeg" style="display: none;">
                                    <button type="button" class="sp-btn sp-btn-secondary" id="sp-btn-upload-sig">📸 Selecionar Imagem (JPG/PNG)</button>
                                    <button type="button" class="sp-btn sp-btn-danger" id="sp-btn-del-sig" style="display: ${signatureSrc ? 'inline-flex' : 'none'};">🗑️ Remover Assinatura</button>
                                </div>
                            </div>

                            <div class="sp-card-group-title">Ajustes Finos de Proporção</div>
                            <div class="sp-card-group">
                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Tamanho / Altura Máxima da Imagem</div>
                                        <div class="sp-row-desc">Controle o tamanho da assinatura sobre a linha da receita.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px; width: 260px;">
                                        <input type="range" class="sp-range" id="sp-sig-size" min="40" max="130" value="${sigSize}">
                                        <span class="sp-badge-count" id="sp-sig-size-val">${sigSize}px</span>
                                    </div>
                                </div>

                                <div class="sp-row">
                                    <div class="sp-row-info">
                                        <div class="sp-row-label">Intensidade / Opacidade da Tinta</div>
                                        <div class="sp-row-desc">Suaviza o traço da caneta para evitar excesso de contraste na impressão.</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 12px; width: 260px;">
                                        <input type="range" class="sp-range" id="sp-sig-opacity" min="30" max="100" value="${sigOpacity}">
                                        <span class="sp-badge-count" id="sp-sig-opacity-val">${sigOpacity}%</span>
                                    </div>
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

        setupSettingsEvents(overlay);
        renderCustomMedsTable();
        updateFavoritesCount();
        updateStorageMetrics();
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
                localStorage.setItem('cerebrum_lote_intellisense', e.target.checked ? 'true' : 'false');
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

        // Sliders de Assinatura
        const sigSizeSlider = overlay.querySelector('#sp-sig-size');
        const sigSizeVal = overlay.querySelector('#sp-sig-size-val');
        const sigPreview = overlay.querySelector('#sp-sig-preview-img');
        const sigOpacitySlider = overlay.querySelector('#sp-sig-opacity');
        const sigOpacityVal = overlay.querySelector('#sp-sig-opacity-val');

        if (sigSizeSlider && sigSizeVal) {
            sigSizeSlider.oninput = (e) => {
                sigSizeVal.innerText = `${e.target.value}px`;
                if (sigPreview) sigPreview.style.maxHeight = `${e.target.value}px`;
                applySignatureSettings(e.target.value, sigOpacitySlider ? sigOpacitySlider.value : 95);
            };
        }

        if (sigOpacitySlider && sigOpacityVal) {
            sigOpacitySlider.oninput = (e) => {
                sigOpacityVal.innerText = `${e.target.value}%`;
                if (sigPreview) sigPreview.style.opacity = e.target.value / 100;
                applySignatureSettings(sigSizeSlider ? sigSizeSlider.value : 80, e.target.value);
            };
        }

        // Upload de Assinatura
        const btnUploadSig = overlay.querySelector('#sp-btn-upload-sig');
        const sigFileInput = overlay.querySelector('#sp-sig-file-input');
        const btnDelSig = overlay.querySelector('#sp-btn-del-sig');
        if (btnUploadSig && sigFileInput) {
            btnUploadSig.onclick = () => sigFileInput.click();
            sigFileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        tempSignatureImg = ev.target.result;
                        if (sigPreview) {
                            sigPreview.src = tempSignatureImg;
                            sigPreview.style.display = 'block';
                        }
                        if (btnDelSig) btnDelSig.style.display = 'inline-flex';
                        playProSound('success');
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
        if (btnDelSig) {
            btnDelSig.onclick = () => {
                tempSignatureImg = '';
                if (sigPreview) {
                    sigPreview.src = '';
                    sigPreview.style.display = 'none';
                }
                btnDelSig.style.display = 'none';
                playProSound('delete');
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
        const total = area.value.split('\n').map(l => l.trim()).filter(Boolean).length;
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

        // 3. Unidade
        const unitTitle = (document.getElementById('sp-cfg-unittitle')?.value || '').trim();
        const unitSub = (document.getElementById('sp-cfg-unitsub')?.value || '').trim();
        const unitCnes = (document.getElementById('sp-cfg-unitcnes')?.value || '').trim();
        const unitCity = (document.getElementById('sp-cfg-unitcity')?.value || '').trim();
        const unitTel = (document.getElementById('sp-cfg-unittel')?.value || '').trim();
        const unitAddr = (document.getElementById('sp-cfg-unitaddr')?.value || '').trim();

        app.config.title = unitTitle;
        app.config.sub = unitSub;
        app.config.cnes = unitCnes;
        app.config.city = unitCity;
        app.config.tel = unitTel;
        app.config.addr = unitAddr;

        profile.unit = unitTitle;

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
        if (window.App) {
            window.App.openSettings = function (tab) {
                openSettingsPro(tab);
            };
            window.App.closeSettings = function () {
                closeSettingsPro();
            };
            window.App.saveEnterpriseSettings = function () {
                saveSettingsPro();
            };
            window.App.saveSettings = function () {
                saveSettingsPro();
            };
        }

        // Vincula botão flutuante e atalho Alt+C
        const floatBtn = document.getElementById('btn-float-settings');
        if (floatBtn) {
            floatBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                openSettingsPro();
            };
        }
    }

    // Tecla Escape para fechar e Alt+C para abrir
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('settings-pro-overlay');
            if (overlay && overlay.classList.contains('is-open')) {
                e.preventDefault();
                closeSettingsPro();
            }
        }
        if (e.altKey && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault();
            openSettingsPro();
        }
    });

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
            setTimeout(hookAppSettings, 200);
            setTimeout(hookAppSettings, 1500);
            setTimeout(hookAppSettings, 4000);
            setTimeout(hookAppSettings, 6000);
        });
    } else {
        restoreInitialSettings();
        setTimeout(hookAppSettings, 200);
        setTimeout(hookAppSettings, 1500);
        setTimeout(hookAppSettings, 4000);
        setTimeout(hookAppSettings, 6000);
    }

    // Exportação Global
    window.SettingsPro = {
        open: openSettingsPro,
        close: closeSettingsPro,
        save: saveSettingsPro,
        deleteCustomMed: deleteCustomMed
    };

})();
