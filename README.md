# NEX Booking

Cross-platform app built with bare React Native 0.88.1, TypeScript, and native iOS and Android projects. Expo is not part of the runtime or build pipeline.

## Requirements

- Node.js 22.11 or newer
- Xcode and CocoaPods for iOS
- Android Studio, Android SDK, and JDK 17 for Android

## Run the app

```sh
npm ci
npm start
```

In another terminal, run `npm run ios` or `npm run android`. iOS native dependencies are installed from the checked in Podfile with `cd ios && pod install`. The Android project is checked in and builds directly with Gradle.

## Project structure

- `App.tsx`: React Native root, system status bar, and safe area provider.
- `src/screens/ProductScreen.tsx`: onboarding, authentication, discovery, booking, schedule, inbox, and note preview flows.
- `src/theme/index.ts`: supplied palette, Plus Jakarta Sans type scale, spacing, and radii.
- `src/components/`: reusable React Native controls, cards, business marks, and navigation.
- `assets/fonts/`: bundled Plus Jakarta Sans font files linked to both native targets.
- `ios/` and `android/`: native React Native CLI projects. Platform dependencies are auto-linked by the React Native CLI.

The app is a UI preview. Authentication providers, booking APIs, video, location search, and payment processing are not connected to backend services.

## Validation and Android APK

```sh
npm run check
npm run android:apk
```

The Android APK GitHub Actions workflow builds `android/app` directly and uploads an installable test artifact. It uses the generated debug signing key; Play Store distribution needs a production signing setup.

Sample photography is bundled in `assets/photos`; see `assets/photos/SOURCES.md` for sources. Replace illustrative images with business approved portfolio photos before launch.
