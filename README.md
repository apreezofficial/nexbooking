# NEX Booking

React Native + Expo + TypeScript foundation for iOS, Android, and web. The initial screen is an interactive design system gallery based on the four supplied references. Product screens will follow when their designs are supplied.

## Run locally

```sh
npm ci
npm start
```

From Expo's terminal, press `i` for an installed iOS Simulator, `a` for a configured Android emulator, or `w` for web. You can also run `npm run ios`, `npm run android`, or `npm run web` directly. Physical devices need a compatible Expo Go version or a development build. Native simulator execution requires the platform's SDK and a configured simulator/emulator; Android local builds require Android Studio/JDK.

## Project layout

- `src/theme/index.ts`: exact reference palette, font scale, 4 pt spacing, corner radii, and layout constants.
- `src/components/primitives.tsx`: text, buttons, icon buttons, chips, badges, verified marks, input states, and bordered cards.
- `src/components/patterns.tsx`: spotlight tiles, feed cards, booking cards, banners, and five-tab navigation component.
- `src/screens/DesignSystemScreen.tsx`: temporary component gallery with interactive examples and foundations.
- `App.tsx`: bundled Plus Jakarta Sans 500/600/700/800, splash handling, safe areas, and status bar.

Import shared components from `src/components` and tokens from `src/theme`. Use these primitives for the incoming screen designs. The gallery includes local selections, saving, validation, and navigation states. Payment, booking, authentication, search results, video, and upgrades are previews with no backend integration. No product routes have been invented.

## Design rules

- Pearl app background, Daisy cards, 1 pt Line borders, no card shadows.
- Gold 500 fills use Ink 900 text. Gold text on light backgrounds uses Gold Deep.
- Plus Jakarta Sans uses the supplied 32/40 through 11/16 hierarchy.
- 390 × 844 reference frame, 16 pt screen margins, flexible widths, minimum 44 × 44 touch targets. Small buttons retain a 44 pt touch target.
- Floating navigation is 64 pt high, radius 32, with the specified shadow. In future product screens, position it 24 pt above the bottom safe area with 16 pt side margins; it is shown inline in the gallery for inspection.
- Crayola Gold `#E6BE8A` remains provisional as noted in the reference.
- Feed image gradients and business initials are reference placeholders pending real media.

## Validation

```sh
npm run check
npx expo-doctor
npm run export:web
npm run export:native
```

Initial verification: TypeScript and dependency checks passed, Expo Doctor passed 20/20 checks, production web and iOS/Android Hermes bundles exported successfully. Browser checked at 390 × 844: category/time selection, phone validation, saved state, gallery switching, and tab selection; no browser warnings or errors observed. Native bundles were verified, but native runtime/device behavior has not yet been tested.

The initial Expo dependency tree reports three moderate npm audit entries arising from `@expo/fingerprint` → `minimatch`. npm currently proposes downgrading Expo to SDK 52; that breaking downgrade has not been applied. Recheck upstream releases before production delivery.

App icons are scaffold placeholders. Store signing, bundle identifiers, deployment credentials, and production services should be configured when those details are available.
