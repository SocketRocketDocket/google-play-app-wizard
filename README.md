# Google Play App Wizard

A personalized, step-by-step guide and launch workbench for publishing Android apps on Google Play. It runs in any browser, installs as an offline PWA, and builds as a native Android app with [Capacitor](https://capacitorjs.com).

## Features
- **9 sections, ~200 checklist items**: account setup → store listing → compliance → pricing → build & upload → testing → launch → post-launch
- **Personalization quiz**: 7 questions that hide steps that don't apply, adjust Required/Optional tags (e.g. closed testing for new personal accounts), and add "For your app" advice
- **Built-in Launch Workbench Tools**:
  - **Store Listing & Release Notes Drafter** with live Play Store character counters (`30` / `80` / `4,000` / `500`) and store card preview
  - **Drag-and-Drop Asset Validator** (100% offline): checks App Icon (`512×512` PNG), Feature Graphic (`1024×500` no transparency), and Screenshots (`320–3840 px`, `≤ 2:1`, no transparency)
  - **SDK → Data Safety Cheat Sheet**: select your SDKs (Firebase, AdMob, Play Billing, Stripe, etc.) to preview Play Console declarations and copy them into your notes
  - **14-Day Closed Test Tracker**: log your start date and 12+ opted-in testers to track the 14 consecutive days required for new personal accounts
- **Multi-app projects + JSON Backup/Restore**: manage separate checklists for multiple apps and move backups across devices
- **Global Search (`Ctrl+K`) & Section Filters** (`All`, `Remaining`, `Required only`, `Has notes`)
- **Notes on each step**, saved automatically
- **Export** to Markdown (browser download or native Android share sheet) and PDF (full printable report)
- **Dark mode** that follows your system setting, with a manual toggle
- **Offline / installable PWA** (service worker + manifest)
- All data stays on your device (`localStorage`)

## Project layout
| Path | Purpose |
|---|---|
| `index.html`, `css/`, `js/` | The web app (no build step) |
| `js/data.js` | **All guide content.** Edit this to update steps, tips, and links |
| `js/tools.js` | Built-in interactive tools (drafter, asset validator, SDK mapper, 14-day tracker) |
| `js/app.js` | App logic: multi-app state, quiz rules, search/filters, export, native share, theme |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA files |
| `scripts/` | Icon generation and the `www/` build copy |
| `android/` | Native Android project (Capacitor + Share & Filesystem plugins, API 36) |

## Run in a browser
```powershell
python -m http.server 8080     # then open http://localhost:8080
```
(You need a local server for the service worker. Opening `index.html` directly still works, just without offline support.)

## Host online (free HTTPS PWA)
This is a static site with zero backend — deploy the root directory (or `www/` after `npm run build`) to **GitHub Pages**, **Cloudflare Pages**, or **Netlify** to get an installable HTTPS PWA.

## Android

### Debug build (install on your own phone)
```powershell
npm install
npm run sync                                   # copies web files → www → android
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\jbr-21.0.11"   # JDK 21 (Gradle 8.11 doesn't support JDK 25)
cd android; .\gradlew.bat assembleDebug
# APK: android\app\build\outputs\apk\debug\app-debug.apk
```
Or run `npm run open:android` and press ▶ in Android Studio.

> After changing any web file, run `npm run sync` again before building. Bump `CACHE_VERSION` in `sw.js` too.

### Release build for Google Play (AAB)
1. **Change the app ID** in `capacitor.config.json` and `android/app/build.gradle` (`com.playwizard.app` → your own reverse domain). This **can't be changed** after you publish.
2. **Create an upload key** (back it up and never commit it):
   ```powershell
   keytool -genkey -v -keystore upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload   # keytool is in $env:JAVA_HOME\bin
   ```
3. **Build a signed bundle:** in Android Studio, go to *Build → Generate Signed App Bundle*, or add a `signingConfigs` block to `android/app/build.gradle` and run `.\gradlew.bat bundleRelease`.
4. Bump `versionCode` / `versionName` in `android/app/build.gradle` for every upload.
5. Check `targetSdkVersion` in `android/variables.gradle` (currently `36` / Android 16) against Google's [current requirement](https://developer.android.com/google/play/requirements/target-sdk).
6. Then follow the app itself. It walks you through the rest. 😉
