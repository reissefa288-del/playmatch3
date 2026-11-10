import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { BackHandler, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppFont } from '@/design/font-mode';
import { frameArt, HUD_BLUE_ASPECT, HUD_RED_ASPECT, hudBlue, hudRed, vsBadge, vsDivider } from '@/features/galaxy-duel/art';
import {
  asteroidSource,
  bulletSource,
  enemyRotation,
  enemySource,
  fieldArt,
  fxSource,
  pickupSource,
  playerSource,
  shieldFrame,
} from '@/features/galaxy-duel/sprites';
import { type Match, type Side } from '@/features/galaxy-duel/sim';
import { formatScore, galaxy, type GalaxySide } from '@/features/galaxy-duel/theme';
import { useGalaxyMatch } from '@/features/galaxy-duel/use-match';

function useMetrics() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const frameX = Math.round(Math.max(8, Math.min(22, width * 0.045)));
  const inner = Math.max(220, width - frameX * 2);
  const hudW = Math.min(inner, Math.round(inner * 0.98));
  const bezelLip = Math.round(Math.max(10, Math.min(18, height * 0.014)));
  return {
    width,
    height,
    frameX,
    frameTop: Math.round(Math.max(bezelLip, insets.top * 0.42)),
    frameBottom: Math.round(Math.max(insets.bottom, 4) + bezelLip * 0.6),
    hudW,
    score: Math.max(11, Math.min(16, hudW * 0.038)),
    time: Math.max(13, Math.min(20, hudW * 0.048)),
  };
}

function PlayerHud({
  side,
  width,
  hp,
  lives,
  score,
  scoreSize,
  fontFamily,
}: {
  side: GalaxySide;
  width: number;
  hp: number;
  lives: number;
  score: number;
  scoreSize: number;
  fontFamily?: string;
}) {
  const aspect = side === 'red' ? HUD_RED_ASPECT : HUD_BLUE_ASPECT;
  const accent = side === 'red' ? galaxy.redSoft : galaxy.cyanSoft;
  const height = Math.round(width / aspect);
  const hpText = lives > 0 ? `${hp} +${lives}` : String(hp);
  return (
    <View style={[styles.hud, { width, height }]} accessibilityLabel={`${side} HUD`}>
      <Image source={side === 'red' ? hudRed : hudBlue} style={StyleSheet.absoluteFill} contentFit="contain" />
      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.hudBay}>
          <Text
            accessibilityLabel={`${side} can ${hp}`}
            style={[styles.scoreText, { color: accent, fontSize: scoreSize, fontFamily }]}
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {hpText}
          </Text>
        </View>
        <View style={styles.hudCenter} />
        <View style={styles.hudBay}>
          <Text
            accessibilityLabel={`${side} skor ${score}`}
            style={[styles.scoreText, { color: accent, fontSize: scoreSize, fontFamily }]}
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {formatScore(score)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Field({ match }: { match: Match }) {
  const shift = match.scroll % match.height;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={fieldArt.space} style={StyleSheet.absoluteFill} contentFit="cover" />
      <Image source={fieldArt.starsFar} style={[styles.tile, { top: shift - match.height, height: match.height }]} contentFit="cover" />
      <Image source={fieldArt.starsFar} style={[styles.tile, { top: shift, height: match.height }]} contentFit="cover" />
      <Image
        source={fieldArt.starsNear}
        style={[styles.tile, { top: (shift * 1.8) % match.height - match.height, height: match.height, opacity: 0.85 }]}
        contentFit="cover"
      />
      <Image source={fieldArt.nebula} style={[StyleSheet.absoluteFill, { opacity: 0.42 }]} contentFit="cover" />
      {match.asteroids.map((rock) =>
        rock.alive ? (
          <Image
            key={rock.id}
            source={asteroidSource(rock.variant)}
            contentFit="contain"
            style={spriteBox(rock.x, rock.y, rock.w, rock.h)}
          />
        ) : null,
      )}
      {match.pickups.map((pickup) =>
        pickup.alive ? (
          <Image
            key={pickup.id}
            source={pickupSource(pickup.kind)}
            contentFit="contain"
            style={spriteBox(pickup.x, pickup.y, pickup.w, pickup.h)}
          />
        ) : null,
      )}
      {match.enemies.map((enemy) =>
        enemy.alive ? (
          <Image
            key={enemy.id}
            source={enemySource(enemy.kind)}
            contentFit="contain"
            style={[spriteBox(enemy.x, enemy.y, enemy.w, enemy.h), { transform: [{ rotate: enemyRotation(enemy.kind, enemy.vy) }] }]}
          />
        ) : null,
      )}
      {match.bullets.map((bullet) =>
        bullet.alive ? (
          <Image
            key={bullet.id}
            source={bulletSource(bullet.owner, bullet.kind)}
            contentFit="contain"
            style={[
              spriteBox(bullet.x, bullet.y, bullet.w, bullet.h),
              { transform: [{ rotate: `${(Math.atan2(bullet.vx, -bullet.vy) * 180) / Math.PI}deg` }] },
            ]}
          />
        ) : null,
      )}
      {match.players.map((player) =>
        player.alive && player.laser > 0 ? (
          <Beam key={`${player.side}-beam`} side={player.side} x={player.x} y={player.y} height={match.height} />
        ) : null,
      )}
      {match.players.map((player) => {
        if (!player.alive) return null;
        return (
          <View key={player.side} style={spriteBox(player.x, player.y, player.w, player.h)} accessibilityLabel={`${player.side} gemi`}>
            <Image
              source={playerSource(player.side, player.hitFlash > 0)}
              contentFit="contain"
              style={[StyleSheet.absoluteFill, { opacity: player.invuln > 0 ? 0.55 : 1 }]}
            />
            {player.shield > 0 ? (
              <Image source={shieldFrame(player.shield)} contentFit="contain" style={StyleSheet.absoluteFill} />
            ) : null}
          </View>
        );
      })}
      {match.fx.map((fx) =>
        fx.alive ? (
          <Image
            key={fx.id}
            source={fxSource(fx.kind, fx.age)}
            contentFit="contain"
            style={spriteBox(fx.x, fx.y, fx.w, fx.h)}
          />
        ) : null,
      )}
      {match.enemies
        .filter((enemy) => enemy.alive && enemy.boss)
        .map((enemy) => (
          <View key={`boss-${enemy.id}`} style={[styles.bossBar, { top: enemy.lane === 'red' ? 8 : '52%' }]}>
            <View style={[styles.bossFill, { width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }]} />
          </View>
        ))}
    </View>
  );
}

function Beam({ side, x, y, height }: { side: Side; x: number; y: number; height: number }) {
  const top = side === 'blue' ? height * 0.5 : 0;
  const beam = y - top;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - 3,
        top,
        width: 6,
        height: Math.max(0, beam),
        backgroundColor: side === 'blue' ? 'rgba(80, 220, 255, 0.85)' : 'rgba(255, 60, 100, 0.85)',
      }}
    />
  );
}

