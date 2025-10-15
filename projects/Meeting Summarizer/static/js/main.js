// Global variables
let currentMeetingData = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const audioFileInput = document.getElementById('audioFile');
const selectedFileDiv = document.getElementById('selectedFile');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // File input change
    audioFileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        audioFileInput.files = files;
        handleFileSelect();
    }
}

function handleFileSelect() {
    const file = audioFileInput.files[0];
    
    if (file) {
        // Display selected file info
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        
        document.querySelector('.file-name').textContent = fileName;
        document.querySelector('.file-size').textContent = fileSize;
        
        selectedFileDiv.classList.remove('hidden');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function uploadFile() {
    const file = audioFileInput.files[0];
    
    if (!file) {
        showError('Please select a file first');
        return;
    }
    
    // Show loading
    selectedFileDiv.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    
    // Create FormData
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentMeetingData = data.data;
            displayResults(data.data);
        } else {
            showError(data.error || 'Failed to process audio file');
        }
        
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

function displayResults(data) {
    // Populate result sections
    document.getElementById('summaryContent').textContent = data.summary;
    document.getElementById('decisionsContent').textContent = data.key_decisions;
    document.getElementById('actionItemsContent').textContent = data.action_items;
    document.getElementById('discussionContent').textContent = data.discussion_points;
    document.getElementById('transcriptContent').textContent = data.transcript;
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorSection.classList.remove('hidden');
}

function resetForm() {
    // Reset file input
    audioFileInput.value = '';
    selectedFileDiv.classList.add('hidden');
    
    // Hide sections
    loadingIndicator.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    
    // Clear data
    currentMeetingData = null;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyToClipboard() {
    if (!currentMeetingData) return;
    
    const text = `
MEETING SUMMARY
===============

${currentMeetingData.summary}

KEY DECISIONS
=============

${currentMeetingData.key_decisions}

ACTION ITEMS
============

${currentMeetingData.action_items}

DISCUSSION POINTS
=================

${currentMeetingData.discussion_points}
`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Summary copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy: ' + err.message);
    });
}

function downloadResults() {
    if (!currentMeetingData) return;
    
    const content = `
MEETING SUMMARY REPORT
======================
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
${currentMeetingData.summary}

KEY DECISIONS
-------------
${currentMeetingData.key_decisions}

ACTION ITEMS
------------
${currentMeetingData.action_items}

DISCUSSION POINTS
-----------------
${currentMeetingData.discussion_points}

FULL TRANSCRIPT
---------------
${currentMeetingData.transcript}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

async function loadMeetingHistory() {
    try {
        const response = await fetch('/meetings');
        const data = await response.json();
        
        if (response.ok) {
            displayHistory(data.meetings);
        } else {
            alert('Failed to load meeting history');
        }
        
    } catch (error) {
        alert('Error loading history: ' + error.message);
    }
}

function displayHistory(meetings) {
    const historyContent = document.getElementById('historyContent');
    
    if (meetings.length === 0) {
        historyContent.innerHTML = '<p style="color: #a0a0a0; text-align: center; padding: 20px;">No meetings found</p>';
        return;
    }
    
    historyContent.innerHTML = meetings.map(meeting => `
        <div class="history-item" onclick="loadMeeting(${meeting.id})">
            <div>
                <strong>${meeting.filename}</strong>
                <br>
                <small style="color: #a0a0a0;">${new Date(meeting.upload_date).toLocaleString()}</small>
            </div>
            <div>
                <span class="status-badge ${meeting.processing_status}">
                    ${meeting.processing_status}
                </span>
            </div>
        </div>
    `).join('');
}

async function loadMeeting(meetingId) {
    try {
        const response = await fetch(`/meeting/${meetingId}`);
        const data = await response.json();
        
        if (response.ok && data.meeting) {
            const meeting = data.meeting;
            
            if (meeting.processing_status === 'completed') {
                currentMeetingData = {
                    summary: meeting.summary,
                    key_decisions: meeting.key_decisions,
                    action_items: meeting.action_items,
                    discussion_points: meeting.discussion_points,
                    transcript: meeting.transcript
                };
                displayResults(currentMeetingData);
            } else {
                alert('Meeting processing is not completed yet');
            }
        } else {
            alert('Failed to load meeting details');
        }
        
    } catch (error) {
        alert('Error loading meeting: ' + error.message);
    }
}
