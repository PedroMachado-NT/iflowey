import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { API_URL } from '../services/api';
import Button from '../components/Button';
import Field from '../components/Field';
import { colors } from '../theme';
import { errorMessage, notify } from '../utils';

// RF002 – login real (POST /api/auth/login) com token JWT
export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !senha) return notify('Dados incompletos', 'Informe e-mail e senha.');
    setBusy(true);
    try {
      await login(email, senha);
    } catch (e) {
      notify('Não foi possível entrar', errorMessage(e));
      setBusy(false);
    }
  };

  const fill = (e) => {
    setEmail(e);
    setSenha('Senha@123');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={{ fontSize: 56 }}>🌸</Text>
            <Text style={styles.logo}>IFlowey</Text>
            <Text style={styles.tag}>Flores frescas, entregues com carinho</Text>
          </View>

          <View style={styles.form}>
            <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@email.com" />
            <Field label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="Sua senha" />

            <Button label={busy ? 'Entrando...' : 'Entrar'} onPress={submit} disabled={busy} style={{ marginTop: 22 }} />
            <Button label="Criar conta" variant="outline" onPress={() => navigation.navigate('Register')} style={{ marginTop: 10 }} />

            <View style={styles.demo}>
              <Text style={styles.demoTitle}>Contas de teste (dados do seed, senha Senha@123)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Preencher com cliente de teste" style={styles.demoBtn} onPress={() => fill('joao@iflower.com')}>
                  <Text style={styles.demoTxt}>Cliente</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Preencher com vendedora de teste" style={styles.demoBtn} onPress={() => fill('ana@iflower.com')}>
                  <Text style={styles.demoTxt}>Vendedora</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.api}>API: {API_URL}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  hero: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 36, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  tag: { color: colors.muted, marginTop: 4 },
  form: { maxWidth: 420, width: '100%', alignSelf: 'center' },
  demo: { marginTop: 26, padding: 12, backgroundColor: colors.primarySoft, borderRadius: 12 },
  demoTitle: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  demoBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  demoTxt: { color: colors.primary, fontWeight: '700' },
  api: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 14 },
});
