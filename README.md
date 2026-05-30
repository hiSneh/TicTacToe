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

From the repo root:

```bash
npm run dev:web
```

Equivalent workspace command:

```bash
npm --workspace @tictactoe/web run dev
```

The Vite web app runs at `http://localhost:5173` by default.

### Network Exposure

Network exposure is controlled by the web workspace scripts in `apps/web/package.json`.

```json
"dev": "vite --host 0.0.0.0",
"preview": "vite preview --host 0.0.0.0"
```

The root command `npm run dev:web` calls that workspace script through the root `package.json`:

```json
"dev:web": "npm --workspace @tictactoe/web run dev"
```

To expose the web app to phones or other devices on the same network, keep `--host 0.0.0.0`. Open the app from another device using this computer's LAN IP and the Vite port, for example `http://192.168.1.25:5173`.

To restrict the dev server to this computer only, change the scripts in `apps/web/package.json` to:

```json
"dev": "vite --host 127.0.0.1",
"preview": "vite preview --host 127.0.0.1"
```

There is currently no `.env` variable for this setting; update `apps/web/package.json` directly. Only use `0.0.0.0` on trusted networks, and allow inbound traffic for the Vite port, usually `5173`, if your firewall blocks LAN access.

## Run Mobile

From the repo root:

```bash
npm run dev:mobile
```

Equivalent workspace command:

```bash
npm --workspace @tictactoe/mobile run start
```

Expo starts a local development server, usually at `http://localhost:8081`. Open it with Expo Go, Android emulator, iOS simulator, or the web preview from the Expo terminal.

Mobile platform shortcuts:

```bash
npm --workspace @tictactoe/mobile run android
npm --workspace @tictactoe/mobile run ios
npm --workspace @tictactoe/mobile run web
```

## Build Commands

```bash
npm --workspace @tictactoe/web run build
npm --workspace @tictactoe/mobile run start
npm run test
```

## Environment

Copy `.env.example` to `.env.local` for web and configure Expo public variables in your shell or EAS secrets for mobile.

## Local Cache

This project does not require a database for player identity, scoreboard, or analytics.

Implemented local cache:

- Web player profile, scoreboard, and analytics cache use `localStorage`.
- Mobile player profile, scoreboard, and analytics cache use `@react-native-async-storage/async-storage`.
- A local player name is generated automatically on first launch.
- The Profile screen lets you rename the local player, generate a new local user, or reset the local score.
- The Leaderboard screen shows the local cached scoreboard.

Firebase Remote Config is optional on web for ad frequency only. Firestore and database-backed profiles are not used.

## AdMob Setup Guide

Phase 5 AdMob wiring is implemented for Expo mobile with `react-native-google-mobile-ads`.

- Development uses Google test ad units.
- Production ad unit IDs come from:
  - `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`
  - `EXPO_PUBLIC_ADMOB_BANNER_IOS`
  - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
  - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS`
  - `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`
  - `EXPO_PUBLIC_ADMOB_REWARDED_IOS`
- Interstitials are frequency capped after completed games.
- Rewarded ads are wired on the Daily Rewards screen.
- The Expo config plugin is registered in `apps/mobile/app.json` with Google test app IDs. Replace these with production app IDs before store builds.

## AdSense Setup Guide

Phase 5 AdSense wiring is implemented for web.

- Set `VITE_ADSENSE_CLIENT_ID`.
- Set `VITE_ADSENSE_DEFAULT_SLOT_ID`.
- Web ad slots lazy-load the AdSense script and request fills only when mounted.
- If env values are missing, ad-safe placeholders render without crashing.

## Analytics

Phase 7 analytics is implemented through small cross-platform local helpers.

- Web and mobile cache recent analytics events locally.
- No analytics database writes are performed.
- Tracked events include screen views, game mode changes, difficulty changes, moves, completed games, ad SDK readiness, interstitials, rewarded ad requests, and rewards earned.

## Deployment

Web target: Vercel.

Mobile target: Expo EAS builds for Android Play Store and Apple App Store.

## Store Checklists

- Add production app icons and splash assets.
- Add privacy policy and data safety declarations.
- Replace development ad IDs with production IDs.
- Configure Firebase bundle IDs/package names.
- Run production build checks.
