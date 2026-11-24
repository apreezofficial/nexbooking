import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TenantApp } from './src/screens/TenantApp';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.pearl }}>
        <TenantApp />
      </View>
    </SafeAreaProvider>
  );
}
