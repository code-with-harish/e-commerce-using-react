# Install FFmpeg for Windows

Whisper requires FFmpeg to process audio files. Here's how to install it:

## Quick Install (Recommended)

### Option 1: Using Chocolatey (Easiest)

1. Open PowerShell as Administrator
2. Run:
```powershell
choco install ffmpeg
```

### Option 2: Manual Installation

1. Download FFmpeg:
   - Go to: https://www.gyan.dev/ffmpeg/builds/
   - Download: `ffmpeg-release-essentials.zip`

2. Extract the ZIP file to: `C:\ffmpeg`

3. Add to PATH:
   - Open System Environment Variables
   - Edit PATH variable
   - Add: `C:\ffmpeg\bin`

4. Restart your terminal

### Option 3: Using Scoop

```powershell
scoop install ffmpeg
```

## Verify Installation

```powershell
ffmpeg -version
```

You should see FFmpeg version information.

## Alternative: Use pydub with built-in ffmpeg

```powershell
pip install pydub
pip install ffmpeg-python
```

Then restart your app!
