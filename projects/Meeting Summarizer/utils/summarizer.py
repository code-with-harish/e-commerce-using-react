from typing import Dict, Optional
import json

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from transformers import pipeline
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False


class MeetingSummarizer:
    """Generate meeting summaries using free LLM options"""
    
    def __init__(self, groq_key: str = None, openai_key: str = None, use_hf: bool = False):
        self.client = None
        self.model = None
        self.provider = None
        
        # Priority: Groq (free & fast) > OpenAI > Hugging Face
        if groq_key and GROQ_AVAILABLE:
            self.client = Groq(api_key=groq_key)
            self.model = "llama-3.3-70b-versatile"  # Updated free model
            self.provider = "groq"
            print("Using Groq API (FREE)")
        elif openai_key and OPENAI_AVAILABLE:
            self.client = OpenAI(api_key=openai_key)
            self.model = "gpt-4o-mini"
            self.provider = "openai"
            print("Using OpenAI API")
        elif use_hf and HF_AVAILABLE:
            print("Loading Hugging Face model (this may take a moment)...")
            self.model = pipeline("summarization", model="facebook/bart-large-cnn")
            self.provider = "huggingface"
            print("Using Hugging Face (FREE)")
        else:
            raise ValueError("No valid API configuration. Please set GROQ_API_KEY, OPENAI_API_KEY, or USE_HUGGINGFACE=true")
    
    def summarize_meeting(self, transcript: str) -> Dict[str, str]:
        """
        Analyze meeting transcript and generate structured summary
        
        Args:
            transcript: Meeting transcript text
            
        Returns:
            Dictionary containing summary, decisions, action items, and discussion points
        """
        try:
            if self.provider == "huggingface":
                return self._summarize_with_hf(transcript)
            else:
                return self._summarize_with_api(transcript)
            
        except Exception as e:
            print(f"Summarization error: {str(e)}")
            raise Exception(f"Failed to generate summary: {str(e)}")
    
    def _summarize_with_api(self, transcript: str) -> Dict[str, str]:
        """Summarize using Groq or OpenAI API"""
        prompt = self._create_summary_prompt(transcript)
        
        messages = [
            {
                "role": "system",
                "content": "You are an expert meeting analyst who creates clear, actionable summaries from meeting transcripts."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        if self.provider == "groq":
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3
            )
        else:  # OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
        
        content = response.choices[0].message.content
        
        # Try to parse as JSON, fallback to text parsing
        try:
            result = json.loads(content)
        except:
            result = self._parse_text_response(content)
        
        return {
            'summary': result.get('summary', 'No summary available'),
            'key_decisions': result.get('key_decisions', 'No key decisions identified'),
            'action_items': result.get('action_items', 'No action items identified'),
            'discussion_points': result.get('discussion_points', 'No discussion points identified')
        }
    
    def _summarize_with_hf(self, transcript: str) -> Dict[str, str]:
        """Summarize using Hugging Face model"""
        # Chunk transcript if too long
        max_length = 1024
        chunks = [transcript[i:i+max_length] for i in range(0, len(transcript), max_length)]
        
        summaries = []
        for chunk in chunks[:3]:  # Process first 3 chunks to avoid timeout
            result = self.model(chunk, max_length=150, min_length=30, do_sample=False)
            summaries.append(result[0]['summary_text'])
        
        combined_summary = ' '.join(summaries)
        
        return {
            'summary': combined_summary,
            'key_decisions': 'Please review the summary above for key decisions.',
            'action_items': 'Please review the summary above for action items.',
            'discussion_points': 'Please review the summary above for discussion points.'
        }
    
    def _parse_text_response(self, text: str) -> Dict[str, str]:
        """Parse non-JSON text response"""
        result = {}
        
        # Simple text parsing for Groq responses
        sections = text.split('\n\n')
        current_key = 'summary'
        current_text = []
        
        for section in sections:
            if 'summary' in section.lower():
                current_key = 'summary'
            elif 'key decisions' in section.lower() or 'decisions' in section.lower():
                if current_text:
                    result[current_key] = '\n'.join(current_text)
                    current_text = []
                current_key = 'key_decisions'
            elif 'action items' in section.lower() or 'action' in section.lower():
                if current_text:
                    result[current_key] = '\n'.join(current_text)
                    current_text = []
                current_key = 'action_items'
            elif 'discussion' in section.lower():
                if current_text:
                    result[current_key] = '\n'.join(current_text)
                    current_text = []
                current_key = 'discussion_points'
            else:
                current_text.append(section.strip())
        
        if current_text:
            result[current_key] = '\n'.join(current_text)
        
        return result
    
    def _create_summary_prompt(self, transcript: str) -> str:
        """Create an optimized prompt for meeting summarization"""
        return f"""Analyze the following meeting transcript and provide a structured analysis in JSON format.

TRANSCRIPT:
{transcript}

Please provide your analysis in the following JSON structure:
{{
    "summary": "A concise 2-3 sentence overview of the meeting's main purpose and outcomes",
    "key_decisions": "List ALL important decisions made during the meeting as bullet points starting with '-'. Each decision should be on a new line. If absolutely no decisions were made, state 'No key decisions identified.'",
    "action_items": "List ALL specific tasks, action items, and commitments as bullet points starting with '-'. Include who is responsible if mentioned. Format: '- [Task] (Owner: [Name])'. If no action items, state 'No action items identified.'",
    "discussion_points": "List ALL main topics and important points discussed as bullet points starting with '-'. Each point on a new line. Include key concerns, issues raised, and important information shared."
}}

IMPORTANT: 
- Extract EVERY decision mentioned, even small ones
- Extract EVERY task or action item mentioned, even if owner is not specified
- Extract ALL topics discussed, problems identified, and solutions proposed
- Be thorough and comprehensive
- Use bullet points (start with '-') for lists
"""
    
    def extract_action_items_only(self, transcript: str) -> str:
        """
        Extract only action items from transcript (quick analysis)
        
        Args:
            transcript: Meeting transcript text
            
        Returns:
            Formatted action items
        """
        try:
            prompt = f"""Extract all action items and tasks from this meeting transcript.
            
TRANSCRIPT:
{transcript}

List each action item in this format:
- [Task description] (Owner: [Name if mentioned], Due: [Date if mentioned])

If no action items are found, respond with "No action items identified."
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting actionable tasks from meeting transcripts."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Action item extraction error: {str(e)}")
            return "Failed to extract action items"
