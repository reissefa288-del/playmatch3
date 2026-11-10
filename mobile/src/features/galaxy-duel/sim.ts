/** Frame-rate-independent Galaxy Duel combat. No rendering. */

export type Side = 'blue' | 'red';
export type EnemyKind = 'scout' | 'fighter' | 'interceptor' | 'heavy' | 'sniper' | 'bomber' | 'elite';
export type ShotKind = 'single' | 'twin' | 'spread' | 'rapid' | 'heavy' | 'laser' | 'plasma' | 'special';
export type PickupKind =
  | 'weapon-upgrade'
  | 'double-shot'
  | 'spread-shot'
  | 'rapid-fire'
  | 'laser'
  | 'plasma'
  | 'shield'
  | 'damage-boost'
  | 'extra-life'
  | 'bomb'
  | 'speed-boost'
  | 'magnet';
export type FxKind = 'small' | 'medium' | 'large' | 'death' | 'impact' | 'pickup';
export type MatchMode = 'playing' | 'paused' | 'over';

export type LaneState = {
  wave: number;
  toSpawn: number;
  clearWait: number;
  spawnCd: number;
  announce: string;
  announceTime: number;
};

export type Player = {
  side: Side;
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  extraLives: number;
  score: number;
  weaponLevel: number;
  fireCd: number;
  specialCd: number;
  invuln: number;
  hitFlash: number;
  shield: number;
  rapid: number;
  spread: number;
  doubleShot: number;
  laser: number;
  plasma: number;
  damageBoost: number;
  speedBoost: number;
  magnet: number;
  alive: boolean;
  respawn: number;
};

export type Bullet = {
  alive: boolean;
  id: number;
  owner: Side | 'enemy';
  lane: Side;
  kind: ShotKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  damage: number;
  life: number;
  pierce: number;
  hits: number[];
};

export type Enemy = {
  alive: boolean;
  id: number;
  kind: EnemyKind;
  boss: boolean;
  lane: Side;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  fireCd: number;
  turnCd: number;
  age: number;
  score: number;
  lastHit: Side;
};

export type Pickup = {
  alive: boolean;
  id: number;
  kind: PickupKind;
  x: number;
  y: number;
  w: number;
  h: number;
  life: number;
};

export type Asteroid = {
  alive: boolean;
  id: number;
  variant: 0 | 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hp: number;
};

export type Fx = {
  alive: boolean;
  id: number;
  kind: FxKind;
  x: number;
  y: number;
  w: number;
  h: number;
  age: number;
};

export type TouchPoint = { x: number; y: number } | null;

export type MatchInput = {
  blue: TouchPoint;
  red: TouchPoint;
  blueSpecial: boolean;
  redSpecial: boolean;
};

type Def = {
  hp: number;
  speed: number;
  damage: number;
  score: number;
  w: number;
  h: number;
  fire: number;
};

const DEFS: Record<EnemyKind, Def> = {
  scout: { hp: 2, speed: 250, damage: 6, score: 50, w: 30, h: 46, fire: 0 },
  fighter: { hp: 5, speed: 110, damage: 10, score: 100, w: 42, h: 42, fire: 1.35 },
  interceptor: { hp: 4, speed: 200, damage: 8, score: 140, w: 40, h: 52, fire: 1.1 },
  heavy: { hp: 16, speed: 52, damage: 16, score: 260, w: 56, h: 60, fire: 1.7 },
  sniper: { hp: 7, speed: 36, damage: 18, score: 300, w: 24, h: 72, fire: 1.9 },
  bomber: { hp: 12, speed: 48, damage: 9, score: 320, w: 52, h: 66, fire: 2.1 },
  elite: { hp: 90, speed: 80, damage: 14, score: 1500, w: 96, h: 118, fire: 0.85 },
};

const PICKUPS: PickupKind[] = [
  'weapon-upgrade',
  'double-shot',
  'spread-shot',
  'rapid-fire',
  'laser',
  'plasma',
  'shield',
  'damage-boost',
  'extra-life',
  'bomb',
  'speed-boost',
  'magnet',
];

const MAX_BULLETS = 96;
const MAX_ENEMIES = 18;
const MAX_FX = 24;
const MAX_PICKUPS = 10;
const MAX_ASTEROIDS = 5;

