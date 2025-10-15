import os
from typing import Optional
import subprocess
import sys

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


def check_ffmpeg():
    """Check if ffmpeg is available"""
    try:
        subprocess.run(['ffmpeg', '-version'], 
                      stdout=subprocess.PIPE, 
                      stderr=subprocess.PIPE, 
                      check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


class AudioTranscriber:
    """Handle audio transcription using local Whisper or OpenAI API"""
    
    def __init__(self, use_local: bool = True, model_size: str = 'base', api_key: str = None):
        self.use_local = use_local
        self.model_size = model_size
        self.model = None
        self.client = None
        
        if use_local:
            if not WHISPER_AVAILABLE:
                raise ImportError("Whisper not installed. Run: pip install openai-whisper")
            
            # Check for ffmpeg
            if not check_ffmpeg():
                print("\n" + "="*60)
                print("⚠️  WARNING: FFmpeg not found!")
                print("="*60)
                print("Whisper requires FFmpeg to process audio files.")
                print("\nQuick Fix:")
                print("1. Install Chocolatey: https://chocolatey.org/install")
                print("2. Run: choco install ffmpeg")
                print("3. Restart your terminal")
                print("\nSee INSTALL_FFMPEG.md for detailed instructions")
                print("="*60 + "\n")
                raise RuntimeError("FFmpeg is required but not found. See INSTALL_FFMPEG.md")
            
            print(f"Loading local Whisper model ({model_size})...")
            self.model = whisper.load_model(model_size)
            print("Whisper model loaded successfully!")
        else:
            if not OPENAI_AVAILABLE:
                raise ImportError("OpenAI package not installed. Run: pip install openai")
            if not api_key:
                raise ValueError("OpenAI API key required")
            self.client = OpenAI(api_key=api_key)
    
    def transcribe_audio(self, audio_file_path: str) -> Optional[str]:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Transcribed text
        """
        try:
            # Convert to absolute path and verify existence
            audio_file_path = os.path.abspath(audio_file_path)
            
            if not os.path.exists(audio_file_path):
                raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
            
            print(f"Processing file: {audio_file_path}")
            print(f"File exists check: {os.path.exists(audio_file_path)}")
            
            if not os.path.exists(audio_file_path):
                raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
            
            file_size = os.path.getsize(audio_file_path)
            print(f"File size: {file_size} bytes")
            
            # Check minimum file size (at least 1KB)
            if file_size < 1000:
                raise ValueError(f"Audio file too small ({file_size} bytes). Please upload a valid audio file with at least 1 second of audio.")
            
            if self.use_local:
                # Use local Whisper model
                print(f"Transcribing with local Whisper ({self.model_size})...")
                
                # For Windows, ensure ffmpeg can find the file
                if not os.path.isfile(audio_file_path):
                    raise FileNotFoundError(f"File is not accessible: {audio_file_path}")
                
                # Transcribe with better error handling
                try:
                    result = self.model.transcribe(
                        audio_file_path, 
                        fp16=False,
                        language='en',  # Specify language for better results
                        verbose=False
                    )
                    
                    if not result or not result.get('text'):
                        raise ValueError("Transcription produced no text. The audio file may be too short, corrupted, or contain no speech.")
                    
                    print(f"Transcription successful! Length: {len(result['text'])} characters")
                    return result['text'].strip()
                    
                except Exception as e:
                    error_msg = str(e)
                    if "reshape tensor" in error_msg or "0 elements" in error_msg:
                        raise ValueError("Audio file appears to be too short or corrupted. Please ensure the audio file:\n- Is at least 1 second long\n- Contains actual speech/audio\n- Is a valid audio format (MP3, WAV, M4A)")
                    raise
            else:
                # Use OpenAI API
                with open(audio_file_path, 'rb') as audio_file:
                    transcript = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="text"
                    )
                return transcript
            
        except Exception as e:
            print(f"Transcription error: {str(e)}")
            raise Exception(f"Failed to transcribe audio: {str(e)}")
    
    def transcribe_with_timestamps(self, audio_file_path: str) -> Optional[dict]:
        """
        Transcribe audio file with timestamps
        
        Args:
            audio_file_path: Path to the audio file
            
        Returns:
            Dictionary with transcript and timestamps
        """
        try:
            if self.use_local:
                result = self.model.transcribe(audio_file_path, verbose=True)
                return result
            else:
                with open(audio_file_path, 'rb') as audio_file:
                    transcript = self.client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        response_format="verbose_json",
                        timestamp_granularities=["word"]
                    )
                return transcript
            
        except Exception as e:
            print(f"Transcription error: {str(e)}")
            raise Exception(f"Failed to transcribe audio with timestamps: {str(e)}")
