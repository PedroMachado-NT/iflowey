import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lojaService } from '../services';
import Button from '../components/Button';
import Field, { fieldStyles } from '../components/Field';
import AddressForm from '../components/AddressForm';
import { Text } from 'react-native';
import { colors } from '../theme';
import { cleanAddress, errorMessage, fromApiAddress, hhmm, isTime, notify, validateAddress } from '../utils';

// RF020 – o vendedor edita nome, descrição, endereço e horário de funcionamento da loja
export default function EditStoreScreen({ navigation, route }) {
  const { store } = route.params;
  const [nome, setNome] = useState(store.nome);
  const [descricao, setDescricao] = useState(store.descricao || '');
  const [endereco, setEndereco] = useState(fromApiAddress(store.endereco));
  const [abertura, setAbertura] = useState(hhmm(store.abertura));
  const [fechamento, setFechamento] = useState(hhmm(store.fechamento));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!nome.trim()) return notify('Nome obrigatório', 'Informe o nome da loja.');
    const addrErr = validateAddress(endereco);
    if (addrErr) return notify('Endereço', addrErr);
    if ((abertura && !isTime(abertura)) || (fechamento && !isTime(fechamento))) {
      return notify('Horário inválido', 'Use o formato HH:mm (ex.: 08:00).');
    }
    setBusy(true);
    try {
      await lojaService.atualizarMinha({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        endereco: cleanAddress(endereco),
        abertura: abertura || null,
        fechamento: fechamento || null,
      });
      notify('Loja atualizada', 'As alterações já aparecem para os clientes. 🌸');
      navigation.goBack();
    } catch (e) {
      notify('Não foi possível salvar', errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Field label="Nome da loja" value={nome} onChangeText={setNome} maxLength={120} />
        <Field label="Descrição" value={descricao} onChangeText={setDescricao} multiline maxLength={500} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Field label="Abre às" value={abertura} onChangeText={setAbertura} placeholder="08:00" style={{ flex: 1 }} />
          <Field label="Fecha às" value={fechamento} onChangeText={setFechamento} placeholder="18:00" style={{ flex: 1 }} />
        </View>
        <Text style={fieldStyles.section}>Endereço da loja</Text>
        <AddressForm value={endereco} onChange={setEndereco} />
        <Button label={busy ? 'Salvando...' : 'Salvar alterações'} onPress={save} disabled={busy} style={{ marginTop: 22 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
});
