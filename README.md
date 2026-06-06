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

## Server Script

Use the Ubuntu/Linux helper at `scripts/server.sh` for production-style web serving with PM2, release checks, and health checks.

```bash
bash scripts/server.sh --setup
bash scripts/server.sh --web
bash scripts/server.sh --mobile
bash scripts/server.sh --mobile-build
bash scripts/server.sh --mobile-submit
bash scripts/server.sh --mobile-publish
bash scripts/server.sh --both
bash scripts/server.sh --quick
bash scripts/server.sh --mobile-quick
bash scripts/server.sh --all-quick
bash scripts/server.sh --quick --url=https://xyz.example.com
bash scripts/server.sh --quick --empty-ads --url=https://xyz.example.com
bash scripts/server.sh --build
bash scripts/server.sh --urls
bash scripts/server.sh --status
bash scripts/server.sh --logs
bash scripts/server.sh --stop
```

You can also run the same script through npm:

```bash
npm run server -- --quick
npm run server -- --quick --url=https://xyz.example.com
```

What each flag does:

- `--setup`: checks basic prerequisites, runs `npm install`, creates missing `apps/web/.env.local` and `apps/mobile/.env`, and prints URLs.
- `--web`: builds and starts/restarts the production web app with PM2 in daemon mode.
- `--mobile`: type-checks mobile and prints EAS release commands. Mobile is not a PM2 server.
- `--mobile-build`: builds Android/iOS with EAS using `apps/mobile/eas.json`.
- `--mobile-submit`: submits the latest EAS builds to Play Store/App Store.
- `--mobile-publish`: runs `--mobile-build`, then `--mobile-submit`.
- `--mobile-quick`: same as `--mobile-publish`.
- `--both`: runs the production web PM2 flow plus mobile type-check.
- `--build`: runs web production checks and web build.
- `--quick`: runs web production checks/build, starts/restarts the production web app with PM2, and runs a final health check.
- `--all-quick`: runs web `--quick`, then mobile `--mobile-publish`.
- `--quick --url=https://xyz.example.com`: runs the same quick flow, then health-checks the supplied public URL with `curl`.
- `--empty-ads`: allows empty AdSense/AdMob env values during verification before you add ad secrets.
- `--platform=all|android|ios`: chooses mobile EAS platform. Default: `all`.
- `--profile=production`: chooses the EAS profile. Default: `production`.
- `--urls`: prints local and LAN URLs for the production web server.
- `--status`: shows PM2 process status.
- `--logs`: streams PM2 logs.
- `--stop`: stops and removes the web PM2 process.

PM2 process names:

```bash
tictactoe-web
```

For web production serving, PM2 runs the built `apps/web/dist` folder through the local `serve` package on port `3001` by default. Override with `WEB_PORT=8080 bash scripts/server.sh --quick`.

`--quick` validates required web ad env values before building. If you intentionally want to run without AdSense values, use:

```bash
ALLOW_EMPTY_ADS=1 bash scripts/server.sh --quick
```

Or use the built-in flag:

```bash
bash scripts/server.sh --quick --empty-ads
```

After the first successful production start on Ubuntu, run the PM2 startup command printed by the script so the web process returns after server reboot.

`--quick`, `--web`, and `--mobile` check for required local build/runtime tools such as `turbo`, `pm2`, `serve`, and `eas`. If `node_modules` is missing or incomplete, the script runs `npm install --include=dev` first. This matters on production servers where npm may otherwise omit dev dependencies.

Mobile release commands use EAS from `apps/mobile`:

Simple commands:

```bash
# Web only: build and run with PM2
bash scripts/server.sh --quick --url=https://games.narrateai.online

# Mobile only: build and submit Android/iOS
bash scripts/server.sh --mobile-quick --platform=all --profile=production

# Everything: web quick + mobile build/submit
bash scripts/server.sh --all-quick --platform=all --profile=production --url=https://games.narrateai.online
```

Detailed commands:

```bash
bash scripts/server.sh --mobile-build --platform=android --profile=production
bash scripts/server.sh --mobile-build --platform=ios --profile=production
bash scripts/server.sh --mobile-submit --platform=android --profile=production
bash scripts/server.sh --mobile-submit --platform=ios --profile=production
```

