import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Image as RnImage, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  ReduceMotion,
  ReducedMotionConfig,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppFont } from '@/design/font-mode';
import { colors } from '@/design/tokens';
import {
  BOARD_SIZE,
  canPlace,
  commitPlacement,
  createGame,
  createIdSource,
  endGame,
  isTrayStuck,
  pieceSpan,
  refreshTray,
  type Board,
  type ClearedCell,
  type GameState,
  type Piece,
  type TileId,
} from '@/features/block-puzzle/engine';
import {
  ARENA_BOARD_HOLE,
  ARENA_COMBO_ASPECT,
  ARENA_TRAY_HOLE,
  TILE_ART,
  arenaComboCyan,
  arenaComboPink,
} from '@/features/block-puzzle/art';
import { chooseBotMove } from '@/features/block-puzzle/bot';
import { loadHighScore, saveHighScore } from '@/features/block-puzzle/progress';
import { OceanBackdrop } from '@/features/ocean-kingdom/ocean-backdrop';

const GAP = 3;
const LIFT = 36;
const MATCH_SECONDS = 90;
const BOT_MIN_MS = 1100;
const BOT_MAX_MS = 2000;
const MOTION = { reduceMotion: ReduceMotion.Never } as const;
const BOARD_SCALE = 0.5;

type Frame = { x: number; y: number; cell: number; step: number };
type Drag = {
  uid: string;
  left: number;
  top: number;
  originRow: number;
  originCol: number;
  valid: boolean;
};

function padScore(score: number): string {
  return String(Math.max(0, Math.floor(score))).padStart(4, '0');
}

function Jewel({ tile, size }: { tile: TileId; size: number }) {
  const radius = Math.max(3, size * 0.16);
  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }}>
      <Image
        source={TILE_ART[tile]}
        style={{ width: size, height: size }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
    </View>
  );
}

function PieceArt({ piece, cell, gap = GAP }: { piece: Piece; cell: number; gap?: number }) {
  const span = pieceSpan(piece);
  const width = span.cols * cell + (span.cols - 1) * gap;
  const height = span.rows * cell + (span.rows - 1) * gap;
  return (
    <View style={{ width, height }}>
      {piece.cells.map((offset) => (
        <View
          key={`${offset.row}-${offset.col}`}
          style={{
            position: 'absolute',
            left: offset.col * (cell + gap),
            top: offset.row * (cell + gap),
          }}
        >
          <Jewel tile={piece.tile} size={cell} />
        </View>
      ))}
    </View>
  );
}

function TrayEntrance({
  deal,
  index,
  paused,
  children,
}: {
  deal: number;
  index: number;
  paused: boolean;
  children: ReactNode;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    if (paused) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(index * 80, withTiming(1, { duration: 240, ...MOTION }));
  }, [deal, index, paused, progress]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 14 }],
  }));
  return <Animated.View style={[styles.trayEntrance, style]}>{children}</Animated.View>;
}

/** Largest tray footprint (square-3 / 3-wide shapes). Shared jewel size. */
const TRAY_MAX_SPAN = 3;
const TRAY_GAP = 1;

function trayCellSize(fitW: number, fitH: number) {
  return Math.max(
    10,
    Math.floor(
      Math.min(
        (fitW - TRAY_GAP * (TRAY_MAX_SPAN - 1)) / TRAY_MAX_SPAN,
        (fitH - TRAY_GAP * (TRAY_MAX_SPAN - 1)) / TRAY_MAX_SPAN,
      ),
    ),
  );
}

function spotFor(pageX: number, pageY: number, piece: Piece, frame: Frame) {
  const span = pieceSpan(piece);
  const width = span.cols * frame.cell + (span.cols - 1) * (frame.step - frame.cell);
  const height = span.rows * frame.cell + (span.rows - 1) * (frame.step - frame.cell);
  const left = pageX - width / 2;
  const top = pageY - height / 2 - LIFT;
  return {
    left,
    top,
    originCol: Math.round((left - frame.x) / frame.step),
    originRow: Math.round((top - frame.y) / frame.step),
  };
}

