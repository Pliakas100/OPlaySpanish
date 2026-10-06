// Une las traducciones de .cache/en/translations/*.json en data/cards.es.json.
// Valida que cada texto tenga traducción y que [Palabra] y {Tipo} se conserven.
// Uso: node scripts/merge.mjs [--out ruta]   (por defecto data/cards.es.json)
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { sameTokens } from './lib/tokens.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CACHE = join(ROOT, '.cache', 'en');

const { values } = parseArgs({ options: { out: { type: 'string' } } });
const outFile = values.out ?? join(ROOT, 'data', 'cards.es.json');

const cards = JSON.parse(await readFile(join(CACHE, 'cards.en.json'), 'utf8'));
const strings = JSON.parse(await readFile(join(CACHE, 'strings.json'), 'utf8'));

const translations = {};
const dir = join(CACHE, 'translations');
for (const name of (await readdir(dir)).filter((f) => f.endsWith('.json'))) {
    Object.assign(translations, JSON.parse(await readFile(join(dir, name), 'utf8')));
}

const problems = [];
for (const [key, en] of Object.entries(strings)) {
    const es = translations[key];
    if (!es?.trim()) problems.push({ key, en, problem: 'sin traducción' });
    else if (!sameTokens(en, es)) problems.push({ key, en, es, problem: 'marcadores distintos' });
}

if (problems.length) {
    await writeFile(join(CACHE, 'merge-problems.json'), JSON.stringify(problems, null, 2));
    console.error(`${problems.length} textos con problemas (ver .cache/en/merge-problems.json). No se ha escrito nada.`);
    process.exit(1);
}

const keyByText = Object.fromEntries(Object.entries(strings).map(([key, text]) => [text, key]));
const esFor = (text) => (text ? translations[keyByText[text]] : undefined);

const out = {};
for (const [id, card] of Object.entries(cards)) {
    const entry = { name: card.name, effect: esFor(card.effect) ?? '' };
    if (card.trigger) entry.trigger = esFor(card.trigger);
    entry.en = { effect: card.effect };
    if (card.trigger) entry.en.trigger = card.trigger;
    out[id] = entry;
}

await writeFile(outFile, JSON.stringify({
    version: 1,
    updated: new Date().toISOString().slice(0, 10),
    cards: out,
}, null, 4) + '\n');
console.log(`${Object.keys(out).length} cartas escritas en ${outFile}`);
