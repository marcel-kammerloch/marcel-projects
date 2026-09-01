# Quick Reference: TWA Configuration Fixes

## Summary of Changes

### ✅ 5 Fixes Applied

| #   | Issue                       | File                     | Change                        | Impact                                           |
| --- | --------------------------- | ------------------------ | ----------------------------- | ------------------------------------------------ |
| 1   | Fallback strategy           | `build.gradle`           | `customtabs` → `webview`      | ⭐ CRITICAL: Enables background audio in WebView |
| 2   | Asymmetric asset links      | `strings.xml`            | Added Android app namespace   | ⭐ CRITICAL: Fixes Chrome's OriginVerifier       |
| 3   | Missing path prefix         | `AndroidManifest.xml`    | Added `pathPrefix="/"`        | Medium: Completes verification                   |
| 4   | No MediaSession integration | `DelegationService.java` | Implemented listener          | High: System media integration                   |
| 5   | Missing permission          | `AndroidManifest.xml`    | Added `MEDIA_CONTENT_CONTROL` | High: Enables system monitoring                  |

---

## Rebuild Instructions

### **Quick Build (Recommended)**

```powershell
# Navigate to android directory
cd android

# Full clean build
.\gradlew.bat clean assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### **Build with Verification**

```powershell
cd android

# Show build logs
.\gradlew.bat clean assembleRelease --info | Tee-Object -FilePath build.log

# Verify the new configuration made it into the APK
# (requires Android SDK tools)
```

### **Install on Device**

```powershell
# Clear existing installation
adb uninstall com.marcel.music

# Install new APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Launch app
adb shell am start -n com.marcel.music/.LauncherActivity
```

---

## Validation Checklist

After rebuilding and installing:

### ✓ Launch Mode Check

```bash
# App should open WITHOUT a URL bar (full TWA mode)
adb shell am start -n com.marcel.music/.LauncherActivity

# Verify it says "verified" (not "ask")
adb shell pm get-app-links com.marcel.music
```

### ✓ Background Audio Test

1. Start playing a song
2. Press Home (minimize app)
3. Wait 15 minutes with screen OFF
4. Turn screen back on
5. **Expected**: Audio still playing ✓

### ✓ Digital Wellbeing Check

```
Settings → Digital Wellbeing → App Usage
Look for: "Music Player" (not "Chrome")
```

### ✓ System Integration Check

```bash
# Check DelegationService logging
adb logcat -s MusicDelegationService

# Should see:
# "MediaSession listener registered successfully"
# "MediaSession State: 3" (while playing)
```

---

## Problem? These Are Your Root Causes

### **App still opens in Custom Tab (URL bar visible)**

→ Build didn't update `fallbackType` to `webview`  
→ Run `clean assembleRelease` again, verify in build logs

### **Background audio stops after 10 minutes**

→ Fallback strategy not taking effect  
→ Clear app cache: `adb shell pm clear com.marcel.music`  
→ Rebuild and reinstall

### **Digital Wellbeing still shows "Chrome"**

→ Asset links verification failed  
→ Verify `assetlinks.json` is accessible: `curl https://music.marcel-projects.vercel.app/.well-known/assetlinks.json`  
→ Clear platform cache: `adb shell pm verify-app-links --re-verify com.marcel.music`

### **No media controls appearing**

→ DelegationService not running  
→ Check logs: `adb logcat -s MusicDelegationService`  
→ Verify permission: `adb shell pm dump com.marcel.music | grep MEDIA_CONTENT_CONTROL`

---

## Configuration Details Reference

### Before vs After

**build.gradle** (Line 40):

```diff
- fallbackType: 'customtabs',
+ fallbackType: 'webview',
```

**strings.xml** (Asset Statements):

```diff
- Only "web" namespace
+ "android_app" namespace + "web" namespace (bidirectional)
```

**AndroidManifest.xml** (Intent Filter):

```diff
  <data android:scheme="https"
        android:host="@string/hostName"
+       android:pathPrefix="/"
  />
```

**AndroidManifest.xml** (Permissions):

```diff
+ <uses-permission android:name="android.permission.MEDIA_CONTENT_CONTROL" />
```

**DelegationService.java**:

```diff
- Empty implementation
+ Full MediaSessionManager listener with logging
```

---

## What Each Fix Does

### Fix #1: WebView Fallback

**Why**: Chrome Custom Tab mode suspends background audio after ~10 minutes  
**What**: Switch fallback to WebView (embedded, full app lifecycle)  
**Result**: Background audio continues indefinitely with proper WakeLock

### Fix #2: Bidirectional Asset Links

**Why**: Chrome's OriginVerifier checks BOTH directions; yours was asymmetric  
**What**: Add Android app namespace to client-side assetStatements  
**Result**: Chrome recognizes the app as trusted → Full TWA mode instead of Custom Tab

### Fix #3: Intent Filter Path Prefix

**Why**: Ambiguous intent matching confuses domain verification  
**What**: Explicitly specify `pathPrefix="/"`  
**Result**: Unambiguous path matching → Confident verification

### Fix #4: MediaSession Integration

**Why**: Chrome's MediaSession is invisible to Android's system controls  
**What**: Implement MediaSessionManager listener in DelegationService  
**Result**: Android knows app is playing music → Digital Wellbeing recognizes it

### Fix #5: MediaSession Permission

**Why**: DelegationService can't access system MediaSessionManager without permission  
**What**: Add `MEDIA_CONTENT_CONTROL` permission  
**Result**: DelegationService can monitor and integrate with system controls

---

## Files Modified

All fixes are in the `android/` directory:

```
android/
├── app/
│   ├── build.gradle .......................... Fix #1
│   ├── src/main/
│   │   ├── AndroidManifest.xml ............... Fix #3, #5
│   │   ├── res/values/
│   │   │   └── strings.xml .................. Fix #2
│   │   └── java/com/marcel/music/
│   │       └── DelegationService.java ....... Fix #4
```

---

## Build System Flow

When you run `./gradlew.bat assembleRelease`:

1. **Gradle reads** `build.gradle` with new `fallbackType: 'webview'`
2. **Gradle generates** string resources with bidirectional assetStatements
3. **Android Manifest** is processed with path prefix and permissions
4. **DelegationService** is compiled with MediaSession monitoring
5. **APK is created** with all fixes baked in
6. **APK is signed** using keystore from `local.properties`

---

## Next Steps

1. ✅ **Rebuild**: `cd android && ./gradlew.bat clean assembleRelease`
2. ✅ **Test**: Install APK and verify checklist above
3. ✅ **Validate**: Check Digital Wellbeing and Samsung Modes integration
4. ✅ **Deploy**: Once verified, publish to Google Play

---

## Detailed Documentation

For complete diagnostic steps, troubleshooting, and verification procedures, see:
**[TWA_DIAGNOSTIC_AND_FIXES.md](./TWA_DIAGNOSTIC_AND_FIXES.md)**