function gridMetrics(outer: number) {
  const cell = Math.max(10, Math.floor((outer - GAP * (BOARD_SIZE - 1)) / BOARD_SIZE));
  const step = cell + GAP;
  const size = BOARD_SIZE * cell + (BOARD_SIZE - 1) * GAP;
  return { cell, step, size };
}

function BoardGrid({
  board,
  cell,
  step,
  size,
  left,
  top,
  preview,
  previewValid,
  placedSet,
  settleStyle,
  ghosts,
  clearStyle,
  boardRef,
  onLayout,
}: {
  board: Board;
  cell: number;
  step: number;
  size: number;
  left: number;
  top: number;
  preview?: { row: number; col: number }[] | null;
  previewValid?: boolean;
  placedSet?: Set<string>;
  settleStyle?: object;
  ghosts?: ClearedCell[];
  clearStyle?: object;
  boardRef?: RefObject<View | null>;
  onLayout?: () => void;
}) {
  const previewKeys = new Set((preview ?? []).map((cellPos) => `${cellPos.row}-${cellPos.col}`));

  return (
    <View
      ref={boardRef}
      onLayout={onLayout}
      style={[styles.boardInner, { width: size, height: size, left, top }]}
    >
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const isPreview = previewKeys.has(key);
          return (
            <View
              key={key}
              style={[
                styles.cell,
                {
                  width: cell,
                  height: cell,
                  borderRadius: Math.max(4, cell * 0.2),
                  left: colIndex * step,
                  top: rowIndex * step,
                  borderWidth: isPreview ? 1 : 0,
                  borderColor: isPreview
                    ? previewValid
                      ? 'rgba(140, 220, 255, 0.55)'
                      : 'rgba(255, 90, 110, 0.5)'
                    : 'transparent',
                  backgroundColor: isPreview
                    ? previewValid
                      ? 'rgba(90, 190, 255, 0.28)'
                      : 'rgba(255, 72, 88, 0.28)'
                    : 'transparent',
                },
              ]}
            >
              {tile ? (
                placedSet?.has(key) && settleStyle ? (
                  <Animated.View style={settleStyle}>
                    <Jewel tile={tile} size={cell} />
                  </Animated.View>
                ) : (
                  <Jewel tile={tile} size={cell} />
                )
              ) : null}
            </View>
          );
        }),
      )}
      {ghosts?.map((ghost) => (
        <Animated.View
          key={`ghost-${ghost.row}-${ghost.col}`}
          pointerEvents="none"
          style={[{ position: 'absolute', left: ghost.col * step, top: ghost.row * step }, clearStyle]}
        >
          <Jewel tile={ghost.tile} size={cell} />
        </Animated.View>
      ))}
    </View>
  );
}

