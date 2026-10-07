import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardFromHtml, sectionText } from '../lib/parse.mjs';
import { repairTokens, sameTokens, tokensOf } from '../lib/tokens.mjs';

// Fragmentos reales (recortados) de la estructura que genera el sitio.
const KAROO_HTML = `
<meta name="description" content="Karoo: Blue/Red LEADER card from the One Piece Card Game (OP18-001)."/>
<h2>Efecto</h2><div lang="en"><p class="whitespace-pre-line ">All of your Characters with both the {Animal} and {Alabasta} types gain <span class="bg-[#E8801E]">Rush</span> and +1000 power. <span class="bg-[#BE4464]">Once Per Turn</span> When your {Alabasta} type Character is K.O.&#x27;d, draw 1 card.</p></div>
`;

const TRIGGER_HTML = `
<meta name="description" content="Carrot: Green CHARACTER card (OP01-009)."/>
<h2>Efecto</h2><div lang="en"><p class="whitespace-pre-line ">Sin efecto</p></div>
<h2>Trigger</h2><div lang="en"><p class="whitespace-pre-line "><span class="bg-[#F5E83A]">Trigger</span> Play this card.</p></div>
`;

test('cardFromHtml reconstruye los corchetes desde los <span> de palabra clave', () => {
    const card = cardFromHtml(KAROO_HTML);
    assert.equal(card.name, 'Karoo');
    assert.equal(
        card.effect,
        "All of your Characters with both the {Animal} and {Alabasta} types gain [Rush] and +1000 power. [Once Per Turn] When your {Alabasta} type Character is K.O.'d, draw 1 card.",
    );
    assert.equal(card.trigger, '');
});

test('cardFromHtml normaliza "Sin efecto" a vacío y lee el disparador', () => {
    const card = cardFromHtml(TRIGGER_HTML);
    assert.equal(card.name, 'Carrot');
    assert.equal(card.effect, '');
    assert.equal(card.trigger, '[Trigger] Play this card.');
});

test('sectionText devuelve vacío si no existe la sección', () => {
    assert.equal(sectionText('<h2>Efecto</h2>', 'Trigger'), '');
});

test('cardFromHtml devuelve null para una página sin ficha de carta', () => {
    assert.equal(cardFromHtml('<html><body>404</body></html>'), null);
});

test('tokensOf y sameTokens comprueban los marcadores', () => {
    assert.deepEqual(tokensOf('Gana [Rush] y {Animal}.'), ['[Rush]', '{Animal}']);
    assert.equal(sameTokens('Gana [Rush] y {Animal}.', 'Obtiene [Rush] y {Animal}.'), true);
    assert.equal(sameTokens('Gana [Rush].', 'Obtiene [Acometida].'), false);
});

test('repairTokens restaura el marcador traducido cuando el número coincide', () => {
    const en = "[Your Turn] This Character gains [Double Attack].";
    const es = 'Este Personaje gana [Doble Ataque] en [Tu turno].'; // orden distinto, mismo nº
    assert.equal(repairTokens(en, es), 'Este Personaje gana [Your Turn] en [Double Attack].');
});

test('repairTokens devuelve null si el número de marcadores no coincide', () => {
    assert.equal(repairTokens('Gana [Rush] y {Animal}.', 'Obtiene algo.'), null);
});
