import { gameCatalog } from '@/features/galaxy-duel/game-catalog';
import type { EnemyKind, FxKind, PickupKind, ShotKind, Side } from '@/features/galaxy-duel/sim';

const enemyArt: Record<EnemyKind, number> = {
  scout: gameCatalog.enemies[0].sprite.source,
  fighter: gameCatalog.enemies[1].sprite.source,
  heavy: gameCatalog.enemies[2].sprite.source,
  interceptor: gameCatalog.enemies[3].sprite.source,
  bomber: gameCatalog.enemies[4].sprite.source,
  sniper: gameCatalog.enemies[5].sprite.source,
  elite: gameCatalog.enemies[6].sprite.source,
};

const pickupArt: Record<PickupKind, number> = {
  'weapon-upgrade': gameCatalog.background.energy_orb.source,
  'double-shot': gameCatalog.background.energy_crystal.source,
  'spread-shot': gameCatalog.powerUps[1].pickup.source,
  'rapid-fire': gameCatalog.powerUps[0].pickup.source,
  laser: gameCatalog.powerUps[2].pickup.source,
  plasma: gameCatalog.powerUps[3].pickup.source,
  shield: gameCatalog.powerUps[4].pickup.source,
  'damage-boost': gameCatalog.powerUps[5].pickup.source,
  'extra-life': gameCatalog.powerUps[6].pickup.source,
  magnet: gameCatalog.powerUps[7].pickup.source,
  bomb: gameCatalog.powerUps[8].pickup.source,
  'speed-boost': gameCatalog.powerUps[9].pickup.source,
};

export function playerSource(side: Side, hurt: boolean) {
  const ship = side === 'blue' ? gameCatalog.players.blue : gameCatalog.players.red;
  return hurt ? ship.damaged.source : ship.idle.source;
}

export function enemySource(kind: EnemyKind) {
  return enemyArt[kind];
}

/** Every enemy plate points up. Flip them when they dive toward the player. */
export function enemyRotation(_kind: EnemyKind, vy: number) {
  return vy >= 0 ? '180deg' : '0deg';
}

export function bulletSource(owner: Side | 'enemy', kind: ShotKind) {
  if (owner === 'enemy') return gameCatalog.projectiles[3].sprite.source;
  if (kind === 'special') {
    return owner === 'blue' ? gameCatalog.projectiles[4].sprite.source : gameCatalog.projectiles[7].sprite.source;
  }
  if (kind === 'plasma') return gameCatalog.projectiles[5].sprite.source;
  if (kind === 'heavy') return gameCatalog.projectiles[6].sprite.source;
  return owner === 'blue' ? gameCatalog.projectiles[0].sprite.source : gameCatalog.projectiles[1].sprite.source;
}

export function pickupSource(kind: PickupKind) {
  return pickupArt[kind];
}

export function asteroidSource(variant: 0 | 1 | 2) {
  if (variant === 1) return gameCatalog.background.asteroid_b.source;
  if (variant === 2) return gameCatalog.background.asteroid_c.source;
  return gameCatalog.background.asteroid_a.source;
}

export function fxSource(kind: FxKind, age: number) {
  const key =
    kind === 'small'
      ? 'explosion-small'
      : kind === 'medium'
        ? 'explosion-medium'
        : kind === 'large'
          ? 'explosion-large'
          : kind === 'death'
            ? 'player-death'
            : kind === 'pickup'
              ? 'pickup'
              : 'impact';
  const anim = gameCatalog.animations[key];
  const index = Math.min(anim.frames.length - 1, Math.floor((age * 1000) / anim.frameMs));
  return anim.frames[index] ?? anim.frames[0];
}

export function shieldFrame(age: number) {
  const anim = gameCatalog.animations.shield;
  const index = Math.floor((age * 1000) / anim.frameMs) % anim.frames.length;
  return anim.frames[index] ?? anim.frames[0];
}

export const fieldArt = {
  space: gameCatalog.background.space.source,
  starsFar: gameCatalog.background.stars_far.source,
  starsNear: gameCatalog.background.stars_near.source,
  nebula: gameCatalog.background.nebula.source,
};