export type Match = {
  width: number;
  height: number;
  mode: MatchMode;
  lanes: { blue: LaneState; red: LaneState };
  spawnCd: number;
  asteroidCd: number;
  scroll: number;
  bossId: number;
  outcome: string;
  players: [Player, Player];
  bullets: Bullet[];
  enemies: Enemy[];
  pickups: Pickup[];
  asteroids: Asteroid[];
  fx: Fx[];
  rng: () => number;
  nextId: number;
};

export function createMatch(width: number, height: number, rng: () => number = Math.random): Match {
  const match: Match = {
    width,
    height,
    mode: 'playing',
    lanes: { blue: createLane(), red: createLane() },
    spawnCd: 0.2,
    asteroidCd: 4,
    scroll: 0,
    bossId: 0,
    outcome: '',
    players: [makePlayer('blue', width, height), makePlayer('red', width, height)],
    bullets: [],
    enemies: [],
    pickups: [],
    asteroids: [],
    fx: [],
    rng,
    nextId: 1,
  };
  return match;
}

export function resizeMatch(match: Match, width: number, height: number) {
  match.width = width;
  match.height = height;
  for (const player of match.players) clampPlayer(match, player);
}

export function resetMatch(match: Match) {
  const { width, height, rng } = match;
  const fresh = createMatch(width, height, rng);
  Object.assign(match, fresh);
  match.players = fresh.players;
  match.bullets = fresh.bullets;
  match.enemies = fresh.enemies;
  match.pickups = fresh.pickups;
  match.asteroids = fresh.asteroids;
  match.fx = fresh.fx;
}

export function stepMatch(match: Match, dt: number, input: MatchInput) {
  if (match.mode !== 'playing') return;
  const step = Math.min(0.05, Math.max(0, dt));
  match.scroll += step * 28;
  for (const player of match.players) {
    tickPlayer(match, player, step, input);
  }
  tickSpawns(match, step);
  tickEnemies(match, step);
  tickBullets(match, step);
  tickPickups(match, step);
  tickAsteroids(match, step);
  tickFx(match, step);
  collide(match);
  const beaten = match.players.find((player) => !player.alive && player.respawn <= 0 && player.extraLives <= 0);
  if (beaten) finish(match, beaten.side === 'red' ? 'Kırmızı kaybetti' : 'Mavi kaybetti');
}

export function bossPhase(enemy: Enemy): 1 | 2 | 3 {
  const ratio = enemy.hp / enemy.maxHp;
  if (ratio > 0.6) return 1;
  if (ratio > 0.3) return 2;
  return 3;
}

export function activeWeapon(player: Player): ShotKind {
  if (player.laser > 0) return 'laser';
  if (player.plasma > 0) return 'plasma';
  if (player.spread > 0 || player.weaponLevel >= 3) {
    if (player.weaponLevel >= 5 && player.spread <= 0 && player.plasma <= 0) return 'special';
    if (player.weaponLevel >= 4 && player.spread <= 0) return 'heavy';
    return 'spread';
  }
  if (player.doubleShot > 0 || player.weaponLevel === 2) return 'twin';
  if (player.rapid > 0) return 'rapid';
  if (player.weaponLevel >= 5) return 'special';
  if (player.weaponLevel >= 4) return 'heavy';
  return 'single';
}

export function weaponLabel(player: Player): string {
  const names: Record<ShotKind, string> = {
    single: 'Tekli',
    twin: 'Çift',
    spread: 'Yayılım',
    rapid: 'Seri',
    heavy: 'Delici',
    laser: 'Lazer',
    plasma: 'Plazma',
    special: 'Özel',
  };
  return names[activeWeapon(player)];
}

function finish(match: Match, outcome: string) {
  match.mode = 'over';
  match.outcome = outcome;
}

function createLane(): LaneState {
  return { wave: 1, toSpawn: quota(1), clearWait: 0, spawnCd: 0.15, announce: 'Bölüm 1', announceTime: 1.6 };
}

function quota(wave: number) {
  return Math.min(12, 4 + wave);
}

function difficulty(wave: number) {
  return 1 + (wave - 1) * 0.14;
}

