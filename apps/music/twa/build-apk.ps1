# PowerShell script to build TWA APK using Bubblewrap
param(
    [string]$Domain = "music.marcel-projects.vercel.app",
    [string]$PackageId = "com.marcel.music"
)

Write-Host "=== Building TWA APK for $Domain ($PackageId) ===" -ForegroundColor Cyan

# 1. Check if bubblewrap is installed
if (-not (Get-Command "bubblewrap" -ErrorAction SilentlyContinue)) {
    Write-Host "Bubblewrap CLI not found. Installing globally via npm..." -ForegroundColor Yellow
    npm install -g @bubblewrap/cli
}

# 2. Check Java / Android SDK environment
if (-not $env:JAVA_HOME) {
    Write-Host "[WARNING] JAVA_HOME is not set. Bubblewrap may prompt to download JDK/Android SDK." -ForegroundColor Yellow
}

# 3. Create or enter build output directory
$BuildDir = Join-Path $PSScriptRoot "build"
if (-not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}

Set-Location $BuildDir

# 4. Check if twa-manifest.json exists in build dir
if (-not (Test-Path "twa-manifest.json")) {
    Write-Host "Initializing Bubblewrap project from https://$Domain/site.webmanifest..." -ForegroundColor Green
    bubblewrap init --manifest="https://$Domain/site.webmanifest"
}

# 5. Build signed release APK
Write-Host "Building signed APK..." -ForegroundColor Green
bubblewrap build

# 6. Sideload helper
$ApkPath = Join-Path $BuildDir "app-release-signed.apk"
if (Test-Path $ApkPath) {
    Write-Host "`nBuild successful! APK created at: $ApkPath" -ForegroundColor Green
    Write-Host "To install directly onto a connected Android device via ADB, run:" -ForegroundColor Cyan
    Write-Host "  adb install -r '$ApkPath'`n" -ForegroundColor White
} else {
    Write-Host "`nBuild complete. Check the $BuildDir directory for output files." -ForegroundColor Yellow
}
