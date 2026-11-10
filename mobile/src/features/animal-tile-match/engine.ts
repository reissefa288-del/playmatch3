import { overlapArea, tileRect } from './geometry';
import type { TileKind } from './kinds';
import { scoring } from './scoring';

export type PlayerId = 'bot' | 'human';

export type TileModel = {
  id: string;
  kind: TileKind;
  c: number;
  r: number;
  layer: number;
  removed: boolean;
};

export type TrayItem = {
  id: string;
  kind: TileKind;
  matching: boolean;
};

export type Powers = { shuffle: number; remove: number; undo: number };

export type PlayerStatus = 'playing' | 'won' | 'lost';

export type LossReason = 'tray' | 'stuck' | null;

export type PlayerSnapshot = {
  tiles: TileModel[];
  tray: TrayItem[];
  score: number;
  triples: number;
  status: PlayerStatus;
  loss: LossReason;
  pending: boolean;
};

export type PlayerState = PlayerSnapshot & {
  powers: Powers;
  history: PlayerSnapshot[];
  elapsedMs: number;
};

export type WinnerId = PlayerId | 'draw';

export type MatchResult = {
  winner: WinnerId;
  reason: 'clear' | 'score' | 'triples' | 'draw';
};

export type MatchState = {
  players: Record<PlayerId, PlayerState>;
  remainingMs: number;
  phase: 'playing' | 'ended';
  result: MatchResult | null;
  paused: boolean;
};

export type ActionEffect =
  | 'noop'
  | 'rejected'
  | 'selected'
  | 'matched'
  | 'lost'
  | 'won'
  | 'shuffled'
  | 'removed'
  | 'undone'
  | 'ended';

export type ActionResult = {
  state: MatchState;
  effect: ActionEffect;
};

const COVER_RATIO = 0.18;
const SIDE_OVERLAP = 0.45;
const SIDE_GAP = 0.22;

export function isCovered(tile: TileModel, tiles: readonly TileModel[]): boolean {
  if (tile.removed) return false;
  const mine = tileRect(tile.c, tile.r);
  return tiles.some((other) => {
    if (other.removed || other.id === tile.id || other.layer <= tile.layer) return false;
    return overlapArea(mine, tileRect(other.c, other.r)) > COVER_RATIO;
  });
}

function sideBlocked(tile: TileModel, tiles: readonly TileModel[], side: -1 | 1): boolean {
  const mine = tileRect(tile.c, tile.r);
  return tiles.some((other) => {
    if (other.removed || other.id === tile.id || other.layer !== tile.layer) return false;
    const theirs = tileRect(other.c, other.r);
    const yOverlap = Math.min(mine.y + mine.h, theirs.y + theirs.h) - Math.max(mine.y, theirs.y);
    if (yOverlap < SIDE_OVERLAP) return false;
    const gap = side === -1 ? mine.x - (theirs.x + theirs.w) : theirs.x - (mine.x + mine.w);
    return gap < SIDE_GAP && gap > -0.65;
  });
}

/** openFaces: a visible tile can be taken even when both neighbors block it. */
export type SelectRules = { openFaces?: boolean };

export function isSelectable(tile: TileModel, tiles: readonly TileModel[], rules?: SelectRules): boolean {
  if (tile.removed) return false;
  if (isCovered(tile, tiles)) return false;
  if (rules?.openFaces) return true;
  const left = sideBlocked(tile, tiles, -1);
  const right = sideBlocked(tile, tiles, 1);
  return !left || !right;
}

export function selectableTiles(tiles: readonly TileModel[], rules?: SelectRules): TileModel[] {
  return tiles.filter((tile) => isSelectable(tile, tiles, rules));
}

function cloneTiles(tiles: readonly TileModel[]): TileModel[] {
  return tiles.map((tile) => ({ ...tile }));
}

function cloneTray(tray: readonly TrayItem[]): TrayItem[] {
  return tray.map((item) => ({ ...item }));
}

function snapshot(player: PlayerState): PlayerSnapshot {
  return {
    tiles: cloneTiles(player.tiles),
    tray: cloneTray(player.tray),
    score: player.score,
    triples: player.triples,
    status: player.status,
    loss: player.loss,
    pending: player.pending,
  };
}

function blankPlayer(idTiles: TileModel[]): PlayerState {
  return {
    tiles: idTiles.map((tile) => ({ ...tile, removed: false })),
    tray: [],
    score: 0,
    triples: 0,
    powers: { shuffle: scoring.startingCharges, remove: scoring.startingCharges, undo: scoring.startingCharges },
    status: 'playing',
    loss: null,
    pending: false,
    history: [],
    elapsedMs: 0,
  };
}

export function createMatchFromTiles(bot: TileModel[], human: TileModel[]): MatchState {
  return {
    players: { bot: blankPlayer(bot), human: blankPlayer(human) },
    remainingMs: scoring.matchMs,
    phase: 'playing',
    result: null,
    paused: false,
  };
}

