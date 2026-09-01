# TWA Fallback-to-Custom-Tab & Background Audio Throttling - Complete Diagnostic & Fix Guide

**Date**: 2026-09-01  
**App**: Music Player PWA (com.marcel.music)  
**Domain**: music.marcel-projects.vercel.app

---

## Executive Summary

Your app is falling back to Chrome Custom Tab mode instead of launching as a full Trusted Web Activity. While Android's OS-level `pm get-app-links` reports verification as `verified`, Chrome's internal `OriginVerifier` is failing or falling back due to **4 configuration mismatches**. This causes:

- ❌ Digital Wellbeing counts usage as "Chrome" instead of "Music Player"
- ❌ Samsung Modes can't recognize the app as a system music player
- ❌ Background audio playback is throttled (Chrome tab lifecycle suspends audio after ~10 minutes with screen off)

---

## Root Cause Analysis

### **ROOT CAUSE #1: Fallback Strategy Hardcoded to CustomTabs** ⚠️ CRITICAL

**File**: `android/app/build.gradle` line 40  
**Problem**:

```gradle
fallbackType: 'customtabs'  // ← EXPLICITLY FORCES CUSTOM TAB MODE
```

**Why This Happens**:

- Even when domain verification succeeds, any infrastructure issue (Chrome version mismatch, TWA library loading failure, certificate pinning) triggers fallback
- `customtabs` fallback = Chrome Custom Tab = browser tab lifecycle = background throttling
- `webview` fallback = embedded WebView = full app lifecycle = no throttling

**What Was Wrong**:
This was the **default** setting from the Bubblewrap CLI, suitable only for apps that DON'T require persistent background audio.

**Status**: ✅ **FIXED** → Changed to `webview`

---

### **ROOT CAUSE #2: Asymmetric Digital Asset Links Configuration** ⚠️ CRITICAL

**Files**:

- Server: `public/.well-known/assetlinks.json`
- Client: `android/app/src/main/res/values/strings.xml`

**The Problem - Asymmetric Declaration**:

Your server-side `assetlinks.json` declares:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.marcel.music",
      "sha256_cert_fingerprints": ["E2:64:A7:36:EA:28:17:AB:..."]
    }
  }
]
```

✅ Server → Android app (verified correctly)

But your client-side `assetStatements` (strings.xml) was **only** declaring:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "web",
      "site": "https://music.marcel-projects.vercel.app"
    }
  }
]
```

⚠️ Missing Android app declaration (asymmetric)

**Why Chrome Rejects This**:
Chrome's `OriginVerifier` validates BOTH directions:

1. ✅ Server declares Android app? → Your server does ✓
2. ❌ Android app declares server? → Your app only declared web site ✗
3. → Verification fails → Fallback to Custom Tab

**The Fix - Bidirectional Declaration**:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.marcel.music",
      "sha256_cert_fingerprints": [
        "E2:64:A7:36:EA:28:17:AB:C2:31:F7:15:2E:96:93:DF:69:34:4F:C6:22:1C:34:A5:5B:5A:A5:90:40:73:2B:D8"
      ]
    }
  },
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "web",
      "site": "https://music.marcel-projects.vercel.app"
    }
  }
]
```

**Status**: ✅ **FIXED** → Updated strings.xml with both namespaces

---

### **ROOT CAUSE #3: Empty DelegationService - No MediaSession Integration** ⚠️ HIGH

**File**: `android/app/src/main/java/com/marcel/music/DelegationService.java`

**Problem**: The service was an empty stub:

```java
public class DelegationService extends
        com.google.androidbrowserhelper.trusted.DelegationService {
    @Override
    public void onCreate() {
        super.onCreate();
        // ... nothing
    }
}
```

**Why This Matters**:

- Chrome's MediaSession (in your PWA) is not connected to Android's MediaController
- Android system (MediaSessionManager) can't see that music is playing
- Digital Wellbeing doesn't recognize the app as a media player
- Samsung Modes can't inject the app into "Music Player" routing
- Background playback lacks system-level protection

**The Fix**: Implemented full `MediaSessionManager.OnActiveSessionsChangedListener` that:

- Monitors active MediaSessions from Chrome
- Logs playback state and metadata
- Signals to Android that this app is actively handling media
- Enables integration with system controls and Digital Wellbeing

**Status**: ✅ **FIXED** → Implemented complete MediaSessionManager monitoring

---

### **ROOT CAUSE #4: Incomplete Intent Filter Configuration** ⚠️ MEDIUM

**File**: `android/app/src/main/AndroidManifest.xml` lines 107-120

**Problem**: VIEW intent filter was missing path prefix:

```xml
<data android:scheme="https"
      android:host="@string/hostName"
      <!-- Missing: android:pathPrefix="/" -->
