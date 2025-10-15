# 🆓 FREE Setup Guide - No Premium Required!

This guide will help you set up the Meeting Summarizer using **100% FREE** tools.

## 🎯 Recommended FREE Setup (Best Option)

### Option 1: Local Whisper + Groq API (FREE & Fast)

This is the **BEST free option** - uses local Whisper for transcription and Groq's free API for summarization.

#### Step 1: Install Dependencies

```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install required packages
pip install Flask python-dotenv werkzeug
pip install openai-whisper torch torchaudio
pip install groq
```

#### Step 2: Get FREE Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up for FREE (no credit card required)
3. Go to API Keys section
4. Create a new API key
5. Copy the key

#### Step 3: Configure Environment

Create a `.env` file:

```env
# Use Local Whisper for transcription (FREE)
USE_LOCAL_WHISPER=true
WHISPER_MODEL=base

# Use Groq for summarization (FREE)
GROQ_API_KEY=your_groq_api_key_here

# Flask settings
FLASK_SECRET_KEY=my-secret-key-123
FLASK_ENV=development
```

#### Step 4: Run the Application

```powershell
python app.py
```

**Done!** 🎉 Open http://localhost:5000

---

## 📊 Whisper Model Options

Choose based on your computer's power:

| Model | Speed | Accuracy | RAM Required |
|-------|-------|----------|--------------|
| `tiny` | ⚡⚡⚡ Fastest | ⭐⭐ Basic | ~1 GB |
| `base` | ⚡⚡ Fast | ⭐⭐⭐ Good | ~1 GB |
| `small` | ⚡ Medium | ⭐⭐⭐⭐ Very Good | ~2 GB |
| `medium` | 🐌 Slow | ⭐⭐⭐⭐⭐ Excellent | ~5 GB |

**Recommendation:** Start with `base` - good balance of speed and accuracy.

---

## 🔄 Alternative FREE Options

### Option 2: All Local (No Internet Required)

Use Hugging Face models locally:

```powershell
pip install transformers accelerate torch
```

`.env` file:
```env
USE_LOCAL_WHISPER=true
WHISPER_MODEL=base
USE_HUGGINGFACE=true
```

**Pros:** Completely offline, free forever  
**Cons:** Slower, requires more RAM (~8GB)

---

## 🚀 Quick Start Commands

```powershell
# 1. Clone/navigate to project
cd "Meeting Summarizer"

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install minimal dependencies
pip install Flask python-dotenv werkzeug openai-whisper groq

# 4. Create .env file
# Copy the recommended setup from above

# 5. Run
python app.py
```

---

## ⚡ First Time Setup (Downloads Models)

The first time you run the app:

1. **Whisper model download**: Happens automatically (~100MB for base model)
2. Takes 1-2 minutes on first run
3. Models are cached - future runs are instant!

---

## 🎤 Testing Your Setup

1. Start the server: `python app.py`
2. Open http://localhost:5000
3. Upload a short audio file (30 seconds)
4. Wait for processing
5. View your results!

---

## 💡 Tips & Tricks

### For Faster Processing:
- Use `tiny` or `base` Whisper model
- Keep audio files under 5 minutes
- Use MP3 format

### For Better Accuracy:
- Use `small` or `medium` Whisper model
- Ensure clear audio quality
- Avoid background noise

### If You Have GPU:
Whisper will automatically use your GPU if available (much faster!)

---

## 🆘 Troubleshooting

### "No module named 'whisper'"
```powershell
pip install openai-whisper
```

### "No module named 'groq'"
```powershell
pip install groq
```

### Slow transcription?
- Use a smaller Whisper model: `WHISPER_MODEL=tiny`
- Check if GPU is being used (CUDA for NVIDIA, MPS for Mac)

### Out of memory?
- Use `tiny` model
- Close other applications
- Process shorter audio files

---

## 📈 Performance Comparison

### Local Whisper (base model):
- ✅ FREE forever
- ✅ Works offline
- ✅ Good accuracy
- ⏱️ ~1-2 minutes for 5-minute audio

### Groq API:
- ✅ FREE tier (generous limits)
- ✅ Very fast (~2 seconds)
- ✅ Excellent quality
- ❌ Requires internet

---

## 🎓 Learning Resources

- **Whisper Documentation**: https://github.com/openai/whisper
- **Groq API Docs**: https://console.groq.com/docs
- **Groq Free Tier**: 30 requests/minute (very generous!)

---

## ✅ Verification Checklist

- [ ] Python 3.8+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Groq API key obtained (FREE)
- [ ] `.env` file configured
- [ ] First run completed (models downloaded)
- [ ] Test audio processed successfully

---

## 🎉 You're Ready!

You now have a **completely FREE** meeting summarizer that:
- Transcribes audio locally (no API costs)
- Summarizes with Groq (free API)
- Works offline for transcription
- No credit card required
- No usage limits for local processing

**Enjoy your free AI-powered meeting summarizer!** 🚀
