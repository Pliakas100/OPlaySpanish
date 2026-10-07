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
`"[Once Per Turn], you may girar 2 DON!! cards: draw 1 card from your Life area and add it to your mano."`

✅ Bien (la frase completa en español):
`"[Once Per Turn], puedes girar 2 cartas DON!! para: robar 1 carta de tu zona de Vida y añadirla a tu mano."`

Otro fallo frecuente: mezclar el infinitivo con el imperativo dentro de la misma
frase. Si una acción ya está en imperativo ("Roba 2 cartas"), la siguiente
acción coordinada con "y"/"." también va en imperativo, nunca en infinitivo:

❌ Mal: `"Roba 2 cartas y descartar 1 carta de tu mano."`
✅ Bien: `"Roba 2 cartas y descarta 1 carta de tu mano."`
✅ Bien también (ambas en infinitivo, coordinadas bajo "puedes"): `"Puedes descartar 1 carta y robar 2."`

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
7. El verbo principal de una frase va en imperativo tú ("Roba", "Da", "Gira",
   "Descarta", "Activa"...), no en infinitivo, salvo que vaya justo detrás de
   "puedes/debes/para/sin/al" (ahí el infinitivo es correcto: "puedes girar").
8. "Rest" es girar la carta de lado, no descansar: "girar"/"gira"/"girado"
   (nunca "descansar").

Al terminar responde solo `ok <número de claves>`.
