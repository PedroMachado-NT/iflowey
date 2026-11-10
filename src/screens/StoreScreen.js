import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { lojaService } from '../services';
import useLoad from '../hooks/useLoad';
import ProductRow from '../components/ProductRow';
import CartBar from '../components/CartBar';
import PersonalizeModal from '../components/PersonalizeModal';
import { Empty, ErrorBox, Loading } from '../components/State';
import { colors, radius } from '../theme';
import { confirmAction, errorMessage, hhmm, notify, storeEmoji } from '../utils';

export default function StoreScreen({ route, navigation }) {
  const { storeId } = route.params;
  const { cart, addToCart, changeQty, removeItem, clearCart } = useApp();
  const [personalizing, setPersonalizing] = useState(null);

  // RF025: loja (com nota média) + catálogo
  const { data, loading, error, reload } = useLoad(async () => {
    const [store, products] = await Promise.all([lojaService.buscar(storeId), lojaService.produtos(storeId)]);
    return { store, products };
  }, [storeId]);

  const linesOf = (pid) => (cart && cart.lojaId === storeId ? cart.itens.filter((i) => i.produtoId === pid) : []);
  const qtyOf = (pid) => linesOf(pid).reduce((s, i) => s + i.quantidade, 0);

  const doAdd = async (product, personalizacao) => {
    try {
      await addToCart(product.id, 1, personalizacao);
    } catch (e) {
      notify('Não foi possível adicionar', errorMessage(e));
    }
  };

  const onAdd = (product) => {
    const startNew = () => {
      if (product.permitePersonalizacao) setPersonalizing(product);
      else doAdd(product);
    };
    // RN01: carrinho aceita uma loja só
    if (cart && cart.itens.length > 0 && cart.lojaId !== storeId) {
      confirmAction(
        'Iniciar novo pedido?',
        `Seu carrinho tem itens de ${cart.lojaNome}. Deseja esvaziá-lo e começar um novo pedido aqui?`,
        'Esvaziar e continuar',
        async () => {
          try {
            await clearCart();
            startNew();
          } catch (e) {
            notify('Erro', errorMessage(e));
          }
        }
      );
      return;
    }
    startNew();
  };

  const onRemove = async (product) => {
    const lines = linesOf(product.id);
    const line = lines[lines.length - 1];
    if (!line) return;
    try {
      if (line.quantidade > 1) await changeQty(line.id, line.quantidade - 1);
      else await removeItem(line.id);
    } catch (e) {
      notify('Erro', errorMessage(e));
    }
  };

  if (loading && !data) return <View style={styles.safe}><Loading /></View>;
  if (error && !data) return <View style={styles.safe}><ErrorBox message={error} onRetry={reload} /></View>;

  const { store, products } = data;
  const rating = store.totalAvaliacoes > 0 ? `★ ${Number(store.notaMedia).toFixed(1)} (${store.totalAvaliacoes})` : 'Novo na plataforma';

  const header = (
    <View style={styles.header}>
      <View style={styles.logo}><Text style={{ fontSize: 40 }}>{storeEmoji(store.id)}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{store.nome}</Text>
        <Text style={styles.meta}><Text style={{ color: colors.gold, fontWeight: '700' }}>{rating}</Text></Text>
        {!!store.descricao && <Text style={styles.meta}>{store.descricao}</Text>}
        <Text style={styles.meta}>
          📍 {store.endereco?.logradouro}, {store.endereco?.numero} · {store.endereco?.cidade}/{store.endereco?.uf}
        </Text>
        {store.abertura && store.fechamento && (
          <Text style={styles.meta}>🕒 {hhmm(store.abertura)}–{hhmm(store.fechamento)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.safe}>
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={<Empty text="Esta loja ainda não cadastrou produtos." />}
        renderItem={({ item }) => (
          <ProductRow product={item} qty={qtyOf(item.id)} onAdd={() => onAdd(item)} onRemove={() => onRemove(item)} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
      />
      <CartBar navigation={navigation} />
      <PersonalizeModal
        product={personalizing}
        onCancel={() => setPersonalizing(null)}
        onConfirm={(text) => {
          const p = personalizing;
          setPersonalizing(null);
          doAdd(p, text);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.primarySoft,
    padding: 14, borderRadius: radius.lg, marginBottom: 16,
  },
  logo: { width: 76, height: 76, borderRadius: radius.lg, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '900', color: colors.primaryDark },
  meta: { color: colors.muted, marginTop: 3, fontSize: 13 },
});
