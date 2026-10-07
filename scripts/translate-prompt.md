# Instrucciones para traducir un lote

Traduce al español **la frase entera, con gramática española correcta**. Esto
no es sustituir palabras sueltas del glosario dentro de una frase en inglés:
el resultado tiene que leerse como español natural de principio a fin.

- Entrada: un fichero JSON `{ "clave": "texto en inglés", ... }`.
- Salida: un fichero JSON con exactamente las mismas claves y el texto traducido.

## Ejemplo

Entrada:
`"Once Per Turn, you may rest 2 DON!! cards: draw 1 card from your Life area and add it to your hand."`

❌ Mal (esto es lo que NO hay que hacer — solo cambia palabras del glosario, el resto sigue en inglés):
`"[Once Per Turn], you may descansar 2 DON!! cards: draw 1 card from your Life area and add it to your mano."`

✅ Bien (la frase completa en español):
`"[Once Per Turn], puedes descansar 2 cartas DON!! para: robar 1 carta de tu zona de Vida y añadirla a tu mano."`

## Reglas

1. Traduce todo el texto, no solo los términos del glosario. El glosario
   (`scripts/glossary.es.json`) es para que un mismo término de juego se
   diga siempre igual (p. ej. "Character" → "Personaje" en todas las cartas),
   no es una lista de las únicas palabras que se pueden tocar.
2. Todo lo que esté entre corchetes `[...]` o llaves `{...}` se copia tal
   cual, sin traducir ni mover de sitio (son palabras clave y tipos de carta,
   o el nombre de otra carta citada por su nombre, p. ej. `[Monkey.D.Luffy]`).
3. Mantén números, signos (`+1000`, `➁`) y `DON!!` igual.
4. Español neutro, tuteo (tú), sin voseo.
5. Cada clave del fichero de entrada debe aparecer en la salida, aunque el
   texto sea muy corto (p. ej. `"[Blocker]"` → `"[Blocker]"`, sin más texto
   que traducir, se queda igual).
6. No añadas explicaciones: escribe solo el fichero de salida.

Al terminar responde solo `ok <número de claves>`.
