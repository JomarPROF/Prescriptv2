// =========================================================================
// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS
// =========================================================================
(function() {
    if (typeof App === 'undefined') return;

    // 1. CATÁLOGO EXCLUSIVO DAS 6 UNIDADES OFICIAIS
    const CURATED_DEFAULT_UNITS = [
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

    // 2. BANCO DE DADOS INTELIGENTE COM RESET EXCLUSIVO DE CATÁLOGO
    App.UnitsDB = {
        CURATED_DEFAULTS: CURATED_DEFAULT_UNITS,

        get() {
            const CATALOG_VERSION = 'v20261012_olindina_no_ba';
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
            clone.name = `${clone.name} (Cópia)`;
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

        // D. Atualização direta do DOM nos cabeçalhos já renderizados (Sem conflito cruzado entre logos)
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
                    el.style.backgroundImage = `url("${activeUnit.logoPref}")`;
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
                    el.style.backgroundImage = `url("${activeUnit.logoFarm}")`;
                    el.style.display = 'block';
                } else {
                    el.style.backgroundImage = 'none';
                }
            }
        });

        // Texto central do cabeçalho
        const safeAddrHtml = (activeUnit.addr || '').replace(/\n/g, '<br>');
        document.querySelectorAll('.header-text-center').forEach(el => {
            el.innerHTML = `<b>${activeUnit.name}</b><br>${activeUnit.sub || ''}<br>${safeAddrHtml}`;
        });

        // E. Re-renderiza o receituário para recalcular layout das vias e proporções
        if (typeof this.render === 'function') {
            try { this.render(); } catch(e) {}
        }

        // F. Atualiza os Badges e Pílulas na UI de login
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
                this.showNotification(`🏥 Unidade ativa: ${activeUnit.name}`, 'success');
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

    // 4. DESATIVA TOTALMENTE O BOTÃO FLUTUANTE (Conforme solicitado)
    App.injectLiveUnitPill = function() {
        const floating = document.getElementById('live-unit-hud-wrap');
        if (floating) floating.remove();
    };

    // 5. PORTAL MINIMALISTA NÍVEL APPLE (SELEÇÃO, CRIAÇÃO E EDIÇÃO INTUITIVA)
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

        // MODO LISTA MINIMALISTA APPLE
        if (mode === 'list') {
            let searchQuery = '';

            const renderCards = () => {
                const q = (searchQuery || '').toLowerCase().trim();
                const filtered = units.filter(u => {
                    if (!q) return true;
                    return (u.name || '').toLowerCase().includes(q) ||
                           (u.sub || '').toLowerCase().includes(q) ||
                           (u.addr || '').toLowerCase().includes(q) ||
                           (u.city || '').toLowerCase().includes(q);
                });

                if (filtered.length === 0) {
                    return `
                        <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                            <div style="font-size: 15px; font-weight: 600; color: #94a3b8;">Nenhuma unidade encontrada</div>
                            <div style="font-size: 13px; margin-top: 4px;">Tente outro termo ou crie uma nova unidade.</div>
                        </div>
                    `;
                }

                return filtered.map(u => {
                    const isActive = u.id === activeId;
                    const shortAddr = (u.addr || '').split('\n')[0] || (u.city || 'Feira de Santana - BA');

                    return `
                        <div class="up-apple-card ${isActive ? 'is-active' : ''}" onclick="(window.App||App).setGlobalActiveUnit('${u.id}')">
                            <div class="up-card-left">
                                <div class="up-apple-radio">
                                    ${isActive ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                                </div>
                                <div class="up-card-text">
                                    <div class="up-card-name">${u.name}</div>
                                    <div class="up-card-detail">${u.sub ? u.sub + ' • ' : ''}${shortAddr}</div>
                                </div>
                            </div>
                            <div class="up-card-right">
                                <span class="up-unit-badge-tag">${u.badge || (u.isDefault ? 'Oficial' : 'Geral')}</span>
                                <button type="button" class="up-btn-edit-apple" onclick="event.stopPropagation(); (window.App||App).openUnitPortal('edit', '${u.id}')" title="Editar dados e logotipos">
                                    Editar
                                </button>
                                ${!u.isDefault && units.length > 1 ? `
                                    <button type="button" class="up-btn-del-apple" onclick="event.stopPropagation(); if(confirm('Excluir \\'${u.name}\\'?')) { (window.App||App).UnitsDB.deleteUnit('${u.id}'); (window.App||App).openUnitPortal('list'); }" title="Excluir">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            };

            overlay.innerHTML = `
                <div class="units-portal-card" onclick="event.stopPropagation()">
                    <!-- Header Apple -->
                    <div class="up-header">
                        <div class="up-title-wrap">
                            <div class="up-title">Unidade de Atendimento</div>
                            <div class="up-subtitle">Selecione o local para emitir a receita médica</div>
                        </div>
                        <div class="up-header-actions">
                            <button type="button" class="up-btn-new-apple" onclick="(window.App||App).openUnitPortal('new')">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                <span>Nova Unidade</span>
                            </button>
                            <button type="button" class="up-btn-close-apple" onclick="document.getElementById('unit-portal-overlay').remove()" title="Fechar">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Busca Minimalista -->
                    <div class="up-search-container">
                        <div class="up-search-input-wrap">
                            <svg class="up-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" id="up-apple-search-input" class="up-apple-search" placeholder="Buscar unidade por nome ou endereço..." autocomplete="off">
                        </div>
                    </div>

                    <!-- Lista de Unidades -->
                    <div class="up-units-list" id="up-apple-units-list">
                        ${renderCards()}
                    </div>

                    <!-- Footer Apple -->
                    <div class="up-footer-apple">
                        <button type="button" class="up-link-restore" onclick="if(confirm('Restaurar o catálogo oficial de unidades?')) { (window.App||App).UnitsDB.resetToDefaults(); (window.App||App).openUnitPortal('list'); }">
                            Restaurar unidades de fábrica
                        </button>
                        <button type="button" class="up-btn-close-foot" onclick="document.getElementById('unit-portal-overlay').remove()">
                            Fechar
                        </button>
                    </div>
                </div>
            `;

            const searchInput = overlay.querySelector('#up-apple-search-input');
            const listContainer = overlay.querySelector('#up-apple-units-list');
            if (searchInput && listContainer) {
                setTimeout(() => searchInput.focus(), 60);
                searchInput.oninput = (e) => {
                    searchQuery = e.target.value;
                    listContainer.innerHTML = renderCards();
                };
            }

        } else if (mode === 'edit' || mode === 'new') {
            // MODO EDITOR MINIMALISTA APPLE
            const isNew = mode === 'new';
            const unitObj = isNew ? {
                id: 'unit_custom_' + Date.now(),
                name: '',
                sub: 'Secretaria Municipal de Saúde',
                addr: 'Avenida Getúlio Vargas, n 2751 - Santa Mônica\nTelefone (75) 3612-6600',
                city: 'Feira de Santana - BA',
                cnes: '',
                tel: '(75) 3612-6600',
                logoPref: 'prefeitura.png',
                logoFarm: 'farmacia.png',
                badge: 'Geral',
                isDefault: false
            } : (units.find(u => u.id === targetUnitId) || units[0] || {});

            let tempLogoPref = unitObj.logoPref || null;
            let tempLogoFarm = unitObj.logoFarm || null;

            overlay.innerHTML = `
                <div class="units-portal-card" onclick="event.stopPropagation()">
                    <!-- Header -->
                    <div class="up-header">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <button type="button" class="up-btn-back-apple" onclick="(window.App||App).openUnitPortal('list')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                <span>Voltar</span>
                            </button>
                            <div style="width:1px; height:20px; background:rgba(255,255,255,0.12);"></div>
                            <div class="up-title">${isNew ? 'Nova Unidade' : 'Editar Unidade'}</div>
                        </div>
                        <button type="button" class="up-btn-close-apple" onclick="document.getElementById('unit-portal-overlay').remove()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <!-- Conteúdo do Formulário -->
                    <div class="up-editor-content">
                        <!-- Nome -->
                        <div class="up-field">
                            <label class="up-field-label">Nome Oficial da Unidade</label>
                            <input type="text" id="ue-name" class="up-field-input" value="${unitObj.name || ''}" placeholder="Ex: CAPS III Dr. João Carlos Lopes Cavalcante" autocomplete="off">
                        </div>

                        <!-- Subtítulo -->
                        <div class="up-field">
                            <label class="up-field-label">Órgão / Secretaria</label>
                            <input type="text" id="ue-sub" class="up-field-input" value="${unitObj.sub || 'Secretaria Municipal de Saúde'}" placeholder="Ex: Secretaria Municipal de Saúde" autocomplete="off">
                        </div>

                        <!-- Endereço -->
                        <div class="up-field">
                            <label class="up-field-label">Endereço Completo & Telefone (Linhas centrais do timbrado)</label>
                            <textarea id="ue-addr" class="up-field-textarea" rows="2" placeholder="Ex: Avenida Getúlio Vargas, n 2751 - Santa Mônica&#10;Telefone (75) 3612-6600">${unitObj.addr || ''}</textarea>
                        </div>

                        <!-- Cidade e Telefone -->
                        <div class="up-field-row">
                            <div class="up-field" style="flex:1;">
                                <label class="up-field-label">Município - UF</label>
                                <input type="text" id="ue-city" class="up-field-input" value="${unitObj.city || 'Feira de Santana - BA'}" placeholder="Feira de Santana - BA" autocomplete="off">
                            </div>
                            <div class="up-field" style="flex:1;">
                                <label class="up-field-label">Telefone Direto</label>
                                <input type="text" id="ue-tel" class="up-field-input" value="${unitObj.tel || ''}" placeholder="(75) 3612-6600" autocomplete="off">
                            </div>
                        </div>

                        <!-- Logotipos -->
                        <div class="up-logos-section">
                            <label class="up-field-label" style="margin-bottom:2px;">Logotipos Oficiais do Cabeçalho</label>
                            <div class="up-logos-grid">
                                <!-- Esquerdo -->
                                <div class="up-logo-card-apple">
                                    <span class="up-logo-card-title">Logotipo Esquerdo (Prefeitura)</span>
                                    <div class="up-logo-stage-box">
                                        <div class="up-logo-plate" id="ue-preview-pref-box">
                                            ${tempLogoPref ? `<img id="ue-img-pref" class="up-logo-thumb-img" src="${tempLogoPref}" alt="Pref">` : '<span class="up-logo-none-text">Sem logotipo</span>'}
                                        </div>
                                    </div>
                                    <div class="up-logo-actions-apple">
                                        <button type="button" class="up-btn-logo-apple" id="ue-btn-upload-pref">Escolher Foto</button>
                                        <input type="file" id="ue-file-pref" accept="image/*" style="display:none;">
                                        <button type="button" class="up-btn-logo-apple" id="ue-btn-default-pref">Padrão</button>
                                        <button type="button" class="up-btn-logo-apple up-btn-logo-del" id="ue-btn-remove-pref">Remover</button>
                                    </div>
                                </div>

                                <!-- Direito -->
                                <div class="up-logo-card-apple">
                                    <span class="up-logo-card-title">Logotipo Direito (Farmácia/SUS)</span>
                                    <div class="up-logo-stage-box">
                                        <div class="up-logo-plate" id="ue-preview-farm-box">
                                            ${tempLogoFarm ? `<img id="ue-img-farm" class="up-logo-thumb-img" src="${tempLogoFarm}" alt="Farm">` : '<span class="up-logo-none-text">Sem logotipo</span>'}
                                        </div>
                                    </div>
                                    <div class="up-logo-actions-apple">
                                        <button type="button" class="up-btn-logo-apple" id="ue-btn-upload-farm">Escolher Foto</button>
                                        <input type="file" id="ue-file-farm" accept="image/*" style="display:none;">
                                        <button type="button" class="up-btn-logo-apple" id="ue-btn-default-farm">Padrão</button>
                                        <button type="button" class="up-btn-logo-apple up-btn-logo-del" id="ue-btn-remove-farm">Remover</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Pré-visualização Limpa do Timbrado -->
                        <div class="up-sim-section">
                            <label class="up-field-label" style="margin-bottom:2px;">Pré-visualização do Timbrado Impresso</label>
                            <div class="up-clean-sim-wrapper">
                                <div class="up-clean-sim-header">
                                    <div class="up-sim-logo-slot" id="sim-logo-left">
                                        ${tempLogoPref ? `<img class="up-sim-img" src="${tempLogoPref}" alt="Logo Esq">` : ''}
                                    </div>
                                    <div class="up-sim-text-slot" id="sim-text-center">
                                        <b id="sim-name">${unitObj.name || 'Nome da Unidade de Saúde'}</b>
                                        <span id="sim-sub">${unitObj.sub || 'Secretaria Municipal de Saúde'}</span>
                                        <span id="sim-addr">${(unitObj.addr || 'Avenida Getúlio Vargas, 2751').replace(/\n/g, '<br>')}</span>
                                    </div>
                                    <div class="up-sim-logo-slot" id="sim-logo-right">
                                        ${tempLogoFarm ? `<img class="up-sim-img" src="${tempLogoFarm}" alt="Logo Dir">` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="up-footer-apple">
                        <div>
                            ${!isNew && !unitObj.isDefault ? `
                                <button type="button" class="up-btn-delete-apple" id="ue-btn-delete">Excluir Unidade</button>
                            ` : '<span></span>'}
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button type="button" class="up-btn-cancel-apple" onclick="(window.App||App).openUnitPortal('list')">Cancelar</button>
                            <button type="button" class="up-btn-save-apple" id="ue-btn-save">Salvar Unidade</button>
                        </div>
                    </div>
                </div>
            `;

            // Elementos
            const inputName = overlay.querySelector('#ue-name');
            const inputSub = overlay.querySelector('#ue-sub');
            const inputAddr = overlay.querySelector('#ue-addr');
            const inputCity = overlay.querySelector('#ue-city');
            const inputTel = overlay.querySelector('#ue-tel');

            const simName = overlay.querySelector('#sim-name');
            const simSub = overlay.querySelector('#sim-sub');
            const simAddr = overlay.querySelector('#sim-addr');
            const simLogoLeft = overlay.querySelector('#sim-logo-left');
            const simLogoRight = overlay.querySelector('#sim-logo-right');

            const updateSimulator = () => {
                if (simName) simName.innerText = (inputName.value || 'Nome da Unidade de Saúde').trim();
                if (simSub) simSub.innerText = (inputSub.value || 'Secretaria Municipal de Saúde').trim();
                if (simAddr) simAddr.innerHTML = (inputAddr.value || 'Avenida Getúlio Vargas, 2751').trim().replace(/\n/g, '<br>');
                if (simLogoLeft) simLogoLeft.innerHTML = tempLogoPref ? `<img class="up-sim-img" src="${tempLogoPref}" alt="Logo Esq">` : '';
                if (simLogoRight) simLogoRight.innerHTML = tempLogoFarm ? `<img class="up-sim-img" src="${tempLogoFarm}" alt="Logo Dir">` : '';
            };

            [inputName, inputSub, inputAddr, inputCity, inputTel].forEach(inp => {
                if (inp) inp.oninput = updateSimulator;
            });

            // Upload Pref
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
                            if (previewPrefBox) previewPrefBox.innerHTML = `<img id="ue-img-pref" class="up-logo-thumb-img" src="${tempLogoPref}" alt="Logo Pref">`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultPref) {
                btnDefaultPref.onclick = () => {
                    tempLogoPref = (unitObj && unitObj.id === 'unit_hosp_olindina') ? 'unibrasil_saude.jpeg' : 'prefeitura.png';
                    if (previewPrefBox) previewPrefBox.innerHTML = `<img id="ue-img-pref" class="up-logo-thumb-img" src="${tempLogoPref}" alt="Logo Pref">`;
                    updateSimulator();
                };
            }

            if (btnRemovePref) {
                btnRemovePref.onclick = () => {
                    tempLogoPref = null;
                    if (previewPrefBox) previewPrefBox.innerHTML = '<span class="up-logo-none-text">Sem logotipo</span>';
                    updateSimulator();
                };
            }

            // Upload Farm
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
                            if (previewFarmBox) previewFarmBox.innerHTML = `<img id="ue-img-farm" class="up-logo-thumb-img" src="${tempLogoFarm}" alt="Logo Farm">`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultFarm) {
                btnDefaultFarm.onclick = () => {
                    tempLogoFarm = (unitObj && unitObj.id === 'unit_hosp_olindina') ? 'prefeitura_olindina.jpeg' : 'farmacia.png';
                    if (previewFarmBox) previewFarmBox.innerHTML = `<img id="ue-img-farm" class="up-logo-thumb-img" src="${tempLogoFarm}" alt="Logo Farm">`;
                    updateSimulator();
                };
            }

            if (btnRemoveFarm) {
                btnRemoveFarm.onclick = () => {
                    tempLogoFarm = null;
                    if (previewFarmBox) previewFarmBox.innerHTML = '<span class="up-logo-none-text">Sem logotipo</span>';
                    updateSimulator();
                };
            }

            // Salvar
            const btnSave = overlay.querySelector('#ue-btn-save');
            if (btnSave) {
                btnSave.onclick = () => {
                    const name = (inputName.value || '').trim();
                    if (!name) {
                        alert('Informe o Nome da Unidade.');
                        inputName.focus();
                        return;
                    }

                    const data = {
                        id: unitObj.id || ('unit_custom_' + Date.now()),
                        name: name,
                        sub: (inputSub.value || '').trim(),
                        badge: 'Geral',
                        addr: (inputAddr.value || '').trim(),
                        city: (inputCity.value || '').trim() || 'Feira de Santana - BA',
                        tel: (inputTel.value || '').trim(),
                        cnes: '',
                        logoPref: tempLogoPref,
                        logoFarm: tempLogoFarm,
                        isDefault: unitObj.isDefault || false
                    };

                    App.UnitsDB.saveUnit(data);
                    App.setGlobalActiveUnit(data.id);
                };
            }

            // Excluir
            const btnDelete = overlay.querySelector('#ue-btn-delete');
            if (btnDelete) {
                btnDelete.onclick = () => {
                    if (confirm(`Excluir a unidade "${unitObj.name}"?`)) {
                        App.UnitsDB.deleteUnit(unitObj.id);
                        App.openUnitPortal('list');
                    }
                };
            }

            setTimeout(() => {
                if (inputName) {
                    inputName.focus();
                    if (isNew) inputName.select();
                }
            }, 60);
        }
    };

    // Exporta explicitamente no window para chamadas inline HTML
    window.App = App;
    window.openUnitPortal = App.openUnitPortal;

    // 6. MENU DE CONTEXTO APPLE NO BOTÃO DIREITO DO CABEÇALHO DA RECEITA
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
            return `
                <button type="button" class="ucm-item ${isActive ? 'is-active' : ''}" onclick="event.stopPropagation(); (window.App||App).setGlobalActiveUnit('${u.id}'); (window.App||App).closeUnitContextMenu();">
                    <span class="ucm-item-icon">
                        ${isActive ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<span style="font-size:8px; opacity:0.4;">●</span>'}
                    </span>
                    <span class="ucm-item-name" title="${u.name}">${u.name}</span>
                </button>
            `;
        }).join('');

        menu.innerHTML = `
            <div class="ucm-header">
                <span class="ucm-title">CABEÇALHO DA RECEITA</span>
                <span class="ucm-active-name">${activeUnit.name || 'Unidade de Atendimento'}</span>
            </div>
            <div class="ucm-divider"></div>
            <div class="ucm-section-label">Trocar de Unidade</div>
            ${unitsHtml}
            <div class="ucm-divider"></div>
            <button type="button" class="ucm-item" onclick="event.stopPropagation(); (window.App||App).closeUnitContextMenu(); (window.App||App).openUnitPortal('list');">
                <span class="ucm-item-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </span>
                <span class="ucm-item-name">Ver Todas / Buscar Unidades...</span>
            </button>
            <button type="button" class="ucm-item" onclick="event.stopPropagation(); (window.App||App).closeUnitContextMenu(); (window.App||App).openUnitPortal('edit', '${activeUnit.id}');">
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
        `;

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
    });

    // 7. INTEGRAÇÃO NO LOGIN
    const originalExecLoginV4 = App.executeLogin;
    App.executeLogin = function(index) {
        if (originalExecLoginV4) originalExecLoginV4.apply(this, [index]);
        const activeUnitId = App.UnitsDB.getActive();
        App.applyActiveUnit(activeUnitId, { silent: true });
        App.injectLiveUnitPill(); // Garante remoção de pílulas antigas
    };

    // 8. INTEGRAÇÃO NO RENDER DO RECEITUÁRIO
    const originalRenderV4 = App.render;
    App.render = function() {
        if (originalRenderV4) originalRenderV4.apply(this, arguments);
        const activeUnit = App.UnitsDB.getActiveUnit();
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
        }
    };

    // 9. INICIALIZAÇÃO CONTÍNUA
    setTimeout(() => {
        App.UnitsDB.get();
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

    // Remove qualquer pílula flutuante que possa ter sobrado
    const oldHud = document.getElementById('live-unit-hud-wrap');
    if (oldHud) oldHud.remove();

    // 2. CSS DO SELETOR INTEGRADO NO LOGIN (MINIMALISTA APPLE / COMPACTO / DISCRETO)
    const styleId = 'integrated-unit-selector-css';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
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
    `;

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

        selector.innerHTML = `
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
                    <span class="ius-unit-name" title="${activeUnit.name}">${activeUnit.name}</span>
                </div>
                <span class="ius-action-link">
                    <span>Alternar</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
            </div>
        `;
    };

    // 4. ATRELA A INJEÇÃO AO RENDER DO CARROSSEL
    const renderProfilesV4100 = App.renderLocalProfilesUI;
    App.renderLocalProfilesUI = function() {
        if (renderProfilesV4100) renderProfilesV4100.apply(this);
        setTimeout(() => {
            App.injectIntegratedUnitSelector();
        }, 50);
    };

    // 5. ATUALIZA A FUNÇÃO DE TROCAR UNIDADE PARA ATUALIZAR O BOTÃO NATIVO
    if (typeof App.setGlobalActiveUnit === 'function') {
        const originalSetGlobalActiveUnit = App.setGlobalActiveUnit;
        App.setGlobalActiveUnit = function(id) {
            originalSetGlobalActiveUnit.apply(this, [id]);
            App.injectIntegratedUnitSelector();
        };
    }

    App.injectIntegratedUnitSelector();

}, 100);
