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
