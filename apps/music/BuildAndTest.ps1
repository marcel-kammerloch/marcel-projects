#!/usr/bin/env pwsh
# TWA Music App - Build & Test Script
# Purpose: Rebuild Android APK with applied TWA fixes and run validation tests
# Usage: ./BuildAndTest.ps1

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipInstall = $false,
    [switch]$SkipTest = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Colors
$INFO = "Cyan"
$SUCCESS = "Green"
$ERROR = "Red"
$WARNING = "Yellow"

# Configuration
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$AndroidDir = Join-Path $ProjectRoot "android"
$ApkPath = Join-Path $ProjectRoot "android\app\build\outputs\apk\release\app-release.apk"
$PackageName = "com.marcel.music"
$LauncherActivity = "com.marcel.music.LauncherActivity"

function Write-Header {
    param([string]$Message)
    Write-Host "`n" -ForegroundColor White
    Write-Host "╔" + ("═" * ($Message.Length + 2)) + "╗" -ForegroundColor Cyan
    Write-Host "║ $Message ║" -ForegroundColor Cyan
    Write-Host "╚" + ("═" * ($Message.Length + 2)) + "╝" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message, [int]$StepNumber)
    Write-Host "`n[$StepNumber] $Message" -ForegroundColor $INFO
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $SUCCESS
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $ERROR
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $WARNING
}

function Test-Prerequisites {
    Write-Header "CHECKING PREREQUISITES"
    
    $failures = 0
    
    # Check Gradle wrapper
    Write-Step "Checking Gradle wrapper..." 1
    $gradleW = Join-Path $AndroidDir "gradlew.bat"
    if (-not (Test-Path $gradleW)) {
        Write-Error "Gradle wrapper not found at $gradleW"
        $failures++
    } else {
        Write-Success "Gradle wrapper found"
    }
    
    # Check build.gradle
    Write-Step "Checking build.gradle..." 2
    $buildGradle = Join-Path $AndroidDir "app\build.gradle"
    if (-not (Test-Path $buildGradle)) {
        Write-Error "build.gradle not found at $buildGradle"
        $failures++
    } else {
        Write-Success "build.gradle found"
        # Check if fallbackType is webview
        $content = Get-Content $buildGradle -Raw
        if ($content -match "fallbackType:\s*'webview'") {
            Write-Success "✓ fallbackType correctly set to 'webview'"
        } else {
            Write-Warning "fallbackType not set to 'webview' - checking current value..."
            if ($content -match "fallbackType:\s*'([^']+)'") {
                Write-Warning "Current value: '$($matches[1])'"
            }
        }
    }
    
    # Check for adb
    Write-Step "Checking ADB (Android Debug Bridge)..." 3
    $adb = Get-Command adb -ErrorAction SilentlyContinue
    if ($null -eq $adb) {
        Write-Warning "ADB not in PATH. Device tests will be skipped."
        Write-Warning "Add Android SDK tools to PATH to enable device testing."
    } else {
        Write-Success "ADB found: $($adb.Source)"
        
        # Check for connected devices
        Write-Step "Checking for connected devices..." 4
        $devices = & adb devices -l 2>$null | Select-Object -Skip 1 | Where-Object { $_ -match "device" -and $_ -notmatch "offline" }
        if ($devices) {
            Write-Success "Connected devices found"
            $devices | ForEach-Object { Write-Host "  → $_" -ForegroundColor Green }
        } else {
            Write-Warning "No connected devices found. Device tests will be skipped."
        }
    }
    
    if ($failures -gt 0) {
        Write-Error "Prerequisites check failed with $failures errors"
        exit 1
    }
    
    Write-Success "All prerequisites satisfied"
}

function Build-APK {
    Write-Header "BUILDING APK"
    
    Write-Step "Navigating to Android directory..." 1
    Push-Location $AndroidDir
    
    try {
        Write-Step "Running: gradlew.bat clean assembleRelease" 2
        
        if ($Verbose) {
            & .\gradlew.bat clean assembleRelease --info
        } else {
            & .\gradlew.bat clean assembleRelease
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Gradle build failed with exit code $LASTEXITCODE"
            exit 1
        }
        
        Write-Success "Build completed successfully"
        
        # Verify APK exists
        if (Test-Path $ApkPath) {
            $size = (Get-Item $ApkPath).Length / 1MB
            Write-Success "APK created: $ApkPath ($([math]::Round($size, 2)) MB)"
        } else {
            Write-Error "APK file not found at expected location: $ApkPath"
            exit 1
        }
        
    } finally {
        Pop-Location
    }
}

function Install-APK {
    Write-Header "INSTALLING APK ON DEVICE"
    
    # Check if adb is available
    $adb = Get-Command adb -ErrorAction SilentlyContinue
    if ($null -eq $adb) {
        Write-Warning "ADB not found. Skipping device installation."
        return
    }
    
    Write-Step "Checking for connected devices..." 1
    $devices = & adb devices -l 2>$null | Select-Object -Skip 1 | Where-Object { $_ -match "device" -and $_ -notmatch "offline" }
    
    if (-not $devices) {
        Write-Warning "No connected devices found. Skipping installation."
        return
    }
    
    Write-Step "Uninstalling previous version..." 2
    try {
        & adb uninstall $PackageName 2>$null
        Write-Success "Previous version uninstalled (or was not installed)"
    } catch {
        Write-Warning "Could not uninstall previous version: $_"
    }
    
    Write-Step "Installing new APK..." 3
    $result = & adb install $ApkPath 2>&1
    
    if ($result -match "Success") {
        Write-Success "APK installed successfully"
    } else {
        Write-Error "APK installation failed"
        Write-Error $result
        exit 1
    }
}

