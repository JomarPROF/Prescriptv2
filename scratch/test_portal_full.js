const fs = require('fs');

const code = `
// =========================================================================
// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS
// =========================================================================
(function() {
    if (typeof App === 'undefined') return;

    // 1. CATÁLOGO CURADO DE UNIDADES DE SAÚDE DE ELITE
    const CURATED_DEFAULT_UNITS = [
        {
            id: 'unit_caps3_joao_carlos',
            name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Getúlio Vargas, n 2751 - Santa Mônica\\nTelefone (75) 3612-6600',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-6600',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'Padrão / Saúde Mental',
            isDefault: true
        },
        {
            id: 'unit_caps_ad3',
            name: 'CAPS AD III Dr. José Roberto de Oliveira',
            sub: 'Secretaria Municipal de Saúde - Álcool e Drogas',
            addr: 'Rua Manoel Mathias, n 237 - Centro\\nTelefone (75) 3602-8650',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3602-8650',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'Álcool e Outras Drogas',
            isDefault: false
        },
        {
            id: 'unit_caps_i',
            name: 'CAPS i - Centro de Atenção Infantojuvenil',
            sub: 'Secretaria Municipal de Saúde - Infância e Juventude',
            addr: 'Rua Professora Edelvira de Oliveira, n 245 - Centro\\nTelefone (75) 3602-8660',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3602-8660',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'Infantojuvenil',
            isDefault: false
        },
        {
            id: 'unit_policlinica',
            name: 'Policlínica Municipal / Atenção Especializada',
            sub: 'Secretaria Municipal de Saúde',
            addr: 'Avenida Maria Quitéria, s/n\\nTelefone (75) 3612-5000',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3612-5000',
            logoPref: 'prefeitura.png',
            logoFarm: 'farmacia.png',
            badge: 'Especialidades / Policlínica',
            isDefault: false
        },
        {
            id: 'unit_consultorio_privado',
            name: 'Consultório Médico Particular',
            sub: 'Atendimento Médico Especializado',
            addr: 'Edifício Medical Center, Sala 402 - Kalilândia\\nTelefone (75) 3221-0000',
            city: 'Feira de Santana - BA',
            cnes: '',
            tel: '(75) 3221-0000',
            logoPref: null,
            logoFarm: null,
            badge: 'Clínica Privada / Particular',
            isDefault: false
        }
    ];

    // 2. BANCO DE DADOS INTELIGENTE COM AUTO-MIGRAÇÃO E RESGATE
    App.UnitsDB = {
        CURATED_DEFAULTS: CURATED_DEFAULT_UNITS,

        get() {
            let list = null;
            try {
                const db = localStorage.getItem('cerebrum_global_units_db');
                if (db) list = JSON.parse(db);
            } catch (e) {}

            if (!Array.isArray(list) || list.length === 0) {
                list = JSON.parse(JSON.stringify(CURATED_DEFAULT_UNITS));
                localStorage.setItem('cerebrum_global_units_db', JSON.stringify(list));
                return list;
            }

            // AUTO-MIGRAÇÃO: Atualiza placeholders antigos para a especificação oficial
            let changed = false;
            list = list.map(u => {
                if (u.id === 'unit_default' || u.name === 'CAPS III' || (u.addr && u.addr.includes('Rua Principal, 123'))) {
                    changed = true;
                    return {
                        id: u.id || 'unit_caps3_joao_carlos',
                        name: 'CAPS III Dr. João Carlos Lopes Cavalcante',
                        sub: (u.sub && u.sub !== 'Secretaria de Saúde') ? u.sub : 'Secretaria Municipal de Saúde',
                        addr: 'Avenida Getúlio Vargas, n 2751 - Santa Mônica\\nTelefone (75) 3612-6600',
                        city: u.city || 'Feira de Santana - BA',
                        cnes: (u.cnes && u.cnes !== '000000') ? u.cnes : '',
                        tel: u.tel || '(75) 3612-6600',
                        logoPref: u.logoPref || 'prefeitura.png',
                        logoFarm: u.logoFarm || 'farmacia.png',
                        badge: 'Padrão / Saúde Mental',
                        isDefault: true
                    };
                }
                return u;
            });

            // Se existia apenas 1 item antigo, completa com as outras opções do catálogo
            if (list.length === 1) {
                const extras = CURATED_DEFAULT_UNITS.slice(1);
                list.push(...JSON.parse(JSON.stringify(extras)));
                changed = true;
            }

            if (changed) {
                localStorage.setItem('cerebrum_global_units_db', JSON.stringify(list));
            }

            return list;
        },

        save(data) {
            localStorage.setItem('cerebrum_global_units_db', JSON.stringify(data));
            if (window.App && typeof window.App.syncToCloud === 'function') {
                try { window.App.syncToCloud(); } catch(e) {}
            }
        },

        getUnit(id) {
            const list = this.get();
            return list.find(u => u.id === id) || null;
        },

        saveUnit(unitObj) {
            if (!unitObj || !unitObj.name) return null;
            let list = this.get();
            if (!unitObj.id) {
                unitObj.id = 'unit_custom_' + Date.now();
            }
            const idx = list.findIndex(u => u.id === unitObj.id);
            if (idx >= 0) {
                list[idx] = Object.assign({}, list[idx], unitObj);
            } else {
                list.push(unitObj);
            }
            this.save(list);
            return unitObj;
        },

        deleteUnit(id) {
            let list = this.get();
            if (list.length <= 1) return false;
            list = list.filter(u => u.id !== id);
            this.save(list);
            const activeId = this.getActive();
            if (activeId === id) {
                const nextId = list[0] ? list[0].id : 'unit_caps3_joao_carlos';
                this.setActive(nextId);
                if (typeof App.applyActiveUnit === 'function') {
                    App.applyActiveUnit(nextId, { silent: true });
                }
            }
            return true;
        },

        getActive() {
            const list = this.get();
            const id = localStorage.getItem('cerebrum_active_unit_id');
            const found = list.find(u => u.id === id);
            if (found) return found.id;
            return list[0] ? list[0].id : 'unit_caps3_joao_carlos';
        },

        setActive(id) {
            localStorage.setItem('cerebrum_active_unit_id', id);
        },

        getActiveUnit() {
            const list = this.get();
            const activeId = this.getActive();
            return list.find(u => u.id === activeId) || list[0] || CURATED_DEFAULT_UNITS[0];
        },

        duplicate(id) {
            const list = this.get();
            const item = list.find(u => u.id === id);
            if (!item) return null;
            const clone = JSON.parse(JSON.stringify(item));
            clone.id = 'unit_custom_' + Date.now();
            clone.name = \`\${clone.name} (Cópia)\`;
            clone.isDefault = false;
            list.push(clone);
            this.save(list);
            return clone;
        },

        resetToDefaults() {
            const defaults = JSON.parse(JSON.stringify(CURATED_DEFAULT_UNITS));
            this.save(defaults);
            this.setActive(defaults[0].id);
            if (typeof App.applyActiveUnit === 'function') {
                App.applyActiveUnit(defaults[0].id);
            }
            return defaults;
        }
    };

    // 3. MOTOR DEFINITIVO DE APLICAÇÃO DA UNIDADE NO APP & RECEITUÁRIO
    App.applyActiveUnit = function(target, options = {}) {
        let activeUnit = null;
        if (typeof target === 'string') {
            const list = App.UnitsDB.get();
            activeUnit = list.find(u => u.id === target) || list[0];
            App.UnitsDB.setActive(activeUnit.id);
        } else if (target && typeof target === 'object') {
            activeUnit = target;
            if (activeUnit.id) App.UnitsDB.setActive(activeUnit.id);
        } else {
            activeUnit = App.UnitsDB.getActiveUnit();
        }

        if (!activeUnit) return;

        // A. Atualiza as configurações mestras do App
        if (!this.config) this.config = {};
        this.config.title = activeUnit.name;
        this.config.sub = activeUnit.sub || '';
        this.config.addr = activeUnit.addr || '';
        this.config.cnes = activeUnit.cnes || '';
        this.config.city = activeUnit.city || 'Feira de Santana - BA';
        if (activeUnit.tel) this.config.tel = activeUnit.tel;

        // B. Define os logotipos oficiais
        App.TerminalLogoPref = activeUnit.logoPref || null;
        App.TerminalLogoFarm = activeUnit.logoFarm || null;

        // C. Sincroniza com o perfil médico ativo se existente
        if (this.currentProfile) {
            this.currentProfile.unit = activeUnit.name;
            if (this.currentProfile.config) {
                this.currentProfile.config.title = activeUnit.name;
                this.currentProfile.config.sub = activeUnit.sub || '';
                this.currentProfile.config.addr = activeUnit.addr || '';
                this.currentProfile.config.cnes = activeUnit.cnes || '';
                this.currentProfile.config.city = activeUnit.city || 'Feira de Santana - BA';
            }
            if (typeof this.saveProfiles === 'function') {
                try { this.saveProfiles(); } catch(e) {}
            }
        }

        // D. Atualização direta do DOM nos cabeçalhos já renderizados
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
        });

        // Texto central do cabeçalho
        const safeAddrHtml = (activeUnit.addr || '').replace(/\\n/g, '<br>');
        document.querySelectorAll('.header-text-center').forEach(el => {
            el.innerHTML = \`<b>\${activeUnit.name}</b><br>\${activeUnit.sub || ''}<br>\${safeAddrHtml}\`;
        });

        // E. Re-renderiza o receituário para recalcular layout das vias e proporções
        if (typeof this.render === 'function') {
            try { this.render(); } catch(e) {}
        }

        // F. Atualiza os Badges e Pílulas na UI
        const livePillText = document.getElementById('luc-active-unit-name');
        if (livePillText) livePillText.innerText = activeUnit.name;

        if (typeof App.injectIntegratedUnitSelector === 'function') {
            try { App.injectIntegratedUnitSelector(); } catch(e) {}
        }

        // Sincroniza se o modal Settings Pro estiver aberto
        if (typeof window.syncSettingsProUnitUI === 'function') {
            try { window.syncSettingsProUnitUI(activeUnit); } catch(e) {}
        }

        // G. Feedback e som
        if (!options.silent) {
            if (typeof this.showNotification === 'function') {
                this.showNotification(\`🏥 Unidade ativa: \${activeUnit.name}\`, 'success');
            }
            if (typeof window.playProSound === 'function') {
                window.playProSound('toggle');
            }
        }

        return activeUnit;
    };

    App.setGlobalActiveUnit = function(id) {
        App.applyActiveUnit(id);
        const overlay = document.getElementById('unit-portal-overlay');
        if (overlay) overlay.remove();
        if (typeof App.injectIntegratedUnitSelector === 'function') {
            try { App.injectIntegratedUnitSelector(); } catch(e) {}
        }
    };

    // 4. LIVE UNIT SWITCHER FLUTUANTE NO TOPO DO PREVIEW
    App.injectLiveUnitPill = function() {
        if (document.getElementById('live-unit-hud-wrap')) {
            const activeUnit = App.UnitsDB.getActiveUnit();
            const textEl = document.getElementById('luc-active-unit-name');
            if (textEl && activeUnit) textEl.innerText = activeUnit.name;
            return;
        }

        const previewPane = document.querySelector('.preview-pane');
        if (!previewPane) return;

        const activeUnit = App.UnitsDB.getActiveUnit();
        const wrap = document.createElement('div');
        wrap.id = 'live-unit-hud-wrap';
        wrap.className = 'live-unit-hud-wrap';
        wrap.innerHTML = \`
            <div class=\"live-unit-pill\" onclick=\"(window.App||App).openUnitPortal()\" title=\"Clique para alternar a Unidade de Atendimento desta receita\">
                <span class=\"lup-pulse-dot\"></span>
                <span class=\"lup-icon\">🏥</span>
                <div class=\"lup-text-block\">
                    <span class=\"lup-label\">UNIDADE ATIVA</span>
                    <span class=\"lup-val\" id=\"luc-active-unit-name\">\${activeUnit.name}</span>
                </div>
                <span class=\"lup-btn-badge\">
                    <span>Alternar</span>
                    <svg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.8\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>
                </span>
            </div>
        \`;
        previewPane.prepend(wrap);
    };

    // 5. PORTAL CYBER-APPLE MEDICAL EXECUTIVE (SELEÇÃO, CRIAÇÃO E EDIÇÃO EM TEMPO REAL)
    App.openUnitPortal = function(mode = 'list', targetUnitId = null) {
        let overlay = document.getElementById('unit-portal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'unit-portal-overlay';
            overlay.className = 'units-portal-overlay';
            overlay.onclick = (e) => {
                if (e.target === overlay) overlay.remove();
            };
            document.body.appendChild(overlay);
        }

        const units = (App.UnitsDB && typeof App.UnitsDB.get === 'function') ? App.UnitsDB.get() : [];
        const activeId = (App.UnitsDB && typeof App.UnitsDB.getActive === 'function') ? App.UnitsDB.getActive() : null;

        // Se o modo for 'list', desenha a vitrine de seleção rápida com busca e abas
        if (mode === 'list') {
            let activeFilter = 'all';
            let searchQuery = '';

            const renderCardList = () => {
                const query = (searchQuery || '').toLowerCase().trim();
                const filtered = units.filter(u => {
                    // Filtro de Categoria
                    if (activeFilter === 'mental') {
                        const b = (u.badge || '').toLowerCase();
                        const n = (u.name || '').toLowerCase();
                        if (!b.includes('mental') && !b.includes('caps') && !b.includes('drogas') && !n.includes('caps')) return false;
                    } else if (activeFilter === 'specialized') {
                        const b = (u.badge || '').toLowerCase();
                        const n = (u.name || '').toLowerCase();
                        if (!b.includes('especial') && !b.includes('policl') && !n.includes('policlínica')) return false;
                    } else if (activeFilter === 'other') {
                        const b = (u.badge || '').toLowerCase();
                        const n = (u.name || '').toLowerCase();
                        if (b.includes('caps') || b.includes('mental') || b.includes('especial') || b.includes('policl')) return false;
                    }

                    // Busca textual
                    if (!query) return true;
                    return (u.name || '').toLowerCase().includes(query) ||
                           (u.sub || '').toLowerCase().includes(query) ||
                           (u.addr || '').toLowerCase().includes(query) ||
                           (u.city || '').toLowerCase().includes(query) ||
                           (u.badge || '').toLowerCase().includes(query) ||
                           (u.tel || '').toLowerCase().includes(query) ||
                           (u.cnes || '').toLowerCase().includes(query);
                });

                if (filtered.length === 0) {
                    return \`
                        <div style=\"text-align: center; padding: 48px 20px; color: #64748b;\">
                            <div style=\"font-size: 36px; margin-bottom: 10px;\">🔍</div>
                            <div style=\"font-size: 16px; font-weight: 750; color: #94a3b8;\">Nenhuma unidade encontrada</div>
                            <div style=\"font-size: 13px; margin-top: 4px; color: #64748b;\">Verifique os termos digitados ou adicione uma nova unidade.</div>
                            <button type=\"button\" class=\"up-btn-new-primary\" style=\"margin: 16px auto 0 auto;\" onclick=\"(window.App||App).openUnitPortal('new')\">
                                <span>+ Cadastrar Nova Unidade</span>
                            </button>
                        </div>
                    \`;
                }

                return filtered.map(u => {
                    const isActive = u.id === activeId;
                    const badgeLabel = u.badge || (u.id === 'unit_caps3_joao_carlos' ? 'Padrão / Saúde Mental' : 'Oficial SUS');
                    const firstLineAddr = (u.addr || '').split('\\n')[0] || (u.city || 'Feira de Santana - BA');

                    return \`
                        <div class=\"up-unit-card \${isActive ? 'is-active-unit' : ''}\" data-unit-id=\"\${u.id}\" onclick=\"(window.App||App).setGlobalActiveUnit('\${u.id}')\">
                            <div class=\"up-unit-card-left\">
                                <div class=\"up-unit-card-header\">
                                    <span class=\"up-unit-tag\">\${badgeLabel}</span>
                                    \${isActive ? \`
                                        <span class=\"up-unit-badge-active\">
                                            <span class=\"up-pulse-dot\"></span>
                                            <span>EM USO NA RECEITA</span>
                                        </span>
                                    \` : ''}
                                </div>
                                <div class=\"up-unit-title\">\${u.name}</div>
                                <div class=\"up-unit-sub\">
                                    <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><polyline points=\"17 21 17 13 7 13 7 21\"></polyline></svg>
                                    <span>\${u.sub || 'Secretaria Municipal de Saúde'}</span>
                                </div>
                                <div class=\"up-unit-meta\">
                                    <span class=\"up-meta-item\" title=\"Endereço\">
                                        <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle></svg>
                                        <span>\${firstLineAddr}</span>
                                    </span>
                                    \${u.tel ? \`
                                        <span class=\"up-meta-sep\">•</span>
                                        <span class=\"up-meta-item\" title=\"Telefone\">
                                            <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"></path></svg>
                                            <span>\${u.tel}</span>
                                        </span>
                                    \` : ''}
                                    \${u.cnes ? \`
                                        <span class=\"up-meta-sep\">•</span>
                                        <span class=\"up-meta-item\" title=\"CNES\">CNES: \${u.cnes}</span>
                                    \` : ''}
                                </div>
                            </div>

                            <div class=\"up-unit-card-right\">
                                <!-- Vitrine dos dois logos -->
                                <div class=\"up-dual-logo-display\" title=\"Logotipos oficiais do cabeçalho\">
                                    <div class=\"up-logo-frame\" title=\"Logo Esquerdo: Prefeitura / Governo\">
                                        \${u.logoPref ? \`<img src=\"\${u.logoPref}\" alt=\"Pref\">\` : '<span class=\"up-no-logo\">Sem logo</span>'}
                                        <span class=\"up-logo-frame-tag\">ESQ</span>
                                    </div>
                                    <div class=\"up-logo-frame-sep\"></div>
                                    <div class=\"up-logo-frame\" title=\"Logo Direito: Farmácia / SUS / Clínica\">
                                        \${u.logoFarm ? \`<img src=\"\${u.logoFarm}\" alt=\"Farm\">\` : '<span class=\"up-no-logo\">Sem logo</span>'}
                                        <span class=\"up-logo-frame-tag\">DIR</span>
                                    </div>
                                </div>

                                <!-- Ações do Card -->
                                <div class=\"up-card-action-btns\">
                                    \${isActive ? \`
                                        <button type=\"button\" class=\"up-btn-action-active\" disabled title=\"Unidade em uso na receita atual\">
                                            <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\"><polyline points=\"20 6 9 17 4 12\"></polyline></svg>
                                            <span>Em Uso</span>
                                        </button>
                                    \` : \`
                                        <button type=\"button\" class=\"up-btn-action-select\" onclick=\"event.stopPropagation(); (window.App||App).setGlobalActiveUnit('\${u.id}')\" title=\"Ativar esta unidade no receituário\">
                                            <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>
                                            <span>Ativar</span>
                                        </button>
                                    \`}
                                    <button type=\"button\" class=\"up-btn-action-edit\" onclick=\"event.stopPropagation(); (window.App||App).openUnitPortal('edit', '\${u.id}')\" title=\"Editar esta unidade e seus logotipos\">
                                        <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"></path></svg>
                                        <span>Editar</span>
                                    </button>
                                    \${!u.isDefault && units.length > 1 ? \`
                                        <button type=\"button\" class=\"up-btn-action-del\" onclick=\"event.stopPropagation(); if(confirm('Excluir a unidade \\\\'\${u.name}\\\\' permanentemente?')) { (window.App||App).UnitsDB.deleteUnit('\${u.id}'); (window.App||App).openUnitPortal('list'); }\" title=\"Excluir unidade\">
                                            <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg>
                                        </button>
                                    \` : ''}
                                </div>
                            </div>
                        </div>
                    \`;
                }).join('');
            };

            overlay.innerHTML = \`
                <div class=\"units-portal-card\" onclick=\"event.stopPropagation()\">
                    <!-- Top Header -->
                    <div class=\"up-header\">
                        <div class=\"up-title-wrap\">
                            <div class=\"up-icon-badge\">
                                <svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
                                    <path d=\"M3 21h18\"></path>
                                    <path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path>
                                    <path d=\"M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4\"></path>
                                    <path d=\"M10 9h4\"></path>
                                    <path d=\"M12 7v4\"></path>
                                </svg>
                            </div>
                            <div>
                                <div class=\"up-title-row\">
                                    <span class=\"up-title\">Unidades de Atendimento</span>
                                    <span class=\"up-count-pill\">\${units.length} cadastradas</span>
                                </div>
                                <div class=\"up-subtitle\">Selecione a unidade médica ou configure timbrados, logotipos e cabeçalhos oficiais.</div>
                            </div>
                        </div>
                        <div class=\"up-header-actions\">
                            <button type=\"button\" class=\"up-btn-new-primary\" onclick=\"(window.App||App).openUnitPortal('new')\">
                                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg>
                                <span>+ Nova Unidade</span>
                            </button>
                            <button type=\"button\" class=\"up-btn-close\" onclick=\"document.getElementById('unit-portal-overlay').remove()\" title=\"Fechar janela\">
                                <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Toolbar: Busca e Filtros Rápidos -->
                    <div class=\"up-toolbar\">
                        <div class=\"up-search-box\">
                            <svg class=\"up-search-svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><line x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"></line></svg>
                            <input type=\"text\" id=\"up-unit-search\" class=\"up-search-input\" placeholder=\"Buscar unidade por nome, setor, endereço ou telefone...\" autocomplete=\"off\">
                            <button type=\"button\" id=\"up-search-clear\" class=\"up-search-clear-btn\" style=\"display:none;\" title=\"Limpar busca\">✕</button>
                        </div>
                        <div class=\"up-filter-chips\">
                            <button type=\"button\" class=\"up-chip active\" data-filter=\"all\">Todas (\${units.length})</button>
                            <button type=\"button\" class=\"up-chip\" data-filter=\"mental\">Saúde Mental / CAPS</button>
                            <button type=\"button\" class=\"up-chip\" data-filter=\"specialized\">Especializadas / Policlínicas</button>
                            <button type=\"button\" class=\"up-chip\" data-filter=\"other\">Outras / Consultórios</button>
                        </div>
                    </div>

                    <!-- Lista de Cards com Scroll suave -->
                    <div class=\"up-units-list\" id=\"up-units-list-container\">
                        \${renderCardList()}
                    </div>

                    <!-- Rodapé com Ações de Apoio -->
                    <div class=\"up-footer\">
                        <div class=\"up-footer-left\">
                            <button type=\"button\" class=\"up-btn-restore\" onclick=\"if(confirm('Restaurar o catálogo oficial de fábrica da SMS Feira de Santana?')) { (window.App||App).UnitsDB.resetToDefaults(); (window.App||App).openUnitPortal('list'); }\">
                                <svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"1 4 1 10 7 10\"></polyline><path d=\"M3.51 15a9 9 0 1 0 2.13-9.36L1 10\"></path></svg>
                                <span>Restaurar Catálogo Padrão</span>
                            </button>
                        </div>
                        <div class=\"up-footer-right\">
                            <button type=\"button\" class=\"up-btn-studio\" onclick=\"document.getElementById('unit-portal-overlay').remove(); if(window.App && window.App.openSettings) window.App.openSettings('tab-unidade');\" title=\"Configurações completas no Studio\">
                                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z\"></path></svg>
                                <span>Studio Avançado</span>
                            </button>
                            <button type=\"button\" class=\"up-btn-new-primary\" onclick=\"(window.App||App).openUnitPortal('new')\">
                                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line></svg>
                                <span>+ Adicionar Nova Unidade</span>
                            </button>
                        </div>
                    </div>
                </div>
            \`;

            // Interatividade da barra de busca e filtros
            const searchInput = overlay.querySelector('#up-unit-search');
            const clearBtn = overlay.querySelector('#up-search-clear');
            const listContainer = overlay.querySelector('#up-units-list-container');
            const chips = overlay.querySelectorAll('.up-chip');

            if (searchInput && listContainer) {
                setTimeout(() => searchInput.focus(), 60);

                searchInput.oninput = (e) => {
                    searchQuery = e.target.value;
                    if (clearBtn) clearBtn.style.display = searchQuery ? 'flex' : 'none';
                    listContainer.innerHTML = renderCardList();
                };

                if (clearBtn) {
                    clearBtn.onclick = () => {
                        searchInput.value = '';
                        searchQuery = '';
                        clearBtn.style.display = 'none';
                        listContainer.innerHTML = renderCardList();
                        searchInput.focus();
                    };
                }

                chips.forEach(chip => {
                    chip.onclick = () => {
                        chips.forEach(c => c.classList.remove('active'));
                        chip.classList.add('active');
                        activeFilter = chip.dataset.filter;
                        listContainer.innerHTML = renderCardList();
                    };
                });
            }

        } else if (mode === 'edit' || mode === 'new') {
            // MODO EDITOR DE UNIDADE / CADASTRO DE NOVA UNIDADE
            const isNew = mode === 'new';
            const unitObj = isNew ? {
                id: 'unit_custom_' + Date.now(),
                name: '',
                sub: 'Secretaria Municipal de Saúde',
                addr: 'Avenida Getúlio Vargas, n 2751 - Santa Mônica\\nTelefone (75) 3612-6600',
                city: 'Feira de Santana - BA',
                cnes: '',
                tel: '(75) 3612-6600',
                logoPref: 'prefeitura.png',
                logoFarm: 'farmacia.png',
                badge: 'Atenção Especializada',
                isDefault: false
            } : (units.find(u => u.id === targetUnitId) || units[0] || {});

            let tempLogoPref = unitObj.logoPref || null;
            let tempLogoFarm = unitObj.logoFarm || null;

            overlay.innerHTML = \`
                <div class=\"units-portal-card\" onclick=\"event.stopPropagation()\">
                    <!-- Header do Editor -->
                    <div class=\"up-header\">
                        <div class=\"up-title-wrap\">
                            <button type=\"button\" class=\"up-btn-back\" onclick=\"(window.App||App).openUnitPortal('list')\" title=\"Voltar à lista de unidades\">
                                <svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><polyline points=\"15 18 9 12 15 6\"></polyline></svg>
                                <span>Voltar à Lista</span>
                            </button>
                            <div class=\"up-divider-vertical\"></div>
                            <div>
                                <div class=\"up-title-row\">
                                    <span class=\"up-title\">\${isNew ? 'Nova Unidade de Atendimento' : 'Editar Unidade de Atendimento'}</span>
                                    <span class=\"up-count-pill\" style=\"background:rgba(56,189,248,0.18); color:#38bdf8; border-color:rgba(56,189,248,0.4);\">\${isNew ? 'Novo Cadastro' : 'Edição'}</span>
                                </div>
                                <div class=\"up-subtitle\">Configure o nome oficial, endereços e logotipos que aparecerão no cabeçalho impresso da receita.</div>
                            </div>
                        </div>
                        <button type=\"button\" class=\"up-btn-close\" onclick=\"document.getElementById('unit-portal-overlay').remove()\" title=\"Fechar janela\">
                            <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"></line><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"></line></svg>
                        </button>
                    </div>

                    <!-- Corpo do Editor (Scrollável) -->
                    <div class=\"up-editor-body\">
                        <div class=\"up-editor-grid\">
                            <!-- Coluna 1: Campos Oficiais -->
                            <div class=\"up-editor-col\">
                                <div class=\"up-section-heading\">
                                    <span class=\"up-section-num\">1</span>
                                    <span>Identificação Oficial da Unidade</span>
                                </div>

                                <div class=\"up-form-group\">
                                    <label class=\"up-label\">Nome Oficial da Unidade (Cabeçalho) *</label>
                                    <input type=\"text\" id=\"ue-name\" class=\"up-input\" value=\"\${unitObj.name || ''}\" placeholder=\"Ex: CAPS III Dr. João Carlos Lopes Cavalcante\" autocomplete=\"off\">
                                </div>

                                <div class=\"up-form-row\">
                                    <div class=\"up-form-group\" style=\"flex: 1.2;\">
                                        <label class=\"up-label\">Órgão / Secretaria</label>
                                        <input type=\"text\" id=\"ue-sub\" class=\"up-input\" value=\"\${unitObj.sub || 'Secretaria Municipal de Saúde'}\" placeholder=\"Ex: Secretaria Municipal de Saúde\" autocomplete=\"off\">
                                    </div>
                                    <div class=\"up-form-group\" style=\"flex: 1;\">
                                        <label class=\"up-label\">Categoria / Badge</label>
                                        <input type=\"text\" id=\"ue-badge\" class=\"up-input\" list=\"ue-badge-suggestions\" value=\"\${unitObj.badge || 'Atenção Especializada'}\" placeholder=\"Ex: Saúde Mental\" autocomplete=\"off\">
                                        <datalist id=\"ue-badge-suggestions\">
                                            <option value=\"Padrão / Saúde Mental\">
                                            <option value=\"Álcool e Outras Drogas\">
                                            <option value=\"Infantojuvenil\">
                                            <option value=\"Especialidades / Policlínica\">
                                            <option value=\"Atenção Básica / UBS\">
                                            <option value=\"Consultório Privado\">
                                            <option value=\"Hospital Geral\">
                                        </datalist>
                                    </div>
                                </div>

                                <div class=\"up-form-group\">
                                    <label class=\"up-label\">Endereço Completo & Telefone Oficial</label>
                                    <textarea id=\"ue-addr\" class=\"up-textarea\" rows=\"2\" placeholder=\"Ex: Avenida Getúlio Vargas, n 2751 - Santa Mônica&#10;Telefone (75) 3612-6600\">\${unitObj.addr || ''}</textarea>
                                    <span class=\"up-hint\">Dica: Quebras de linha serão reproduzidas fielmente no centro do cabeçalho da receita impressa.</span>
                                </div>

                                <div class=\"up-form-row\">
                                    <div class=\"up-form-group\" style=\"flex: 1.2;\">
                                        <label class=\"up-label\">Município - UF</label>
                                        <input type=\"text\" id=\"ue-city\" class=\"up-input\" value=\"\${unitObj.city || 'Feira de Santana - BA'}\" placeholder=\"Feira de Santana - BA\" autocomplete=\"off\">
                                    </div>
                                    <div class=\"up-form-group\" style=\"flex: 1;\">
                                        <label class=\"up-label\">Telefone Direto</label>
                                        <input type=\"text\" id=\"ue-tel\" class=\"up-input\" value=\"\${unitObj.tel || ''}\" placeholder=\"(75) 3612-6600\" autocomplete=\"off\">
                                    </div>
                                    <div class=\"up-form-group\" style=\"flex: 0.8;\">
                                        <label class=\"up-label\">Código CNES</label>
                                        <input type=\"text\" id=\"ue-cnes\" class=\"up-input\" value=\"\${unitObj.cnes || ''}\" placeholder=\"0000000\" autocomplete=\"off\">
                                    </div>
                                </div>
                            </div>

                            <!-- Coluna 2: Logotipos Oficiais -->
                            <div class=\"up-editor-col\">
                                <div class=\"up-section-heading\">
                                    <span class=\"up-section-num\">2</span>
                                    <span>Logotipos Oficiais da Receita</span>
                                </div>

                                <div class=\"up-logos-editor-grid\">
                                    <!-- Logo Esquerdo (Prefeitura) -->
                                    <div class=\"up-logo-edit-box\">
                                        <div class=\"up-logo-edit-header\">
                                            <span class=\"up-logo-pos-badge\">LADO ESQUERDO</span>
                                            <span class=\"up-logo-title\">Brasão / Prefeitura</span>
                                        </div>
                                        <div class=\"up-logo-preview-viewport\" id=\"ue-preview-pref-box\">
                                            \${tempLogoPref ? \`<img id=\"ue-img-pref\" src=\"\${tempLogoPref}\" alt=\"Logo Pref\">\` : '<div class=\"up-empty-logo-txt\">Sem Logotipo</div>'}
                                        </div>
                                        <div class=\"up-logo-controls\">
                                            <button type=\"button\" class=\"up-btn-logo-action\" id=\"ue-btn-upload-pref\">
                                                <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"17 8 12 3 7 8\"></polyline><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"></line></svg>
                                                <span>Trocar Imagem</span>
                                            </button>
                                            <input type=\"file\" id=\"ue-file-pref\" accept=\"image/*\" style=\"display:none;\">
                                            <button type=\"button\" class=\"up-btn-logo-action\" id=\"ue-btn-default-pref\" title=\"Usar brasão da Prefeitura de Feira de Santana\">
                                                <span>🏛️ Padrão</span>
                                            </button>
                                            <button type=\"button\" class=\"up-btn-logo-action danger\" id=\"ue-btn-remove-pref\" title=\"Remover logotipo deste lado\">
                                                <span>✕ Remover</span>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Logo Direito (Farmácia / SUS / Clínica) -->
                                    <div class=\"up-logo-edit-box\">
                                        <div class=\"up-logo-edit-header\">
                                            <span class=\"up-logo-pos-badge\">LADO DIREITO</span>
                                            <span class=\"up-logo-title\">Farmácia / SUS / Clínica</span>
                                        </div>
                                        <div class=\"up-logo-preview-viewport\" id=\"ue-preview-farm-box\">
                                            \${tempLogoFarm ? \`<img id=\"ue-img-farm\" src=\"\${tempLogoFarm}\" alt=\"Logo Farm\">\` : '<div class=\"up-empty-logo-txt\">Sem Logotipo</div>'}
                                        </div>
                                        <div class=\"up-logo-controls\">
                                            <button type=\"button\" class=\"up-btn-logo-action\" id=\"ue-btn-upload-farm\">
                                                <svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><polyline points=\"17 8 12 3 7 8\"></polyline><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"></line></svg>
                                                <span>Trocar Imagem</span>
                                            </button>
                                            <input type=\"file\" id=\"ue-file-farm\" accept=\"image/*\" style=\"display:none;\">
                                            <button type=\"button\" class=\"up-btn-logo-action\" id=\"ue-btn-default-farm\" title=\"Usar símbolo oficial da Farmácia/SUS\">
                                                <span>💊 Padrão</span>
                                            </button>
                                            <button type=\"button\" class=\"up-btn-logo-action danger\" id=\"ue-btn-remove-farm\" title=\"Remover logotipo deste lado\">
                                                <span>✕ Remover</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Simulador A4 em tempo real -->
                        <div class=\"up-live-simulator-container\">
                            <div class=\"up-sim-badge\">
                                <span class=\"up-sim-dot\"></span>
                                <span>SIMULADOR AO VIVO DO CABEÇALHO NA RECEITA (PAPEL A4)</span>
                            </div>
                            <div class=\"up-paper-sheet\">
                                <div class=\"up-paper-header\">
                                    <div class=\"up-paper-logo-slot\" id=\"sim-logo-left\">
                                        \${tempLogoPref ? \`<img src=\"\${tempLogoPref}\" alt=\"Logo Esquerdo\">\` : ''}
                                    </div>
                                    <div class=\"up-paper-text-slot\" id=\"sim-text-center\">
                                        <b id=\"sim-name\">\${unitObj.name || 'Nome da Unidade de Saúde'}</b>
                                        <span id=\"sim-sub\">\${unitObj.sub || 'Secretaria Municipal de Saúde'}</span><br>
                                        <span id=\"sim-addr\">\${(unitObj.addr || 'Avenida Principal, nº 00').replace(/\\n/g, '<br>')}</span>
                                    </div>
                                    <div class=\"up-paper-logo-slot\" id=\"sim-logo-right\">
                                        \${tempLogoFarm ? \`<img src=\"\${tempLogoFarm}\" alt=\"Logo Direito\">\` : ''}
                                    </div>
                                </div>
                                <div class=\"up-paper-fake-lines\">
                                    <div class=\"up-fake-line\" style=\"width: 38%;\"></div>
                                    <div class=\"up-fake-line\" style=\"width: 78%;\"></div>
                                    <div class=\"up-fake-line\" style=\"width: 60%;\"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Rodapé com Ações do Editor -->
                    <div class=\"up-footer\">
                        <div class=\"up-footer-left\">
                            \${!isNew && !unitObj.isDefault ? \`
                                <button type=\"button\" class=\"up-btn-del-unit-full\" id=\"ue-btn-delete\">
                                    <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"3 6 5 6 21 6\"></polyline><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg>
                                    <span>Excluir Unidade</span>
                                </button>
                            \` : '<span></span>'}
                        </div>
                        <div class=\"up-footer-right\">
                            <button type=\"button\" class=\"up-btn-cancel\" onclick=\"(window.App||App).openUnitPortal('list')\">
                                <span>Cancelar</span>
                            </button>
                            <button type=\"button\" class=\"up-btn-save-draft\" id=\"ue-btn-save\">
                                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><path d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"></path><polyline points=\"17 21 17 13 7 13 7 21\"></polyline><polyline points=\"7 3 7 8 15 8\"></polyline></svg>
                                <span>Salvar Alterações</span>
                            </button>
                            <button type=\"button\" class=\"up-btn-save-activate\" id=\"ue-btn-save-activate\">
                                <svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"></polygon></svg>
                                <span>Salvar & Ativar na Receita</span>
                            </button>
                        </div>
                    </div>
                </div>
            \`;

            // Elementos do Formulário
            const inputName = overlay.querySelector('#ue-name');
            const inputSub = overlay.querySelector('#ue-sub');
            const inputBadge = overlay.querySelector('#ue-badge');
            const inputAddr = overlay.querySelector('#ue-addr');
            const inputCity = overlay.querySelector('#ue-city');
            const inputTel = overlay.querySelector('#ue-tel');
            const inputCnes = overlay.querySelector('#ue-cnes');

            // Elementos do Simulador A4
            const simName = overlay.querySelector('#sim-name');
            const simSub = overlay.querySelector('#sim-sub');
            const simAddr = overlay.querySelector('#sim-addr');
            const simLogoLeft = overlay.querySelector('#sim-logo-left');
            const simLogoRight = overlay.querySelector('#sim-logo-right');

            const updateSimulator = () => {
                if (simName) simName.innerText = (inputName.value || 'Nome da Unidade de Saúde').trim();
                if (simSub) simSub.innerText = (inputSub.value || 'Secretaria Municipal de Saúde').trim();
                if (simAddr) simAddr.innerHTML = (inputAddr.value || 'Endereço da Unidade').trim().replace(/\\n/g, '<br>');
                if (simLogoLeft) simLogoLeft.innerHTML = tempLogoPref ? \`<img src=\"\${tempLogoPref}\" alt=\"Logo Esquerdo\">\` : '';
                if (simLogoRight) simLogoRight.innerHTML = tempLogoFarm ? \`<img src=\"\${tempLogoFarm}\" alt=\"Logo Direito\">\` : '';
            };

            // Eventos de digitação em tempo real
            [inputName, inputSub, inputAddr, inputCity, inputTel].forEach(inp => {
                if (inp) inp.oninput = updateSimulator;
            });

            // Upload Logo Esquerdo (Prefeitura)
            const btnUploadPref = overlay.querySelector('#ue-btn-upload-pref');
            const filePref = overlay.querySelector('#ue-file-pref');
            const previewPrefBox = overlay.querySelector('#ue-preview-pref-box');
            const btnDefaultPref = overlay.querySelector('#ue-btn-default-pref');
            const btnRemovePref = overlay.querySelector('#ue-btn-remove-pref');

            if (btnUploadPref && filePref) {
                btnUploadPref.onclick = () => filePref.click();
                filePref.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            tempLogoPref = ev.target.result;
                            if (previewPrefBox) previewPrefBox.innerHTML = \`<img id=\"ue-img-pref\" src=\"\${tempLogoPref}\" alt=\"Logo Pref\">\`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultPref) {
                btnDefaultPref.onclick = () => {
                    tempLogoPref = 'prefeitura.png';
                    if (previewPrefBox) previewPrefBox.innerHTML = \`<img id=\"ue-img-pref\" src=\"\${tempLogoPref}\" alt=\"Logo Pref\">\`;
                    updateSimulator();
                };
            }

            if (btnRemovePref) {
                btnRemovePref.onclick = () => {
                    tempLogoPref = null;
                    if (previewPrefBox) previewPrefBox.innerHTML = '<div class=\"up-empty-logo-txt\">Sem Logotipo</div>';
                    updateSimulator();
                };
            }

            // Upload Logo Direito (Farmácia / SUS / Clínica)
            const btnUploadFarm = overlay.querySelector('#ue-btn-upload-farm');
            const fileFarm = overlay.querySelector('#ue-file-farm');
            const previewFarmBox = overlay.querySelector('#ue-preview-farm-box');
            const btnDefaultFarm = overlay.querySelector('#ue-btn-default-farm');
            const btnRemoveFarm = overlay.querySelector('#ue-btn-remove-farm');

            if (btnUploadFarm && fileFarm) {
                btnUploadFarm.onclick = () => fileFarm.click();
                fileFarm.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            tempLogoFarm = ev.target.result;
                            if (previewFarmBox) previewFarmBox.innerHTML = \`<img id=\"ue-img-farm\" src=\"\${tempLogoFarm}\" alt=\"Logo Farm\">\`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultFarm) {
                btnDefaultFarm.onclick = () => {
                    tempLogoFarm = 'farmacia.png';
                    if (previewFarmBox) previewFarmBox.innerHTML = \`<img id=\"ue-img-farm\" src=\"\${tempLogoFarm}\" alt=\"Logo Farm\">\`;
                    updateSimulator();
                };
            }

            if (btnRemoveFarm) {
                btnRemoveFarm.onclick = () => {
                    tempLogoFarm = null;
                    if (previewFarmBox) previewFarmBox.innerHTML = '<div class=\"up-empty-logo-txt\">Sem Logotipo</div>';
                    updateSimulator();
                };
            }

            // Função centralizada para compilar os dados do formulário
            const getFormData = () => {
                const name = (inputName.value || '').trim();
                if (!name) {
                    alert('Por favor, informe o Nome Oficial da Unidade.');
                    inputName.focus();
                    return null;
                }

                return {
                    id: unitObj.id || ('unit_custom_' + Date.now()),
                    name: name,
                    sub: (inputSub.value || '').trim(),
                    badge: (inputBadge.value || '').trim() || 'Atenção Especializada',
                    addr: (inputAddr.value || '').trim(),
                    city: (inputCity.value || '').trim() || 'Feira de Santana - BA',
                    tel: (inputTel.value || '').trim(),
                    cnes: (inputCnes.value || '').trim(),
                    logoPref: tempLogoPref,
                    logoFarm: tempLogoFarm,
                    isDefault: unitObj.isDefault || false
                };
            };

            // Salvar Rascunho / Voltar à lista
            const btnSave = overlay.querySelector('#ue-btn-save');
            if (btnSave) {
                btnSave.onclick = () => {
                    const data = getFormData();
                    if (!data) return;
                    App.UnitsDB.saveUnit(data);
                    if (typeof App.showNotification === 'function') {
                        App.showNotification(\`Unidade "\${data.name}" salva com sucesso!\`, 'success');
                    }
                    if (typeof window.playProSound === 'function') {
                        window.playProSound('click');
                    }
                    App.openUnitPortal('list');
                };
            }

            // Salvar & Ativar Imediatamente na Receita
            const btnSaveActivate = overlay.querySelector('#ue-btn-save-activate');
            if (btnSaveActivate) {
                btnSaveActivate.onclick = () => {
                    const data = getFormData();
                    if (!data) return;
                    const saved = App.UnitsDB.saveUnit(data);
                    App.setGlobalActiveUnit(saved.id);
                };
            }

            // Excluir Unidade
            const btnDelete = overlay.querySelector('#ue-btn-delete');
            if (btnDelete) {
                btnDelete.onclick = () => {
                    if (confirm(\`Tem certeza que deseja excluir a unidade "\${unitObj.name}"?\`)) {
                        App.UnitsDB.deleteUnit(unitObj.id);
                        if (typeof App.showNotification === 'function') {
                            App.showNotification('Unidade excluída.', 'info');
                        }
                        App.openUnitPortal('list');
                    }
                };
            }

            // Foco inicial
            setTimeout(() => {
                if (inputName) {
                    inputName.focus();
                    if (isNew) inputName.select();
                }
            }, 80);
        }
    };

    // Exporta explicitamente no window para chamadas inline HTML
    window.App = App;
    window.openUnitPortal = App.openUnitPortal;

    // 6. INTEGRAÇÃO NO LOGIN
    const originalExecLoginV4 = App.executeLogin;
    App.executeLogin = function(index) {
        if (originalExecLoginV4) originalExecLoginV4.apply(this, [index]);
        const activeUnitId = App.UnitsDB.getActive();
        App.applyActiveUnit(activeUnitId, { silent: true });
        setTimeout(() => App.injectLiveUnitPill(), 200);
    };

    // 7. INTEGRAÇÃO NO RENDER DO RECEITUÁRIO
    const originalRenderV4 = App.render;
    App.render = function() {
        if (originalRenderV4) originalRenderV4.apply(this, arguments);
        const activeUnit = App.UnitsDB.getActiveUnit();
        if (activeUnit) {
            setTimeout(() => {
                // Atualiza imagens
                if (activeUnit.logoPref) {
                    document.querySelectorAll('img[src*="prefeitura"]').forEach(img => img.src = activeUnit.logoPref);
                }
                if (activeUnit.logoFarm) {
                    document.querySelectorAll('img[src*="farmacia"]').forEach(img => img.src = activeUnit.logoFarm);
                }
                App.injectLiveUnitPill();
            }, 50);
        }
    };

    // 8. INICIALIZAÇÃO CONTÍNUA
    setTimeout(() => {
        App.UnitsDB.get(); // Dispara auto-migração silenciosa
        App.injectLiveUnitPill();
    }, 600);
    setTimeout(() => App.injectLiveUnitPill(), 2000);

})();

// =========================================================================
// 🏢 PATCH V4100: INTEGRAÇÃO NATIVA E ALINHAMENTO DA SELEÇÃO DE UNIDADES
// =========================================================================
setTimeout(() => {
    if (typeof App === 'undefined') return;

    // 1. DESATIVA O BANNER FLUTUANTE ANTIGO E REMOVE DO DOM
    App.injectUnitBanner = function() { /* Silenciado */ };
    const oldBanner = document.getElementById('global-unit-banner');
    if (oldBanner) oldBanner.remove();

    // 2. CSS DO NOVO SELETOR INTEGRADO
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
                font-family: 'Inter', system-ui, sans-serif !important;
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

        // Limpa a sujeira antiga
        const banner = document.getElementById('global-unit-banner');
        if (banner) banner.remove();

        // Esconde as antigas abas de "Filtrar por unidade" que quebravam o layout
        wrapper.querySelectorAll('.apple-label, .unit-filter-container').forEach(el => {
            el.style.display = 'none';
        });

        // Tenta achar o nosso botão novo, se não achar, cria
        let selector = document.getElementById('integrated-unit-selector');
        if (!selector) {
            selector = document.createElement('div');
            selector.id = 'integrated-unit-selector';
            
            // Injeta exatamente acima do Carrossel de Perfis
            const carousel = wrapper.querySelector('.apple-carousel-area');
            if (carousel) {
                carousel.parentNode.insertBefore(selector, carousel);
            } else {
                wrapper.appendChild(selector);
            }
        }

        // Puxa o nome da unidade ativa para mostrar no botão
        const units = (App.UnitsDB && typeof App.UnitsDB.get === 'function') ? App.UnitsDB.get() : [];
        const activeId = (App.UnitsDB && typeof App.UnitsDB.getActive === 'function') ? App.UnitsDB.getActive() : null;
        const activeUnit = units.find(u => u.id === activeId) || units[0] || { name: 'CAPS III Dr. João Carlos Lopes Cavalcante' };

        // Garante o onclick SEMPRE (mesmo se o elemento já existia no DOM)
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
            <div style=\"display: flex; align-items: center; max-width: 70%; pointer-events: none;\">
                <div class=\"ius-icon\">
                    <svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
                        <path d=\"M3 21h18\"></path>
                        <path d=\"M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16\"></path>
                        <path d=\"M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4\"></path>
                        <path d=\"M10 9h4\"></path>
                        <path d=\"M12 7v4\"></path>
                    </svg>
                </div>
                <div class=\"ius-texts\">
                    <div class=\"ius-label\">Unidade de Atendimento</div>
                    <div class=\"ius-value\">\${activeUnit.name}</div>
                </div>
            </div>
            <button type=\"button\" class=\"ius-btn\" onclick=\"event.stopPropagation(); (window.App||App).openUnitPortal('list');\">Trocar</button>
        \`;
    };

    // 4. ATRELA A INJEÇÃO AO RENDER DO CARROSSEL (Garante que sempre aparece)
    const renderProfilesV4100 = App.renderLocalProfilesUI;
    App.renderLocalProfilesUI = function() {
        if (renderProfilesV4100) renderProfilesV4100.apply(this);
        
        // Dá 50ms para a tela desenhar o HTML original e depois injetamos o botão
        setTimeout(() => {
            App.injectIntegratedUnitSelector();
        }, 50);
    };

    // 5. ATUALIZA A FUNÇÃO DE TROCAR UNIDADE PARA ATUALIZAR O BOTÃO NATIVO
    if (typeof App.setGlobalActiveUnit === 'function') {
        const originalSetGlobalActiveUnit = App.setGlobalActiveUnit;
        App.setGlobalActiveUnit = function(id) {
            originalSetGlobalActiveUnit.apply(this, [id]);
            App.injectIntegratedUnitSelector(); // Atualiza o nome escrito no botão
        };
    }

    // 6. EXECUTA IMEDIATAMENTE CASO A TELA JÁ ESTEJA ABERTA
    App.injectIntegratedUnitSelector();

}, 100);
`;

console.log('Test script compiled, length:', code.length);
