#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_PORT="${WEB_PORT:-3001}"
PM2_HOME="${PM2_HOME:-$HOME/.pm2}"
APP_URL=""
TASK=""
MOBILE_PLATFORM="all"
EAS_PROFILE="production"
EMPTY_ADS=0

export NODE_ENV="${NODE_ENV:-production}"
export PM2_HOME

usage() {
  cat <<'EOF'
Usage:
  bash scripts/server.sh --setup
  bash scripts/server.sh --web
  bash scripts/server.sh --mobile
  bash scripts/server.sh --mobile-local-apk
  bash scripts/server.sh --mobile-install-apk
  bash scripts/server.sh --mobile-preview-apk
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
  bash scripts/server.sh --deploy
  bash scripts/server.sh --urls
  bash scripts/server.sh --status
  bash scripts/server.sh --logs
  bash scripts/server.sh --stop

Flags:
  --setup        Check prerequisites, install dependencies, and create missing env files.
  --web          Build and start/restart the production web server with PM2 daemon mode.
  --mobile       Type-check mobile and print EAS release commands. Mobile is not a PM2 server.
  --mobile-local-apk
                 Build a standalone Android APK locally after SDK, env, and signing checks.
  --mobile-install-apk
                 Build, push, install, and open the local Android APK on a connected device.
  --mobile-preview-apk
                 Build an Android preview APK with Expo React Native + EAS Build.
  --mobile-build Build mobile with EAS for Android/iOS.
  --mobile-submit Submit the latest EAS builds to Play Store/App Store.
  --mobile-publish Build mobile with EAS, then submit to Play Store/App Store.
  --mobile-quick Same as --mobile-publish.
  --both         Run production web PM2 flow plus mobile type-check.
  --quick        Web only: run web checks/build, start production web with PM2, then run health check.
  --all-quick    Run web --quick, then mobile --mobile-publish.
  --build        Run web checks/build only.
  --deploy       Same as --quick.
  --url=URL      URL to health-check after --quick or --deploy.
  --platform=all|android|ios
                 Mobile platform for EAS build/submit. Default: all.
  --profile=NAME EAS build/submit profile. Default: production.
  --empty-ads    Allow empty web/mobile ad env values for verification runs.
  --urls         Print production server URLs.
  --status       Show PM2 process status.
  --logs         Stream PM2 logs.
  --stop         Stop and remove PM2 web/mobile processes.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --setup) TASK="setup" ;;
    --web) TASK="web" ;;
    --mobile) TASK="mobile" ;;
    --mobile-local-apk) TASK="mobile-local-apk" ;;
    --mobile-install-apk) TASK="mobile-install-apk" ;;
    --mobile-preview-apk) TASK="mobile-preview-apk" ;;
    --mobile-build) TASK="mobile-build" ;;
    --mobile-submit) TASK="mobile-submit" ;;
    --mobile-publish) TASK="mobile-publish" ;;
    --mobile-quick) TASK="mobile-publish" ;;
    --both) TASK="both" ;;
    --quick) TASK="quick" ;;
    --all-quick) TASK="all-quick" ;;
    --build) TASK="build" ;;
    --deploy) TASK="quick" ;;
    --urls) TASK="urls" ;;
    --status) TASK="status" ;;
    --logs) TASK="logs" ;;
    --stop) TASK="stop" ;;
    --url=*) APP_URL="${arg#--url=}" ;;
    --platform=*) MOBILE_PLATFORM="${arg#--platform=}" ;;
    --profile=*) EAS_PROFILE="${arg#--profile=}" ;;
    --empty-ads) EMPTY_ADS=1; export ALLOW_EMPTY_ADS=1; export EXPO_PUBLIC_DISABLE_ADMOB=true ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown argument: $arg"; usage; exit 1 ;;
  esac
done

TASK="${TASK:-urls}"

case "$MOBILE_PLATFORM" in
  all|android|ios) ;;
  *) echo "Invalid --platform value: $MOBILE_PLATFORM. Use all, android, or ios."; exit 1 ;;
esac

require_command() {
  local command_name="$1"
  local install_hint="$2"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Missing prerequisite: $command_name"
    echo "Install hint: $install_hint"
    exit 1
  fi
}

