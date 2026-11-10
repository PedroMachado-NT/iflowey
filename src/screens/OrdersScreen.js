import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { pedidoService } from '../services';
import useLoad from '../hooks/useLoad';
import Chips from '../components/Chips';
import { Empty, ErrorBox, Loading } from '../components/State';
import { colors, radius, cardShadow } from '../theme';
import { formatDateTime, isPickup, money, statusLabel } from '../utils';

const FILTERS = {
  Todos: undefined,
  'Aguardando pagamento': 'AGUARDANDO_PAGAMENTO',
  Confirmados: 'CONFIRMADO',
  'Em preparo': 'EM_PREPARO',
  'Em rota / retirada': null, // tratado abaixo (dois status)
  Entregues: 'ENTREGUE',
  Cancelados: 'CANCELADO',
};

// Cliente: RF014 histórico. Vendedor: RF013 pedidos da loja, com filtro por status.
// Toque em um pedido para acompanhar (RF010) ou, como vendedor, atualizar o status (RF015).
export default function OrdersScreen({ navigation }) {
  const { isVendor } = useApp();
  const [filter, setFilter] = useState('Todos');

  const { data, loading, error, reload } = useLoad(async () => {
    if (filter === 'Em rota / retirada') {
      const [a, b] = await Promise.all([pedidoService.listar('SAIU_PARA_ENTREGA'), pedidoService.listar('PRONTO_PARA_RETIRADA')]);
      return [...a, ...b].sort((x, y) => (x.dataPedido < y.dataPedido ? 1 : -1));
    }
    return pedidoService.listar(FILTERS[filter]);
  }, [filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>{isVendor ? 'Pedidos da loja' : 'Meus pedidos'}</Text>
      {isVendor && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Chips options={Object.keys(FILTERS)} value={filter} onChange={setFilter} />
        </View>
      )}
      <FlatList
        data={data || []}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? <Loading />
            : error ? <ErrorBox message={error} onRetry={reload} />
            : <Empty text={isVendor ? 'Nenhum pedido encontrado.' : 'Você ainda não fez nenhum pedido.'} />
        }
        renderItem={({ item }) => {
          const done = item.status === 'ENTREGUE';
          const cancelled = item.status === 'CANCELADO';
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Abrir pedido ${item.id}`}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Tracking', { orderId: item.id })}
              style={styles.card}
            >
              <View style={styles.row}>
                <Text style={styles.store} numberOfLines={1}>{isVendor ? item.clienteNome : item.lojaNome}</Text>
                <Text style={[styles.status, done && styles.statusDone, cancelled && styles.statusCancel]}>
                  {statusLabel(item.status, isPickup(item))}
                </Text>
              </View>
              <Text style={styles.meta}>#{item.id} · {formatDateTime(item.dataPedido)}</Text>
              <Text style={styles.meta} numberOfLines={1}>{item.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}</Text>
              <Text style={styles.total}>{money(item.valorTotal)}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 12, ...cardShadow },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  store: { fontWeight: '800', fontSize: 16, color: colors.text, flexShrink: 1 },
  status: {
    fontSize: 11, fontWeight: '700', color: colors.primaryDark, backgroundColor: colors.primarySoft,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, overflow: 'hidden',
  },
  statusDone: { color: colors.green, backgroundColor: '#E3F6EB' },
  statusCancel: { color: colors.danger, backgroundColor: '#FDE8E9' },
  meta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  total: { fontWeight: '900', color: colors.text, marginTop: 8, fontSize: 16 },
});
