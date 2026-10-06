// Reúne los textos únicos en inglés (efecto y disparador) y los reparte en lotes para traducir.
// Uso: node scripts/build-batches.mjs
// Salida: .cache/en/strings.json (clave → texto) y .cache/en/batches/b-NNN.json con los lotes.
import { readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE = join(fileURLToPath(new URL('..', import.meta.url)), '.cache', 'en');
const BATCH_SIZE = 120;

const cards = JSON.parse(await readFile(join(CACHE, 'cards.en.json'), 'utf8'));

// Cada texto distinto se traduce una sola vez: muchas cartas comparten efecto.
const keyByText = new Map();
for (const card of Object.values(cards)) {
    for (const text of [card.effect, card.trigger]) {
        if (text && !keyByText.has(text)) keyByText.set(text, `s${String(keyByText.size + 1).padStart(5, '0')}`);
    }
}
const strings = Object.fromEntries([...keyByText].map(([text, key]) => [key, text]));

const batchesDir = join(CACHE, 'batches');
await rm(batchesDir, { recursive: true, force: true });
await mkdir(batchesDir, { recursive: true });
await writeFile(join(CACHE, 'strings.json'), JSON.stringify(strings, null, 2));

const keys = Object.keys(strings);
let batchCount = 0;
for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    batchCount++;
    const batch = Object.fromEntries(keys.slice(i, i + BATCH_SIZE).map((key) => [key, strings[key]]));
    const name = `b-${String(batchCount).padStart(3, '0')}.json`;
    await writeFile(join(batchesDir, name), JSON.stringify(batch, null, 2));
}

console.log(`${Object.keys(cards).length} cartas · ${keys.length} textos únicos · ${batchCount} lotes de ${BATCH_SIZE}`);