Use `--mobile-publish` to build and submit in one flow after store credentials are ready:

```bash
bash scripts/server.sh --mobile-publish --platform=all --profile=production
```

For verification before adding AdMob secrets, add `--empty-ads`:

```bash
bash scripts/server.sh --mobile-build --platform=android --empty-ads
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

Use app-specific env files:

- Web: `apps/web/.env.local`
- Mobile: `apps/mobile/.env` or EAS secrets

The repo-root `.env` is not guaranteed to be read by Vite or Expo in this monorepo.

## Revenue Env Variables

Only the ad variables are required for generating ad revenue.

### Web AdSense

Add these values to `apps/web/.env.local`:

```env
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxxxxxxxx
VITE_ADSENSE_DEFAULT_SLOT_ID=xxxxxxxxxx
```

- `VITE_ADSENSE_CLIENT_ID`: your AdSense publisher/client ID.
- `VITE_ADSENSE_DEFAULT_SLOT_ID`: your AdSense ad slot ID.

### Mobile AdMob

Add these values to `apps/mobile/.env` or configure them as EAS secrets:

```env
EXPO_PUBLIC_ADMOB_BANNER_ANDROID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=

EXPO_PUBLIC_ADMOB_BANNER_IOS=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=
EXPO_PUBLIC_ADMOB_REWARDED_IOS=
```

Also replace the AdMob app IDs in `apps/mobile/app.json` before production builds:

```json
"androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
"iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
```

`EXPO_PUBLIC_ADMOB_APP_ID_ANDROID` and `EXPO_PUBLIC_ADMOB_APP_ID_IOS` are present in `.env.example`, but the current Expo config reads app IDs from `apps/mobile/app.json`, not from env.

### Not Required For Revenue

Firebase values are not required for ads or revenue in the current local-cache setup:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Firebase Remote Config is optional on web for ad frequency only. Firestore and database-backed profiles are not used.

## Local Cache

This project does not require a database for player identity, scoreboard, or analytics.

Implemented local cache:

- Web player profile, scoreboard, and analytics cache use `localStorage`.
- Mobile player profile, scoreboard, and analytics cache use `@react-native-async-storage/async-storage`.
- A local player name is generated automatically on first launch.
- The Profile screen lets you rename the local player, generate a new local user, or reset the local score.
- The Leaderboard screen shows the local cached scoreboard.

## AdMob Setup Guide

Phase 5 AdMob wiring is implemented for Expo mobile with `react-native-google-mobile-ads`.

- AdMob is disabled by default for mobile testing:
  ```env
  EXPO_PUBLIC_DISABLE_ADMOB=true
  ```
- To enable AdMob later, set this in `apps/mobile/.env`:
  ```env
  EXPO_PUBLIC_DISABLE_ADMOB=false
  ```
- After enabling AdMob, use a custom native development build or EAS production build. Expo Go does not include the AdMob native module and will crash if AdMob is enabled there.
- Development uses Google test ad units.
- Production ad unit IDs come from `apps/mobile/.env` or EAS secrets:
  - `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`
  - `EXPO_PUBLIC_ADMOB_BANNER_IOS`
  - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
  - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS`
  - `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`
  - `EXPO_PUBLIC_ADMOB_REWARDED_IOS`
- Interstitials are frequency capped after completed games.
- Rewarded ads are wired on the Daily Rewards screen.
- The Expo config plugin is registered in `apps/mobile/app.json` with Google test app IDs. Replace those app IDs with production AdMob app IDs before store builds.

## Play Store Publishing Guide

Use this flow to publish the Expo mobile app to Google Play.

Current Android identity:

- Play Store app name: `Neon TicTacToe Arena`
- Android package name: `com.tictactoe.neonarena`
- Expo slug: `neon-tictactoe-arena`
- EAS production build output: Android App Bundle (`.aab`)

Treat the Android package name as permanent once the app is created in Play Console. Google Play package names are unique and cannot be reused for a different app later.

### 1. Prepare Accounts And Tools

- Create or sign in to a Google Play Console developer account.
- Create or sign in to an Expo account.
- From the repo root, install dependencies:
  ```bash
  npm install
  ```
- Log in to EAS:
  ```bash
  npx eas login
  ```
- Confirm the mobile app type-checks:
  ```bash
  npm --workspace @tictactoe/mobile run build
  ```

