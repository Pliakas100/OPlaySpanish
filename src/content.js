// OPlay en Español · content script
// Detecta la carta bajo el ratón (o pulsada) y muestra su efecto en español.

(() => {
    const ID_RE = /(?<![A-Za-z0-9])((?:PRB|OP|ST|EB)\d{2}|P)-(\d{3})(?!\d)/;
    const TOKEN_RE = /\[([^\]]+)\]|\{([^}]+)\}/g;
    const ABILITY_KEYWORDS = new Set(['Rush', 'Blocker', 'Double Attack', 'Banish', 'Unblockable']);
    const TIMING_KEYWORDS = new Set(['On Play', 'When Attacking', 'On K.O.', 'Main', 'Counter', 'Trigger']);
    const MAX_ANCESTORS = 6;
    const HIDE_DELAY_MS = 200;
    const HOST_ID = 'oplay-es-host';

    const CSS = `
        .panel { font: 14px/1.4 system-ui, sans-serif; width: 320px; max-height: 60vh; display: flex; flex-direction: column; background: #fffdf7; color: #1d1d1f; border: 1px solid #c9c2b0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0, 0, 0, .25); overflow: hidden; }
        .bar { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #2b2d42; color: #fff; cursor: move; user-select: none; }
        .title { flex: 1; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bar button { font: inherit; font-size: 12px; background: transparent; color: #fff; border: 1px solid rgba(255, 255, 255, .5); border-radius: 6px; padding: 2px 8px; cursor: pointer; }
        .bar button[aria-pressed="true"] { background: #fff; color: #2b2d42; }
        .body { padding: 10px 12px; overflow-y: auto; }
        .trigger { font-size: 12px; color: #555; margin: 0 0 6px; }
        .effect { margin: 0; }
        .kw { font-weight: 600; }
        .kw-ability { background: #ffd166; color: #3d2b00; border-radius: 4px; padding: 0 3px; font-weight: 600; }
        .kw-timing { background: #8ecae6; color: #03243b; border-radius: 4px; padding: 0 3px; font-weight: 600; }
        details { margin-top: 8px; font-size: 12px; color: #555; }
        summary { cursor: pointer; }
        .muted { color: #777; }
    `;

    let settings = { enabled: true, mode: 'hover', debug: false, panelPos: null };
    let cardsPromise = null;
    let host = null;
    let shadowRoot = null;
    let pinned = false;
    let currentId = null;
    let hideTimer = null;

    const log = (...args) => settings.debug && console.log('[OPlay ES]', ...args);

    // ---------- Detección de IDs ----------

    function idFromString(str) {
        const m = str && ID_RE.exec(str);
        return m ? `${m[1]}-${m[2]}` : null;
    }

    function idFromElement(el) {
        for (const name of ['src', 'srcset', 'href']) {
            const id = idFromString(el.getAttribute(name));
            if (id) return id;
        }
        for (const attr of el.attributes) {
            if (attr.name.startsWith('data-')) {
                const id = idFromString(attr.value);
                if (id) return id;
            }
        }
        return idFromString(getComputedStyle(el).backgroundImage);
    }

    // Sube hasta MAX_ANCESTORS niveles desde el objetivo buscando un ID de carta.
    function findCardId(start) {
        let el = start instanceof Element ? start : null;
        for (let depth = 0; el && depth <= MAX_ANCESTORS; depth++, el = el.parentElement) {
            const id = idFromElement(el);
            if (id) return id;
        }
        return null;
    }

    // ---------- Diccionario ----------

    function loadCards() {
        cardsPromise ??= fetch(chrome.runtime.getURL('data/cards.es.json'))
            .then(res => res.json())
            .catch(err => {
                log('no se pudo cargar data/cards.es.json', err);
                cardsPromise = null;
                return { cards: {} };
            });
        return cardsPromise;
    }

    // ---------- Formato del texto ----------

    function make(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    // [Palabra] → palabra clave con color; {Tipo} → cursiva. Sin innerHTML: el texto es dato.
    function renderEffect(text, parent) {
        let last = 0;
        for (const m of text.matchAll(TOKEN_RE)) {
            if (m.index > last) parent.append(text.slice(last, m.index));
            if (m[1] !== undefined) {
                const kwClass = ABILITY_KEYWORDS.has(m[1]) ? 'kw-ability'
                    : TIMING_KEYWORDS.has(m[1]) ? 'kw-timing'
                    : 'kw';
                parent.append(make('span', kwClass, m[1]));
            } else {
                parent.append(make('em', '', m[2]));
            }
            last = m.index + m[0].length;
        }
        if (last < text.length) parent.append(text.slice(last));
    }

    // ---------- Panel (Shadow DOM) ----------

    function setPinned(value) {
        pinned = value;
        const btn = shadowRoot.getElementById('pin');
        btn.setAttribute('aria-pressed', String(pinned));
        btn.textContent = pinned ? 'Fijado' : 'Fijar';
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    function place(x, y) {
        const maxX = innerWidth - host.offsetWidth;
        const maxY = innerHeight - host.offsetHeight;
        Object.assign(host.style, {
            left: `${clamp(x, 0, maxX)}px`,
            top: `${clamp(y, 0, maxY)}px`,
            right: 'auto',
        });
    }

    function makeDraggable(handle) {
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener('pointerdown', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            const rect = host.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            handle.setPointerCapture(e.pointerId);
        });

        handle.addEventListener('pointermove', (e) => {
            if (!handle.hasPointerCapture(e.pointerId)) return;
            place(e.clientX - offsetX, e.clientY - offsetY);
        });

        handle.addEventListener('pointerup', (e) => {
            if (!handle.hasPointerCapture(e.pointerId)) return;
            handle.releasePointerCapture(e.pointerId);
            const rect = host.getBoundingClientRect();
            settings.panelPos = { x: rect.left, y: rect.top };
            chrome.storage.local.set({ panelPos: settings.panelPos });
        });
    }

    function ensurePanel() {
        if (host) return;

        host = document.createElement('div');
        host.id = HOST_ID;
        Object.assign(host.style, {
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: '2147483647',
            display: 'none',
        });

        shadowRoot = host.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
            <style>${CSS}</style>
            <div class="panel">
                <div class="bar" id="bar">
                    <span class="title" id="title"></span>
                    <button id="pin" type="button" aria-pressed="false">Fijar</button>
                    <button id="close" type="button" aria-label="Cerrar">×</button>
                </div>
                <div class="body" id="body"></div>
            </div>`;

        shadowRoot.getElementById('pin').addEventListener('click', () => setPinned(!pinned));
        shadowRoot.getElementById('close').addEventListener('click', () => hide({ force: true }));
        makeDraggable(shadowRoot.getElementById('bar'));

        // Mientras el ratón esté sobre el panel, no se oculta.
        host.addEventListener('pointerenter', () => clearTimeout(hideTimer));
        host.addEventListener('pointerleave', scheduleHide);

        document.documentElement.append(host);
        if (settings.panelPos) place(settings.panelPos.x, settings.panelPos.y);
    }

    function render(id, card) {
        shadowRoot.getElementById('title').textContent = card ? `${id} · ${card.name}` : id;
        const body = shadowRoot.getElementById('body');
        body.replaceChildren();

        if (!card) {
            body.append(make('p', 'muted', 'Esta carta todavía no tiene traducción.'));
            return;
        }

        if (card.trigger) {
            const trigger = make('p', 'trigger');
            renderEffect(card.trigger, trigger);
            body.append(trigger);
        }

        const effect = make('p', 'effect');
        renderEffect(card.effect ?? '', effect);
        body.append(effect);

        if (card.en?.effect) {
            const details = make('details');
            details.append(make('summary', '', 'Texto original (EN)'), make('p', 'muted', card.en.effect));
            body.append(details);
        }
    }

    async function show(id) {
        if (!settings.enabled) return;
        ensurePanel();
        clearTimeout(hideTimer);
        if (id === currentId && host.style.display !== 'none') return;

        currentId = id;
        host.style.display = 'block';
        shadowRoot.getElementById('title').textContent = id;
        shadowRoot.getElementById('body').replaceChildren(make('p', 'muted', 'Cargando…'));

        const data = await loadCards();
        if (currentId !== id) return; // el ratón ya está sobre otra carta
        render(id, data.cards?.[id]);
    }

    function hide({ force = false } = {}) {
        clearTimeout(hideTimer);
        if (!host || (pinned && !force)) return;
        if (force) setPinned(false);
        host.style.display = 'none';
        currentId = null;
    }

    function scheduleHide() {
        if (settings.mode !== 'hover') return;
        hideTimer = setTimeout(() => hide(), HIDE_DELAY_MS);
    }

    // ---------- Eventos ----------

    function onPointer(event) {
        if (!settings.enabled) return;
        if (host && host.contains(event.target)) return; // interacción con el panel

        const id = findCardId(event.target);

        if (event.type === 'click') {
            if (id) show(id);
            else hide();
            return;
        }

        // pointerover
        if (settings.mode !== 'hover' || pinned) return;
        if (id) show(id);
        else scheduleHide();
    }

    // ---------- Diagnóstico (popup → "Analizar esta página") ----------

    function diagnose() {
        const ids = [...document.images].map(idFromElement).filter(Boolean);
        const uniqueIds = [...new Set(ids)];
        return {
            path: location.pathname,
            imagesWithId: ids.length,
            uniqueIds: uniqueIds.length,
            sampleIds: uniqueIds.slice(0, 10),
            bigCanvases: [...document.querySelectorAll('canvas')]
                .filter(c => c.width >= 100 && c.height >= 100).length,
            iframes: document.querySelectorAll('iframe').length,
        };
    }

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
        if (msg?.type === 'oplay-es:diagnose') sendResponse(diagnose());
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
        if (!settings.enabled) hide({ force: true });
    });

    chrome.storage.local.get(['enabled', 'mode', 'debug', 'panelPos']).then((stored) => {
        settings = { ...settings, ...stored };
        document.addEventListener('pointerover', onPointer, true);
        document.addEventListener('click', onPointer, true);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') hide({ force: true });
        }, true);
        log('listo', settings);
    });
})();
