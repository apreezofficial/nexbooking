import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TenantApp } from './src/TenantApp';
import { colors } from '../../src/theme';
import { preloadSounds } from '../../src/lib/sound';

export default function App() {
  useEffect(() => { preloadSounds(); }, []);
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.pearl }}>
        <TenantApp />
      </View>
    </SafeAreaProvider>
  );
}
