// Descarga la ficha en inglés de cada carta y la guarda en .cache/en/cards.en.json.
// Uso: node scripts/extract.mjs [--limit N]
// Cachea el HTML (gzip) en .cache/en/html/, así que es reanudable y se puede re-parsear sin red.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { gzipSync, gunzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { cardFromHtml } from './lib/parse.mjs';
import { KNOWN_KEYWORDS } from './lib/keywords.mjs';

const TOKEN_RE = /\[([^\]]+)\]/g;

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CACHE = join(ROOT, '.cache', 'en');
const BASE = 'https://oplaytcg.com';
const UA = 'OPlayES-extractor/0.1 (uso personal; https://github.com/Pliakas100/opiberiatcg)';
const DELAY_MS = 1000; // una petición por segundo
const ID_RE = /^(OP\d{2}|ST\d{2}|EB\d{2}|PRB\d{2}|P|DON)-\d{3}$/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function exists(path) {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
}

async function get(url) {
    for (let attempt = 1; ; attempt++) {
        const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
        if (res.ok) return res.text();
        if (res.status === 404) return null;
        if (attempt >= 4) throw new Error(`HTTP ${res.status} en ${url}`);
        await sleep(DELAY_MS * 10 * attempt); // 429 o error temporal: esperar más antes de reintentar
    }
}

async function loadIds() {
    const file = join(CACHE, 'ids.json');
    if (await exists(file)) return JSON.parse(await readFile(file, 'utf8'));

    const html = await get(`${BASE}/es/library/all`);
    const ids = [...new Set([...html.matchAll(/\/es\/cards\/([A-Za-z0-9-]+)/g)].map((m) => m[1]))]
        .filter((id) => ID_RE.test(id));
    await writeFile(file, JSON.stringify(ids, null, 2));
    return ids;
}

async function loadCardHtml(id) {
    const file = join(CACHE, 'html', `${id}.html.gz`);
    const missing = `${file}.missing`;
    if (await exists(file)) return gunzipSync(await readFile(file)).toString('utf8');
    if (await exists(missing)) return null;

    await sleep(DELAY_MS);
    const html = await get(`${BASE}/es/cards/${id}`);
    if (html === null) {
        await writeFile(missing, '');
        return null;
    }
    await writeFile(file, gzipSync(html));
    return html;
}

async function main() {
    const { values } = parseArgs({ options: { limit: { type: 'string' } } });
    const limit = values.limit ? Number(values.limit) : Infinity;

    await mkdir(join(CACHE, 'html'), { recursive: true });
    const ids = (await loadIds()).slice(0, limit);
    console.log(`${ids.length} cartas`);

    const cards = {};
    const errors = [];
    for (const [i, id] of ids.entries()) {
        try {
            const html = await loadCardHtml(id);
            const card = html && cardFromHtml(html);
            if (card) cards[id] = card;
            else errors.push({ id, error: html === null ? 'no existe (404)' : 'sin meta description' });
        } catch (err) {
            errors.push({ id, error: err.message });
        }
        if ((i + 1) % 100 === 0) console.log(`${i + 1}/${ids.length}`);
    }

    // Palabras clave en [corchetes] que no están en el catálogo conocido: revisar a mano.
    const unknownKeywords = new Map();
    for (const [id, card] of Object.entries(cards)) {
        for (const text of [card.effect, card.trigger]) {
            for (const m of text.matchAll(TOKEN_RE)) {
                if (!KNOWN_KEYWORDS.has(m[1])) {
                    if (!unknownKeywords.has(m[1])) unknownKeywords.set(m[1], []);
                    unknownKeywords.get(m[1]).push(id);
                }
            }
        }
    }

    await writeFile(join(CACHE, 'cards.en.json'), JSON.stringify(cards, null, 2));
    await writeFile(join(CACHE, 'report.json'), JSON.stringify({
        ok: Object.keys(cards).length,
        errors,
        unknownKeywords: Object.fromEntries(unknownKeywords),
    }, null, 2));
    console.log(`ok ${Object.keys(cards).length} · errores ${errors.length} · palabras clave desconocidas ${unknownKeywords.size}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