optional_command() {
  local command_name="$1"
  local install_hint="$2"

  if command -v "$command_name" >/dev/null 2>&1; then
    echo "OK: $command_name -> $(command -v "$command_name")"
  else
    echo "Optional: $command_name not found. $install_hint"
  fi
}

print_command() {
  local command_text="$*"
  local bold=""
  local cyan=""
  local yellow=""
  local reset=""

  if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
    bold="$(printf '\033[1m')"
    cyan="$(printf '\033[36m')"
    yellow="$(printf '\033[33m')"
    reset="$(printf '\033[0m')"
  fi

  echo
  echo "${cyan}${bold}================ COMMAND ================${reset}"
  echo "${yellow}${bold}+ $command_text${reset}"

  case "$command_text" in
    "npm install --include=dev")
      echo "${bold}What:${reset} Installs all project dependencies, including dev tools used by builds and deployment."
      echo "${bold}Params:${reset}"
      echo "  --include=dev    Ensures devDependencies such as turbo, pm2, serve, and eas-cli are installed."
      ;;
    "npm --workspace @tictactoe/mobile run build")
      echo "${bold}What:${reset} Type-checks the Expo React Native mobile app before creating or publishing builds."
      echo "${bold}Params:${reset}"
      echo "  --workspace      Runs the command inside the selected npm workspace."
      echo "  @tictactoe/mobile The mobile app workspace."
      echo "  run build        Runs the workspace build script: TypeScript no-emit validation."
      ;;
    "npm --workspace @tictactoe/web run build")
      echo "${bold}What:${reset} Builds the Vite web app for production."
      echo "${bold}Params:${reset}"
      echo "  --workspace      Runs inside the web workspace."
      echo "  run build        Produces the production web output under apps/web/dist."
      ;;
    "npm --workspace @tictactoe/game-engine run test")
      echo "${bold}What:${reset} Runs the shared game-engine test suite before production web builds."
      echo "${bold}Params:${reset}"
      echo "  --workspace      Runs inside the game-engine package."
      echo "  run test         Executes that package's configured tests."
      ;;
    *"./gradlew assembleRelease"*)
      echo "${bold}What:${reset} Builds a standalone Android release APK locally with Gradle."
      echo "${bold}Params:${reset}"
      echo "  NODE_ENV=production       Bundles the app in production mode."
      echo "  ENTRY_FILE=apps/mobile/index.js  Points Metro at the mobile app entry in this monorepo."
      echo "  assembleRelease           Creates the release APK and signs it using the configured Gradle signing config."
      ;;
    *"eas build "*)
      echo "${bold}What:${reset} Starts an Expo EAS cloud build for Android/iOS."
      echo "${bold}Params:${reset}"
      echo "  --platform      Chooses android, ios, or all."
      echo "  --profile       Chooses the build profile from apps/mobile/eas.json."
      echo "  --non-interactive Runs without prompts, suitable for repeatable script usage."
      ;;
    *"eas submit "*)
      echo "${bold}What:${reset} Submits the latest EAS build artifact to the configured app store track."
      echo "${bold}Params:${reset}"
      echo "  --platform      Chooses android, ios, or all."
      echo "  --profile       Chooses submit settings from apps/mobile/eas.json."
      echo "  --latest        Submits the latest matching EAS build."
      echo "  --non-interactive Runs without prompts."
      ;;
    "MSYS_NO_PATHCONV=1 adb push "*)
      echo "${bold}What:${reset} Copies the APK from this computer onto the connected Android device."
      echo "${bold}Params:${reset}"
      echo "  MSYS_NO_PATHCONV=1 Prevents Git Bash from rewriting Android device paths."
      echo "  adb push          Copies local file -> device path."
      echo "  /data/local/tmp   Temporary writable location on the Android device."
      ;;
    "MSYS_NO_PATHCONV=1 adb shell pm install -r "*)
      echo "${bold}What:${reset} Installs or updates the APK on the connected Android device."
      echo "${bold}Params:${reset}"
      echo "  adb shell         Runs a command on the phone."
      echo "  pm install        Uses Android Package Manager to install the APK."
      echo "  -r                Reinstalls over the existing app while keeping compatible data."
      ;;
    "MSYS_NO_PATHCONV=1 adb shell monkey "*)
      echo "${bold}What:${reset} Opens the installed app on the connected Android device."
      echo "${bold}Params:${reset}"
      echo "  -p                Package name to launch."
      echo "  -c                Launcher category."
      echo "  1                 Sends one launch event."
      ;;
    "npx pm2 start "*)
      echo "${bold}What:${reset} Starts the built web app with PM2 using the local serve package."
      echo "${bold}Params:${reset}"
      echo "  --name            PM2 process name."
      echo "  --cwd             Working directory for the process."
      echo "  -s                Serves the SPA build output."
      echo "  -l                Port to listen on."
      ;;
    *)
      echo "${bold}What:${reset} Running this project command as part of the selected server.sh workflow."
      ;;
  esac

  echo "${cyan}${bold}=========================================${reset}"
}

