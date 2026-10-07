// Catálogo de palabras clave real del sitio, obtenido escaneando los <span> de las ~3090
// páginas cacheadas (texto, color de fondo, forma). Dos colores → dos categorías, como en
// el panel de la extensión: ámbar para habilidad (flecha, naranja) y azul para momento
// (rectángulo, azul). "Once Per Turn" y "Trigger" se agrupan con las de momento.
// Los contadores de coste "DON!! x1/x2/x3" (rectángulo negro) no llevan color propio.
export const ABILITY_KEYWORDS = new Set([
    'Blocker', 'Rush', 'Rush: Character', 'Double Attack', 'Banish', 'Unblockable',
]);

export const TIMING_KEYWORDS = new Set([
    'On Play', 'Activate: Main', 'Main', 'When Attacking', 'On K.O.', 'Your Turn',
    "Opponent's Turn", "On Your Opponent's Attack", 'End of Your Turn', 'On Block',
    'Once Per Turn', 'Trigger',
]);

export const KNOWN_KEYWORDS = new Set([
    ...ABILITY_KEYWORDS, ...TIMING_KEYWORDS, 'DON!! x1', 'DON!! x2', 'DON!! x3', 'DON!!x1',
]);
