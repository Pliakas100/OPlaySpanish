// Extrae nombre, efecto y disparador de la página de una carta.
// El nombre sale de la meta description (no se corta nunca). El efecto y el disparador
// salen del cuerpo de la página bajo los títulos "Efecto" y "Trigger": ahí el texto está
// completo, y cada palabra clave va en un <span> que aquí se convierte en "[Palabra]".
// (La propia meta description también trae [Palabra], pero el sitio la recorta a ~200
// caracteres y corta casi la mitad de los efectos a mitad de frase.)

const SPAN_RE = /<span[^>]*>([^<]*)<\/span>/g;

// El dato de origen a veces tiene la palabra clave mal escrita (visto en EB05-006,
// EB05-057 y P-149), así que el sitio no la reconoce y la deja en corchetes sin
// colorear. Se corrige a la forma que usa el resto de cartas.
const KEYWORD_FIXUPS = {
    '[Activate Main]': '[Activate: Main]',
    '[Active:Main]': '[Activate: Main]',
    '[Rush:Character]': '[Rush: Character]',
};

export function decodeEntities(text) {
    return text
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function nameFromMeta(html) {
    const content = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (!content) return null;
    const text = decodeEntities(content);
    const colon = text.indexOf(': ');
    return colon > 0 ? text.slice(0, colon) : null;
}

// Texto del primer <p> bajo el <h2>heading</h2>, con cada <span>Palabra</span> → "[Palabra]".
// Las secciones de carta no tienen más de un párrafo (comprobado sobre toda la caché).
export function sectionText(html, heading) {
    const h2 = html.indexOf(`>${heading}</h2>`);
    if (h2 === -1) return '';
    const pStart = html.indexOf('<p', h2);
    const pEnd = html.indexOf('</p>', pStart);
    if (pStart === -1 || pEnd === -1) return '';

    const inner = html.slice(html.indexOf('>', pStart) + 1, pEnd);
    const bracketed = inner.replace(SPAN_RE, (_, text) => `[${text.trim()}]`);
    let text = decodeEntities(bracketed.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
    for (const [wrong, right] of Object.entries(KEYWORD_FIXUPS)) text = text.split(wrong).join(right);
    return text;
}

// null si la página no es una ficha de carta (p. ej. un error 404 servido como 200).
export function cardFromHtml(html) {
    const name = nameFromMeta(html);
    let effect = sectionText(html, 'Efecto');
    const trigger = sectionText(html, 'Trigger');
    if (effect === 'Sin efecto') effect = ''; // así marca el sitio una carta sin habilidad
    if (!name && !effect && !trigger) return null;
    return { name, effect, trigger };
}