check_prerequisites() {
  echo "Checking prerequisites..."
  require_command node "Install Node.js 20+ from https://nodejs.org or use nvm."
  require_command npm "Install npm with Node.js."
  require_command npx "Install npm/npx with Node.js."

  echo "Node: $(node --version)"
  echo "npm:  $(npm --version)"

  optional_command git "Install git if you plan to clone or version this project."
  optional_command curl "Install curl for HTTP health checks."
  optional_command eas "Install with: npm install -g eas-cli, or let the script use npx eas-cli."

  if [[ -f "$ROOT/package.json" ]]; then
    echo "OK: package.json found"
  else
    echo "package.json not found. Run this script from the project repo."
    exit 1
  fi

  if [[ -f "$ROOT/apps/mobile/eas.json" ]]; then
    echo "OK: apps/mobile/eas.json found"
  else
    echo "Missing apps/mobile/eas.json. Mobile EAS build/submit commands need this file."
    exit 1
  fi
}

ensure_dependencies() {
  if [[ ! -d "$ROOT/node_modules" || ! -x "$ROOT/node_modules/.bin/turbo" || ! -x "$ROOT/node_modules/.bin/pm2" || ! -x "$ROOT/node_modules/.bin/serve" || ! -x "$ROOT/node_modules/.bin/eas" ]]; then
    echo "Project dependencies are missing or incomplete. Running npm install with dev dependencies..."
    print_command npm install --include=dev
    npm install --include=dev
  fi

  local missing=0
  for binary in turbo pm2 serve eas; do
    if [[ ! -x "$ROOT/node_modules/.bin/$binary" ]]; then
      echo "Missing local project binary after install: node_modules/.bin/$binary"
      missing=1
    fi
  done

  if [[ "$missing" == "1" ]]; then
    echo "npm may be configured to omit dev dependencies."
    echo "Check these on the server:"
    echo "  npm config get omit"
    echo "  echo \$NODE_ENV"
    echo "Then run:"
    echo "  npm install --include=dev"
    exit 1
  fi

  echo "OK: project dependencies are installed."
}

pm2_cmd() {
  mkdir -p "$PM2_HOME"
  npx pm2 "$@"
}

env_value() {
  local file_path="$1"
  local key="$2"

  if [[ ! -f "$file_path" ]]; then
    return 0
  fi

  grep -E "^${key}=" "$file_path" | tail -n 1 | cut -d '=' -f 2-
}

require_env_value() {
  local file_path="$1"
  local key="$2"
  local value
  value="$(env_value "$file_path" "$key")"

  if [[ -z "${value:-}" ]]; then
    echo "Missing required production env value: $key in $file_path"
    return 1
  fi
}

validate_web_env() {
  local web_env="$ROOT/apps/web/.env.local"

  if [[ "${ALLOW_EMPTY_ADS:-0}" == "1" || "$EMPTY_ADS" == "1" ]]; then
    echo "Skipping AdSense env validation because ALLOW_EMPTY_ADS=1."
    return 0
  fi

  require_env_value "$web_env" "VITE_ADSENSE_CLIENT_ID"
  require_env_value "$web_env" "VITE_ADSENSE_DEFAULT_SLOT_ID"
}

