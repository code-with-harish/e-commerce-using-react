import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # API settings (multiple options)
    USE_LOCAL_WHISPER = os.getenv('USE_LOCAL_WHISPER', 'true').lower() == 'true'
    WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'base')  # tiny, base, small, medium, large
    
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    HF_TOKEN = os.getenv('HF_TOKEN')
    USE_HUGGINGFACE = os.getenv('USE_HUGGINGFACE', 'false').lower() == 'true'
    
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 100)) * 1024 * 1024  # Convert MB to bytes
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'mp3,wav,m4a,mp4,webm').split(','))
    
    # Database settings
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'database/meetings.db')
    
    # Create necessary directories
    @staticmethod
    def init_app():
        """Initialize application directories"""
        os.makedirs('uploads', exist_ok=True)
        os.makedirs('database', exist_ok=True)
        os.makedirs('static/css', exist_ok=True)
        os.makedirs('static/js', exist_ok=True)
        os.makedirs('templates', exist_ok=True)
        os.makedirs('models', exist_ok=True)  # For local models
