(function() {
    const s = document.createElement('script');
    s.src = 'lang.js?v=20260714';
    s.onload = () => applyLang(getLang());
    document.head.appendChild(s);
})();

async function loadSidebar() {
    const aside = document.querySelector('aside.sidebar');
    if (!aside) return;

    try {
        const res = await fetch('sidebar.html');
        const html = await res.text();
        aside.innerHTML = html;

        if (typeof applyLang === 'function') applyLang(getLang());

        updateActiveMenuItem();

        const menuToggle = aside.querySelector('#menu-toggle');
        const menu = aside.querySelector('#site-menu');
        if (menuToggle && menu) {
            menuToggle.addEventListener('click', () => {
                const isOpen = menu.classList.toggle('open');
                menuToggle.setAttribute('aria-expanded', String(isOpen));
            });
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

function updateActiveMenuItem() {
    const aside = document.querySelector('aside.sidebar');
    if (!aside) return;
    const filename = window.location.pathname.split('/').pop().replace('.html', '');
    const page = filename === '' || filename === 'index' ? 'inicio' : filename;
    aside.querySelectorAll('.menu-item.active').forEach(el => el.classList.remove('active'));
    const active = aside.querySelector(`[data-page="${page}"]`);
    if (active) active.classList.add('active');
}

async function loadSidebarRight() {
    const aside = document.querySelector('aside.sidebar-right');
    if (!aside) return;

    try {
        const res = await fetch('sidebar-right.html');
        const html = await res.text();
        aside.innerHTML = html;

        if (typeof applyLang === 'function') applyLang(getLang());

        let user = 'biadecolo';
        let url = 'https://lastfm-last-played.biancarosa.com.br/' + user + '/latest-song';
        let song = aside.querySelector('#song');
        if (song) {
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    if (!json || !json.track || !json.track.name) {
                        song.textContent = '...';
                        return;
                    }
                    song.textContent = json.track.name + ' - ' + json.track.artist['#text'];
                })
                .catch(() => {
                    song.textContent = '...';
                });
        }
    } catch (err) {
        console.error('erro ao carregar sidebar-right:', err);
    }
}

function initBanners() {
    const track = document.getElementById('track');
    if (track && !track.dataset.looped) {
        const content = track.innerHTML;
        track.innerHTML = content + content + content + content;
        track.dataset.looped = "true";
    }
}

function loadFooter() {
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
        initBanners();
    }
}

function initShrineCarousels() {
    document.querySelectorAll(".shrine-carousel").forEach(carousel => {
        const track = carousel.querySelector(".shrine-carousel-track");
        const slides = Array.from(track.children);
        const dotsWrap = carousel.querySelector(".carousel-dots");
        let index = 0;

        slides.forEach((_, i) => {
            const dot = document.createElement("button");
            dot.className = "carousel-dot" + (i === 0 ? " active" : "");
            dot.addEventListener("click", () => goTo(i));
            dotsWrap.appendChild(dot);
        });
        const dots = Array.from(dotsWrap.children);

        function goTo(i) {
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, di) => d.classList.toggle("active", di === index));
        }

        carousel.querySelector(".carousel-prev").addEventListener("click", () => goTo(index - 1));
        carousel.querySelector(".carousel-next").addEventListener("click", () => goTo(index + 1));
    });
}

function initGalleryShuffle() {
    const galleryGrid = document.querySelector(".gallery-grid");
    if (galleryGrid) {
        const items = Array.from(galleryGrid.children);
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        items.forEach(item => galleryGrid.appendChild(item));
    }
}

function initGalleryLightbox() {
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
}

function initCopyCode() {
    document.querySelectorAll('.copy-code').forEach(btn => {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(btn.textContent.trim()).then(() => {
                const tooltip = btn.parentElement.querySelector('.copy-tooltip');
                if (!tooltip) return;
                tooltip.classList.add('show');
                clearTimeout(tooltip._hideTimer);
                tooltip._hideTimer = setTimeout(() => tooltip.classList.remove('show'), 1400);
            });
        });
    });
}

