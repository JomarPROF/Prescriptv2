/* ==========================================================================
   ARQUIVO: voz.js
   FUNÇÃO: Motor de Inteligência Artificial, NLP e Match ESTRITO de Banco
   ========================================================================== */

window.VoiceModule = {
    recognition: null,
    isListening: false,
    initialized: false,

    init() {
        if (this.initialized) return;
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'pt-BR';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isListening = true;
                if(App.DOM && App.DOM.btnVoicePrescribe) App.DOM.btnVoicePrescribe.classList.add('mic-listening');
                if(App.showNotification) App.showNotification("🎙️ Ouvindo... Dite a medicação e os horários.", "info");
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.process(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error("Erro voz:", event.error);
                let msg = "Erro desconhecido.";
                if (event.error === 'not-allowed') msg = "Permissão negada. Use Live Server ou HTTPS.";
                else if (event.error === 'no-speech') msg = "Nenhum som detectado. Fale mais perto.";
                else if (event.error === 'network') msg = "Sem conexão com a internet.";
                if(App.showNotification) App.showNotification(`Erro: ${msg}`, "error");
                this.stop();
            };

            this.recognition.onend = () => this.stop();
            this.initialized = true;
        }
    },

    toggle() {
        if (!this.initialized) this.init(); 
        
        if(!App.DOM.patientInput.value.trim()) {
            if(App.showNotification) App.showNotification("⚠️ Adicione o nome do paciente primeiro.", "warning");
            if(App.DOM.patientInput) App.DOM.patientInput.focus();
            return;
        }

        if (!this.recognition) {
            if(App.showNotification) App.showNotification("Navegador não suportado para voz.", "warning");
            return;
        }
        
        if (this.isListening) {
            this.stop();
        } else {
            try { this.recognition.start(); } catch(e) { console.error(e); }
        }
    },

    stop() {
        this.isListening = false;
        if(App.DOM && App.DOM.btnVoicePrescribe) App.DOM.btnVoicePrescribe.classList.remove('mic-listening');
        try { this.recognition.stop(); } catch(e) {}
    },

    levenshtein(a, b) {
        if(a.length === 0) return b.length; if(b.length === 0) return a.length;
        var matrix = [];
        for(let i = 0; i <= b.length; i++) matrix[i] = [i];
        for(let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for(let i = 1; i <= b.length; i++){
            for(let j = 1; j <= a.length; j++){
                if(b.charAt(i-1) == a.charAt(j-1)) matrix[i][j] = matrix[i-1][j-1];
                else matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
            }
        }
        return matrix[b.length][a.length];
    },

    getSimilarity(str1, str2) {
        let longer = str1; let shorter = str2;
        if (str1.length < str2.length) { longer = str2; shorter = str1; }
        let longerLength = longer.length; if (longerLength == 0) return 1.0;
        return (longerLength - this.levenshtein(longer, shorter)) / parseFloat(longerLength);
    },

    findBestMedMatch(spokenText) {
        if(!spokenText) return null;
        spokenText = spokenText.toUpperCase().trim();
        
        // Remove palavras que confundem a IA (como quantidades e horários) para isolar o nome do remédio
        let drugOnlyText = spokenText.replace(/\b(\d+(?:[.,]\d+)?|COMPRIMIDOS?|CPS?|GOTAS?|GTS?|AMPOLAS?|ML|MG|DE|PELA|PELO|A|À|E|NO|NA|TOMAR|VIA|ORAL|MANH[AÃ]|TARDE|NOITE|CEDO|DIA|DORMIR|DEITAR|HORAS?|CADA|EM)\b/gi, ' ').replace(/\s+/g, ' ').trim();
        
        let allMedsFlat = typeof App.getAllMedsFlat === 'function' ? App.getAllMedsFlat() : [];
        if(allMedsFlat.length === 0) return null;
        
        let bestMed = null;
        let highestSim = 0;

        for (let med of allMedsFlat) {
            let medClean = med.toUpperCase();
            // Pega a base do nome do remédio sem os MG/ML para comparar (Ex: "DIAZEPAM 10 MG" -> "DIAZEPAM")
            let baseName = medClean.replace(/\s*\d+(?:[.,]\d+)?\s*(?:MG|ML|G|UI|MCG|%).*$/i, '').trim(); 
            
            // 1. MATCH EXATO E PODEROSO: Se a palavra dita contiver o nome base inteiro
            if (drugOnlyText.includes(baseName) || baseName === drugOnlyText) {
                let score = 90;
                // Bônus se acertou os miligramas também
                let dosageMatch = medClean.match(/\d+(?:[.,]\d+)?\s*(?:MG|ML|G|UI|MCG|%)/i);
                if (dosageMatch && spokenText.includes(dosageMatch[0])) {
                    score = 100;
                }
                if (score > highestSim) { highestSim = score; bestMed = med; }
            } 
            else {
                // 2. FUZZY MATCH SEVERO: Verifica palavra por palavra
                let spokenWords = drugOnlyText.split(' ');
                let baseWords = baseName.split(' ');
                let matchCount = 0;

                for (let bw of baseWords) {
                    if (bw.length < 3) continue; // Pula "DE", "DO", etc.
                    for (let sw of spokenWords) {
                        if (sw.length < 3) continue;
                        let sim = this.getSimilarity(sw, bw);
                        // Tolerância de 70% (permite pequenos erros como "Clonazepan" ou "Rizperidona")
                        if (sim >= 0.70) { 
                            matchCount++;
                            break; 
                        }
                    }
                }
                
                let validBaseWordsCount = baseWords.filter(w => w.length >= 3).length;
                if (validBaseWordsCount > 0) {
                    let score = (matchCount / validBaseWordsCount) * 85; 
                    if (score > highestSim) {
                        highestSim = score;
                        bestMed = med;
                    }
                }
            }
        }

        // ==========================================
        // TRAVA DE SEGURANÇA ESTRITA (GATEKEEPER)
        // Se a similaridade for menor que 60 pontos, o sistema RECUSA a prescrição.
        // ==========================================
        return highestSim >= 60 ? bestMed : null;
    },

    process(transcript) {
        try {
            let text = transcript.toLowerCase() + " ";
            text = text.replace(/^(prescrever|prescreva|receita de|adicionar|colocar|passar|eu quero)\s+/i, '');

            let predictedType = "PILL";
            if (text.match(/\b(gota|gotas|ml|mililitro)\b/i)) predictedType = "LIQUID";
            if (text.match(/\b(ampola|ampolas|injeção|injetável)\b/i)) predictedType = "INJECT";

            let normalizedText = text
                .replace(/miligramas?/gi, 'MG').replace(/mililitros?/gi, 'ML')
                .replace(/\bmeio\b/gi, '0.5').replace(/\bmetade\b/gi, '0.5')
                .replace(/\buma?\b/gi, '1').replace(/\bduas?\b/gi, '2')
                .replace(/\bdois\b/gi, '2').replace(/\btrês\b/gi, '3')
                .replace(/\btres\b/gi, '3').replace(/\bquatro\b/gi, '4')
                .replace(/\bcinco\b/gi, '5').replace(/\bseis\b/gi, '6')
                .replace(/\bsete\b/gi, '7').replace(/\boito\b/gi, '8')
                .replace(/\bnove\b/gi, '9').replace(/\bdez\b/gi, '10')
                .replace(/\bonze\b/gi, '11').replace(/\bdoze\b/gi, '12')
                .replace(/\bquinze\b/gi, '15').replace(/\bvinte\b/gi, '20')
                .replace(/\btrinta\b/gi, '30').replace(/\bquarenta\b/gi, '40')
                .replace(/\bcinquenta\b/gi, '50').replace(/\bcem\b/gi, '100')
                .replace(/vírgula/gi, '.').toUpperCase().trim();
                
            normalizedText = normalizedText.replace(/(\d+)\s*MG/g, '$1 MG');
            
            if(typeof App.expandMedName === 'function') {
                normalizedText = App.expandMedName(normalizedText);
            }

            // BUSCA ESTREITA NO BANCO (Trava de Segurança)
            let bestMed = this.findBestMedMatch(normalizedText);

            if (!bestMed) {
                if(App.showNotification) App.showNotification("Palavra ignorada. Medicação não encontrada na lista.", "error");
                return; // INTERROMPE O PROCESSO E PROTEGE A RECEITA
            }

            let finalType = typeof App.getMedType === 'function' ? App.getMedType(bestMed) : predictedType;

            // Isola o remédio da frase para sobrar SÓ horários
            let remainingText = normalizedText;
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            bestMed.split(' ').forEach(token => {
                remainingText = remainingText.replace(new RegExp(`\\b${escapeRegExp(token)}\\b`, 'gi'), '');
            });

            // ========================================================
            // EXTRATOR MULTI-HORÁRIOS INTELIGENTE
            // ========================================================
            let m = 0, t = 0, n = 0;
            
            let numMatch = remainingText.match(/\b(\d+(?:\.\d+)?)\b\s*(?:COMPRIMIDOS?|CPS?|GOTAS?|GTS?|AMPOLAS?|ML|MG|DE|A|CADA|EM|PELA|PELO|A|À|E|NO|NA|TOMAR|\s)*(?:8|12|MANH[AÃ]|TARDE|NOITE|CEDO|DIA|DORMIR|DEITAR|HORAS?)/i);
            let numbersInString = remainingText.match(/\b(\d+(?:\.\d+)?)\b/g);
            let globalQty = numMatch ? parseFloat(numMatch[1]) : (numbersInString ? parseFloat(numbersInString[0]) : 1);

            let is8 = remainingText.match(/\b8\s*\/?\s*8\b/) || remainingText.match(/\b8\s*EM\s*8\b/) || remainingText.match(/\b8\s*HORAS?\b/);
            let is12 = remainingText.match(/\b12\s*\/?\s*12\b/) || remainingText.match(/\b12\s*EM\s*12\b/) || remainingText.match(/\b12\s*HORAS?\b/);

            if (is8) {
                m = globalQty; t = globalQty; n = globalQty;
            } 
            else if (is12) {
                m = globalQty; n = globalQty;
            } 
            else {
                const findQtyForShift = (shiftPatternStr) => {
                    let regexBefore = new RegExp(`\\b(\\d+(?:[.,]\\d+)?)\\b\\s*(?:COMPRIMIDOS?|CPS?|GOTAS?|GTS?|AMPOLAS?|ML|MG|DE|PELA|PELO|A|À|E|NO|NA|\\s)*(?:${shiftPatternStr})`, 'i');
                    let matchBefore = remainingText.match(regexBefore);
                    if (matchBefore) return parseFloat(matchBefore[1].replace(',', '.'));

                    let regexAfter = new RegExp(`(?:${shiftPatternStr})\\s*(?:COMPRIMIDOS?|CPS?|GOTAS?|GTS?|AMPOLAS?|ML|MG|DE|PELA|PELO|A|À|E|NO|NA|TOMAR|\\s)*\\b(\\d+(?:[.,]\\d+)?)\\b`, 'i');
                    let matchAfter = remainingText.match(regexAfter);
                    if (matchAfter) return parseFloat(matchAfter[1].replace(',', '.'));

                    let shiftRegex = new RegExp(`\\b(?:${shiftPatternStr})\\b`, 'i');
                    if (remainingText.match(shiftRegex)) return globalQty; 

                    return 0; 
                };

                m = findQtyForShift("MANH[AÃ]|CEDO|DIA");
                t = findQtyForShift("TARDE");
                n = findQtyForShift("NOITE|DORMIR|DEITAR");
            }
            
            if (m === 0 && t === 0 && n === 0) {
                if (finalType !== "INJECT") m = globalQty; 
            }

            let rawData = { qty: 0, m: m, t: t, n: n, type: finalType };
            
            if (finalType === "INJECT") {
                let days = 30; 
                if (remainingText.match(/\b15\b/)) days = 15;
                if (remainingText.match(/\b20\b/)) days = 20;
                if (remainingText.match(/\b21\b/)) days = 21;
                if (remainingText.match(/\b28\b/)) days = 28;
                rawData = { qty: 0, m: globalQty, t: days, n: 0, type: "INJECT" };
            }
            
            if(typeof App.calcPoso === 'function') {
                const poso = App.calcPoso(rawData.m, rawData.t, rawData.n, bestMed, finalType);
                App.addItem(bestMed, poso, "Uso contínuo", rawData);
                App.render();
                if(App.showNotification) App.showNotification(`🎙️ Adicionado via voz: ${bestMed}`, "success");
            }

        } catch (err) {
            console.error("Erro interno no processamento de voz:", err);
            if(App.showNotification) App.showNotification("Não consegui entender a dosagem. Pode repetir?", "error");
        }
    }
};
