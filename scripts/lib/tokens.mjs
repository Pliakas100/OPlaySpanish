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
