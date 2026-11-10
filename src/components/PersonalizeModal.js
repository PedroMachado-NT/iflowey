import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, radius } from '../theme';

// Pergunta a mensagem do cartão ao adicionar um produto que aceita personalização (RN02)
export default function PersonalizeModal({ product, onCancel, onConfirm }) {
  const [text, setText] = useState('');
  useEffect(() => setText(''), [product]);

  return (
    <Modal visible={!!product} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{product?.nome}</Text>
          <Text style={styles.sub}>✉️ Mensagem para o cartão (opcional, máx. 300 caracteres)</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={300}
            placeholder="Ex.: Parabéns, muita felicidade!"
            accessibilityLabel="Mensagem personalizada do cartão"
          />
          <Button label="Adicionar ao carrinho" onPress={() => onConfirm(text.trim())} style={{ marginTop: 14 }} />
          <Button label="Cancelar" variant="outline" onPress={onCancel} style={{ marginTop: 8 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 18, maxWidth: 460, width: '100%', alignSelf: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12,
    minHeight: 80, textAlignVertical: 'top', fontSize: 15,
  },
});
