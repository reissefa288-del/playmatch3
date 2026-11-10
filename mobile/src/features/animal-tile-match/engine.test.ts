import assert from 'node:assert/strict';
import test from 'node:test';

import { boardCells } from './board-layout.ts';
import {
  chooseBotMove,
  commitMatches,
  createMatchFromTiles,
  isSelectable,
  kindTotals,
  removeFromTray,
  selectTile,
  shuffleBoard,
  tick,
  undoAction,
  type MatchState,
  type TileModel,
} from './engine.ts';
import type { TileKind } from './kinds.ts';
import { scoring } from './scoring.ts';

function tile(id: string, kind: TileKind, c: number, r: number, layer: 0 | 1 = 1): TileModel {
  return { id, kind, c, r, layer, removed: false };
}

function matchOf(human: TileModel[], bot: TileModel[] = [tile('b0', 'moon', 0, 0)]): MatchState {
  return createMatchFromTiles(bot, human);
}

test('selects a free tile and rejects a covered or side-blocked tile', () => {
  const human = [
    tile('left', 'fox', 0, 0),
    tile('mid', 'fox', 1, 0),
    tile('right', 'bear', 2, 0),
    tile('under', 'owl', 1.42, 0.34, 0),
  ];
  const state = matchOf(human);
  assert.equal(isSelectable(human[0]!, human), true);
  assert.equal(isSelectable(human[2]!, human), true);
  assert.equal(isSelectable(human[1]!, human), false);
  assert.equal(isSelectable(human[3]!, human), false);

  const blocked = selectTile(state, 'human', 'mid');
  assert.equal(blocked.effect, 'rejected');
  assert.equal(blocked.state.players.human.tiles.find((item) => item.id === 'mid')!.removed, false);

  const covered = selectTile(state, 'human', 'under');
  assert.equal(covered.effect, 'rejected');

  const picked = selectTile(state, 'human', 'left');
  assert.equal(picked.effect, 'selected');
  assert.equal(picked.state.players.human.tray.length, 1);
  assert.equal(picked.state.players.human.tiles.find((item) => item.id === 'left')!.removed, true);
  assert.equal(picked.state.players.human.score, 0);
});

test('unlocks a covered tile after the tile above it leaves', () => {
  const human = [tile('top', 'fox', 0, 0, 1), tile('under', 'owl', 0.2, 0.2, 0)];
  const state = matchOf(human);
  assert.equal(isSelectable(human[1]!, human), false);
  const next = selectTile(state, 'human', 'top').state;
  const under = next.players.human.tiles.find((item) => item.id === 'under')!;
  assert.equal(isSelectable(under, next.players.human.tiles), true);
});

test('completes one triple, keeps other tray tiles, and scores once', () => {
  const human = [
    tile('a', 'fox', 0, 0),
    tile('b', 'bear', 3, 0),
    tile('c', 'fox', 6, 0),
    tile('d', 'fox', 9, 0),
    tile('e', 'fox', 12, 0),
  ];
  let state = matchOf(human);
  state = selectTile(state, 'human', 'a').state;
  state = selectTile(state, 'human', 'b').state;
  state = selectTile(state, 'human', 'c').state;
  const matched = selectTile(state, 'human', 'd');
  assert.equal(matched.effect, 'matched');
  assert.equal(matched.state.players.human.score, scoring.triplePoints);
  assert.equal(matched.state.players.human.triples, 1);
  const settled = commitMatches(matched.state);
  assert.deepEqual(
    settled.players.human.tray.map((item) => item.kind),
    ['bear'],
  );
  const again = commitMatches(settled);
  assert.equal(again.players.human.score, scoring.triplePoints);
  state = selectTile(settled, 'human', 'e').state;
  assert.equal(state.players.human.score, scoring.triplePoints);
  assert.equal(state.players.human.tray.length, 2);
});