function makePlayer(side: Side, width: number, height: number): Player {
  const zone = side === 'blue' ? height * 0.82 : height * 0.38;
  return {
    side,
    x: width / 2,
    y: zone,
    w: 68,
    h: 88,
    hp: 100,
    maxHp: 100,
    extraLives: 2,
    score: 0,
    weaponLevel: 1,
    fireCd: 0.2,
    specialCd: 0,
    invuln: 1.2,
    hitFlash: 0,
    shield: 0,
    rapid: 0,
    spread: 0,
    doubleShot: 0,
    laser: 0,
    plasma: 0,
    damageBoost: 0,
    speedBoost: 0,
    magnet: 0,
    alive: true,
    respawn: 0,
  };
}

function clampPlayer(match: Match, player: Player) {
  const pad = player.w * 0.45;
  player.x = clamp(player.x, pad, match.width - pad);
  if (player.side === 'blue') {
    player.y = clamp(player.y, match.height * 0.68, match.height - player.h * 0.35);
  } else {
    player.y = clamp(player.y, match.height * 0.28, match.height * 0.46);
  }
}

function tickPlayer(match: Match, player: Player, dt: number, input: MatchInput) {
  player.fireCd = Math.max(0, player.fireCd - dt);
  player.specialCd = Math.max(0, player.specialCd - dt);
  player.invuln = Math.max(0, player.invuln - dt);
  player.hitFlash = Math.max(0, player.hitFlash - dt);
  for (const key of ['shield', 'rapid', 'spread', 'doubleShot', 'laser', 'plasma', 'damageBoost', 'speedBoost', 'magnet'] as const) {
    player[key] = Math.max(0, player[key] - dt);
  }
  if (!player.alive) {
    if (player.respawn > 0) {
      player.respawn -= dt;
      if (player.respawn <= 0) revive(match, player);
    }
    return;
  }
  const target = player.side === 'blue' ? input.blue : input.red;
  const speed = 280 * (player.speedBoost > 0 ? 1.5 : 1);
  if (target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      const step = Math.min(dist, speed * dt);
      player.x += (dx / dist) * step;
      player.y += (dy / dist) * step;
    }
  }
  clampPlayer(match, player);
  const weapon = activeWeapon(player);
  const interval = fireInterval(player, weapon);
  if (player.fireCd <= 0) {
    fireWeapon(match, player, weapon);
    player.fireCd = interval;
  }
  const special = player.side === 'blue' ? input.blueSpecial : input.redSpecial;
  if (special && player.specialCd <= 0) {
    fireWeapon(match, player, 'special');
    player.specialCd = 1.4;
  }
}

function fireInterval(player: Player, weapon: ShotKind) {
  const base =
    weapon === 'rapid' ? 0.11 : weapon === 'laser' ? 0.12 : weapon === 'spread' ? 0.34 : weapon === 'twin' ? 0.3 : weapon === 'heavy' ? 0.52 : weapon === 'plasma' ? 0.4 : weapon === 'special' ? 0.7 : 0.26;
  return player.rapid > 0 && weapon !== 'laser' ? base * 0.5 : base;
}

function fireWeapon(match: Match, player: Player, weapon: ShotKind) {
  const dir = -1;
  const damage = (player.damageBoost > 0 ? 1.6 : 1) * baseDamage(weapon);
  const speed = weapon === 'plasma' ? 420 : weapon === 'heavy' ? 760 : weapon === 'special' ? 560 : 680;
  if (weapon === 'laser') {
    for (const enemy of match.enemies) {
      if (!enemy.alive || enemy.lane !== player.side || enemy.y > player.y) continue;
      if (Math.abs(enemy.x - player.x) < enemy.w * 0.42 + 12) hurtEnemy(match, enemy, damage, player.side);
    }
    return;
  }
  const originY = player.y - player.h * 0.46;
  if (weapon === 'twin') {
    spawnBullet(match, player.side, weapon, player.x - 14, originY, 0, dir * speed, 16, 48, damage * 0.85, 0, player.side);
    spawnBullet(match, player.side, weapon, player.x + 14, originY, 0, dir * speed, 16, 48, damage * 0.85, 0, player.side);
    return;
  }
  if (weapon === 'spread') {
    for (const angle of [-0.42, 0, 0.42]) {
      const vx = Math.sin(angle) * speed;
      const vy = dir * Math.cos(angle) * speed;
      spawnBullet(match, player.side, weapon, player.x, originY, vx, vy, 16, 46, damage * 0.7, 0, player.side);
    }
    return;
  }
  if (weapon === 'special') {
    spawnBullet(match, player.side, weapon, player.x, originY, 0, dir * speed, 22, 84, damage, 0, player.side);
    return;
  }
  const heavy = weapon === 'heavy';
  spawnBullet(
    match,
    player.side,
    weapon,
    player.x,
    originY,
    0,
    dir * speed,
    heavy ? 18 : weapon === 'plasma' ? 32 : 16,
    heavy ? 68 : weapon === 'plasma' ? 32 : 50,
    damage,
    heavy ? 2 : 0,
    player.side,
  );
}

