import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { errorMessage } from '../utils';

// Carrega dados da API toda vez que a tela ganha foco (ou quando deps mudam).
// Retorna { data, loading, error, reload, setData }.
export default function useLoad(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const run = useCallback(async (silent = false) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: errorMessage(e) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run])
  );

  const reload = useCallback(() => run(true), [run]);

  return {
    ...state,
    reload,
    setData: (data) => setState((s) => ({ ...s, data })),
  };
}
