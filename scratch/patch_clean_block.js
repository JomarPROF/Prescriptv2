const fs = require('fs');

let code = fs.readFileSync('scratch/clean_block.js', 'utf8');

// 1. RenderCards - Remove white logo capsule and replace with subtle badge tag
const oldCapsule = `                            <div class="up-card-right">
                                <div class="up-logo-capsule" title="Logotipos oficiais do cabeçalho">
                                    \${u.logoPref ? \`<img src="\${u.logoPref}" alt="Pref">\` : '<span class="up-logo-capsule-empty">-</span>'}
                                    <div class="up-logo-capsule-divider"></div>
                                    \${u.logoFarm ? \`<img src="\${u.logoFarm}" alt="Farm">\` : '<span class="up-logo-capsule-empty">-</span>'}
                                </div>
                                <button type="button" class="up-btn-edit-apple" onclick="event.stopPropagation(); (window.App||App).openUnitPortal('edit', '\${u.id}')" title="Editar dados e logotipos">
                                    Editar
                                </button>`;

const newCapsule = `                            <div class="up-card-right">
                                <span class="up-unit-badge-tag">\${u.badge || (u.isDefault ? 'Oficial' : 'Geral')}</span>
                                <button type="button" class="up-btn-edit-apple" onclick="event.stopPropagation(); (window.App||App).openUnitPortal('edit', '\${u.id}')" title="Editar dados e logotipos">
                                    Editar
                                </button>`;

if (code.includes(oldCapsule)) {
    code = code.replace(oldCapsule, newCapsule);
    console.log('1. Replaced old logo capsule in renderCards');
} else {
    console.error('1. Could not find oldCapsule!');
}

// 2. RenderEditor - Refined logo grid & contained simulator
const oldEditorLogos = `                        <!-- Logotipos -->
                        <div class="up-logos-grid">
                            <!-- Esquerdo -->
                            <div class="up-logo-card-apple">
                                <span class="up-logo-card-title">Logotipo Esquerdo (Prefeitura)</span>
                                <div class="up-logo-preview-clean" id="ue-preview-pref-box">
                                    \${tempLogoPref ? \`<img id="ue-img-pref" src="\${tempLogoPref}" alt="Pref">\` : '<span style="font-size:11px;color:#94a3b8;">Sem Logo</span>'}
                                </div>
                                <div class="up-logo-actions-apple">
                                    <button type="button" class="up-btn-logo-apple" id="ue-btn-upload-pref">Escolher Foto</button>
                                    <input type="file" id="ue-file-pref" accept="image/*" style="display:none;">
                                    <button type="button" class="up-btn-logo-apple" id="ue-btn-default-pref">Padrão</button>
                                    <button type="button" class="up-btn-logo-apple" id="ue-btn-remove-pref" style="color:#ef4444;">Remover</button>
                                </div>
                            </div>

                            <!-- Direito -->
                            <div class="up-logo-card-apple">
                                <span class="up-logo-card-title">Logotipo Direito (Farmácia/SUS)</span>
                                <div class="up-logo-preview-clean" id="ue-preview-farm-box">
                                    \${tempLogoFarm ? \`<img id="ue-img-farm" src="\${tempLogoFarm}" alt="Farm">\` : '<span style="font-size:11px;color:#94a3b8;">Sem Logo</span>'}
                                </div>
                                <div class="up-logo-actions-apple">
                                    <button type="button" class="up-btn-logo-apple" id="ue-btn-upload-farm">Escolher Foto</button>
                                    <input type="file" id="ue-file-farm" accept="image/*" style="display:none;">
                                    <button type="button" class="up-btn-logo-apple" id="ue-btn-default-farm">Padrão</button>
                                    <button type="button" class="up-btn-logo-apple" id="ue-btn-remove-farm" style="color:#ef4444;">Remover</button>
                                </div>
                            </div>
                        </div>

                        <!-- Pré-visualização Limpa do Timbrado -->
                        <div class="up-clean-sim-wrapper">
                            <div class="up-clean-sim-header">
                                <div class="up-sim-logo-slot" id="sim-logo-left">
                                    \${tempLogoPref ? \`<img src="\${tempLogoPref}" alt="Logo Esq">\` : ''}
                                </div>
                                <div class="up-sim-text-slot" id="sim-text-center">
                                    <b id="sim-name">\${unitObj.name || 'Nome da Unidade de Saúde'}</b>
                                    <span id="sim-sub">\${unitObj.sub || 'Secretaria Municipal de Saúde'}</span><br>
                                    <span id="sim-addr">\${(unitObj.addr || 'Avenida Getúlio Vargas, 2751').replace(/\\n/g, '<br>')}</span>
                                </div>
                                <div class="up-sim-logo-slot" id="sim-logo-right">
                                    \${tempLogoFarm ? \`<img src="\${tempLogoFarm}" alt="Logo Dir">\` : ''}
                                </div>
                            </div>
                        </div>`;

