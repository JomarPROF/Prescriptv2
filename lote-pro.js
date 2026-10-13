/* ==========================================================================
   LOTE PRO — MOTOR INTELIGENTE, FLEXÍVEL & CLÍNICO DE PRESCRIÇÃO EM LOTE
   ==========================================================================
   Recursos:
   1. Autocomplete Inline (IntelliSense) no próprio editor com navegação por teclado.
   2. Parser Ultra-Flexível: aceita 1-0-1, 1/0/1, 1x0x1, 2MG sem espaço, horários,
      expressões "ao dormir", "em jejum", "de 12/12h", etc.
   3. Auto-Correção de Grafia e Marcas Comerciais (com salvaguarda LASA).
   4. Higienizador de Textos de Prontuários (e-SUS, SoulMV, Tasy).
   5. Protocolos & Combos Clínicos Rápidos (presets + salvar personalizados).
   6. Barra de Ferramentas (Colar, Higienizar, Protocolos, Formatar, Limpar).
   7. Live Status Footer com estimativa de páginas em tempo real.
   ========================================================================== */

(function () {
    'use strict';

    // ──────────────────────────────────────────────────────────────────────────
    // 1. DICIONÁRIOS CLÍNICOS, MARCAS E PREVENÇÃO DE ERROS (LASA)
    // ──────────────────────────────────────────────────────────────────────────

    const BRAND_SYNONYMS = {
        // Benzodiazepínicos e Sedativos
        "RIVOTRIL": "CLONAZEPAM",
        "VALIUM": "DIAZEPAM",
        "LEXOTAN": "BROMAZEPAM",
        "FRONTAL": "ALPRAZOLAM",
        "LORAX": "LORAZEPAM",
        "STILNOX": "ZOLPIDEM",
        "NOCTIDEM": "ZOLPIDEM",
        "PATZ": "ZOLPIDEM",
        "ROHYPNOL": "FLUNITRAZEPAM",
        "DORMONID": "MIDAZOLAM",
        "GARDENAL": "FENOBARBITAL",

        // Antipsicóticos
        "HALDOL": "HALOPERIDOL",
        "HALDOL DECANOATO": "HALOPERIDOL DECANOATO",
        "AMPLICTIL": "CLORPROMAZINA",
        "NEOZINE": "LEVOMEPROMAZINA",
        "PIPORTIL": "PIPAMPERONA",
        "CLOPIXOL": "ZUCLOPENTIXOL",
        "CLOPIXOL DECANOATO": "ZUCLOPENTIXOL DECANOATO",
        "RISPERDAL": "RISPERIDONA",
        "ZYPREXA": "OLANZAPINA",
        "SEROQUEL": "QUETIAPINA",
        "LEPONEX": "CLOZAPINA",
        "ABILIFY": "ARIPIPRAZOL",
        "INVEGA": "PALIPERIDONA",
        "GEODON": "ZIPRASIDONA",
        "NEULEPTIL": "PERICIAZINA",
        "LATUDA": "LURASIDONA",

        // Antidepressivos
        "PROZAC": "FLUOXETINA",
        "DAFORIN": "FLUOXETINA",
        "ZOLOFT": "SERTRALINA",
        "ASSERT": "SERTRALINA",
        "LEXAPRO": "ESCITALOPRAM",
        "CIPRAMIL": "CITALOPRAM",
        "CEBRILIN": "PAROXETINA",
        "AROPAX": "PAROXETINA",
        "EFEXOR": "VENLAFAXINA",
        "PRISTIQ": "DESVENLAFAXINA",
        "CYMBALTA": "DULOXETINA",
        "VELIJA": "DULOXETINA",
        "WELLBUTRIN": "BUPROPIONA",
        "ZETRON": "BUPROPIONA",
        "BUP": "BUPROPIONA",
        "DONAREN": "TRAZODONA",
        "REMERON": "MIRTAZAPINA",
        "TRYPTANOL": "AMITRIPTILINA",
        "TOFRANIL": "IMIPRAMINA",
        "ANAFRANIL": "CLOMIPRAMINA",
        "PAMELOR": "NORTRIPTILINA",
        "BRINTELLIX": "VORTIOXETINA",

        // Estabilizadores e Anticonvulsivantes
        "CARBOLITIO": "CARBONATO DE LÍTIO",
        "LITIO": "CARBONATO DE LÍTIO",
        "DEPAKENE": "VALPROATO DE SÓDIO",
        "DEPAKOTE": "DIVALPROATO DE SÓDIO",
        "TEGRETOL": "CARBAMAZEPINA",
        "TRILEPTAL": "OXCARBAZEPINA",
        "LAMICTAL": "LAMOTRIGINA",
        "TOPAMAX": "TOPIRAMATO",
        "KEPPRA": "LEVETIRACETAM",
        "HIDANTAL": "FENITOÍNA",
        "LYRICA": "PREGABALINA",
        "NEURONTIN": "GABAPENTINA",

        // Antiparkinsonianos / Anticolinérgicos
        "AKINETON": "BIPERIDENO",
        "ARTANE": "TRIEXIFENIDIL",

        // Psicoestimulantes
        "RITALINA": "METILFENIDATO",
        "CONCERTA": "METILFENIDATO",
        "VENVANSE": "DIMESILATO DE LISDEXANFETAMINA",
        "ATENTAH": "ATOMOXETINA",

        // Analgésicos e Gerais
        "NOVALGINA": "DIPIRONA SÓDICA",
        "TYLENOL": "PARACETAMOL",
        "VOLTAREN": "DICLOFENACO SÓDICO",
        "CATAFLAM": "DICLOFENACO POTÁSSICO",
        "BUSCOPAN": "ESCOPOLAMINA",
        "PLASIL": "METOCLOPRAMIDA",
        "DRAMIN": "DIMENIDRINATO",
        "VONAU": "ONDANSETRONA",
        "AAS": "ÁCIDO ACETILSALICÍLICO",
        "LASIX": "FUROSEMIDA",
        "ALDACTONE": "ESPIRONOLACTONA"
    };

    const COMMON_TYPOS = {
        "CLONAZEPAN": "CLONAZEPAM",
        "DIAZEPAN": "DIAZEPAM",
        "BROMAZEPAN": "BROMAZEPAM",
        "LORAZEPAN": "LORAZEPAM",
        "NITRAZEPAN": "NITRAZEPAM",
        "FLUNITRAZEPAN": "FLUNITRAZEPAM",
        "RESPERIDONA": "RISPERIDONA",
        "RISPERIDON": "RISPERIDONA",
        "HALOPRIDOL": "HALOPERIDOL",
        "HALOPERIDOL DECANOAT": "HALOPERIDOL DECANOATO",
        "HALDOL DECANOAT": "HALOPERIDOL DECANOATO",
        "CLORPROMAZIN": "CLORPROMAZINA",
        "LEVOMEPROMAZIN": "LEVOMEPROMAZINA",
        "AMITRIPTILIN": "AMITRIPTILINA",
        "AMITRIPTILINE": "AMITRIPTILINA",
        "NORTRIPTILIN": "NORTRIPTILINA",
        "SERTRALIN": "SERTRALINA",
        "FLUOXETIN": "FLUOXETINA",
        "PAROXETIN": "PAROXETINA",
        "CITALOPRAN": "CITALOPRAM",
        "ESCITALOPRAN": "ESCITALOPRAM",
        "QUETIAPIN": "QUETIAPINA",
        "OLANZAPIN": "OLANZAPINA",
        "CLOZAPIN": "CLOZAPINA",
        "BUPROPRIONA": "BUPROPIONA",
        "BUPROPION": "BUPROPIONA",
        "CARBAMEZEPINA": "CARBAMAZEPINA",
        "CARBAMAZEPIN": "CARBAMAZEPINA",
        "LAMOTRIGIN": "LAMOTRIGINA",
        "VALPROAT": "VALPROATO DE SÓDIO",
        "BIPERIDEN": "BIPERIDENO",
        "ZOLPIDAN": "ZOLPIDEM",
        "DIPIRON": "DIPIRONA SÓDICA"
    };

    // Pares perigosos (LASA - Look-Alike, Sound-Alike) onde NUNCA se deve fazer fuzzy automático cego
    const LASA_PAIRS = [
        ["CLONAZEPAM", "CLOZAPINA"],
        ["FLUOXETINA", "FLUVOXAMINA"],
        ["HALOPERIDOL", "HALOPERIDOL DECANOATO"],
        ["AMITRIPTILINA", "NORTRIPTILINA"],
        ["CITALOPRAM", "ESCITALOPRAM"],
        ["BUSPIRONA", "BUPROPIONA"],
        ["VALPROATO", "DIVALPROATO"]
    ];

    function isLasaConflict(a, b) {
        const ua = a.toUpperCase();
        const ub = b.toUpperCase();
        for (let pair of LASA_PAIRS) {
            if ((ua.includes(pair[0]) && ub.includes(pair[1])) || (ua.includes(pair[1]) && ub.includes(pair[0]))) {
                return true;
            }
        }
        return false;
    }

    function removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Distância de Levenshtein para aproximação fonética segura
    function levenshtein(a, b) {
        const al = a.length, bl = b.length;
        if (al === 0) return bl;
        if (bl === 0) return al;
        const matrix = [];
        for (let i = 0; i <= al; i++) matrix[i] = [i];
        for (let j = 0; j <= bl; j++) matrix[0][j] = j;
        for (let i = 1; i <= al; i++) {
            for (let j = 1; j <= bl; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[al][bl];
    }

    // Lista unificada com todos os medicamentos cadastrados
    function getAllCatalogMeds() {
        const medsSet = new Set();
        const lib = (typeof MED_LIBRARY !== 'undefined' ? MED_LIBRARY : (window.MED_LIBRARY || null));
        if (lib) {
            for (let cat in lib) {
                if (Array.isArray(lib[cat])) {
                    lib[cat].forEach(m => medsSet.add(m.trim().toUpperCase()));
                }
            }
        }
        const alto = (typeof ALTO_CUSTO_MEDS !== 'undefined' ? ALTO_CUSTO_MEDS : (window.ALTO_CUSTO_MEDS || null));
        if (alto && Array.isArray(alto)) {
            alto.forEach(m => medsSet.add(m.trim().toUpperCase()));
        }
        if (window.App && window.App.config && Array.isArray(window.App.config.customMeds)) {
            window.App.config.customMeds.forEach(m => medsSet.add(m.trim().toUpperCase()));
        }
        return Array.from(medsSet);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. PARSER FLEXÍVEL & RESOLVEDOR INTELIGENTE
    // ──────────────────────────────────────────────────────────────────────────

    // Normaliza espaços em unidades coladas (ex: 2MG -> 2 MG, 500MG -> 500 MG)
    function normalizeUnitsSpacing(str) {
        return str
            .replace(/(\d+(?:[.,]\d+)?)(MG|MCG|G|UI|U|%|ML|GTS|GT|CP|COMP|AMP)/gi, '$1 $2')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Tenta encontrar a medicação oficial ou sugerir correção segura
    function resolveMedicationName(rawName) {
        let clean = removeAccents(rawName).trim().toUpperCase();
        clean = normalizeUnitsSpacing(clean);

        // 1. Verificação de sinônimo comercial exato (RIVOTRIL -> CLONAZEPAM)
        const allowTradenames = localStorage.getItem('cerebrum_lote_tradename_convert') !== 'false';
        if (allowTradenames) {
            for (let brand in BRAND_SYNONYMS) {
                if (clean === brand || clean.startsWith(brand + ' ')) {
                    const replacement = BRAND_SYNONYMS[brand];
                    const rest = clean.slice(brand.length).trim();
                    const resolved = (replacement + (rest ? ' ' + rest : '')).trim();
                    return {
                        original: rawName,
                        resolved: resolved,
                        matchedBy: 'BRAND',
                        note: `Marca: ${brand} → ${replacement}`
                    };
                }
            }
        }

        // 2. Verificação de erros ortográficos comuns mapeados
        for (let typo in COMMON_TYPOS) {
            if (clean === typo || clean.startsWith(typo + ' ')) {
                const correction = COMMON_TYPOS[typo];
                const rest = clean.slice(typo.length).trim();
                const resolved = (correction + (rest ? ' ' + rest : '')).trim();
                return {
                    original: rawName,
                    resolved: resolved,
                    matchedBy: 'TYPO',
                    note: `Correção: ${typo} → ${correction}`
                };
            }
        }

        // 3. Procura no catálogo completo
        const catalog = getAllCatalogMeds();
        const cleanNoConc = clean.replace(/[\d.,]+\s*(?:MG|MCG|G|UI|U|%|(?:MG|G|MCG|UI|U)\/(?:[\d.,]+)?ML)\s*$/i, '').trim();

        // Correspondência direta por prefixo no catálogo
        const exactPrefix = catalog.find(m => removeAccents(m) === clean || removeAccents(m).startsWith(clean + ' '));
        if (exactPrefix) {
            return { original: rawName, resolved: exactPrefix, matchedBy: 'EXACT' };
        }

        // 4. Auto-resolução se o médico digitou o número mas esqueceu a unidade (ex: RISPERIDONA 2 -> RISPERIDONA 2 MG)
        const numberEndingMatch = clean.match(/^(.*?)[\s\-]+(\d+(?:[.,]\d+)?)$/);
        if (numberEndingMatch) {
            const baseDrug = numberEndingMatch[1].trim();
            const doseNum = numberEndingMatch[2].replace('.', ',');
            const candidate = catalog.find(m => {
                const normM = removeAccents(m);
                return normM.startsWith(baseDrug) && normM.includes(doseNum + ' MG');
            });
            if (candidate) {
                return {
                    original: rawName,
                    resolved: candidate,
                    matchedBy: 'AUTO_DOSE',
                    note: `Unidade detectada: ${candidate}`
                };
            }
        }

        // 5. Fuzzy Match para pequenos erros de digitação (Levenshtein seguro, sem violar LASA)
        let bestCandidate = null;
        let minDistance = 999;

        for (let item of catalog) {
            const itemBase = removeAccents(item).replace(/[\d.,]+\s*(?:MG|MCG|G|UI|U|%|(?:MG|G|MCG|UI|U)\/(?:[\d.,]+)?ML)\s*$/i, '').trim();
            if (isLasaConflict(cleanNoConc, itemBase)) continue; // Blindagem LASA

            const dist = levenshtein(cleanNoConc, itemBase);
            if (dist <= 2 && dist < minDistance) {
                // Se a distância for pequena (1 ou 2 caracteres trocados), considera match de alta confiança
                minDistance = dist;
                bestCandidate = item;
            }
        }

        if (bestCandidate && minDistance <= 2) {
            return {
                original: rawName,
                resolved: bestCandidate,
                matchedBy: 'FUZZY',
                note: `Sugerido: ${bestCandidate}`
            };
        }

        // Retorna o próprio texto higienizado caso não haja catálogo equivalente
        return { original: rawName, resolved: clean, matchedBy: 'NONE' };
    }

    // Normaliza posologias flexíveis (1-0-1, 1/0/1, 1x0x1, "ao dormir", etc.)
    function normalizePosologyString(rawPoso) {
        let p = rawPoso.trim().toUpperCase();

        // 1. Expressões de horário comuns em clínica
        if (/^(?:1\s*CP\s*)?(?:À\s*NOITE|A\s*NOITE|AO\s*DORMIR|AO\s*DEITAR|NOTURNO)$/i.test(p)) {
            return "00 00 01";
        }
        if (/^(?:1\s*CP\s*)?(?:PELA\s*MANH[AÃ]|DE\s*MANH[AÃ]|EM\s*JEJUM|MATUTINO)$/i.test(p)) {
            return "01 00 00";
        }
        if (/^(?:1\s*CP\s*)?(?:AP[OÓ]S\s*O\s*ALMO[CÇ]O|[AÀ]\s*TARDE|VESPERTINO)$/i.test(p)) {
            return "00 01 00";
        }
        if (/^(?:MANH[AÃ]\s*E\s*NOITE|MANHA\s*E\s*NOITE|12\/12\s*H(?:ORAS)?)$/i.test(p)) {
            return "01 00 01";
        }

        // 2. Tríades numéricas: 1-0-1, 1 - 0 - 1, 1/0/1, 1x0x1, 1.0.1
        const triadMatch = p.match(/^((?:\d+\s*E\s*)?\d+\/\d+|\d+(?:[.,]\d+)?)\s*[\-\/xX\.]\s*((?:\d+\s*E\s*)?\d+\/\d+|\d+(?:[.,]\d+)?)\s*[\-\/xX\.]\s*((?:\d+\s*E\s*)?\d+\/\d+|\d+(?:[.,]\d+)?)$/);
        if (triadMatch) {
            const pad = (v) => {
                if (v.includes('/') || v.includes('E') || v.includes('.')) return v;
                const n = parseInt(v);
                return (!isNaN(n) && n < 10) ? `0${n}` : v;
            };
            return `${pad(triadMatch[1])} ${pad(triadMatch[2])} ${pad(triadMatch[3])}`;
        }

        // 3. Duplas comuns: 1-0 (manhã/noite ou manhã/tarde) -> 1-0-0 ou 1-0-1 dependendo do contexto
        const duoMatch = p.match(/^(\d+(?:[.,]\d+)?)\s*[\-\/xX\.]\s*(\d+(?:[.,]\d+)?)$/);
        if (duoMatch) {
            // Se for ex: 1-1, assume manhã e noite
            return `0${parseInt(duoMatch[1])} 00 0${parseInt(duoMatch[2])}`;
        }

        // 4. Intervalo horário: DE 12/12H, DE 8 EM 8 HORAS, A CADA 12 HORAS
        const intMatch = p.match(/^(?:TOMAR\s*)?(\d+(?:[.,]\d+)?)\s*(CP|COMP|GTS|GOTAS|ML|AMP)?\s*(?:A CADA|DE)\s*(\d+)(?:\/(\d+)|\s*EM\s*(\d+))?\s*H(?:ORAS)?$/i);
        if (intMatch) {
            const dose = intMatch[1];
            const unit = intMatch[2] || "CP";
            const hrs = intMatch[3];
            return `${dose} ${unit} A CADA ${hrs}/${hrs}H`;
        }

        return p;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2.1 NORMALIZADOR GLOBAL DE LINHA (MEDICAÇÃO + CONCENTRAÇÃO + POSOLOGIA + OBS)
    // ──────────────────────────────────────────────────────────────────────────

    function normalizeFullLine(rawLine) {
        if (!rawLine || !rawLine.trim()) return { original: rawLine, normalized: '', valid: true, type: 'EMPTY' };

        let line = rawLine.replace(/^[\s\-•*]+/, '').replace(/[.;]+$/, '').trim();
        if (!line) return { original: rawLine, normalized: '', valid: true, type: 'EMPTY' };

        // 1. Grupos com " OU "
        if (line.includes(' OU ')) {
            const parts = line.split(/\s+OU\s+/);
            const normParts = parts.map(p => normalizeFullLine(p).normalized);
            return { original: rawLine, normalized: normParts.join(' OU '), valid: true };
        }

        // 2. Linhas com forma de uso personalizada (ex: DIPIRONA 500 MG : TOMAR 1 CP SE DOR)
        const customMatch = line.match(/^(.*?)(?:\s*[:\-—]\s*|\s+USO:\s*)(.+)$/i);
        if (customMatch && !customMatch[2].match(/^[\d\s\-\/xX\.]+$/)) {
            let m = normalizeUnitsSpacing(customMatch[1].trim());
            let resMed = resolveMedicationName(m);
            let finalMed = (resMed.matchedBy !== 'NONE') ? resMed.resolved : m;
            let u = customMatch[2].trim();
            return {
                original: rawLine,
                normalized: `${finalMed} : ${u}`,
                valid: true,
                type: 'CUSTOM',
                correctionNote: resMed.note
            };
        }

        let text = normalizeUnitsSpacing(line).toUpperCase();

        // 3. Extrai observação médica no final se houver (ex: SE DOR, SOS, SE AGITAÇÃO)
        let obs = '';
        const obsRegex = /\s+(SE\s+DOR|SE\s+FEBRE|SE\s+AGITA[CÇ][AÃ]O|SE\s+INSONIA|SE\s+INS[OÔ]NIA|SE\s+NECESS[AÁ]RIO|SOS|SE\s+N[AÁ]USEA)\s*$/i;
        const obsMatch = text.match(obsRegex);
        if (obsMatch) {
            obs = ' ' + obsMatch[1];
            text = text.replace(obsRegex, '').trim();
        }

        // 4. Divide concentração e posologia
        const concSplitRegex = /^(.*?\b\d+(?:[.,]\d+)?\s*(?:(?:MG|G|MCG|UI|U)\/(?:[\d.,]+)?ML|MG|MCG|G|UI|U|%))\s+(.+)$/i;
        const matchConc = text.match(concSplitRegex);

        let medPart = text;
        let posoPart = '';

        if (matchConc) {
            medPart = matchConc[1].trim();
            posoPart = matchConc[2].trim();
        } else {
            const trailingPosoRegex = /\s+(\d+[\-\/xX\.]\d+[\-\/xX\.]\d+|\d+[\-\/xX\.]\d+|AO\s+DORMIR|AO\s+DEITAR|[AÀ]\s+NOITE|A\s+NOITE|PELA\s+MANH[AÃ]|DE\s+MANH[AÃ]|EM\s+JEJUM|NO\s+ALMO[CÇ]O|12\/12\s*H(?:ORAS)?|8\/8\s*H(?:ORAS)?|6\/6\s*H(?:ORAS)?)\s*$/i;
            const trailMatch = text.match(trailingPosoRegex);
            if (trailMatch) {
                medPart = text.slice(0, trailMatch.index).trim();
                posoPart = trailMatch[1].trim();
            }
        }

        // Resolve nome e concentração da medicação (marcas comerciais, sinônimos e erros comuns com blindagem LASA)
        const resolvedMed = resolveMedicationName(medPart);
        let finalMedName = (resolvedMed.matchedBy !== 'NONE') ? resolvedMed.resolved : medPart;

        // Normaliza a posologia (1-0-1, 1/0/1, ao dormir, 8/8h, etc.)
        let finalPoso = posoPart ? normalizePosologyString(posoPart) : '';

        let normalizedResult = (finalMedName + (finalPoso ? ' ' + finalPoso : '') + obs).trim();

        return {
            original: rawLine,
            normalized: normalizedResult,
            resolvedMed: resolvedMed,
            correctionNote: resolvedMed.note,
            valid: true
        };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. INTELLISENSE INLINE NO MODO LOTE
    // ──────────────────────────────────────────────────────────────────────────

    function isIntellisenseEnabled() {
        return localStorage.getItem('cerebrum_lote_intellisense') !== 'false';
    }

    let intellisensePopup = null;
    let activeSuggestionIndex = 0;
    let currentSuggestions = [];
    let intellisenseActive = false;
    let suppressIntellisense = false;

    // ──────────────────────────────────────────────────────────────────────────
    // 3.1 ASSISTENTE DE POSOLOGIA INTERATIVO VIA TECLADO (0X-0Y-0Z)
    // ──────────────────────────────────────────────────────────────────────────

    let posologyActive = false;
    let posologySlot = 0; // 0 = Manhã, 1 = Tarde, 2 = Noite
    let posologyValues = [0, 0, 0];
    let posologyMedName = '';
    let posologyLineStart = 0;
    let slotDigitBuffer = '';
    let posologyIndicator = null;

    function getRecommendedPosologyPreset() {
        // Sem prescrição automática: o médico define a posologia manualmente via Tab e Setas
        return [0, 0, 0];
    }

    function createPosologyIndicator() {
        if (document.getElementById('lote-posology-indicator')) return;
        posologyIndicator = document.createElement('div');
        posologyIndicator.id = 'lote-posology-indicator';
        posologyIndicator.className = 'lote-posology-indicator hidden';
        document.body.appendChild(posologyIndicator);
    }

    function hidePosologyIndicator() {
        if (posologyIndicator) {
            posologyIndicator.classList.add('hidden');
            posologyIndicator.innerHTML = '';
        }
    }

    function positionPosologyIndicator() {
        if (!posologyActive) return;
        if (!posologyIndicator) createPosologyIndicator();
        if (!posologyIndicator) return;
        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        const rect = textarea.getBoundingClientRect();
        const textBefore = textarea.value.slice(0, posologyLineStart);
        const lineIndex = textBefore.split('\n').length - 1;
        const computed = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computed.lineHeight) || 24;
        const paddingTop = parseFloat(computed.paddingTop) || 18;

        const currentLineTop = rect.top + paddingTop + (lineIndex * lineHeight) - textarea.scrollTop;
        const currentLineBottom = currentLineTop + lineHeight;

        if (currentLineTop < rect.top - 10 || currentLineBottom > rect.bottom + 15) {
            hidePosologyIndicator();
            return;
        }

        let topPos = currentLineBottom + 6;
        if (topPos + 36 > window.innerHeight) {
            topPos = Math.max(10, currentLineTop - 34);
        }

        const leftPos = Math.max(16, Math.min(rect.left + 18, window.innerWidth - 380));
        posologyIndicator.style.top = `${topPos}px`;
        posologyIndicator.style.left = `${leftPos}px`;
        posologyIndicator.classList.remove('hidden');
    }

    function updatePosologyIndicator() {
        if (!posologyIndicator || !posologyActive) return;
        const pad = (n) => String(n).padStart(2, '0');
        const v0 = pad(posologyValues[0]);
        const v1 = pad(posologyValues[1]);
        const v2 = pad(posologyValues[2]);

        posologyIndicator.innerHTML = `
            <span class="lote-pos-slot ${posologySlot === 0 ? 'is-active' : ''}">☀️ Manhã: <b>${v0}</b></span>
            <span class="lote-pos-sep">•</span>
            <span class="lote-pos-slot ${posologySlot === 1 ? 'is-active' : ''}">🍽️ Tarde: <b>${v1}</b></span>
            <span class="lote-pos-sep">•</span>
            <span class="lote-pos-slot ${posologySlot === 2 ? 'is-active' : ''}">🌙 Noite: <b>${v2}</b></span>
            <span class="lote-pos-hint">| ↑↓ Ajustar • Tab Próximo • ↵ Concluir</span>
        `;

        positionPosologyIndicator();
    }

    function startPosologyMode(medName, initialValues, initialSlot, lineStartPos) {
        if (!isIntellisenseEnabled()) return;
        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        posologyActive = true;
        posologyMedName = medName.trim();
        posologyValues = Array.isArray(initialValues) ? [...initialValues] : [0, 0, 0];
        posologySlot = typeof initialSlot === 'number' ? initialSlot : 0;
        slotDigitBuffer = '';
        suppressIntellisense = true;
        hideIntellisense();

        const text = textarea.value;
        const cursor = typeof lineStartPos === 'number' ? lineStartPos : textarea.selectionStart;
        const lastNewline = text.lastIndexOf('\n', cursor - 1);
        posologyLineStart = lastNewline === -1 ? 0 : lastNewline + 1;

        let lineEnd = text.indexOf('\n', posologyLineStart);
        if (lineEnd === -1) lineEnd = text.length;

        const pad = (n) => String(n).padStart(2, '0');
        const posoStr = `${pad(posologyValues[0])}-${pad(posologyValues[1])}-${pad(posologyValues[2])}`;
        const newLine = `${posologyMedName} ${posoStr}`;

        textarea.value = text.slice(0, posologyLineStart) + newLine + text.slice(lineEnd);

        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        if (window.App && typeof window.App.updateLoteHighlights === 'function') {
            window.App.updateLoteHighlights();
        }

        selectPosologySlotInTextarea(posologySlot);
        updatePosologyIndicator();
    }

    function selectPosologySlotInTextarea(slot) {
        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        posologySlot = Math.max(0, Math.min(2, slot));
        const medLen = posologyMedName.length;
        // Estrutura: "${posologyMedName} 0X-0Y-0Z"
        // Offset até início da posologia: medLen + 1 (o espaço)
        // Slot 0 (Manhã): medLen + 1 a medLen + 3
        // Slot 1 (Tarde): medLen + 4 a medLen + 6
        // Slot 2 (Noite): medLen + 7 a medLen + 9
        const slotOffsets = [
            [medLen + 1, medLen + 3],
            [medLen + 4, medLen + 6],
            [medLen + 7, medLen + 9]
        ];

        const [startOff, endOff] = slotOffsets[posologySlot] || slotOffsets[0];
        const absStart = posologyLineStart + startOff;
        const absEnd = posologyLineStart + endOff;

        textarea.focus();
        textarea.setSelectionRange(absStart, absEnd);
    }

    function setPosologySlot(slot) {
        posologySlot = Math.max(0, Math.min(2, slot));
        slotDigitBuffer = '';
        selectPosologySlotInTextarea(posologySlot);
        updatePosologyIndicator();
    }

    function handlePosologyDigitInput(digitChar) {
        slotDigitBuffer += digitChar;
        if (slotDigitBuffer.length > 2) slotDigitBuffer = slotDigitBuffer.slice(-2);
        const val = parseInt(slotDigitBuffer, 10) || 0;
        posologyValues[posologySlot] = Math.max(0, Math.min(99, val));
        updatePosologyTextAndSelection();
    }

    function adjustPosologySlotValue(delta) {
        slotDigitBuffer = '';
        const currentVal = posologyValues[posologySlot] || 0;
        const nextVal = Math.max(0, Math.min(99, currentVal + delta));
        posologyValues[posologySlot] = nextVal;
        updatePosologyTextAndSelection();
    }

    function resetPosologySlotValue() {
        slotDigitBuffer = '';
        posologyValues[posologySlot] = 0;
        updatePosologyTextAndSelection();
    }

    function handlePosologyBackspace() {
        // 1. Se o usuário digitou algum número no slot atual (buffer) ou o valor é > 0:
        if (slotDigitBuffer !== '' || posologyValues[posologySlot] !== 0) {
            slotDigitBuffer = '';
            posologyValues[posologySlot] = 0;
            updatePosologyTextAndSelection();
            return;
        }

        // 2. Antes de digitar o valor (está 00): volta para a ação anterior!
        if (posologySlot === 2) {
            // Volta para a Tarde (Slot 1)
            setPosologySlot(1);
        } else if (posologySlot === 1) {
            // Volta para a Manhã (Slot 0)
            setPosologySlot(0);
        } else if (posologySlot === 0) {
            // Volta para a medicação: remove " 00-00-00" e coloca o cursor no fim do nome do remédio
            revertPosologyToMedication();
        }
    }

    function revertPosologyToMedication() {
        posologyActive = false;
        slotDigitBuffer = '';
        hidePosologyIndicator();

        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        const text = textarea.value;
        let lineEnd = text.indexOf('\n', posologyLineStart);
        if (lineEnd === -1) lineEnd = text.length;

        // Remove a parte da posologia mantendo o nome e concentração da medicação
        const newLine = posologyMedName;
        textarea.value = text.slice(0, posologyLineStart) + newLine + text.slice(lineEnd);

        // Posiciona o cursor imediatamente ao final da medicação
        const newCursorPos = posologyLineStart + newLine.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
            suppressIntellisense = false;
        }, 150);
    }

    function updatePosologyTextAndSelection() {
        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        const text = textarea.value;
        let lineEnd = text.indexOf('\n', posologyLineStart);
        if (lineEnd === -1) lineEnd = text.length;

        const pad = (n) => String(n).padStart(2, '0');
        const posoStr = `${pad(posologyValues[0])}-${pad(posologyValues[1])}-${pad(posologyValues[2])}`;
        const newLine = `${posologyMedName} ${posoStr}`;

        textarea.value = text.slice(0, posologyLineStart) + newLine + text.slice(lineEnd);

        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        if (window.App && typeof window.App.updateLoteHighlights === 'function') {
            window.App.updateLoteHighlights();
        }

        selectPosologySlotInTextarea(posologySlot);
        updatePosologyIndicator();
    }

    function finishPosologyMode(moveToNextLine) {
        posologyActive = false;
        slotDigitBuffer = '';
        hidePosologyIndicator();

        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        const text = textarea.value;
        let lineEnd = text.indexOf('\n', posologyLineStart);
        if (lineEnd === -1) lineEnd = text.length;

        if (moveToNextLine) {
            if (lineEnd >= text.length) {
                textarea.value = text + '\n';
                const nextPos = textarea.value.length;
                textarea.setSelectionRange(nextPos, nextPos);
            } else {
                const nextPos = lineEnd + 1;
                textarea.setSelectionRange(nextPos, nextPos);
            }
        } else {
            textarea.setSelectionRange(lineEnd, lineEnd);
        }

        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        if (window.App && typeof window.App.updateLoteHighlights === 'function') {
            window.App.updateLoteHighlights();
        }

        setTimeout(() => {
            suppressIntellisense = false;
        }, 150);
    }

    function cancelPosologyMode() {
        posologyActive = false;
        slotDigitBuffer = '';
        hidePosologyIndicator();

        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        const text = textarea.value;
        let lineEnd = text.indexOf('\n', posologyLineStart);
        if (lineEnd === -1) lineEnd = text.length;

        textarea.setSelectionRange(lineEnd, lineEnd);
        textarea.focus();

        setTimeout(() => {
            suppressIntellisense = false;
        }, 150);
    }

    function checkPosologyCursorPlacement() {
        if (!posologyActive) return;
        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        const cursor = textarea.selectionStart;
        const medLen = posologyMedName.length;
        const slotOffsets = [
            [medLen + 1, medLen + 3],
            [medLen + 4, medLen + 6],
            [medLen + 7, medLen + 9]
        ];

        const text = textarea.value;
        const lastNewline = text.lastIndexOf('\n', cursor - 1);
        const curLineStart = lastNewline === -1 ? 0 : lastNewline + 1;

        if (curLineStart !== posologyLineStart) {
            finishPosologyMode(false);
            return;
        }

        const rel = cursor - posologyLineStart;
        if (rel >= slotOffsets[0][0] && rel <= slotOffsets[0][1]) {
            setPosologySlot(0);
        } else if (rel >= slotOffsets[1][0] && rel <= slotOffsets[1][1]) {
            setPosologySlot(1);
        } else if (rel >= slotOffsets[2][0] && rel <= slotOffsets[2][1]) {
            setPosologySlot(2);
        } else {
            finishPosologyMode(false);
        }
    }

    function createIntellisensePopup() {
        if (document.getElementById('lote-intellisense-popup')) return;
        intellisensePopup = document.createElement('div');
        intellisensePopup.id = 'lote-intellisense-popup';
        intellisensePopup.className = 'lote-intellisense-popup hidden';
        document.body.appendChild(intellisensePopup);

        createPosologyIndicator();

        // Fecha ao clicar fora do popup e do textarea
        document.addEventListener('pointerdown', (e) => {
            if (!intellisensePopup || intellisensePopup.classList.contains('hidden')) return;
            const textarea = document.getElementById('fast-input');
            if (!intellisensePopup.contains(e.target) && e.target !== textarea) {
                hideIntellisense();
            }
        });

        // Fecha ao rolar a página para evitar desalinhamento
        window.addEventListener('scroll', () => {
            if (intellisenseActive) hideIntellisense();
            if (posologyActive) positionPosologyIndicator();
        }, true);
    }

    function hideIntellisense() {
        if (intellisensePopup) {
            intellisensePopup.classList.add('hidden');
            intellisensePopup.innerHTML = '';
        }
        intellisenseActive = false;
        currentSuggestions = [];
        activeSuggestionIndex = 0;
    }

    function showIntellisense(textarea, suggestions, tokenStart, tokenText) {
        if (!isIntellisenseEnabled() || !suggestions || suggestions.length === 0 || suppressIntellisense || posologyActive) {
            hideIntellisense();
            return;
        }

        if (!intellisensePopup) createIntellisensePopup();
        if (!intellisensePopup) return;

        currentSuggestions = suggestions;
        activeSuggestionIndex = 0;
        intellisenseActive = true;

        renderIntellisenseSuggestions();

        const rect = textarea.getBoundingClientRect();
        const textBefore = textarea.value.slice(0, textarea.selectionStart);
        const lineIndex = textBefore.split('\n').length - 1;
        const computed = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computed.lineHeight) || 24;
        const paddingTop = parseFloat(computed.paddingTop) || 16;

        // Posição Y da linha atual na viewport
        const currentLineTop = rect.top + paddingTop + (lineIndex * lineHeight) - textarea.scrollTop;
        const currentLineBottom = currentLineTop + lineHeight;

        // Se a linha atual estiver fora do campo visível do textarea (scroll interno), esconde
        if (currentLineTop < rect.top - 5 || currentLineBottom > rect.bottom + 10) {
            hideIntellisense();
            return;
        }

        const popupHeight = Math.min(suggestions.length * 36 + 32, 230);
        const spaceBelow = window.innerHeight - currentLineBottom;
        const spaceAbove = currentLineTop;

        let topPosition;
        if (spaceBelow >= popupHeight + 15 || spaceBelow >= spaceAbove) {
            topPosition = currentLineBottom + 6;
        } else {
            topPosition = Math.max(10, currentLineTop - popupHeight - 6);
        }

        const popupWidth = Math.min(rect.width - 36, 400);
        const leftPosition = Math.max(12, Math.min(rect.left + 18, window.innerWidth - popupWidth - 12));

        intellisensePopup.style.left = `${leftPosition}px`;
        intellisensePopup.style.top = `${topPosition}px`;
        intellisensePopup.style.width = `${popupWidth}px`;
        intellisensePopup.classList.remove('hidden');
    }

    function renderIntellisenseSuggestions() {
        if (!intellisensePopup) return;
        let html = '<div class="lote-intellisense-header"><span>💊 Sugestões Rápidas (Tab / Enter)</span><span class="lote-intellisense-kbr">↑↓ Navegar • Esc Fechar</span></div>';
        html += '<div class="lote-intellisense-list">';

        currentSuggestions.forEach((item, idx) => {
            const isSel = idx === activeSuggestionIndex ? 'is-selected' : '';
            let icon = '💊';
            if (item.includes('ML') || item.includes('GTS') || item.includes('GOTAS')) icon = '💧';
            if (item.includes('AMP') || item.includes('INJ') || item.includes('DECANOATO')) icon = '💉';

            html += `
                <div class="lote-intellisense-item ${isSel}" data-idx="${idx}">
                    <span class="lote-item-icon">${icon}</span>
                    <span class="lote-item-name">${item}</span>
                </div>
            `;
        });

        html += '</div>';
        intellisensePopup.innerHTML = html;

        // Clique com o mouse
        const items = intellisensePopup.querySelectorAll('.lote-intellisense-item');
        items.forEach(el => {
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const idx = parseInt(el.dataset.idx);
                applySuggestion(idx);
            });
        });
    }

    function applySuggestion(index) {
        const textarea = document.getElementById('fast-input');
        if (!textarea || !currentSuggestions[index]) return;

        const chosenMed = currentSuggestions[index];
        const text = textarea.value;
        const cursor = textarea.selectionStart;

        // Acha o início da linha atual
        const lastNewline = text.lastIndexOf('\n', cursor - 1);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        
        // Acha o fim da linha atual
        let lineEnd = text.indexOf('\n', cursor);
        if (lineEnd === -1) lineEnd = text.length;

        const currentLine = text.slice(lineStart, lineEnd);
        
        // Se a linha já tem posologia digitada após a medicação
        const posoMatch = currentLine.match(/[\d.,]+\s*(?:MG|MCG|G|UI|U|%|(?:MG|G|MCG|UI|U)\/(?:[\d.,]+)?ML)\s+(.+)$/i);
        const existingPoso = posoMatch ? posoMatch[1].trim() : '';

        // Bloqueia reabertura imediata pelo evento de input que será emitido
        suppressIntellisense = true;
        hideIntellisense();

        if (existingPoso) {
            const newLine = `${chosenMed} ${existingPoso}`;
            const newText = text.slice(0, lineStart) + newLine + text.slice(lineEnd);
            textarea.value = newText;
            const newCursorPos = lineStart + chosenMed.length + 1;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            if (window.App && typeof window.App.updateLoteHighlights === 'function') {
                window.App.updateLoteHighlights();
            }

            setTimeout(() => {
                hideIntellisense();
                suppressIntellisense = false;
            }, 120);
        } else {
            // 🚀 Inicia Assistente de Posologia interativo com Tab e Setas (limpo em 00-00-00)
            if (isIntellisenseEnabled()) {
                startPosologyMode(chosenMed, [0, 0, 0], 0, lineStart);
            }
        }
    }

    function handleIntellisenseInput(textarea) {
        if (!isIntellisenseEnabled() || suppressIntellisense || posologyActive) {
            hideIntellisense();
            return;
        }

        const text = textarea.value;
        const cursor = textarea.selectionStart;

        // Identifica a linha onde o cursor está
        const lastNewline = text.lastIndexOf('\n', cursor - 1);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const currentLine = text.slice(lineStart, cursor).trim();

        // 1. Linha muito curta ou vazia -> fecha imediatamente
        if (currentLine.length < 2) {
            hideIntellisense();
            return;
        }

        // 2. Se já tem concentração médica completa na linha (ex: 2 MG, 500MG, 10MG/ML, 5%)
        //    significa que o médico já concluiu o nome do remédio -> fecha imediatamente!
        const hasConcentrationComplete = /[\d.,]+\s*(?:(?:MG|G|MCG|UI|U)\/(?:[\d.,]+)?ML|MG|MCG|G|UI|U|%)\b/i.test(currentLine);
        if (hasConcentrationComplete) {
            hideIntellisense();
            return;
        }

        // 3. Se já tem posologia ou horário na linha -> fecha imediatamente
        const hasPosologyAlready = /(?:\d+[\-\/xX\.]\d+|\bAO\s+DORMIR\b|\bAO\s+DEITAR\b|\b[AÀ]\s+NOITE\b|\bDE\s+MANH[AÃ]\b|\bPELA\s+MANH[AÃ]\b|\bEM\s+JEJUM\b|\b\d+\/\d+\s*H\b|\bSE\s+DOR\b)/i.test(currentLine);
        if (hasPosologyAlready) {
            hideIntellisense();
            return;
        }

        // 4. Busca correspondências no catálogo
        const token = removeAccents(currentLine).toUpperCase();
        const catalog = getAllCatalogMeds();

        // Se o texto digitado já é idêntico a um medicamento exato do catálogo -> fecha imediatamente
        if (catalog.some(m => removeAccents(m) === token)) {
            hideIntellisense();
            return;
        }

        const matches = [];

        // Prioridade 1: Inicia com o texto
        for (let m of catalog) {
            const norm = removeAccents(m);
            if (norm.startsWith(token)) {
                matches.push(m);
                if (matches.length >= 6) break;
            }
        }

        // Prioridade 2: Contém o texto
        if (matches.length < 6) {
            for (let m of catalog) {
                const norm = removeAccents(m);
                if (!norm.startsWith(token) && norm.includes(token)) {
                    matches.push(m);
                    if (matches.length >= 6) break;
                }
            }
        }

        // Prioridade 3: Sinônimos comerciais
        const allowTradenames = localStorage.getItem('cerebrum_lote_tradename_convert') !== 'false';
        if (matches.length < 6 && allowTradenames) {
            for (let brand in BRAND_SYNONYMS) {
                if (brand.startsWith(token) || removeAccents(brand).includes(token)) {
                    const generic = BRAND_SYNONYMS[brand];
                    const found = catalog.filter(m => m.startsWith(generic));
                    found.forEach(f => {
                        if (!matches.includes(f) && matches.length < 6) matches.push(f);
                    });
                }
            }
        }

        if (matches.length > 0) {
            showIntellisense(textarea, matches, lineStart, currentLine);
        } else {
            hideIntellisense();
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. HIGIENIZADOR DE PRONTUÁRIOS (PEP SANITIZER)
    // ──────────────────────────────────────────────────────────────────────────

    function sanitizePepPrescription(rawText) {
        if (!rawText || !rawText.trim()) return "";
        const lines = rawText.split(/\r?\n/);
        const cleanedLines = [];

        lines.forEach(line => {
            let l = line.trim();
            if (!l) return;

            // Remove marcadores de item (ex: "1.", "Item 2:", "•", "- ")
            l = l.replace(/^(?:item\s*\d+[\s:.\-]*|\d+[\s:.\-\)]+|[•*\-–—]+\s*)/i, '').trim();

            // Detecta padrões com dosagem e uso
            // Ex: "CLONAZEPAM 2MG COMPRIMIDO - VIA ORAL - TOMAR 1 COMPRIMIDO A NOITE"
            l = l.replace(/\b(?:COMPRIMIDO|COMPRIMIDOS|C[AÁ]PSULA|C[AÁ]PSULAS|FRASCO|FRASCOS|AMPOLA|AMPOLAS)\b/gi, '');
            l = l.replace(/\b(?:VIA\s+ORAL|USO\s+ORAL|USO\s+CONTINUO|USO\s+CONT[IÍ]NUO|USO\s+INTERNO)\b/gi, '');

            // Trata formatos comuns
            l = normalizeUnitsSpacing(l);

            // Mapeia posologias descritivas para formato conciso
            if (/tomar\s*1\s*(?:cp|comprimido)?\s*(?:[àa]\s*noite|ao\s*dormir|ao\s*deitar)/i.test(l)) {
                l = l.replace(/tomar\s*1.*?$/i, '00 00 01');
            } else if (/tomar\s*1\s*(?:cp|comprimido)?\s*(?:pela\s*manh[ãa]|de\s*manh[ãa]|em\s*jejum)/i.test(l)) {
                l = l.replace(/tomar\s*1.*?$/i, '01 00 00');
            } else if (/tomar\s*1\s*(?:cp|comprimido)?\s*(?:12\/12|de\s*12\s*em\s*12)/i.test(l)) {
                l = l.replace(/tomar\s*1.*?$/i, '01 00 01');
            } else if (/(\d+)\s*gotas?\s*(?:[àa]\s*noite|ao\s*dormir)/i.test(l)) {
                const gts = l.match(/(\d+)\s*gotas?/i)[1];
                l = l.replace(/(\d+)\s*gotas?.*?$/i, `00 00 ${gts} GTS`);
            }

            // Limpa hífens residuais
            l = l.replace(/[\-–—\s]+$/, '').replace(/\s+/g, ' ').trim().toUpperCase();

            if (l) cleanedLines.push(l);
        });

        return cleanedLines.join('\n');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 5. PROTOCOLOS E COMBOS CLÍNICOS RÁPIDOS
    // ──────────────────────────────────────────────────────────────────────────

    const CLINICAL_PRESETS = [
        {
            title: "🟢 Ansiedade & Pânico",
            badge: "Ambulatório",
            items: [
                "SERTRALINA 50 MG 01 00 00",
                "CLONAZEPAM 2 MG 00 00 1/2"
            ]
        },
        {
            title: "🔵 Esquizofrenia (Manutenção)",
            badge: "CAPS III",
            items: [
                "RISPERIDONA 3 MG 01 00 01",
                "BIPERIDENO 2 MG 01 00 00"
            ]
        },
        {
            title: "🟣 Transtorno Bipolar (TAB)",
            badge: "Estabilização",
            items: [
                "CARBONATO DE LÍTIO 300 MG 01 01 01",
                "QUETIAPINA 100 MG 00 00 01"
            ]
        },
        {
            title: "🟡 Depressão Maior & Insônia",
            badge: "Ambulatório",
            items: [
                "ESCITALOPRAM 10 MG 01 00 00",
                "TRAZODONA 50 MG 00 00 01"
            ]
        },
        {
            title: "💉 Antipsicótico Depot Mensal",
            badge: "Injetável",
            items: [
                "HALOPERIDOL DECANOATO 50 MG/ML 1 AMP A CADA 30 DIAS",
                "BIPERIDENO 2 MG 01 00 00"
            ]
        },
        {
            title: "🔴 Agitação / Emergência SOS",
            badge: "SOS",
            items: [
                "HALOPERIDOL 5 MG/ML 1 AMP IM NO MOMENTO",
                "PROMETAZINA 50 MG/2ML 1 AMP IM NO MOMENTO"
            ]
        },
        {
            title: "🟤 Desmame de Benzodiazepínico",
            badge: "Desmame",
            items: [
                "DIAZEPAM 10 MG 00 00 01",
                "CLONAZEPAM 0,5 MG 00 00 01"
            ]
        }
    ];

    function getCustomProtocols() {
        try {
            return JSON.parse(localStorage.getItem('cerebrum_custom_protocols')) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCustomProtocol(title, text) {
        if (!title || !text) return;
        const current = getCustomProtocols();
        const items = text.split('\n').map(l => l.trim()).filter(Boolean);
        current.unshift({ title, badge: "Personalizado", items });
        localStorage.setItem('cerebrum_custom_protocols', JSON.stringify(current));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6. BARRA DE FERRAMENTAS & LIVE STATUS FOOTER
    // ──────────────────────────────────────────────────────────────────────────

    function injectLoteToolbarAndFooter() {
        const fastUi = document.getElementById('fast-ui');
        if (!fastUi) return;

        // Limpeza de toolbar, ribbon ou footers antigos se existirem
        const existingToolbar = document.getElementById('lote-dock-toolbar');
        if (existingToolbar) existingToolbar.remove();
        const existingRibbon = document.getElementById('lote-syntax-ribbon');
        if (existingRibbon) existingRibbon.remove();
        const existingFooter = document.getElementById('lote-live-footer');
        if (existingFooter) existingFooter.remove();

        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        // Garante que o wrapper #lote-editor-wrapper e #fast-input-highlights existam de forma consistente
        let wrapper = textarea.closest('#lote-editor-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.id = 'lote-editor-wrapper';
            
            let highlights = document.getElementById('fast-input-highlights');
            if (!highlights) {
                highlights = document.createElement('div');
                highlights.id = 'fast-input-highlights';
            }

            textarea.parentNode.insertBefore(wrapper, textarea);
            wrapper.appendChild(highlights);
            wrapper.appendChild(textarea);

            textarea.addEventListener('scroll', () => {
                highlights.scrollTop = textarea.scrollTop;
                highlights.scrollLeft = textarea.scrollLeft;
            });
        }

        // Placeholder minimalista e elegante estilo Apple
        textarea.placeholder = "Digite ou cole as medicações (uma por linha)\nEx: Clonazepam 2mg 01-00-01";

        // 1. Barra de ferramentas Minimalista Apple (estilo macOS Notes / Pages)
        const toolbar = document.createElement('div');
        toolbar.id = 'lote-dock-toolbar';
        toolbar.className = 'lote-apple-toolbar';
        toolbar.innerHTML = `
            <div class="lote-apple-tb-left">
                <button type="button" class="lote-apple-btn" id="btn-lote-paste" title="Colar da área de transferência (Ctrl+V)">
                    <svg viewBox="0 0 24 24" class="lote-apple-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    <span>Colar</span>
                </button>
                <button type="button" class="lote-apple-btn" id="btn-lote-clean-pep" title="Higienizar texto de prontuários eletrônicos (e-SUS, SoulMV, Tasy)">
                    <svg viewBox="0 0 24 24" class="lote-apple-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m12 3-1.9 4.2a2 2 0 0 1-1 1L5 10l4.1 1.8a2 2 0 0 1 1 1L12 17l1.9-4.2a2 2 0 0 1 1-1L19 10l-4.1-1.8a2 2 0 0 1-1-1L12 3z"></path>
                    </svg>
                    <span>Higienizar</span>
                </button>
                <button type="button" class="lote-apple-btn" id="btn-lote-protocols" title="Protocolos clínicos rápidos">
                    <svg viewBox="0 0 24 24" class="lote-apple-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span>Protocolos</span>
                </button>
                <button type="button" class="lote-apple-btn" id="btn-lote-format" title="Auto-alinhar e formatar texto">
                    <svg viewBox="0 0 24 24" class="lote-apple-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="21" y1="6" x2="3" y2="6"></line>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                        <line x1="19" y1="18" x2="3" y2="18"></line>
                    </svg>
                    <span>Formatar</span>
                </button>
            </div>
            <div class="lote-apple-tb-right">
                <button type="button" class="lote-apple-btn lote-apple-btn-icon lote-apple-btn-danger" id="btn-lote-clear" title="Limpar editor">
                    <svg viewBox="0 0 24 24" class="lote-apple-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        // 2. Rodapé Minimalista Apple (Metadados + Botão Manual Clínico em Pílula de Vidro)
        const footer = document.createElement('div');
        footer.id = 'lote-live-footer';
        footer.className = 'lote-apple-footer';
        footer.innerHTML = `
            <div class="lote-apple-footer-meta">
                <span id="lote-badge-count" class="lote-apple-meta-item">0 medicações</span>
                <span class="lote-apple-meta-sep">•</span>
                <span id="lote-badge-sheets" class="lote-apple-meta-item">Folha 1 (0/5)</span>
                <span class="lote-apple-meta-sep">•</span>
                <span id="lote-badge-status" class="lote-apple-status-pill">
                    <span class="lote-apple-dot"></span>
                    <span class="lote-apple-status-text">Em espera</span>
                </span>
            </div>
            <div class="lote-apple-footer-actions">
                <button type="button" class="lote-apple-guide-pill" id="btn-lote-guide-footer" title="Abrir manual de sintaxe e exemplos do Modo Lote">
                    <svg viewBox="0 0 24 24" class="lote-guide-pill-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>Manual Clínico</span>
                </button>
            </div>
        `;

        // Inserção no DOM: Toolbar antes do editor, Footer após o editor
        if (wrapper && wrapper.parentNode === fastUi) {
            fastUi.insertBefore(toolbar, wrapper);
            if (wrapper.nextSibling) {
                fastUi.insertBefore(footer, wrapper.nextSibling);
            } else {
                fastUi.appendChild(footer);
            }
        } else {
            fastUi.prepend(toolbar);
            fastUi.appendChild(footer);
        }

        setupToolbarEvents();
    }

    function setupToolbarEvents() {
        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        // Botão Colar
        const btnPaste = document.getElementById('btn-lote-paste');
        if (btnPaste) {
            btnPaste.addEventListener('click', async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        textarea.value = text;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        if (window.App && window.App.showNotification) {
                            window.App.showNotification("📋 Conteúdo colado no Modo Lote!", "info");
                        }
                    }
                } catch (e) {
                    textarea.focus();
                }
            });
        }

        // Botão Higienizar PEP
        const btnClean = document.getElementById('btn-lote-clean-pep');
        if (btnClean) {
            btnClean.addEventListener('click', () => {
                const raw = textarea.value;
                if (!raw.trim()) {
                    if (window.App && window.App.showNotification) {
                        window.App.showNotification("Cole primeiro o texto do prontuário para higienizar.", "warning");
                    }
                    return;
                }
                const cleaned = sanitizePepPrescription(raw);
                textarea.value = cleaned;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                if (window.App && window.App.showNotification) {
                    window.App.showNotification("✨ Prescrição higienizada e padronizada!", "success");
                }
            });
        }

        // Botão Protocolos Clínicos
        const btnProtocols = document.getElementById('btn-lote-protocols');
        if (btnProtocols) {
            btnProtocols.addEventListener('click', (e) => {
                e.stopPropagation();
                openProtocolsModal();
            });
        }

        // Botão Alinhar / Formatar
        const btnFormat = document.getElementById('btn-lote-format');
        if (btnFormat) {
            btnFormat.addEventListener('click', () => {
                const text = textarea.value;
                if (!text.trim()) return;
                const lines = text.split('\n');
                const formatted = lines.map(line => {
                    let l = line.trim();
                    if (!l) return "";
                    // Resolve possíveis sinônimos de marcas e normaliza posologia
                    const res = resolveMedicationName(l);
                    return res.resolved || l;
                }).filter(Boolean);
                textarea.value = formatted.join('\n');
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }

        // Botão Instruções / Guia de Prescrição (Toolbar e Footer)
        const btnGuide = document.getElementById('btn-lote-guide');
        if (btnGuide) {
            btnGuide.addEventListener('click', (e) => {
                e.stopPropagation();
                openGuideModal();
            });
        }
        const btnGuideFooter = document.getElementById('btn-lote-guide-footer');
        if (btnGuideFooter) {
            btnGuideFooter.addEventListener('click', (e) => {
                e.stopPropagation();
                openGuideModal();
            });
        }

        // Botão Limpar
        const btnClear = document.getElementById('btn-lote-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                textarea.value = '';
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                hideIntellisense();
            });
        }
    }

    // Modal de Protocolos Clínicos
    function openProtocolsModal() {
        let modal = document.getElementById('lote-protocols-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'lote-protocols-modal';
            modal.className = 'lote-protocols-modal';
            document.body.appendChild(modal);
        }

        const custom = getCustomProtocols();
        const all = [...custom, ...CLINICAL_PRESETS];

        let html = `
            <div class="lote-modal-backdrop" onclick="document.getElementById('lote-protocols-modal').classList.remove('is-open')"></div>
            <div class="lote-modal-content">
                <div class="lote-modal-header">
                    <div>
                        <h3 style="margin:0; font-size:1.05rem; color:#f8fafc; font-weight:600; letter-spacing:-0.1px;">Protocolos Clínicos</h3>
                        <span style="font-size:0.75rem; color:#8e8e93;">Modelos e combinações pré-configuradas</span>
                    </div>
                    <button type="button" class="lote-modal-close" onclick="document.getElementById('lote-protocols-modal').classList.remove('is-open')">×</button>
                </div>
                <div class="lote-protocols-grid">
        `;

        all.forEach((proto, idx) => {
            html += `
                <div class="lote-proto-card" data-idx="${idx}">
                    <div class="lote-proto-top">
                        <span class="lote-proto-title">${proto.title}</span>
                        <span class="lote-proto-badge">${proto.badge}</span>
                    </div>
                    <div class="lote-proto-items">
                        ${proto.items.map(it => `<div>• ${it}</div>`).join('')}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                <div class="lote-modal-footer">
                    <button type="button" class="lote-btn-save-current" id="btn-save-custom-proto">
                        Salvar prescrição atual como protocolo
                    </button>
                </div>
            </div>
        `;

        modal.innerHTML = html;
        modal.classList.add('is-open');

        // Adiciona evento aos cards
        const cards = modal.querySelectorAll('.lote-proto-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.idx);
                const selected = all[idx];
                if (selected) {
                    const textarea = document.getElementById('fast-input');
                    if (textarea) {
                        const current = textarea.value.trim();
                        const toAppend = selected.items.join('\n');
                        textarea.value = current ? `${current}\n${toAppend}` : toAppend;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        modal.classList.remove('is-open');
                        if (window.App && window.App.showNotification) {
                            window.App.showNotification(`⚡ Protocolo "${selected.title}" aplicado!`, "success");
                        }
                    }
                }
            });
        });

        // Salvar custom
        const btnSaveCurrent = modal.querySelector('#btn-save-custom-proto');
        if (btnSaveCurrent) {
            btnSaveCurrent.addEventListener('click', () => {
                const textarea = document.getElementById('fast-input');
                const text = textarea ? textarea.value.trim() : '';
                if (!text) {
                    alert("Digite primeiro as medicações no editor para salvar como protocolo.");
                    return;
                }
                const title = prompt("Digite o nome deste protocolo (ex: Minha Rotina Bipolar):");
                if (title) {
                    saveCustomProtocol(title, text);
                    openProtocolsModal(); // Recarrega
                }
            });
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 6.2 MODAL DE INSTRUÇÕES E GUIA CLÍNICO DO MODO LOTE
    // ──────────────────────────────────────────────────────────────────────────
    function openGuideModal(initialTab = 'geral') {
        let modal = document.getElementById('lote-guide-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'lote-guide-modal';
            modal.className = 'lote-guide-modal';
            document.body.appendChild(modal);
        }

        const tabsData = [
            { id: 'geral', label: 'Como Funciona' },
            { id: 'comprimidos', label: 'Comprimidos' },
            { id: 'gotas', label: 'Gotas & Líquidos' },
            { id: 'injetaveis', label: 'Injetáveis' },
            { id: 'livre', label: 'Uso Livre' }
        ];

        modal.innerHTML = `
            <div class="lote-modal-backdrop" onclick="document.getElementById('lote-guide-modal').classList.remove('is-open')"></div>
            <div class="lote-guide-content">
                <div class="lote-guide-header">
                    <div class="lote-guide-header-title">
                        <div>
                            <h2 class="lote-guide-title">Manual de Prescrição</h2>
                            <p class="lote-guide-subtitle">Sintaxe clínica e reconhecimento inteligente do Modo Lote</p>
                        </div>
                    </div>
                    <button type="button" class="lote-guide-close" onclick="document.getElementById('lote-guide-modal').classList.remove('is-open')" title="Fechar (Esc)">&times;</button>
                </div>

                <div class="lote-guide-nav">
                    ${tabsData.map(t => `
                        <button type="button" class="lote-guide-nav-btn ${t.id === initialTab ? 'is-active' : ''}" data-tab="${t.id}">
                            <span>${t.label}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="lote-guide-body">
                    <!-- ABA 1: COMO FUNCIONA / GERAL -->
                    <div class="lote-guide-pane ${initialTab === 'geral' ? 'is-active' : ''}" id="pane-geral">
                        <div class="lote-guide-section-intro">
                            <h3>Como funciona a prescrição em lote</h3>
                            <p>O <b>Modo Lote</b> permite ao médico prescrever <b>múltiplas medicações ao mesmo tempo</b>, digitando ou colando o texto de forma contínua. O sistema reconhece automaticamente o nome do fármaco, a concentração, a forma farmacêutica e os horários de tomada.</p>
                        </div>

                        <div class="lote-guide-rules-grid">
                            <div class="lote-rule-card">
                                <div class="lote-rule-icon">1</div>
                                <div class="lote-rule-text">
                                    <b>Uma medicação por linha</b>
                                    <span>Pressione <code>Enter</code> para passar para a próxima medicação. Prescreva 3, 5 ou mais medicamentos em segundos.</span>
                                </div>
                            </div>
                            <div class="lote-rule-card">
                                <div class="lote-rule-icon">2️⃣</div>
                                <div class="lote-rule-text">
                                    <b>Sempre informe a concentração</b>
                                    <span>Ex: <code>500MG</code>, <code>20MG</code>, <code>2.5MG/ML</code>, <code>1G</code>. Sem a concentração, o sistema alerta em vermelho para proteger a segurança do paciente e evitar recusas na farmácia.</span>
                                </div>
                            </div>
                            <div class="lote-rule-card">
                                <div class="lote-rule-icon">3️⃣</div>
                                <div class="lote-rule-text">
                                    <b>Auto-Correção e Sinônimos</b>
                                    <span>Digite nomes comerciais (ex: <i>Rivotril, Haldol, Lexapro</i>) que o sistema converte automaticamente para o genérico oficial e corrige erros de digitação.</span>
                                </div>
                            </div>
                        </div>

                        <div class="lote-guide-lens-banner">
                            <h4>🔍 Significado das Cores da Lente em Tempo Real:</h4>
                            <div class="lote-lens-tags">
                                <span class="lote-tag tag-pill">💊 Azul: Comprimidos e Cápsulas válidos</span>
                                <span class="lote-tag tag-liquid">💧 Verde: Gotas, Xaropes e Soluções válidas</span>
                                <span class="lote-tag tag-inject">💉 Roxo: Injetáveis e Depot válidos</span>
                                <span class="lote-tag tag-error">🔴 Vermelho: Erro de sintaxe ou falta de concentração</span>
                            </div>
                        </div>

                        <div class="lote-guide-demo-box">
                            <div class="lote-demo-header">
                                <div>
                                    <span style="font-weight:700; color:#f8fafc; font-size:13px;">⚡ Quer testar agora mesmo?</span>
                                    <p style="margin:2px 0 0 0; color:#94a3b8; font-size:11px;">Insira um exemplo completo de 4 medicamentos com 1 clique:</p>
                                </div>
                                <button type="button" class="lote-btn-insert-demo" data-code="LOSARTANA POTÁSSICA 50MG 1 0 1&#10;HIDROCLOROTIAZIDA 25MG 1 0 0&#10;METFORMINA 850MG 1 0 1&#10;DIPIRONA 500MG 1 CP A CADA 6/6H SE DOR">
                                    Inserir Receita Completa de Teste
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ABA 2: COMPRIMIDOS -->
                    <div class="lote-guide-pane ${initialTab === 'comprimidos' ? 'is-active' : ''}" id="pane-comprimidos">
                        <div class="lote-guide-section-intro">
                            <h3>💊 Prescrevendo Comprimidos e Cápsulas</h3>
                            <p>Existem duas formas fáceis: pelas <b>3 doses diárias</b> (Manhã, Tarde, Noite) ou por <b>intervalos em horas</b> (a cada 8/8h, etc.).</p>
                        </div>

                        <div class="lote-example-cards">
                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Padrão 1</span>
                                    <span class="lote-ex-desc">3 Tomadas Diárias (Manhã - Tarde - Noite)</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>SERTRALINA 50MG 1 0 0</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Tomar 01 comprimido por via oral pela manhã."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="SERTRALINA 50MG 1 0 0">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Padrão 1</span>
                                    <span class="lote-ex-desc">Dose Noturna ou Duas Vezes ao Dia (Manhã e Noite)</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>RISPERIDONA 1MG 0 0 1&#10;CARBONATO DE LÍTIO 300MG 1 0 1</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "01 cp à noite" e "01 cp pela manhã e 01 cp à noite".
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="RISPERIDONA 1MG 0 0 1&#10;CARBONATO DE LÍTIO 300MG 1 0 1">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Frações</span>
                                    <span class="lote-ex-desc">Meio Comprimido ou Quarto de Comprimido</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>CLONAZEPAM 2MG 1/2 0 1</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Tomar 1/2 comprimido pela manhã e 01 comprimido à noite." (Aceita também <code>0.5 0 1</code> ou <code>1/4</code>).
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="CLONAZEPAM 2MG 1/2 0 1">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Padrão 2</span>
                                    <span class="lote-ex-desc">Intervalos em Horas (A cada X/X h) + Duração</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>AMOXICILINA 500MG 1 CP DE 8/8H POR 7 DIAS&#10;DIPIRONA 500MG 1 CP A CADA 6/6H SE DOR</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Tomar 01 comprimido a cada 8 horas durante 7 dias" e "a cada 6 horas se dor".
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="AMOXICILINA 500MG 1 CP DE 8/8H POR 7 DIAS&#10;DIPIRONA 500MG 1 CP A CADA 6/6H SE DOR">⚡ Inserir no Editor</button>
                            </div>
                        </div>
                    </div>

                    <!-- ABA 3: GOTAS & LÍQUIDOS -->
                    <div class="lote-guide-pane ${initialTab === 'gotas' ? 'is-active' : ''}" id="pane-gotas">
                        <div class="lote-guide-section-intro">
                            <h3>💧 Prescrevendo Gotas, Xaropes e Soluções Orais</h3>
                            <p>O sistema reconhece termos como <code>GTS</code>, <code>GOTAS</code>, <code>ML</code>, <code>XAROPE</code> e concentrações em <code>MG/ML</code> ou <code>%</code>.</p>
                        </div>

                        <div class="lote-example-cards">
                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Gotas</span>
                                    <span class="lote-ex-desc">Gotas por Horário ou Dose Noturna</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>CLONAZEPAM 2.5MG/ML 5 GTS À NOITE</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Tomar 05 gotas por via oral à noite."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="CLONAZEPAM 2.5MG/ML 5 GTS À NOITE">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Gotas SOS</span>
                                    <span class="lote-ex-desc">Gotas em Intervalo com Condicional</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>DIPIRONA 500MG/ML 30 GTS ATÉ 6/6H SE DOR</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Tomar 30 gotas por via oral até de 6 em 6 horas se houver dor."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="DIPIRONA 500MG/ML 30 GTS ATÉ 6/6H SE DOR">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Xaropes / ML</span>
                                    <span class="lote-ex-desc">Mililitros com Horário e Duração</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>AMOXICILINA 250MG/5ML 5 ML DE 8/8 HORAS POR 10 DIAS&#10;PREDNISOLONA 3MG/ML 10 ML PELA MANHÃ POR 5 DIAS</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Tomar 5 ml por via oral a cada 8 horas por 10 dias."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="AMOXICILINA 250MG/5ML 5 ML DE 8/8 HORAS POR 10 DIAS&#10;PREDNISOLONA 3MG/ML 10 ML PELA MANHÃ POR 5 DIAS">⚡ Inserir no Editor</button>
                            </div>
                        </div>
                    </div>

                    <!-- ABA 4: INJETÁVEIS & DEPOT -->
                    <div class="lote-guide-pane ${initialTab === 'injetaveis' ? 'is-active' : ''}" id="pane-injetaveis">
                        <div class="lote-guide-section-intro">
                            <h3>💉 Prescrevendo Injetáveis e Medicações Depot</h3>
                            <p>Reconhecimento cirúrgico para ampolas, intervalos regulares em dias e vias (IM, EV/IV, SC).</p>
                        </div>

                        <div class="lote-example-cards">
                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Depot</span>
                                    <span class="lote-ex-desc">Intervalo Regular em Dias (A cada X dias)</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>HALDOL DECANOATO 50MG 1 AMPOLA A CADA 30 DIAS&#10;CLOPIXOL DECANOATO 200MG 1 AMPOLA A CADA 15 DIAS</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Aplicar 01 ampola por via intramuscular profunda a cada 30 dias."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="HALDOL DECANOATO 50MG 1 AMPOLA A CADA 30 DIAS">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Urgência / Momento</span>
                                    <span class="lote-ex-desc">Dose Imediata ou Dose Única</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>DIPIRONA 1G 1 AMPOLA IM NO MOMENTO&#10;BENZETACIL 1200000 UI 1 FRASCO IM DOSE ÚNICA</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Aplicar 01 ampola por via intramuscular imediatamente no momento."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="DIPIRONA 1G 1 AMPOLA IM NO MOMENTO">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Insulinas / SC</span>
                                    <span class="lote-ex-desc">Unidades Internacionais (UI) e Via Subcutânea</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>INSULINA NPH 100 UI/ML 20 UI PELA MANHÃ SC</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> "Aplicar 20 UI por via subcutânea pela manhã."
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="INSULINA NPH 100 UI/ML 20 UI PELA MANHÃ SC">⚡ Inserir no Editor</button>
                            </div>
                        </div>
                    </div>

                    <!-- ABA 5: USO LIVRE & SOS -->
                    <div class="lote-guide-pane ${initialTab === 'livre' ? 'is-active' : ''}" id="pane-livre">
                        <div class="lote-guide-section-intro">
                            <h3>✍️ Posologia Livre, Inalações e Casos Especiais</h3>
                            <p>Precisa de liberdade total? Use o separador de dois pontos <code>:</code> ou a palavra <code>OU</code> para escrever orientações personalizadas.</p>
                        </div>

                        <div class="lote-example-cards">
                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Dois Pontos (:)</span>
                                    <span class="lote-ex-desc">Escreva qualquer texto posológico livre</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>OMEPRAZOL 20MG : TOMAR 1 CÁPSULA EM JEJUM 30 MIN ANTES DO CAFÉ</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> O texto após os dois pontos é impresso exatamente como você escreveu na receita.
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="OMEPRAZOL 20MG : TOMAR 1 CÁPSULA EM JEJUM 30 MIN ANTES DO CAFÉ">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Inalatórios / Tópicos</span>
                                    <span class="lote-ex-desc">Sprays, Pomadas e Inalações</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>AEROLIN SPRAY : INALAR 2 JATOS SE CRISE DE FALTA DE AR&#10;DESONIDA POMADA : APLICAR NAS LESÕES 2X AO DIA</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> Orientações perfeitamente formatadas para o paciente.
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="AEROLIN SPRAY : INALAR 2 JATOS SE CRISE DE FALTA DE AR">⚡ Inserir no Editor</button>
                            </div>

                            <div class="lote-card-example">
                                <div class="lote-ex-header">
                                    <span class="lote-ex-badge">Alternativas "OU"</span>
                                    <span class="lote-ex-desc">Duas Opções de Medicação para o Paciente</span>
                                </div>
                                <div class="lote-code-block">
                                    <code>DIPIRONA 500MG 1 CP 6/6H SE DOR OU PARACETAMOL 750MG 1 CP 8/8H</code>
                                </div>
                                <div class="lote-ex-meaning">
                                    <b>Tradução na receita:</b> Imprime ambas as opções com destaque para o paciente optar pela disponível.
                                </div>
                                <button type="button" class="lote-btn-insert-ex" data-code="DIPIRONA 500MG 1 CP 6/6H SE DOR OU PARACETAMOL 750MG 1 CP 8/8H">⚡ Inserir no Editor</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lote-guide-footer">
                    <span class="lote-guide-footer-tip">💡 <b>Dica:</b> Você pode clicar em qualquer botão "⚡ Inserir no Editor" para testar no seu paciente.</span>
                    <button type="button" class="lote-btn-close-guide" onclick="document.getElementById('lote-guide-modal').classList.remove('is-open')">
                        Entendi, voltar ao Editor
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('is-open');

        // Navegação das Abas
        const navBtns = modal.querySelectorAll('.lote-guide-nav-btn');
        const panes = modal.querySelectorAll('.lote-guide-pane');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                navBtns.forEach(b => b.classList.remove('is-active'));
                panes.forEach(p => p.classList.remove('is-active'));
                btn.classList.add('is-active');
                const targetPane = modal.querySelector(`#pane-${tabId}`);
                if (targetPane) targetPane.classList.add('is-active');
            });
        });

        // Inserção dos Exemplos com 1 Clique
        const insertBtns = modal.querySelectorAll('.lote-btn-insert-ex, .lote-btn-insert-demo');
        insertBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const code = btn.getAttribute('data-code');
                if (code) {
                    const textarea = document.getElementById('fast-input');
                    if (textarea) {
                        const current = textarea.value.trim();
                        textarea.value = current ? `${current}\n${code}` : code;
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        modal.classList.remove('is-open');
                        if (window.App && window.App.showNotification) {
                            window.App.showNotification("✨ Exemplo inserido com sucesso no Modo Lote!", "success");
                        }
                    }
                }
            });
        });
    }

    // Atualiza o rodapé de metadados e o botão primário (Minimalista Apple)
    function updateLiveStatusFooter(totalLines, validCount, errorCount) {
        const badgeCount = document.getElementById('lote-badge-count');
        const badgeSheets = document.getElementById('lote-badge-sheets');
        const badgeStatus = document.getElementById('lote-badge-status');
        const modeFastEl = document.getElementById('mode-fast');
        const isLote = modeFastEl && modeFastEl.checked;

        let limit = parseInt(localStorage.getItem('cerebrum_meds_limit')) || 5;

        if (badgeCount) {
            badgeCount.innerText = `${validCount} ${validCount === 1 ? 'medicação' : 'medicações'}`;
        }

        if (badgeSheets) {
            const pages = Math.max(1, Math.ceil(validCount / limit));
            if (validCount <= limit) {
                badgeSheets.innerText = `Folha 1 (${validCount}/${limit})`;
                badgeSheets.className = "lote-apple-meta-item";
            } else {
                badgeSheets.innerText = `${pages} Folhas (${validCount} itens)`;
                badgeSheets.className = "lote-apple-meta-item is-multi-page";
            }
        }

        if (badgeStatus) {
            const textSpan = badgeStatus.querySelector('.lote-apple-status-text');
            if (errorCount > 0) {
                if (textSpan) textSpan.innerText = `${errorCount} ${errorCount === 1 ? 'pendência' : 'pendências'}`;
                badgeStatus.className = "lote-apple-status-pill is-error";
            } else if (validCount > 0) {
                if (textSpan) textSpan.innerText = `Pronto`;
                badgeStatus.className = "lote-apple-status-pill is-ok";
            } else {
                if (textSpan) textSpan.innerText = `Em espera`;
                badgeStatus.className = "lote-apple-status-pill";
            }
        }

        // Botão de Ação: Estilo Apple Cupertino (Title Case, Elegante, Sem Neon)
        const addBtn = document.getElementById('add-btn');
        if (addBtn && isLote) {
            addBtn.classList.add('lote-apple-hero-btn');
            addBtn.classList.remove('lote-exec-hero-btn');
            if (validCount > 0) {
                addBtn.innerText = `Adicionar ${validCount} ${validCount === 1 ? 'Medicação' : 'Medicações'} à Receita`;
            } else {
                addBtn.innerText = `Adicionar à Receita`;
            }
        } else if (addBtn && !isLote) {
            addBtn.classList.remove('lote-apple-hero-btn', 'lote-exec-hero-btn');
            addBtn.innerText = `+ INCLUIR MEDICAMENTO`;
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 7. INJEÇÃO DE ESTILOS CSS E ENHANCER DO APP
    // ──────────────────────────────────────────────────────────────────────────

    function injectLoteProStyles() {
        if (document.getElementById('lote-pro-styles')) return;
        const style = document.createElement('style');
        style.id = 'lote-pro-styles';
        style.innerHTML = `
            /* ══════════════════════════════════════════════════════════════════════════════
               APPLE MINIMALIST DESIGN SYSTEM — MODO LOTE (MACOS SEQUOIA / IOS 18)
               ══════════════════════════════════════════════════════════════════════════════ */

            /* Controles Segmentados Estilo Apple Cupertino */
            .pro-segmented {
                display: flex !important;
                background: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 9px !important;
                padding: 3px !important;
                gap: 3px !important;
                margin-bottom: 12px !important;
                box-shadow: none !important;
            }

            .pro-segment-item {
                flex: 1 !important;
                margin: 0 !important;
            }

            .pro-segment-label {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 5px !important;
                padding: 6px 8px !important;
                border-radius: 6px !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 11.5px !important;
                font-weight: 500 !important;
                letter-spacing: -0.1px !important;
                color: #8e8e93 !important;
                background: transparent !important;
                border: none !important;
                transition: all 0.18s ease !important;
                user-select: none !important;
                cursor: pointer !important;
                text-shadow: none !important;
                box-shadow: none !important;
                transform: none !important;
            }

            .pro-segment-item:hover .pro-segment-label {
                color: #f5f5f7 !important;
                background: rgba(255, 255, 255, 0.04) !important;
            }

            .pro-segment-item input:checked + .pro-segment-label {
                background: #0071e3 !important;
                color: #ffffff !important;
                font-weight: 600 !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
                text-shadow: none !important;
                transform: none !important;
            }

            .pro-segment-item input:checked + .pro-segment-label::after {
                display: none !important;
            }

            /* Card de Prescrição com Modo Lote ativo (Sóbrio e sem luzes chamativas) */
            #section-prescription-main.modo-lote-active-card {
                border-color: rgba(255, 255, 255, 0.12) !important;
                box-shadow: none !important;
            }

            /* Em Modo Lote, esconde campos irrelevantes para manter foco e acabamento limpo */
            #section-prescription-main.modo-lote-active-card #pack-wrapper,
            #section-prescription-main.modo-lote-active-card #qty-wrapper,
            #section-prescription-main.modo-lote-active-card #med-obs {
                display: none !important;
            }

            /* Oculta completamente qualquer badge de indicação de lote no cabeçalho */
            .pro-lote-indicator-badge,
            #lote-mode-badge {
                display: none !important;
            }

            /* ── Barra de Ferramentas Minimalista Apple (1 linha limpa, estilo Notes) ── */
            .lote-apple-toolbar {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                background: rgba(255, 255, 255, 0.025) !important;
                border: 1px solid rgba(255, 255, 255, 0.07) !important;
                border-radius: 9px !important;
                padding: 3px 5px !important;
                margin-bottom: 7px !important;
                box-sizing: border-box !important;
                width: 100% !important;
                box-shadow: none !important;
                gap: 4px !important;
                overflow: hidden !important;
            }

            .lote-apple-tb-left {
                display: flex !important;
                align-items: center !important;
                gap: 2px !important;
                flex: 1 !important;
                min-width: 0 !important;
                overflow-x: auto !important;
                scrollbar-width: none !important;
            }
            .lote-apple-tb-left::-webkit-scrollbar { display: none !important; }

            .lote-apple-tb-right {
                display: flex !important;
                align-items: center !important;
                border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
                padding-left: 4px !important;
                margin-left: auto !important;
                flex-shrink: 0 !important;
            }

            .lote-apple-btn {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 4px !important;
                height: 26px !important;
                padding: 0 6px !important;
                border-radius: 6px !important;
                background: transparent !important;
                border: none !important;
                color: #8e8e93 !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                letter-spacing: -0.1px !important;
                cursor: pointer !important;
                transition: all 0.15s ease !important;
                box-sizing: border-box !important;
                white-space: nowrap !important;
                user-select: none !important;
                box-shadow: none !important;
                outline: none !important;
                flex-shrink: 0 !important;
            }

            .lote-apple-btn:hover {
                background: rgba(255, 255, 255, 0.07) !important;
                color: #f5f5f7 !important;
            }

            .lote-apple-btn:active {
                background: rgba(255, 255, 255, 0.12) !important;
                transform: scale(0.97) !important;
            }

            .lote-apple-btn-icon {
                width: 26px !important;
                height: 26px !important;
                padding: 0 !important;
                flex-shrink: 0 !important;
            }

            .lote-apple-btn-danger:hover {
                background: rgba(255, 69, 58, 0.12) !important;
                color: #ff453a !important;
            }

            .lote-apple-icon {
                width: 13px !important;
                height: 13px !important;
                flex-shrink: 0 !important;
                stroke-width: 1.8 !important;
                color: currentColor !important;
            }

            /* ── Canvas do Editor Apple (Texto 100% Colorido e Nítido com Highlighting) ── */
            #lote-editor-wrapper {
                position: relative !important;
                width: 100% !important;
                min-height: 200px !important;
                max-height: 380px !important;
                background: #090e17 !important;
                border: 1px solid #1e293b !important;
                border-radius: 12px !important;
                box-sizing: border-box !important;
                box-shadow: inset 0 5px 15px rgba(0,0,0,0.6) !important;
                transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease !important;
                overflow: hidden !important;
                display: flex !important;
            }

            #lote-editor-wrapper:focus-within {
                background: #0f172a !important;
                border-color: #38bdf8 !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(0,0,0,0.5), 0 0 0 3px rgba(56, 189, 248, 0.15) !important;
            }

            #fast-input, #fast-input-highlights {
                position: absolute !important;
                top: 0 !important; left: 0 !important;
                width: 100% !important; height: 100% !important;
                padding: 16px !important; margin: 0 !important;
                border: none !important; box-sizing: border-box !important;
                font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace !important;
                font-size: 14px !important; font-weight: 600 !important; line-height: 1.8 !important;
                letter-spacing: normal !important; white-space: pre-wrap !important;
                word-wrap: break-word !important; text-align: left !important;
                text-transform: uppercase !important;
                overflow-y: auto !important; overflow-x: hidden !important; border-radius: 12px !important;
            }

            #fast-input-highlights {
                color: transparent !important;
                z-index: 1 !important;
                pointer-events: none !important;
                display: block !important;
            }

            #fast-input {
                color: transparent !important;
                background: transparent !important;
                caret-color: #38bdf8 !important;
                z-index: 2 !important;
                outline: none !important;
                resize: none !important;
                box-shadow: none !important;
            }

            #fast-input:focus, #fast-input:active {
                color: transparent !important;
                background: transparent !important;
                outline: none !important;
                box-shadow: none !important;
            }

            #fast-input::placeholder {
                color: #64748b !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 12px !important;
                line-height: 1.5 !important;
                text-transform: none !important;
            }

            #fast-input::selection {
                background: rgba(56, 189, 248, 0.3) !important;
                color: transparent !important;
            }

            #fast-input-highlights::-webkit-scrollbar { display: none !important; }
            #fast-input::-webkit-scrollbar { width: 6px !important; }
            #fast-input::-webkit-scrollbar-track { background: transparent !important; }
            #fast-input::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3) !important; border-radius: 10px !important; }
            #fast-input::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.6) !important; }

            /* CORES MÁGICAS DAS MEDICAÇÕES */
            .lote-valid-pill { color: #38bdf8 !important; text-shadow: 0 0 8px rgba(56,189,248,0.3) !important; } 
            .lote-valid-liquid { color: #10b981 !important; text-shadow: 0 0 8px rgba(16,185,129,0.3) !important; } 
            .lote-valid-inject { color: #c084fc !important; text-shadow: 0 0 8px rgba(192,132,252,0.3) !important; } 
            .lote-error { 
                color: #ef4444 !important; 
                background: rgba(239, 68, 68, 0.15) !important; 
                border-bottom: 2px dashed #ef4444 !important; 
                padding-bottom: 2px !important;
                text-shadow: 0 0 8px rgba(239,68,68,0.4) !important;
            }

            /* ── Rodapé Minimalista Apple (Barra de Metadados + Botão Manual) ── */
            .lote-apple-footer {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 6px 4px 10px 4px !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 11.5px !important;
                color: #86868b !important;
                user-select: none !important;
                box-sizing: border-box !important;
                width: 100% !important;
                gap: 8px !important;
            }

            .lote-apple-footer-meta {
                display: flex !important;
                align-items: center !important;
                gap: 5px !important;
                color: #86868b !important;
                font-weight: 500 !important;
                flex-wrap: wrap !important;
            }

            .lote-apple-meta-item {
                display: inline-block !important;
            }

            .lote-apple-meta-item.is-multi-page {
                color: #ff9f0a !important;
            }

            .lote-apple-meta-sep {
                opacity: 0.3 !important;
                font-size: 9px !important;
            }

            .lote-apple-footer-status {
                display: inline-flex !important;
                align-items: center !important;
                gap: 10px !important;
            }

            .lote-apple-status-pill {
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                color: #86868b !important;
                transition: color 0.18s ease !important;
            }

            .lote-apple-dot {
                width: 5px !important;
                height: 5px !important;
                border-radius: 50% !important;
                background: #636366 !important;
                display: inline-block !important;
                transition: background 0.18s ease !important;
            }

            .lote-apple-status-pill.is-ok .lote-apple-dot {
                background: #30d158 !important;
            }
            .lote-apple-status-pill.is-ok {
                color: #30d158 !important;
            }

            .lote-apple-status-pill.is-error .lote-apple-dot {
                background: #ff453a !important;
            }
            .lote-apple-status-pill.is-error {
                color: #ff453a !important;
            }

            /* Botão Manual Clínico em Pílula de Vidro Apple */
            .lote-apple-footer-actions {
                display: flex !important;
                align-items: center !important;
                flex-shrink: 0 !important;
            }

            .lote-apple-guide-pill {
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                height: 25px !important;
                padding: 0 10px !important;
                border-radius: 999px !important;
                background: rgba(255, 255, 255, 0.04) !important;
                border: 1px solid rgba(255, 255, 255, 0.09) !important;
                color: #8e8e93 !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                letter-spacing: -0.1px !important;
                cursor: pointer !important;
                transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
                user-select: none !important;
                outline: none !important;
                box-shadow: none !important;
                white-space: nowrap !important;
            }

            .lote-apple-guide-pill:hover {
                background: rgba(255, 255, 255, 0.09) !important;
                border-color: rgba(255, 255, 255, 0.18) !important;
                color: #f5f5f7 !important;
                transform: translateY(-0.5px) !important;
            }

            .lote-apple-guide-pill:active {
                background: rgba(255, 255, 255, 0.14) !important;
                transform: scale(0.97) !important;
            }

            .lote-guide-pill-icon {
                width: 12px !important;
                height: 12px !important;
                stroke-width: 2 !important;
                color: currentColor !important;
                opacity: 0.8 !important;
            }

            /* ── Botão Principal Apple System (Limpo, Elegante, Title Case) ── */
            #add-btn.lote-apple-hero-btn {
                background: #0071e3 !important;
                color: #ffffff !important;
                border: none !important;
                border-radius: 10px !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 13.5px !important;
                font-weight: 600 !important;
                letter-spacing: -0.15px !important;
                text-shadow: none !important;
                box-shadow: 0 2px 8px rgba(0, 113, 227, 0.28) !important;
                transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
                min-height: 46px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-transform: none !important;
            }

            #add-btn.lote-apple-hero-btn:hover {
                background: #0077ed !important;
                box-shadow: 0 4px 14px rgba(0, 113, 227, 0.38) !important;
                transform: translateY(-1px) !important;
            }

            #add-btn.lote-apple-hero-btn:active {
                transform: scale(0.98) !important;
                opacity: 0.92 !important;
            }

            /* IntelliSense Floating Popup (Design Anterior) */
            .lote-intellisense-popup {
                position: fixed !important;
                z-index: 999999 !important;
                background: rgba(15, 23, 42, 0.95) !important;
                backdrop-filter: blur(28px) saturate(180%) !important;
                -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
                border: 1px solid rgba(56, 189, 248, 0.3) !important;
                border-radius: 14px !important;
                box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.15) !important;
                overflow: hidden !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif !important;
                animation: popIn 0.15s ease-out !important;
            }
            @keyframes popIn {
                from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            .lote-intellisense-header {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 7px 12px !important;
                background: rgba(0, 0, 0, 0.35) !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
                font-size: 10px !important;
                font-weight: 700 !important;
                color: #38bdf8 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
            .lote-intellisense-kbr {
                color: #64748b !important;
                font-size: 10px !important;
            }
            .lote-intellisense-list {
                max-height: 220px !important;
                overflow-y: auto !important;
                padding: 4px !important;
            }
            .lote-intellisense-item {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                padding: 8px 10px !important;
                border-radius: 8px !important;
                font-size: 12px !important;
                font-weight: 600 !important;
                color: #cbd5e1 !important;
                cursor: pointer !important;
                transition: background 0.1s ease !important;
            }
            .lote-intellisense-item:hover,
            .lote-intellisense-item.is-selected {
                background: rgba(56, 189, 248, 0.16) !important;
                color: #ffffff !important;
            }
            .lote-item-icon {
                font-size: 13px !important;
                filter: drop-shadow(0 0 4px rgba(255,255,255,0.2)) !important;
            }
            .lote-item-name {
                flex: 1 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }

            /* Badges informativas nas linhas de highlights */
            .lote-norm-badge {
                display: inline-block;
                font-size: 0.72em;
                background: rgba(10, 132, 255, 0.15);
                color: #0a84ff;
                border: 1px solid rgba(10, 132, 255, 0.25);
                border-radius: 4px;
                padding: 1px 5px;
                margin-left: 6px;
                vertical-align: middle;
            }

            /* Modal de Protocolos Clínicos */
            .lote-protocols-modal {
                position: fixed;
                inset: 0;
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease;
            }
            .lote-protocols-modal.is-open {
                opacity: 1;
                pointer-events: auto;
            }
            .lote-modal-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
            }
            .lote-modal-content {
                position: relative;
                width: 90%;
                max-width: 580px;
                max-height: 85vh;
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.8);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform: scale(0.96);
                transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .lote-protocols-modal.is-open .lote-modal-content {
                transform: scale(1);
            }
            .lote-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 22px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .lote-modal-close {
                background: transparent;
                border: none;
                font-size: 1.5rem;
                color: #94a3b8;
                cursor: pointer;
            }
            .lote-protocols-grid {
                padding: 18px 22px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                overflow-y: auto;
            }
            .lote-proto-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 12px;
                padding: 12px 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .lote-proto-card:hover {
                background: rgba(0, 113, 227, 0.08);
                border-color: rgba(0, 113, 227, 0.3);
                transform: translateX(3px);
            }
            .lote-proto-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 6px;
            }
            .lote-proto-title {
                font-weight: 600;
                font-size: 13px;
                color: #f8fafc;
            }
            .lote-proto-badge {
                font-size: 10px;
                font-weight: 600;
                color: #0a84ff;
                background: rgba(10, 132, 255, 0.12);
                border-radius: 999px;
                padding: 2px 8px;
            }
            .lote-proto-items {
                font-size: 11px;
                color: #94a3b8;
                line-height: 1.4;
            }
            .lote-modal-footer {
                padding: 14px 22px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                justify-content: flex-end;
            }
            .lote-btn-save-current {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 10px;
                color: #cbd5e1;
                font-size: 12px;
                font-weight: 600;
                padding: 8px 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .lote-btn-save-current:hover {
                background: rgba(56, 189, 248, 0.15);
                color: #ffffff;
                border-color: #38bdf8;
            }


            /* ══════════════════════════════════════════════════════════════════════════════
               MODAL DE INSTRUÇÕES & MANUAL CLÍNICO DO MODO LOTE (APPLE EXECUTIVE)
               ══════════════════════════════════════════════════════════════════════════════ */
            .lote-guide-modal {
                position: fixed;
                inset: 0;
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .lote-guide-modal.is-open {
                opacity: 1;
                pointer-events: auto;
            }
            .lote-guide-content {
                position: relative;
                width: 94%;
                max-width: 740px;
                max-height: 88vh;
                background: rgba(11, 16, 27, 0.96);
                backdrop-filter: blur(36px) saturate(190%);
                -webkit-backdrop-filter: blur(36px) saturate(190%);
                border: 1px solid rgba(56, 189, 248, 0.25);
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                box-shadow: 0 25px 65px -10px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif;
                animation: appleModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes appleModalPop {
                from { opacity: 0; transform: scale(0.95) translateY(12px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            .lote-guide-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 24px 14px 24px;
                background: rgba(15, 23, 42, 0.6);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .lote-guide-header-title {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .lote-guide-icon-badge {
                font-size: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 12px;
                background: rgba(56, 189, 248, 0.1);
                border: 1px solid rgba(56, 189, 248, 0.25);
                box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
            }
            .lote-guide-title {
                margin: 0;
                font-size: 1.15rem;
                font-weight: 700;
                color: #f8fafc;
                letter-spacing: -0.3px;
            }
            .lote-guide-subtitle {
                margin: 3px 0 0 0;
                font-size: 0.8rem;
                color: #94a3b8;
            }
            .lote-guide-close {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #94a3b8;
                font-size: 20px;
                line-height: 1;
                cursor: pointer;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            .lote-guide-close:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: #ef4444;
                color: #ffffff;
            }

            /* Abas de Navegação */
            .lote-guide-nav {
                display: flex;
                gap: 6px;
                padding: 10px 20px;
                background: rgba(0, 0, 0, 0.35);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                overflow-x: auto;
            }
            .lote-guide-nav-btn {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                color: #94a3b8;
                font-family: inherit;
                font-size: 11.5px;
                font-weight: 600;
                padding: 7px 12px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                user-select: none;
            }
            .lote-guide-nav-btn:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #f8fafc;
                border-color: rgba(255, 255, 255, 0.16);
            }
            .lote-guide-nav-btn.is-active {
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.25) 100%);
                border-color: #38bdf8;
                color: #ffffff;
                box-shadow: 0 0 15px rgba(56, 189, 248, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }

            /* Corpo do Modal e Painéis */
            .lote-guide-body {
                flex: 1;
                overflow-y: auto;
                padding: 22px 24px;
            }
            .lote-guide-body::-webkit-scrollbar {
                width: 6px;
            }
            .lote-guide-body::-webkit-scrollbar-thumb {
                background: rgba(56, 189, 248, 0.3);
                border-radius: 999px;
            }
            .lote-guide-pane {
                display: none;
            }
            .lote-guide-pane.is-active {
                display: block;
                animation: fadeInPane 0.2s ease-out;
            }
            @keyframes fadeInPane {
                from { opacity: 0; transform: translateY(6px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            .lote-guide-section-intro h3 {
                margin: 0 0 6px 0;
                font-size: 1.05rem;
                color: #f8fafc;
                font-weight: 700;
            }
            .lote-guide-section-intro p {
                margin: 0 0 18px 0;
                font-size: 0.85rem;
                color: #94a3b8;
                line-height: 1.5;
            }

            /* Grid de Regras de Ouro */
            .lote-guide-rules-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                margin-bottom: 18px;
            }
            .lote-rule-card {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 12px;
                padding: 12px 14px;
            }
            .lote-rule-icon {
                font-size: 1.3rem;
                line-height: 1;
            }
            .lote-rule-text b {
                display: block;
                color: #e2e8f0;
                font-size: 0.85rem;
                margin-bottom: 2px;
            }
            .lote-rule-text span {
                color: #94a3b8;
                font-size: 0.78rem;
                line-height: 1.4;
            }
            .lote-rule-text code {
                background: rgba(56, 189, 248, 0.15);
                color: #38bdf8;
                padding: 1px 5px;
                border-radius: 4px;
                font-family: monospace;
            }

            /* Banner da Lente */
            .lote-guide-lens-banner {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 12px;
                padding: 14px;
                margin-bottom: 18px;
            }
            .lote-guide-lens-banner h4 {
                margin: 0 0 10px 0;
                font-size: 0.85rem;
                color: #cbd5e1;
            }
            .lote-lens-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .lote-tag {
                font-size: 0.75rem;
                font-weight: 600;
                padding: 4px 10px;
                border-radius: 999px;
            }
            .lote-tag.tag-pill { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
            .lote-tag.tag-liquid { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
            .lote-tag.tag-inject { background: rgba(192, 132, 252, 0.15); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }
            .lote-tag.tag-error { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }

            /* Demo Box */
            .lote-guide-demo-box {
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%);
                border: 1px solid rgba(56, 189, 248, 0.3);
                border-radius: 12px;
                padding: 14px 18px;
            }
            .lote-demo-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .lote-btn-insert-demo {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                border: none;
                border-radius: 8px;
                color: #ffffff;
                font-weight: 700;
                font-size: 11.5px;
                padding: 8px 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
                white-space: nowrap;
            }
            .lote-btn-insert-demo:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 18px rgba(14, 165, 233, 0.5);
            }

            /* Cards de Exemplo */
            .lote-example-cards {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .lote-card-example {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 14px;
                padding: 14px 16px;
                position: relative;
                transition: border-color 0.2s ease;
            }
            .lote-card-example:hover {
                border-color: rgba(56, 189, 248, 0.3);
                background: rgba(255, 255, 255, 0.04);
            }
            .lote-ex-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            .lote-ex-badge {
                font-size: 9.5px;
                font-weight: 700;
                text-transform: uppercase;
                background: rgba(56, 189, 248, 0.15);
                color: #38bdf8;
                border-radius: 6px;
                padding: 2px 7px;
                letter-spacing: 0.5px;
            }
            .lote-ex-desc {
                font-size: 0.8rem;
                font-weight: 600;
                color: #cbd5e1;
            }
            .lote-code-block {
                background: #060911;
                border: 1px solid rgba(56, 189, 248, 0.15);
                border-radius: 8px;
                padding: 10px 14px;
                margin-bottom: 8px;
            }
            .lote-code-block code {
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 13px;
                font-weight: 600;
                color: #38bdf8;
                white-space: pre-wrap;
                word-break: break-word;
            }
            .lote-ex-meaning {
                font-size: 0.78rem;
                color: #94a3b8;
                line-height: 1.4;
                margin-bottom: 10px;
            }
            .lote-ex-meaning b {
                color: #e2e8f0;
            }
            .lote-btn-insert-ex {
                background: rgba(56, 189, 248, 0.08);
                border: 1px solid rgba(56, 189, 248, 0.25);
                border-radius: 8px;
                color: #38bdf8;
                font-size: 11px;
                font-weight: 600;
                padding: 6px 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .lote-btn-insert-ex:hover {
                background: rgba(56, 189, 248, 0.2);
                color: #ffffff;
                border-color: #38bdf8;
                box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
                transform: translateY(-1px);
            }
            .lote-btn-insert-ex:active {
                transform: scale(0.96);
            }

            /* Rodapé do Modal */
            .lote-guide-footer {
                padding: 14px 24px;
                background: rgba(15, 23, 42, 0.6);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            .lote-guide-footer-tip {
                font-size: 0.75rem;
                color: #94a3b8;
            }
            .lote-guide-footer-tip b {
                color: #fcd34d;
            }
            .lote-btn-close-guide {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 10px;
                color: #f8fafc;
                font-size: 12px;
                font-weight: 600;
                padding: 8px 18px;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }
            .lote-btn-close-guide:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.25);
            }

            /* 🌟 Micro-Indicador Flutuante de Posologia */
            .lote-posology-indicator {
                position: fixed;
                z-index: 1000;
                pointer-events: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(15, 23, 42, 0.94);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(56, 189, 248, 0.4);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px rgba(56, 189, 248, 0.2);
                border-radius: 20px;
                padding: 5px 14px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 11.5px;
                color: #94a3b8;
                white-space: nowrap;
                transition: opacity 0.15s ease, transform 0.15s ease;
            }
            .lote-posology-indicator.hidden {
                display: none !important;
            }
            .lote-posology-indicator .lote-pos-slot {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 2px 6px;
                border-radius: 6px;
                transition: all 0.15s ease;
            }
            .lote-posology-indicator .lote-pos-slot.is-active {
                color: #38bdf8;
                background: rgba(56, 189, 248, 0.18);
                font-weight: 700;
                box-shadow: 0 0 8px rgba(56, 189, 248, 0.25);
            }
            .lote-posology-indicator .lote-pos-sep {
                color: #475569;
                font-size: 10px;
            }
            .lote-posology-indicator .lote-pos-hint {
                color: #64748b;
                font-size: 10.5px;
                margin-left: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 8. INTEGRAÇÃO COM O APP E SOBRECARGA DO PARSER
    // ──────────────────────────────────────────────────────────────────────────

    function initLotePro() {
        injectLoteProStyles();
        createIntellisensePopup();
        createPosologyIndicator();
        injectLoteToolbarAndFooter();

        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        // Monitor de digitação e navegação pelo teclado
        textarea.addEventListener('input', () => {
            handleIntellisenseInput(textarea);
            updateLiveStats();
            if (window.App && typeof window.App.updateLoteHighlights === 'function') {
                window.App.updateLoteHighlights();
            }
        });

        textarea.addEventListener('keydown', (e) => {
            // Se o IntelliSense estiver desativado pelo usuário, cancela estados pendentes e não intercepta teclas
            if (!isIntellisenseEnabled()) {
                if (posologyActive) cancelPosologyMode();
                hideIntellisense();
                return;
            }

            // 🌟 1. ASSISTENTE DE POSOLOGIA INTERATIVO ATIVO (0X-0Y-0Z)
            if (posologyActive) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelPosologyMode();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    adjustPosologySlotValue(1);
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    adjustPosologySlotValue(-1);
                    return;
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (posologySlot < 2) setPosologySlot(posologySlot + 1);
                    return;
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (posologySlot > 0) setPosologySlot(posologySlot - 1);
                    return;
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        if (posologySlot > 0) setPosologySlot(posologySlot - 1);
                    } else {
                        if (posologySlot < 2) {
                            setPosologySlot(posologySlot + 1);
                        } else {
                            finishPosologyMode(true);
                        }
                    }
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finishPosologyMode(true);
                    return;
                }
                if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    handlePosologyDigitInput(e.key);
                    return;
                }
                if (e.key === 'Backspace') {
                    e.preventDefault();
                    handlePosologyBackspace();
                    return;
                }
                if (e.key === 'Delete') {
                    e.preventDefault();
                    resetPosologySlotValue();
                    return;
                }
                return;
            }

            // 🌟 2. INTELLISENSE DE MEDICAÇÃO ATIVO
            if (e.key === 'Escape') {
                hideIntellisense();
                return;
            }
            if (intellisenseActive && currentSuggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex + 1) % currentSuggestions.length;
                    renderIntellisenseSuggestions();
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    activeSuggestionIndex = (activeSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
                    renderIntellisenseSuggestions();
                    return;
                }
                if (e.key === 'Enter' || e.key === 'Tab') {
                    e.preventDefault();
                    applySuggestion(activeSuggestionIndex);
                    return;
                }
            } else if (e.key === 'Enter') {
                hideIntellisense();
            } else if (e.key === 'Tab' && !e.shiftKey) {
                // 🌟 3. DISPARO POR TAB APÓS NOME + CONCENTRAÇÃO DIGITADOS MANUALMENTE
                const text = textarea.value;
                const cursor = textarea.selectionStart;
                const lastNewline = text.lastIndexOf('\n', cursor - 1);
                const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
                let lineEnd = text.indexOf('\n', cursor);
                if (lineEnd === -1) lineEnd = text.length;
                const currentLine = text.slice(lineStart, lineEnd).trim();

                // Caso já tenha tríade (ex: CLONAZEPAM 2MG 01-00-01) -> reabre para edição
                const triadMatch = currentLine.match(/^(.*?)\s+(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{1,2})\s*$/);
                if (triadMatch) {
                    e.preventDefault();
                    const vals = [parseInt(triadMatch[2], 10), parseInt(triadMatch[3], 10), parseInt(triadMatch[4], 10)];
                    startPosologyMode(triadMatch[1].trim(), vals, 0, lineStart);
                    return;
                }

                // Caso tenha apenas medicamento + concentração (ex: LOSARTANA 50MG)
                const concMatch = currentLine.match(/^(.*?\b\d+(?:[.,]\d+)?\s*(?:(?:MG|G|MCG|UI|U)\/(?:[\d.,]+)?ML|MG|MCG|G|UI|U|%))\s*$/i);
                if (concMatch) {
                    e.preventDefault();
                    const medName = concMatch[1].trim();
                    startPosologyMode(medName, [0, 0, 0], 0, lineStart);
                    return;
                }
            }
        });

        textarea.addEventListener('pointerdown', () => {
            if (!isIntellisenseEnabled()) {
                if (posologyActive) cancelPosologyMode();
                hideIntellisense();
                return;
            }
            if (posologyActive) {
                setTimeout(checkPosologyCursorPlacement, 50);
            }
        });

        textarea.addEventListener('scroll', () => {
            hideIntellisense();
            if (posologyActive) {
                positionPosologyIndicator();
            }
        });

        textarea.addEventListener('blur', () => {
            setTimeout(() => {
                hideIntellisense();
                if (posologyActive) {
                    finishPosologyMode(false);
                }
            }, 200);
        });

        // Ouvintes de reatividade imediata para alternância do IntelliSense
        window.addEventListener('cerebrum_lote_intellisense_change', (e) => {
            const enabled = !!(e.detail && e.detail.enabled);
            if (!enabled) {
                hideIntellisense();
                if (posologyActive) cancelPosologyMode();
            }
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'cerebrum_lote_intellisense' && e.newValue === 'false') {
                hideIntellisense();
                if (posologyActive) cancelPosologyMode();
            }
        });

        // ──────────────────────────────────────────────────────────────────────
        // Hook inteligente e resiliente na validação e salvamento do Lote
        // ──────────────────────────────────────────────────────────────────────
        function installSmartValidationHook() {
            if (!window.App) return;

            // 1. Hook na validação inteligente de linha do Lote
            if (typeof window.App.validateLoteLine === 'function' && !window.App.validateLoteLine._isLotePro) {
                const originalValidate = window.App.validateLoteLine;

                const loteProValidate = function (line) {
                    let text = (line || '').replace(/^[\s\-•*]+/, '').replace(/[.;]+$/, '').trim();
                    if (!text) return { valid: true, type: 'EMPTY' };

                    // Tenta com o validador original direto
                    let res = originalValidate.call(window.App, line);
                    if (res && res.valid) return res;

                    // Normaliza totalmente a linha (medicação + concentração + posologia + observações)
                    const normInfo = normalizeFullLine(text);
                    if (normInfo && normInfo.normalized) {
                        res = originalValidate.call(window.App, normInfo.normalized);
                        if (res && res.valid) {
                            res.normalizedText = normInfo.normalized;
                            res.correctionNote = normInfo.correctionNote;
                            return res;
                        }
                    }

                    // Linha de uso livre (ex: medicação : texto de posologia)
                    if (text.includes(':') || text.includes('—') || /USO:/i.test(text)) {
                        return { valid: true, type: 'CUSTOM', normalizedText: normInfo ? normInfo.normalized : text };
                    }

                    return { valid: false };
                };

                loteProValidate._isLotePro = true;
                window.App.validateLoteLine = loteProValidate;
            }

            // 2. Hook no handleSave para aplicar normalização antes de salvar no prontuário
            if (window.App.handleSave && !window.App.handleSaveLoteProHooked) {
                const prevHandleSave = window.App.handleSave;
                window.App.handleSaveLoteProHooked = true;

                window.App.handleSave = async function () {
                    if (this.DOM && this.DOM.modeFast && this.DOM.modeFast.checked && this.editingIndex === -1 && this.DOM.fastInput) {
                        const raw = this.DOM.fastInput.value;
                        if (raw.trim()) {
                            // Pré-normaliza as linhas para que o parser do sistema processe com 100% de precisão clínica
                            const lines = raw.split('\n');
                            const normalizedLines = lines.map(l => {
                                if (!l.trim()) return "";
                                const valResult = window.App.validateLoteLine ? window.App.validateLoteLine(l) : null;
                                if (valResult && valResult.normalizedText) {
                                    return valResult.normalizedText;
                                }
                                const n = normalizeFullLine(l);
                                return (n && n.normalized) ? n.normalized : l;
                            });
                            this.DOM.fastInput.value = normalizedLines.join('\n');
                            this.DOM.fastInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                    return await prevHandleSave.call(this);
                };
            }
        }

        installSmartValidationHook();
        setTimeout(installSmartValidationHook, 600);
        setTimeout(installSmartValidationHook, 1200);
        setTimeout(installSmartValidationHook, 2200);
        setTimeout(installSmartValidationHook, 3600);

        textarea.addEventListener('focus', installSmartValidationHook);
        const modeFastEl = document.getElementById('mode-fast');

        function syncLoteModeVisuals() {
            const isLote = modeFastEl && modeFastEl.checked;
            const mainSection = document.getElementById('section-prescription-main');
            const badge = document.getElementById('lote-mode-badge');
            const addBtn = document.getElementById('add-btn');

            if (mainSection) {
                mainSection.classList.toggle('modo-lote-active-card', !!isLote);
            }
            if (badge) {
                badge.remove();
            }
            if (isLote) {
                if (addBtn) {
                    addBtn.classList.add('lote-apple-hero-btn');
                    addBtn.classList.remove('lote-hero-btn', 'lote-exec-hero-btn');
                    if (addBtn.innerText.includes('INCLUIR MEDICAMENTO') || !addBtn.innerText.trim()) {
                        addBtn.innerText = 'Adicionar à Receita';
                    }
                }
            } else if (addBtn) {
                addBtn.classList.remove('lote-hero-btn', 'lote-apple-hero-btn', 'lote-exec-hero-btn');
                addBtn.innerHTML = '+ INCLUIR MEDICAMENTO';
            }
        }

        if (modeFastEl) {
            modeFastEl.addEventListener('change', () => {
                installSmartValidationHook();
                syncLoteModeVisuals();
                setTimeout(updateLiveStats, 100);
            });
        }

        function updateLiveStats() {
            syncLoteModeVisuals();
            if (!textarea) return;
            const lines = textarea.value.split('\n').filter(l => l.trim().length > 0);
            let valid = 0;
            let errors = 0;

            lines.forEach(l => {
                if (window.App && typeof window.App.validateLoteLine === 'function') {
                    const r = window.App.validateLoteLine(l);
                    if (r && r.valid && r.type !== 'EMPTY') valid++;
                    else if (r && !r.valid) errors++;
                }
            });

            updateLiveStatusFooter(lines.length, valid, errors);
        }

        setTimeout(updateLiveStats, 100);
        setTimeout(syncLoteModeVisuals, 350);
    }

    // Inicialização segura
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initLotePro, 300));
    } else {
        setTimeout(initLotePro, 300);
    }

    window.LotePro = {
        resolveMedicationName,
        normalizePosologyString,
        normalizeFullLine,
        sanitizePepPrescription,
        openProtocolsModal,
        openGuideModal,
        isIntellisenseEnabled
    };

})();
