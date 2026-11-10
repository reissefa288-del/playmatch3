import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { createAnimalMatch } from './catalog';
import { applyBotMove, commitMatches, selectTile, setPaused, tick, type MatchState, type SelectRules } from './engine';

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useAnimalMatch(rules?: SelectRules) {
  const [match, setMatch] = useState<MatchState>(() => createAnimalMatch());
  const matchRef = useRef(match);
  const rulesRef = useRef(rules);
  matchRef.current = match;
  rulesRef.current = rules;
  const carry = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const current = matchRef.current;
      if (current.paused || current.phase !== 'playing') {
        carry.current = 0;
        return;
      }
      carry.current += 250;
      if (carry.current < 1000 && current.remainingMs - carry.current > 0) return;
      const step = carry.current;
      carry.current = 0;
      setMatch((currentMatch) => tick(currentMatch, step));
    }, 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      setMatch((current) => setPaused(current, next !== 'active'));
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!match.players.bot.pending && !match.players.human.pending) return;
    const timer = setTimeout(() => setMatch((current) => commitMatches(current, rulesRef.current)), 280);
    return () => clearTimeout(timer);
  }, [match.players.bot.pending, match.players.human.pending]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const loop = () => {
      const wait = 650 + Math.floor(Math.random() * 750);
      timer = setTimeout(() => {
        if (stopped) return;
        setMatch((current) => applyBotMove(current, Math.random, rulesRef.current).state);
        if (!stopped) loop();
      }, wait);
    };
    loop();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return {
    match,
    select: (tileId: string) => setMatch((current) => selectTile(current, 'human', tileId, rulesRef.current).state),
  };
}