const newEditorLogos = `                        <!-- Logotipos -->
                        <div class="up-logos-section">
                            <label class="up-field-label" style="margin-bottom:2px;">Logotipos Oficiais do Cabeçalho</label>
                            <div class="up-logos-grid">
                                <!-- Esquerdo -->
                                <div class="up-logo-card-apple">
                                    <span class="up-logo-card-title">Logotipo Esquerdo (Prefeitura)</span>
                                    <div class="up-logo-stage-box">
                                        <div class="up-logo-plate" id="ue-preview-pref-box">
                                            \${tempLogoPref ? \`<img id="ue-img-pref" class="up-logo-thumb-img" src="\${tempLogoPref}" alt="Pref">\` : '<span class="up-logo-none-text">Sem logotipo</span>'}
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
                                            \${tempLogoFarm ? \`<img id="ue-img-farm" class="up-logo-thumb-img" src="\${tempLogoFarm}" alt="Farm">\` : '<span class="up-logo-none-text">Sem logotipo</span>'}
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
                                        \${tempLogoPref ? \`<img class="up-sim-img" src="\${tempLogoPref}" alt="Logo Esq">\` : ''}
                                    </div>
                                    <div class="up-sim-text-slot" id="sim-text-center">
                                        <b id="sim-name">\${unitObj.name || 'Nome da Unidade de Saúde'}</b>
                                        <span id="sim-sub">\${unitObj.sub || 'Secretaria Municipal de Saúde'}</span>
                                        <span id="sim-addr">\${(unitObj.addr || 'Avenida Getúlio Vargas, 2751').replace(/\\n/g, '<br>')}</span>
                                    </div>
                                    <div class="up-sim-logo-slot" id="sim-logo-right">
                                        \${tempLogoFarm ? \`<img class="up-sim-img" src="\${tempLogoFarm}" alt="Logo Dir">\` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>`;

if (code.includes(oldEditorLogos)) {
    code = code.replace(oldEditorLogos, newEditorLogos);
    console.log('2. Replaced old editor logos and simulator');
} else {
    console.error('2. Could not find oldEditorLogos!');
}

