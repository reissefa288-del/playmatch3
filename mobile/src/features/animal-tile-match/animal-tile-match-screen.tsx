import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { avatarArt, halloweenArt, tileArt, vsArt, type TileKind } from '@/features/animal-tile-match/asset-registry';
import { layoutBoard, type LayoutOptions, type PlacedTile } from '@/features/animal-tile-match/board-layout';
import { isSelectable, type MatchResult, type PlayerState, type SelectRules, type TileModel, type TrayItem } from '@/features/animal-tile-match/engine';
import { formatClock, useAnimalMatch } from '@/features/animal-tile-match/use-match';
import { SevenSlotTray } from '@/features/deneme-4/seven-slot-tray';
import { SideTileRack } from '@/features/deneme-4/side-rack';
import type { GlassTone } from '@/features/deneme-4/skia-host';

type ArenaTone = 'pink' | 'blue';

export type MatchHud = {
  humanScore: number;
  botScore: number;
  clock: string;
};

export type BoardShell = {
  holder?: number;
  channel?: { top: number; bottom: number; left: number; right: number };
  glass?: GlassTone;
  skiaTray?: boolean;
  /** Bottom row: no bar. Each placed card keeps a light edge, like the side stacks. */
  softTiles?: boolean;
  tray?: number;
  trayAspect: number;
  traySlots: readonly (readonly [number, number, number, number])[];
};

