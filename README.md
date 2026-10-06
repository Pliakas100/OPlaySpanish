# OPlay en Español

Extensión de Chrome (Manifest V3, JS plano sin build) que muestra en español el
efecto de las cartas de One Piece Card Game en [oplaytcg.com](https://oplaytcg.com).
Al pasar el ratón (o hacer click) sobre una carta aparece su traducción.

## Cargar en Chrome

1. Abre `chrome://extensions` y activa **Modo de desarrollador**.
2. Pulsa **Cargar descomprimida** y selecciona esta carpeta.
3. Recarga oplaytcg.com.

## Estructura

- `manifest.json`: content script en `https://oplaytcg.com/*`, permiso `storage`.
- `src/content.js`: detecta el ID de carta (`OP18-001`, `P-001`…) en `src`, `srcset`,
  `href`, `data-*` y `background-image` hasta 6 niveles por encima del objetivo,
  y muestra el panel en Shadow DOM.
- `popup/`: activar/desactivar, modo hover o click, logs y "Analizar esta página".
- `data/cards.es.json`: diccionario de traducciones (ver formato abajo).

## Formato del diccionario

```json
{
    "version": 1,
    "updated": "2026-10-06",
    "cards": {
        "OP18-001": {
            "name": "…",
            "trigger": "…",
            "effect": "Texto en español con [Rush] y {Tipo}",
            "en": { "effect": "Original en inglés" }
        }
    }
}
```

`[Palabra]` se muestra como palabra clave y `{Tipo}` en cursiva.

## Pipeline del diccionario

Todo sale de `npm run …` (Node 18+, sin dependencias). La caché va a `.cache/` (ignorada por git).

1. `npm run extract`: descarga la ficha en inglés de cada carta, a 1 petición por segundo.
   Es reanudable: lo ya descargado no se vuelve a pedir.
2. `npm run batches`: reúne los textos únicos y los reparte en lotes de 120 en `.cache/en/batches/`.
3. Traducir cada lote con `scripts/translate-prompt.md` y `scripts/glossary.es.json`.
   Las salidas van a `.cache/en/translations/`.
4. `npm run merge`: valida que cada texto tenga traducción y que `[Palabra]` / `{Tipo}` se conserven,
   y escribe `data/cards.es.json`. Si hay errores no escribe nada.

Tests: `npm test`.
