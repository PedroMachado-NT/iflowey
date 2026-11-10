import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, cardShadow } from '../theme';
import { hhmm, storeEmoji } from '../utils';

// Campos do LojaDTO.Response: id, nome, descricao, endereco, abertura, fechamento, notaMedia, totalAvaliacoes
export default function StoreCard({ store, onPress }) {
  const rating = store.totalAvaliacoes > 0 ? `★ ${Number(store.notaMedia).toFixed(1)}` : 'Novo';
  const hours = store.abertura && store.fechamento ? `${hhmm(store.abertura)}–${hhmm(store.fechamento)}` : null;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Abrir loja ${store.nome}`}
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.logo}>
        <Text style={{ fontSize: 34 }}>{storeEmoji(store.id)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>{store.nome}</Text>
        <Text style={styles.meta}>
          <Text style={{ color: colors.gold, fontWeight: '700' }}>{rating}</Text>
          {store.totalAvaliacoes > 0 ? ` (${store.totalAvaliacoes})` : ''}
          {'  •  '}{store.endereco?.cidade}/{store.endereco?.uf}
        </Text>
        {!!store.descricao && <Text style={styles.desc} numberOfLines={1}>{store.descricao}</Text>}
        {hours && <Text style={styles.hours}>🕒 Aberto das {hours}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: radius.md,
    padding: 12, marginBottom: 12, ...cardShadow,
  },
  logo: {
    width: 68, height: 68, borderRadius: radius.md, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { color: colors.muted, marginTop: 3, fontSize: 13 },
  desc: { color: colors.muted, marginTop: 3, fontSize: 12 },
  hours: { color: colors.green, fontWeight: '600', fontSize: 12, marginTop: 4 },
});
