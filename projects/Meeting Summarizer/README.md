# Meeting Summarizer

An AI-powered meeting transcription and summarization tool that converts audio files into actionable insights.

## Features

- 🎤 **Audio Transcription**: Convert meeting audio to text using OpenAI Whisper
- 📝 **Smart Summaries**: Generate concise meeting summaries with key decisions
- ✅ **Action Items**: Automatically extract tasks and action items
- 🌐 **Web Interface**: Simple frontend to upload audio and view results
- 💾 **Data Persistence**: Store transcripts and summaries for future reference

## Tech Stack

- **Backend**: Python (Flask)
- **ASR**: Local Whisper (FREE) or OpenAI Whisper API
- **LLM**: Groq API (FREE) / OpenAI GPT-4 / Hugging Face (FREE)
- **Frontend**: HTML/CSS/JavaScript
- **Database**: SQLite

## Prerequisites

- Python 3.8+
- **FREE Option:** Groq API Key (no credit card required)
- **Paid Option:** OpenAI API Key

## 🆓 FREE Setup (Recommended)

**No OpenAI Premium needed!** This project works with 100% free tools.

See **[FREE_SETUP.md](FREE_SETUP.md)** for complete free setup guide.

**Quick Free Setup:**
1. Get free Groq API key: https://console.groq.com (no credit card!)
2. Install dependencies: `pip install Flask python-dotenv openai-whisper groq`
3. Configure `.env` with Groq key and `USE_LOCAL_WHISPER=true`
4. Run: `python app.py`

✅ Free transcription (local Whisper)  
✅ Free summarization (Groq API)  
✅ No usage limits on local processing

## Installation

1. Clone the repository:
```bash
git clone https://github.com/code-with-harish/my-repo.git
cd "Meeting Summarizer"
```

2. Create a virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
```

3. Install dependencies (FREE option):
```bash
# Minimal free setup
pip install Flask python-dotenv werkzeug openai-whisper groq

# OR full installation
pip install -r requirements.txt
```

4. Get FREE Groq API Key:
   - Visit: https://console.groq.com
   - Sign up (FREE, no credit card)
   - Create API key

5. Create a `.env` file in the root directory:
```env
# FREE Setup (Recommended)
USE_LOCAL_WHISPER=true
WHISPER_MODEL=base
GROQ_API_KEY=your_groq_api_key_here
FLASK_SECRET_KEY=your_secret_key_here

# OR Paid Setup (OpenAI)
# USE_LOCAL_WHISPER=false
# OPENAI_API_KEY=your_openai_api_key_here
# FLASK_SECRET_KEY=your_secret_key_here
```

## Usage

1. Start the Flask server:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Upload a meeting audio file (supported formats: MP3, WAV, M4A, MP4)

4. Wait for processing and view:
   - Full transcript
   - Meeting summary
   - Action items
   - Key decisions

## Project Structure

```
Meeting Summarizer/
├── app.py                 # Flask application
├── config.py              # Configuration settings
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── main.js       # Frontend logic
├── templates/
│   └── index.html        # Main page
├── uploads/              # Temporary audio storage
├── database/
│   └── meetings.db       # SQLite database
└── utils/
    ├── __init__.py
    ├── transcriber.py    # Whisper integration
    ├── summarizer.py     # LLM summarization
    └── database.py       # Database operations
```

## API Endpoints

- `GET /` - Main web interface
- `POST /upload` - Upload audio file
- `GET /meetings` - List all meetings
- `GET /meeting/<id>` - Get specific meeting details
- `DELETE /meeting/<id>` - Delete a meeting

## LLM Prompt Strategy

The application uses a carefully crafted prompt to generate high-quality summaries:

```
Analyze the following meeting transcript and provide:

1. **Meeting Summary**: A concise overview (2-3 sentences)
2. **Key Decisions**: Important decisions made during the meeting
3. **Action Items**: Specific tasks with responsible parties (if mentioned)
4. **Discussion Points**: Main topics discussed

Format the response in a clear, structured manner.
```

## Demo

[Demo video link will be added here]

## Screenshots

*Screenshots will be added after implementation*

## Evaluation Criteria

✅ **Transcription Accuracy**: Using OpenAI Whisper for high-quality ASR  
✅ **Summary Quality**: LLM-powered intelligent summarization  
✅ **LLM Prompt Effectiveness**: Optimized prompts for actionable outputs  
✅ **Code Structure**: Clean, modular, well-documented code  

## Future Enhancements

- [ ] Multi-language support
- [ ] Real-time transcription
- [ ] Speaker diarization
- [ ] Calendar integration
- [ ] Email summary distribution
- [ ] Export to PDF/DOCX

## License

MIT License

## Author

Harish - [GitHub Profile](https://github.com/code-with-harish)

## Acknowledgments

- OpenAI for Whisper and GPT-4 APIs
- Flask framework
- Open source community
