import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { produtoService } from '../services';
import Button from '../components/Button';
import Field from '../components/Field';
import ProductImage from '../components/ProductImage';
import { colors, radius } from '../theme';
import { errorMessage, notify } from '../utils';

// RF008 – cadastrar produto (nome, foto, descrição, preço, personalização) | RF016 – editar
// O backend guarda a foto como URL (não há upload de arquivo), então o campo é um link.
export default function NewProductScreen({ navigation, route }) {
  const editing = route.params?.product;
  const [nome, setNome] = useState(editing?.nome || '');
  const [foto, setFoto] = useState(editing?.foto || '');
  const [descricao, setDescricao] = useState(editing?.descricao || '');
  const [preco, setPreco] = useState(editing ? String(editing.preco).replace('.', ',') : '');
  const [permite, setPermite] = useState(!!editing?.permitePersonalizacao);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const value = parseFloat(preco.replace(',', '.'));
    if (!nome.trim()) return notify('Nome obrigatório', 'Informe o nome do produto.');
    if (!value || value <= 0) return notify('Preço inválido', 'Informe um preço maior que zero.');
    const body = {
      nome: nome.trim(),
      foto: foto.trim() || null,
      descricao: descricao.trim() || null,
      preco: value,
      permitePersonalizacao: permite,
    };
    setBusy(true);
    try {
      if (editing) await produtoService.atualizar(editing.id, body);
      else await produtoService.criar(body);
      notify(editing ? 'Produto atualizado' : 'Produto cadastrado', 'Ele já aparece na sua loja. 🌸');
      navigation.goBack();
    } catch (e) {
      notify('Não foi possível salvar', errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignSelf: 'center' }}><ProductImage uri={foto.trim()} size={140} /></View>

        <Field label="Link da foto (URL)" value={foto} onChangeText={setFoto} autoCapitalize="none" keyboardType="url" placeholder="https://..." />
        <Field label="Nome do produto" value={nome} onChangeText={setNome} placeholder="Ex.: Buquê de Rosas" maxLength={120} />
        <Field label="Descrição" value={descricao} onChangeText={setDescricao} multiline maxLength={1000} placeholder="Conte o que vem no produto" inputStyle={{ minHeight: 80, textAlignVertical: 'top' }} />
        <Field label="Preço (R$)" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" placeholder="0,00" />

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Permitir personalização</Text>
            <Text style={styles.switchSub}>O cliente poderá escrever uma mensagem para o cartão</Text>
          </View>
          <Switch value={permite} onValueChange={setPermite} trackColor={{ true: colors.primary }} accessibilityLabel="Permitir personalização do produto" />
        </View>

        <Button label={busy ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar produto'} onPress={save} disabled={busy} style={{ marginTop: 22 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, padding: 12, backgroundColor: colors.primarySoft, borderRadius: radius.md },
  switchTitle: { fontWeight: '700', color: colors.primaryDark },
  switchSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
