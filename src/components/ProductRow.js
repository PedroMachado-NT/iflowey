import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, cardShadow } from '../theme';
import { money } from '../utils';
import ProductImage from './ProductImage';

// ProdutoDTO.Response: id, lojaId, nome, foto, descricao, preco, permitePersonalizacao
// - cliente: passa onAdd/onRemove (stepper)  - vendedor: passa onEdit/onDelete
export default function ProductRow({ product, qty = 0, onAdd, onRemove, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{product.nome}</Text>
        {!!product.descricao && <Text style={styles.desc} numberOfLines={2}>{product.descricao}</Text>}
        {product.permitePersonalizacao && <Text style={styles.tag}>✉️ Aceita mensagem personalizada</Text>}
        <Text style={styles.price}>{money(product.preco)}</Text>
        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Editar ${product.nome}`} onPress={onEdit} style={styles.actBtn}>
                <Text style={styles.actTxt}>Editar</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Excluir ${product.nome}`} onPress={onDelete} style={[styles.actBtn, { borderColor: colors.danger }]}>
                <Text style={[styles.actTxt, { color: colors.danger }]}>Excluir</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View style={styles.right}>
        <ProductImage uri={product.foto} />
        {onAdd && (
          <View style={styles.stepper}>
            {qty > 0 && (
              <>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remover uma unidade de ${product.nome}`} onPress={onRemove} style={styles.stepBtn}>
                  <Text style={styles.stepTxt}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{qty}</Text>
              </>
            )}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Adicionar ${product.nome} ao carrinho`} onPress={onAdd} style={[styles.stepBtn, styles.addBtn]}>
              <Text style={[styles.stepTxt, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: radius.md,
    padding: 12, marginBottom: 12, ...cardShadow,
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, marginTop: 3, fontSize: 13 },
  tag: { color: colors.primaryDark, fontSize: 12, marginTop: 5, fontWeight: '600' },
  price: { color: colors.text, fontWeight: '800', marginTop: 8, fontSize: 16 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  actTxt: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  right: { alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -16 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  addBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepTxt: { fontSize: 20, fontWeight: '700', color: colors.primary, marginTop: -2 },
  qty: { fontWeight: '800', minWidth: 14, textAlign: 'center', color: colors.text },
});
