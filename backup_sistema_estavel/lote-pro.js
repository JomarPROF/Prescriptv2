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
        if (typeof MED_LIBRARY !== 'undefined') {
            for (let cat in MED_LIBRARY) {
                if (Array.isArray(MED_LIBRARY[cat])) {
                    MED_LIBRARY[cat].forEach(m => medsSet.add(m.trim().toUpperCase()));
                }
            }
        }
        if (typeof ALTO_CUSTO_MEDS !== 'undefined' && Array.isArray(ALTO_CUSTO_MEDS)) {
            ALTO_CUSTO_MEDS.forEach(m => medsSet.add(m.trim().toUpperCase()));
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

    let intellisensePopup = null;
    let activeSuggestionIndex = 0;
    let currentSuggestions = [];
    let intellisenseActive = false;
    let suppressIntellisense = false;

    function createIntellisensePopup() {
        if (document.getElementById('lote-intellisense-popup')) return;
        intellisensePopup = document.createElement('div');
        intellisensePopup.id = 'lote-intellisense-popup';
        intellisensePopup.className = 'lote-intellisense-popup hidden';
        document.body.appendChild(intellisensePopup);

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
        if (!suggestions || suggestions.length === 0 || suppressIntellisense) {
            hideIntellisense();
            return;
        }

        currentSuggestions = suggestions;
        activeSuggestionIndex = 0;
        intellisenseActive = true;

        renderIntellisenseSuggestions();

        const rect = textarea.getBoundingClientRect();
        const textBefore = textarea.value.slice(0, textarea.selectionStart);
        const lineIndex = textBefore.split('\n').length - 1;
        const computed = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computed.lineHeight) || 24;
        const paddingTop = parseFloat(computed.paddingTop) || 18;

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
            // Posiciona logo ABAIXO da linha digitada (com 6px de folga)
            // O texto da linha continua 100% visível para o médico!
            topPosition = currentLineBottom + 6;
        } else {
            // Se estiver no rodapé da viewport, posiciona logo ACIMA da linha digitada
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
        const existingPoso = posoMatch ? ' ' + posoMatch[1] : ' ';

        const newLine = `${chosenMed}${existingPoso}`;
        const newText = text.slice(0, lineStart) + newLine + text.slice(lineEnd);

        // Bloqueia reabertura imediata pelo evento de input que será emitido
        suppressIntellisense = true;
        hideIntellisense();

        textarea.value = newText;
        const newCursorPos = lineStart + chosenMed.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);

        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        // Garante que o quadro permaneça fechado após aceitar
        setTimeout(() => {
            hideIntellisense();
            suppressIntellisense = false;
        }, 120);
    }

    function handleIntellisenseInput(textarea) {
        if (suppressIntellisense) {
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
        if (!fastUi || document.getElementById('lote-dock-toolbar')) return;

        // 1. Barra de ferramentas com alinhamento perfeito nível Apple
        const toolbar = document.createElement('div');
        toolbar.id = 'lote-dock-toolbar';
        toolbar.className = 'lote-dock-toolbar';
        toolbar.innerHTML = `
            <button type="button" class="lote-tb-btn lote-tb-paste" id="btn-lote-paste" title="Colar da área de transferência">
                <svg viewBox="0 0 24 24" class="lote-tb-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" fill="currentColor" fill-opacity="0.25"></rect>
                </svg>
                <span>Colar</span>
            </button>
            <button type="button" class="lote-tb-btn lote-tb-clean" id="btn-lote-clean-pep" title="Higienizar e converter texto copiado de prontuários (e-SUS, SoulMV, Tasy)">
                <svg viewBox="0 0 24 24" class="lote-tb-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m12 2-1.8 4.2a2 2 0 0 1-1 1L5 9l4.2 1.8a2 2 0 0 1 1 1L12 16l1.8-4.2a2 2 0 0 1 1-1L19 9l-4.2-1.8a2 2 0 0 1-1-1L12 2z" fill="currentColor" fill-opacity="0.2"></path>
                    <path d="M19 15v4m2-2h-4"></path>
                </svg>
                <span>Higienizar</span>
            </button>
            <button type="button" class="lote-tb-btn lote-tb-protocols" id="btn-lote-protocols" title="Inserir combos clínicos rápidos de 1 clique">
                <svg viewBox="0 0 24 24" class="lote-tb-icon" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill-opacity="0.3"></polygon>
                </svg>
                <span>Protocolos</span>
            </button>
            <button type="button" class="lote-tb-btn lote-tb-format" id="btn-lote-format" title="Formatar e auto-corrigir hífens, pontuações e espaçamentos">
                <svg viewBox="0 0 24 24" class="lote-tb-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="21" y1="6" x2="3" y2="6"></line>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                    <line x1="19" y1="18" x2="3" y2="18"></line>
                </svg>
                <span>Formatar</span>
            </button>
            <button type="button" class="lote-tb-btn lote-tb-guide" id="btn-lote-guide" title="Guia Clínico: Instruções passo a passo de como prescrever comprimidos, gotas e injetáveis">
                <svg viewBox="0 0 24 24" class="lote-tb-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Instruções</span>
            </button>
            <button type="button" class="lote-tb-btn lote-tb-clear" id="btn-lote-clear" title="Limpar editor do Modo Lote">
                <svg viewBox="0 0 24 24" class="lote-tb-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Limpar</span>
            </button>
        `;

        // 2. Rodapé de status com botão de acesso ao Guia (Layout Estruturado em 2 Linhas)
        const footer = document.createElement('div');
        footer.id = 'lote-live-footer';
        footer.className = 'lote-live-footer';
        footer.innerHTML = `
            <div class="lote-footer-status-row">
                <div class="lote-footer-left">
                    <span class="lote-badge-pill" id="lote-badge-count">💊 0 medicações</span>
                    <span class="lote-badge-pill" id="lote-badge-sheets">📄 Folha 1 (0/5)</span>
                </div>
                <div class="lote-footer-right">
                    <span class="lote-badge-status" id="lote-badge-status">✏️ Digite ou cole</span>
                </div>
            </div>
            <div class="lote-footer-guide-row">
                <button type="button" class="lote-footer-guide-btn" id="btn-lote-guide-footer" title="Ver manual e instruções passo a passo de como prescrever">
                    <span class="lote-footer-guide-icon">💡</span>
                    <span>Como prescrever no Modo Lote? Ver manual clínico</span>
                    <span class="lote-footer-guide-arrow">›</span>
                </button>
            </div>
        `;

        // Insere na DOM
        fastUi.insertBefore(toolbar, fastUi.firstChild);
        fastUi.appendChild(footer);

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
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1.3rem;">⚡</span>
                        <div>
                            <h3 style="margin:0; font-size:1rem; color:#f8fafc; font-weight:700;">Protocolos & Combos Clínicos</h3>
                            <span style="font-size:0.75rem; color:#94a3b8;">Insira conjuntos frequentes com 1 clique</span>
                        </div>
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
                        💾 Salvar texto atual como novo protocolo
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
            { id: 'geral', icon: '🌟', label: 'Como Funciona' },
            { id: 'comprimidos', icon: '💊', label: 'Comprimidos' },
            { id: 'gotas', icon: '💧', label: 'Gotas & Líquidos' },
            { id: 'injetaveis', icon: '💉', label: 'Injetáveis & Depot' },
            { id: 'livre', icon: '✍️', label: 'Uso Livre & SOS' }
        ];

        modal.innerHTML = `
            <div class="lote-modal-backdrop" onclick="document.getElementById('lote-guide-modal').classList.remove('is-open')"></div>
            <div class="lote-guide-content">
                <div class="lote-guide-header">
                    <div class="lote-guide-header-title">
                        <div class="lote-guide-icon-badge">📖</div>
                        <div>
                            <h2 class="lote-guide-title">Manual de Prescrição do Modo Lote</h2>
                            <p class="lote-guide-subtitle">Guia passo a passo de sintaxe clínica, dosagens e reconhecimento inteligente</p>
                        </div>
                    </div>
                    <button type="button" class="lote-guide-close" onclick="document.getElementById('lote-guide-modal').classList.remove('is-open')" title="Fechar (Esc)">&times;</button>
                </div>

                <div class="lote-guide-nav">
                    ${tabsData.map(t => `
                        <button type="button" class="lote-guide-nav-btn ${t.id === initialTab ? 'is-active' : ''}" data-tab="${t.id}">
                            <span>${t.icon}</span>
                            <span>${t.label}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="lote-guide-body">
                    <!-- ABA 1: COMO FUNCIONA / GERAL -->
                    <div class="lote-guide-pane ${initialTab === 'geral' ? 'is-active' : ''}" id="pane-geral">
                        <div class="lote-guide-section-intro">
                            <h3>🚀 Como funciona a prescrição em lote?</h3>
                            <p>O <b>Modo Lote</b> permite ao médico prescrever <b>múltiplas medicações ao mesmo tempo</b>, digitando ou colando o texto de forma contínua. O sistema reconhece automaticamente o nome do fármaco, a concentração, a forma farmacêutica e os horários de tomada.</p>
                        </div>

                        <div class="lote-guide-rules-grid">
                            <div class="lote-rule-card">
                                <div class="lote-rule-icon">1️⃣</div>
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

    // Atualiza o rodapé de status (Live Status Footer)
    function updateLiveStatusFooter(totalLines, validCount, errorCount) {
        const badgeCount = document.getElementById('lote-badge-count');
        const badgeSheets = document.getElementById('lote-badge-sheets');
        const badgeStatus = document.getElementById('lote-badge-status');
        if (!badgeCount || !badgeSheets || !badgeStatus) return;

        let limit = parseInt(localStorage.getItem('cerebrum_meds_limit')) || 5;
        
        badgeCount.innerText = `💊 ${validCount} ${validCount === 1 ? 'medicação' : 'medicações'}`;

        if (validCount <= limit) {
            badgeSheets.innerText = `📄 Folha 1 (${validCount}/${limit})`;
            badgeSheets.className = "lote-badge-pill";
        } else {
            const pages = Math.ceil(validCount / limit);
            badgeSheets.innerText = `📄 ${pages} Folhas (${validCount} itens)`;
            badgeSheets.className = "lote-badge-pill is-multi-page";
        }

        if (errorCount > 0) {
            badgeStatus.innerText = `⚠️ ${errorCount} ${errorCount === 1 ? 'erro' : 'erros'}`;
            badgeStatus.className = "lote-badge-status is-error";
        } else if (validCount > 0) {
            badgeStatus.innerText = `✅ Tudo pronto`;
            badgeStatus.className = "lote-badge-status is-ok";
        } else {
            badgeStatus.innerText = `✏️ Digite ou cole`;
            badgeStatus.className = "lote-badge-status";
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
               APPLE EXECUTIVE PRO DOCK TOOLBAR — MODO LOTE
               ══════════════════════════════════════════════════════════════════════════════ */
            .lote-dock-toolbar {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                background: rgba(11, 16, 27, 0.72) !important;
                backdrop-filter: blur(28px) saturate(190%) !important;
                -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.16) !important;
                border-radius: 14px !important;
                padding: 5px 6px !important;
                margin-bottom: 12px !important;
                box-sizing: border-box !important;
                width: 100% !important;
                max-width: 100% !important;
                gap: 5px !important;
                min-height: 42px !important;
                box-shadow: 0 10px 32px -4px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
                overflow: hidden !important;
            }

            /* Apple Pro Button Base - Estilo Discreto Apple Dark Glass */
            .lote-tb-btn {
                flex: 1 1 0 !important;
                min-width: 0 !important;
                height: 31px !important;
                padding: 0 5px !important;
                border-radius: 9px !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", sans-serif !important;
                font-size: 10.5px !important;
                font-weight: 500 !important;
                letter-spacing: -0.15px !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 4px !important;
                cursor: pointer !important;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
                box-sizing: border-box !important;
                white-space: nowrap !important;
                user-select: none !important;
                position: relative !important;
                overflow: hidden !important;
                text-decoration: none !important;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.16) !important;
                color: #cbd5e1 !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.25) !important;
            }

            /* Efeito de Reflexo Sutil de Luz nos Botões */
            .lote-tb-btn::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: -130% !important;
                width: 60% !important;
                height: 100% !important;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent) !important;
                transform: skewX(-20deg) !important;
                transition: 0s !important;
                pointer-events: none !important;
            }

            .lote-tb-btn:hover::before {
                left: 190% !important;
                transition: 0.65s ease-in-out !important;
            }

            /* Hover Sóbrio, Elegante e Discreto */
            .lote-tb-btn:hover {
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.04) 100%) !important;
                border-color: rgba(255, 255, 255, 0.2) !important;
                border-top-color: rgba(255, 255, 255, 0.32) !important;
                color: #ffffff !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
            }

            /* Física de Toque Háptico Apple (Squish) */
            .lote-tb-btn:active {
                transform: scale(0.95) translateY(1px) !important;
                transition: all 0.08s ease !important;
            }

            /* Ícones SVG Discretos (Muted Silver) */
            .lote-tb-btn svg,
            .lote-tb-icon {
                flex-shrink: 0 !important;
                width: 13px !important;
                height: 13px !important;
                display: inline-block !important;
                vertical-align: middle !important;
                color: #94a3b8 !important;
                filter: none !important;
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.22s ease !important;
            }

            .lote-tb-btn:hover svg,
            .lote-tb-btn:hover .lote-tb-icon {
                color: #ffffff !important;
                transform: scale(1.08) !important;
            }

            .lote-tb-btn span {
                display: inline-block !important;
                line-height: 1 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }

            /* Botão Limpar: Discreto e idêntico aos demais em repouso; sutil realce no hover */
            .lote-tb-btn.lote-tb-clear:hover {
                background: linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%) !important;
                border-color: rgba(239, 68, 68, 0.35) !important;
                border-top-color: rgba(239, 68, 68, 0.5) !important;
                color: #fca5a5 !important;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
            }
            .lote-tb-btn.lote-tb-clear:hover svg {
                color: #f87171 !important;
            }

            /* Override no textarea para espaçamento perfeito com o footer */
            #fast-input {
                margin-bottom: 8px !important;
            }

            /* Live Status Footer Container - Apple Glass Edition */
            .lote-live-footer {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
                margin-top: 0 !important;
                margin-bottom: 12px !important;
                padding: 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            /* Linha 1: Métricas e Validação */
            .lote-footer-status-row {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                width: 100% !important;
                padding: 0 1px !important;
                box-sizing: border-box !important;
                min-height: 24px !important;
            }

            .lote-footer-left {
                display: flex !important;
                align-items: center !important;
                gap: 5px !important;
                flex-shrink: 0 !important;
            }

            .lote-badge-pill {
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 10.5px !important;
                font-weight: 600 !important;
                color: #cbd5e1 !important;
                background: rgba(255, 255, 255, 0.04) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 999px !important;
                padding: 3px 8px !important;
                height: 22px !important;
                line-height: 1 !important;
                box-sizing: border-box !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
                transition: all 0.2s ease !important;
            }

            .lote-badge-pill.is-multi-page {
                color: #fcd34d !important;
                border-color: rgba(251, 191, 36, 0.3) !important;
                background: rgba(251, 191, 36, 0.1) !important;
                box-shadow: 0 0 10px rgba(251, 191, 36, 0.2) !important;
            }

            .lote-footer-right {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
                flex-shrink: 0 !important;
                white-space: nowrap !important;
            }

            .lote-badge-status {
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 10.5px !important;
                font-weight: 600 !important;
                color: #64748b !important;
                white-space: nowrap !important;
                display: inline-flex !important;
                align-items: center !important;
                line-height: 1 !important;
                transition: color 0.2s ease !important;
            }

            .lote-badge-status.is-ok {
                color: #4ade80 !important;
                text-shadow: 0 0 8px rgba(74, 222, 128, 0.3) !important;
            }

            .lote-badge-status.is-error {
                color: #ef4444 !important;
                text-shadow: 0 0 8px rgba(239, 68, 68, 0.4) !important;
            }

            /* Linha 2: Pílula de Acesso ao Guia de Prescrição - 100% largura */
            .lote-footer-guide-row {
                width: 100% !important;
            }

            .lote-footer-guide-btn {
                width: 100% !important;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.14) !important;
                border-radius: 9px !important;
                color: #94a3b8 !important;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif !important;
                font-size: 10.5px !important;
                font-weight: 500 !important;
                padding: 0 10px !important;
                height: 27px !important;
                cursor: pointer !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 6px !important;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
                outline: none !important;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 3px rgba(0, 0, 0, 0.2) !important;
                box-sizing: border-box !important;
                white-space: nowrap !important;
                user-select: none !important;
            }

            .lote-footer-guide-btn:hover {
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.035) 100%) !important;
                color: #ffffff !important;
                border-color: rgba(255, 255, 255, 0.18) !important;
                border-top-color: rgba(255, 255, 255, 0.3) !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
                transform: translateY(-1px) !important;
            }

            .lote-footer-guide-btn:active {
                transform: scale(0.98) !important;
            }

            .lote-footer-guide-icon {
                font-size: 11px !important;
                line-height: 1 !important;
            }

            .lote-footer-guide-arrow {
                font-size: 13px !important;
                line-height: 1 !important;
                color: #64748b !important;
                transition: transform 0.2s ease, color 0.2s ease !important;
            }

            .lote-footer-guide-btn:hover .lote-footer-guide-arrow {
                color: #ffffff !important;
                transform: translateX(2px) !important;
            }

            /* IntelliSense Floating Popup */
            .lote-intellisense-popup {
                position: fixed;
                z-index: 999999;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(28px) saturate(180%);
                -webkit-backdrop-filter: blur(28px) saturate(180%);
                border: 1px solid rgba(56, 189, 248, 0.3);
                border-radius: 14px;
                box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.15);
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
                animation: popIn 0.15s ease-out;
            }
            @keyframes popIn {
                from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            .lote-intellisense-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 7px 12px;
                background: rgba(0, 0, 0, 0.35);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                font-size: 10px;
                font-weight: 700;
                color: #38bdf8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .lote-intellisense-kbr {
                color: #64748b;
            }
            .lote-intellisense-list {
                max-height: 220px;
                overflow-y: auto;
                padding: 4px;
            }
            .lote-intellisense-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 10px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                color: #cbd5e1;
                cursor: pointer;
                transition: background 0.1s ease;
            }
            .lote-intellisense-item:hover,
            .lote-intellisense-item.is-selected {
                background: rgba(56, 189, 248, 0.16);
                color: #ffffff;
            }
            .lote-item-icon {
                font-size: 13px;
                filter: drop-shadow(0 0 4px rgba(255,255,255,0.2));
            }
            .lote-item-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* Badges informativas nas linhas de highlights */
            .lote-norm-badge {
                display: inline-block;
                font-size: 0.72em;
                background: rgba(56, 189, 248, 0.18);
                color: #38bdf8;
                border: 1px solid rgba(56, 189, 248, 0.3);
                border-radius: 4px;
                padding: 1px 4px;
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
                background: rgba(56, 189, 248, 0.08);
                border-color: rgba(56, 189, 248, 0.3);
                transform: translateX(4px);
            }
            .lote-proto-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 6px;
            }
            .lote-proto-title {
                font-weight: 700;
                font-size: 13px;
                color: #f8fafc;
            }
            .lote-proto-badge {
                font-size: 10px;
                font-weight: 700;
                color: #38bdf8;
                background: rgba(56, 189, 248, 0.15);
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
        `;
        document.head.appendChild(style);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 8. INTEGRAÇÃO COM O APP E SOBRECARGA DO PARSER
    // ──────────────────────────────────────────────────────────────────────────

    function initLotePro() {
        injectLoteProStyles();
        createIntellisensePopup();
        injectLoteToolbarAndFooter();

        const textarea = document.getElementById('fast-input');
        if (!textarea) return;

        // Monitor de digitação e navegação pelo teclado
        textarea.addEventListener('input', () => {
            handleIntellisenseInput(textarea);
            updateLiveStats();
        });

        textarea.addEventListener('keydown', (e) => {
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
            }
        });

        textarea.addEventListener('scroll', () => {
            hideIntellisense();
        });

        textarea.addEventListener('blur', () => {
            setTimeout(hideIntellisense, 200);
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
        if (modeFastEl) {
            modeFastEl.addEventListener('change', () => {
                installSmartValidationHook();
                setTimeout(updateLiveStats, 100);
            });
        }

        function updateLiveStats() {
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
        openGuideModal
    };

})();
