# OPlay en Español

Extensión de Chrome que traduce al español el efecto de las cartas de **One
Piece Card Game** en [oplaytcg.com](https://oplaytcg.com). Al pasar el ratón
(o hacer click) sobre una carta aparece un panel con su texto traducido.

No es oficial ni está afiliada a Bandai ni a OPlayTCG: es un proyecto hecho
por un aficionado, para aficionados.

## Instalarla

Todavía no está en la Chrome Web Store, así que se instala "descomprimida".
Chrome avisará de que tiene el **modo de desarrollador** activo — es normal
en extensiones que no vienen de la tienda, no significa que esté rota.

1. Entra en <https://github.com/Pliakas100/opiberiatcg>, pulsa el botón verde
   **Code** → **Download ZIP**, y descomprime el archivo donde quieras.
2. Abre `chrome://extensions` (o el equivalente en Edge/Brave, que también
   valen).
3. Activa **Modo de desarrollador** (arriba a la derecha).
4. Pulsa **Cargar descomprimida** y selecciona la carpeta que acabas de
   descomprimir (la que contiene `manifest.json`).
5. Entra en [oplaytcg.com](https://oplaytcg.com) y pasa el ratón por encima
   de cualquier carta.

Cuando el diccionario se actualice con cartas nuevas, vuelve a descargar el
ZIP, sustituye la carpeta y pulsa el botón de recargar (↻) en
`chrome://extensions`.

## Cómo se usa

- **Pasar el ratón** por encima de una carta muestra su traducción. El panel
  se puede arrastrar por la barra de arriba.
- **Fijar** mantiene el panel abierto aunque muevas el ratón; **×** o la
  tecla `Esc` lo cierran.
- El icono de la extensión abre un menú con:
  - **Activa**: apaga la extensión sin desinstalarla.
  - **Mostrar al**: pasar el ratón o hacer click.
  - **Mantener visible siempre**: el panel no se oculta solo; sigue
    mostrando la última carta que miraste hasta que lo cierres a mano.
  - **Analizar esta página**: útil en el Coliseo (`/play`) para comprobar si
    las cartas en la partida se detectan igual que en la ficha de carta.

## Traducciones y fallos

El texto en español sale de un diccionario (`data/cards.es.json`) traducido
automáticamente y revisado con comprobaciones de calidad, pero no por una
persona bilingüe carta a carta — puede quedar alguna frase rara. Cada carta
incluye su texto original en inglés plegado, por si quieres comparar.

¿Una carta está mal traducida o algo no cuadra? Abre un
[issue en GitHub](https://github.com/Pliakas100/opiberiatcg/issues) con el
ID de la carta (p. ej. `OP18-001`) y qué debería decir.

## Para quien quiera tocar el código

- `manifest.json`: Manifest V3, content script en `https://oplaytcg.com/*`,
  permiso `storage`.
- `src/content.js`: detecta el ID de carta (`OP18-001`, `P-001`…) en `src`,
  `srcset`, `href`, `data-*` y `background-image` hasta 6 niveles por encima
  del objetivo, y muestra el panel en Shadow DOM.
- `popup/`: la configuración descrita arriba.
- `data/cards.es.json`: el diccionario (formato abajo).
- `scripts/`: el pipeline que genera el diccionario (siguiente sección).

### Formato del diccionario

```json
{
    "version": 1,
    "updated": "2026-10-06",
    "cards": {
        "OP18-001": {
            "name": "Karoo",
            "effect": "Texto en español con [Rush] y {Tipo}",
            "trigger": "Opcional, mismo formato",
            "en": { "effect": "Original en inglés" }
        }
    }
}
```

`[Palabra]` se muestra como palabra clave (en inglés, a propósito) y
`{Tipo}` en cursiva.

### Pipeline del diccionario

Todo sale de `npm run …` (Node 18+, sin dependencias). La caché va a
`.cache/` (ignorada por git).

1. `npm run extract`: descarga la ficha en inglés de cada carta, a 1
   petición por segundo. Es reanudable: lo ya descargado no se vuelve a
   pedir.
2. `npm run batches`: reúne los textos únicos y los reparte en lotes de 120
   en `.cache/en/batches/`.
3. Traducir cada lote con `scripts/translate-prompt.md` y
   `scripts/glossary.es.json`. Las salidas van a `.cache/en/translations/`.
4. `npm run merge`: valida que cada texto tenga traducción y que
   `[Palabra]` / `{Tipo}` se conserven, y escribe `data/cards.es.json`. Si
   hay errores no escribe nada.

Tests: `npm test`.

## Licencia

[MIT](LICENSE).