export function AnimalTileMatchScreen({
  backdrop,
  tilesOnly,
  bare,
  topGap,
  bottomGap,
  boardLayout,
  hud,
  art = tileArt,
  shell,
  boardWash,
  zones,
  lowerHud,
  rules,
  humanOnTop,
}: {
  backdrop?: ReactNode;
  tilesOnly?: boolean;
  bare?: boolean;
  topGap?: number;
  bottomGap?: number;
  boardLayout?: LayoutOptions;
  hud?: (info: MatchHud) => ReactNode;
  art?: Record<TileKind, number>;
  shell?: { upper: BoardShell; lower: BoardShell };
  boardWash?: (board: 'upper' | 'lower') => ReactNode;
  /** Screen bands. The gap sits on the background VS so the two boards stay on their own side. */
  zones?: { upper: number; gap: number; lower: number; topInset: number; bottomInset: number };
  lowerHud?: (info: MatchHud) => ReactNode;
  /** Deneme only. Aztec omits this and keeps the side-free rule. */
  rules?: SelectRules;
  /** Deneme only. Puts the human board on the pink half. Aztec keeps the bot on top. */
  humanOnTop?: boolean;
} = {}) {
  const insets = useSafeAreaInsets();
  const { match, select } = useAnimalMatch(rules);
  const hudInfo = {
    humanScore: match.players.human.score,
    botScore: match.players.bot.score,
    clock: formatClock(match.remainingMs),
  };
  const playing = match.phase === 'playing';

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <View style={[styles.fill, backdrop || tilesOnly ? styles.fillClear : null]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      {backdrop ?? (
        <>
          <LinearGradient colors={['#2a0618', '#140818', '#061428']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
          <Crystal field="pink" />
          <Crystal field="blue" />
        </>
      )}
      <View
        style={[
          styles.stage,
          {
            zIndex: 1,
            paddingTop: zones ? 0 : Math.max(insets.top, 8) + (topGap ?? (tilesOnly || bare ? 28 : 0)),
            paddingBottom: zones ? 0 : Math.max(insets.bottom, 6) + (bottomGap ?? 0),
          },
        ]}
      >
        {hud && !zones ? (
          hud(hudInfo)
        ) : tilesOnly || bare ? null : (
          <Scoreboard
            leftScore={match.players.human.score}
            rightScore={match.players.bot.score}
            clock={formatClock(match.remainingMs)}
          />
        )}
        <View style={zones ? { height: zones.upper, paddingTop: zones.topInset } : styles.arenaSlot}>
        {zones && hud ? <View style={styles.zoneHud}>{hud(hudInfo)}</View> : null}
        <Arena
          tone="pink"
          board={humanOnTop ? 'lower' : 'upper'}
          tiles={humanOnTop ? match.players.human.tiles : match.players.bot.tiles}
          tray={humanOnTop ? match.players.human.tray : match.players.bot.tray}
          enabled={humanOnTop ? playing && match.players.human.status === 'playing' : undefined}
          onSelect={humanOnTop ? select : undefined}
          plain={tilesOnly || bare}
          keepTray={!tilesOnly}
          openSlots={bare}
          boardLayout={boardLayout}
          art={art}
          shell={shell?.upper}
          wash={boardWash?.('upper')}
          rules={rules}
        />
        </View>
        {zones ? <View style={{ height: zones.gap }} /> : tilesOnly || bare ? null : <Image pointerEvents="none" source={vsArt} contentFit="contain" style={styles.vs} />}
        <View style={zones ? { height: zones.lower, paddingBottom: zones.bottomInset } : styles.arenaSlot}>
        {zones && lowerHud ? <View style={styles.zoneHud}>{lowerHud(hudInfo)}</View> : null}
        <Arena
          tone="blue"
          board={humanOnTop ? 'upper' : 'lower'}
          tiles={humanOnTop ? match.players.bot.tiles : match.players.human.tiles}
          tray={humanOnTop ? match.players.bot.tray : match.players.human.tray}
          enabled={!humanOnTop && playing && match.players.human.status === 'playing'}
          onSelect={humanOnTop ? undefined : select}
          plain={tilesOnly || bare}
          keepTray={!tilesOnly}
          openSlots={bare}
          boardLayout={boardLayout}
          art={art}
          shell={shell?.lower}
          wash={boardWash?.('lower')}
          rules={rules}
        />
        </View>
      </View>
      {match.result ? <ResultOverlay result={match.result} bot={match.players.bot} human={match.players.human} /> : null}
    </View>
  );
}

function Scoreboard({ leftScore, rightScore, clock }: { leftScore: number; rightScore: number; clock: string }) {
  return (
    <View style={styles.scoreboard}>
      <Image pointerEvents="none" source={halloweenArt.scoreboard} contentFit="fill" style={StyleSheet.absoluteFill} />
      <View style={[styles.avatarRing, styles.avatarLeft]}>
        <Image source={avatarArt.maya} contentFit="cover" style={styles.avatarPhoto} />
      </View>
      <View style={[styles.avatarRing, styles.avatarRight]}>
        <Image source={avatarArt.berk} contentFit="cover" style={styles.avatarPhoto} />
      </View>
      <Text style={[styles.hudScore, styles.hudScoreLeft]}>{leftScore}</Text>
      <Text style={[styles.hudScore, styles.hudScoreRight]}>{rightScore}</Text>
      <Text style={styles.hudClock}>{clock}</Text>
      <Pressable accessibilityLabel="Geri" onPress={() => router.back()} hitSlop={8} style={styles.back}>
        <View style={styles.backChevron} />
      </Pressable>
    </View>
  );
}

function Arena({
  tone,
  board,
  tiles,
  tray,
  enabled,
  onSelect,
  plain,
  keepTray,
  openSlots,
  boardLayout,
  art,
  shell,
  wash,
  rules,
}: {
  tone: ArenaTone;
  board: 'upper' | 'lower';
  tiles: TileModel[];
  tray: TrayItem[];
  enabled?: boolean;
  onSelect?: (id: string) => void;
  plain?: boolean;
  keepTray?: boolean;
  openSlots?: boolean;
  boardLayout?: LayoutOptions;
  art: Record<TileKind, number>;
  shell?: BoardShell;
  wash?: ReactNode;
  rules?: SelectRules;
}) {
  const [tileSize, setTileSize] = useState(0);
  return (
    <View style={styles.arena}>
      <View style={styles.boardFrame}>
        <TileBoard
          which={board}
          tone={tone}
          tiles={tiles}
          enabled={enabled}
          onSelect={onSelect}
          plain={plain}
          art={art}
          boardLayout={boardLayout}
          holder={
            shell?.channel && (shell.holder || shell.glass)
              ? { source: shell.holder, channel: shell.channel, glass: shell.glass }
              : undefined
          }
          wash={wash}
          onTileSize={shell ? setTileSize : undefined}
          rules={rules}
        />
      </View>
      <Tray
        tone={tone}
        items={tray}
        plain={plain && !keepTray}
        openSlots={openSlots}
        art={art}
        shell={shell}
        tileSize={tileSize}
      />
    </View>
  );
}

const SIDE_CHANNEL = { top: 0.243, bottom: 0.916, left: 0.208, right: 0.785 };
const HEART_FIT = {
  pink: { top: 0.0667, bottom: 0.9228, left: 0.0761, right: 0.9239 },
  blue: { top: 0.105, bottom: 0.8777, left: 0.1046, right: 0.8954 },
} as const;
const HEART_PAD = 0.04;

function heartFrame(placed: { x: number; y: number }[], size: number, tone: ArenaTone) {
  if (placed.length === 0 || size < 1) return null;
  const minX = Math.min(...placed.map((tile) => tile.x));
  const maxX = Math.max(...placed.map((tile) => tile.x));
  const heart = placed.filter((tile) => tile.x > minX + size * 0.8 && tile.x < maxX - size * 0.8);
  if (heart.length === 0) return null;
  const hole = HEART_FIT[tone];
  const pad = size * HEART_PAD;
  const left = Math.min(...heart.map((tile) => tile.x)) - pad;
  const top = Math.min(...heart.map((tile) => tile.y)) - pad;
  const innerW = Math.max(...heart.map((tile) => tile.x)) + size - left + pad;
  const innerH = Math.max(...heart.map((tile) => tile.y)) + size - top + pad;
  const width = innerW / (hole.right - hole.left);
  const height = innerH / (hole.bottom - hole.top);
  return {
    left: left - hole.left * width,
    top: top - hole.top * height,
    width,
    height,
  };
}

function columnFrame(
  placed: { x: number; y: number }[],
  size: number,
  side: 'left' | 'right',
  channel: BoardShell['channel'] = SIDE_CHANNEL,
) {
  if (placed.length === 0 || size < 1) return null;
  const minX = Math.min(...placed.map((tile) => tile.x));
  const maxX = Math.max(...placed.map((tile) => tile.x));
  const column = placed.filter((tile) => (side === 'left' ? tile.x < minX + size * 0.6 : tile.x > maxX - size * 0.6));
  if (column.length === 0) return null;
  const stackLeft = Math.min(...column.map((tile) => tile.x));
  const stackTop = Math.min(...column.map((tile) => tile.y));
  const stackHeight = Math.max(...column.map((tile) => tile.y)) + size - stackTop;
  const spanX = channel.right - channel.left;
  const spanY = channel.bottom - channel.top;
  const width = size / spanX;
  const height = stackHeight / spanY;
  return {
    left: stackLeft - channel.left * width,
    top: stackTop - channel.top * height,
    width,
    height,
  };
}

function pickSpot(x: number, y: number, spots: PlacedTile[], size: number): PlacedTile | null {
  const pad = size * 0.12;
  const hits = spots.filter(
    (spot) => x >= spot.x - pad && y >= spot.y - pad && x < spot.x + size + pad && y < spot.y + size + pad,
  );
  if (hits.length === 0) return null;
  const top = Math.max(...hits.map((spot) => spot.layer));
  let best = hits[0]!;
  let bestDist = Number.POSITIVE_INFINITY;
  hits.forEach((spot) => {
    if (spot.layer !== top) return;
    const dx = spot.x + size / 2 - x;
    const dy = spot.y + size / 2 - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      best = spot;
      bestDist = dist;
    }
  });
  return best;
}

