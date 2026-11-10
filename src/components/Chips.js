import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function Chips({ options, value, onChange, scroll = true }) {
  const items = options.map((opt) => {
    const active = opt === value;
    return (
      <TouchableOpacity
        key={opt}
        accessibilityRole="button"
        accessibilityLabel={`Opção ${opt}${active ? ', selecionada' : ''}`}
        onPress={() => onChange(opt)}
        style={[styles.chip, active && styles.active]}
      >
        <Text style={[styles.text, active && { color: '#fff' }]}>{opt}</Text>
      </TouchableOpacity>
    );
  });
  if (!scroll) return <>{items}</>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {items}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontWeight: '600' },
});