### 2. Finalize App Configuration

Review `apps/mobile/app.json` before the first store build:

- Keep `expo.android.package` as `com.tictactoe.neonarena` unless you are intentionally creating a different Play Store app.
- Set `expo.version` to the public app version you want users to see, for example `1.0.0`.
- Add final icon and adaptive icon assets before release. The current config only defines colors.
- Add a splash image if you want a branded splash screen. The current config only defines splash behavior and background color.
- Replace the Google test AdMob app IDs in the `react-native-google-mobile-ads` plugin with production AdMob app IDs before enabling real ads:
  ```json
  {
    "androidAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx",
    "iosAppId": "ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
  }
  ```

The production EAS profile in `apps/mobile/eas.json` already uses:

```json
{
  "production": {
    "autoIncrement": true,
    "android": {
      "buildType": "app-bundle"
    }
  }
}
```

That means production Android builds create `.aab` files and EAS increments the native Android version code for updates.

### 3. Configure Production Secrets

If AdMob is disabled, keep this in `apps/mobile/.env` or as an EAS secret:

```env
EXPO_PUBLIC_DISABLE_ADMOB=true
```

If AdMob is enabled for production, set:

```env
EXPO_PUBLIC_DISABLE_ADMOB=false
EXPO_PUBLIC_ADMOB_BANNER_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
```

For EAS cloud builds, prefer EAS secrets over committing `.env` values:

```bash
npx eas secret:create --scope project --name EXPO_PUBLIC_DISABLE_ADMOB --value false
npx eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_BANNER_ANDROID --value ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
npx eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID --value ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
npx eas secret:create --scope project --name EXPO_PUBLIC_ADMOB_REWARDED_ANDROID --value ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
```

### 4. Create The Play Console App

In Play Console:

- Select **Create app**.
- App name: `Neon TicTacToe Arena`.
- App type: **Game**.
- Free or paid: choose carefully. A free app can usually remain free; switching from free to paid later is not the normal path.
- Add the developer contact email.
- Accept the Play App Signing and policy declarations.

After creating the app, complete the dashboard setup tasks:

- Main store listing.
- App category and tags.
- Contact details.
- Privacy policy URL.
- App access.
- Ads declaration.
- Content rating questionnaire.
- Target audience and content.
- Data safety form.
- Government apps declaration, if shown.
- Financial features declaration, if shown.
- Health apps declaration, if shown.

### 5. Prepare Store Listing Assets

Prepare these assets before release:

- App icon: final production icon from the app config.
- Feature graphic: required by Play Store for many listings and promotions.
- Phone screenshots: capture real gameplay screens from the Android build.
- Optional tablet screenshots, if tablet support is enabled or desired.
- Short description: maximum 80 characters.
- Full description: maximum 4000 characters.
- Support email and optional website.
- Privacy policy page. This should describe local game data, local scoreboard/profile storage, ads if enabled, analytics if enabled, and any third-party SDKs.

Suggested listing copy starter:

```text
Short description:
Fast neon TicTacToe with solo, local, and tournament play.

Full description:
Play a polished neon TicTacToe arena with quick matches, difficulty options, local score tracking, tournament-style play, and daily rewards. Challenge the AI, pass the phone to a friend, and track your progress on the local leaderboard.
```

### 6. Complete Policy Forms Carefully

Use the actual production build behavior when answering policy forms.

- **Ads**: answer yes if AdMob is enabled or ad SDK code is active in the release.
- **Data safety**: if AdMob is enabled, review Google Mobile Ads SDK disclosures and declare any data collection or sharing performed by the ads SDK. If only local profile, scores, and analytics cache are used, do not claim server-side account collection unless you add it later.
- **App access**: select no special access required unless a future build adds login-gated content.
- **Content rating**: complete the game questionnaire honestly. A standard TicTacToe game should usually be low-risk, but answer based on the final app content and ads.
- **Target audience**: choose the intended age range. If targeting children, Play policies for ads, data, and content become stricter.
- **Privacy policy**: required if ads, analytics SDKs, account features, or any personal/sensitive data collection is present.

Keep the privacy policy, Data safety form, SDK behavior, and `apps/mobile/app.json` permissions aligned. Play review often fails when one of these describes different behavior than the others.