function resolveTap(
  spot: PlacedTile,
  tile: TileModel,
  placed: PlacedTile[],
  tiles: TileModel[],
  size: number,
  rules?: SelectRules,
): TileModel | null {
  if (isSelectable(tile, tiles, rules)) return tile;
  const minX = Math.min(...placed.map((item) => item.x));
  const maxX = Math.max(...placed.map((item) => item.x));
  const onLeft = spot.x < minX + size * 0.6;
  const onRight = spot.x > maxX - size * 0.6;
  if (!onLeft && !onRight) return tile;
  const byId = new Map(tiles.map((item) => [item.id, item]));
  const face = placed
    .filter((item) => (onLeft ? item.x < minX + size * 0.6 : item.x > maxX - size * 0.6))
    .map((item) => byId.get(item.id))
    .filter((item): item is TileModel => Boolean(item && !item.removed && isSelectable(item, tiles, rules)))
    .sort((a, b) => b.layer - a.layer)[0];
  return face ?? tile;
}

function TileBoard({
  which,
  tone,
  tiles,
  enabled,
  onSelect,
  plain,
  art,
  boardLayout,
  holder,
  wash,
  onTileSize,
  rules,
}: {
  which: 'upper' | 'lower';
  tone: ArenaTone;
  tiles: TileModel[];
  enabled?: boolean;
  onSelect?: (id: string) => void;
  plain?: boolean;
  art: Record<TileKind, number>;
  boardLayout?: LayoutOptions;
  holder?: { source?: number; channel: BoardShell['channel']; glass?: GlassTone };
  wash?: ReactNode;
  onTileSize?: (size: number) => void;
  rules?: SelectRules;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [denied, setDenied] = useState<string | null>(null);
  const { tiles: placed, size } = layoutBoard(which, box.w, box.h, boardLayout);
  useEffect(() => {
    onTileSize?.(size);
  }, [onTileSize, size]);
  const byId = new Map(tiles.map((tile) => [tile.id, tile]));
  const ordered = [...placed].sort((a, b) => a.layer - b.layer);
  const sideArt = tone === 'pink' ? halloweenArt.sideWarm : halloweenArt.sideCool;
  const heartArt = tone === 'pink' ? halloweenArt.heartWarm : halloweenArt.heartCool;
  const leftFrame = columnFrame(placed, size, 'left', holder?.channel);
  const rightFrame = columnFrame(placed, size, 'right', holder?.channel);
  const centerFrame = heartFrame(placed, size, tone);
  return (
    <View
      collapsable={false}
      style={styles.board}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
      onStartShouldSetResponder={() => Boolean(enabled && rules?.openFaces)}
      onResponderRelease={(event) => {
        if (!enabled || !rules?.openFaces || size < 8) return;
        const live = ordered.filter((item) => {
          const model = byId.get(item.id);
          return Boolean(model && !model.removed);
        });
        const spot = pickSpot(event.nativeEvent.locationX, event.nativeEvent.locationY, live, size);
        if (!spot) return;
        const tile = byId.get(spot.id);
        if (!tile || tile.removed) return;
        const target = resolveTap(spot, tile, placed, tiles, size, rules);
        if (!target || !isSelectable(target, tiles, rules)) {
          const flash = target?.id ?? tile.id;
          setDenied(flash);
          setTimeout(() => setDenied((current) => (current === flash ? null : current)), 160);
          return;
        }
        onSelect?.(target.id);
      }}
    >
      {wash}
      {plain || !centerFrame ? null : (
        <Image pointerEvents="none" source={heartArt} contentFit="fill" style={[styles.sideFrame, centerFrame]} />
      )}
      {(holder ? [leftFrame, rightFrame] : plain ? [] : [leftFrame, rightFrame]).map((frame, index) =>
        frame ? (
          holder?.glass ? (
            <View key={index === 0 ? 'side-left' : 'side-right'} pointerEvents="none" style={[styles.sideFrame, frame]}>
              <SideTileRack tone={holder.glass} />
            </View>
          ) : (
            <Image
              key={index === 0 ? 'side-left' : 'side-right'}
              pointerEvents="none"
              source={holder?.source ?? sideArt}
              contentFit="fill"
              style={[styles.sideFrame, frame]}
            />
          )
        ) : null,
      )}
      {ordered.map((spot) => {
        const tile = byId.get(spot.id);
        if (!tile || tile.removed) return null;
        const open = isSelectable(tile, tiles, rules);
        const frame = {
          left: spot.x,
          top: spot.y,
          width: size,
          height: size,
          zIndex: tile.layer + 1,
          opacity: denied === tile.id ? 0.45 : 1,
        };
        if (rules?.openFaces) {
          return (
            <View key={tile.id} pointerEvents="none" style={[styles.tile, frame]}>
              <TileFace kind={tile.kind} dim={!open} art={art} />
            </View>
          );
        }
        return (
          <Pressable
            key={tile.id}
            accessibilityLabel={tile.kind}
            disabled={!enabled}
            onPress={() => {
              if (!enabled) return;
              if (!open) {
                setDenied(tile.id);
                setTimeout(() => setDenied((current) => (current === tile.id ? null : current)), 160);
                return;
              }
              onSelect?.(tile.id);
            }}
            style={[styles.tile, frame]}
          >
            <TileFace kind={tile.kind} dim={!open} art={art} />
          </Pressable>
        );
      })}
    </View>
  );
}

function TileFace({ kind, dim, art }: { kind: TileKind; dim: boolean; art: Record<TileKind, number> }) {
  return (
    <View style={styles.tileFace}>
      <Image source={art[kind]} style={styles.tileCard} contentFit="cover" />
    </View>
  );
}

const TRAY_FIT = {
  pink: {
    aspect: 1008 / 164,
    slots: [
      [0.209, 0.36, 0.267, 0.78],
      [0.297, 0.36, 0.353, 0.78],
      [0.383, 0.36, 0.44, 0.78],
      [0.47, 0.36, 0.528, 0.78],
      [0.558, 0.36, 0.616, 0.78],
      [0.645, 0.36, 0.702, 0.78],
      [0.732, 0.36, 0.789, 0.78],
    ],
  },
  blue: {
    aspect: 1023 / 161,
    slots: [
      [0.214, 0.35, 0.27, 0.76],
      [0.3, 0.35, 0.355, 0.76],
      [0.385, 0.35, 0.442, 0.76],
      [0.471, 0.35, 0.527, 0.76],
      [0.557, 0.35, 0.614, 0.76],
      [0.642, 0.35, 0.699, 0.76],
      [0.729, 0.35, 0.785, 0.76],
    ],
  },
} as const;

function Tray({
  tone,
  items,
  plain,
  openSlots,
  art,
  shell,
  tileSize,
}: {
  tone: ArenaTone;
  items: TrayItem[];
  plain?: boolean;
  openSlots?: boolean;
  art: Record<TileKind, number>;
  shell?: BoardShell;
  tileSize?: number;
}) {
  const [trayWidth, setTrayWidth] = useState(0);
  const fit = TRAY_FIT[tone];
  const trayArt = tone === 'pink' ? halloweenArt.trayWarm : halloweenArt.trayCool;
  if (shell?.softTiles) {
    const edge = tone === 'blue' ? 'rgba(120, 220, 255, 0.95)' : 'rgba(255, 140, 210, 0.95)';
    const wash = tone === 'blue' ? 'rgba(6, 18, 48, 0.55)' : 'rgba(40, 8, 32, 0.5)';
    return (
      <View style={styles.softRow}>
        {Array.from({ length: 7 }, (_, index) => {
          const item = items[index];
          return (
            <View key={item?.id ?? `soft-${index}`} style={[styles.softWell, { borderColor: edge, backgroundColor: wash }]}>
              {item ? <TrayIcon item={item} art={art} /> : null}
            </View>
          );
        })}
      </View>
    );
  }
  if (shell) {
    const slotFrac = shell.traySlots[0]![2] - shell.traySlots[0]![0];
    const fitted = tileSize && tileSize > 8 && trayWidth > 0 ? Math.min(trayWidth, tileSize / slotFrac) : trayWidth;
    return (
      <View
        style={styles.shellTray}
        onLayout={(event) => {
          const width = event.nativeEvent.layout.width;
          setTrayWidth((prev) => (prev === width ? prev : width));
        }}
      >
        <View style={{ width: fitted || '100%', aspectRatio: shell.trayAspect }}>
          {shell.skiaTray ? (
            <SevenSlotTray tone={shell.glass === 'cyan' ? 'cyan' : 'magenta'} slots={shell.traySlots} />
          ) : shell.tray ? (
            <Image pointerEvents="none" source={shell.tray} contentFit="fill" style={StyleSheet.absoluteFill} />
          ) : null}
          {shell.traySlots.map((slot, index) => {
            const item = items[index];
            if (!item) return null;
            const [left, top, right, bottom] = slot;
            const accent = shell.glass === 'cyan' ? 'rgba(70, 190, 255, 0.72)' : shell.glass ? 'rgba(255, 90, 180, 0.72)' : undefined;
            return (
              <Reanimated.View
                key={item.id}
                pointerEvents="none"
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(160)}
                style={{
                  position: 'absolute',
                  left: `${left * 100}%`,
                  top: `${top * 100}%`,
                  width: `${(right - left) * 100}%`,
                  height: `${(bottom - top) * 100}%`,
                }}
              >
                <TrayIcon item={item} art={art} accent={accent} />
              </Reanimated.View>
            );
          })}
        </View>
      </View>
    );
  }
  if (openSlots) {
    return (
      <View style={styles.openTray}>
        {Array.from({ length: 7 }, (_, index) => {
          const item = items[index];
          return (
            <View key={item?.id ?? `slot-${index}`} style={styles.openSlot}>
              {item ? <TrayIcon item={item} art={art} /> : null}
            </View>
          );
        })}
      </View>
    );
  }
  if (plain) {
    return (
      <View style={styles.plainTray}>
        {items.map((item) => (
          <View key={item.id} style={styles.plainSlot}>
            <TrayIcon item={item} art={art} />
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={[styles.tray, { aspectRatio: fit.aspect }]}>
      <Image pointerEvents="none" source={trayArt} contentFit="fill" style={StyleSheet.absoluteFill} />
      {fit.slots.map((slot, index) => {
        const item = items[index];
        if (!item) return null;
        const [left, top, right, bottom] = slot;
        return (
          <View
            key={item.id}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: `${left * 100}%`,
              top: `${top * 100}%`,
              width: `${(right - left) * 100}%`,
              height: `${(bottom - top) * 100}%`,
            }}
          >
            <TrayIcon item={item} art={art} />
          </View>
        );
      })}
    </View>
  );
}

function TrayIcon({ item, art, accent }: { item: TrayItem; art: Record<TileKind, number>; accent?: string }) {
  const scale = useRef(new Animated.Value(accent ? 0.86 : 0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(accent ? 0.85 : 0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: item.matching ? 1.12 : 1, useNativeDriver: true, friction: 6 }),
      Animated.timing(opacity, { toValue: item.matching ? 0.45 : 1, duration: item.matching ? 220 : 160, useNativeDriver: true }),
    ]).start();
  }, [item.id, item.matching, opacity, scale]);
  useEffect(() => {
    if (!accent) return;
    glow.setValue(0.85);
    Animated.timing(glow, { toValue: 0, duration: 460, useNativeDriver: true }).start();
  }, [accent, glow, item.id]);
  return (
    <Animated.View style={[styles.slotArt, { opacity, transform: [{ scale }] }]}>
      {accent ? (
        <Animated.View pointerEvents="none" style={[styles.slotGlow, { backgroundColor: accent, opacity: glow }]} />
      ) : null}
      <TileFace kind={item.kind} dim={item.matching} art={art} />
    </Animated.View>
  );
}

