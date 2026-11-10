import { Alert, Platform } from 'react-native';

export const money = (v) => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');

const pad = (n) => String(n).padStart(2, '0');
const DAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

// ---------- datas ----------
// "2026-11-20" -> "20/11/2026" (sem passar por Date, para não sofrer com fuso horário)
export const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

// "2026-11-09T15:03:00.123" -> "09/11/2026 15:03"
export const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// "08:00:00" -> "08:00"
export const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

const isoLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// próximos 7 dias para escolher a data (RF011)
export const buildDays = () => {
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const short = `${DAYS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    out.push({ iso: isoLocal(d), label: i === 0 ? `Hoje · ${short}` : i === 1 ? `Amanhã · ${short}` : short });
  }
  return out;
};

// Horários de hora em hora dentro do funcionamento da loja, sem horários que já passaram (RN08).
export const timeSlots = (abertura, fechamento, dayIso) => {
  const toMin = (t, fallback) => {
    const [h, m] = (hhmm(t) || fallback).split(':').map(Number);
    return h * 60 + m;
  };
  const start = toMin(abertura, '08:00');
  const end = toMin(fechamento, '18:00');
  const now = new Date();
  const isToday = dayIso === isoLocal(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out = [];
  for (let m = start; m <= end; m += 60) {
    if (isToday && m <= nowMin) continue;
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
};

export const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s || '');

// ---------- status do pedido ----------
export const statusLabel = (status, pickup) => {
  const map = {
    AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
    CONFIRMADO: 'Pedido confirmado',
    EM_PREPARO: 'Preparando seu buquê',
    SAIU_PARA_ENTREGA: 'Saiu para entrega',
    PRONTO_PARA_RETIRADA: 'Pronto para retirada',
    ENTREGUE: pickup ? 'Retirado' : 'Entregue',
    CANCELADO: 'Cancelado',
  };
  return map[status] || status;
};

// etapas da linha do tempo (RN04/RN06)
export const flowFor = (pickup) => [
  'AGUARDANDO_PAGAMENTO',
  'CONFIRMADO',
  'EM_PREPARO',
  pickup ? 'PRONTO_PARA_RETIRADA' : 'SAIU_PARA_ENTREGA',
  'ENTREGUE',
];

// próximos status que o VENDEDOR pode aplicar (RF015)
export const nextStatuses = (status, pickup) => {
  switch (status) {
    case 'AGUARDANDO_PAGAMENTO':
      return ['CANCELADO'];
    case 'CONFIRMADO':
      return ['EM_PREPARO', 'CANCELADO'];
    case 'EM_PREPARO':
      return [pickup ? 'PRONTO_PARA_RETIRADA' : 'SAIU_PARA_ENTREGA', 'CANCELADO'];
    case 'SAIU_PARA_ENTREGA':
    case 'PRONTO_PARA_RETIRADA':
      return ['ENTREGUE'];
    default:
      return [];
  }
};

export const isPickup = (order) => order?.entrega?.tipoRetirada === 'RETIRADA_NA_LOJA';

// ---------- endereço ----------
export const emptyAddress = () => ({ cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '' });

export const addressToText = (a) =>
  a ? `${a.logradouro}, ${a.numero}${a.bairro ? ' – ' + a.bairro : ''} · ${a.cidade}/${a.uf}` : '';

export const validateAddress = (a) => {
  if (!a.cep.trim() || !a.logradouro.trim() || !a.numero.trim() || !a.cidade.trim() || !a.uf.trim()) {
    return 'Preencha CEP, logradouro, número, cidade e UF.';
  }
  if (!/^\d{5}-?\d{3}$/.test(a.cep.trim())) return 'CEP inválido (use 00000-000).';
  if (!/^[A-Za-z]{2}$/.test(a.uf.trim())) return 'UF deve ter 2 letras.';
  return null;
};

export const cleanAddress = (a) => ({
  cep: a.cep.trim(),
  logradouro: a.logradouro.trim(),
  numero: a.numero.trim(),
  bairro: a.bairro?.trim() || null,
  cidade: a.cidade.trim(),
  uf: a.uf.trim().toUpperCase(),
});

export const fromApiAddress = (a) => (a ? { ...emptyAddress(), ...a, bairro: a.bairro || '' } : emptyAddress());

// ---------- mensagens ----------
export const errorMessage = (e) => {
  if (!e) return 'Erro inesperado.';
  let m = e.mensagem || e.message || 'Erro inesperado.';
  if (e.campos) m += '\n' + Object.values(e.campos).join('\n');
  return m;
};

// emoji decorativo estável por loja (o backend não tem ícone/logo)
const STORE_EMOJIS = ['🌷', '🌸', '🌹', '🌼', '🌻', '🌺', '🪻', '💐'];
export const storeEmoji = (id) => STORE_EMOJIS[Number(id || 0) % STORE_EMOJIS.length];

// Alert.alert não funciona na web, então tratamos os dois casos
export const notify = (title, message) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

export const confirmAction = (title, message, confirmLabel, onConfirm) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: confirmLabel, onPress: onConfirm },
    ]);
  }
};
