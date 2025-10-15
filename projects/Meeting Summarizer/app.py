from flask import Flask, request, jsonify, render_template, send_from_directory
import os
from werkzeug.utils import secure_filename
from config import Config
from utils.database import DatabaseManager
from utils.transcriber import AudioTranscriber
from utils.summarizer import MeetingSummarizer

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize directories
Config.init_app()

# Initialize components
db_manager = DatabaseManager(app.config['DATABASE_PATH'])

# Initialize transcriber
transcriber = AudioTranscriber(
    use_local=app.config['USE_LOCAL_WHISPER'],
    model_size=app.config['WHISPER_MODEL'],
    api_key=app.config.get('OPENAI_API_KEY')
)

# Initialize summarizer
summarizer = MeetingSummarizer(
    groq_key=app.config.get('GROQ_API_KEY'),
    openai_key=app.config.get('OPENAI_API_KEY'),
    use_hf=app.config.get('USE_HUGGINGFACE', False)
)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_audio():
    """Handle audio file upload and processing"""
    try:
        # Check if file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['audio']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Allowed: ' + ', '.join(app.config['ALLOWED_EXTENSIONS'])}), 400
        
        # Save file with absolute path
        filename = secure_filename(file.filename)
        # Ensure upload folder exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.abspath(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file.save(filepath)
        
        # Verify file was saved and has content
        if not os.path.exists(filepath):
            return jsonify({'error': f'Failed to save file: {filepath}'}), 500
        
        file_size = os.path.getsize(filepath)
        if file_size < 1000:  # Less than 1KB
            os.remove(filepath)
            return jsonify({'error': 'Audio file too small or corrupted. Please upload a valid audio file with at least 1 second of content.'}), 400
        
        # Create database record
        meeting_id = db_manager.create_meeting(filename)
        
        try:
            # Transcribe audio
            print(f"Starting transcription of: {filepath}")
            print(f"File exists: {os.path.exists(filepath)}")
            print(f"File size: {os.path.getsize(filepath)} bytes")
            
            transcript = transcriber.transcribe_audio(filepath)
            print(f"Transcription completed: {len(transcript)} characters")
            
            # Generate summary
            summary_data = summarizer.summarize_meeting(transcript)
            
            # Update database
            db_manager.update_meeting(
                meeting_id,
                transcript=transcript,
                summary=summary_data['summary'],
                key_decisions=summary_data['key_decisions'],
                action_items=summary_data['action_items'],
                discussion_points=summary_data['discussion_points'],
                processing_status='completed'
            )
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({
                'success': True,
                'meeting_id': meeting_id,
                'data': {
                    'transcript': transcript,
                    'summary': summary_data['summary'],
                    'key_decisions': summary_data['key_decisions'],
                    'action_items': summary_data['action_items'],
                    'discussion_points': summary_data['discussion_points']
                }
            }), 200
            
        except Exception as e:
            # Update database with error
            db_manager.update_meeting(
                meeting_id,
                processing_status='failed',
                error_message=str(e)
            )
            
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return jsonify({'error': f'Processing failed: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/meetings', methods=['GET'])
def get_meetings():
    """Get all meetings"""
    try:
        meetings = db_manager.get_all_meetings()
        return jsonify({'meetings': meetings}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/meeting/<int:meeting_id>', methods=['GET'])
def get_meeting(meeting_id):
    """Get specific meeting details"""
    try:
        meeting = db_manager.get_meeting(meeting_id)
        
        if meeting:
            return jsonify({'meeting': meeting}), 200
        else:
            return jsonify({'error': 'Meeting not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/meeting/<int:meeting_id>', methods=['DELETE'])
def delete_meeting(meeting_id):
    """Delete a meeting"""
    try:
        success = db_manager.delete_meeting(meeting_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Meeting deleted'}), 200
        else:
            return jsonify({'error': 'Meeting not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Meeting Summarizer API'}), 200


if __name__ == '__main__':
    print("=" * 60)
    print("Meeting Summarizer Server")
    print("=" * 60)
    print(f"Server running at: http://localhost:5000")
    print(f"Upload audio files and get AI-powered summaries!")
    print("=" * 60)
    
    app.run(debug=app.config['DEBUG'], host='0.0.0.0', port=5000)
