import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Chips from './Chips';
import Field from './Field';
import { colors } from '../theme';

// Formas aceitas pelo backend (TipoPagamento): PIX, CARTAO, BOLETO
export const PAYMENT_OPTIONS = { Pix: 'PIX', Cartão: 'CARTAO', Boleto: 'BOLETO' };
const LABELS = Object.keys(PAYMENT_OPTIONS);

export const labelOfTipo = (tipo) => LABELS.find((l) => PAYMENT_OPTIONS[l] === tipo) || tipo;

export const emptyPayment = (email = '') => ({ tipo: 'PIX', chavePix: email, ultimosDigitos: '' });

export const validatePayment = (p) => {
  if (p.tipo === 'PIX' && !p.chavePix.trim()) return 'Informe a chave Pix.';
  if (p.tipo === 'CARTAO' && !/^\d{4}$/.test(p.ultimosDigitos)) return 'Informe os 4 últimos dígitos do cartão.';
  return null;
};

// corpo de POST /api/pedidos/{id}/pagamento
export const paymentPayload = (p) => {
  if (p.tipo === 'PIX') return { tipo: 'PIX', chavePix: p.chavePix.trim() };
  if (p.tipo === 'CARTAO') return { tipo: 'CARTAO', ultimosDigitos: p.ultimosDigitos };
  return { tipo: 'BOLETO' };
};

export default function PaymentFields({ value, onChange }) {
  return (
    <View>
      <Chips
        options={LABELS}
        value={labelOfTipo(value.tipo)}
        onChange={(l) => onChange({ ...value, tipo: PAYMENT_OPTIONS[l] })}
      />
      {value.tipo === 'PIX' && (
        <Field label="Chave Pix" value={value.chavePix} onChangeText={(t) => onChange({ ...value, chavePix: t })} autoCapitalize="none" placeholder="e-mail, CPF ou telefone" />
      )}
      {value.tipo === 'CARTAO' && (
        <Field label="Últimos 4 dígitos do cartão" value={value.ultimosDigitos} onChangeText={(t) => onChange({ ...value, ultimosDigitos: t.replace(/\D/g, '').slice(0, 4) })} keyboardType="number-pad" maxLength={4} placeholder="0000" />
      )}
      {value.tipo === 'BOLETO' && (
        <Text style={styles.hint}>O boleto é gerado após confirmar e o pedido só é confirmado quando a loja registrar a compensação.</Text>
      )}
      {value.tipo !== 'BOLETO' && (
        <Text style={styles.hint}>Pagamento simulado: é aprovado na hora.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { color: colors.muted, fontSize: 12, marginTop: 8 },
});
