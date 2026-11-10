import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyHint,
  assertLevel,
  buildRoundFromWords,
  createPuzzleState,
  isLevelClear,
  normalizeWord,
  shuffleOrder,
  slotsForWord,
  submitWord,
  type PuzzleLevel,
} from './engine.ts';
import { WORD_BANK } from './words.ts';

const kas: PuzzleLevel = {
  id: 'kas',
  title: 'Kaş',
  letters: ['K', 'A', 'Ş'],
  words: [
    {
      id: 'kas',
      text: 'KAŞ',
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    },
    {
      id: 'ask',
      text: 'AŞK',
      cells: [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
      ],
    },
  ],
  bonus: [],
};

const cay: PuzzleLevel = {
  id: 'cay',
  title: 'Çay',
  letters: ['Ç', 'A', 'Y', 'O', 'L'],
  words: [
    {
      id: 'cay',
      text: 'ÇAY',
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    },
    {
      id: 'yol',
      text: 'YOL',
      cells: [
        { row: 0, col: 2 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
      ],
    },
  ],
  bonus: ['OY'],
};

test('bölüm ızgarası kendi içinde tutarlı', () => {
  assert.doesNotThrow(() => assertLevel(kas));
  assert.doesNotThrow(() => assertLevel(cay));
});

test('Türkçe büyük harf İ ve ı ayırır', () => {
  assert.equal(normalizeWord('kaş'), 'KAŞ');
  assert.equal(normalizeWord('i'), 'İ');
  assert.equal(normalizeWord('ı'), 'I');
});

test('doğru kelime ızgaraya işlenir ve puan yazar', () => {
  const level = kas;
  const state = createPuzzleState(level);
  const played = submitWord(level, state, [0, 1, 2]);
  assert.equal(played.result, 'found');
  assert.deepEqual(played.state.foundIds, ['kas']);
  assert.equal(played.state.score, 60);
});

test('yanlış kelime puan yazmaz', () => {
  const level = kas;
  const state = createPuzzleState(level);
  const played = submitWord(level, state, [0, 2]);
  assert.equal(played.result, 'invalid');
  assert.equal(played.state.score, 0);
  assert.deepEqual(played.state.foundIds, []);
});

test('aynı kelime ikinci kez puan vermez', () => {
  const level = kas;
  const first = submitWord(level, createPuzzleState(level), [0, 1, 2]);
  const second = submitWord(level, first.state, [0, 1, 2]);
  assert.equal(second.result, 'duplicate');
  assert.equal(second.state.score, first.state.score);
});

test('ek kelime az puan verir ve bölümü bitirmez', () => {
  const level = cay;
  const played = submitWord(level, createPuzzleState(level), [3, 2]);
  assert.equal(played.result, 'bonus');
  assert.equal(played.state.score, 10);
  assert.equal(isLevelClear(level, played.state), false);
});

test('iki kelime bulununca bölüm biter', () => {
  const level = kas;
  const first = submitWord(level, createPuzzleState(level), [0, 1, 2]);
  const second = submitWord(level, first.state, [1, 2, 0]);
  assert.equal(second.result, 'found');
  assert.equal(isLevelClear(level, second.state), true);
});

test('karıştırma aynı harfleri korur', () => {
  const order = [0, 1, 2, 3];
  const shuffled = shuffleOrder(order, () => 0);
  assert.deepEqual([...shuffled].sort(), [...order].sort());
  assert.notDeepEqual(shuffled, order);
});

test('ipucu bir kare açar ve puandan düşer', () => {
  const level = kas;
  const hinted = applyHint(level, createPuzzleState(level, 50));
  assert.equal(hinted.revealed, true);
  assert.deepEqual(hinted.state.revealed, ['0:0']);
  assert.equal(hinted.state.score, 30);
});

test('harf sırasından kelime yolu bulunur', () => {
  assert.deepEqual(slotsForWord(['K', 'A', 'Ş'], 'AŞK'), [1, 2, 0]);
  assert.equal(slotsForWord(['K', 'A'], 'AŞK'), null);
});

test('kelime bankası en az bin kelime tutar', () => {
  assert.ok(WORD_BANK.length >= 1000);
  assert.ok(WORD_BANK.every((word) => word.length >= 3 && word.length <= 6));
});

test('bankadan kurulan tur oynanabilir', () => {
  let cursor = 0;
  const random = () => {
    cursor += 0.173;
    return cursor % 1;
  };
  for (let index = 0; index < 25; index += 1) {
    const level = buildRoundFromWords(WORD_BANK, random);
    assertLevel(level);
    assert.ok(level.words.length >= 2);
    assert.ok(level.letters.length <= 7);
    for (const word of level.words) {
      assert.ok(slotsForWord(level.letters, word.text));
    }
  }
});
