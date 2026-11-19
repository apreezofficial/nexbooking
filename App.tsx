import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductScreen } from './src/screens/ProductScreen';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.pearl }}>
        <StatusBar barStyle="dark-content" />
        <ProductScreen />
      </View>
    </SafeAreaProvider>
  );
}
