import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createMatch,
  resetMatch,
  resizeMatch,
  stepMatch,
  type Match,
  type MatchInput,
} from '@/features/galaxy-duel/sim';

const EMPTY_INPUT: MatchInput = { blue: null, red: null, blueSpecial: false, redSpecial: false };

/** Copy the live match so React renders new positions instead of a frozen object. */
function snapshot(match: Match): Match {
  return {
    ...match,
    lanes: { blue: { ...match.lanes.blue }, red: { ...match.lanes.red } },
    players: [{ ...match.players[0] }, { ...match.players[1] }],
    bullets: match.bullets.filter((bullet) => bullet.alive).map((bullet) => ({ ...bullet })),
    enemies: match.enemies.filter((enemy) => enemy.alive).map((enemy) => ({ ...enemy })),
    pickups: match.pickups.filter((pickup) => pickup.alive).map((pickup) => ({ ...pickup })),
    asteroids: match.asteroids.filter((rock) => rock.alive).map((rock) => ({ ...rock })),
    fx: match.fx.filter((fx) => fx.alive).map((fx) => ({ ...fx })),
  };
}

export function useGalaxyMatch() {
  const world = useRef<Match | null>(null);
  const input = useRef<MatchInput>({ ...EMPTY_INPUT });
  const [view, setView] = useState<Match | null>(null);
  const [fps, setFps] = useState(0);

  const publish = useCallback(() => {
    if (world.current) setView(snapshot(world.current));
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let frames = 0;
    let fpsAt = last;
    const loop = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      frames += 1;
      if (now - fpsAt >= 500) {
        setFps(Math.round((frames * 1000) / (now - fpsAt)));
        frames = 0;
        fpsAt = now;
      }
      const match = world.current;
      if (match && match.mode === 'playing') {
        stepMatch(match, dt, input.current);
        setView(snapshot(match));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const layout = (width: number, height: number) => {
    if (width < 40 || height < 40) return;
    if (!world.current) world.current = createMatch(width, height);
    else resizeMatch(world.current, width, height);
    publish();
  };

  const pause = useCallback(() => {
    const match = world.current;
    if (match && match.mode === 'playing') match.mode = 'paused';
    publish();
  }, [publish]);
  const resume = useCallback(() => {
    const match = world.current;
    if (match && match.mode === 'paused') match.mode = 'playing';
    publish();
  }, [publish]);
  const restart = useCallback(() => {
    const match = world.current;
    if (!match) return;
    resetMatch(match);
    publish();
  }, [publish]);
  const consumeBack = useCallback(() => {
    const match = world.current;
    if (!match) return false;
    if (match.mode === 'playing') {
      match.mode = 'paused';
      publish();
      return true;
    }
    if (match.mode === 'paused') {
      match.mode = 'playing';
      publish();
      return true;
    }
    return false;
  }, [publish]);

  return { match: view, fps, input, layout, pause, resume, restart, consumeBack };
}
