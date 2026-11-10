import {
  activeWeapon,
  bossPhase,
  createMatch,
  resetMatch,
  stepMatch,
  type Enemy,
  type MatchInput,
} from './sim';

const none: MatchInput = { blue: null, red: null, blueSpecial: false, redSpecial: false };

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function placeEnemy(match: ReturnType<typeof createMatch>, patch: Partial<Enemy>) {
  const enemy = match.enemies[0] ?? {
    alive: false,
    id: 0,
    kind: 'fighter' as const,
    boss: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    w: 40,
    h: 40,
    hp: 30,
    maxHp: 30,
    fireCd: 9,
    turnCd: 9,
    age: 0,
    score: 100,
    lastHit: 'blue' as const,
    lane: 'blue' as const,
  };
  if (!match.enemies.includes(enemy)) match.enemies.push(enemy);
  Object.assign(enemy, patch, { alive: true });
  return enemy;
}

const match = createMatch(360, 640, () => 0.1);
const blue = match.players[0];
const red = match.players[1];

blue.y = 0;
red.y = 600;
stepMatch(match, 0.5, { ...none, blue: { x: 10, y: 0 }, red: { x: 400, y: 600 } });
assert(blue.y >= 640 * 0.68, 'blue stays in the lower field');
assert(red.y <= 640 * 0.46 && red.y >= 640 * 0.28, 'red stays in the upper lane');
assert(blue.x >= blue.w * 0.4 && red.x <= 360 - red.w * 0.4, 'ships stay inside the width');

const enemy = placeEnemy(match, {
  x: blue.x,
  y: blue.y - 80,
  hp: 40,
  maxHp: 40,
  fireCd: 9,
  kind: 'fighter',
  w: 40,
  h: 40,
  lane: 'blue',
});
const before = enemy.hp;
match.bullets.push({
  alive: true,
  id: 99,
  owner: 'blue',
  lane: 'blue',
  kind: 'single',
  x: enemy.x,
  y: enemy.y,
  vx: 0,
  vy: -1,
  w: 10,
  h: 20,
  damage: 10,
  life: 2,
  pierce: 0,
  hits: [],
});
const redHp = red.hp;
stepMatch(match, 1 / 60, none);
assert(enemy.hp === before - 10, 'player bullet hurts an enemy once');
assert(red.hp === redHp, 'player bullet does not hurt the ally');
stepMatch(match, 1 / 60, none);
assert(enemy.hp === before - 10, 'the same bullet does not hit twice');

match.bullets.push({
  alive: true,
  id: 100,
  owner: 'enemy',
  lane: 'blue',
  kind: 'single',
  x: blue.x,
  y: blue.y,
  vx: 0,
  vy: 1,
  w: 10,
  h: 20,
  damage: 15,
  life: 2,
  pierce: 0,
  hits: [],
});
blue.shield = 3;
blue.invuln = 0;
const shielded = blue.hp;
stepMatch(match, 1 / 60, none);
assert(blue.hp === shielded, 'shield blocks damage');

blue.shield = 0;
blue.invuln = 0;
match.bullets.push({
  alive: true,
  id: 101,
  owner: 'enemy',
  lane: 'blue',
  kind: 'single',
  x: blue.x,
  y: blue.y,
  vx: 0,
  vy: 1,
  w: 10,
  h: 20,
  damage: 15,
  life: 2,
  pierce: 0,
  hits: [],
});
stepMatch(match, 1 / 60, none);
assert(blue.hp === shielded - 15, 'enemy bullet hurts the player');

blue.weaponLevel = 1;
assert(activeWeapon(blue) === 'single', 'level 1 is single');
blue.doubleShot = 4;
assert(activeWeapon(blue) === 'twin', 'double shot fires twins');
blue.spread = 4;
assert(activeWeapon(blue) === 'spread', 'spread changes the pattern');
blue.laser = 4;
assert(activeWeapon(blue) === 'laser', 'laser replaces the pattern');
blue.laser = 0;
blue.spread = 0;
blue.doubleShot = 0;
blue.weaponLevel = 4;
assert(activeWeapon(blue) === 'heavy', 'level 4 is the piercing shot');
blue.weaponLevel = 5;
assert(activeWeapon(blue) === 'special', 'level 5 is the special shot');