function countsOf(items: readonly { kind: TileKind }[]): Map<TileKind, number> {
  const counts = new Map<TileKind, number>();
  for (const item of items) counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1);
  return counts;
}

function settlePlayer(player: PlayerState, rules?: SelectRules): PlayerState {
  if (player.status !== 'playing' || player.pending) return player;
  const left = player.tiles.filter((tile) => !tile.removed);
  if (left.length === 0) return { ...player, status: 'won', loss: null };
  if (selectableTiles(player.tiles, rules).length === 0) return { ...player, status: 'lost', loss: 'stuck' };
  return player;
}

function comparePlayers(a: PlayerState, b: PlayerState): WinnerId {
  if (a.score !== b.score) return a.score > b.score ? 'bot' : 'human';
  if (a.triples !== b.triples) return a.triples > b.triples ? 'bot' : 'human';
  return 'draw';
}

export function judge(state: MatchState): MatchResult {
  const { bot, human } = state.players;
  if (bot.status === 'won' && human.status !== 'won') return { winner: 'bot', reason: 'clear' };
  if (human.status === 'won' && bot.status !== 'won') return { winner: 'human', reason: 'clear' };
  const winner = comparePlayers(bot, human);
  if (winner === 'draw') return { winner: 'draw', reason: 'draw' };
  if (bot.triples !== human.triples && bot.score === human.score) return { winner, reason: 'triples' };
  return { winner, reason: 'score' };
}

function maybeFinish(state: MatchState): MatchState {
  if (state.phase === 'ended') return state;
  const { bot, human } = state.players;
  const botDone = bot.status !== 'playing';
  const humanDone = human.status !== 'playing';
  const someoneCleared = bot.status === 'won' || human.status === 'won';
  if (!someoneCleared && !(botDone && humanDone)) return state;
  return { ...state, phase: 'ended', result: judge(state) };
}

function withPlayer(state: MatchState, id: PlayerId, player: PlayerState): MatchState {
  return maybeFinish({ ...state, players: { ...state.players, [id]: player } });
}

function guard(state: MatchState, id: PlayerId): PlayerState | null {
  if (state.phase !== 'playing') return null;
  const player = state.players[id];
  if (player.status !== 'playing' || player.pending) return null;
  return player;
}

function markTriple(tray: TrayItem[], kind: TileKind): TrayItem[] {
  let left = 3;
  return tray.map((item) => {
    if (left > 0 && item.kind === kind && !item.matching) {
      left -= 1;
      return { ...item, matching: true };
    }
    return item;
  });
}

export function selectTile(state: MatchState, id: PlayerId, tileId: string, rules?: SelectRules): ActionResult {
  const player = guard(state, id);
  if (!player) return { state, effect: 'noop' };
  const tile = player.tiles.find((item) => item.id === tileId);
  if (!tile || !isSelectable(tile, player.tiles, rules)) return { state, effect: 'rejected' };
  if (player.tray.length >= scoring.traySlots) {
    const lost: PlayerState = { ...player, status: 'lost', loss: 'tray' };
    return { state: withPlayer(state, id, lost), effect: 'lost' };
  }
  const history = [...player.history, snapshot(player)].slice(-scoring.undoHistory);
  const tiles = player.tiles.map((item) => (item.id === tile.id ? { ...item, removed: true } : item));
  let tray: TrayItem[] = [...player.tray, { id: tile.id, kind: tile.kind, matching: false }];
  let score = player.score;
  let triples = player.triples;
  let pending = false;
  let effect: ActionEffect = 'selected';
  const held = tray.filter((item) => item.kind === tile.kind && !item.matching).length;
  if (held >= 3) {
    tray = markTriple(tray, tile.kind);
    score += scoring.triplePoints;
    triples += 1;
    pending = true;
    effect = 'matched';
  }
  let next: PlayerState = { ...player, tiles, tray, score, triples, pending, history };
  if (!pending) next = settlePlayer(next, rules);
  if (next.status === 'won') effect = 'won';
  if (next.status === 'lost') effect = 'lost';
  return { state: withPlayer(state, id, next), effect };
}

export function commitMatches(state: MatchState, rules?: SelectRules): MatchState {
  if (state.phase === 'ended') return state;
  let next = state;
  (['bot', 'human'] as const).forEach((id) => {
    const player = next.players[id];
    if (!player.pending) return;
    const tray = player.tray.filter((item) => !item.matching);
    let settled: PlayerState = { ...player, tray, pending: false };
    settled = settlePlayer(settled, rules);
    next = withPlayer(next, id, settled);
  });
  return next;
}

