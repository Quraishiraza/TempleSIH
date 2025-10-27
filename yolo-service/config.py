import os

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Directories
MODELS_DIR = os.path.join(BASE_DIR, 'models')
VIDEOS_DIR = os.path.join(BASE_DIR, 'videos')
OUTPUT_DIR = os.path.join(BASE_DIR, 'output')

# YOLO Configuration
YOLO_MODEL = 'yolov8n.pt'  # Nano model (fastest, good for demo)
# YOLO_MODEL = 'yolov8s.pt'  # Small model (more accurate)
# YOLO_MODEL = 'yolov8m.pt'  # Medium model (best balance)

CONFIDENCE_THRESHOLD = 0.15  # Detection confidence (very low for wide-angle top views)
IOU_THRESHOLD = 0.40  # Intersection over Union threshold (lower for dense crowds)

# Crowd Thresholds
CROWD_LEVELS = {
    'LOW': (0, 20),
    'MODERATE': (20, 50),
    'HIGH': (50, 100),
    'CRITICAL': (100, float('inf'))
}

# Alert Thresholds
ALERT_THRESHOLD = 21  # Generate alert when person count > 21
CRITICAL_THRESHOLD = 80  # Critical alert threshold

# Video Processing
FPS_LIMIT = 10  # Process every Nth frame for efficiency
MAX_FRAMES_TO_PROCESS = 300  # Max frames for demo (10 sec at 30fps)

# Temple Zones (simulated cameras)
TEMPLE_ZONES = [
    {
        'id': 'zone1',
        'name': 'Main Entrance',
        'video': 'temple_crowd_1.mp4',
        'threshold': 21  # Alert if more than 21 people
    },
    {
        'id': 'zone2',
        'name': 'Darshan Queue',
        'video': 'temple_crowd_1.mp4',
        'threshold': 21  # Alert if more than 21 people
    },
    {
        'id': 'zone3',
        'name': 'Exit Area',
        'video': 'temple_crowd_1.mp4',
        'threshold': 21  # Alert if more than 21 people
    }
    # Note: All zones using video 1 (video 2&3 have encoding issues)
    # In production, each zone would have its own camera feed
]

# API Configuration
API_HOST = '0.0.0.0'
API_PORT = 5002  # Different from ML service (5001)

# Colors for visualization (BGR format)
COLORS = {
    'person': (0, 255, 0),      # Green
    'alert': (0, 0, 255),       # Red
    'warning': (0, 165, 255),   # Orange
    'text': (255, 255, 255)     # White
}