function baseDamage(weapon: ShotKind) {
  if (weapon === 'heavy') return 22;
  if (weapon === 'special') return 26;
  if (weapon === 'laser') return 8;
  if (weapon === 'plasma') return 16;
  if (weapon === 'rapid') return 6;
  return 10;
}

function spawnBullet(
  match: Match,
  owner: Side | 'enemy',
  kind: ShotKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  w: number,
  h: number,
  damage: number,
  pierce: number,
  lane: Side,
) {
  let bullet = match.bullets.find((item) => !item.alive);
  if (!bullet) {
    if (match.bullets.length >= MAX_BULLETS) return;
    bullet = {
      alive: false,
      id: 0,
      owner,
      lane,
      kind,
      x,
      y,
      vx,
      vy,
      w,
      h,
      damage,
      life: 0,
      pierce,
      hits: [],
    };
    match.bullets.push(bullet);
  }
  bullet.alive = true;
  bullet.id = match.nextId++;
  bullet.owner = owner;
  bullet.lane = lane;
  bullet.kind = kind;
  bullet.x = x;
  bullet.y = y;
  bullet.vx = vx;
  bullet.vy = vy;
  bullet.w = w;
  bullet.h = h;
  bullet.damage = damage;
  bullet.life = 2.4;
  bullet.pierce = pierce;
  bullet.hits = [];
}

function tickSpawns(match: Match, dt: number) {
  tickLane(match, 'red', dt);
  tickLane(match, 'blue', dt);
}

function tickLane(match: Match, side: Side, dt: number) {
  const lane = match.lanes[side];
  lane.announceTime = Math.max(0, lane.announceTime - dt);
  const mine = match.enemies.filter((enemy) => enemy.alive && enemy.lane === side);
  const boss = mine.some((enemy) => enemy.boss);
  const clear = !boss && lane.toSpawn <= 0 && mine.length === 0;
  if (clear) {
    if (lane.clearWait <= 0) lane.clearWait = 1.4;
    lane.clearWait -= dt;
    if (lane.clearWait <= 0) {
      lane.wave += 1;
      lane.clearWait = 0;
      lane.announce = `Bölüm ${lane.wave}`;
      lane.announceTime = 1.6;
      if (lane.wave % 4 === 0) {
        spawnEnemy(match, 'elite', true, side);
        lane.toSpawn = 0;
      } else {
        lane.toSpawn = quota(lane.wave);
        lane.spawnCd = 0.12;
      }
    }
    return;
  }
  lane.clearWait = 0;
  if (boss || lane.toSpawn <= 0) return;
  lane.spawnCd -= dt;
  if (lane.spawnCd > 0) return;
  if (spawnEnemy(match, rollKind(lane.wave, match.rng), false, side)) {
    lane.toSpawn -= 1;
    lane.spawnCd = Math.max(0.28, 0.62 - lane.wave * 0.03);
  } else {
    lane.spawnCd = 0.12;
  }
}

function rollKind(wave: number, rng: () => number): EnemyKind {
  const pool: EnemyKind[] = ['scout'];
  if (wave >= 2) pool.push('fighter', 'scout');
  if (wave >= 3) pool.push('interceptor');
  if (wave >= 4) pool.push('heavy', 'fighter');
  if (wave >= 5) pool.push('sniper');
  if (wave >= 6) pool.push('bomber', 'interceptor');
  return pool[Math.floor(rng() * pool.length)] ?? 'scout';
}

function laneEntry(match: Match, lane: Side) {
  return lane === 'red' ? -12 : match.height * 0.5;
}