blue.fireCd = 0;
blue.weaponLevel = 3;
blue.spread = 0;
blue.laser = 0;
const shotsBefore = match.bullets.filter((bullet) => bullet.alive && bullet.owner === 'blue').length;
stepMatch(match, 1 / 60, none);
const shotsAfter = match.bullets.filter((bullet) => bullet.alive && bullet.owner === 'blue').length;
assert(shotsAfter >= shotsBefore + 3, 'spread fires three bullets');

function pump(match: ReturnType<typeof createMatch>, seconds: number) {
  for (let i = 0; i < Math.round(seconds / 0.05); i += 1) stepMatch(match, 0.05, none);
}

const wave = createMatch(360, 640, () => 0.2);
wave.lanes.blue.toSpawn = 0;
wave.lanes.red.toSpawn = 0;
for (const item of wave.enemies) item.alive = false;
pump(wave, 0.2);
assert(wave.lanes.blue.wave === 1 && wave.lanes.red.wave === 1, 'a cleared stage waits before the next one');
pump(wave, 1.5);
assert(wave.lanes.blue.wave === 2 && wave.lanes.blue.toSpawn > 0, 'the next stage brings another enemy group');
assert(wave.lanes.red.wave === 2, 'the red lane advances on its own');
wave.lanes.blue.toSpawn = 0;
wave.lanes.red.toSpawn = 0;
for (const item of wave.enemies) item.alive = false;
pump(wave, 1.6);
assert(wave.lanes.blue.wave === 3, 'stages keep advancing while the players are alive');
wave.lanes.blue.toSpawn = 0;
wave.lanes.red.toSpawn = 0;
for (const item of wave.enemies) item.alive = false;
pump(wave, 1.6);
assert(wave.lanes.blue.wave === 4 && wave.enemies.some((item) => item.alive && item.boss && item.lane === 'blue'), 'every fourth stage is a boss');
const boss = wave.enemies.find((item) => item.boss);
assert(!!boss && bossPhase(boss) === 1, 'boss starts in phase 1');
if (boss) boss.hp = boss.maxHp * 0.2;
assert(boss !== undefined && bossPhase(boss) === 3, 'low health changes the boss phase');

const paused = createMatch(360, 640, () => 0.4);
paused.mode = 'paused';
paused.lanes.blue.toSpawn = 0;
paused.lanes.red.toSpawn = 0;
paused.lanes.blue.clearWait = 0.05;
stepMatch(paused, 1, none);
assert(paused.lanes.blue.wave === 1, 'pause freezes the stage');

const scored = createMatch(360, 640, () => 0.4);
scored.players[0].score = 500;
scored.lanes.blue.wave = 6;
resetMatch(scored);
assert(scored.players[0].score === 0 && scored.lanes.blue.wave === 1 && scored.lanes.red.wave === 1, 'restart clears the match');

const kinds = new Set(wave.enemies.map((item) => item.kind));
assert(kinds.has('elite'), 'boss uses the elite kind');

const aim = createMatch(360, 640, () => 0.1);
aim.players[0].fireCd = 0;
aim.players[1].fireCd = 0;
aim.players[0].weaponLevel = 1;
aim.players[1].weaponLevel = 1;
stepMatch(aim, 0.05, none);
const shots = aim.bullets.filter((bullet) => bullet.alive && bullet.owner !== 'enemy');
assert(shots.length >= 2 && shots.every((bullet) => bullet.vy < 0), 'both ships shoot upward');
pump(aim, 1);
assert(aim.enemies.some((item) => item.alive && item.lane === 'blue' && item.vy > 0), 'blue lane enemies dive down');
assert(aim.enemies.some((item) => item.alive && item.lane === 'red' && item.vy > 0), 'red lane enemies dive down');

const end = createMatch(360, 640, () => 0.3);
const victim = end.players[0];
victim.hp = 10;
victim.extraLives = 0;
victim.invuln = 0;
victim.shield = 0;
end.bullets.push({
  alive: true,
  id: 7,
  owner: 'enemy',
  lane: 'blue',
  kind: 'single',
  x: victim.x,
  y: victim.y,
  vx: 0,
  vy: 1,
  w: 10,
  h: 20,
  damage: 40,
  life: 2,
  pierce: 0,
  hits: [],
});
stepMatch(end, 1 / 60, none);
assert(end.mode === 'over' && end.outcome === 'Mavi kaybetti', 'the player who dies loses');

console.log('galaxy-duel sim checks passed');
