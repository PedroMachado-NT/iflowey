import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, setUnauthorizedHandler } from '../services/api';
import { authService, carrinhoService, usuarioService } from '../services';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const STORAGE_KEY = 'iflowey.token';

const readToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const saveToken = async (t) => {
  try {
    if (t) await AsyncStorage.setItem(STORAGE_KEY, t);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    /* armazenamento indisponível: a sessão só dura até fechar o app */
  }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [cart, setCart] = useState(null); // { id, lojaId, lojaNome, itens, total } | null

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    setCart(null);
    await saveToken(null);
  }, []);

  // token expirado/inválido em qualquer chamada => volta para o login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });
  }, [clearSession]);

  const refreshCart = useCallback(async () => {
    try {
      setCart(await carrinhoService.obter());
    } catch {
      /* ignora: o carrinho é recarregado na próxima ação */
    }
  }, []);

  // Restaura a sessão salva (RF002)
  useEffect(() => {
    (async () => {
      const saved = await readToken();
      if (saved) {
        setToken(saved);
        try {
          const me = await usuarioService.me();
          setUser(me);
          if (me.papel === 'CLIENTE') await refreshCart();
        } catch {
          await clearSession();
        }
      }
      setBooting(false);
    })();
  }, [clearSession, refreshCart]);

  // ---------- Sessão (RF001, RF002) ----------
  const login = async (email, senha) => {
    const res = await authService.login(email.trim(), senha);
    setToken(res.token);
    await saveToken(res.token);
    setUser(res.usuario);
    if (res.usuario.papel === 'CLIENTE') await refreshCart();
  };

  const registerClient = async (dados) => {
    await authService.cadastrarCliente(dados);
    await login(dados.email, dados.senha);
  };

  const registerVendor = async (dados) => {
    await authService.cadastrarVendedor(dados);
    await login(dados.email, dados.senha);
  };

  const logout = () => clearSession();

  // ---------- Carrinho (RF006, RF018) — vive no servidor ----------
  const addToCart = async (produtoId, quantidade = 1, personalizacao) => {
    setCart(await carrinhoService.adicionar(produtoId, quantidade, personalizacao));
  };
  const changeQty = async (itemId, quantidade) => {
    setCart(await carrinhoService.alterarQuantidade(itemId, quantidade));
  };
  const removeItem = async (itemId) => {
    setCart(await carrinhoService.remover(itemId));
  };
  const clearCart = async () => {
    setCart(await carrinhoService.limpar());
  };

  const cartCount = useMemo(() => (cart?.itens || []).reduce((s, i) => s + i.quantidade, 0), [cart]);

  const value = {
    user, setUser, booting, isVendor: user?.papel === 'VENDEDOR',
    login, registerClient, registerVendor, logout,
    cart, cartCount, refreshCart, addToCart, changeQty, removeItem, clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