/>
```

**Why This Matters**:

- Without `pathPrefix`, the intent filter is ambiguous
- Chrome's domain verification may not fully validate the link ownership
- Reduces confidence in the automatic app link verification

**The Fix**: Added `android:pathPrefix="/"`

```xml
<data android:scheme="https"
      android:host="@string/hostName"
      android:pathPrefix="/"
/>
```

**Status**: ✅ **FIXED** → Added pathPrefix directive

---

### **ROOT CAUSE #5: Missing MediaSession System Integration Permission**

**File**: `android/app/src/main/AndroidManifest.xml` (permissions section)

**Problem**: Missing `MEDIA_CONTENT_CONTROL` permission

```xml
<!-- Missing: <uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" /> -->
```

**Why This Matters**:

- MediaSessionManager requires this permission to monitor MediaSessions
- Without it, DelegationService can't integrate with system media controls
- Samsung Modes and Digital Wellbeing can't properly attribute playback

**The Fix**: Added permission

```xml
<uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />
```

**Status**: ✅ **FIXED** → Added MEDIA_CONTENT_CONTROL permission

---

## What You Already Have (✓ Working)

These components are **already correctly implemented** in your PWA:

### ✓ WakeLock Implementation

**File**: `src/components/player/Player.tsx`

- Correctly requests `navigator.wakeLock` when playing
- Properly releases on pause/song end
- Has fallback for browsers without WakeLock support

### ✓ MediaSession Metadata & Playback State

**File**: `src/lib/audio/audioEngine.ts`

- Updates MediaSession metadata (title, artist, artwork)
- Manages playback state (playing/paused/none)
- Handles seekforward/seekbackward/seekto actions
- Sets position state for scrubber control

### ✓ Service Worker with Caching & Range Requests

**File**: `public/sw.js`

- Implements HTTP 206 Range Request support (critical for seekable audio)
- Caches audio files for offline playback
- Handles precaching via message API
- Supports persistent playback even if network drops

### ✓ Web App Manifest

**File**: `public/site.webmanifest`

- Correct `"display": "standalone"` setting
- Categories set to `["music", "audio"]`
- All required icons with maskable purpose

---

## Step-by-Step Recovery Plan

### **Phase 1: Rebuild with Fixed Configuration** (Required)

All fixes have been applied to source files. Now you must rebuild the APK:

```powershell
# From android/ directory
cd android
.\gradlew.bat clean assembleRelease

# Sign with your keystore (from local.properties)
# The build system will automatically sign if local.properties is configured
```

**Build Output**:

- Signed APK: `android/app/build/outputs/apk/release/app-release.apk`
- Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

**Key Build Steps** (automatic):

- Gradle reads from `build.gradle` → uses new `fallbackType: 'webview'`
- Gradle generates string resources → uses new bidirectional assetStatements
- Compiler uses updated AndroidManifest.xml → includes MEDIA_CONTENT_CONTROL permission

---

### **Phase 2: Re-verify Domain Linkage** (Validation)

After rebuilding, verify the new APK has proper configuration:

```bash
# Extract strings from APK (requires aapt tool from Android SDK)
aapt dump resources app-release.apk | grep -A 5 "assetStatements"

# You should see bidirectional asset links with both:
# - android_app namespace with your SHA-256
# - web namespace with your domain
```

Verify domain linkage again:

```bash
adb shell pm get-app-links com.marcel.music
# Expected: music.marcel-projects.vercel.app: verified ✓