export function shuffleBoard(state: MatchState, id: PlayerId, rng: () => number = Math.random): ActionResult {
  const player = guard(state, id);
  if (!player || player.powers.shuffle <= 0) return { state, effect: 'noop' };
  const open = player.tiles.filter((tile) => !tile.removed);
  if (open.length < 2) return { state, effect: 'noop' };
  const kinds = open.map((tile) => tile.kind);
  for (let i = kinds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = kinds[i]!;
    kinds[i] = kinds[j]!;
    kinds[j] = swap;
  }
  let cursor = 0;
  const tiles = player.tiles.map((tile) => {
    if (tile.removed) return tile;
    const kind = kinds[cursor]!;
    cursor += 1;
    return { ...tile, kind };
  });
  const next: PlayerState = {
    ...player,
    tiles,
    powers: { ...player.powers, shuffle: player.powers.shuffle - 1 },
  };
  return { state: withPlayer(state, id, next), effect: 'shuffled' };
}

export function removeFromTray(state: MatchState, id: PlayerId): ActionResult {
  const player = guard(state, id);
  if (!player || player.powers.remove <= 0) return { state, effect: 'noop' };
  if (player.tray.length === 0 || player.tray.every((item) => item.matching)) return { state, effect: 'noop' };
  const live = player.tray.filter((item) => !item.matching);
  const counts = countsOf(live);
  const pick =
    live.find((item) => (counts.get(item.kind) ?? 0) === 1) ??
    live.find((item) => (counts.get(item.kind) ?? 0) !== 2) ??
    live[0];
  if (!pick) return { state, effect: 'noop' };
  const tray = player.tray.filter((item) => item.id !== pick.id);
  const next: PlayerState = {
    ...player,
    tray,
    powers: { ...player.powers, remove: player.powers.remove - 1 },
  };
  return { state: withPlayer(state, id, settlePlayer(next)), effect: 'removed' };
}

export function undoAction(state: MatchState, id: PlayerId): ActionResult {
  if (state.phase !== 'playing') return { state, effect: 'noop' };
  const player = state.players[id];
  if (player.status !== 'playing' || player.powers.undo <= 0 || player.history.length === 0) return { state, effect: 'noop' };
  const previous = player.history[player.history.length - 1]!;
  const next: PlayerState = {
    ...player,
    ...previous,
    tiles: cloneTiles(previous.tiles),
    tray: cloneTray(previous.tray),
    powers: { ...player.powers, undo: player.powers.undo - 1 },
    history: player.history.slice(0, -1),
    elapsedMs: player.elapsedMs,
  };
  return { state: withPlayer(state, id, next), effect: 'undone' };
}

export function tick(state: MatchState, dtMs: number): MatchState {
  if (state.phase !== 'playing' || state.paused || dtMs <= 0) return state;
  const remainingMs = Math.max(0, state.remainingMs - dtMs);
  const players = { ...state.players };
  (['bot', 'human'] as const).forEach((id) => {
    const player = players[id];
    if (player.status === 'playing') players[id] = { ...player, elapsedMs: player.elapsedMs + dtMs };
  });
  const stepped: MatchState = { ...state, remainingMs, players };
  if (remainingMs > 0) return stepped;
  if (stepped.phase === 'ended') return stepped;
  return { ...stepped, phase: 'ended', result: judge(stepped) };
}

export function setPaused(state: MatchState, paused: boolean): MatchState {
  if (state.paused === paused) return state;
  return { ...state, paused };
}

export type BotMove = { type: 'select'; id: string };

export function chooseBotMove(player: PlayerState, rng: () => number = Math.random, rules?: SelectRules): BotMove | null {
  if (player.status !== 'playing' || player.pending) return null;
  const open = selectableTiles(player.tiles, rules);
  if (open.length === 0 || player.tray.length >= scoring.traySlots) return null;
  const trayCounts = countsOf(player.tray.filter((item) => !item.matching));
  const completers = open.filter((tile) => (trayCounts.get(tile.kind) ?? 0) >= 2);
  if (completers.length > 0) return { type: 'select', id: completers[Math.floor(rng() * completers.length)]!.id };
  const pairs = open.filter((tile) => (trayCounts.get(tile.kind) ?? 0) === 1);
  if (pairs.length > 0) return { type: 'select', id: pairs[Math.floor(rng() * pairs.length)]!.id };
  const remaining = countsOf(player.tiles.filter((tile) => !tile.removed));
  const ranked = [...open].sort((a, b) => (remaining.get(b.kind) ?? 0) - (remaining.get(a.kind) ?? 0));
  return { type: 'select', id: ranked[0]!.id };
}

export function applyBotMove(state: MatchState, rng: () => number = Math.random, rules?: SelectRules): ActionResult {
  if (state.phase !== 'playing' || state.paused) return { state, effect: 'noop' };
  const move = chooseBotMove(state.players.bot, rng, rules);
  if (!move) return { state, effect: 'noop' };
  return selectTile(state, 'bot', move.id, rules);
}

export function kindTotals(tiles: readonly { kind: TileKind; removed?: boolean }[]): Map<TileKind, number> {
  return countsOf(tiles.filter((tile) => !tile.removed));
}
