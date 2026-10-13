/* ==========================================================================
   PREVIEW ZOOM & PAN
   --------------------------------------------------------------------------
   • Clique + segure + arraste  → move apenas o pré-visualizador da receita
   • Bolinha do mouse (scroll)  → zoom centrado no ponteiro
   • Botão do meio + arraste    → move mesmo sobre campos editáveis
   • Duplo clique no fundo      → volta para 100%
   • HUD com percentual, +/−, "ajustar à tela" e bloqueio (cadeado)
   Módulo independente: não altera a renderização das receitas.
   ========================================================================== */
(function () {
    'use strict';

    var MIN_ZOOM = 0.25;
    var MAX_ZOOM = 5;
    var BTN_STEP = 1.2;
    var KEEP_VISIBLE = 120;     // px mínimos da receita que ficam sempre visíveis
    var DRAG_THRESHOLD = 3;     // px antes de considerar arraste (preserva cliques)
    var LS_LOCK = 'pz_preview_locked';
    var LS_HINT = 'pz_preview_hint_seen';

    var ICONS = {
        unlocked: '<svg class="pz-ico pz-ico-unlocked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 7.75-1.4"/></svg>',
        locked: '<svg class="pz-ico pz-ico-locked" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/></svg>',
        minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 12h12"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>',
        fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>'
    };

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    function init() {
        var pane = document.querySelector('.preview-pane');
        var el = document.getElementById('preview-container');
        if (!pane || !el || pane.dataset.pzReady) return;
        pane.dataset.pzReady = '1';

        /* ---------------- Estado ---------------- */
        var baseScale = readBaseScale(el);           // escala original do CSS (ex.: 1.3) = "100%"
        var baseMeasured = pane.offsetWidth > 0;     // só é confiável com o painel visível
        var target = { s: 1, x: 0, y: 0 };
        var current = { s: 1, x: 0, y: 0 };
        var locked = localStorage.getItem('pz_unlock_default') !== '1'; 
        var rafId = null;
        var drag = null;
        var suppressClick = false;
        var activeTimer = null;

        /* ---------------- UI ---------------- */
        var frame = document.createElement('div');
        frame.className = 'pz-frame';

        var currentLimit = parseInt(localStorage.getItem('cerebrum_meds_limit'));
        if (isNaN(currentLimit) || currentLimit < 1 || currentLimit > 8) currentLimit = 5;

        var hud = document.createElement('div');
        hud.className = 'pz-hud pz-intro';
        hud.id = 'pz-hud';
        hud.setAttribute('role', 'toolbar');
        hud.setAttribute('aria-label', 'Controles de zoom do pré-visualizador');
        hud.innerHTML =
            '<div class="pz-group pz-limit-group" id="pz-limit-group">' +
                '<button type="button" class="pz-btn" id="pz-limit-toggle" title="Configurar limite de itens por folha" aria-label="Configurar limite de itens por folha">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' +
                '</button>' +
                '<div class="pz-limit-popover" id="pz-limit-popover">' +
                    '<span style="font-size: 13px; font-weight: 600; color: #cbd5e1; display:flex; align-items:center; gap: 6px; margin-bottom: 2px;">' +
                        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>' +
                        'Itens por Folha' +
                    '</span>' +
                    '<span style="font-size: 11px; color: #64748b; margin-bottom: 8px;">Ajusta automaticamente a fonte da receita</span>' +
                    '<div style="display:flex; align-items:center; gap:12px;">' +
                        '<input type="range" id="pz-limit-slider" min="1" max="8" value="' + currentLimit + '" class="pz-slider">' +
                        '<span id="pz-limit-val" style="font-size: 16px; font-weight: 800; color: #38bdf8; min-width: 14px; text-align:center; transition: all 0.2s ease;">' + currentLimit + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="pz-group hidden" id="preview-floating-actions">' +
                '<button type="button" class="pz-btn" id="btn-copy-preview" onclick="window.App && window.App.copyPrescription && window.App.copyPrescription()" title="Copiar prescrição formatada" aria-label="Copiar prescrição">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' +
                    '</svg>' +
                '</button>' +
            '</div>' +
            '<span class="pz-sep"></span>' +
            '<div class="pz-group" id="nav-controls">' +
                '<button type="button" class="pz-btn" id="prev-page" title="Página anterior" onclick="window.App && window.App.changePage && window.App.changePage(-1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' +
                '<span class="pz-pct" style="cursor:default; min-width: 85px; text-align:center;"><span class="pz-pct-val" id="page-indicator" style="font-size: 13px;">Página 1 de 1</span></span>' +
                '<button type="button" class="pz-btn" id="next-page" title="Próxima página" onclick="window.App && window.App.changePage && window.App.changePage(1)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>' +
            '</div>' +
            '<button type="button" class="pz-btn pz-lock" id="pz-lock-btn">' +
                ICONS.unlocked + ICONS.locked +
                '<span class="pz-lock-label">Bloqueado</span>' +
            '</button>' +
            '<span class="pz-sep"></span>' +
            '<div class="pz-group">' +
                '<button type="button" class="pz-btn" id="pz-zoom-out" title="Diminuir zoom" aria-label="Diminuir zoom">' + ICONS.minus + '</button>' +
                '<button type="button" class="pz-pct" id="pz-zoom-pct" title="Clique para voltar a 100%" aria-label="Nível de zoom">' +
                    '<span class="pz-pct-val" id="pz-zoom-val">100%</span>' +
                    '<span class="pz-pct-track"><span class="pz-pct-fill" id="pz-zoom-fill"></span></span>' +
                '</button>' +
                '<button type="button" class="pz-btn" id="pz-zoom-in" title="Aumentar zoom" aria-label="Aumentar zoom">' + ICONS.plus + '</button>' +
                '<span class="pz-sep"></span>' +
                '<button type="button" class="pz-btn" id="pz-zoom-fit" title="Ajustar receita à tela" aria-label="Ajustar à tela">' + ICONS.fit + '</button>' +
            '</div>';

        var pageNavHud = document.createElement('div');
        pageNavHud.id = 'pz-page-nav-hud';
        pageNavHud.className = 'pz-page-nav-hud';

        var isNearHud = false;
        var hideNavTimer = null;

        function setNavVisibility(near) {
            isNearHud = near;
            if (hideNavTimer) {
                clearTimeout(hideNavTimer);
                hideNavTimer = null;
            }
            if (near) {
                if (pageNavHud.classList.contains('has-pages')) {
                    pageNavHud.classList.add('is-visible');
                }
            } else {
                hideNavTimer = setTimeout(function() {
                    pageNavHud.classList.remove('is-visible');
                }, 120);
            }
        }

        function updatePageNavPills() {
            var pageInd = hud.querySelector('#page-indicator');
            if (!pageInd) return;
            var text = (pageInd.innerText || pageInd.textContent || '').trim();
            var match = text.match(/(\d+)\s*(?:de|\/)\s*(\d+)/i);
            if (match) {
                var current = parseInt(match[1]);
                var total = parseInt(match[2]);
                if (total > 1) {
                    var html = '';
                    for (var i = 1; i <= total; i++) {
                        var cls = (i === current) ? 'pz-page-btn is-active' : 'pz-page-btn';
                        var num = (i < 10 ? '0' : '') + i;
                        html += '<button type="button" class="' + cls + '" data-page="' + (i - 1) + '" title="Página ' + i + '">' + num + '</button>';
                    }
                    pageNavHud.innerHTML = html;
                    pageNavHud.classList.add('has-pages');
                    if (isNearHud) {
                        pageNavHud.classList.add('is-visible');
                    }
                } else {
                    pageNavHud.innerHTML = '';
                    pageNavHud.classList.remove('has-pages', 'is-visible');
                }
            } else {
                pageNavHud.innerHTML = '';
                pageNavHud.classList.remove('has-pages', 'is-visible');
            }
        }
        window.updatePageNavPills = updatePageNavPills;

        pageNavHud.addEventListener('click', function(e) {
            var btn = e.target.closest('.pz-page-btn');
            if (btn && btn.dataset.page !== undefined) {
                var pIdx = parseInt(btn.dataset.page);
                if (window.App) {
                    if (typeof window.App.goToPage === 'function') {
                        window.App.goToPage(pIdx);
                    } else if (typeof window.App.changePage === 'function') {
                        var diff = pIdx - (window.App.currentPage || 0);
                        window.App.changePage(diff);
                    } else {
                        window.App.currentPage = pIdx;
                        if (window.App.render) window.App.render();
                    }
                }
            }
        });

        // Detecção de proximidade com a barra de zoom / passar páginas
        function checkProximity(e) {
            if (!pageNavHud.classList.contains('has-pages')) return;
            if (!e || typeof e.clientX === 'undefined') return;

            var hudRect = hud.getBoundingClientRect();
            if (!hudRect || hudRect.width === 0) return;

            var x = e.clientX;
            var y = e.clientY;

            // Distância até a barra de zoom / passar páginas
            var dxHud = Math.max(hudRect.left - x, 0, x - hudRect.right);
            var dyHud = Math.max(hudRect.top - y, 0, y - hudRect.bottom);
            var distHud = Math.sqrt(dxHud * dxHud + dyHud * dyHud);

            // Distância até o próprio seletor de páginas flutuante
            var distPageNav = 999;
            if (pageNavHud.classList.contains('is-visible')) {
                var pRect = pageNavHud.getBoundingClientRect();
                if (pRect && pRect.width > 0) {
                    var dxP = Math.max(pRect.left - x, 0, x - pRect.right);
                    var dyP = Math.max(pRect.top - y, 0, y - pRect.bottom);
                    distPageNav = Math.sqrt(dxP * dxP + dyP * dyP);
                }
            }

            // Exibe se o mouse estiver a até 85px da barra ou 60px do seletor
            var isClose = distHud < 85 || distPageNav < 60;
            setNavVisibility(isClose);
        }

        pane.addEventListener('pointermove', checkProximity);
        pane.addEventListener('pointerleave', function() {
            setNavVisibility(false);
        });

        hud.addEventListener('mouseenter', function() {
            setNavVisibility(true);
        });
        pageNavHud.addEventListener('mouseenter', function() {
            setNavVisibility(true);
        });

        var pageInd = hud.querySelector('#page-indicator');
        if (pageInd) {
            var pageObserver = new MutationObserver(updatePageNavPills);
            pageObserver.observe(pageInd, { childList: true, characterData: true, subtree: true });
        }

        var hint = document.createElement('div');
        hint.className = 'pz-hint';
        hint.innerHTML =
            '<span><span class="pz-chip">Arraste</span>para mover</span>' +
            '<span class="pz-hint-dot"></span>' +
            '<span><span class="pz-chip">Scroll</span>para zoom</span>';

        pane.appendChild(frame);
        pane.appendChild(hint);
        pane.appendChild(hud);
        pane.appendChild(pageNavHud);
        pane.classList.add('pz-enabled');
        pane.scrollTop = 0;


        var limitGroup = hud.querySelector('#pz-limit-group');
        var limitSlider = hud.querySelector('#pz-limit-slider');
        var limitVal = hud.querySelector('#pz-limit-val');
        
        var updateSliderBg = function() {
            var val = (limitSlider.value - limitSlider.min) / (limitSlider.max - limitSlider.min) * 100;
            limitSlider.style.backgroundSize = val + '% 100%';
        };
        updateSliderBg();

        limitSlider.addEventListener('input', function(e) {
            updateSliderBg();
            var val = e.target.value;
            limitVal.innerText = val;
            limitVal.style.transform = 'scale(1.2)';
            limitVal.style.color = '#fff';
            clearTimeout(limitVal.popTimeout);
            limitVal.popTimeout = setTimeout(function() { 
                limitVal.style.transform = ''; 
                limitVal.style.color = '#38bdf8';
            }, 200);
            localStorage.setItem('cerebrum_meds_limit', val);
            if (window.App && window.App.render) window.App.render();
        });

        var limitToggle = hud.querySelector('#pz-limit-toggle');
        limitToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            limitGroup.classList.toggle('is-open');
        });

        document.addEventListener('click', function(e) {
            if (!limitGroup.contains(e.target)) {
                limitGroup.classList.remove('is-open');
            }
        });
        var lockBtn = hud.querySelector('#pz-lock-btn');
        var btnOut = hud.querySelector('#pz-zoom-out');
        var btnIn = hud.querySelector('#pz-zoom-in');
        var btnFit = hud.querySelector('#pz-zoom-fit');
        var btnPct = hud.querySelector('#pz-zoom-pct');
        var valEl = hud.querySelector('#pz-zoom-val');
        var fillEl = hud.querySelector('#pz-zoom-fill');

        /* ---------------- Geometria ---------------- */
        function readBaseScale(node) {
            var t = getComputedStyle(node).transform || 'none';
            var m = t.match(/^matrix\(([^,]+),\s*([^,]+)/);
            if (m) {
                var a = parseFloat(m[1]), b = parseFloat(m[2]);
                var s = Math.sqrt(a * a + b * b);
                if (s > 0) return s;
            }
            var sc = t.match(/scale\(\s*([\d.]+)/);
            if (sc) return parseFloat(sc[1]) || 1;
            return 1;
        }

        // Posição na tela do ponto de origem (topo-centro) SEM translação aplicada
        function layoutOrigin() {
            var r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2 - current.x, y: r.top - current.y };
        }

        // Calcula a translação para que o ponto da tela (cx, cy) fique fixo ao trocar de escala
        function zoomAt(newScale, cx, cy, immediate) {
            newScale = clamp(newScale, MIN_ZOOM, MAX_ZOOM);
            var o = layoutOrigin();
            var curTotal = baseScale * current.s;
            var lx = (cx - (o.x + current.x)) / curTotal;
            var ly = (cy - (o.y + current.y)) / curTotal;
            var newTotal = baseScale * newScale;
            target.s = newScale;
            target.x = cx - o.x - newTotal * lx;
            target.y = cy - o.y - newTotal * ly;
            constrain(o);
            commit(immediate);
        }

        // Impede que a receita seja arrastada para fora da área visível
        function constrain(o) {
            o = o || layoutOrigin();
            var p = pane.getBoundingClientRect();
            if (!p.width || !p.height) return;
            var total = baseScale * target.s;
            var w = el.offsetWidth * total;
            var h = el.offsetHeight * total;
            var keepX = Math.min(KEEP_VISIBLE, w / 2, p.width / 2);
            var keepY = Math.min(KEEP_VISIBLE, h / 2, p.height / 2);
            var minX = p.left + keepX - (o.x + w / 2);
            var maxX = p.right - keepX - (o.x - w / 2);
            var minY = p.top + keepY - (o.y + h);
            var maxY = p.bottom - keepY - o.y;
            if (minX <= maxX) target.x = clamp(target.x, minX, maxX);
            if (minY <= maxY) target.y = clamp(target.y, minY, maxY);
        }

        function visiblePage() {
            return el.querySelector(
                '.a4-page:not(.hidden), .lme-bg-page:not(.hidden), ' +
                '.ward-print-wrapper:not(.hidden) .ward-landscape-page, .a4-page-pro:not(.page-inactive-pro)'
            ) || el;
        }

        /* ---------------- Render / animação ---------------- */
        function apply() {
            if (!baseMeasured) return;
            el.style.transform =
                'translate(' + current.x.toFixed(2) + 'px,' + current.y.toFixed(2) + 'px) ' +
                'scale(' + (baseScale * current.s).toFixed(4) + ')';
        }

        function tick() {
            var k = 0.24;
            current.s += (target.s - current.s) * k;
            current.x += (target.x - current.x) * k;
            current.y += (target.y - current.y) * k;
            var done =
                Math.abs(target.s - current.s) < 0.0005 &&
                Math.abs(target.x - current.x) < 0.25 &&
                Math.abs(target.y - current.y) < 0.25;
            if (done) {
                current.s = target.s; current.x = target.x; current.y = target.y;
                rafId = null;
                apply();
                return;
            }
            apply();
            rafId = requestAnimationFrame(tick);
        }

        function commit(immediate) {
            if (immediate) {
                if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                current.s = target.s; current.x = target.x; current.y = target.y;
                apply();
            } else if (!rafId) {
                rafId = requestAnimationFrame(tick);
            }
            updateHud();
        }

        /* ---------------- HUD ---------------- */
        var lastPct = null;
        function updateHud() {
            var pct = Math.round(target.s * 100);
            if (pct !== lastPct) {
                valEl.textContent = pct + '%';
                lastPct = pct;
                var ratio = Math.log(target.s / MIN_ZOOM) / Math.log(MAX_ZOOM / MIN_ZOOM);
                fillEl.style.width = (clamp(ratio, 0, 1) * 100).toFixed(1) + '%';
                btnPct.classList.toggle('is-custom', pct !== 100);
            }
            btnOut.disabled = locked || target.s <= MIN_ZOOM + 1e-6;
            btnIn.disabled = locked || target.s >= MAX_ZOOM - 1e-6;
            btnFit.disabled = locked;
            btnPct.disabled = locked;
        }

        function pulseActive() {
            // Desativado: removido brilho intermitente que causava desconforto visual
        }

        function setLocked(v, silent) {
            locked = !!v;
            localStorage.setItem(LS_LOCK, locked ? '1' : '0');
            pane.classList.toggle('pz-locked', locked);
            hud.classList.toggle('is-locked', locked);
            lockBtn.title = locked
                ? 'Visualização bloqueada — clique para liberar mover e zoom'
                : 'Bloquear visualização (impede mover e dar zoom)';
            lockBtn.setAttribute('aria-pressed', locked ? 'true' : 'false');
            lockBtn.setAttribute('aria-label', lockBtn.title);
            if (locked) endDrag();
            updateHud();
            if (!silent) {
                var unl = lockBtn.querySelector('.pz-ico-unlocked');
                unl.classList.remove('pz-anim'); void unl.offsetWidth; unl.classList.add('pz-anim');
                if (window.App && typeof window.App.showNotification === 'function') {
                    window.App.showNotification(
                        locked ? 'Visualização da receita bloqueada.' : 'Mover e zoom liberados.',
                        'success'
                    );
                }
            }
        }

        function nudgeLocked() {
            if (hud.classList.contains('pz-shake')) return;
            hud.classList.add('pz-shake');
        }
        hud.addEventListener('animationend', function (e) {
            if (e.animationName === 'pzShake') hud.classList.remove('pz-shake');
            if (e.animationName === 'pzHudIn') hud.classList.remove('pz-intro');
        });

        /* ---------------- Ações ---------------- */
        function paneCenter() {
            var p = pane.getBoundingClientRect();
            return { x: p.left + p.width / 2, y: p.top + p.height / 2 };
        }

        function zoomBy(factor) {
            var c = paneCenter();
            zoomAt(target.s * factor, c.x, c.y, false);
        }

        function reset() {
            target.s = 1; target.x = 0; target.y = 0;
            commit(false);
        }

        function fit() {
            var page = visiblePage();
            var p = pane.getBoundingClientRect();
            var r = page.getBoundingClientRect();
            if (!r.width || !r.height || !p.width) return;
            var curTotal = baseScale * current.s;
            var w0 = r.width / curTotal, h0 = r.height / curTotal;
            var padX = 48, padTop = 40, padBottom = 96;   // deixa espaço para o HUD e a navegação
            var s = Math.min((p.width - padX * 2) / w0, (p.height - padTop - padBottom) / h0) / baseScale;
            s = clamp(s, MIN_ZOOM, MAX_ZOOM);
            var o = layoutOrigin();
            var lx = (r.left + r.width / 2 - (o.x + current.x)) / curTotal;
            var ly = (r.top - (o.y + current.y)) / curTotal;
            var newTotal = baseScale * s;
            target.s = s;
            target.x = (p.left + p.width / 2) - o.x - newTotal * lx;
            target.y = (p.top + padTop) - o.y - newTotal * ly;
            commit(false);
        }

        lockBtn.addEventListener('click', function () { setLocked(!locked); });
        btnIn.addEventListener('click', function () { if (!locked) zoomBy(BTN_STEP); });
        btnOut.addEventListener('click', function () { if (!locked) zoomBy(1 / BTN_STEP); });
        btnPct.addEventListener('click', function () { if (!locked) reset(); });
        btnFit.addEventListener('click', function () { if (!locked) fit(); });

        /* ---------------- Zoom pela bolinha ---------------- */
        pane.addEventListener('wheel', function (e) {
            if (hud.contains(e.target)) { e.preventDefault(); }
            // Mantém o comportamento das caixas numéricas customizadas
            if (e.target.closest && e.target.closest('.custom-spin-wrapper')) return;
            e.preventDefault();
            if (locked) { nudgeLocked(); return; }

            var dy = e.deltaY;
            if (e.deltaMode === 1) dy *= 16;
            else if (e.deltaMode === 2) dy *= pane.clientHeight;
            var sensitivity = e.ctrlKey ? 0.01 : 0.0018;   // ctrl+wheel = pinça do touchpad
            dy = clamp(dy, -160, 160);
            var factor = Math.exp(-dy * sensitivity);
            zoomAt(target.s * factor, e.clientX, e.clientY, false);
        }, { passive: false });

        /* ---------------- Arrastar ---------------- */
        function isInteractive(t) {
            return !!(t.closest && t.closest(
                'button, a, input, textarea, select, label, [contenteditable="true"], ' +
                '.pz-hud, .pz-hint, .nav-controls, .preview-floating-bar, #smart-lock-btn, #cerebrum-floating-toolbar'
            ));
        }

        pane.addEventListener('pointerdown', function (e) {
            var middle = e.button === 1;
            if (e.button !== 0 && !middle) return;
            if (hud.contains(e.target)) return;
            if (!middle && isInteractive(e.target)) return;
            if (middle) e.preventDefault();               // evita o auto-scroll do Windows
            if (locked) { if (middle) nudgeLocked(); return; }

            drag = {
                id: e.pointerId,
                sx: e.clientX, sy: e.clientY,
                ox: target.x, oy: target.y,
                moved: false
            };
        });

        window.addEventListener('pointermove', function (e) {
            if (!drag || e.pointerId !== drag.id) return;
            var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
            if (!drag.moved) {
                if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
                drag.moved = true;
                pane.classList.add('pz-dragging');
                try { pane.setPointerCapture(drag.id); } catch (_) {}
                var sel = window.getSelection && window.getSelection();
                if (sel && sel.removeAllRanges) sel.removeAllRanges();
            }
            target.x = drag.ox + dx;
            target.y = drag.oy + dy;
            constrain();
            commit(true);
        });

        function endDrag(e) {
            if (!drag || (e && e.pointerId !== drag.id)) return;
            if (drag.moved) {
                suppressClick = true;
                setTimeout(function () { suppressClick = false; }, 0);
            }
            try { pane.releasePointerCapture(drag.id); } catch (_) {}
            pane.classList.remove('pz-dragging');
            drag = null;
        }
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
        window.addEventListener('blur', function () { endDrag(); });

        // Não dispara cliques acidentais ao terminar um arraste
        pane.addEventListener('click', function (e) {
            if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; }
        }, true);

        // Bloqueia o "arrastar imagem" nativo (logo, carimbo, etc.)
        pane.addEventListener('dragstart', function (e) {
            if (el.contains(e.target)) e.preventDefault();
        });

        // Botão do meio não abre o auto-scroll
        pane.addEventListener('auxclick', function (e) { if (e.button === 1) e.preventDefault(); });

        // Duplo clique passa a página (se houver) ou volta para 100% (se fora da folha)
        pane.addEventListener('dblclick', function (e) {
            if (locked || isInteractive(e.target)) return;
            
            var nav = document.getElementById('nav-controls');
            var hasPages = nav && !nav.classList.contains('hidden');
            
            if (hasPages && window.App && window.App.changePage) {
                var rect = pane.getBoundingClientRect();
                var mid = rect.left + rect.width / 2;
                if (e.clientX < mid) {
                    window.App.changePage(-1);
                } else {
                    window.App.changePage(1);
                }
            } else {
                if (!e.target.closest('.a4-page, .lme-bg-page, .ward-print-wrapper, .ward-landscape-page, .a4-page-pro')) {
                    reset();
                }
            }
        });

        // Se o navegador rolar o painel (ex.: foco num campo editável), converte em translação
        pane.addEventListener('scroll', function () {
            var sx = pane.scrollLeft, sy = pane.scrollTop;
            if (!sx && !sy) return;
            pane.scrollLeft = 0; pane.scrollTop = 0;
            target.x -= sx; target.y -= sy;
            commit(true);
        });

        // Mantém a receita visível ao redimensionar a janela/painéis
        if (window.ResizeObserver) {
            new ResizeObserver(function () {
                if (!pane.offsetWidth) return;
                if (!baseMeasured) {
                    el.style.transform = '';
                    baseScale = readBaseScale(el);
                    baseMeasured = true;
                }
                constrain();
                commit(true);
            }).observe(pane);
        }

        // Sem seleção de texto acidental ao arrastar (campos editáveis continuam selecionáveis)
        pane.addEventListener('selectstart', function (e) {
            if (locked) return;
            var t = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
            if (t && t.closest && t.closest('[contenteditable="true"], input, textarea')) return;
            e.preventDefault();
        });

        /* ---------------- Dica da primeira vez ---------------- */
        if (!localStorage.getItem(LS_HINT)) {
            var showHint = function () {
                if (hint.classList.contains('is-visible') || locked) return;
                hint.classList.add('is-visible');
                localStorage.setItem(LS_HINT, '1');
                setTimeout(function () { hint.classList.remove('is-visible'); }, 4500);
                pane.removeEventListener('pointerenter', showHint);
            };
            pane.addEventListener('pointerenter', showHint);
        }

        /* ---------------- Start ---------------- */
        setLocked(locked, true);
        apply();
        updateHud();
        updatePageNavPills();

        if (window.App && typeof window.App.render === 'function') {
            setTimeout(function () {
                window.App.render();
                updatePageNavPills();
            }, 60);
        }

        // 🖨️ SUPRESSÃO ABSOLUTA DURANTE A IMPRESSÃO (Nenhum seletor ou HUD na folha)
        var savedTransform = null;
        window.addEventListener('beforeprint', function () {
            if (pageNavHud) {
                pageNavHud.classList.remove('is-visible');
                pageNavHud.style.setProperty('display', 'none', 'important');
                pageNavHud.style.setProperty('opacity', '0', 'important');
                pageNavHud.style.setProperty('visibility', 'hidden', 'important');
            }
            if (hud) hud.style.setProperty('display', 'none', 'important');
            if (hint) hint.style.setProperty('display', 'none', 'important');
            if (frame) frame.style.setProperty('display', 'none', 'important');
            if (el) {
                savedTransform = el.style.transform;
                el.style.transform = 'none';
            }
        });

        window.addEventListener('afterprint', function () {
            if (pageNavHud) {
                pageNavHud.style.removeProperty('display');
                pageNavHud.style.removeProperty('opacity');
                pageNavHud.style.removeProperty('visibility');
            }
            if (hud) hud.style.removeProperty('display');
            if (hint) hint.style.removeProperty('display');
            if (frame) frame.style.removeProperty('display');
            if (el && savedTransform !== null) {
                el.style.transform = savedTransform;
                savedTransform = null;
            }
        });

        // API pública (útil para outros módulos)
        window.PreviewZoom = {
            reset: reset,
            fit: fit,
            zoomIn: function () { zoomBy(BTN_STEP); },
            zoomOut: function () { zoomBy(1 / BTN_STEP); },
            setLocked: function (v) { setLocked(v); },
            isLocked: function () { return locked; },
            getZoom: function () { return target.s; },
            updatePageNavPills: updatePageNavPills
        };
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
