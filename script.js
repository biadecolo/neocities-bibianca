(function() {
    const s = document.createElement('script');
    s.src = '/lang.js?v=20260714';
    s.onload = () => applyLang(getLang());
    document.head.appendChild(s);
})();

function loadSiteBanner() {
    const overlay = document.querySelector('.background-overlay');
    const mainWindow = document.querySelector('.main-window');
    if (!overlay || !mainWindow || overlay.querySelector('.site-banner-gif')) return;

    const img = document.createElement('img');
    img.src = '/assets/falodemais.gif';
    img.alt = 'fala de mais';
    img.className = 'site-banner-gif';
    overlay.insertBefore(img, mainWindow);
}

async function loadSidebar() {
    const aside = document.querySelector('aside.sidebar');
    if (!aside) return;

    try {
        const res = await fetch('/sidebar.html');
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
    if (active) {
        active.classList.add('active');
    }
}

let nowPlayingInterval = null;

async function loadSidebarRight() {
    const aside = document.querySelector('aside.sidebar-right');
    if (!aside) return;

    try {
        const res = await fetch('/sidebar-right.html');
        const html = await res.text();
        aside.innerHTML = html;

        if (typeof applyLang === 'function') applyLang(getLang());

        if (nowPlayingInterval) {
            clearInterval(nowPlayingInterval);
            nowPlayingInterval = null;
        }

        const song = aside.querySelector('#song');
        if (song) {
            const user = 'biadecolo';
            const url = 'https://lastfm-last-played.biancarosa.com.br/' + user + '/latest-song';
            const updateNowPlaying = () => {
                fetch(url)
                    .then(response => response.json())
                    .then(json => {
                        if (!json || !json.track || !json.track.name) {
                            song.textContent = '...';
                            return;
                        }
                        const isNowPlaying = !!(json.track['@attr'] && json.track['@attr'].nowplaying === 'true');
                        song.innerHTML = '';
                        if (isNowPlaying) {
                            const dot = document.createElement('span');
                            dot.className = 'lastfm-live-dot';
                            dot.title = 'tocando agora';
                            song.appendChild(dot);
                        }
                        song.appendChild(document.createTextNode(json.track.name + ' - ' + json.track.artist['#text']));
                    })
                    .catch(() => {
                        song.textContent = '...';
                    });
            };
            updateNowPlaying();
            nowPlayingInterval = setInterval(updateNowPlaying, 15000);
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
        fetch('/footer.html')
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

        carousel._prev = () => goTo(index - 1);
        carousel._next = () => goTo(index + 1);
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    document.querySelectorAll(".shrine-carousel").forEach(carousel => {
        if (e.key === "ArrowLeft") carousel._prev?.();
        else carousel._next?.();
    });
});

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

let lightboxImages = [];
let lightboxIndex = -1;

function showLightboxImage() {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-img");
    const captionText = document.getElementById("modal-caption");
    const img = lightboxImages[lightboxIndex];
    if (!modal || !modalImg || !img) return;
    modal.style.display = "flex";
    modalBaseSize = null;
    setModalZoom(1);
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    const label = img.nextElementSibling;
    captionText.innerHTML = (label && label.tagName !== "IMG") ? label.innerHTML : img.alt;
}

let modalZoomScale = 1;
let modalBaseSize = null;
const MODAL_ZOOM_MIN = 1;
const MODAL_ZOOM_MAX = 4;
const MODAL_ZOOM_STEP = 1.35;

function setModalZoom(scale) {
    const modalImg = document.getElementById("modal-img");
    if (!modalImg) return;
    const newScale = Math.min(MODAL_ZOOM_MAX, Math.max(MODAL_ZOOM_MIN, scale));

    if (newScale > 1 && !modalBaseSize) {
        const rect = modalImg.getBoundingClientRect();
        modalBaseSize = { width: rect.width, height: rect.height };
    }

    modalZoomScale = newScale;

    if (modalZoomScale === 1 || !modalBaseSize) {
        modalImg.style.maxWidth = "";
        modalImg.style.maxHeight = "";
        modalImg.style.width = "";
        modalImg.style.height = "";
    } else {
        modalImg.style.maxWidth = "none";
        modalImg.style.maxHeight = "none";
        modalImg.style.width = `${modalBaseSize.width * modalZoomScale}px`;
        modalImg.style.height = `${modalBaseSize.height * modalZoomScale}px`;
    }

    modalImg.classList.toggle("zoomed", modalZoomScale > 1);
    if (modalZoomScale === 1) {
        const body = modalImg.closest(".retro-window-body");
        if (body) { body.scrollLeft = 0; body.scrollTop = 0; }
    }
}

let modalDrag = null;

function initModalZoom() {
    const modalImg = document.getElementById("modal-img");
    if (!modalImg) return;

    modalImg.addEventListener("wheel", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setModalZoom(modalZoomScale * (e.deltaY < 0 ? MODAL_ZOOM_STEP : 1 / MODAL_ZOOM_STEP));
    }, { passive: false });

    modalImg.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        const body = modalImg.closest(".retro-window-body");
        if (!body) return;
        modalDrag = {
            startX: e.clientX,
            startY: e.clientY,
            startScrollLeft: body.scrollLeft,
            startScrollTop: body.scrollTop,
            moved: false,
            body,
        };
        modalImg.classList.add("dragging");
    });
}

