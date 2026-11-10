import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { lojaService } from '../services';
import useLoad from '../hooks/useLoad';
import StoreCard from '../components/StoreCard';
import Chips from '../components/Chips';
import CartBar from '../components/CartBar';
import { Empty, ErrorBox, Loading } from '../components/State';
import { colors, radius } from '../theme';

const MODES = ['Perto de mim', 'Todas'];

export default function HomeScreen({ navigation }) {
  const { user } = useApp();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [mode, setMode] = useState(MODES[0]);

  // espera o usuário parar de digitar antes de consultar a API (RNF003)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const near = mode === MODES[0];
  const { cidade, uf } = user.endereco || {};

  // RF004: GET /api/lojas/proximas | RF007: GET /api/lojas?nome=&cidade=&uf=
  const { data, loading, error, reload } = useLoad(() => {
    if (!debounced) return near ? lojaService.proximas() : lojaService.listar();
    return lojaService.listar(near ? { nome: debounced, cidade, uf } : { nome: debounced });
  }, [debounced, near]);

  const header = (
    <View>
      <Text style={styles.hello}>Olá, {user.nome.split(' ')[0]} 👋</Text>
      <Text style={styles.title}>Que flores vamos levar hoje?</Text>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="🔍  Buscar floricultura pelo nome"
        accessibilityLabel="Buscar loja por nome"
        clearButtonMode="while-editing"
      />
      <View style={{ marginVertical: 12 }}>
        <Chips options={MODES} value={mode} onChange={setMode} />
      </View>
      <Text style={styles.section}>{near ? `Em ${cidade || 'sua cidade'}` : 'Todas as lojas'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={data || []}
        keyExtractor={(s) => String(s.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? <Loading />
            : error ? <ErrorBox message={error} onRetry={reload} />
            : <Empty emoji="🥀" text={debounced ? `Nenhuma loja encontrada para "${debounced}".` : 'Nenhuma loja disponível por aqui ainda.'} />
        }
        renderItem={({ item }) => (
          <StoreCard store={item} onPress={() => navigation.navigate('Store', { storeId: item.id })} />
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        keyboardShouldPersistTaps="handled"
      />
      <CartBar navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hello: { color: colors.muted, fontSize: 14 },
  title: { fontSize: 24, fontWeight: '900', color: colors.text, marginTop: 2, marginBottom: 14 },
  search: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10 },
});
