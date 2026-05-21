# PROJECT: Cross Platform TicTacToe App (React + React Native)

You are a senior full-stack engineer.

Build a production-grade TicTacToe game ecosystem supporting:

1. Web App (React)
2. Android App (React Native)
3. iOS App (React Native)

The project must be optimized for:
- AdMob monetization (mobile)
- AdSense monetization (web)
- SEO
- Performance
- Scalability
- Clean architecture
- Reusability

The app should look modern, polished, addictive, and optimized for high retention.

---

# PRIMARY GOALS

Create a monetizable TicTacToe gaming app with:

- Beautiful UI
- Smooth animations
- Fast loading
- Multiplayer-ready architecture
- Rewarded ads
- Daily challenges
- Offline support
- PWA support
- Analytics
- Store-ready build system

---

# TECH STACK

## Monorepo

Use Turborepo or Nx monorepo structure.

Recommended structure:

apps/
  web/
  mobile/

packages/
  ui/
  game-engine/
  hooks/
  utils/
  types/

---

# WEB STACK

Use:

- React 19+
- Vite
- TypeScript
- TailwindCSS
- Zustand
- React Router
- Framer Motion
- Firebase
- React Query
- PWA support
- AdSense integration

---

# MOBILE STACK

Use:

- React Native
- Expo
- TypeScript
- React Navigation
- Zustand
- React Native Reanimated
- Firebase
- react-native-google-mobile-ads

---

# FEATURES

## CORE GAMEPLAY

Implement:

1. Player vs AI
2. Player vs Player local
3. Online multiplayer architecture placeholder
4. Difficulty levels:
   - Easy
   - Medium
   - Hard
   - Impossible

Impossible mode must use Minimax algorithm.

---

# GAME MODES

1. Classic 3x3
2. 4x4 mode
3. Timed mode
4. Win streak mode
5. Tournament mode

---

# UI/UX REQUIREMENTS

Design must feel premium.

Use:
- Glassmorphism
- Neon gradients
- Dark mode
- Responsive layouts
- Smooth transitions
- Haptic feedback on mobile
- Sound effects
- Confetti animation on win

---

# SCREENS

Create:

1. Splash Screen
2. Home Screen
3. Game Screen
4. Settings Screen
5. Profile Screen
6. Leaderboard Screen
7. Daily Rewards Screen
8. Statistics Screen
9. Multiplayer Lobby
10. Tournament Screen

---

# MONETIZATION

## MOBILE ADS (ADMOB)

Integrate:
- Banner ads
- Interstitial ads
- Rewarded ads
- App open ads

Show:
- Interstitial every few games
- Rewarded ads for:
  - Extra hints
  - Continue streak
  - Unlock themes

Must follow Google policy.

Use test IDs in development.

---

# WEB ADS (ADSENSE)

Integrate:
- Responsive display ads
- In-feed ads
- Sticky bottom ad

Ads should:
- Not hurt UX
- Lazy load
- Be GDPR compliant

---

# ANALYTICS

Integrate Firebase Analytics.

Track:
- Sessions
- Retention
- Games played
- Ad clicks
- Win rate
- Daily active users
- Revenue events

---

# AUTHENTICATION

Implement:
- Anonymous login
- Google login
- Apple login (mobile)
- Guest mode

Use Firebase Authentication.

---

# BACKEND

Use Firebase.

Implement:
- Firestore
- Authentication
- Analytics
- Remote Config
- Crashlytics
- Cloud Functions placeholders

---

# GAME ENGINE

Create reusable package:

packages/game-engine/

Must contain:
- Game logic
- AI logic
- Winner calculation
- Minimax algorithm
- Move validation
- Multiplayer abstractions

Must be framework independent.

---

# STATE MANAGEMENT

Use Zustand.

Separate stores:
- Auth store
- Game store
- Settings store
- Ads store
- Profile store

---

# PERFORMANCE REQUIREMENTS

Optimize:
- Lazy loading
- Code splitting
- Memoization
- Virtualization where needed
- 60fps animations

---

# SEO REQUIREMENTS (WEB)

Implement:
- Meta tags
- Sitemap
- Robots.txt
- OpenGraph
- Structured data
- PWA manifest

Pages must be indexable.

---

# PWA SUPPORT

Implement:
- Offline support
- Installable app
- Caching strategy
- Service worker

---

# THEMES

Create:
- Classic theme
- Neon theme
- Dark cyberpunk theme
- Minimal theme

Users can unlock themes via rewarded ads.

---

# SOUND SYSTEM

Add:
- Tap sounds
- Victory sounds
- Defeat sounds
- Background music toggle