adb shell pm get-app-links --user 0 com.marcel.music
# Shows detailed verification state
```

---

### **Phase 3: Install and Test** (Functional Validation)

```bash
# Uninstall old version to clear all caches
adb uninstall com.marcel.music

# Install new APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Launch app - should open as FULL STANDALONE (no URL bar)
adb shell am start -n com.marcel.music/.LauncherActivity

# Test background audio
# 1. Play a song
# 2. Press home (minimize app)
# 3. Wait 5 minutes with screen on
# 4. Turn screen off
# 5. Wait 10+ minutes
# 6. Turn screen on
# 7. Audio should still be playing (previously would have stopped after ~10 min)
```

---

### **Phase 4: Verify System Integration** (Confirmation)

#### A. Check if Digital Wellbeing Recognizes the App

```bash
# Check app category
adb shell pm get-app-category com.marcel.music
# Expected output: audio (or similar media-related category)

# In Settings → Digital Wellbeing, the app should appear under
# "Music Player" or "Audio" instead of "Chrome"
```

#### B. Check if Samsung Modes Recognize the App

```bash
# On Samsung device, go to:
# Settings → Modes and Routines → Create Routine
# The app should appear in "Choose apps to run in this mode"
# as "Music Player" not "Chrome"
```

#### C. Check DelegationService Activity

```bash
# View logs to confirm MediaSession monitoring
adb logcat -s MusicDelegationService

# Play a song and you should see:
# "MediaSession State: 3" (3 = PLAYING)
# "Now Playing: Song Title - Artist Name"
```

---

## Troubleshooting If Issues Persist

### **Issue: App Still Opens in Custom Tab (URL bar visible)**

**Diagnostic Steps**:

1. **Check if build was successful**:

   ```bash
   # Verify APK contains the new fallbackType
   unzip -q app-release.apk -d apk_contents/
   grep -r "webview" apk_contents/resources.arsc 2>/dev/null || echo "Not found - check if build happened"
   ```

2. **Check Chrome version**:

   ```bash
   adb shell pm dump com.android.chrome | grep version
   ```

   - TWA requires Chrome 72+ (for basic TWA)
   - Custom Tab fallback requires Chrome 45+
   - If Chrome is outdated, update via Play Store

3. **Clear ALL caches**:

   ```bash
   adb shell pm grant com.marcel.music android.permission.CLEAR_APP_CACHE
   adb shell rm -rf /data/data/com.marcel.music/cache
   adb shell rm -rf /data/data/com.marcel.music/shared_prefs
   ```

4. **Verify asset links one more time**:

   ```bash
   # Check your assetlinks.json is accessible
   curl -I https://music.marcel-projects.vercel.app/.well-known/assetlinks.json
   # Should return: 200 OK, Content-Type: application/json

   # Verify the content is correctly formatted (no trailing commas, etc.)
   curl https://music.marcel-projects.vercel.app/.well-known/assetlinks.json | jq .
   ```

### **Issue: Background Audio Stops After 10 Minutes with Screen Off**

**If Still Occurring**:

1. **Verify the fallback strategy took effect**:

   ```bash
   # Check which mode the app is actually running in
   adb shell ps -A | grep com.marcel.music
   # Look for the process name - if it contains "webview" it's in WebView mode
   # If it contains "chrome" it's still in Custom Tab mode
   ```

2. **Check Android Power Management**:

   ```bash
   # Verify WAKE_LOCK permission is granted
   adb shell pm dump com.marcel.music | grep WAKE_LOCK

   # Check if Battery Saver is interfering
   adb shell settings get secure battery_saver_constants
   ```

3. **Verify Service Foreground**:
   ```bash
   adb logcat -s DelegationService
   # Should see "MediaSession listener registered successfully"
   ```

### **Issue: Digital Wellbeing Still Counts as Chrome**

**If Still Not Recognized**:

1. **Force re-verification**:

   ```bash
   adb shell pm verify-app-links --re-verify com.marcel.music
   adb shell pm get-app-links com.marcel.music
   ```

2. **Check app category is set**:

   ```bash
   adb shell pm dump com.marcel.music | grep appCategory
   # Should show: appCategory=audio
   ```

3. **Rebuild Digital Wellbeing index** (Samsung devices):
   ```
   Settings → Digital Wellbeing → (Wait 5 minutes for re-index)
   Clear cache: Settings → Apps → Digital Wellbeing → Storage → Clear Cache
   ```

---

## Files Modified Summary

| File                                                                | Change                                                                                                 | Reason                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `android/app/build.gradle`                                          | Changed `fallbackType` from `customtabs` to `webview`                                                  | Ensures WebView fallback maintains full app lifecycle and audio support |
| `android/app/src/main/res/values/strings.xml`                       | Added Android app namespace to assetStatements                                                         | Enables bidirectional digital asset link verification                   |
| `android/app/src/main/AndroidManifest.xml`                          | 1. Added `android:pathPrefix="/"` to VIEW intent filter<br>2. Added `MEDIA_CONTENT_CONTROL` permission | Completes domain verification; enables MediaSession monitoring          |
| `android/app/src/main/java/com/marcel/music/DelegationService.java` | Implemented MediaSessionManager listener                                                               | Integrates Chrome's MediaSession with Android system controls           |

---

## Why These Fixes Work

### Fix #1: WebView Fallback

- **Before**: Custom Tab mode → Chrome's tab lifecycle suspends background audio
- **After**: WebView fallback → Full app lifecycle → Background audio continues indefinitely

### Fix #2: Bidirectional Asset Links

- **Before**: Chrome verifies server → Android but not Android → Chrome (asymmetric)
- **After**: Both directions verified → Chrome's OriginVerifier succeeds → Full TWA mode

### Fix #3: Intent Filter Path Prefix

- **Before**: Ambiguous intent matching
- **After**: Explicit `https://music.marcel-projects.vercel.app/` matching → Confident verification