test('fills seven slots and refuses an eighth without taking the tile', () => {
  const kinds: TileKind[] = ['fox', 'bear', 'owl', 'frog', 'cat', 'moon', 'leaf', 'star'];
  const human = kinds.map((kind, index) => tile(`t${index}`, kind, index * 3, 0));
  let state = matchOf(human);
  for (let i = 0; i < 7; i += 1) state = selectTile(state, 'human', `t${i}`).state;
  assert.equal(state.players.human.tray.length, 7);
  assert.equal(state.players.human.status, 'playing');
  const overflow = selectTile(state, 'human', 't7');
  assert.equal(overflow.effect, 'lost');
  assert.equal(overflow.state.players.human.loss, 'tray');
  assert.equal(overflow.state.players.human.tray.length, 7);
  assert.equal(overflow.state.players.human.tiles.find((item) => item.id === 't7')!.removed, false);
  assert.equal(overflow.state.phase, 'playing');
});

test('shuffle keeps tile counts and spends one charge', () => {
  const human = [tile('a', 'fox', 0, 0), tile('b', 'fox', 3, 0), tile('c', 'bear', 6, 0), tile('d', 'owl', 9, 0)];
  const state = matchOf(human);
  let cursor = 0;
  const rng = () => {
    cursor += 1;
    return cursor % 2 === 0 ? 0 : 0.9;
  };
  const shuffled = shuffleBoard(state, 'human', rng);
  assert.equal(shuffled.effect, 'shuffled');
  assert.equal(shuffled.state.players.human.powers.shuffle, 0);
  assert.equal(shuffled.state.players.human.tray.length, 0);
  const before = kindTotals(state.players.human.tiles);
  const after = kindTotals(shuffled.state.players.human.tiles);
  assert.equal(after.get('fox'), before.get('fox'));
  assert.equal(after.get('bear'), before.get('bear'));
  assert.deepEqual(
    shuffled.state.players.human.tiles.map((item) => item.c),
    state.players.human.tiles.map((item) => item.c),
  );
  assert.equal(shuffleBoard(shuffled.state, 'human').effect, 'noop');
});

test('remove spends a charge only when the tray has a tile and prefers a singleton', () => {
  const human = [tile('a', 'fox', 0, 0), tile('b', 'fox', 3, 0), tile('c', 'bear', 6, 0), tile('d', 'owl', 9, 0)];
  let state = matchOf(human);
  assert.equal(removeFromTray(state, 'human').effect, 'noop');
  assert.equal(state.players.human.powers.remove, 1);
  state = selectTile(state, 'human', 'a').state;
  state = selectTile(state, 'human', 'b').state;
  state = selectTile(state, 'human', 'c').state;
  const removed = removeFromTray(state, 'human');
  assert.equal(removed.effect, 'removed');
  assert.deepEqual(
    removed.state.players.human.tray.map((item) => item.kind),
    ['fox', 'fox'],
  );
  assert.equal(removed.state.players.human.powers.remove, 0);
  assert.equal(removeFromTray(removed.state, 'human').effect, 'noop');
});

test('undo restores the board, tray, and score', () => {
  const human = [tile('a', 'fox', 0, 0), tile('b', 'fox', 3, 0), tile('c', 'fox', 6, 0)];
  let state = matchOf(human);
  assert.equal(undoAction(state, 'human').effect, 'noop');
  state = selectTile(state, 'human', 'a').state;
  state = selectTile(state, 'human', 'b').state;
  state = selectTile(state, 'human', 'c').state;
  const undone = undoAction(state, 'human');
  assert.equal(undone.effect, 'undone');
  assert.equal(undone.state.players.human.score, 0);
  assert.equal(undone.state.players.human.triples, 0);
  assert.equal(undone.state.players.human.tray.length, 2);
  assert.equal(undone.state.players.human.tiles.find((item) => item.id === 'c')!.removed, false);
  assert.equal(undone.state.players.human.powers.undo, 0);
});

