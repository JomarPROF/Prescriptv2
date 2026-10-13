
    document.addEventListener('DOMContentLoaded', () => {
        window.addEventListener('wheel', (e) => {
            const wrapper = e.target.closest('.custom-spin-wrapper');
            if (wrapper) {
                const input = wrapper.querySelector('input[type="number"]');
                if (input) {
                    e.preventDefault(); e.stopImmediatePropagation(); 
                    const btnFracao = document.getElementById('mode-fraction');
                    const modoFracaoAtivo = btnFracao ? btnFracao.checked : false;
                    let val = parseFloat(input.value) || 0;
                    const min = parseFloat(input.getAttribute('min')) || 0;
                    const passo = modoFracaoAtivo ? 0.25 : 1;
                    
                    if (!modoFracaoAtivo && val % 1 !== 0) val = Math.floor(val);
                    if (e.deltaY < 0) val += passo; else val -= passo; 
                    if (val < min) val = min;
                    
                    if (modoFracaoAtivo) val = Number(val.toFixed(2));
                    else val = Math.round(val);
                    
                    input.value = val;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }, { passive: false, capture: true });
    });

    // ⚠️ SEGURANÇA: Chave movida para variável. Em produção, use um proxy server-side (Firebase Cloud Function).
    // Revogar esta chave no Google Cloud Console e gerar uma nova restrita.
    const GEMINI_API_KEY = "AIzaSyB6hsQkXzEEtkVbXA8jMEA3TpoMseg1hZ8"; 
    const contextoDoSistema = `Você é a IA de suporte de um sistema de prescrição médica. Responda APENAS em texto puro, sem usar tags HTML, sem markdown com links, e sem código JavaScript.`;

    window.toggleChat = function(e) { 
        if(e) { e.stopPropagation(); e.preventDefault(); }
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            chatWindow.classList.toggle('ativo'); 
        }
    }

    window.closeChat = function(e) {
        if(e) { e.stopPropagation(); e.preventDefault(); }
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow) {
            chatWindow.classList.remove('ativo'); 
        }
    }
    
    function verificarEnter(event) { if (event.key === "Enter") enviarMensagem(); }

    window.enviarMensagem = async function() {
        const inputField = document.getElementById('userInput');
        const textoUsuario = inputField.value.trim();
        if (textoUsuario === "") return;

        adicionarBalaoNaTela(textoUsuario, 'user-msg');
        inputField.value = ""; 
        const idDigitando = "digitando-" + Date.now();
        
        adicionarBalaoNaTela("<div class='typing-indicator'><span></span><span></span><span></span></div>", 'bot-msg', idDigitando);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        try {
            const respostaDaAPI = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: contextoDoSistema + "\n\n" + textoUsuario }] }] }) });
            const dados = await respostaDaAPI.json();
            removerBalao(idDigitando);
            if (dados.candidates && dados.candidates.length > 0) adicionarBalaoNaTela(dados.candidates[0].content.parts[0].text, 'bot-msg');
            else adicionarBalaoNaTela("Erro. Tente de novo.", 'bot-msg');
        } catch (erro) {
            removerBalao(idDigitando);
            adicionarBalaoNaTela("Erro de conexão.", 'bot-msg');
        }
    }

    function adicionarBalaoNaTela(texto, classeEstilo, idOpcional = null) {
        const chatBody = document.getElementById('chatBody');
        const div = document.createElement('div');
        div.className = `mensagem ${classeEstilo}`;
        // CORREÇÃO DE SEGURANÇA: Sanitiza HTML para prevenir XSS
        if (idOpcional && idOpcional.startsWith('digitando-')) {
            div.innerHTML = texto; // Typing indicator usa HTML interno seguro
        } else if (classeEstilo === 'user-msg') {
            div.textContent = texto; // Mensagem do usuário: nunca permite HTML
        } else {
            // Bot: escapa HTML mas permite quebras de linha
            const escaped = texto.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            div.innerHTML = escaped.replace(/\n/g, '<br>');
        }
        if (idOpcional) div.id = idOpcional;
        chatBody.appendChild(div);
        setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 50);
    }

    function removerBalao(id) { const balao = document.getElementById(id); if (balao) balao.remove(); }

    document.addEventListener('click', function(event) {
        const chatWindow = document.getElementById('chatWindow');
        const btnOpenChat = document.querySelector('.pro-btn-ai');
        if (chatWindow && chatWindow.classList.contains('ativo')) {
            if (!chatWindow.contains(event.target) && btnOpenChat && !btnOpenChat.contains(event.target)) {
                chatWindow.classList.remove('ativo');
            }
        }
    });

    window.toggleSectionSeguro = function(id) {
        const section = document.getElementById(id);
        if (section) {
            section.classList.toggle('collapsed');
        }
    };
