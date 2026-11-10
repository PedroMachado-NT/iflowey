import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { colors, radius } from '../theme';

// O backend guarda só a URL da foto; se faltar ou não carregar, mostra um emoji.
export default function ProductImage({ uri, size = 92 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.md,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri && !failed ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} />
      ) : (
        <Text style={{ fontSize: size * 0.43 }}>💐</Text>
      )}
    </View>
  );
}
