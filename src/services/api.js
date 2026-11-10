import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// URL base da API (único lugar do app que conhece o endereço do backend).
//
// Ordem de decisão:
//  1. EXPO_PUBLIC_API_URL (ex.: criar um arquivo .env com
//     EXPO_PUBLIC_API_URL=http://192.168.0.10:8080)
//  2. Celular/emulador via Expo Go: usa o mesmo IP do PC que serve o app (porta 8080)
//  3. Emulador Android sem hostUri: 10.0.2.2 (o "localhost" do PC)
//  4. Web / simulador iOS: localhost
// ---------------------------------------------------------------------------
function resolveBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const hostUri = Constants.expoConfig?.hostUri || '';
  const host = hostUri.split(':')[0];
  const isTunnel = /exp\.direct|ngrok/.test(host);
  if (Platform.OS !== 'web' && host && !isTunnel) return `http://${host}:8080`;

  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
}

export const API_URL = resolveBaseUrl();

// Erro padronizado do backend: { timestamp, status, mensagem, campos? }
export class ApiError extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.mensagem = mensagem;
    this.campos = campos || null;
  }
}

let token = null;
let onUnauthorized = null;

export const setToken = (t) => {
  token = t;
};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const TIMEOUT_MS = 15000;

async function request(method, path, body) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    throw new ApiError(
      0,
      `Não foi possível conectar ao servidor (${API_URL}). Verifique se o backend está rodando e se o dispositivo está na mesma rede.`
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // token expirado/inválido em rota autenticada => volta para o login
    if (res.status === 401 && token && path !== '/api/auth/login' && onUnauthorized) onUnauthorized();
    throw new ApiError(res.status, data?.mensagem || `Erro ${res.status} ao falar com o servidor.`, data?.campos);
  }
  return data;
}

export const get = (path) => request('GET', path);
export const post = (path, body = {}) => request('POST', path, body);
export const put = (path, body) => request('PUT', path, body);
export const patch = (path, body) => request('PATCH', path, body);
export const del = (path) => request('DELETE', path);

export const qs = (params = {}) => {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v).trim())}`)
    .join('&');
  return q ? `?${q}` : '';
};