let cursorEffectsReady = null;
function initCursorEffects() {
    if (cursorEffectsReady) return cursorEffectsReady;
    cursorEffectsReady = new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/cursor-effects@latest/dist/browser.js';
        s.onload = () => {
            new cursoreffects.fairyDustCursor({
                colors: ["#097969", "#50C878", "#4F7942"],
                fairySymbol: "★",
            });
            resolve();
        };
        document.head.appendChild(s);
    });
    return cursorEffectsReady;
}

function executeInlineScripts(container) {
    if (!container) return;
    container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
    });
}

function initContent(container) {
    if (typeof applyLang === 'function') applyLang(getLang());
    initShrineCarousels();
    initGalleryShuffle();
    initGalleryLightbox();
    initCopyCode();
    executeInlineScripts(container);
}

fetch('head.html')
    .then(response => response.text())
    .then(data => {
        document.head.insertAdjacentHTML('beforeend', data);
    })
    .catch(error => console.error('Erro ao carregar o head:', error));

loadSidebar();
loadSidebarRight();
loadFooter();
initCursorEffects();
initContent(document.querySelector('.content-area'));

function isRoutableLink(a) {
    if (!a || !a.href) return false;
    if (a.origin !== window.location.origin) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    const href = a.getAttribute('href') || '';
    if (href === '#' || href.startsWith('#')) return false;
    if (/\.(png|jpe?g|gif|webp|svg|pdf|zip|mp3|mp4)$/i.test(a.pathname)) return false;
    return true;
}

function syncOptionalElement(selector, newDoc, parent) {
    const current = document.querySelector(selector);
    if (current) current.remove();
    const incoming = newDoc.querySelector(selector);
    if (incoming) parent.appendChild(incoming.cloneNode(true));
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForImages(container, timeout = 350) {
    const pending = Array.from(container.querySelectorAll('img')).filter(img => !img.complete);
    if (pending.length === 0) return Promise.resolve();
    const loaded = Promise.all(pending.map(img => new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
    })));
    return Promise.race([loaded, wait(timeout)]);
}

const FADE_MS = 180;

async function navigateTo(url, { push = true } = {}) {
    const contentArea = document.querySelector('.content-area');
    if (!contentArea) { window.location.href = url; return; }

    try {
        const fetchPromise = fetch(url);
        contentArea.classList.add('is-fading');
        const [res] = await Promise.all([fetchPromise, wait(FADE_MS)]);
        if (!res.ok) { window.location.href = url; return; }
        const html = await res.text();
        const newDoc = new DOMParser().parseFromString(html, 'text/html');

        const newContentArea = newDoc.querySelector('.content-area');
        if (!newContentArea) { window.location.href = url; return; }

        const titleEl = document.querySelector('title');
        const newTitleEl = newDoc.querySelector('title');
        if (titleEl && newTitleEl) {
            titleEl.innerHTML = newTitleEl.innerHTML;
            if (newTitleEl.hasAttribute('data-i18n-en')) {
                titleEl.setAttribute('data-i18n-en', newTitleEl.getAttribute('data-i18n-en'));
            } else {
                titleEl.removeAttribute('data-i18n-en');
            }
        }

        document.documentElement.className = newDoc.documentElement.className;

        document.querySelectorAll('head [data-page-specific]').forEach(el => el.remove());
        newDoc.querySelectorAll('head [data-page-specific]').forEach(el => {
            document.head.appendChild(el.cloneNode(true));
        });

        contentArea.innerHTML = newContentArea.innerHTML;

        syncOptionalElement('.mobile-notice', newDoc, document.querySelector('.background-overlay'));
        syncOptionalElement('#image-modal', newDoc, document.body);
        syncOptionalElement('.plantinhas', newDoc, document.body);

        if (push) history.pushState({ url }, '', url);

        updateActiveMenuItem();

        window.scrollTo(0, 0);
        contentArea.querySelectorAll('.content-box').forEach(box => box.scrollTop = 0);

        initContent(contentArea);
        await waitForImages(contentArea);
        contentArea.classList.remove('is-fading');
    } catch (err) {
        console.error('erro ao navegar:', err);
        window.location.href = url;
    }
}

document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!isRoutableLink(a)) return;
    if (a.pathname === window.location.pathname && a.search === window.location.search) return;
    e.preventDefault();
    navigateTo(a.href);
});

window.addEventListener('popstate', () => {
    navigateTo(window.location.href, { push: false });
});