function spawnEnemy(match: Match, kind: EnemyKind, boss: boolean, lane: Side) {
  const living = match.enemies.filter((enemy) => enemy.alive && enemy.lane === lane).length;
  if (!boss && living >= 6) return false;
  const def = DEFS[kind];
  const wave = match.lanes[lane].wave;
  const scale = boss ? 1 + wave * 0.08 : difficulty(wave);
  const enemy = takeEnemy(match);
  if (!enemy) return false;
  enemy.alive = true;
  enemy.id = match.nextId++;
  enemy.kind = kind;
  enemy.boss = boss;
  enemy.lane = lane;
  enemy.w = def.w * (boss ? 1.15 : 1);
  enemy.h = def.h * (boss ? 1.15 : 1);
  enemy.x = enemy.w + match.rng() * (match.width - enemy.w * 2);
  enemy.y = laneEntry(match, lane);
  enemy.vx = kind === 'interceptor' ? (match.rng() < 0.5 ? -1 : 1) * def.speed : 0;
  enemy.vy = def.speed * (boss ? 0.3 : 0.9);
  enemy.hp = Math.round(def.hp * scale * (boss ? 1.4 : 1));
  enemy.maxHp = enemy.hp;
  enemy.fireCd = def.fire * 0.6;
  enemy.turnCd = 0.8;
  enemy.age = 0;
  enemy.score = def.score;
  enemy.lastHit = lane;
  if (boss) {
    enemy.y = lane === 'red' ? match.height * 0.12 : match.height * 0.56;
    enemy.vy = 0;
    enemy.vx = def.speed;
    match.bossId = enemy.id;
  }
  return true;
}

function takeEnemy(match: Match): Enemy | null {
  const found = match.enemies.find((enemy) => !enemy.alive);
  if (found) return found;
  if (match.enemies.length >= MAX_ENEMIES + 1) return null;
  const enemy = emptyEnemy();
  match.enemies.push(enemy);
  return enemy;
}

function emptyEnemy(): Enemy {
  return {
    alive: false,
    id: 0,
    kind: 'scout',
    boss: false,
    lane: 'blue',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    w: 1,
    h: 1,
    hp: 1,
    maxHp: 1,
    fireCd: 0,
    turnCd: 0,
    age: 0,
    score: 0,
    lastHit: 'blue',
  };
}

function tickEnemies(match: Match, dt: number) {
  for (const enemy of match.enemies) {
    if (!enemy.alive) continue;
    enemy.age += dt;
    enemy.fireCd -= dt;
    if (enemy.boss) tickBoss(match, enemy, dt);
    else moveGrunt(match, enemy, dt);
    const floor = enemy.lane === 'red' ? match.height * 0.5 : match.height + 70;
    if (enemy.y > floor) enemy.alive = false;
  }
}

function moveGrunt(match: Match, enemy: Enemy, dt: number) {
  const def = DEFS[enemy.kind];
  if (enemy.kind === 'scout') {
    enemy.x += Math.sin(enemy.age * 7) * 30 * dt;
    enemy.y += enemy.vy * dt;
  } else if (enemy.kind === 'interceptor') {
    enemy.turnCd -= dt;
    if (enemy.turnCd <= 0) {
      enemy.vx = (match.rng() < 0.5 ? -1 : 1) * def.speed;
      enemy.turnCd = 0.55 + match.rng() * 0.7;
    }
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * 0.65 * dt;
    if (enemy.x < enemy.w || enemy.x > match.width - enemy.w) enemy.vx *= -1;
  } else if (enemy.kind === 'sniper') {
    const anchor = enemy.vx >= 0 ? match.width * 0.78 : match.width * 0.22;
    enemy.x += (anchor - enemy.x) * Math.min(1, dt * 1.4);
    enemy.y += enemy.vy * 0.25 * dt;
    enemy.vx = enemy.x < match.width / 2 ? -1 : 1;
  } else {
    enemy.y += enemy.vy * dt;
    enemy.x += Math.sin(enemy.age * 1.4) * (enemy.kind === 'heavy' || enemy.kind === 'bomber' ? 8 : 16) * dt;
  }
  enemy.x = clamp(enemy.x, enemy.w * 0.4, match.width - enemy.w * 0.4);
  if (def.fire > 0 && enemy.fireCd <= 0) {
    enemyShoot(match, enemy);
    enemy.fireCd = def.fire;
  }
}

