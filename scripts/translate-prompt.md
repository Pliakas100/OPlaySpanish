# Instrucciones para traducir un lote

Traduce al español los textos del juego One Piece Card Game.

- Entrada: un fichero JSON `{ "clave": "texto en inglés", ... }`.
- Salida: un fichero JSON con exactamente las mismas claves y el texto traducido.

Reglas:
1. Lee `scripts/glossary.es.json` y aplícalo.
2. Todo lo que esté entre corchetes `[...]` o llaves `{...}` se copia tal cual, sin traducir.
3. Mantén números, signos (`+1000`), `DON!!` y la puntuación.
4. Cada clave del fichero de entrada debe aparecer en la salida, aunque el texto sea muy corto.
5. No añadas explicaciones: escribe solo el fichero de salida.

Al terminar responde solo `ok <número de claves>`.
