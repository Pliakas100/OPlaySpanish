// Marcadores que deben sobrevivir a la traducción tal cual: [Palabra] y {Tipo}.
const TOKEN_RE = /\[[^\]]+\]|\{[^}]+\}/g;

export function tokensOf(text) {
    return (text.match(TOKEN_RE) ?? []).sort();
}

export function sameTokens(source, translation) {
    const a = tokensOf(source);
    const b = tokensOf(translation);
    return a.length === b.length && a.every((token, i) => token === b[i]);
}

// A veces el traductor traduce el contenido de un marcador en vez de dejarlo igual
// (p. ej. [Your Turn] → [Tu turno], cuando esa palabra clave no estaba en el glosario).
// Si hay el mismo número de marcadores en el mismo orden, se puede corregir solo:
// se reconstruye cada [..]/{..} de la traducción con el texto original en esa posición,
// sin tocar el resto de la frase ya traducida. Si el número no coincide, no es seguro
// adivinar cuál se perdió o se añadió, y se devuelve null para revisarlo a mano.
export function repairTokens(source, translation) {
    const sourceTokens = source.match(TOKEN_RE) ?? [];
    const translationTokens = translation.match(TOKEN_RE) ?? [];
    if (sourceTokens.length !== translationTokens.length) return null;
    let i = 0;
    return translation.replace(TOKEN_RE, () => sourceTokens[i++]);
}
