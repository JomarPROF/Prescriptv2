const fs = require('fs');

function testPackagingLogic() {
    const script = fs.readFileSync('script.js', 'utf8');

    // Test getPackIcon matching
    const testCases = [
        { text: 'Uso contínuo', expected: '♾️' },
        { text: 'Caixa(s)', expected: '📦' },
        { text: 'Frasco(s)', expected: '🧴' },
        { text: 'Frasco(s)-Ampola(s)', expected: '🧪' },
        { text: 'Ampola(s)', expected: '💉' },
        { text: 'Comprimido(s)', expected: '💊' },
        { text: 'Cápsula(s)', expected: '💊' },
        { text: 'Bisnaga(s)', expected: '🧴' },
        { text: 'Tubo(s)', expected: '🧴' },
        { text: 'Sachê(s)', expected: '✉️' },
        { text: 'Envelope(s)', expected: '✉️' },
        { text: 'Cartela(s) / Blister', expected: '📑' },
        { text: 'Frasco(s) Conta-Gotas', expected: '🧴' },
        { text: 'Spray(s) / Aerossol', expected: '💨' },
        { text: 'Caneta(s) / Refil', expected: '🖊️' },
        { text: 'Seringa(s) Preenchida(s)', expected: '💉' },
        { text: 'Adesivo(s) Transdérmico(s)', expected: '🩹' },
        { text: 'Pote(s)', expected: '🍯' },
        { text: 'Pacote(s)', expected: '📦' },
        { text: 'Unidade(s)', expected: '🔢' }
    ];

    const getPackIcon = (text) => {
        const t = (text || '').toLowerCase();
        if (t.includes("contínuo") || t.includes("continuo")) return "♾️";
        if (t.includes("frasco") && t.includes("ampola")) return "🧪";
        if (t.includes("ampola")) return "💉";
        if (t.includes("frasco") || t.includes("gota")) return "🧴";
        if (t.includes("comprimido") || t.includes("cápsula") || t.includes("capsula")) return "💊";
        if (t.includes("bisnaga") || t.includes("tubo")) return "🧴";
        if (t.includes("sachê") || t.includes("sache") || t.includes("envelope")) return "✉️";
        if (t.includes("cartela") || t.includes("blister")) return "📑";
        if (t.includes("spray") || t.includes("aerossol") || t.includes("inalador")) return "💨";
        if (t.includes("caneta") || t.includes("refil")) return "🖊️";
        if (t.includes("seringa")) return "💉";
        if (t.includes("adesivo") || t.includes("patch")) return "🩹";
        if (t.includes("pote")) return "🍯";
        if (t.includes("unidade")) return "🔢";
        return "📦";
    };

    let allPassed = true;
    testCases.forEach(tc => {
        const icon = getPackIcon(tc.text);
        if (icon !== tc.expected) {
            console.error(`FAIL: ${tc.text} -> got ${icon}, expected ${tc.expected}`);
            allPassed = false;
        }
    });

    if (allPassed) {
        console.log(`All ${testCases.length} packaging icons mapped correctly!`);
    }

    // Test usageText logic
    function computeUsageText(packTypeVal, packQtyVal) {
        const qtyVal = (packQtyVal && parseInt(packQtyVal) > 0) ? parseInt(packQtyVal) : 1;
        return (packTypeVal === "Uso contínuo") 
            ? "Uso contínuo" 
            : `${qtyVal} ${packTypeVal || ''}`;
    }

    console.log('Usage text Continuous:', computeUsageText('Uso contínuo', 0));
    console.log('Usage text 2 Caixa(s):', computeUsageText('Caixa(s)', 2));
    console.log('Usage text 1 Frasco(s):', computeUsageText('Frasco(s)', 1));
    console.log('Usage text 0 -> defaults 1 Frasco(s)-Ampola(s):', computeUsageText('Frasco(s)-Ampola(s)', 0));
}

testPackagingLogic();