warn_mobile_env() {
  local mobile_env="$ROOT/apps/mobile/.env"
  local missing=0

  if [[ "${ALLOW_EMPTY_ADS:-0}" == "1" || "$EMPTY_ADS" == "1" ]]; then
    echo "Skipping AdMob env validation because empty ads are allowed."
    return 0
  fi
  local keys=(
    EXPO_PUBLIC_ADMOB_BANNER_ANDROID
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID
    EXPO_PUBLIC_ADMOB_REWARDED_ANDROID
    EXPO_PUBLIC_ADMOB_BANNER_IOS
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS
    EXPO_PUBLIC_ADMOB_REWARDED_IOS
  )

  for key in "${keys[@]}"; do
    if [[ -z "$(env_value "$mobile_env" "$key")" ]]; then
      echo "Warning: mobile ad env value is empty: $key"
      missing=1
    fi
  done

  if [[ "$missing" == "1" ]]; then
    echo "Mobile store builds can still be prepared, but real AdMob revenue needs these values."
  fi
}

require_mobile_env() {
  local mobile_env="$ROOT/apps/mobile/.env"
  local missing=0
  local keys=(
    EXPO_PUBLIC_ADMOB_BANNER_ANDROID
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID
    EXPO_PUBLIC_ADMOB_REWARDED_ANDROID
    EXPO_PUBLIC_ADMOB_BANNER_IOS
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS
    EXPO_PUBLIC_ADMOB_REWARDED_IOS
  )

  if [[ "${ALLOW_EMPTY_ADS:-0}" == "1" || "$EMPTY_ADS" == "1" ]]; then
    echo "Skipping required AdMob env validation because empty ads are allowed."
    return 0
  fi

  for key in "${keys[@]}"; do
    if [[ -z "$(env_value "$mobile_env" "$key")" ]]; then
      echo "Missing required mobile ad env value: $key in $mobile_env"
      missing=1
    fi
  done

  if [[ "$missing" == "1" ]]; then
    echo "Use --empty-ads while verifying builds without AdMob secrets."
    exit 1
  fi
}

windows_path_to_unix() {
  local input_path="$1"

  if command -v cygpath >/dev/null 2>&1; then
    cygpath -u "$input_path"
    return 0
  fi

  printf '%s\n' "$input_path"
}

path_for_gradle_properties() {
  local input_path="$1"

  if command -v cygpath >/dev/null 2>&1; then
    cygpath -m "$input_path"
    return 0
  fi

  printf '%s\n' "$input_path"
}

path_for_windows_tool() {
  local input_path="$1"

  if command -v cygpath >/dev/null 2>&1; then
    cygpath -m "$input_path"
    return 0
  fi

  printf '%s\n' "$input_path"
}