function ResultOverlay({ result, bot, human }: { result: MatchResult; bot: PlayerState; human: PlayerState }) {
  const title = result.winner === 'draw' ? 'Berabere' : result.winner === 'human' ? 'Player 1 kazandı' : 'Player 2 kazandı';
  return (
    <View style={styles.resultScrim} pointerEvents="auto">
      <View style={styles.resultCard}>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.resultLine}>Player 2 · {bot.score} puan · {bot.triples} üçlü</Text>
        <Text style={styles.resultLine}>Player 1 · {human.score} puan · {human.triples} üçlü</Text>
      </View>
    </View>
  );
}

function Crystal({ field }: { field: ArenaTone }) {
  const pink = field === 'pink';
  return (
    <View
      pointerEvents="none"
      style={[
        styles.crystal,
        pink ? styles.crystalPink : styles.crystalBlue,
        { backgroundColor: pink ? 'rgba(255,70,150,0.16)' : 'rgba(40,160,255,0.14)' },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#140818' },
  fillClear: { backgroundColor: 'transparent' },
  stage: { flex: 1, paddingHorizontal: 4, gap: 0 },
  arenaSlot: { flex: 1 },
  scoreboard: { width: '100%', aspectRatio: 1022 / 286, flexShrink: 0 },
  plainTray: { height: 46, flexDirection: 'row', justifyContent: 'center', gap: 4, paddingHorizontal: 10 },
  plainSlot: { width: 40, height: 40 },
  openTray: { height: 42, flexDirection: 'row', justifyContent: 'center', gap: 6, paddingHorizontal: 18 },
  openSlot: {
    flex: 1,
    maxWidth: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
  },
  avatarRing: { position: 'absolute', overflow: 'hidden', borderRadius: 999 },
  avatarLeft: { left: '8.6%', top: '34%', width: '10.2%', height: '36%' },
  avatarRight: { left: '81%', top: '26%', width: '11%', height: '46%' },
  avatarPhoto: { width: '100%', height: '100%' },
  hudScore: {
    position: 'absolute',
    top: '44%',
    width: '13%',
    textAlign: 'center',
    color: '#fff7e6',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  hudScoreLeft: { left: '21%' },
  hudScoreRight: { left: '67.5%' },
  hudClock: {
    position: 'absolute',
    left: '42%',
    top: '74%',
    width: '16%',
    textAlign: 'center',
    color: '#ffe7a3',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vs: { width: '36%', height: 28, alignSelf: 'center', marginVertical: 2 },
  back: { position: 'absolute', left: 2, top: 2, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  backChevron: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  arena: { flex: 1, gap: 2 },
  boardFrame: { flex: 1, position: 'relative', minHeight: 72 },
  board: { ...StyleSheet.absoluteFillObject, overflow: 'visible' },
  sideFrame: { position: 'absolute', zIndex: 0 },
  tile: { position: 'absolute' },
  tileFace: {
    flex: 1,
    overflow: 'hidden',
  },
  tileCard: { ...StyleSheet.absoluteFillObject },
  tileArt: { position: 'absolute', top: '16%', left: '16%', right: '16%', bottom: '16%' },
  tileShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16, 20, 32, 0.34)' },
  tray: { width: '100%', flexShrink: 0 },
  shellTray: { width: '100%', flexShrink: 0, alignItems: 'center' },
  softRow: {
    width: '100%',
    height: 52,
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  softWell: {
    flex: 1,
    maxWidth: 46,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  softCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  zoneHud: { alignItems: 'center', paddingBottom: 2, flexShrink: 0 },
  trayInner: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  slot: { flex: 1, borderRadius: 4, overflow: 'hidden' },
  slotArt: { flex: 1 },
  slotGlow: { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  slotImage: { width: '100%', height: '100%' },
  resultScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 2, 16, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 20,
  },
  resultCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#ff4d9a',
    backgroundColor: 'rgba(16, 6, 28, 0.94)',
    paddingVertical: 22,
    paddingHorizontal: 18,
    gap: 8,
  },
  resultTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  resultLine: { color: '#d7e8ff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  crystal: { position: 'absolute', width: 90, height: 140, borderRadius: 40, transform: [{ rotate: '28deg' }] },
  crystalPink: { top: 80, left: -30 },
  crystalBlue: { bottom: 40, right: -36 },
});

