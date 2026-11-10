import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

// Se onChange for passado, as estrelas são clicáveis (avaliação, RF011)
export default function Stars({ value = 0, onChange, size = 32 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Text style={{ fontSize: size, color: n <= value ? colors.gold : colors.border }}>★</Text>
        );
        return onChange ? (
          <TouchableOpacity
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Avaliar com ${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
            onPress={() => onChange(n)}
          >
            {star}
          </TouchableOpacity>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}