function tickBoss(match: Match, enemy: Enemy, dt: number) {
  enemy.x += enemy.vx * dt;
  if (enemy.x < enemy.w || enemy.x > match.width - enemy.w) enemy.vx *= -1;
  const base = enemy.lane === 'red' ? match.height * 0.12 : match.height * 0.56;
  enemy.y = base + Math.sin(enemy.age * 1.2) * 12;
  const phase = bossPhase(enemy);
  const interval = phase === 1 ? 0.9 : phase === 2 ? 0.62 : 0.38;
  if (enemy.fireCd <= 0) {
    if (phase === 1) enemyShoot(match, enemy);
    else if (phase === 2) bomberVolley(match, enemy);
    else {
      enemyShoot(match, enemy);
      enemyShoot(match, enemy);
    }
    enemy.fireCd = interval;
  }
  if (phase === 3 && Math.floor(enemy.age) % 4 === 0 && enemy.age - dt < Math.floor(enemy.age)) {
    spawnEnemy(match, 'scout', false, enemy.lane);
  }
}

function enemyShoot(match: Match, enemy: Enemy) {
  const target = match.players.find((player) => player.side === enemy.lane);
  if (!target) return;
  const dx = target.x - enemy.x;
  const dy = Math.max(30, target.y - enemy.y);
  const len = Math.hypot(dx, dy) || 1;
  const speed = enemy.kind === 'sniper' ? 460 : enemy.kind === 'heavy' ? 240 : 300;
  const damage = DEFS[enemy.kind].damage * (enemy.boss ? 1.15 : 1);
  if (enemy.kind === 'bomber') {
    bomberVolley(match, enemy);
    return;
  }
  spawnBullet(
    match,
    'enemy',
    enemy.kind === 'sniper' ? 'heavy' : 'single',
    enemy.x,
    enemy.y,
    (dx / len) * speed,
    (dy / len) * speed,
    enemy.kind === 'heavy' ? 18 : 14,
    enemy.kind === 'heavy' ? 18 : 42,
    damage,
    0,
    enemy.lane,
  );
}

function bomberVolley(match: Match, enemy: Enemy) {
  const speed = 250;
  for (const angle of [-0.7, -0.35, 0, 0.35, 0.7]) {
    spawnBullet(
      match,
      'enemy',
      'spread',
      enemy.x,
      enemy.y,
      Math.sin(angle) * speed,
      Math.cos(angle) * speed,
      14,
      40,
      DEFS[enemy.kind].damage,
      0,
      enemy.lane,
    );
  }
}

function tickBullets(match: Match, dt: number) {
  for (const bullet of match.bullets) {
    if (!bullet.alive) continue;
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    const laneTop = bullet.lane === 'blue' ? match.height * 0.5 : -30;
    const laneBottom = bullet.lane === 'red' ? match.height * 0.5 : match.height + 40;
    const outsideLane = bullet.y < laneTop || bullet.y > laneBottom;
    if (bullet.life <= 0 || outsideLane || bullet.x < -80 || bullet.x > match.width + 80) {
      bullet.alive = false;
    }
  }
}

function tickPickups(match: Match, dt: number) {
  for (const pickup of match.pickups) {
    if (!pickup.alive) continue;
    pickup.life -= dt;
    let pulled = false;
    for (const player of match.players) {
      if (!player.alive || player.magnet <= 0) continue;
      const dx = player.x - pickup.x;
      const dy = player.y - pickup.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 190 && dist > 1) {
        pickup.x += (dx / dist) * 240 * dt;
        pickup.y += (dy / dist) * 240 * dt;
        pulled = true;
      }
    }
    if (!pulled) pickup.y += 28 * dt;
    if (pickup.life <= 0 || pickup.y > match.height + 40) pickup.alive = false;
  }
}

function tickAsteroids(match: Match, dt: number) {
  for (const rock of match.asteroids) {
    if (!rock.alive) continue;
    rock.x += rock.vx * dt;
    rock.y += rock.vy * dt;
    if (rock.y < -120 || rock.y > match.height + 120) rock.alive = false;
  }
}

function tickFx(match: Match, dt: number) {
  for (const fx of match.fx) {
    if (!fx.alive) continue;
    fx.age += dt;
    const limit = fx.kind === 'impact' ? 0.16 : fx.kind === 'large' || fx.kind === 'death' ? 0.48 : 0.36;
    if (fx.age >= limit) fx.alive = false;
  }
}

