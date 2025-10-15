import sqlite3
from datetime import datetime
from typing import List, Dict, Optional


class DatabaseManager:
    """Manage SQLite database operations for meeting data"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Create a database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize the database schema"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                transcript TEXT,
                summary TEXT,
                key_decisions TEXT,
                action_items TEXT,
                discussion_points TEXT,
                processing_status TEXT DEFAULT 'pending',
                error_message TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_meeting(self, filename: str) -> int:
        """Create a new meeting record"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'INSERT INTO meetings (filename, processing_status) VALUES (?, ?)',
            (filename, 'processing')
        )
        
        meeting_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return meeting_id
    
    def update_meeting(self, meeting_id: int, **kwargs):
        """Update meeting record with processed data"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Build dynamic update query
        fields = []
        values = []
        
        for key, value in kwargs.items():
            if key in ['transcript', 'summary', 'key_decisions', 'action_items', 
                      'discussion_points', 'processing_status', 'error_message']:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if fields:
            query = f"UPDATE meetings SET {', '.join(fields)} WHERE id = ?"
            values.append(meeting_id)
            cursor.execute(query, values)
            conn.commit()
        
        conn.close()
    
    def get_meeting(self, meeting_id: int) -> Optional[Dict]:
        """Retrieve a meeting by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM meetings WHERE id = ?', (meeting_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    
    def get_all_meetings(self, limit: int = 50) -> List[Dict]:
        """Retrieve all meetings (most recent first)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM meetings ORDER BY upload_date DESC LIMIT ?',
            (limit,)
        )
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def delete_meeting(self, meeting_id: int) -> bool:
        """Delete a meeting record"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM meetings WHERE id = ?', (meeting_id,))
        deleted = cursor.rowcount > 0
        
        conn.commit()
        conn.close()
        
        return deleted
