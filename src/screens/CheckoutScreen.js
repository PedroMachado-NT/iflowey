import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { lojaService, pedidoService } from '../services';
import useLoad from '../hooks/useLoad';
import Button from '../components/Button';
import Chips from '../components/Chips';
import AddressForm from '../components/AddressForm';
import PaymentFields, { emptyPayment, labelOfTipo, paymentPayload, validatePayment } from '../components/PaymentFields';
import { Loading } from '../components/State';
import { colors, radius, cardShadow } from '../theme';
import {
  addressToText, buildDays, cleanAddress, emptyAddress, errorMessage, formatDate,
  hhmm, money, notify, timeSlots, validateAddress,
} from '../utils';

const MODES = ['Entrega', 'Retirar na loja'];
const ADDR = ['Meu endereço', 'Outro endereço'];

// RF009 finalizar compra | RF011 entrega/retirada + data e horário | RF012 resumo | RF019 pagamento
// Já vem tudo pré-selecionado => loja → "+" → carrinho → checkout → confirmar = 5 cliques (RNF001)
export default function CheckoutScreen({ navigation }) {
  const { user, cart, refreshCart } = useApp();
  const days = useMemo(buildDays, []);

  const { data: store, loading } = useLoad(
    () => (cart?.lojaId ? lojaService.buscar(cart.lojaId) : Promise.resolve(null)),
    [cart?.lojaId]
  );

  const [mode, setMode] = useState(MODES[0]);
  const [addrMode, setAddrMode] = useState(ADDR[0]);
  const [otherAddr, setOtherAddr] = useState(emptyAddress());
  const [dayIso, setDayIso] = useState(days[0].iso);
  const [time, setTime] = useState(null);
  const [payment, setPayment] = useState(emptyPayment(user.email));
  const [busy, setBusy] = useState(false);

  const slots = useMemo(() => timeSlots(store?.abertura, store?.fechamento, dayIso), [store, dayIso]);

  // mantém um horário válido selecionado (some o horário se o dia mudar, por ex.)
  useEffect(() => {
    if (!slots.includes(time)) setTime(slots[0] || null);
  }, [slots]); // eslint-disable-line react-hooks/exhaustive-deps

  // carrinho vazio também cai aqui: acontece por um instante depois de confirmar o pedido
  if (loading || !cart || !cart.itens.length) return <View style={styles.safe}><Loading /></View>;

  const pickup = mode === MODES[1];
  const day = days.find((d) => d.iso === dayIso);
  const useOther = !pickup && addrMode === ADDR[1];
  const destino = useOther ? otherAddr : user.endereco;

  const confirm = async () => {
    if (!time) return notify('Sem horários', 'Não há horários disponíveis neste dia. Escolha outra data.');
    if (useOther) {
      const e = validateAddress(otherAddr);
      if (e) return notify('Endereço de entrega', e);
    }
    const payErr = validatePayment(payment);
    if (payErr) return notify('Pagamento', payErr);

    setBusy(true);
    let pedido;
    try {
      pedido = await pedidoService.criar({
        tipoRetirada: pickup ? 'RETIRADA_NA_LOJA' : 'ENTREGA',
        dataEntrega: dayIso,
        horario: time,
        endereco: useOther ? cleanAddress(otherAddr) : null, // null => backend usa o endereço do cliente
      });
    } catch (e) {
      setBusy(false);
      return notify('Não foi possível finalizar', errorMessage(e));
    }

    // o pedido já existe (carrinho esvaziado no servidor); agora o pagamento
    let payFailed = null;
    try {
      await pedidoService.pagar(pedido.id, paymentPayload(payment));
    } catch (e) {
      payFailed = errorMessage(e);
    }
    await refreshCart();
    setBusy(false);
    if (payFailed) {
      notify('Pedido criado, pagamento pendente', `${payFailed}\n\nVocê pode pagar na tela do pedido.`);
    }
    navigation.reset({
      index: 1,
      routes: [{ name: 'Tabs' }, { name: 'Tracking', params: { orderId: pedido.id } }],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.h}>Como você quer receber?</Text>
        <View style={styles.rowChips}><Chips options={MODES} value={mode} onChange={setMode} scroll={false} /></View>

        {!pickup && (
          <>
            <Text style={styles.h}>Endereço de entrega</Text>
            <View style={styles.rowChips}><Chips options={ADDR} value={addrMode} onChange={setAddrMode} scroll={false} /></View>
            {useOther ? (
              <AddressForm value={otherAddr} onChange={setOtherAddr} />
            ) : (
              <Text style={styles.addr}>📍 {addressToText(user.endereco)}</Text>
            )}
          </>
        )}

        <Text style={styles.h}>{pickup ? 'Data de retirada' : 'Data de entrega'}</Text>
        <Chips options={days.map((d) => d.label)} value={day.label} onChange={(l) => setDayIso(days.find((d) => d.label === l).iso)} />

        <Text style={styles.h}>Horário</Text>
        {slots.length ? (
          <Chips options={slots} value={time} onChange={setTime} />
        ) : (
          <Text style={styles.addr}>Sem horários disponíveis neste dia. Escolha outra data.</Text>
        )}
        {store?.abertura && store?.fechamento && (
          <Text style={styles.hint}>Funcionamento da loja: {hhmm(store.abertura)}–{hhmm(store.fechamento)}</Text>
        )}

        <Text style={styles.h}>Pagamento</Text>
        <PaymentFields value={payment} onChange={setPayment} />

        <Text style={styles.h}>Resumo do pedido</Text>
        <View style={styles.summary}>
          <Text style={styles.sumStore}>🌷 {cart.lojaNome}</Text>
          {cart.itens.map((i) => (
            <View key={i.id} style={{ marginTop: 8 }}>
              <View style={styles.row}>
                <Text style={styles.sumItem}>{i.quantidade}× {i.produtoNome}</Text>
                <Text style={styles.sumItem}>{money(i.subtotal)}</Text>
              </View>
              {!!i.personalizacao && <Text style={styles.note}>✉️ "{i.personalizacao}"</Text>}
            </View>
          ))}
          <View style={styles.divider} />
          <Info label="Tipo" value={pickup ? 'Retirada na loja' : 'Entrega'} />
          <Info label={pickup ? 'Retirada' : 'Entrega'} value={`${formatDate(dayIso)}${time ? ' às ' + time : ''}`} />
          {!pickup && <Info label="Endereço" value={addressToText(destino) || '—'} />}
          <Info label="Pagamento" value={labelOfTipo(payment.tipo)} />
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.total}>Total</Text>
            <Text style={styles.total}>{money(cart.total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label={busy ? 'Enviando...' : `Confirmar pedido · ${money(cart.total)}`} onPress={confirm} disabled={busy} />
      </View>
    </SafeAreaView>
  );
}

function Info({ label, value }) {
  return (
    <View style={[styles.row, { marginTop: 4 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  h: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 18, marginBottom: 8 },
  rowChips: { flexDirection: 'row', gap: 8 },
  addr: { color: colors.text, marginTop: 10 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 6 },
  summary: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, ...cardShadow },
  sumStore: { fontWeight: '800', fontSize: 16, color: colors.primaryDark },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  sumItem: { color: colors.text, flexShrink: 1 },
  note: { color: colors.muted, fontStyle: 'italic', marginTop: 2, marginLeft: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  infoLabel: { color: colors.muted },
  infoValue: { color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  total: { fontSize: 18, fontWeight: '900', color: colors.text },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
});
