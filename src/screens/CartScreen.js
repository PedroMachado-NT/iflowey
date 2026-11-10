import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { colors, radius, cardShadow } from '../theme';
import { errorMessage, money, notify } from '../utils';

// RF006 / RF018 – carrinho guardado no servidor
export default function CartScreen({ navigation }) {
  const { cart, refreshCart, changeQty, removeItem, clearCart } = useApp();

  useFocusEffect(useCallback(() => { refreshCart(); }, [refreshCart]));

  const safe = (fn) => async () => {
    try {
      await fn();
    } catch (e) {
      notify('Erro', errorMessage(e));
    }
  };

  if (!cart || !cart.itens.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={{ fontSize: 56 }}>🧺</Text>
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptySub}>Escolha uma floricultura e adicione flores.</Text>
        <Button label="Ver floriculturas" onPress={() => navigation.navigate('Tabs')} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={cart.itens}
        keyExtractor={(i) => String(i.id)}
        ListHeaderComponent={<Text style={styles.store}>🌷 {cart.lojaNome}</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.produtoNome}</Text>
                <Text style={styles.itemPrice}>{money(item.precoUnitario)} cada · {money(item.subtotal)}</Text>
                {!!item.personalizacao && <Text style={styles.note}>✉️ "{item.personalizacao}"</Text>}
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={item.quantidade > 1 ? `Diminuir quantidade de ${item.produtoNome}` : `Remover ${item.produtoNome}`}
                  onPress={safe(() => (item.quantidade > 1 ? changeQty(item.id, item.quantidade - 1) : removeItem(item.id)))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepTxt}>{item.quantidade > 1 ? '−' : '🗑'}</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantidade}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Aumentar quantidade de ${item.produtoNome}`}
                  onPress={safe(() => changeQty(item.id, item.quantidade + 1))}
                  style={styles.stepBtn}
                >
                  <Text style={styles.stepTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={<Button label="Esvaziar carrinho" variant="danger" onPress={safe(clearCart)} style={{ marginTop: 8 }} />}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.footer}>
        <View style={styles.row}>
          <Text style={styles.sumLabel}>Total</Text>
          <Text style={styles.sumValue}>{money(cart.total)}</Text>
        </View>
        <Button label="Ir para o checkout" onPress={() => navigation.navigate('Checkout')} style={{ marginTop: 10 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 10 },
  emptySub: { color: colors.muted, marginTop: 4 },
  store: { fontSize: 18, fontWeight: '800', color: colors.primaryDark, marginBottom: 12 },
  item: { backgroundColor: colors.card, borderRadius: radius.md, padding: 12, marginBottom: 12, ...cardShadow },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemName: { fontWeight: '700', color: colors.text, fontSize: 15 },
  itemPrice: { color: colors.muted, marginTop: 2, fontSize: 13 },
  note: { color: colors.primaryDark, marginTop: 4, fontStyle: 'italic', fontSize: 13 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  stepTxt: { fontSize: 18, fontWeight: '700', color: colors.primary },
  qty: { fontWeight: '800', minWidth: 16, textAlign: 'center' },
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel: { fontSize: 16, color: colors.text },
  sumValue: { fontSize: 18, fontWeight: '900', color: colors.text },
});
