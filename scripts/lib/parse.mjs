// Extrae nombre, efecto y disparador de la meta description de una ficha de carta.
// La meta conserva los marcadores [Palabra] y {Tipo} que usa la extensión.

export function decodeEntities(text) {
    return text
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

export function parseMeta(description) {
    const text = decodeEntities(description).replace(/\s+/g, ' ').trim();
    const colon = text.indexOf(': ');
    const name = colon > 0 ? text.slice(0, colon) : null;

    const effect = text.match(/\bEffect: (.*?)(?= Trigger: |$)/)?.[1]?.trim() ?? '';
    const trigger = text.match(/\bTrigger: (.*)$/)?.[1]?.trim() ?? '';

    return {
        name,
        effect,
        trigger,
        // Un efecto que no termina en puntuación probablemente está cortado: se revisa a mano.
        suspicious: effect !== '' && !/[.)!"]$/.test(effect),
    };
}

// Devuelve null si la página no tiene meta description (p. ej. página de error).
export function cardFromHtml(html) {
    const content = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    return content === undefined ? null : parseMeta(content);
}