---

# ACCESSIBILITY

Support:
- Screen readers
- Keyboard navigation
- High contrast mode

---

# TESTING

Implement:
- Unit tests
- Integration tests
- Game engine tests

Use:
- Vitest
- React Testing Library
- Jest

---

# DEPLOYMENT

## WEB

Deploy to:
- Vercel

## MOBILE

Prepare:
- Android Play Store
- Apple App Store

Generate:
- App icons
- Splash assets
- Store descriptions
- Privacy policy template

---

# SECURITY

Implement:
- Secure Firebase rules
- Environment variable handling
- Anti-cheat placeholders

---

# FOLDER STRUCTURE

Create scalable architecture.

Example:

apps/web/src/
  components/
  pages/
  hooks/
  services/
  store/
  utils/
  ads/
  analytics/
  styles/

apps/mobile/src/
  screens/
  navigation/
  store/
  services/
  components/
  hooks/
  ads/

---

# CODE QUALITY

Enforce:
- ESLint
- Prettier
- Husky
- Conventional commits

---

# CI/CD

Setup:
- GitHub Actions
- Lint checks
- Test checks
- Expo EAS build

---

# REQUIRED DELIVERABLES

Generate:
1. Complete codebase
2. README.md
3. ENV setup guide
4. Firebase setup guide
5. AdMob setup guide
6. AdSense setup guide
7. Deployment guide
8. App Store publishing checklist
9. Play Store publishing checklist

---

# README CONTENT REQUIREMENTS

README must include:
- Installation
- Running web
- Running mobile
- Firebase setup
- AdMob setup
- AdSense setup
- Build commands
- Deployment steps

---

# IMPLEMENTATION STRATEGY

Implement in phases.

---

# PHASE 1

Setup monorepo and shared packages.

---

# PHASE 2

Implement game engine.

---

# PHASE 3

Build web UI.

---

# PHASE 4

Build mobile UI.

---

# PHASE 5

Integrate ads.

---

# PHASE 6

Integrate Firebase.

---

# PHASE 7

Add analytics.

---

# PHASE 8

Optimization and polish.

---

# PHASE 9

Testing.

---

# PHASE 10

Production deployment.

---

# IMPORTANT REQUIREMENTS

- All code must be production ready.
- Use TypeScript everywhere.
- Avoid duplicated code.
- Use reusable hooks.
- Add comments for complex logic.
- Use environment variables.
- Use clean architecture principles.
- Prefer composition over inheritance.

---

# ADDITIONAL FEATURES

If possible implement:
- Daily rewards
- Spin wheel
- Achievement system
- XP progression
- Cloud save
- Friend invites
- Push notifications
- Seasonal themes
- AI hints

---

# AI REQUIREMENTS

The AI opponent should:
- Feel human-like
- Have adjustable difficulty
- Make random mistakes on easy mode
- Be unbeatable on impossible mode

---

# ADS STRATEGY

Implement retention-friendly ads:
- Avoid excessive interstitials
- Rewarded ads preferred
- Ad frequency capping
- Track ad performance

---

# OUTPUT FORMAT

Generate:
1. Folder structure
2. Code files
3. Package configs
4. Setup scripts
5. Environment examples
6. Firebase rules
7. Documentation

# For UI Generation

Create a modern gaming UI inspired by:
- Chess.com
- Clash Royale
- Neon arcade games
- Minimal futuristic mobile apps

Use:
- Smooth animations
- Premium gradients
- Rounded cards
- Floating buttons
- Glassmorphism
- Motion transitions

The TicTacToe board should:
- Animate turns
- Animate wins
- Highlight winning lines
- Support themes
- Feel tactile and responsive

Create both mobile-first and desktop responsive layouts.

# For AdMob Integration

Implement production-grade AdMob integration.

Requirements:
- Separate ad manager service
- Test IDs in development
- Real IDs in production
- Rewarded ads hooks
- Frequency capping
- Error handling
- Retry mechanism
- Analytics events

Create reusable hooks:
- useBannerAd
- useInterstitialAd
- useRewardedAd

Ads must never crash the app.

# For Firebase

Setup Firebase architecture for scalability.

Implement:
- Authentication
- Firestore
- Analytics
- Remote Config
- Crashlytics

Create:
- Firebase service layer
- Reusable hooks
- Typed collections
- Secure rules

Support:
- Anonymous auth
- Google auth
- Apple auth

# ENV VARIABLES

Create:

WEB:
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_ADSENSE_CLIENT_ID=

MOBILE:
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=
EXPO_PUBLIC_ADMOB_APP_ID_IOS=