find_android_studio_jdk() {
  local candidates=(
    "/c/Program Files/Android/Android Studio/jbr"
    "/mnt/c/Program Files/Android/Android Studio/jbr"
    "C:/Program Files/Android/Android Studio/jbr"
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    "/Applications/Android Studio.app/Contents/jbr"
  )

  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate/bin/java" || -x "$candidate/bin/java.exe" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

find_android_sdk() {
  local local_app_data="${LOCALAPPDATA:-}"
  local current_user="${USER:-${USERNAME:-}}"
  local candidates=(
    "${ANDROID_HOME:-}"
    "${ANDROID_SDK_ROOT:-}"
    "$HOME/Android/Sdk"
    "$HOME/Library/Android/sdk"
    "$HOME/AppData/Local/Android/Sdk"
  )

  if [[ -n "$current_user" ]]; then
    candidates+=(
      "/c/Users/$current_user/AppData/Local/Android/Sdk"
      "/mnt/c/Users/$current_user/AppData/Local/Android/Sdk"
    )
  fi

  if [[ -n "$local_app_data" ]]; then
    candidates+=("$(windows_path_to_unix "$local_app_data")/Android/Sdk")
  fi

  for candidate in "${candidates[@]}"; do
    if [[ -n "$candidate" && -d "$candidate/platform-tools" && -d "$candidate/platforms" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

ensure_android_local_build_env() {
  echo "Checking local Android build environment..."

  if [[ -z "${JAVA_HOME:-}" ]]; then
    if detected_jdk="$(find_android_studio_jdk)"; then
      export JAVA_HOME="$detected_jdk"
      echo "JAVA_HOME was not set; using Android Studio JDK: $JAVA_HOME"
    fi
  fi

  if [[ -n "${JAVA_HOME:-}" ]]; then
    export PATH="$JAVA_HOME/bin:$PATH"
  fi

  require_command java "Install Android Studio or JDK 17+, then set JAVA_HOME."
  echo "Java: $(java -version 2>&1 | head -n 1)"

  if [[ -z "${ANDROID_HOME:-}" && -z "${ANDROID_SDK_ROOT:-}" ]]; then
    if detected_sdk="$(find_android_sdk)"; then
      export ANDROID_HOME="$detected_sdk"
      export ANDROID_SDK_ROOT="$detected_sdk"
      echo "ANDROID_HOME was not set; using Android SDK: $ANDROID_HOME"
    fi
  fi

  export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
  export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"

  if [[ -z "$ANDROID_HOME" || ! -d "$ANDROID_HOME/platforms" ]]; then
    echo "Missing Android SDK. Install it with Android Studio, then set ANDROID_HOME or ANDROID_SDK_ROOT."
    exit 1
  fi

  export PATH="$ANDROID_HOME/platform-tools:$PATH"
  printf 'sdk.dir=%s\n' "$(path_for_gradle_properties "$ANDROID_HOME")" > "$ROOT/apps/mobile/android/local.properties"
  echo "OK: Android SDK -> $ANDROID_HOME"
}

check_android_signing_for_local_apk() {
  local app_gradle="$ROOT/apps/mobile/android/app/build.gradle"
  local debug_keystore="$ROOT/apps/mobile/android/app/debug.keystore"

  if [[ ! -f "$debug_keystore" ]]; then
    echo "Missing debug keystore at apps/mobile/android/app/debug.keystore."
    echo "Local test APK signing requires a keystore. Regenerate the native project or add a debug keystore."
    exit 1
  fi

  if grep -q "release {" "$app_gradle" && grep -q "signingConfig signingConfigs.debug" "$app_gradle"; then
    echo "OK: local release APK will be signed with the debug keystore for device testing."
  else
    echo "Warning: release signing config was not recognized in apps/mobile/android/app/build.gradle."
    echo "The Gradle build may fail unless release signing is configured."
  fi
}

check_mobile_app_config() {
  node - "$ROOT/apps/mobile/app.json" <<'NODE'
const fs = require('fs');
const appJson = process.argv[2];
const config = JSON.parse(fs.readFileSync(appJson, 'utf8')).expo || {};
const missing = [];

if (!config.android?.package) missing.push('expo.android.package');
if (!config.slug) missing.push('expo.slug');
if (!config.version) missing.push('expo.version');

if (missing.length) {
  console.error(`Missing mobile app config values: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`OK: Android package ${config.android.package}, version ${config.version}`);
NODE
}

mobile_android_package() {
  node - "$ROOT/apps/mobile/app.json" <<'NODE'
const fs = require('fs');
const appJson = process.argv[2];
const config = JSON.parse(fs.readFileSync(appJson, 'utf8')).expo || {};
const packageName = config.android?.package;

if (!packageName) {
  console.error('Missing expo.android.package in apps/mobile/app.json');
  process.exit(1);
}

console.log(packageName);
NODE
}

local_release_apk_path() {
  local apk_path="$ROOT/apps/mobile/android/app/build/outputs/apk/release/app-release.apk"

  if [[ ! -f "$apk_path" ]]; then
    echo "Missing local release APK: $apk_path"
    echo "Build it first with:"
    echo "  bash scripts/server.sh --mobile-local-apk --empty-ads"
    exit 1
  fi

  printf '%s\n' "$apk_path"
}

ensure_adb_device() {
  require_command adb "Install Android platform tools or let Android Studio install them, then connect a USB-debugging-enabled device."

  local adb_output
  local devices
  local unauthorized

  adb_output="$(adb devices)"
  devices="$(printf '%s\n' "$adb_output" | awk 'NR > 1 && $2 == "device" {print $1}')"
  unauthorized="$(printf '%s\n' "$adb_output" | awk 'NR > 1 && $2 == "unauthorized" {print $1}')"

  if [[ -n "$unauthorized" ]]; then
    echo "Android device is connected but unauthorized:"
    printf '%s\n' "$unauthorized"
    echo
    echo "Unlock the phone and accept the USB debugging authorization prompt, then rerun this command."
    echo "If the prompt is not visible, toggle USB debugging off/on or reconnect the USB cable."
    echo
    printf '%s\n' "$adb_output"
    exit 1
  fi

  if [[ -z "$devices" ]]; then
    echo "No connected Android device found."
    echo "Enable Developer options and USB debugging on the phone, connect USB, then accept the authorization prompt."
    echo
    printf '%s\n' "$adb_output"
    exit 1
  fi

  local count
  count="$(printf '%s\n' "$devices" | sed '/^$/d' | wc -l | tr -d ' ')"

  if [[ "$count" != "1" ]]; then
    echo "More than one Android device is connected. Set ANDROID_SERIAL to choose one."
    echo
    printf '%s\n' "$adb_output"
    exit 1
  fi

  export ANDROID_SERIAL="${ANDROID_SERIAL:-$devices}"
  echo "OK: Android device -> $ANDROID_SERIAL"
}

mobile_install_apk() {
  mobile_local_apk
  ensure_adb_device

  local apk_path
  local adb_apk_path
  local package_name
  local remote_apk="/data/local/tmp/neon-tictactoe-arena.apk"

  apk_path="$(local_release_apk_path)"
  adb_apk_path="$(path_for_windows_tool "$apk_path")"
  package_name="$(mobile_android_package)"

  echo "Pushing APK to device..."
  print_command MSYS_NO_PATHCONV=1 adb push "$adb_apk_path" "$remote_apk"
  MSYS_NO_PATHCONV=1 adb push "$adb_apk_path" "$remote_apk"

  echo "Installing APK on device..."
  print_command MSYS_NO_PATHCONV=1 adb shell pm install -r "$remote_apk"
  MSYS_NO_PATHCONV=1 adb shell pm install -r "$remote_apk"

  echo "Opening app..."
  print_command MSYS_NO_PATHCONV=1 adb shell monkey -p "$package_name" -c android.intent.category.LAUNCHER 1
  MSYS_NO_PATHCONV=1 adb shell monkey -p "$package_name" -c android.intent.category.LAUNCHER 1

  echo
  echo "Installed and launched: $package_name"
}

get_lan_ip() {
  local ip=""

  if command -v hostname >/dev/null 2>&1; then
    ip="$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -Ev '^(127|169\.254)\.' | head -n 1 || true)"
  fi

  if [[ -z "$ip" ]] && command -v ip >/dev/null 2>&1; then
    ip="$(ip -4 addr show scope global 2>/dev/null | awk '/inet / {print $2}' | cut -d/ -f1 | grep -Ev '^(127|169\.254)\.' | head -n 1 || true)"
  fi

  if [[ -n "$ip" ]]; then
    printf '%s\n' "$ip"
  else
    printf '%s\n' "YOUR_LAN_IP"
  fi
}

show_urls() {
  local lan_ip
  lan_ip="$(get_lan_ip)"
  echo
  echo "Production web URLs"
  echo "  Local:   http://localhost:${WEB_PORT}/"
  echo "  Network: http://${lan_ip}:${WEB_PORT}/"
  if [[ -n "$APP_URL" ]]; then
    echo "  Public:  $APP_URL"
  fi
  echo
}

ensure_env_files() {
  if [[ ! -f "$ROOT/apps/web/.env.local" ]]; then
    cat > "$ROOT/apps/web/.env.local" <<'EOF'
VITE_ADSENSE_CLIENT_ID=
VITE_ADSENSE_DEFAULT_SLOT_ID=
EOF
    echo "Created apps/web/.env.local"
  else
    echo "OK: apps/web/.env.local exists"
  fi

  if [[ ! -f "$ROOT/apps/mobile/.env" ]]; then
    cat > "$ROOT/apps/mobile/.env" <<'EOF'
EXPO_PUBLIC_ADMOB_BANNER_ANDROID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID=
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID=
EXPO_PUBLIC_DISABLE_ADMOB=true

EXPO_PUBLIC_ADMOB_BANNER_IOS=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS=
EXPO_PUBLIC_ADMOB_REWARDED_IOS=
EOF
    echo "Created apps/mobile/.env"
  else
    echo "OK: apps/mobile/.env exists"
    if ! grep -q '^EXPO_PUBLIC_DISABLE_ADMOB=' "$ROOT/apps/mobile/.env"; then
      printf '\nEXPO_PUBLIC_DISABLE_ADMOB=true\n' >> "$ROOT/apps/mobile/.env"
      echo "Added EXPO_PUBLIC_DISABLE_ADMOB=true to apps/mobile/.env"
    fi
  fi
}

start_web_production() {
  if [[ ! -f "$ROOT/apps/web/dist/index.html" ]]; then
    echo "Missing apps/web/dist/index.html. Building web app first..."
    print_command npm --workspace @tictactoe/web run build
    npm --workspace @tictactoe/web run build
  fi

  pm2_cmd delete tictactoe-web >/dev/null 2>&1 || true
  print_command npx pm2 start "$ROOT/node_modules/.bin/serve" --name tictactoe-web --cwd "$ROOT" -- -s "$ROOT/apps/web/dist" -l "$WEB_PORT"
  pm2_cmd start "$ROOT/node_modules/.bin/serve" \
    --name tictactoe-web \
    --cwd "$ROOT" \
    -- \
    -s "$ROOT/apps/web/dist" \
    -l "$WEB_PORT"
  sleep 2
  pm2_cmd save
  echo
  echo "PM2 saved the current process list."
  echo "For reboot persistence on Ubuntu, run once on the server:"
  echo "  npx pm2 startup systemd -u $USER --hp $HOME"
}

web_build_checks() {
  ensure_dependencies
  validate_web_env
  print_command npm --workspace @tictactoe/game-engine run test
  npm --workspace @tictactoe/game-engine run test
  print_command npm --workspace @tictactoe/web run build
  npm --workspace @tictactoe/web run build
}

full_build_checks() {
  web_build_checks
  warn_mobile_env
  print_command npm --workspace @tictactoe/mobile run build
  npm --workspace @tictactoe/mobile run build
}

print_mobile_release_commands() {
  echo
  echo "Mobile store release commands:"
  echo "  bash scripts/server.sh --mobile-local-apk --empty-ads"
  echo "  bash scripts/server.sh --mobile-preview-apk"
  echo "  bash scripts/server.sh --mobile-build --platform=$MOBILE_PLATFORM --profile=$EAS_PROFILE"
  echo "  bash scripts/server.sh --mobile-submit --platform=$MOBILE_PLATFORM --profile=$EAS_PROFILE"
  echo "  bash scripts/server.sh --mobile-publish --platform=$MOBILE_PLATFORM --profile=$EAS_PROFILE"
}

mobile_release_guidance() {
  warn_mobile_env
  print_command npm --workspace @tictactoe/mobile run build
  npm --workspace @tictactoe/mobile run build
  print_mobile_release_commands
}

eas_cmd() {
  if [[ -x "$ROOT/node_modules/.bin/eas" ]]; then
    print_command "cd apps/mobile && ../../node_modules/.bin/eas" "$@"
    (cd "$ROOT/apps/mobile" && "$ROOT/node_modules/.bin/eas" "$@")
  elif command -v eas >/dev/null 2>&1; then
    print_command "cd apps/mobile && eas" "$@"
    (cd "$ROOT/apps/mobile" && eas "$@")
  else
    print_command "cd apps/mobile && npx --yes eas-cli" "$@"
    (cd "$ROOT/apps/mobile" && npx --yes eas-cli "$@")
  fi
}

mobile_build() {
  ensure_dependencies
  require_mobile_env
  check_mobile_app_config
  print_command npm --workspace @tictactoe/mobile run build
  npm --workspace @tictactoe/mobile run build
  echo "EAS build profile: $EAS_PROFILE"
  echo "EAS build platform: $MOBILE_PLATFORM"
  eas_cmd build --platform "$MOBILE_PLATFORM" --profile "$EAS_PROFILE" --non-interactive
}

mobile_preview_apk() {
  ensure_dependencies
  require_mobile_env
  check_mobile_app_config
  print_command npm --workspace @tictactoe/mobile run build
  npm --workspace @tictactoe/mobile run build
  echo "EAS build profile: preview"
  echo "EAS build platform: android"
  eas_cmd build --platform android --profile preview --non-interactive
}

mobile_local_apk() {
  ensure_dependencies
  require_mobile_env
  check_mobile_app_config

  if [[ ! -d "$ROOT/apps/mobile/android" ]]; then
    echo "Missing apps/mobile/android. Run Expo prebuild before local APK builds:"
    echo "  cd apps/mobile && npx expo prebuild --platform android"
    exit 1
  fi

  ensure_android_local_build_env
  check_android_signing_for_local_apk
  print_command npm --workspace @tictactoe/mobile run build
  npm --workspace @tictactoe/mobile run build

  echo "Building local Android release APK..."
  echo "Signing config: apps/mobile/android/app/debug.keystore via Gradle release signingConfig"
  (
    cd "$ROOT/apps/mobile/android"
    export NODE_ENV=production
    export ENTRY_FILE=apps/mobile/index.js
    print_command "cd apps/mobile/android && NODE_ENV=production ENTRY_FILE=apps/mobile/index.js ./gradlew assembleRelease"
    ./gradlew assembleRelease
  )

  echo
  echo "APK created:"
  find "$ROOT/apps/mobile/android/app/build/outputs/apk/release" -name "*.apk" -maxdepth 1 -print
}

mobile_submit() {
  require_command npx "Install npm/npx with Node.js."
  require_mobile_env
  echo "EAS submit profile: $EAS_PROFILE"
  echo "EAS submit platform: $MOBILE_PLATFORM"
  eas_cmd submit --platform "$MOBILE_PLATFORM" --profile "$EAS_PROFILE" --latest --non-interactive
}

mobile_publish() {
  mobile_build
  mobile_submit
}

health_check() {
  echo
  echo "Health check"

  if [[ -n "$APP_URL" ]]; then
    if ! command -v curl >/dev/null 2>&1; then
      echo "curl is not installed, so URL health check was skipped."
      return 0
    fi

    echo "Checking $APP_URL"
    curl --fail --silent --show-error --location --head --max-time 15 "$APP_URL" >/dev/null
    echo "OK: $APP_URL responded successfully."
    return 0
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is not installed, so local HTTP health check was skipped."
    return 0
  fi

  local local_url="http://localhost:${WEB_PORT}/"
  echo "Checking $local_url"
  curl --fail --silent --show-error --location --head --max-time 15 "$local_url" >/dev/null
  echo "OK: $local_url responded successfully."
}

quick_deploy() {
  web_build_checks
  start_web_production

  health_check
}

cd "$ROOT"

case "$TASK" in
  setup)
    check_prerequisites
    ensure_dependencies
    ensure_env_files
    validate_web_env || echo "Fill web ad env values before production --quick."
    warn_mobile_env
    echo "PM2 local version: $(npx --no-install pm2 --version 2>/dev/null || echo 'installed after npm install')"
    show_urls
    ;;
  web)
    ensure_dependencies
    print_command npm --workspace @tictactoe/web run build
    npm --workspace @tictactoe/web run build
    start_web_production
    show_urls
    pm2_cmd status
    ;;
  mobile)
    ensure_dependencies
    mobile_release_guidance
    ;;
  mobile-build)
    mobile_build
    ;;
  mobile-local-apk)
    mobile_local_apk
    ;;
  mobile-install-apk)
    mobile_install_apk
    ;;
  mobile-preview-apk)
    mobile_preview_apk
    ;;
  mobile-submit)
    mobile_submit
    ;;
  mobile-publish)
    mobile_publish
    ;;
  both)
    full_build_checks
    start_web_production
    show_urls
    pm2_cmd status
    ;;
  build)
    web_build_checks
    ;;
  quick)
    quick_deploy
    ;;
  all-quick)
    quick_deploy
    mobile_publish
    ;;
  urls)
    show_urls
    ;;
  status)
    pm2_cmd status
    ;;
  logs)
    pm2_cmd logs
    ;;
  stop)
    pm2_cmd delete tictactoe-web || true
    pm2_cmd save
    ;;
esac
