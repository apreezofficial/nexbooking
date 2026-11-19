import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { DesignSystemScreen } from './src/screens/DesignSystemScreen';
import { colors } from './src/theme';

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [loaded, error] = useFonts({ PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync(); }, [loaded, error]);
  return <SafeAreaProvider><StatusBar style="dark" />{loaded || error ? <DesignSystemScreen /> : <View style={{ flex: 1, backgroundColor: colors.pearl, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.goldDeep} accessibilityLabel="Loading fonts" /></View>}</SafeAreaProvider>;
}
