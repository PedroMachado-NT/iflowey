import React from 'react';
import { View } from 'react-native';
import Field from './Field';

// Espelha o EnderecoDTO do backend: cep, logradouro, numero, bairro, cidade, uf
export default function AddressForm({ value, onChange }) {
  const set = (k) => (t) => onChange({ ...value, [k]: t });
  return (
    <View>
      <Field label="CEP" value={value.cep} onChangeText={set('cep')} keyboardType="numbers-and-punctuation" placeholder="00000-000" maxLength={9} />
      <Field label="Logradouro" value={value.logradouro} onChangeText={set('logradouro')} placeholder="Rua, avenida..." />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Número" value={value.numero} onChangeText={set('numero')} style={{ flex: 1 }} />
        <Field label="Bairro" value={value.bairro} onChangeText={set('bairro')} style={{ flex: 2 }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Cidade" value={value.cidade} onChangeText={set('cidade')} style={{ flex: 3 }} />
        <Field label="UF" value={value.uf} onChangeText={(t) => set('uf')(t.toUpperCase())} autoCapitalize="characters" maxLength={2} style={{ flex: 1 }} />
      </View>
    </View>
  );
}