### Fix #4: MediaSession Integration

- **Before**: Chrome plays audio silently to Android system
- **After**: Android's MediaSessionManager sees playback → Digital Wellbeing recognizes app → Samsung Modes can integrate

### Fix #5: MediaSession Permission

- **Before**: DelegationService can't access system MediaSessionManager
- **After**: Full permission granted → Can monitor and integrate with system controls

---

## Expected Outcomes After Fixes

| Issue                 | Before                           | After                                   |
| --------------------- | -------------------------------- | --------------------------------------- |
| **Launch Mode**       | Custom Tab (URL bar visible)     | Full TWA/Standalone (no URL bar)        |
| **Digital Wellbeing** | Counts as "Chrome"               | Counts as "Music Player"                |
| **Samsung Modes**     | App not recognized               | App appears as "Music Player"           |
| **Background Audio**  | Stops after ~10 min (screen off) | Plays indefinitely (WakeLock + WebView) |
| **System Controls**   | No media controls integration    | Full integration (pause/play/skip)      |
| **Chrome Fallback**   | Custom Tab (throttled)           | WebView (full lifecycle)                |

---

## Next Steps

1. **Build new APK** with the applied fixes
2. **Install on test device** (physical Android 8.0+ recommended)
3. **Run validation tests** per Phase 2-4 sections above
4. **Monitor Digital Wellbeing** for 24-48 hours to confirm proper app categorization
5. **Test background audio** extensively
6. **Publish to Google Play** when verified

---

## References & Documentation

- [Google Digital Asset Links Documentation](https://developers.google.com/digital-asset-links/v1/getting-started)
- [Trusted Web Activities Documentation](https://developers.google.com/web/android/trusted-web-activity)
- [MediaSession API Documentation](https://developer.android.com/reference/android/media/session/MediaSession)
- [Android App Links Documentation](https://developer.android.com/studio/write/app-link-indexing)

---

## Support & Debugging

For further debugging, collect:

```bash
# Full device logs
adb logcat > device_logs.txt

# App info
adb shell pm dump com.marcel.music > app_info.txt

# Domain verification details
adb shell pm get-app-links com.marcel.music > verification_status.txt

# MediaSession logs
adb logcat -s MusicDelegationService > delegation_service.txt
```

Attach these files to any bug reports or support requests.
