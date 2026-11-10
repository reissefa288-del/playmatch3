import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

const undo = require('../assets/action-undo.png');
const pass = require('../assets/action-pass.png');
const like = require('../assets/action-like.png');
const invite = require('../assets/action-invite.png');
const superLike = require('../assets/action-super.png');

type ActionRowProps = {
  canUndo: boolean;
  canLike: boolean;
  onUndo: () => void;
  onPass: () => void;
  onLike: () => void;
  onInvite: () => void;
  onSuperLike: () => void;
};

export function ActionRow({
  canUndo,
  canLike,
  onUndo,
  onPass,
  onLike,
  onInvite,
  onSuperLike,
}: ActionRowProps) {
  return (
    <View style={styles.row}>
      <Action art={undo} label="Geri al" disabled={!canUndo} onPress={onUndo} />
      <Action art={pass} label="Geç" onPress={onPass} />
      <Action art={like} label="Beğen" large disabled={!canLike} onPress={onLike} />
      <Action art={invite} label="Oyuna davet" onPress={onInvite} />
      <Action art={superLike} label="Süper beğeni" disabled={!canLike} onPress={onSuperLike} />
    </View>
  );
}

function Action({
  art,
  label,
  large,
  disabled,
  onPress,
}: {
  art: number;
  label: string;
  large?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const size = large ? 68 : 52;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[styles.hit, disabled ? styles.dim : null]}
    >
      <Image source={art} style={{ width: size, height: size }} contentFit="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 4,
  },
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: {
    opacity: 0.38,
  },
});