function SideTray({
  left,
  top,
  width,
  height,
  slotFit,
  pieces,
  interactive,
  deal,
  awaitDeal,
  dragUid,
  rejected,
  shake,
  disabled,
  onGrant,
  onMove,
  onEnd,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  slotFit: number;
  pieces: (Piece | null)[];
  interactive?: boolean;
  deal?: number;
  awaitDeal?: boolean;
  dragUid?: string | null;
  rejected?: string | null;
  shake?: SharedValue<number>;
  disabled?: boolean;
  onGrant?: () => void;
  onMove?: (uid: string, pageX: number, pageY: number) => void;
  onEnd?: (uid: string) => void;
}) {
  return (
    <View style={[styles.traySlotsCol, { left, top, width, height }]}>
      {pieces.map((piece, index) => (
        <View key={piece?.uid ?? `side-slot-${index}`} style={[styles.sideSlot, { width: slotFit, height: slotFit }]}>
          {piece && interactive && shake && onGrant && onMove && onEnd ? (
            <TrayEntrance deal={deal ?? 1} index={index} paused={!!awaitDeal}>
              <TrayPiece
                piece={piece}
                cell={trayCellSize(slotFit - 4, slotFit - 4)}
                gap={TRAY_GAP}
                slot={slotFit}
                hidden={dragUid === piece.uid}
                rejected={rejected === piece.uid}
                shake={shake}
                disabled={!!disabled}
                onGrant={onGrant}
                onMove={onMove}
                onEnd={onEnd}
              />
            </TrayEntrance>
          ) : piece ? (
            <View style={styles.trayEntrance}>
              <PieceArt piece={piece} cell={trayCellSize(slotFit - 4, slotFit - 4)} gap={TRAY_GAP} />
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ArenaCombo({
  frame,
  width,
  height,
  board,
  metrics,
  pieces,
  interactive,
  deal,
  awaitDeal,
  dragUid,
  rejected,
  shake,
  disabled,
  preview,
  previewValid,
  placedSet,
  settleStyle,
  ghosts,
  clearStyle,
  boardRef,
  onLayout,
  onGrant,
  onMove,
  onEnd,
}: {
  frame: number;
  width: number;
  height: number;
  board: Board;
  metrics: { cell: number; step: number; size: number };
  pieces: (Piece | null)[];
  interactive?: boolean;
  deal?: number;
  awaitDeal?: boolean;
  dragUid?: string | null;
  rejected?: string | null;
  shake?: SharedValue<number>;
  disabled?: boolean;
  preview?: { row: number; col: number }[] | null;
  previewValid?: boolean;
  placedSet?: Set<string>;
  settleStyle?: object;
  ghosts?: ClearedCell[];
  clearStyle?: object;
  boardRef?: RefObject<View | null>;
  onLayout?: () => void;
  onGrant?: () => void;
  onMove?: (uid: string, pageX: number, pageY: number) => void;
  onEnd?: (uid: string) => void;
}) {
  const hole = ARENA_BOARD_HOLE;
  const tray = ARENA_TRAY_HOLE;
  const holeL = width * hole.l;
  const holeT = height * hole.t;
  const holeW = width * (hole.r - hole.l);
  const holeH = height * (hole.b - hole.t);
  const grid = Math.min(holeW, holeH);
  const boardLeft = holeL + (holeW - grid) / 2;
  const boardTop = holeT + (holeH - grid) / 2;
  const trayL = width * tray.l;
  const trayT = height * tray.t;
  const trayW = width * (tray.r - tray.l);
  const trayH = height * (tray.b - tray.t);
  const slotFit = Math.max(16, Math.min(trayW * 0.82, trayH / 3 - 4));

  return (
    <View style={[styles.arenaCombo, { width, height }]}>
      <BoardGrid
        board={board}
        cell={metrics.cell}
        step={metrics.step}
        size={metrics.size}
        left={boardLeft + (grid - metrics.size) / 2}
        top={boardTop + (grid - metrics.size) / 2}
        preview={preview}
        previewValid={previewValid}
        placedSet={placedSet}
        settleStyle={settleStyle}
        ghosts={ghosts}
        clearStyle={clearStyle}
        boardRef={boardRef}
        onLayout={onLayout}
      />
      <SideTray
        left={trayL}
        top={trayT}
        width={trayW}
        height={trayH}
        slotFit={slotFit}
        pieces={pieces}
        interactive={interactive}
        deal={deal}
        awaitDeal={awaitDeal}
        dragUid={dragUid}
        rejected={rejected}
        shake={shake}
        disabled={disabled}
        onGrant={onGrant}
        onMove={onMove}
        onEnd={onEnd}
      />
      {/* Frame last so coral/pearl ornaments sit above grid; holes stay transparent. */}
      <RnImage
        source={frame}
        style={{ position: 'absolute', left: 0, top: 0, width, height, zIndex: 8, elevation: 8 }}
        resizeMode="stretch"
        pointerEvents="none"
      />
    </View>
  );
}

export function BlockPuzzleScreen({ backdrop }: { backdrop?: ReactNode } = {}) {
  const bold = useAppFont('bold');
  const semibold = useAppFont('semibold');
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [ids] = useState(() => createIdSource('p'));
  const [opponentIds] = useState(() => createIdSource('o'));
  const [game, setGame] = useState<GameState>(() => createGame(Math.random, 0, ids));
  const [opponent, setOpponent] = useState<GameState>(() => createGame(Math.random, 0, opponentIds));
  const [drag, setDrag] = useState<Drag | null>(null);
  const [ghosts, setGhosts] = useState<ClearedCell[]>([]);
  const [rejected, setRejected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string[]>([]);
  const [deal, setDeal] = useState(1);
  const [awaitDeal, setAwaitDeal] = useState(false);
  const [seconds, setSeconds] = useState(MATCH_SECONDS);
  const [matchEpoch, setMatchEpoch] = useState(0);
  const [playerLives, setPlayerLives] = useState(3);
  const [botLives, setBotLives] = useState(3);
  const shakeX = useSharedValue(0);
  const clearOpacity = useSharedValue(1);
  const clearScale = useSharedValue(1);
  const liftScale = useSharedValue(1);
  const settleScale = useSharedValue(1);
  const gameRef = useRef(game);
  const opponentRef = useRef(opponent);
  const secondsRef = useRef(seconds);
  const playerLivesRef = useRef(playerLives);
  const botLivesRef = useRef(botLives);
  const awaitDealRef = useRef(false);
  const aliveRef = useRef(true);
  const dragRef = useRef<Drag | null>(null);
  const frameRef = useRef<Frame | null>(null);
  const rootRef = useRef<View>(null);
  const boardRef = useRef<View>(null);
  const rootOrigin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    opponentRef.current = opponent;
  }, [opponent]);

  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  useEffect(() => {
    playerLivesRef.current = playerLives;
  }, [playerLives]);

  useEffect(() => {
    botLivesRef.current = botLives;
  }, [botLives]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    loadHighScore().then((high) => {
      if (!alive) return;
      setGame((current) => ({ ...current, highScore: Math.max(current.highScore, high) }));
    });
    return () => {
      alive = false;
    };
  }, []);

  const matchOver =
    playerLives <= 0 || botLives <= 0 || seconds <= 0 || game.status === 'over' || opponent.status === 'over';

  useEffect(() => {
    if (matchOver) return;
    const timer = setInterval(() => {
      setSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [matchOver, matchEpoch]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      const delay = BOT_MIN_MS + Math.floor(Math.random() * (BOT_MAX_MS - BOT_MIN_MS + 1));
      timer = setTimeout(() => {
        if (cancelled || !aliveRef.current || secondsRef.current <= 0) return;
        if (playerLivesRef.current <= 0 || botLivesRef.current <= 0) return;
        const state = opponentRef.current;
        if (state.status !== 'playing') return;
        const move = chooseBotMove(state, Math.random);
        if (move) {
          const result = commitPlacement(
            state,
            move.pieceUid,
            move.originRow,
            move.originCol,
            Math.random,
            opponentIds,
          );
          if (result.placed) {
            let next = result.state;
            if (isTrayStuck(next.board, next.tray)) {
              const lives = botLivesRef.current - 1;
              botLivesRef.current = Math.max(0, lives);
              setBotLives(Math.max(0, lives));
              if (lives <= 0) {
                next = endGame(next);
              } else {
                next = refreshTray(next, Math.random, opponentIds);
                setDeal((value) => value + 1);
              }
            }
            opponentRef.current = next;
            setOpponent(next);
          }
        } else if (isTrayStuck(state.board, state.tray)) {
          const lives = botLivesRef.current - 1;
          botLivesRef.current = Math.max(0, lives);
          setBotLives(Math.max(0, lives));
          const next =
            lives <= 0 ? endGame(state) : refreshTray(state, Math.random, opponentIds);
          opponentRef.current = next;
          setOpponent(next);
          if (lives > 0) setDeal((value) => value + 1);
        }
        if (
          !cancelled &&
          secondsRef.current > 0 &&
          botLivesRef.current > 0 &&
          playerLivesRef.current > 0 &&
          opponentRef.current.status === 'playing'
        ) {
          schedule();
        }
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [matchEpoch, opponentIds]);

  const finishClear = useCallback(() => {
    if (!aliveRef.current) return;
    setGhosts([]);
    if (!awaitDealRef.current) return;
    awaitDealRef.current = false;
    setAwaitDeal(false);
    setDeal((value) => value + 1);
  }, []);

  useEffect(() => {
    if (game.score <= 0) return;
    if (game.score >= game.highScore) saveHighScore(game.score);
  }, [game.highScore, game.score]);

  useEffect(() => {
    if (!rejected) return;
    shakeX.value = withSequence(
      withTiming(7, { duration: 45, ...MOTION }),
      withTiming(-7, { duration: 55, ...MOTION }),
      withTiming(4, { duration: 40, ...MOTION }),
      withTiming(0, { duration: 40, ...MOTION }),
    );
    const timer = setTimeout(() => setRejected(null), 190);
    return () => clearTimeout(timer);
  }, [rejected, shakeX]);

  useEffect(() => {
    if (ghosts.length === 0) return;
    clearOpacity.value = 1;
    clearScale.value = 1;
    clearOpacity.value = withTiming(0, { duration: 280, ...MOTION });
    clearScale.value = withTiming(0.62, { duration: 280, ...MOTION }, (finished) => {
      if (finished) runOnJS(finishClear)();
    });
  }, [clearOpacity, clearScale, finishClear, ghosts]);

  const dragUid = drag?.uid;
  useEffect(() => {
    if (!dragUid) return;
    liftScale.value = 0.9;
    liftScale.value = withSpring(1.06, { damping: 14, stiffness: 280, mass: 0.6, ...MOTION });
  }, [dragUid, liftScale]);

  const measure = () => {
    rootRef.current?.measureInWindow((x, y) => {
      rootOrigin.current = { x, y };
    });
    boardRef.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return;
      const border = 1.5;
      const innerW = Math.max(1, width - border * 2);
      const innerH = Math.max(1, height - border * 2);
      const cell = Math.min(
        (innerW - GAP * (BOARD_SIZE - 1)) / BOARD_SIZE,
        (innerH - GAP * (BOARD_SIZE - 1)) / BOARD_SIZE,
      );
      frameRef.current = { x: x + border, y: y + border, cell, step: cell + GAP };
    });
  };

  const moveDrag = (uid: string, pageX: number, pageY: number) => {
    const frame = frameRef.current;
    const piece = gameRef.current.tray.find((entry) => entry.uid === uid);
    if (
      !frame ||
      !piece ||
      gameRef.current.status !== 'playing' ||
      secondsRef.current <= 0 ||
      playerLivesRef.current <= 0 ||
      botLivesRef.current <= 0
    ) {
      return;
    }
    const spot = spotFor(pageX, pageY, piece, frame);
    const next: Drag = {
      uid,
      left: spot.left - rootOrigin.current.x,
      top: spot.top - rootOrigin.current.y,
      originRow: spot.originRow,
      originCol: spot.originCol,
      valid: canPlace(gameRef.current.board, piece, spot.originRow, spot.originCol),
    };
    dragRef.current = next;
    setDrag(next);
  };

  const endDrag = (uid: string) => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current || current.uid !== uid || !current.valid) {
      setRejected(uid);
      return;
    }
    const result = commitPlacement(
      gameRef.current,
      uid,
      current.originRow,
      current.originCol,
      Math.random,
      ids,
    );
    if (!result.placed) {
      setRejected(uid);
      return;
    }
    const piece = gameRef.current.tray.find((entry) => entry.uid === uid);
    const clearedKeys = new Set(result.cleared.map((cell) => `${cell.row}-${cell.col}`));
    const landed = piece
      ? piece.cells
          .map((offset) => ({
            row: current.originRow + offset.row,
            col: current.originCol + offset.col,
          }))
          .filter((cell) => !clearedKeys.has(`${cell.row}-${cell.col}`))
          .map((cell) => `${cell.row}-${cell.col}`)
      : [];
    setPlaced(landed);
    if (landed.length > 0) {
      settleScale.value = 0.86;
      settleScale.value = withSpring(1, { damping: 13, stiffness: 240, ...MOTION }, (finished) => {
        if (finished) runOnJS(setPlaced)([]);
      });
    }
    const redeal = gameRef.current.tray.filter((entry) => entry.uid !== uid).length === 0;
    if (result.cleared.length > 0) {
      setGhosts(result.cleared);
      if (redeal) {
        awaitDealRef.current = true;
        setAwaitDeal(true);
      }
    } else if (redeal) {
      setDeal((value) => value + 1);
    }

    let next = result.state;
    if (isTrayStuck(next.board, next.tray)) {
      const lives = playerLivesRef.current - 1;
      playerLivesRef.current = Math.max(0, lives);
      setPlayerLives(Math.max(0, lives));
      if (lives <= 0) {
        next = endGame(next);
      } else {
        next = refreshTray(next, Math.random, ids);
        setDeal((value) => value + 1);
      }
    }
    setGame(next);
  };

  const restart = () => {
    setDrag(null);
    dragRef.current = null;
    setGhosts([]);
    setPlaced([]);
    awaitDealRef.current = false;
    setAwaitDeal(false);
    setDeal((value) => value + 1);
    setSeconds(MATCH_SECONDS);
    setPlayerLives(3);
    setBotLives(3);
    playerLivesRef.current = 3;
    botLivesRef.current = 3;
    setMatchEpoch((value) => value + 1);
    setGame(createGame(Math.random, gameRef.current.highScore, ids));
    const nextOpponent = createGame(Math.random, 0, opponentIds);
    opponentRef.current = nextOpponent;
    setOpponent(nextOpponent);
  };

  const contentW = windowWidth - 16;
  const availableH = windowHeight - insets.top - insets.bottom - 8;
  const stackGap = 4;
  const boardGap = 10;
  const chrome = boardGap + stackGap * 2;
  const boardBudget = Math.max(240, availableH - chrome);
  const fullSideW = Math.max(76, Math.min(100, Math.round(contentW * 0.23)));
  const fullBoard = Math.min(contentW - fullSideW - 8, Math.floor(boardBudget / 2));
  const boardOuter = Math.max(120, Math.round(fullBoard * BOARD_SCALE));
  const holeH = ARENA_BOARD_HOLE.b - ARENA_BOARD_HOLE.t;
  const holeW = ARENA_BOARD_HOLE.r - ARENA_BOARD_HOLE.l;
  const arenaH = Math.max(140, boardOuter / holeH);
  const arenaW = Math.min(contentW, arenaH * ARENA_COMBO_ASPECT);
  const arenaHFit = arenaW / ARENA_COMBO_ASPECT;
  const gridRoom = Math.min(arenaW * holeW, arenaHFit * holeH);
  const boardMetrics = gridMetrics(gridRoom);
  const opponentMetrics = boardMetrics;
  const playerMetrics = boardMetrics;
  const playRowW = arenaW;
  const packH = arenaHFit * 2 + boardGap + stackGap;
  const leftover = Math.max(0, availableH - packH);
  const edgePadTop = Math.floor(leftover * 0.45);
  const edgePadBottom = leftover - edgePadTop;
  const playerSlots: (Piece | null)[] = [0, 1, 2].map((index) => game.tray[index] ?? null);
  const opponentSlots: (Piece | null)[] = [0, 1, 2].map((index) => opponent.tray[index] ?? null);

  const dragged = drag ? game.tray.find((entry) => entry.uid === drag.uid) : undefined;
  const placedSet = new Set(placed);
  const previewCells =
    drag && dragged
      ? dragged.cells.map((offset) => ({
          row: drag.originRow + offset.row,
          col: drag.originCol + offset.col,
        }))
      : null;
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: liftScale.value }],
  }));
  const settleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: settleScale.value }],
  }));
  const clearStyle = useAnimatedStyle(() => ({
    opacity: clearOpacity.value,
    transform: [{ scale: clearScale.value }],
  }));

  return (
    <View ref={rootRef} style={styles.fill} onLayout={measure}>
      <ReducedMotionConfig mode={ReduceMotion.Never} />
      {backdrop ?? <OceanBackdrop />}
      <View
        style={[
          styles.column,
          {
            zIndex: 1,
            paddingTop: insets.top + edgePadTop,
            paddingBottom: Math.max(insets.bottom, 4) + edgePadBottom,
            paddingHorizontal: 8,
            gap: stackGap,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <View style={[styles.playRow, { width: playRowW }]}>
          <ArenaCombo
            frame={arenaComboPink}
            width={arenaW}
            height={arenaHFit}
            board={opponent.board}
            metrics={opponentMetrics}
            pieces={opponentSlots}
          />
        </View>

        <View style={{ height: boardGap }} />

        <View style={[styles.playRow, { width: playRowW }]}>
          <ArenaCombo
            frame={arenaComboCyan}
            width={arenaW}
            height={arenaHFit}
            board={game.board}
            metrics={playerMetrics}
            pieces={playerSlots}
            interactive
            deal={deal}
            awaitDeal={awaitDeal}
            dragUid={drag?.uid}
            rejected={rejected}
            shake={shakeX}
            disabled={matchOver}
            preview={previewCells}
            previewValid={drag?.valid}
            placedSet={placedSet}
            settleStyle={settleStyle}
            ghosts={ghosts}
            clearStyle={clearStyle}
            boardRef={boardRef}
            onLayout={measure}
            onGrant={() => measure()}
            onMove={moveDrag}
            onEnd={endDrag}
          />
        </View>
      </View>

      {dragged && drag ? (
        <Animated.View pointerEvents="none" style={[styles.floater, { left: drag.left, top: drag.top }, liftStyle]}>
          <PieceArt piece={dragged} cell={playerMetrics.cell} />
        </Animated.View>
      ) : null}

      {matchOver ? (
        <View style={styles.overlay} pointerEvents="auto">
          <View style={styles.overCard}>
            <Text style={[styles.overTitle, bold ? { fontFamily: bold } : null]}>
              {playerLives <= 0
                ? 'BOT KAZANDI'
                : botLives <= 0
                  ? 'KAZANDIN'
                  : game.score === opponent.score
                    ? 'BERABERE'
                    : game.score > opponent.score
                      ? 'KAZANDIN'
                      : 'BOT KAZANDI'}
            </Text>
            <View style={styles.overScoreRow}>
              <View style={styles.overScoreCol}>
                <Text style={[styles.overScoreLabel, semibold ? { fontFamily: semibold } : null]}>SEN</Text>
                <Text style={[styles.overScore, bold ? { fontFamily: bold } : null]}>{padScore(game.score)}</Text>
              </View>
              <Text style={[styles.overScoreSep, bold ? { fontFamily: bold } : null]}>:</Text>
              <View style={styles.overScoreCol}>
                <Text style={[styles.overScoreLabel, semibold ? { fontFamily: semibold } : null]}>BOT</Text>
                <Text style={[styles.overScore, bold ? { fontFamily: bold } : null]}>{padScore(opponent.score)}</Text>
              </View>
            </View>
            <Pressable accessibilityRole="button" onPress={restart} style={styles.restart}>
              <Text style={[styles.restartText, semibold ? { fontFamily: semibold } : null]}>Yeniden</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function TrayPiece({
  piece,
  cell,
  gap,
  slot,
  hidden,
  rejected,
  shake,
  disabled,
  onGrant,
  onMove,
  onEnd,
}: {
  piece: Piece;
  cell: number;
  gap: number;
  slot: number;
  hidden: boolean;
  rejected: boolean;
  shake: SharedValue<number>;
  disabled: boolean;
  onGrant: () => void;
  onMove: (uid: string, pageX: number, pageY: number) => void;
  onEnd: (uid: string) => void;
}) {
  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: (event) => {
      onGrant();
      onMove(piece.uid, event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
    onPanResponderMove: (event) => {
      onMove(piece.uid, event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
    onPanResponderRelease: () => onEnd(piece.uid),
    onPanResponderTerminate: () => onEnd(piece.uid),
  });
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rejected ? shake.value : 0 }],
  }));

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[styles.slotWrap, { width: slot, height: slot, opacity: hidden ? 0 : 1 }, shakeStyle]}
    >
      <PieceArt piece={piece} cell={cell} gap={gap} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#1278a8' },
  column: { flex: 1, justifyContent: 'flex-start', zIndex: 2 },
  hudBar: {
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 8, 22, 0.82)',
    overflow: 'hidden',
  },
  hudBarFramed: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  hudFrame: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  hudSlots: {
    ...StyleSheet.absoluteFillObject,
  },
  hudAbsSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hudAbsAvatar: {
    left: '7.1%',
    width: '9.8%',
    top: '19%',
    aspectRatio: 1,
    padding: 0,
  },
  avatarMask: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#081018',
  },
  hudAbsName: {
    left: '20.2%',
    width: '20.6%',
    top: '18%',
    bottom: '22%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 8,
    gap: 3,
  },
  hudAbsTimer: {
    left: '44.2%',
    width: '18.8%',
    top: '18%',
    bottom: '22%',
    gap: 0,
  },
  hudAbsScore: {
    left: '67.2%',
    width: '25.5%',
    top: '18%',
    bottom: '22%',
    gap: 0,
  },
  hudContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  hudLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, zIndex: 1 },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flex: 1,
    zIndex: 1,
  },
  headerMeta: { gap: 4, maxWidth: 96, flexShrink: 1 },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  avatar: { width: '100%', height: '100%' },
  avatarFill: { width: '100%', height: '100%', transform: [{ scale: 1.12 }] },
  avatarFillFramed: { width: '100%', height: '100%' },
  name: { color: colors.text, fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  nameFramed: { fontSize: 11, letterSpacing: 0.5, lineHeight: 13 },
  dots: { flexDirection: 'row', gap: 5 },
  dotsFramed: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 1 },
  dot: { width: 9, height: 9, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  dotFramed: { width: 7, height: 7, borderRadius: 1.5, transform: [{ rotate: '45deg' }] },
  timerCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBlock: {
    alignItems: 'center',
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  timerLabel: { color: colors.textDim, fontSize: 9, letterSpacing: 1.2, fontWeight: '700' },
  timerLabelFramed: { fontSize: 8, lineHeight: 10, color: 'rgba(230,236,255,0.85)' },
  timerValue: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  timerValueFramed: { fontSize: 15, lineHeight: 18, color: '#fff6c8' },
  scorePlate: {
    minWidth: 68,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.9)',
  },
  scoreLabel: { color: colors.textDim, fontSize: 8, letterSpacing: 1, fontWeight: '700' },
  scoreLabelFramed: { fontSize: 8, lineHeight: 10, color: 'rgba(230,236,255,0.85)' },
  scoreValue: { fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  scoreValueFramed: { fontSize: 15, lineHeight: 18 },
  gearBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.85)',
  },
  gearSpacer: { width: 30, height: 30 },
  gearText: { fontSize: 14, lineHeight: 16 },
  playRow: {
    alignSelf: 'center',
  },
  arenaCombo: {
    position: 'relative',
    overflow: 'visible',
  },
  arenaFrame: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  traySlotsCol: {
    position: 'absolute',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    zIndex: 2,
  },
  sideSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsRow: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'visible',
  },
  vsLineTrack: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vsLineHalf: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  vsLinePink: {
    justifyContent: 'flex-start',
    paddingRight: 2,
  },
  vsLineBlue: {
    justifyContent: 'flex-end',
    paddingLeft: 2,
  },
  vsBeam: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  vsBeamPink: {
    backgroundColor: '#ff4fa8',
    shadowColor: '#ff2d8f',
    shadowOpacity: 0.95,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  vsBeamBlue: {
    backgroundColor: '#4ec8ff',
    shadowColor: '#3ab8ff',
    shadowOpacity: 0.95,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  vsArrow: {
    width: 8,
    height: 8,
    marginHorizontal: 2,
    transform: [{ rotate: '45deg' }],
  },
  vsArrowPink: {
    backgroundColor: '#ff4fa8',
    shadowColor: '#ff2d8f',
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  vsArrowBlue: {
    backgroundColor: '#4ec8ff',
    shadowColor: '#3ab8ff',
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  trayEntrance: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardInner: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 8,
    zIndex: 2,
  },
  cell: { position: 'absolute', overflow: 'hidden' },
  slotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floater: { position: 'absolute', zIndex: 5 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    backgroundColor: 'rgba(3, 5, 14, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    backgroundColor: 'rgba(8, 12, 28, 0.96)',
    borderWidth: 1.5,
    borderColor: 'rgba(90, 190, 255, 0.4)',
  },
  overTitle: {
    color: colors.cyan,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1.6,
    textAlign: 'center',
  },
  overScoreRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  overScoreCol: { alignItems: 'center', minWidth: 88 },
  overScoreLabel: {
    color: 'rgba(220, 230, 255, 0.55)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  overScore: { color: colors.text, fontSize: 28, fontWeight: '700' },
  overScoreSep: { color: 'rgba(220, 230, 255, 0.35)', fontSize: 22, fontWeight: '700', marginTop: 12 },
  restart: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.cyanDeep,
  },
  restartText: { color: '#041018', fontSize: 16, fontWeight: '700' },
});
