import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Chips from '../components/Chips';
import Field, { fieldStyles } from '../components/Field';
import AddressForm from '../components/AddressForm';
import { colors, radius } from '../theme';
import { cleanAddress, emptyAddress, errorMessage, isTime, notify, validateAddress } from '../utils';

const ROLES = ['Sou cliente', 'Sou vendedor'];

// RF001 / RF023 – cadastro de cliente (CPF) e de vendedor (CNPJ + loja)
export default function RegisterScreen() {
  const { registerClient, registerVendor } = useApp();
  const [role, setRole] = useState(ROLES[0]);
  const vendor = role === ROLES[1];

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState(emptyAddress());
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nomeLoja, setNomeLoja] = useState('');
  const [descricaoLoja, setDescricaoLoja] = useState('');
  const [abertura, setAbertura] = useState('08:00');
  const [fechamento, setFechamento] = useState('18:00');
  const [lojaOutroEndereco, setLojaOutroEndereco] = useState(false);
  const [enderecoLoja, setEnderecoLoja] = useState(emptyAddress());
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!nome.trim() || !email.trim() || !telefone.trim()) return notify('Dados incompletos', 'Preencha nome, e-mail e telefone.');
    if (senha.length < 8) return notify('Senha curta', 'A senha deve ter pelo menos 8 caracteres.');
    const addrErr = validateAddress(endereco);
    if (addrErr) return notify('Endereço', addrErr);

    const base = {
      nome: nome.trim(), email: email.trim(), senha, telefone: telefone.trim(), endereco: cleanAddress(endereco),
    };

    setBusy(true);
    try {
      if (!vendor) {
        if (!cpf.trim()) throw new Error('Informe o CPF.');
        await registerClient({ ...base, cpf: cpf.trim() });
      } else {
        if (!cnpj.trim() || !nomeLoja.trim()) throw new Error('Informe o CNPJ e o nome da loja.');
        if ((abertura && !isTime(abertura)) || (fechamento && !isTime(fechamento))) {
          throw new Error('Horários devem estar no formato HH:mm (ex.: 08:00).');
        }
        if (lojaOutroEndereco) {
          const e = validateAddress(enderecoLoja);
          if (e) throw new Error('Endereço da loja: ' + e);
        }
        await registerVendor({
          ...base,
          cnpj: cnpj.trim(),
          nomeLoja: nomeLoja.trim(),
          descricaoLoja: descricaoLoja.trim() || null,
          enderecoLoja: lojaOutroEndereco ? cleanAddress(enderecoLoja) : null,
          abertura: abertura || null,
          fechamento: fechamento || null,
        });
      }
      // sucesso: o login automático troca a navegação
    } catch (e) {
      notify('Não foi possível cadastrar', errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Chips options={ROLES} value={role} onChange={setRole} scroll={false} />

        <Text style={fieldStyles.section}>Seus dados</Text>
        <Field label="Nome" value={nome} onChangeText={setNome} />
        <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Senha (mín. 8 caracteres)" value={senha} onChangeText={setSenha} secureTextEntry />
        <Field label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="41999990000" />
        {!vendor && <Field label="CPF" value={cpf} onChangeText={setCpf} keyboardType="numbers-and-punctuation" placeholder="000.000.000-00" />}

        <Text style={fieldStyles.section}>{vendor ? 'Seu endereço' : 'Endereço (usado em "lojas próximas")'}</Text>
        <AddressForm value={endereco} onChange={setEndereco} />

        {vendor && (
          <>
            <Text style={fieldStyles.section}>Sua loja</Text>
            <Field label="CNPJ" value={cnpj} onChangeText={setCnpj} keyboardType="numbers-and-punctuation" placeholder="00.000.000/0000-00" />
            <Field label="Nome da loja" value={nomeLoja} onChangeText={setNomeLoja} />
            <Field label="Descrição (opcional)" value={descricaoLoja} onChangeText={setDescricaoLoja} multiline />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Field label="Abre às" value={abertura} onChangeText={setAbertura} placeholder="08:00" style={{ flex: 1 }} />
              <Field label="Fecha às" value={fechamento} onChangeText={setFechamento} placeholder="18:00" style={{ flex: 1 }} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchTitle}>A loja fica em outro endereço</Text>
              <Switch value={lojaOutroEndereco} onValueChange={setLojaOutroEndereco} trackColor={{ true: colors.primary }} accessibilityLabel="Loja em outro endereço" />
            </View>
            {lojaOutroEndereco && <AddressForm value={enderecoLoja} onChange={setEnderecoLoja} />}
          </>
        )}

        <Button label={busy ? 'Cadastrando...' : 'Criar conta'} onPress={submit} disabled={busy} style={{ marginTop: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16, padding: 12,
    backgroundColor: colors.primarySoft, borderRadius: radius.md,
  },
  switchTitle: { flex: 1, fontWeight: '700', color: colors.primaryDark },
});