test('bot chooses only a selectable tile on its own board', () => {
  const bot = [tile('free', 'fox', 0, 0), tile('mid', 'bear', 1, 0), tile('end', 'owl', 2, 0), tile('under', 'cat', 1.3, 0.3, 0)];
  const human = [tile('secret', 'moon', 0, 0)];
  const state = matchOf(human, bot);
  const move = chooseBotMove(state.players.bot, () => 0);
  assert.equal(move?.type, 'select');
  if (move?.type !== 'select') return;
  assert.notEqual(move.id, 'mid');
  assert.notEqual(move.id, 'under');
  assert.notEqual(move.id, 'secret');
  const picked = state.players.bot.tiles.find((item) => item.id === move.id)!;
  assert.equal(isSelectable(picked, state.players.bot.tiles), true);
});

test('timer expiry ends the match and equal scores draw', () => {
  const state = matchOf([tile('a', 'fox', 0, 0)]);
  const ended = tick(state, scoring.matchMs);
  assert.equal(ended.phase, 'ended');
  assert.equal(ended.remainingMs, 0);
  assert.equal(ended.result?.winner, 'draw');
  assert.equal(selectTile(ended, 'human', 'a').effect, 'noop');
});

test('a cleared board beats a higher score, otherwise score then triples decide', () => {
  const human = [tile('a', 'fox', 0, 0)];
  let state = matchOf(human, [tile('b', 'bear', 0, 0), tile('c', 'bear', 3, 0)]);
  state = selectTile(state, 'human', 'a').state;
  assert.equal(state.players.human.status, 'won');
  assert.equal(state.result?.winner, 'human');
  assert.equal(state.result?.reason, 'clear');

  const timed = createMatchFromTiles(
    [tile('b1', 'fox', 0, 0), tile('b2', 'fox', 3, 0), tile('b3', 'fox', 6, 0), tile('b4', 'owl', 9, 0)],
    [tile('h1', 'owl', 0, 0), tile('h2', 'bear', 3, 0)],
  );
  let scored = selectTile(timed, 'bot', 'b1').state;
  scored = selectTile(scored, 'bot', 'b2').state;
  scored = selectTile(scored, 'bot', 'b3').state;
  scored = commitMatches(scored);
  assert.equal(scored.players.bot.score, scoring.triplePoints);
  assert.equal(scored.phase, 'playing');
  const finished = tick(scored, scoring.matchMs);
  assert.equal(finished.result?.winner, 'bot');
  assert.equal(finished.result?.reason, 'score');
});

test('equal scores fall through to triples and then a draw', () => {
  const base = matchOf([tile('h', 'fox', 0, 0)], [tile('b', 'bear', 0, 0)]);
  const byTriples = tick(
    {
      ...base,
      players: {
        bot: { ...base.players.bot, score: 300, triples: 2 },
        human: { ...base.players.human, score: 300, triples: 1 },
      },
    },
    scoring.matchMs,
  );
  assert.equal(byTriples.result?.winner, 'bot');
  assert.equal(byTriples.result?.reason, 'triples');
  const drawn = tick(
    {
      ...base,
      players: {
        bot: { ...base.players.bot, score: 300, triples: 1 },
        human: { ...base.players.human, score: 300, triples: 1 },
      },
    },
    scoring.matchMs,
  );
  assert.equal(drawn.result?.winner, 'draw');
});

test('both arenas share one pyramid and start with a free tile', () => {
  const upper = boardCells('upper');
  const lower = boardCells('lower');
  assert.equal(upper.length, lower.length);
  upper.forEach((slot, index) => {
    const twin = lower[index]!;
    assert.equal(slot.kind, twin.kind);
    assert.equal(slot.c, twin.c);
    assert.equal(slot.r, twin.r);
    assert.equal(slot.layer, twin.layer);
  });
  const tiles = upper.map((slot) => ({ ...slot, removed: false }));
  const totals = kindTotals(tiles);
  for (const count of totals.values()) assert.equal(count % 3, 0);
  assert.ok(tiles.filter((item) => isSelectable(item, tiles)).length > 0);
});