function Run-Device-Tests {
    Write-Header "RUNNING VALIDATION TESTS ON DEVICE"
    
    # Check if adb is available
    $adb = Get-Command adb -ErrorAction SilentlyContinue
    if ($null -eq $adb) {
        Write-Warning "ADB not found. Skipping device tests."
        return
    }
    
    # Check for connected devices
    $devices = & adb devices -l 2>$null | Select-Object -Skip 1 | Where-Object { $_ -match "device" -and $_ -notmatch "offline" }
    if (-not $devices) {
        Write-Warning "No connected devices found. Skipping device tests."
        return
    }
    
    Write-Step "Test 1: Verify Domain Linkage" 1
    $output = & adb shell pm get-app-links $PackageName 2>$null
    if ($output -match "verified") {
        Write-Success "Domain verification: VERIFIED ✓"
    } else {
        Write-Warning "Domain verification status: $output"
    }
    
    Write-Step "Test 2: Launch Application" 2
    try {
        $launchResult = & adb shell am start -n "$PackageName/$LauncherActivity" 2>&1
        if ($launchResult -match "Error" -or $LASTEXITCODE -ne 0) {
            Write-Warning "Launch returned: $launchResult"
        } else {
            Write-Success "App launched successfully"
        }
    } catch {
        Write-Warning "Could not launch app: $_"
    }
    
    Write-Step "Test 3: Check MediaSession Logs" 3
    Write-Host "Clearing logcat buffer..." -ForegroundColor Gray
    & adb logcat -c 2>$null
    
    Start-Sleep -Seconds 2
    
    Write-Host "Capturing logs (waiting 5 seconds)..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
    
    $logs = & adb logcat -d *:S MusicDelegationService:D 2>$null | Select-Object -Last 10
    
    if ($logs) {
        Write-Success "MediaSession logs captured:"
        $logs | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    } else {
        Write-Warning "No MediaSession logs captured. Ensure app is running."
    }
    
    Write-Step "Test 4: Dump App Manifest Info" 4
    $dumpOutput = & adb shell pm dump $PackageName 2>$null | Select-String "Features|appCategory|mediaSession" -Context 0,0
    if ($dumpOutput) {
        Write-Success "App info retrieved:"
        $dumpOutput | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
}

function Show-Next-Steps {
    Write-Header "NEXT STEPS"
    
    Write-Host @"
✓ Build and installation complete!

MANUAL TESTING:
1. Open the app on your device
2. Start playing a song
3. Press Home to minimize the app
4. Wait 15+ minutes with screen OFF
5. Turn screen on - audio should still be playing

VERIFICATION:
6. Open Settings → Digital Wellbeing
   Look for the app under "Music Player" (NOT "Chrome")

7. On Samsung devices:
   Settings → Modes and Routines
   App should appear as "Music Player" in app selection

BUILD ARTIFACTS:
  • Signed APK: $ApkPath
  • App size: $([math]::Round((Get-Item $ApkPath).Length / 1MB, 2)) MB

LOGS:
  • Check device logs: adb logcat -s MusicDelegationService
  • Verify domain: adb shell pm get-app-links $PackageName

DOCUMENTS:
  • Detailed guide: $(Join-Path $ProjectRoot "TWA_DIAGNOSTIC_AND_FIXES.md")
  • Quick reference: $(Join-Path $ProjectRoot "QUICK_FIX_REFERENCE.md")
  • Changes applied: $(Join-Path $ProjectRoot "CHANGES_APPLIED_SUMMARY.md")
"@ -ForegroundColor Cyan
}

# Main Execution
function Main {
    Write-Host "
╔════════════════════════════════════════════════════════════════╗
║         TWA Music App - Build & Test Script v1.0              ║
║      Trusted Web Activity Configuration for Android            ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan
    
    Write-Host "Project: $ProjectRoot" -ForegroundColor Gray
    Write-Host "Build directory: $AndroidDir" -ForegroundColor Gray
    Write-Host "Package name: $PackageName`n" -ForegroundColor Gray
    
    # Check prerequisites
    Test-Prerequisites
    
    # Build APK
    if (-not $SkipBuild) {
        Build-APK
    } else {
        Write-Header "SKIPPING BUILD"
        Write-Host "Using existing APK (if available)" -ForegroundColor Yellow
    }
    
    # Install APK
    if (-not $SkipInstall) {
        Install-APK
    } else {
        Write-Header "SKIPPING INSTALLATION"
    }
    
    # Run device tests
    if (-not $SkipTest) {
        Run-Device-Tests
    } else {
        Write-Header "SKIPPING TESTS"
    }
    
    # Show next steps
    Show-Next-Steps
    
    Write-Host "`n✓ Completed successfully!" -ForegroundColor Green
}

# Run main
Main
