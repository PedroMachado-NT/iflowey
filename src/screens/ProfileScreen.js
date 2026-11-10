import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { usuarioService } from '../services';
import Button from '../components/Button';
import Field, { fieldStyles } from '../components/Field';
import AddressForm from '../components/AddressForm';
import { colors } from '../theme';
import { cleanAddress, confirmAction, errorMessage, fromApiAddress, notify, validateAddress } from '../utils';

// RF005 – consultar/editar nome, telefone e endereço; desativar a conta (e-mail e documento são fixos)
export default function ProfileScreen() {
  const { user, setUser, logout, isVendor } = useApp();
  const [nome, setNome] = useState(user.nome);
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [endereco, setEndereco] = useState(fromApiAddress(user.endereco));
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!nome.trim() || !telefone.trim()) return notify('Dados incompletos', 'Informe nome e telefone.');
    const err = validateAddress(endereco);
    if (err) return notify('Endereço', err);
    setBusy(true);
    try {
      const updated = await usuarioService.atualizar({ nome: nome.trim(), telefone: telefone.trim(), endereco: cleanAddress(endereco) });
      setUser(updated);
      notify('Dados salvos', 'Suas informações foram atualizadas. 🌸');
    } catch (e) {
      notify('Não foi possível salvar', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const deactivate = () =>
    confirmAction('Desativar conta', 'Sua conta será desativada e você não poderá mais entrar. Seu histórico de pedidos é preservado. Continuar?', 'Desativar', async () => {
      try {
        await usuarioService.desativar();
        logout();
      } catch (e) {
        notify('Erro', errorMessage(e));
      }
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={styles.avatar}><Text style={{ fontSize: 40 }}>{isVendor ? '🌼' : '🌸'}</Text></View>
        <Text style={styles.title}>{user.nome}</Text>
        <Text style={styles.role}>{isVendor ? 'Vendedor' : 'Cliente'} · {user.email}</Text>
        {!!user.cpf && <Text style={styles.role}>CPF {user.cpf}</Text>}

        <Field label="Nome" value={nome} onChangeText={setNome} />
        <Field label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

        <Text style={fieldStyles.section}>{isVendor ? 'Endereço' : 'Endereço (define as "lojas próximas")'}</Text>
        <AddressForm value={endereco} onChange={setEndereco} />

        <Button label={busy ? 'Salvando...' : 'Salvar dados'} onPress={save} disabled={busy} style={{ marginTop: 22 }} />
        <Button label="Sair da conta" variant="outline" onPress={() => confirmAction('Sair da conta', 'Deseja realmente sair?', 'Sair', logout)} style={{ marginTop: 10 }} />
        <Button label="Desativar minha conta" variant="danger" onPress={deactivate} style={{ marginTop: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  avatar: {
    alignSelf: 'center', width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 10 },
  role: { textAlign: 'center', color: colors.muted, marginTop: 2 },
});
