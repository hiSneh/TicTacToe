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
    npm --workspace @tictactoe/web run build
  fi

  pm2_cmd delete tictactoe-web >/dev/null 2>&1 || true
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
  npm --workspace @tictactoe/game-engine run test
  npm --workspace @tictactoe/web run build
}

full_build_checks() {
  web_build_checks
  warn_mobile_env
  npm --workspace @tictactoe/mobile run build
}

print_mobile_release_commands() {
  echo
  echo "Mobile store release commands:"
  echo "  bash scripts/server.sh --mobile-build --platform=$MOBILE_PLATFORM --profile=$EAS_PROFILE"
  echo "  bash scripts/server.sh --mobile-submit --platform=$MOBILE_PLATFORM --profile=$EAS_PROFILE"
  echo "  bash scripts/server.sh --mobile-publish --platform=$MOBILE_PLATFORM --profile=$EAS_PROFILE"
}

mobile_release_guidance() {
  warn_mobile_env
  npm --workspace @tictactoe/mobile run build
  print_mobile_release_commands
}

eas_cmd() {
  if [[ -x "$ROOT/node_modules/.bin/eas" ]]; then
    (cd "$ROOT/apps/mobile" && "$ROOT/node_modules/.bin/eas" "$@")
  elif command -v eas >/dev/null 2>&1; then
    (cd "$ROOT/apps/mobile" && eas "$@")
  else
    (cd "$ROOT/apps/mobile" && npx --yes eas-cli "$@")
  fi
}

mobile_build() {
  ensure_dependencies
  require_mobile_env
  npm --workspace @tictactoe/mobile run build
  eas_cmd build --platform "$MOBILE_PLATFORM" --profile "$EAS_PROFILE" --non-interactive
}

mobile_submit() {
  require_command npx "Install npm/npx with Node.js."
  require_mobile_env
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
