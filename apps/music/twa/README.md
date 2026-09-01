# Android TWA Packaging & Sideloading Guide

This directory contains the configuration files and workflow for packaging this Next.js Music PWA into a native Android APK via **Trusted Web Activity (TWA)** using `@bubblewrap/cli`.

---

## 1. Features & Configuration

- **Distinct Package ID (`com.marcel.music`)**: Ensures Android OS and Digital Wellbeing track screen time and battery usage under its own app name/icon rather than grouping with Google Chrome.
- **Native Music Intent Filters**: Contains `android.intent.action.MUSIC_PLAYER` and `android.intent.category.APP_MUSIC` so Samsung "Modes and Routines" and Android system menus recognize this app as a native music player.
- **Audio Element Reusability & 10s Preloading**: The app reuses a single `HTMLAudioElement` and preloads the next song ~10 seconds before the current track finishes. This prevents Android Doze mode and lockscreen suspension from dropping the audio session.

---

## 2. Prerequisites

1. **Node.js**: v18+
2. **Java Development Kit (JDK)**: JDK 17 or JDK 21
3. **Android SDK Command-line Tools** (Bubblewrap can automatically download these during first run)

---

## 3. Quick Build via Bubblewrap

### Option A: Using the PowerShell Helper Script
```powershell
./twa/build-apk.ps1 -Domain "your-music-domain.com" -PackageId "com.marcel.music"
```

### Option B: Step-by-Step Manual CLI

1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. Initialize the project:
   ```bash
   cd twa
   bubblewrap init --manifest="https://your-music-domain.com/site.webmanifest"
   ```

3. Ensure `app/src/main/AndroidManifest.xml` includes the music player intent filters (copy from `twa/AndroidManifest.xml` if needed).

4. Build and sign the APK:
   ```bash
   bubblewrap build
   ```
   - Follow prompts to create or supply an `android.keystore`.
   - The output will be `app-release-signed.apk`.

---

## 4. Digital Asset Links (`assetlinks.json`)

To remove the Chrome URL address bar in TWA mode:
1. Extract your SHA-256 fingerprint from the generated keystore:
   ```bash
   bubblewrap fingerprint
   ```
2. Update `public/.well-known/assetlinks.json` with your SHA-256 fingerprint:
   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "com.marcel.music",
         "sha256_cert_fingerprints": [
           "XX:XX:XX:...YOUR_KEYSTORE_SHA256_FINGERPRINT..."
         ]
       }
     }
   ]
   ```
3. Deploy your Next.js application so `https://your-domain.com/.well-known/assetlinks.json` is publicly reachable.

---

## 5. Sideloading & Installing onto Android Device

### Method 1: Via ADB (Fastest)
1. Enable **Developer Options** and **USB Debugging** on your phone.
2. Connect phone via USB.
3. Run:
   ```bash
   adb install -r app-release-signed.apk
   ```

### Method 2: Direct APK Sideload
1. Transfer `app-release-signed.apk` to your phone (via USB file transfer, Google Drive, or local HTTP server).
2. Tap the `.apk` file in your phone's File Manager and select **Install**.
3. Allow **"Install unknown apps"** when prompted.