document.addEventListener("mousemove", (e) => {
    if (!modalDrag) return;
    const dx = e.clientX - modalDrag.startX;
    const dy = e.clientY - modalDrag.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) modalDrag.moved = true;
    modalDrag.body.scrollLeft = modalDrag.startScrollLeft - dx;
    modalDrag.body.scrollTop = modalDrag.startScrollTop - dy;
});

document.addEventListener("mouseup", () => {
    if (!modalDrag) return;
    const wasClick = !modalDrag.moved;
    const modalImg = document.getElementById("modal-img");
    if (modalImg) modalImg.classList.remove("dragging");
    modalDrag = null;
    if (wasClick) {
        setModalZoom(modalZoomScale >= MODAL_ZOOM_MAX ? 1 : modalZoomScale * 2);
    }
});

function initGalleryLightbox() {
    const modal = document.getElementById("image-modal");
    if (!modal) return;

    initModalZoom();

    document.querySelectorAll(".gallery-item img").forEach(img => {
        img.addEventListener("click", function() {
            const grid = this.closest(".gallery-grid");
            lightboxImages = grid ? Array.from(grid.querySelectorAll(".gallery-item img")) : [this];
            lightboxIndex = lightboxImages.indexOf(this);
            showLightboxImage();
        });
    });

    document.querySelectorAll(".blog-post-image, .blog-post-image-row img").forEach(img => {
        img.addEventListener("click", function() {
            const box = this.closest(".content-box");
            lightboxImages = box ? Array.from(box.querySelectorAll(".blog-post-image, .blog-post-image-row img")) : [this];
            lightboxIndex = lightboxImages.indexOf(this);
            showLightboxImage();
        });
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    const modal = document.getElementById("image-modal");
    if (!modal || modal.style.display !== "flex" || lightboxImages.length === 0) return;
    lightboxIndex = (lightboxIndex + (e.key === "ArrowRight" ? 1 : -1) + lightboxImages.length) % lightboxImages.length;
    showLightboxImage();
});

function initCopyCode() {
    document.querySelectorAll('.copy-code, .rss-copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.copy || btn.textContent.trim();
            navigator.clipboard.writeText(text).then(() => {
                const tooltip = btn.closest('.copy-code-wrap')?.querySelector('.copy-tooltip') || btn.parentElement.querySelector('.copy-tooltip');
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
            const cursorCanvas = document.body.querySelector('canvas');
            if (cursorCanvas) cursorCanvas.style.zIndex = '9999';
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

const COMMENTS_API = 'https://bibianca-comments.biancadecolo.workers.dev';
const COMMENTS_ADMIN_TOKEN_KEY = 'bibianca_admin_token';
const COMMENT_EDIT_TOKEN_PREFIX = 'comment_edit_';

function formatCommentDate(iso) {
    try {
        return new Date(iso).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return iso;
    }
}

function renderComment(c, ctx) {
    const li = document.createElement('li');
    li.className = 'comment-item' + (c.is_admin ? ' comment-item--admin' : '');
    li.dataset.id = c.id;

    const meta = document.createElement('div');
    meta.className = 'comment-meta';
    const author = document.createElement(c.site ? 'a' : 'span');
    author.className = 'comment-author';
    author.textContent = c.author;
    if (c.site) {
        author.href = c.site;
        author.target = '_blank';
        author.rel = 'noopener nofollow ugc';
    }
    meta.appendChild(author);
    const time = document.createElement('time');
    time.className = 'comment-date';
    time.dateTime = c.created_at;
    time.textContent = formatCommentDate(c.created_at) + (c.updated_at ? ' (editado)' : '');
    meta.appendChild(time);
    li.appendChild(meta);

    const parent = c.parent_id ? ctx.byId[c.parent_id] : null;
    if (parent && parent.parent_id) {
        const replyTo = document.createElement('p');
        replyTo.className = 'comment-reply-to';
        replyTo.textContent = `respondendo a ${parent.author}`;
        li.appendChild(replyTo);
    }

    const body = document.createElement('p');
    body.className = 'comment-body';
    body.textContent = c.body;
    li.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'comment-actions';

    const editToken = localStorage.getItem(COMMENT_EDIT_TOKEN_PREFIX + c.id);
    if (editToken) {
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'comment-edit';
        edit.textContent = 'editar';
        edit.addEventListener('click', () => startCommentEdit(c, li, body, time, editToken));
        actions.appendChild(edit);
    }

    const adminToken = localStorage.getItem(COMMENTS_ADMIN_TOKEN_KEY);
    if (adminToken) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'comment-delete';
        del.textContent = 'excluir';
        del.addEventListener('click', () => deleteComment(c.id, li, adminToken));
        actions.appendChild(del);
    }

    if (ctx.pageId !== 'guestbook' || adminToken) {
        const reply = document.createElement('button');
        reply.type = 'button';
        reply.className = 'comment-reply';
        reply.textContent = 'responder';
        reply.addEventListener('click', () => startCommentReply(c, li, ctx, adminToken));
        actions.appendChild(reply);
    }

    li.appendChild(actions);

    if (!c.parent_id) {
        const repliesList = document.createElement('ul');
        repliesList.className = 'comment-replies';
        li.appendChild(repliesList);
    }

    return li;
}

function startCommentReply(c, li, ctx, adminToken) {
    if (li.querySelector('.comment-reply-form')) return;

    const form = document.createElement('div');
    form.className = 'comment-reply-form';

    let nameInput, siteInput, hpInput;
    if (!adminToken) {
        nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'seu nome';
        nameInput.maxLength = 60;
        nameInput.className = 'comment-reply-input';
        form.appendChild(nameInput);

        siteInput = document.createElement('input');
        siteInput.type = 'text';
        siteInput.placeholder = 'seu site (opcional)';
        siteInput.maxLength = 200;
        siteInput.className = 'comment-reply-input';
        form.appendChild(siteInput);

        hpInput = document.createElement('input');
        hpInput.type = 'text';
        hpInput.tabIndex = -1;
        hpInput.autocomplete = 'off';
        hpInput.className = 'comments-hp';
        form.appendChild(hpInput);
    }

    const textarea = document.createElement('textarea');
    textarea.className = 'comment-edit-textarea';
    textarea.placeholder = 'escreva sua resposta...';
    textarea.maxLength = 2000;
    form.appendChild(textarea);

    const controls = document.createElement('div');
    controls.className = 'comment-edit-controls';
    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.textContent = 'enviar';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'cancelar';
    controls.append(sendBtn, cancelBtn);
    form.appendChild(controls);

    const repliesList = li.querySelector('.comment-replies');
    li.insertBefore(form, repliesList || null);
    (nameInput || textarea).focus();

    cancelBtn.addEventListener('click', () => form.remove());

    sendBtn.addEventListener('click', async () => {
        const replyBody = textarea.value.trim();
        if (!replyBody) return;
        if (!adminToken && !nameInput.value.trim()) { nameInput.focus(); return; }
        sendBtn.disabled = true;
        try {
            const payload = { pageId: ctx.pageId, body: replyBody, parentId: c.id, ts: ctx.renderedAt };
            const fetchHeaders = { 'Content-Type': 'application/json' };
            if (adminToken) {
                fetchHeaders.Authorization = `Bearer ${adminToken}`;
            } else {
                payload.author = nameInput.value.trim();
                payload.site = siteInput.value.trim();
                payload.hp = hpInput.value;
            }
            const res = await fetch(`${COMMENTS_API}/comments`, {
                method: 'POST',
                headers: fetchHeaders,
                body: JSON.stringify(payload),
            });
            if (res.status === 201) {
                const resData = await res.json().catch(() => null);
                if (!adminToken && resData && resData.id && resData.editToken) {
                    localStorage.setItem(COMMENT_EDIT_TOKEN_PREFIX + resData.id, resData.editToken);
                }
                form.remove();
                ctx.reload();
            } else if (res.status === 401) {
                alert('token inválido');
                localStorage.removeItem(COMMENTS_ADMIN_TOKEN_KEY);
            } else {
                alert('erro ao responder');
            }
        } catch {
            alert('erro de rede ao responder');
        } finally {
            sendBtn.disabled = false;
        }
    });
}

function startCommentEdit(c, li, bodyEl, timeEl, editToken) {
    const textarea = document.createElement('textarea');
    textarea.className = 'comment-edit-textarea';
    textarea.value = c.body;
    textarea.maxLength = 2000;
    bodyEl.replaceWith(textarea);
    textarea.focus();

    const controls = document.createElement('div');
    controls.className = 'comment-edit-controls';
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'salvar';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'cancelar';
    controls.append(saveBtn, cancelBtn);
    textarea.insertAdjacentElement('afterend', controls);

    cancelBtn.addEventListener('click', () => {
        controls.remove();
        textarea.replaceWith(bodyEl);
    });

    saveBtn.addEventListener('click', async () => {
        const newBody = textarea.value.trim();
        if (!newBody) return;
        saveBtn.disabled = true;
        try {
            const res = await fetch(`${COMMENTS_API}/comments/${c.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: newBody, editToken }),
            });
            if (res.status === 200) {
                const data = await res.json();
                c.body = newBody;
                c.updated_at = data.updated_at;
                bodyEl.textContent = newBody;
                timeEl.textContent = formatCommentDate(c.created_at) + ' (editado)';
                controls.remove();
                textarea.replaceWith(bodyEl);
            } else if (res.status === 401) {
                alert('não foi possível editar esse comentário (token inválido)');
                localStorage.removeItem(COMMENT_EDIT_TOKEN_PREFIX + c.id);
            } else {
                alert('erro ao salvar');
            }
        } catch {
            alert('erro de rede ao salvar');
        } finally {
            saveBtn.disabled = false;
        }
    });
}

async function deleteComment(id, li, token) {
    if (!confirm('excluir esse comentário?')) return;
    try {
        const res = await fetch(`${COMMENTS_API}/comments/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 204) {
            li.remove();
        } else if (res.status === 401) {
            alert('token inválido');
            localStorage.removeItem(COMMENTS_ADMIN_TOKEN_KEY);
        } else {
            alert('erro ao excluir');
        }
    } catch {
        alert('erro de rede ao excluir');
    }
}

function loadComments(section, pageId) {
    const list = section.querySelector('.comments-list');
    const empty = section.querySelector('.comments-empty');
    const errorEl = section.querySelector('.comments-error');

    list.innerHTML = '';
    if (empty) empty.hidden = true;
    errorEl.hidden = true;

    fetch(`${COMMENTS_API}/comments?pageId=${encodeURIComponent(pageId)}`)
        .then(res => { if (!res.ok) throw new Error('bad status'); return res.json(); })
        .then(data => {
            const comments = data.comments || [];
            if (comments.length === 0) { if (empty) empty.hidden = false; return; }

            const byId = {};
            comments.forEach(c => { byId[c.id] = c; });

            function rootIdOf(c) {
                let cur = c;
                while (cur.parent_id && byId[cur.parent_id]) cur = byId[cur.parent_id];
                return cur.id;
            }

            const topLevel = comments.filter(c => !c.parent_id);
            if (pageId === 'guestbook') topLevel.reverse();
            const repliesByRoot = {};
            comments.filter(c => c.parent_id).forEach(c => {
                const rootId = rootIdOf(c);
                (repliesByRoot[rootId] ||= []).push(c);
            });

            const ctx = { pageId, renderedAt: Date.now(), reload: () => loadComments(section, pageId), byId };
            topLevel.forEach(c => {
                const li = renderComment(c, ctx);
                const repliesList = li.querySelector('.comment-replies');
                (repliesByRoot[c.id] || []).forEach(r => {
                    repliesList.appendChild(renderComment(r, ctx));
                });
                list.appendChild(li);
            });
        })
        .catch(() => { errorEl.hidden = false; });
}

function initComments(container) {
    const section = container.querySelector('.comments-section');
    if (!section) return;

    const pageId = section.dataset.pageId;
    const form = section.querySelector('.comments-form');
    const renderedAt = Date.now();

    loadComments(section, pageId);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusEl = form.querySelector('.comments-form-status');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const res = await fetch(`${COMMENTS_API}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageId, author: form.author.value, site: form.site ? form.site.value : '', body: form.body.value, hp: form.hp.value, ts: renderedAt }),
            });
            if (res.status === 201) {
                const data = await res.json().catch(() => null);
                if (data && data.id && data.editToken) {
                    localStorage.setItem(COMMENT_EDIT_TOKEN_PREFIX + data.id, data.editToken);
                }
                form.reset();
                statusEl.hidden = true;
                loadComments(section, pageId);
            } else {
                statusEl.hidden = false;
                statusEl.textContent = 'não foi possível enviar. tente de novo.';
            }
        } catch {
            statusEl.hidden = false;
            statusEl.textContent = 'erro de rede. tente de novo.';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function initNoise() {
    const noise = document.createElement('div');
    noise.id = 'noise-bg';
    document.body.insertBefore(noise, document.body.firstChild);
}

const PT_MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const EN_MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function groupTimelineByMonth(container) {
    const timeline = container.querySelector('.timeline');
    if (!timeline) return;

    const entries = Array.from(timeline.querySelectorAll(':scope > .timeline-entry'));
    if (entries.length === 0) return;

    let currentGroup = null;
    let currentMonth = null;
    let isFirst = true;

    entries.forEach(entry => {
        const month = entry.dataset.month;
        if (month !== currentMonth) {
            currentMonth = month;
            const [year, m] = month.split('-');
            const idx = parseInt(m, 10) - 1;

            currentGroup = document.createElement('details');
            currentGroup.className = 'month-accordion';
            if (isFirst) {
                currentGroup.open = true;
                isFirst = false;
            }

            const summary = document.createElement('summary');
            summary.textContent = `${PT_MONTHS[idx]} de ${year}`;
            summary.setAttribute('data-i18n-en', `${EN_MONTHS[idx]} ${year}`);
            currentGroup.appendChild(summary);

            timeline.appendChild(currentGroup);
        }
        currentGroup.appendChild(entry);
    });

    if (typeof applyLang === 'function') applyLang(getLang());
}

function initContent(container) {
    if (typeof applyLang === 'function') applyLang(getLang());
    initShrineCarousels();
    initGalleryShuffle();
    initGalleryLightbox();
    initCopyCode();
    initComments(container);
    groupTimelineByMonth(container);
    executeInlineScripts(container);
}

loadSiteBanner();
loadSidebar();
loadSidebarRight();
loadFooter();
initCursorEffects();
initNoise();
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
