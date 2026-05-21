# TicTacToe Ecosystem

Production-oriented monorepo for a cross-platform TicTacToe app.

## Apps

- `apps/web`: React, Vite, TypeScript, Tailwind, Zustand, React Router, Framer Motion.
- `apps/mobile`: Expo React Native, TypeScript, React Navigation, Zustand.

## Packages

- `packages/game-engine`: Framework-independent gameplay, winner detection, AI, minimax.
- `packages/types`: Shared app contracts.
- `packages/utils`: Shared utility helpers.
- `packages/hooks`: Shared non-React-native-specific hooks and store helpers.
- `packages/ui`: Shared theme tokens.

## Install

```bash
npm install
```

## Run Web

```bash
npm run dev:web
```

The Vite app runs at `http://localhost:5173` by default.

## Run Mobile

```bash
npm run dev:mobile
```

Expo starts a local development server. Open it with Expo Go, Android emulator, iOS simulator, or the web preview from the Expo terminal.

## Build Commands

```bash
npm --workspace @tictactoe/web run build
npm --workspace @tictactoe/mobile run start
npm run test
```

## Environment

Copy `.env.example` to `.env.local` for web and configure Expo public variables in your shell or EAS secrets for mobile.

## Firebase Setup Guide

Phase 6 will wire Firebase services. The app is already structured for:

- Authentication: anonymous, Google, and Apple sign-in placeholders.
- Firestore: typed collection contracts under shared packages.
- Analytics, Remote Config, Crashlytics service placeholders.
- Rules: see `firebase/firestore.rules`.

## AdMob Setup Guide

Phase 5 will connect `react-native-google-mobile-ads`. Use test IDs in development and real IDs through `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID` and `EXPO_PUBLIC_ADMOB_APP_ID_IOS`.

## AdSense Setup Guide

Phase 5 will connect web ad slots through `VITE_ADSENSE_CLIENT_ID`. Current web UI includes ad-safe layout regions and lazy placeholder components.

## Deployment

Web target: Vercel.

Mobile target: Expo EAS builds for Android Play Store and Apple App Store.

## Store Checklists

- Add production app icons and splash assets.
- Add privacy policy and data safety declarations.
- Replace development ad IDs with production IDs.
- Configure Firebase bundle IDs/package names.
- Run production build checks.
