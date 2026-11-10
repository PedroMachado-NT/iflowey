import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { avaliacaoService, lojaService, pagamentoService, pedidoService } from '../services';
import useLoad from '../hooks/useLoad';
import Button from '../components/Button';
import Stars from '../components/Stars';
import PaymentFields, { emptyPayment, labelOfTipo, paymentPayload, validatePayment } from '../components/PaymentFields';
import { ErrorBox, Loading } from '../components/State';
import { colors, radius, cardShadow } from '../theme';
import {
  addressToText, confirmAction, errorMessage, flowFor, formatDate, formatDateTime, hhmm,
  isPickup, money, nextStatuses, notify, statusLabel,
} from '../utils';

// RF010 acompanhar pedido (atualiza sozinho a cada 8 s) | RF012 detalhes | RF017/RF021 cancelar
// RF019 pagar | RF003/RF022 avaliar | vendedor: RF015 status e RF024 boleto
export default function TrackingScreen({ route }) {
  const { user, isVendor } = useApp();
  const orderId = route.params.orderId;
  const { data: order, loading, error, reload } = useLoad(() => pedidoService.buscar(orderId), [orderId]);
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState(emptyPayment(user.email));

  useFocusEffect(
    useCallback(() => {
      const t = setInterval(reload, 8000);
      return () => clearInterval(t);
    }, [reload])
  );

  const act = async (fn, okMsg) => {
    setBusy(true);
    try {
      await fn();
      await reload();
      if (okMsg) notify(okMsg);
    } catch (e) {
      notify('Não foi possível concluir', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading && !order) return <View style={styles.safe}><Loading /></View>;
  if (error && !order) return <View style={styles.safe}><ErrorBox message={error} onRetry={reload} /></View>;
  if (!order) return null;

  const pickup = isPickup(order);
  const cancelled = order.status === 'CANCELADO';
  const done = order.status === 'ENTREGUE';
  const steps = flowFor(pickup);
  const stepIdx = steps.indexOf(order.status);

  const pagamentos = order.pagamentos || [];
  const ativo = pagamentos.find((p) => p.status !== 'RECUSADO');
  const podePagar = !isVendor && order.status === 'AGUARDANDO_PAGAMENTO' && !ativo;
  const boletoPendente = ativo?.tipo === 'BOLETO' && ativo.status === 'PENDENTE';
  const podeCancelar = !isVendor && (order.status === 'AGUARDANDO_PAGAMENTO' || order.status === 'CONFIRMADO');
  const vendorNext = isVendor ? nextStatuses(order.status, pickup) : [];

  const pay = () => {
    const err = validatePayment(payment);
    if (err) return notify('Pagamento', err);
    act(() => pedidoService.pagar(order.id, paymentPayload(payment)));
  };

  const cancel = () =>
    confirmAction('Cancelar pedido', 'Tem certeza que deseja cancelar este pedido?', 'Cancelar pedido', () =>
      act(() => pedidoService.cancelar(order.id))
    );

  const changeStatus = (status) => {
    const run = () => act(() => pedidoService.atualizarStatus(order.id, status));
    if (status === 'CANCELADO') confirmAction('Cancelar pedido', 'Cancelar este pedido para o cliente?', 'Cancelar pedido', run);
    else run();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, cancelled && { backgroundColor: '#FDE8E9' }]}>
          <Text style={{ fontSize: 44 }}>{cancelled ? '🥀' : done ? '🎉' : '💐'}</Text>
          <Text style={[styles.heroTitle, cancelled && { color: colors.danger }]}>{statusLabel(order.status, pickup)}</Text>
          <Text style={styles.heroSub}>Pedido #{order.id} · {isVendor ? order.clienteNome : order.lojaNome}</Text>
          {order.entrega && (
            <Text style={styles.heroSub}>
              {pickup ? 'Retirada' : 'Entrega'}: {formatDate(order.entrega.dataEntrega)} às {hhmm(order.entrega.horario)}
            </Text>
          )}
        </View>

        {!cancelled && (
          <View style={styles.card}>
            {steps.map((s, idx) => {
              const reached = idx <= stepIdx;
              const current = idx === stepIdx;
              return (
                <View key={s} style={styles.step}>
                  <View style={{ alignItems: 'center' }}>
                    <View style={[styles.dot, reached && styles.dotOn, current && styles.dotCurrent]}>
                      {reached && <Text style={styles.check}>✓</Text>}
                    </View>
                    {idx < steps.length - 1 && <View style={[styles.line, idx < stepIdx && styles.lineOn]} />}
                  </View>
                  <Text style={[styles.stepLabel, reached && { color: colors.text, fontWeight: '700' }]}>{statusLabel(s, pickup)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ---------- vendedor: atualizar status / confirmar boleto ---------- */}
        {isVendor && (vendorNext.length > 0 || boletoPendente) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ações da loja</Text>
            {boletoPendente && (
              <Button label="Confirmar compensação do boleto" onPress={() => act(() => pagamentoService.confirmarBoleto(ativo.id))} disabled={busy} style={{ marginTop: 10 }} />
            )}
            {vendorNext.map((s) => (
              <Button
                key={s}
                label={s === 'CANCELADO' ? 'Cancelar pedido' : `Marcar como: ${statusLabel(s, pickup)}`}
                variant={s === 'CANCELADO' ? 'danger' : 'primary'}
                onPress={() => changeStatus(s)}
                disabled={busy}
                style={{ marginTop: 10 }}
              />
            ))}
          </View>
        )}

        {/* ---------- cliente: pagar agora ---------- */}
        {podePagar && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pagamento pendente</Text>
            <PaymentFields value={payment} onChange={setPayment} />
            <Button label={`Pagar ${money(order.valorTotal)}`} onPress={pay} disabled={busy} style={{ marginTop: 14 }} />
          </View>
        )}

        {pagamentos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pagamento</Text>
            {pagamentos.map((p) => (
              <View key={p.id} style={{ marginTop: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.txt}>{labelOfTipo(p.tipo)}</Text>
                  <Text style={[styles.pay, p.status === 'APROVADO' && { color: colors.green }, p.status === 'RECUSADO' && { color: colors.danger }]}>
                    {p.status === 'APROVADO' ? 'Aprovado' : p.status === 'PENDENTE' ? 'Pendente' : 'Recusado'}
                  </Text>
                </View>
                {p.chavePix && <Text style={styles.muted}>Chave Pix: {p.chavePix}</Text>}
                {p.ultimosDigitos && <Text style={styles.muted}>Cartão final {p.ultimosDigitos}</Text>}
                {p.codigoBarras && <Text style={[styles.muted, { fontFamily: 'monospace' }]} selectable>Boleto: {p.codigoBarras}</Text>}
              </View>
            ))}
          </View>
        )}

        {done && !isVendor && <RatingCard order={order} userId={user.id} />}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detalhes</Text>
          {order.itens.map((i, idx) => (
            <View key={idx} style={{ marginTop: 6 }}>
              <View style={styles.row}>
                <Text style={styles.txt}>{i.quantidade}× {i.nome}</Text>
                <Text style={styles.txt}>{money(i.subtotal)}</Text>
              </View>
              {!!i.personalizacao && <Text style={styles.note}>✉️ "{i.personalizacao}"</Text>}
            </View>
          ))}
          <View style={styles.divider} />
          {order.entrega && !pickup && <Text style={styles.muted}>📍 {addressToText(order.entrega.endereco)}</Text>}
          {pickup && <Text style={styles.muted}>🏪 Retirada na loja</Text>}
          <Text style={styles.muted}>🕒 Pedido feito em {formatDateTime(order.dataPedido)}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.total}>Total</Text>
            <Text style={styles.total}>{money(order.valorTotal)}</Text>
          </View>
        </View>

        {podeCancelar && <Button label="Cancelar pedido" variant="danger" onPress={cancel} disabled={busy} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// RF003 criar / RF022 editar e excluir a avaliação da loja (uma por cliente)
function RatingCard({ order, userId }) {
  const [mine, setMine] = useState(undefined); // undefined = carregando, null = ainda não avaliou
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    lojaService
      .avaliacoes(order.lojaId)
      .then((list) => {
        const m = list.find((a) => a.clienteId === userId) || null;
        setMine(m);
        if (m) {
          setNota(m.nota);
          setComentario(m.comentario || '');
        }
      })
      .catch(() => setMine(null));
  }, [order.lojaId, userId]);

  const save = async () => {
    if (!nota) return notify('Avaliação', 'Escolha de 1 a 5 estrelas.');
    setBusy(true);
    try {
      const res = mine
        ? await avaliacaoService.editar(mine.id, nota, comentario)
        : await avaliacaoService.criar(order.lojaId, nota, comentario);
      setMine(res);
      notify('Obrigado pela avaliação! 🌸');
    } catch (e) {
      notify('Não foi possível avaliar', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = () =>
    confirmAction('Excluir avaliação', 'Deseja excluir sua avaliação desta loja?', 'Excluir', async () => {
      try {
        await avaliacaoService.excluir(mine.id);
        setMine(null);
        setNota(0);
        setComentario('');
      } catch (e) {
        notify('Erro', errorMessage(e));
      }
    });

  if (mine === undefined) return null;
  return (
    <View style={[styles.card, { alignItems: 'center' }]}>
      <Text style={styles.cardTitle}>{mine ? 'Sua avaliação' : `Como foi com ${order.lojaNome}?`}</Text>
      <View style={{ marginTop: 8 }}><Stars value={nota} onChange={setNota} /></View>
      <TextInput
        style={styles.comment}
        value={comentario}
        onChangeText={setComentario}
        placeholder="Comentário (opcional)"
        multiline
        maxLength={500}
        accessibilityLabel="Comentário da avaliação"
      />
      <Button label={mine ? 'Atualizar avaliação' : 'Enviar avaliação'} onPress={save} disabled={busy} style={{ alignSelf: 'stretch', marginTop: 10 }} />
      {mine && <Button label="Excluir avaliação" variant="danger" onPress={remove} style={{ alignSelf: 'stretch', marginTop: 8 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 20, marginBottom: 14 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: colors.primaryDark, marginTop: 6, textAlign: 'center' },
  heroSub: { color: colors.muted, marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginBottom: 14, ...cardShadow },
  cardTitle: { fontWeight: '800', fontSize: 16, color: colors.text },
  step: { flexDirection: 'row', gap: 14, minHeight: 54 },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.green },
  dotCurrent: { borderWidth: 3, borderColor: '#BFE8D0' },
  check: { color: '#fff', fontSize: 13, fontWeight: '900' },
  line: { width: 3, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  lineOn: { backgroundColor: colors.green },
  stepLabel: { color: colors.muted, fontSize: 15, paddingTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  txt: { color: colors.text, flexShrink: 1 },
  pay: { fontWeight: '700', color: colors.gold },
  note: { color: colors.muted, fontStyle: 'italic', marginLeft: 4 },
  muted: { color: colors.muted, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  total: { fontSize: 17, fontWeight: '900', color: colors.text },
  comment: {
    alignSelf: 'stretch', marginTop: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: 12, minHeight: 60, textAlignVertical: 'top',
  },
});
