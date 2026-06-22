// ── motor de tradução ─────────────────────────────────────────────
// o texto em português é escrito direto no HTML (uma vez só).
// pra traduzir, basta adicionar data-i18n-en="..." no elemento.

function detectBrowserLang() {
    const nav = (navigator.language || (navigator.languages && navigator.languages[0]) || 'pt').toLowerCase();
    return nav.startsWith('pt') ? 'pt' : 'en';
}

function getLang() {
    return localStorage.getItem('lang') || detectBrowserLang();
}

function setLang(lang) {
    localStorage.setItem('lang', lang);
    applyLang(lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-br' : 'en';
}

function applyLang(lang) {
    // ── traduções inline (texto pt nativo do elemento + data-i18n-en) ──
    document.querySelectorAll('[data-i18n-en]').forEach(el => {
        if (!el.hasAttribute('data-i18n-pt-cache')) {
            el.setAttribute('data-i18n-pt-cache', el.innerHTML);
        }
        el.innerHTML = lang === 'en' ? el.getAttribute('data-i18n-en') : el.getAttribute('data-i18n-pt-cache');
    });

    // atualiza o botão de toggle
    const btn = document.getElementById('lang-toggle');
    if (btn) {
        const br = '<img src="https://flagcdn.com/w20/br.png" alt="PT-BR" style="vertical-align: middle; border-radius: 2px;">';
        const gb = '<img src="https://flagcdn.com/w20/gb.png" alt="EN-GB" style="vertical-align: middle; border-radius: 2px;">';
        btn.innerHTML = lang === 'pt' ? `${br} <span style="opacity: 0.5">${gb}</span>` : `<span style="opacity: 0.5">${br}</span> ${gb}`;
    }
}

function toggleLang() {
    const current = getLang();
    setLang(current === 'pt' ? 'en' : 'pt');
}

// aplica o idioma salvo assim que o script carrega
applyLang(getLang());
document.documentElement.lang = getLang() === 'pt' ? 'pt-br' : 'en';