function collide(match: Match) {
  for (const bullet of match.bullets) {
    if (!bullet.alive) continue;
    if (bullet.owner === 'enemy') {
      const player = match.players.find((item) => item.side === bullet.lane);
      if (player && player.alive && player.invuln <= 0 && hits(bullet, player)) {
        damagePlayer(match, player, bullet.damage);
        bullet.alive = false;
        spawnFx(match, 'impact', player.x, player.y, 36);
      }
      continue;
    }
    for (const enemy of match.enemies) {
      if (!enemy.alive || enemy.lane !== bullet.lane || bullet.hits.includes(enemy.id) || !hits(bullet, enemy)) continue;
      bullet.hits.push(enemy.id);
      hurtEnemy(match, enemy, bullet.damage, bullet.owner);
      spawnFx(match, 'impact', enemy.x, enemy.y, 28);
      if (bullet.pierce <= 0 || bullet.hits.length >= bullet.pierce) {
        bullet.alive = false;
        break;
      }
    }
    if (!bullet.alive) continue;
    for (const rock of match.asteroids) {
      if (!rock.alive || !hits(bullet, rock)) continue;
      rock.hp -= bullet.damage;
      bullet.alive = false;
      if (rock.hp <= 0) destroyAsteroid(match, rock, bullet.owner);
      break;
    }
  }
  for (const player of match.players) {
    if (!player.alive) continue;
    for (const enemy of match.enemies) {
      if (!enemy.alive || enemy.lane !== player.side || player.invuln > 0 || !hits(player, enemy)) continue;
      damagePlayer(match, player, enemy.boss ? 18 : 12);
      if (!enemy.boss) hurtEnemy(match, enemy, 4, player.side);
    }
    for (const rock of match.asteroids) {
      if (!rock.alive || player.invuln > 0 || !hits(player, rock)) continue;
      damagePlayer(match, player, 14);
      spawnFx(match, 'impact', player.x, player.y, 40);
    }
    for (const pickup of match.pickups) {
      if (!pickup.alive || !hits(player, pickup)) continue;
      pickup.alive = false;
      applyPickup(match, player, pickup.kind);
      spawnFx(match, 'pickup', player.x, player.y, 48);
    }
  }
}

function hits(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return Math.abs(a.x - b.x) < (a.w + b.w) * 0.32 && Math.abs(a.y - b.y) < (a.h + b.h) * 0.32;
}

function damagePlayer(match: Match, player: Player, amount: number) {
  if (!player.alive || player.invuln > 0) return;
  if (player.shield > 0) {
    player.invuln = 0.25;
    spawnFx(match, 'impact', player.x, player.y, 56);
    return;
  }
  player.hp -= amount;
  player.hitFlash = 0.18;
  player.invuln = 0.55;
  if (player.hp <= 0) killPlayer(match, player);
}

function killPlayer(match: Match, player: Player) {
  player.alive = false;
  player.hp = 0;
  spawnFx(match, 'death', player.x, player.y, 96);
  if (player.extraLives > 0) {
    player.extraLives -= 1;
    player.respawn = 2;
    return;
  }
  finish(match, player.side === 'red' ? 'Kırmızı kaybetti' : 'Mavi kaybetti');
}

function revive(match: Match, player: Player) {
  player.alive = true;
  player.hp = player.maxHp;
  player.invuln = 1.6;
  player.x = match.width / 2;
  player.y = player.side === 'blue' ? match.height * 0.82 : match.height * 0.38;
  clampPlayer(match, player);
}

function hurtEnemy(match: Match, enemy: Enemy, amount: number, owner: Side) {
  if (!enemy.alive) return;
  enemy.hp -= amount;
  enemy.lastHit = owner;
  if (enemy.hp > 0) return;
  enemy.alive = false;
  const player = match.players.find((item) => item.side === owner);
  if (player) player.score += enemy.score + match.lanes[enemy.lane].wave * 5;
  spawnFx(match, enemy.boss ? 'large' : enemy.kind === 'scout' ? 'small' : 'medium', enemy.x, enemy.y, enemy.boss ? 120 : 64);
  if (enemy.boss) {
    dropPickup(match, 'weapon-upgrade', enemy.x - 20, enemy.y);
    dropPickup(match, 'bomb', enemy.x + 20, enemy.y);
    match.bossId = 0;
  } else if (match.rng() < (enemy.kind === 'heavy' || enemy.kind === 'bomber' ? 0.45 : 0.22)) {
    const kind = PICKUPS[Math.floor(match.rng() * PICKUPS.length)] ?? 'shield';
    dropPickup(match, kind, enemy.x, enemy.y);
  }
}

