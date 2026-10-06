import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardFromHtml, parseMeta } from '../lib/parse.mjs';
import { sameTokens, tokensOf } from '../lib/tokens.mjs';

const KAROO_META = 'Karoo: Blue/Red LEADER card from the One Piece Card Game (OP18-001). Rarity Leader · 4 life · Alabasta, Animal Effect: All of your Characters with both the {Animal} and {Alabasta} types gain [Rush] and +1000 power. [Once Per Turn] When your {Alabasta} type Character is K.O.&#x27;d, draw 1 card.';

test('parseMeta extrae nombre y efecto de Karoo', () => {
    const card = parseMeta(KAROO_META);
    assert.equal(card.name, 'Karoo');
    assert.equal(
        card.effect,
        "All of your Characters with both the {Animal} and {Alabasta} types gain [Rush] and +1000 power. [Once Per Turn] When your {Alabasta} type Character is K.O.'d, draw 1 card.",
    );
    assert.equal(card.trigger, '');
    assert.equal(card.suspicious, false);
});

test('parseMeta separa el disparador del efecto', () => {
    const card = parseMeta('Foo: Red CHARACTER card (OP01-001). Effect: Draw 1 card. Trigger: Draw 1 card.');
    assert.equal(card.effect, 'Draw 1 card.');
    assert.equal(card.trigger, 'Draw 1 card.');
});

test('parseMeta marca como sospechoso un efecto sin puntuación final', () => {
    const card = parseMeta('Foo: Red EVENT card (OP01-002). Effect: [Main] Draw 2 cards and');
    assert.equal(card.suspicious, true);
});

test('cardFromHtml lee la meta description de la página', () => {
    const html = `<html><head><meta name="description" content="Karoo: Blue/Red LEADER card (OP18-001). Effect: Draw 1 card."/></head></html>`;
    assert.equal(cardFromHtml(html).effect, 'Draw 1 card.');
    assert.equal(cardFromHtml('<html></html>'), null);
});

test('tokensOf y sameTokens comprueban los marcadores', () => {
    assert.deepEqual(tokensOf('Gana [Rush] y {Animal}.'), ['[Rush]', '{Animal}']);
    assert.equal(sameTokens('Gana [Rush] y {Animal}.', 'Obtiene [Rush] y {Animal}.'), true);
    assert.equal(sameTokens('Gana [Rush].', 'Obtiene [Acometida].'), false);
});