function spriteBox(x: number, y: number, w: number, h: number) {
  return {
    position: 'absolute' as const,
    left: x - w / 2,
    top: y - h / 2,
    width: w,
    height: h,
  };
}

/** Playable co-op duel. HUD plates stay; the battle view runs the match. */
export function GalaxyDuelScreen() {
  const metrics = useMetrics();
  const valueFont = useAppFont('bold');
  const { match, fps, input, layout, pause, resume, restart, consumeBack } = useGalaxyMatch();
  const red = match?.players[1];
  const blue = match?.players[0];
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => consumeBack());
    return () => sub.remove();
  }, [consumeBack]);

  return (
    <View style={styles.fill}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#1a0614', '#070814', '#041422']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
      {__DEV__ ? (
        <View pointerEvents="none" style={styles.fpsBadge}>
          <Text style={styles.fpsText} allowFontScaling={false}>
            {fps} FPS
          </Text>
        </View>
      ) : null}
      <View
        style={[
          styles.stage,
          { paddingTop: metrics.frameTop, paddingBottom: metrics.frameBottom, paddingHorizontal: metrics.frameX },
        ]}
      >
        <View style={styles.hudSlot}>
          <PlayerHud
            side="red"
            width={metrics.hudW}
            hp={Math.max(0, Math.ceil(red?.hp ?? 100))}
            lives={red?.extraLives ?? 0}
            score={red?.score ?? 0}
            scoreSize={metrics.score}
            fontFamily={valueFont}
          />
        </View>
        <View
          style={styles.battle}
          testID="galaxy-duel-battle"
          onLayout={(event) => layout(event.nativeEvent.layout.width, event.nativeEvent.layout.height)}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(event) => applyTouches(event.nativeEvent.touches, match?.height ?? 1, input)}
          onResponderMove={(event) => applyTouches(event.nativeEvent.touches, match?.height ?? 1, input)}
          onResponderRelease={(event) => applyTouches(event.nativeEvent.touches, match?.height ?? 1, input)}
          onResponderTerminate={() => {
            input.current.blue = null;
            input.current.red = null;
          }}
        >
          {match ? <Field match={match} /> : null}
          <View style={styles.vsWrap} pointerEvents="none">
            <Image source={vsDivider} style={styles.vsLine} contentFit="fill" />
            <View style={styles.vsBadge}>
              <Image source={vsBadge} style={StyleSheet.absoluteFill} contentFit="contain" />
              <Text style={[styles.vsText, valueFont ? { fontFamily: valueFont } : null]} allowFontScaling={false}>
                VS
              </Text>
            </View>
          </View>
          <Pressable accessibilityLabel="Duraklat" onPress={pause} style={styles.pause} hitSlop={8}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </Pressable>
          <Pressable
            accessibilityLabel="Mavi özel"
            onPressIn={() => {
              input.current.blueSpecial = true;
            }}
            onPressOut={() => {
              input.current.blueSpecial = false;
            }}
            style={[styles.special, styles.specialBlue]}
          >
            <Text style={styles.specialText}>ÖZEL</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Kırmızı özel"
            onPressIn={() => {
              input.current.redSpecial = true;
            }}
            onPressOut={() => {
              input.current.redSpecial = false;
            }}
            style={[styles.special, styles.specialRed]}
          >
            <Text style={styles.specialText}>ÖZEL</Text>
          </Pressable>
        </View>
        <View style={styles.hudSlot}>
          <PlayerHud
            side="blue"
            width={metrics.hudW}
            hp={Math.max(0, Math.ceil(blue?.hp ?? 100))}
            lives={blue?.extraLives ?? 0}
            score={blue?.score ?? 0}
            scoreSize={metrics.score}
            fontFamily={valueFont}
          />
        </View>
      </View>
      <View pointerEvents="none" style={[styles.frameLayer, { width: metrics.width, height: metrics.height }]}>
        <Image source={frameArt} style={{ width: metrics.width, height: metrics.height }} contentFit="fill" />
      </View>
      <Modal visible={match?.mode === 'paused'} transparent animationType="fade" onRequestClose={resume}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, valueFont ? { fontFamily: valueFont } : null]}>Duraklatıldı</Text>
            <Text style={styles.sheetBody}>Ateş ve düşmanlar durdu.</Text>
            <Pressable onPress={resume} style={styles.sheetButton}>
              <Text style={styles.sheetButtonText}>Devam</Text>
            </Pressable>
            <Pressable onPress={restart} style={styles.sheetGhost}>
              <Text style={styles.sheetGhostText}>Yeniden başlat</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.sheetGhost}>
              <Text style={styles.sheetGhostText}>Oyunlara dön</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={match?.mode === 'over'} transparent animationType="fade" onRequestClose={restart}>
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={[styles.sheetTitle, valueFont ? { fontFamily: valueFont } : null]}>Oyun bitti</Text>
            <Text style={styles.sheetBody}>{match?.outcome}</Text>
            <Text style={styles.sheetBody}>
              Mavi {formatScore(blue?.score ?? 0)} · Kırmızı {formatScore(red?.score ?? 0)}
            </Text>
            <Pressable onPress={restart} style={styles.sheetButton}>
              <Text style={styles.sheetButtonText}>Yeniden başlat</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} style={styles.sheetGhost}>
              <Text style={styles.sheetGhostText}>Oyunlara dön</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function applyTouches(
  touches: readonly { locationX: number; locationY: number }[],
  height: number,
  input: { current: { blue: { x: number; y: number } | null; red: { x: number; y: number } | null } },
) {
  let blue: { x: number; y: number } | null = null;
  let red: { x: number; y: number } | null = null;
  if (touches.length >= 2) {
    const ordered = [...touches].sort((a, b) => a.locationY - b.locationY);
    const upper = ordered[0];
    const lower = ordered[ordered.length - 1];
    if (upper && lower) {
      red = { x: upper.locationX, y: upper.locationY };
      blue = { x: lower.locationX, y: lower.locationY };
    }
  } else if (touches.length === 1) {
    const only = touches[0];
    if (only) {
      const point = { x: only.locationX, y: only.locationY };
      if (point.y < height / 2) red = point;
      else blue = point;
    }
  }
  input.current.blue = blue;
  input.current.red = red;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: galaxy.space },
  fpsBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  fpsText: {
    color: '#7CFFB2',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  frameLayer: { position: 'absolute', top: 0, left: 0, zIndex: 4 },
  stage: { flex: 1, gap: 4 },
  hudSlot: { alignItems: 'center', zIndex: 2 },
  hud: { overflow: 'visible' },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '3%',
  },
  hudBay: { flex: 1.15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  hudCenter: { flex: 0.85, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  scoreText: {
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeText: {
    color: galaxy.text,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  battle: { flex: 1, overflow: 'hidden', backgroundColor: '#070814' },
  tile: { position: 'absolute', left: 0, right: 0 },
  vsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 42,
    marginTop: -21,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  vsLine: { position: 'absolute', left: 0, right: 0, top: 8, bottom: 8 },
  vsBadge: { width: 54, height: 40, alignItems: 'center', justifyContent: 'center' },
  vsText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  pause: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pauseBar: { width: 3, height: 12, backgroundColor: '#fff', borderRadius: 1 },
  special: {
    position: 'absolute',
    zIndex: 5,
    width: 54,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  specialBlue: { right: 8, bottom: 8, borderWidth: 1, borderColor: galaxy.cyan },
  specialRed: { right: 8, top: 46, borderWidth: 1, borderColor: galaxy.red },
  specialText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stageBanner: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  stageBannerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  bossBar: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 52,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  bossFill: { height: '100%', backgroundColor: '#ff4d6a' },
  gunLabel: { position: 'absolute', width: 56, textAlign: 'center', fontSize: 9, fontWeight: '800' },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 20,
    gap: 12,
    backgroundColor: '#10131f',
    borderWidth: 1,
    borderColor: 'rgba(90, 200, 255, 0.35)',
  },
  sheetTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sheetBody: { color: 'rgba(220,230,255,0.8)', fontSize: 14, lineHeight: 20 },
  sheetButton: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1aa8ff' },
  sheetButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sheetGhost: { height: 36, alignItems: 'center', justifyContent: 'center' },
  sheetGhostText: { color: '#9adfff', fontSize: 14, fontWeight: '600' },
});