function dropPickup(match: Match, kind: PickupKind, x: number, y: number) {
  let pickup = match.pickups.find((item) => !item.alive);
  if (!pickup) {
    if (match.pickups.length >= MAX_PICKUPS) return;
    pickup = { alive: false, id: 0, kind, x, y, w: 32, h: 32, life: 12 };
    match.pickups.push(pickup);
  }
  pickup.alive = true;
  pickup.id = match.nextId++;
  pickup.kind = kind;
  pickup.x = x;
  pickup.y = y;
  pickup.w = 32;
  pickup.h = 32;
  pickup.life = 12;
}

function applyPickup(match: Match, player: Player, kind: PickupKind) {
  if (kind === 'weapon-upgrade') player.weaponLevel = Math.min(5, player.weaponLevel + 1);
  else if (kind === 'double-shot') player.doubleShot = 8;
  else if (kind === 'spread-shot') player.spread = 8;
  else if (kind === 'rapid-fire') player.rapid = 8;
  else if (kind === 'laser') player.laser = 6;
  else if (kind === 'plasma') player.plasma = 8;
  else if (kind === 'shield') player.shield = 5;
  else if (kind === 'damage-boost') player.damageBoost = 8;
  else if (kind === 'extra-life') player.extraLives += 1;
  else if (kind === 'speed-boost') player.speedBoost = 6;
  else if (kind === 'magnet') player.magnet = 7;
  else if (kind === 'bomb') {
    for (const enemy of match.enemies) {
      if (!enemy.alive || enemy.lane !== player.side) continue;
      hurtEnemy(match, enemy, enemy.boss ? 36 : enemy.hp, player.side);
    }
    spawnFx(match, 'large', match.width / 2, match.height / 2, 140);
  }
}

function spawnAsteroid(match: Match) {
  if (match.asteroids.filter((rock) => rock.alive).length >= MAX_ASTEROIDS) return;
  let rock = match.asteroids.find((item) => !item.alive);
  if (!rock) {
    rock = { alive: false, id: 0, variant: 0, x: 0, y: 0, vx: 0, vy: 0, w: 40, h: 40, hp: 3 };
    match.asteroids.push(rock);
  }
  const fromTop = match.rng() < 0.5;
  rock.alive = true;
  rock.id = match.nextId++;
  rock.variant = (Math.floor(match.rng() * 3) % 3) as 0 | 1 | 2;
  rock.w = 36 + rock.variant * 8;
  rock.h = rock.variant === 1 ? 58 : 36;
  rock.x = rock.w + match.rng() * (match.width - rock.w * 2);
  rock.y = fromTop ? -40 : match.height + 40;
  rock.vx = (match.rng() - 0.5) * 30;
  rock.vy = (fromTop ? 1 : -1) * (50 + match.rng() * 30);
  rock.hp = 24;
}

function destroyAsteroid(match: Match, rock: Asteroid, owner: Side) {
  rock.alive = false;
  spawnFx(match, 'small', rock.x, rock.y, 48);
  const player = match.players.find((item) => item.side === owner);
  if (player) player.score += 15;
  if (match.rng() < 0.35) {
    const kind = PICKUPS[Math.floor(match.rng() * PICKUPS.length)] ?? 'shield';
    dropPickup(match, kind, rock.x, rock.y);
  }
}

function spawnFx(match: Match, kind: FxKind, x: number, y: number, size: number) {
  let fx = match.fx.find((item) => !item.alive);
  if (!fx) {
    if (match.fx.length >= MAX_FX) return;
    fx = { alive: false, id: 0, kind, x, y, w: size, h: size, age: 0 };
    match.fx.push(fx);
  }
  fx.alive = true;
  fx.id = match.nextId++;
  fx.kind = kind;
  fx.x = x;
  fx.y = y;
  fx.w = size;
  fx.h = size;
  fx.age = 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
