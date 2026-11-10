import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, radius } from '../theme';
import { money } from '../utils';

// Barra flutuante "Ver carrinho" (mantém a compra em poucos cliques, RNF001)
export default function CartBar({ navigation }) {
  const { cart, cartCount } = useApp();
  if (cartCount === 0) return null;
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Ver carrinho, ${cartCount} itens, total ${money(cart.total)}`}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Cart')}
        style={styles.bar}
      >
        <View style={styles.count}><Text style={styles.countTxt}>{cartCount}</Text></View>
        <Text style={styles.label}>Ver carrinho</Text>
        <Text style={styles.total}>{money(cart.total)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  bar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.2,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  count: { backgroundColor: '#fff', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  countTxt: { color: colors.primary, fontWeight: '800' },
  label: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 12 },
  total: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
