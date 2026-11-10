import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

// RNF02: todo botão tem um label descritivo (texto + accessibilityLabel)
export default function Button({ label, onPress, variant = 'primary', disabled, style }) {
  const outline = variant === 'outline';
  const danger = variant === 'danger';
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.btn,
        outline && styles.outline,
        danger && styles.danger,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.text, (outline || danger) && { color: danger ? colors.danger : colors.primary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.danger },
  text: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