### 7. Build The Android App Bundle

From the repo root:

```bash
bash scripts/server.sh --mobile-build --platform=android --profile=production
```

Equivalent direct EAS command:

```bash
cd apps/mobile
npx eas build --platform android --profile production
```

When the build completes, download the `.aab` from the EAS build page or copy the artifact URL printed by EAS.

Before uploading to Play Console, install and test a preview build on a real device:

```bash
bash scripts/server.sh --mobile-local-apk --empty-ads
```

The local APK task runs the mobile type-check, validates app config, checks Android SDK/JDK and local signing, then creates a signed APK for easier device installation. Use it to check startup, navigation, gameplay, ads-disabled behavior, and any enabled ad placements before producing the final `.aab`.

### 8. First Play Store Upload

The first upload must be done manually in Play Console before automated EAS submissions can work.

Recommended first track:

- Use **Internal testing** for the first upload.
- Create an internal tester list.
- Create a new release.
- Upload the production `.aab`.
- Let Play Console run pre-launch and policy checks.
- Fix any errors or warnings.
- Roll out to internal testers.

If the account is a personal Play Console account created after November 13, 2023, Google may require closed testing before production access. Follow the production access tasks shown in Play Console for that account.

### 9. Production Release

After internal or closed testing is accepted:

- Go to the **Production** track.
- Create a new release.
- Select the tested app bundle or upload a newer production `.aab`.
- Add release notes.
- Review the release.
- Start with a staged rollout if you want a cautious launch, for example 5%, 10%, 25%, 50%, then 100%.
- Monitor crashes, ANRs, reviews, policy messages, and ad behavior after rollout.

Release notes starter:

```text
Initial release of Neon TicTacToe Arena with quick matches, AI play, local multiplayer, tournaments, rewards, and local leaderboard tracking.
```

### 10. Configure EAS Submit For Later Updates

After the first manual upload, EAS Submit can upload future builds.

Create a Google Cloud service account for Play Developer API access, grant it access in Play Console, download its JSON key, and upload it to EAS credentials:

```bash
cd apps/mobile
npx eas credentials --platform android
```

Choose the production profile, then upload the Google Service Account key when prompted.

Submit the latest Android build:

```bash
cd apps/mobile
npx eas submit --platform android --profile production --latest
```

Or use the repo helper:

```bash
bash scripts/server.sh --mobile-submit --platform=android --profile=production
```

Build and submit in one flow after credentials are ready:

```bash
bash scripts/server.sh --mobile-publish --platform=android --profile=production
```

### 11. Update Checklist

For every Play Store update:

- Increase `expo.version` for user-visible app version changes.
- Let EAS `autoIncrement` increase Android `versionCode`.
- Run:
  ```bash
  npm --workspace @tictactoe/mobile run build
  ```
- Build Android production:
  ```bash
  bash scripts/server.sh --mobile-build --platform=android --profile=production
  ```
- Test the build.
- Submit:
  ```bash
  bash scripts/server.sh --mobile-submit --platform=android --profile=production
  ```
- Update Play Console policy forms if SDKs, ads, permissions, account behavior, links, or data usage changed.

## AdSense Setup Guide

Phase 5 AdSense wiring is implemented for web.

- Set `VITE_ADSENSE_CLIENT_ID`.
- Set `VITE_ADSENSE_DEFAULT_SLOT_ID`.
- Put both values in `apps/web/.env.local`.
- Web ad slots lazy-load the AdSense script and request fills only when mounted.
- If env values are missing, ad-safe placeholders render without crashing.

## Analytics

Phase 7 analytics is implemented through small cross-platform local helpers.

- Web and mobile cache recent analytics events locally.
- No analytics database writes are performed.
- Tracked events include screen views, game mode changes, difficulty changes, moves, completed games, ad SDK readiness, interstitials, rewarded ad requests, and rewards earned.

## Deployment

Web target: self-hosted Ubuntu server with PM2 serving `apps/web/dist`.

Mobile target: Expo EAS builds for Android Play Store and Apple App Store.

## Store Checklists

- Add production app icons and splash assets.
- Add privacy policy and data safety declarations.
- Replace development ad IDs with production IDs.
- Replace AdMob test app IDs in `apps/mobile/app.json`.
- Run production build checks.
