import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lojaService, produtoService } from '../services';
import useLoad from '../hooks/useLoad';
import ProductRow from '../components/ProductRow';
import Button from '../components/Button';
import { Empty, ErrorBox, Loading } from '../components/State';
import { colors, radius } from '../theme';
import { confirmAction, errorMessage, hhmm, notify, storeEmoji } from '../utils';

// RF016 (listar/editar/excluir produtos) + RF020 (perfil da loja)
export default function SellerScreen({ navigation }) {
  const { data, loading, error, reload } = useLoad(async () => {
    const [store, products] = await Promise.all([lojaService.minha(), produtoService.meus()]);
    return { store, products };
  }, []);

  const remove = (p) =>
    confirmAction('Excluir produto', `Excluir "${p.nome}"? Pedidos já feitos continuam no histórico.`, 'Excluir', async () => {
      try {
        await produtoService.excluir(p.id);
        reload();
      } catch (e) {
        notify('Não foi possível excluir', errorMessage(e));
      }
    });

  if (loading && !data) return <View style={styles.safe}><Loading /></View>;
  if (error && !data) return <View style={styles.safe}><ErrorBox message={error} onRetry={reload} /></View>;

  const { store, products } = data;
  const rating = store.totalAvaliacoes > 0 ? `★ ${Number(store.notaMedia).toFixed(1)} (${store.totalAvaliacoes})` : 'Sem avaliações';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={{ fontSize: 36 }}>{storeEmoji(store.id)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{store.nome}</Text>
                <Text style={styles.sub}>{rating} · {products.length} {products.length === 1 ? 'produto' : 'produtos'}</Text>
                {store.abertura && store.fechamento && <Text style={styles.sub}>🕒 {hhmm(store.abertura)}–{hhmm(store.fechamento)}</Text>}
              </View>
            </View>
            <Button label="Editar perfil da loja" variant="outline" onPress={() => navigation.navigate('EditStore', { store })} style={{ marginBottom: 10 }} />
            <Button label="Cadastrar novo produto" onPress={() => navigation.navigate('NewProduct')} style={{ marginBottom: 16 }} />
            <Text style={styles.section}>Meus produtos</Text>
          </View>
        }
        ListEmptyComponent={<Empty text="Nenhum produto ainda. Cadastre o primeiro!" />}
        renderItem={({ item }) => (
          <ProductRow product={item} onEdit={() => navigation.navigate('NewProduct', { product: item })} onDelete={() => remove(item)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.primarySoft,
    padding: 14, borderRadius: radius.lg, marginBottom: 14,
  },
  name: { fontSize: 20, fontWeight: '900', color: colors.primaryDark },
  sub: { color: colors.muted, marginTop: 2 },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10 },
});