// 3. Update simulator JS and preview handlers
const oldHandlers = `            const updateSimulator = () => {
                if (simName) simName.innerText = (inputName.value || 'Nome da Unidade de Saúde').trim();
                if (simSub) simSub.innerText = (inputSub.value || 'Secretaria Municipal de Saúde').trim();
                if (simAddr) simAddr.innerHTML = (inputAddr.value || 'Avenida Getúlio Vargas, 2751').trim().replace(/\\n/g, '<br>');
                if (simLogoLeft) simLogoLeft.innerHTML = tempLogoPref ? \`<img src="\${tempLogoPref}" alt="Logo Esq">\` : '';
                if (simLogoRight) simLogoRight.innerHTML = tempLogoFarm ? \`<img src="\${tempLogoFarm}" alt="Logo Dir">\` : '';
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
                            if (previewPrefBox) previewPrefBox.innerHTML = \`<img id="ue-img-pref" src="\${tempLogoPref}" alt="Logo Pref">\`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultPref) {
                btnDefaultPref.onclick = () => {
                    tempLogoPref = 'prefeitura.png';
                    if (previewPrefBox) previewPrefBox.innerHTML = \`<img id="ue-img-pref" src="\${tempLogoPref}" alt="Logo Pref">\`;
                    updateSimulator();
                };
            }

            if (btnRemovePref) {
                btnRemovePref.onclick = () => {
                    tempLogoPref = null;
                    if (previewPrefBox) previewPrefBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;">Sem Logo</span>';
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
                            if (previewFarmBox) previewFarmBox.innerHTML = \`<img id="ue-img-farm" src="\${tempLogoFarm}" alt="Logo Farm">\`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultFarm) {
                btnDefaultFarm.onclick = () => {
                    tempLogoFarm = 'farmacia.png';
                    if (previewFarmBox) previewFarmBox.innerHTML = \`<img id="ue-img-farm" src="\${tempLogoFarm}" alt="Logo Farm">\`;
                    updateSimulator();
                };
            }

            if (btnRemoveFarm) {
                btnRemoveFarm.onclick = () => {
                    tempLogoFarm = null;
                    if (previewFarmBox) previewFarmBox.innerHTML = '<span style="font-size:11px;color:#94a3b8;">Sem Logo</span>';
                    updateSimulator();
                };
            }`;

const newHandlers = `            const updateSimulator = () => {
                if (simName) simName.innerText = (inputName.value || 'Nome da Unidade de Saúde').trim();
                if (simSub) simSub.innerText = (inputSub.value || 'Secretaria Municipal de Saúde').trim();
                if (simAddr) simAddr.innerHTML = (inputAddr.value || 'Avenida Getúlio Vargas, 2751').trim().replace(/\\n/g, '<br>');
                if (simLogoLeft) simLogoLeft.innerHTML = tempLogoPref ? \`<img class="up-sim-img" src="\${tempLogoPref}" alt="Logo Esq">\` : '';
                if (simLogoRight) simLogoRight.innerHTML = tempLogoFarm ? \`<img class="up-sim-img" src="\${tempLogoFarm}" alt="Logo Dir">\` : '';
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
                            if (previewPrefBox) previewPrefBox.innerHTML = \`<img id="ue-img-pref" class="up-logo-thumb-img" src="\${tempLogoPref}" alt="Logo Pref">\`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultPref) {
                btnDefaultPref.onclick = () => {
                    tempLogoPref = 'prefeitura.png';
                    if (previewPrefBox) previewPrefBox.innerHTML = \`<img id="ue-img-pref" class="up-logo-thumb-img" src="\${tempLogoPref}" alt="Logo Pref">\`;
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
                            if (previewFarmBox) previewFarmBox.innerHTML = \`<img id="ue-img-farm" class="up-logo-thumb-img" src="\${tempLogoFarm}" alt="Logo Farm">\`;
                            updateSimulator();
                        };
                        reader.readAsDataURL(file);
                    }
                };
            }

            if (btnDefaultFarm) {
                btnDefaultFarm.onclick = () => {
                    tempLogoFarm = 'farmacia.png';
                    if (previewFarmBox) previewFarmBox.innerHTML = \`<img id="ue-img-farm" class="up-logo-thumb-img" src="\${tempLogoFarm}" alt="Logo Farm">\`;
                    updateSimulator();
                };
            }

            if (btnRemoveFarm) {
                btnRemoveFarm.onclick = () => {
                    tempLogoFarm = null;
                    if (previewFarmBox) previewFarmBox.innerHTML = '<span class="up-logo-none-text">Sem logotipo</span>';
                    updateSimulator();
                };
            }`;

if (code.includes(oldHandlers)) {
    code = code.replace(oldHandlers, newHandlers);
    console.log('3. Replaced handlers in renderEditor');
} else {
    console.error('3. Could not find oldHandlers!');
}

fs.writeFileSync('scratch/clean_block.js', code, 'utf8');
console.log('Finished updating scratch/clean_block.js');
