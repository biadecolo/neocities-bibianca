// ── carrega o sistema de idiomas ─────────────────────────────────
(function() {
    const s = document.createElement('script');
    s.src = 'lang.js';
    s.onload = () => applyLang(getLang());
    document.head.appendChild(s);
})();

// ── sidebar compartilhada ────────────────────────────────────────
// Carrega o sidebar.html e injeta no <aside class="sidebar">
// O item ativo é marcado automaticamente pelo atributo data-page
async function loadSidebar() {
    const aside = document.querySelector('aside.sidebar');
    if (!aside) return;

    try {
        const res = await fetch('sidebar.html');
        const html = await res.text();
        aside.innerHTML = html;

        // re-aplica traduções depois que a sidebar foi injetada no DOM
        if (typeof applyLang === 'function') applyLang(getLang());

        // marca o item ativo baseado no nome do arquivo atual
        const filename = window.location.pathname.split('/').pop().replace('.html', '');
        const page = filename === '' || filename === 'index' ? 'inicio' : filename;
        const active = aside.querySelector(`[data-page="${page}"]`);
        if (active) active.classList.add('active');

        // ── menu hambúrguer (só aparece no mobile via CSS) ──
        const menuToggle = aside.querySelector('#menu-toggle');
        const menu = aside.querySelector('#site-menu');
        if (menuToggle && menu) {
            menuToggle.addEventListener('click', () => {
                const isOpen = menu.classList.toggle('open');
                menuToggle.setAttribute('aria-expanded', String(isOpen));
            });
            // fecha o menu automaticamente ao navegar pra outra página
            menu.addEventListener('click', (e) => {
                if (e.target.closest('a')) {
                    menu.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

    } catch (err) {
        console.error('erro ao carregar sidebar:', err);
    }
}

loadSidebar();

// ── coluna lateral direita compartilhada ─────────────────────────
// Carrega o sidebar-right.html e injeta no <aside class="sidebar-right">
async function loadSidebarRight() {
    const aside = document.querySelector('aside.sidebar-right');
    if (!aside) return;

    try {
        const res = await fetch('sidebar-right.html');
        const html = await res.text();
        aside.innerHTML = html;

        if (typeof applyLang === 'function') applyLang(getLang());

        // ── last.fm: carrega a música depois que a sidebar direita for inserida na tela
        let user = 'biadecolo';
        let url = 'https://lastfm-last-played.biancarosa.com.br/' + user + '/latest-song';
        let song = aside.querySelector('#song');
        if (song) {
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    song.innerHTML = json['track']['name'] + ' - ' + json['track']['artist']['#text'];
                });
        }
    } catch (err) {
        console.error('erro ao carregar sidebar-right:', err);
    }
}

loadSidebarRight();

window.addEventListener("load", () => {
    new cursoreffects.fairyDustCursor({
        colors: ["#097969", "#50C878", "#4F7942"],
        fairySymbol: "★",
    });
});

function initBanners() {
    const track = document.getElementById('track');
    if (track && !track.dataset.looped) {
        const content = track.innerHTML;
        // quadruplica o conteúdo pra garantir que a barra não acabe no meio da tela
        track.innerHTML = content + content + content + content;
        track.dataset.looped = "true";
    }
}

// Carregar o Footer dinamicamente (se o placeholder existir)
const footerPlaceholder = document.getElementById('footer-placeholder');
if (footerPlaceholder) {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            footerPlaceholder.innerHTML = data;
            initBanners();
        })
        .catch(error => console.error('Erro ao carregar o footer:', error));
} else {
    // se o footer já estiver fixo no HTML, inicia direto
    initBanners();
}


    // Carregar tags e estilos do <head> dinamicamente
fetch('head.html')
    .then(response => response.text())
    .then(data => {
        document.head.insertAdjacentHTML('beforeend', data);
    })
    .catch(error => console.error('Erro ao carregar o head:', error));

// ── galeria lightbox ─────────────────────────────────────────────
const modal = document.getElementById("image-modal");
if (modal) {
    const modalImg = document.getElementById("modal-img");
    const captionText = document.getElementById("modal-caption");
    
    document.querySelectorAll(".gallery-item img").forEach(img => {
        img.addEventListener("click", function() {
            modal.style.display = "flex";
            modalImg.src = this.src;
            const label = this.nextElementSibling;
            captionText.innerHTML = label ? label.innerHTML : this.alt;
        });
    });
}
