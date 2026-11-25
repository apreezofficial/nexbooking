import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductScreen } from './src/ProductScreen';
import { colors } from '../../src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.pearl }}>
        <ProductScreen />
      </View>
    </SafeAreaProvider>
  );
}
