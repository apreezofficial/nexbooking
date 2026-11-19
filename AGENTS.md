This is a bare React Native 0.88.1 app for iOS and Android. Do not add Expo packages, Expo CLI commands, or Expo-generated native projects. Use React Native CLI and the checked-in `ios/` and `android/` projects.

Before changing React Native APIs or native build configuration, read the matching versioned documentation at https://reactnative.dev/docs/0.88/getting-started and https://reactnative.dev/docs/0.88/environment-setup. Use React Native core components for UI and prefer autolinked React Native community libraries only when core does not provide the required native capability.

Keep the supplied design tokens in `src/theme/` and shared controls in `src/components/`. Run `npm run check` after code changes that affect TypeScript. Native iOS dependencies are managed by CocoaPods; Android builds from the checked-in Gradle project.
