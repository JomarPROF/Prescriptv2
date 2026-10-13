// Scratch generator for Patch V6000 & V4100 replacement
const fs = require('fs');

const portalStyles = `
/* ══════════════════════════════════════════════════════════════════════════
   💎 QUICK SWITCHER & STUDIO MODAL DE UNIDADES — CYBER-APPLE MEDICAL EXECUTIVE
   ══════════════════════════════════════════════════════════════════════════ */
.units-portal-overlay {
    position: fixed !important;
    inset: 0 !important;
    z-index: 2147483647 !important;
    background: rgba(2, 6, 23, 0.78) !important;
    backdrop-filter: blur(20px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 16px !important;
    animation: upFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    pointer-events: auto !important;
    box-sizing: border-box !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
}

@keyframes upFadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}

.units-portal-card {
    width: 860px !important;
    max-width: 96vw !important;
    height: 88vh !important;
    max-height: 860px !important;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.98) 100%) !important;
    backdrop-filter: blur(32px) !important;
    -webkit-backdrop-filter: blur(32px) !important;
    border: 1px solid rgba(56, 189, 248, 0.22) !important;
    border-radius: 24px !important;
    box-shadow: 0 35px 80px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    animation: upCardSlide 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    box-sizing: border-box !important;
}

@keyframes upCardSlide {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* HEADER */
.up-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 20px 28px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, rgba(2, 6, 23, 0.4) 100%) !important;
    flex-shrink: 0 !important;
}

.up-title-wrap {
    display: flex !important;
    align-items: center !important;
    gap: 14px !important;
}

.up-icon-badge {
    width: 44px !important;
    height: 44px !important;
    border-radius: 12px !important;
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(2, 132, 199, 0.35) 100%) !important;
    border: 1px solid rgba(56, 189, 248, 0.4) !important;
    color: #38bdf8 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 4px 14px rgba(56, 189, 248, 0.25) !important;
    flex-shrink: 0 !important;
}

.up-title-row {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}

.up-title {
    font-size: 18.5px !important;
    font-weight: 800 !important;
    color: #f8fafc !important;
    letter-spacing: -0.3px !important;
    font-family: 'Montserrat', 'Inter', sans-serif !important;
}

.up-count-pill {
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #38bdf8 !important;
    background: rgba(56, 189, 248, 0.12) !important;
    border: 1px solid rgba(56, 189, 248, 0.25) !important;
    padding: 2px 8px !important;
    border-radius: 999px !important;
}

.up-subtitle {
    font-size: 12.5px !important;
    color: #94a3b8 !important;
    margin-top: 2px !important;
    font-weight: 400 !important;
}

.up-header-actions {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
}

.up-btn-new-primary {
    display: flex !important;
    align-items: center !important;
    gap: 7px !important;
    background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%) !important;
    color: #ffffff !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    padding: 8px 16px !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 4px 16px rgba(14, 165, 233, 0.35) !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.up-btn-new-primary:hover {
    transform: translateY(-1.5px) !important;
    box-shadow: 0 6px 22px rgba(14, 165, 233, 0.5) !important;
    background: linear-gradient(135deg, #0369a1 0%, #38bdf8 100%) !important;
}

.up-btn-close {
    width: 34px !important;
    height: 34px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    color: #94a3b8 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
}

.up-btn-close:hover {
    background: rgba(239, 68, 68, 0.2) !important;
    border-color: rgba(239, 68, 68, 0.5) !important;
    color: #ef4444 !important;
    transform: rotate(90deg) !important;
}

/* TOOLBAR & SEARCH */
.up-toolbar {
    padding: 14px 28px !important;
    background: rgba(2, 6, 23, 0.45) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    flex-shrink: 0 !important;
}

.up-search-box {
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
}

.up-search-svg {
    position: absolute !important;
    left: 14px !important;
    color: #64748b !important;
    pointer-events: none !important;
}

.up-search-input {
    width: 100% !important;
    height: 42px !important;
    padding: 0 40px 0 42px !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 12px !important;
    color: #f8fafc !important;
    font-size: 13.5px !important;
    font-weight: 500 !important;
    outline: none !important;
    transition: all 0.2s ease !important;
    box-sizing: border-box !important;
}

.up-search-input:focus {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: #38bdf8 !important;
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.25) !important;
}

.up-search-input::placeholder {
    color: #64748b !important;
}

.up-search-clear-btn {
    position: absolute !important;
    right: 12px !important;
    width: 22px !important;
    height: 22px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.1) !important;
    border: none !important;
    color: #cbd5e1 !important;
    font-size: 11px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.up-filter-chips {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding-bottom: 2px !important;
}

.up-chip {
    padding: 5px 12px !important;
    border-radius: 999px !important;
    font-size: 11.5px !important;
    font-weight: 600 !important;
    color: #94a3b8 !important;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    transition: all 0.15s ease !important;
}

.up-chip:hover {
    color: #f8fafc !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(255, 255, 255, 0.18) !important;
}

.up-chip.active {
    color: #0f172a !important;
    background: #38bdf8 !important;
    border-color: #38bdf8 !important;
    font-weight: 700 !important;
    box-shadow: 0 2px 10px rgba(56, 189, 248, 0.35) !important;
}

/* LISTA DE CARDS */
.up-units-list {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: 20px 28px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
}

.up-units-list::-webkit-scrollbar {
    width: 6px !important;
}

.up-units-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.16) !important;
    border-radius: 3px !important;
}

.up-unit-card {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 18px !important;
    padding: 18px 22px !important;
    background: rgba(255, 255, 255, 0.035) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 18px !important;
    cursor: pointer !important;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
    position: relative !important;
    box-sizing: border-box !important;
}

.up-unit-card:hover {
    background: rgba(255, 255, 255, 0.065) !important;
    border-color: rgba(56, 189, 248, 0.4) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.12) !important;
}

.up-unit-card.is-active-unit {
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%) !important;
    border: 1px solid #0ea5e9 !important;
    box-shadow: 0 0 25px rgba(14, 165, 233, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
}

.up-unit-card-left {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    flex: 1 !important;
    min-width: 0 !important;
}

.up-unit-card-header {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}

.up-unit-tag {
    font-size: 10px !important;
    font-weight: 750 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.6px !important;
    padding: 3px 9px !important;
    border-radius: 6px !important;
    background: rgba(255, 255, 255, 0.07) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #cbd5e1 !important;
}

.up-unit-card.is-active-unit .up-unit-tag {
    background: rgba(56, 189, 248, 0.22) !important;
    color: #38bdf8 !important;
    border: 1px solid rgba(56, 189, 248, 0.4) !important;
}

.up-unit-badge-active {
    font-size: 10.5px !important;
    font-weight: 800 !important;
    color: #10b981 !important;
    letter-spacing: 0.5px !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
}

.up-pulse-dot {
    width: 7px !important;
    height: 7px !important;
    background-color: #10b981 !important;
    border-radius: 50% !important;
    box-shadow: 0 0 8px #10b981 !important;
    animation: upPulse 1.8s infinite !important;
}

@keyframes upPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
}

.up-unit-title {
    font-size: 15.5px !important;
    font-weight: 750 !important;
    color: #f8fafc !important;
    line-height: 1.35 !important;
}

.up-unit-sub {
    font-size: 12.5px !important;
    color: #94a3b8 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
}

.up-unit-meta {
    display: flex !important;
    align-items: center !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    font-size: 11.5px !important;
    color: #64748b !important;
    margin-top: 2px !important;
}

.up-meta-item {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
}

.up-meta-sep {
    color: rgba(255, 255, 255, 0.15) !important;
}

.up-unit-card-right {
    display: flex !important;
    align-items: center !important;
    gap: 16px !important;
    flex-shrink: 0 !important;
}

/* VITRINE DOS DOIS LOGOTIPOS */
.up-dual-logo-display {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 6px 10px !important;
    background: rgba(2, 6, 23, 0.55) !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.up-logo-frame {
    width: 48px !important;
    height: 34px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border-radius: 8px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
    overflow: hidden !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.up-logo-frame img {
    max-width: 90% !important;
    max-height: 85% !important;
    object-fit: contain !important;
}

.up-no-logo {
    font-size: 8.5px !important;
    color: #64748b !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
}

.up-logo-frame-tag {
    position: absolute !important;
    bottom: 1px !important;
    right: 2px !important;
    font-size: 7px !important;
    font-weight: 800 !important;
    color: #0f172a !important;
    opacity: 0.6 !important;
}

.up-logo-frame-sep {
    width: 1px !important;
    height: 24px !important;
    background: rgba(255, 255, 255, 0.1) !important;
}

/* BOTÕES DE AÇÃO DO CARD */
.up-card-action-btns {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
}

.up-btn-action-select {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    padding: 8px 14px !important;
    border-radius: 10px !important;
    background: rgba(56, 189, 248, 0.14) !important;
    border: 1px solid rgba(56, 189, 248, 0.35) !important;
    color: #38bdf8 !important;
    font-size: 12px !important;
    font-weight: 750 !important;
    cursor: pointer !important;
    transition: all 0.18s ease !important;
    white-space: nowrap !important;
}

.up-btn-action-select:hover {
    background: #38bdf8 !important;
    color: #0f172a !important;
    box-shadow: 0 0 14px rgba(56, 189, 248, 0.45) !important;
    transform: translateY(-1px) !important;
}

.up-btn-action-active {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    padding: 8px 14px !important;
    border-radius: 10px !important;
    background: rgba(16, 185, 129, 0.15) !important;
    border: 1px solid rgba(16, 185, 129, 0.4) !important;
    color: #10b981 !important;
    font-size: 12px !important;
    font-weight: 750 !important;
    cursor: default !important;
    white-space: nowrap !important;
}

.up-btn-action-edit {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    padding: 8px 12px !important;
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    color: #cbd5e1 !important;
    font-size: 12px !important;
    font-weight: 650 !important;
    cursor: pointer !important;
    transition: all 0.18s ease !important;
    white-space: nowrap !important;
}

.up-btn-action-edit:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    color: #38bdf8 !important;
    border-color: rgba(56, 189, 248, 0.4) !important;
}

.up-btn-action-del {
    width: 32px !important;
    height: 32px !important;
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    color: #94a3b8 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    transition: all 0.18s ease !important;
}

.up-btn-action-del:hover {
    background: rgba(239, 68, 68, 0.2) !important;
    border-color: rgba(239, 68, 68, 0.4) !important;
    color: #ef4444 !important;
}

/* FOOTER */
.up-footer {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 16px 28px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
    background: rgba(2, 6, 23, 0.6) !important;
    flex-shrink: 0 !important;
}

.up-footer-left, .up-footer-right {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}

.up-btn-restore, .up-btn-studio {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 8px 14px !important;
    border-radius: 10px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    background: rgba(255, 255, 255, 0.05) !important;
    color: #94a3b8 !important;
}

.up-btn-restore:hover, .up-btn-studio:hover {
    color: #f8fafc !important;
    background: rgba(255, 255, 255, 0.09) !important;
    border-color: rgba(255, 255, 255, 0.2) !important;
}

/* ══════════════════════════════════════════════════════════════════════════
   EDITOR DE UNIDADE COMPLETO (STUDIO EMBEDDED)
   ══════════════════════════════════════════════════════════════════════════ */
.up-editor-body {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: 24px 28px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 24px !important;
}

.up-editor-body::-webkit-scrollbar {
    width: 6px !important;
}

.up-editor-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.16) !important;
    border-radius: 3px !important;
}

.up-btn-back {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    color: #38bdf8 !important;
    padding: 7px 12px !important;
    border-radius: 10px !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
}

.up-btn-back:hover {
    background: rgba(56, 189, 248, 0.15) !important;
    border-color: #38bdf8 !important;
}

.up-divider-vertical {
    width: 1px !important;
    height: 32px !important;
    background: rgba(255, 255, 255, 0.12) !important;
}

.up-editor-grid {
    display: grid !important;
    grid-template-columns: 1.15fr 0.85fr !important;
    gap: 24px !important;
}

@media (max-width: 780px) {
    .up-editor-grid {
        grid-template-columns: 1fr !important;
    }
}

.up-editor-col {
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
}

.up-section-heading {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 13.5px !important;
    font-weight: 800 !important;
    color: #f8fafc !important;
    letter-spacing: -0.2px !important;
    margin-bottom: 2px !important;
}

.up-section-num {
    width: 20px !important;
    height: 20px !important;
    border-radius: 50% !important;
    background: rgba(56, 189, 248, 0.2) !important;
    border: 1px solid #38bdf8 !important;
    color: #38bdf8 !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

.up-form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
}

.up-form-row {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
}

.up-label {
    font-size: 11.5px !important;
    font-weight: 700 !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

.up-input, .up-textarea {
    width: 100% !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 12px !important;
    padding: 10px 14px !important;
    color: #f8fafc !important;
    font-size: 13.5px !important;
    font-family: inherit !important;
    outline: none !important;
    transition: all 0.2s ease !important;
    box-sizing: border-box !important;
}

.up-input:focus, .up-textarea:focus {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: #38bdf8 !important;
    box-shadow: 0 0 14px rgba(56, 189, 248, 0.25) !important;
}

.up-textarea {
    resize: vertical !important;
    min-height: 58px !important;
    line-height: 1.4 !important;
}

.up-hint {
    font-size: 11px !important;
    color: #64748b !important;
}

/* LOGO EDITORS */
.up-logos-editor-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
}

.up-logo-edit-box {
    background: rgba(255, 255, 255, 0.035) !important;
    border: 1px solid rgba(255, 255, 255, 0.09) !important;
    border-radius: 16px !important;
    padding: 14px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
}

.up-logo-edit-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
}

.up-logo-pos-badge {
    font-size: 9px !important;
    font-weight: 800 !important;
    padding: 2px 7px !important;
    border-radius: 5px !important;
    background: rgba(56, 189, 248, 0.15) !important;
    color: #38bdf8 !important;
    letter-spacing: 0.5px !important;
}

.up-logo-title {
    font-size: 12px !important;
    font-weight: 700 !important;
    color: #e2e8f0 !important;
}

.up-logo-preview-viewport {
    width: 100% !important;
    height: 72px !important;
    background: #ffffff !important;
    border-radius: 10px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 6px !important;
    box-sizing: border-box !important;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.up-logo-preview-viewport img {
    max-width: 90% !important;
    max-height: 90% !important;
    object-fit: contain !important;
}

.up-empty-logo-txt {
    font-size: 11px !important;
    font-weight: 700 !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
}

.up-logo-controls {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
}

.up-btn-logo-action {
    flex: 1 !important;
    padding: 6px 10px !important;
    border-radius: 8px !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #cbd5e1 !important;
    font-size: 11px !important;
    font-weight: 650 !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    transition: all 0.15s ease !important;
}

.up-btn-logo-action:hover {
    background: rgba(255, 255, 255, 0.12) !important;
    color: #38bdf8 !important;
}

.up-btn-logo-action.danger:hover {
    background: rgba(239, 68, 68, 0.2) !important;
    color: #ef4444 !important;
    border-color: rgba(239, 68, 68, 0.4) !important;
}

/* SIMULADOR AO VIVO DO PAPEL A4 */
.up-live-simulator-container {
    background: rgba(2, 6, 23, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 18px !important;
    padding: 16px 20px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
}

.up-sim-badge {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    font-size: 10.5px !important;
    font-weight: 800 !important;
    color: #38bdf8 !important;
    letter-spacing: 0.6px !important;
}

.up-sim-dot {
    width: 6px !important;
    height: 6px !important;
    background-color: #38bdf8 !important;
    border-radius: 50% !important;
    box-shadow: 0 0 6px #38bdf8 !important;
}

.up-paper-sheet {
    background: #ffffff !important;
    border-radius: 8px !important;
    padding: 16px 20px !important;
    color: #000000 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
}

.up-paper-header {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 16px !important;
    padding-bottom: 12px !important;
    border-bottom: 2px solid #000000 !important;
}

.up-paper-logo-slot {
    width: 75px !important;
    height: 50px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
}

.up-paper-logo-slot img {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
}

.up-paper-text-slot {
    flex: 1 !important;
    text-align: center !important;
    font-family: Arial, 'Helvetica Neue', sans-serif !important;
    font-size: 11.5px !important;
    line-height: 1.35 !important;
    color: #000000 !important;
}

.up-paper-text-slot b {
    font-size: 13.5px !important;
    font-weight: 800 !important;
    display: block !important;
    color: #000000 !important;
}

.up-paper-fake-lines {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    opacity: 0.15 !important;
}

.up-fake-line {
    height: 4px !important;
    background: #000000 !important;
    border-radius: 2px !important;
}

/* BOTÕES DO EDITOR */
.up-btn-save-draft {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 9px 16px !important;
    border-radius: 12px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    color: #f8fafc !important;
    font-size: 12.5px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: all 0.18s ease !important;
}

.up-btn-save-draft:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    border-color: #38bdf8 !important;
}

.up-btn-save-activate {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 9px 18px !important;
    border-radius: 12px !important;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;
    font-size: 12.5px !important;
    font-weight: 750 !important;
    cursor: pointer !important;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35) !important;
    transition: all 0.18s ease !important;
}

.up-btn-save-activate:hover {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
    transform: translateY(-1.5px) !important;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5) !important;
}

.up-btn-cancel {
    padding: 9px 14px !important;
    border-radius: 12px !important;
    background: transparent !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #94a3b8 !important;
    font-size: 12.5px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
}

.up-btn-cancel:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #f8fafc !important;
}

.up-btn-del-unit-full {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 8px 14px !important;
    border-radius: 10px !important;
    background: rgba(239, 68, 68, 0.12) !important;
    border: 1px solid rgba(239, 68, 68, 0.3) !important;
    color: #ef4444 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
}

.up-btn-del-unit-full:hover {
    background: #ef4444 !important;
    color: #ffffff !important;
    box-shadow: 0 0 14px rgba(239, 68, 68, 0.4) !important;
}
`;

console.log('CSS length:', portalStyles.length);
