import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Button from './Button';
import { colors } from '../theme';

// Estados de carregamento / erro / vazio padronizados para telas que consomem a API
export function Loading() {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <View style={{ padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 40 }}>🥀</Text>
      <Text style={{ color: colors.text, textAlign: 'center', marginTop: 8 }}>{message}</Text>
      {onRetry && <Button label="Tentar novamente" onPress={onRetry} style={{ marginTop: 14 }} />}
    </View>
  );
}

export function Empty({ emoji = '🌱', text }) {
  return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
      <Text style={{ color: colors.muted, marginTop: 8, textAlign: 'center' }}>{text}</Text>
    </View>
  );
}
