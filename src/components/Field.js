import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function Field({ label, style, inputStyle, ...props }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        accessibilityLabel={`Campo de ${label}`}
        style={[styles.input, inputStyle]}
        {...props}
      />
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 20, marginBottom: 2 },
});

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.text, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
