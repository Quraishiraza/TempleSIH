"""
YOLO Service - Using Real temple_crowd_3.mp4
Single zone, careful video handling to prevent crashes
"""
from flask import Flask, jsonify
from flask_cors import CORS
import cv2
import os
import base64
from datetime import datetime
import numpy as np

app = Flask(__name__)
CORS(app)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEOS_DIR = os.path.join(BASE_DIR, 'videos')
VIDEO_PATH = os.path.join(VIDEOS_DIR, 'temple_crowd_3.mp4')

# Global video capture (single instance to avoid threading issues)
cap = None
yolo_model = None
frame_count = 0
last_detection_count = 0  # Track last detection for alerts

def initialize_yolo():
    """Initialize YOLO model once"""
    global yolo_model
    try:
        from ultralytics import YOLO
        yolo_model = YOLO('yolov8n.pt')
        print("✅ YOLO model loaded successfully")
        return True
    except Exception as e:
        print(f"⚠️  YOLO model failed to load: {e}")
        return False

def initialize_video():
    """Initialize video capture once"""
    global cap
    try:
        if not os.path.exists(VIDEO_PATH):
            print(f"❌ Video not found: {VIDEO_PATH}")
            return False
        
        # Open with specific backend
        cap = cv2.VideoCapture(VIDEO_PATH)
        
        if not cap.isOpened():
            print(f"❌ Failed to open video: {VIDEO_PATH}")
            return False
        
        # Set to beginning
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        print(f"✅ Video opened: temple_crowd_3.mp4")
        return True
    except Exception as e:
        print(f"⚠️  Video initialization failed: {e}")
        return False

def detect_people(frame):
    """Detect people in frame using YOLO"""
    if yolo_model is None:
        return []
    
    try:
        # Run detection with low confidence for better detection
        results = yolo_model(
            frame,
            conf=0.15,  # Low confidence
            iou=0.40,
            classes=[0],  # Person class
            verbose=False,
            imgsz=416,
            max_det=300
        )
        
        detections = []
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0].cpu().numpy())
                detections.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': conf
                })
        
        return detections
    except Exception as e:
        print(f"Detection error: {e}")
        return []

def draw_detections(frame, detections, count, threshold=21):
    """Draw bounding boxes and info"""
    output = frame.copy()
    
    # Determine color based on threshold
    color = (0, 255, 0) if count <= threshold else (0, 0, 255)  # Green or Red
    
    # Draw boxes
    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
    
    # Draw info panel
    panel_height = 80
    panel = np.zeros((panel_height, output.shape[1], 3), dtype=np.uint8)
    
    # Add text
    cv2.putText(panel, f"People: {count}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    cv2.putText(panel, f"Threshold: {threshold}", (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    if count > threshold:
        cv2.putText(panel, "ALERT!", (output.shape[1] - 150, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
    
    # Combine
    output = np.vstack([panel, output])
    
    return output

@app.route('/api/yolo/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'message': 'YOLO Service - Real Video 3',
        'zones_active': 1,
        'zones_configured': 1,
        'video': 'temple_crowd_3.mp4'
    })

@app.route('/api/yolo/zones')
def get_zones():
    """Get zones"""
    return jsonify({
        'zones': [
            {
                'id': 'zone1',
                'name': 'Main Entrance - Video 3 (Real)',
                'status': 'active',
                'threshold': 21,
                'video': 'temple_crowd_3.mp4'
            }
        ]
    })

@app.route('/api/yolo/live/<zone_id>')
def get_live_frame(zone_id):
    """Get live frame with detection"""
    global cap, frame_count, last_detection_count
    
    if zone_id != 'zone1':
        return jsonify({'error': 'Only zone1 is active'}), 404
    
    try:
        # Read frame
        if cap is None or not cap.isOpened():
            if not initialize_video():
                raise Exception("Video not available")
        
        ret, frame = cap.read()
        
        # Loop video if ended
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
        
        if not ret or frame is None:
            raise Exception("Failed to read frame")
        
        frame_count += 1
        
        # Resize for faster processing
        height, width = frame.shape[:2]
        if width > 960:
            scale = 960 / width
            frame = cv2.resize(frame, (960, int(height * scale)))
        
        # Detect people
        detections = detect_people(frame)
        count = len(detections)
        
        # Update last detection count for alerts
        last_detection_count = count
        
        # Draw on frame
        processed_frame = draw_detections(frame, detections, count, threshold=21)
        
        # Encode to JPEG
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
        _, buffer = cv2.imencode('.jpg', processed_frame, encode_param)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Determine crowd level
        if count <= 20:
            crowd_level = 'LOW'
        elif count <= 50:
            crowd_level = 'MODERATE'
        elif count <= 100:
            crowd_level = 'HIGH'
        else:
            crowd_level = 'CRITICAL'
        
        # Generate alerts
        alerts = []
        if count > 21:
            alerts.append({
                'type': 'threshold_exceeded',
                'message': f'Crowd threshold exceeded: {count} people detected',
                'level': crowd_level,
                'timestamp': datetime.now().isoformat()
            })
        
        return jsonify({
            'zone_id': 'zone1',
            'zone_name': 'Main Entrance - Video 3 (Real)',
            'frame': frame_base64,
            'analysis': {
                'count': count,
                'crowd_level': crowd_level,
                'density': count / 100.0,
                'alerts': alerts,
                'timestamp': datetime.now().isoformat()
            },
            'timestamp': datetime.now().isoformat(),
            'frame_number': frame_count
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'zone_id': 'zone1',
            'zone_name': 'Main Entrance - Video 3 (Real)',
            'frame': '',
            'analysis': {
                'count': 0,
                'crowd_level': 'LOW',
                'density': 0.0,
                'alerts': [],
                'timestamp': datetime.now().isoformat()
            },
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 200

@app.route('/api/yolo/alerts')
def get_alerts():
    """Get current alerts based on last detection"""
    global last_detection_count
    
    threshold = 21
    alerts = []
    
    # Generate alert if threshold exceeded
    if last_detection_count > threshold:
        crowd_level = 'MODERATE' if last_detection_count <= 30 else 'HIGH'
        alerts.append({
            'zone_id': 'zone1',
            'zone_name': 'Main Entrance - Video 3 (Real)',
            'count': last_detection_count,
            'threshold': threshold,
            'level': crowd_level,
            'message': f'Crowd threshold exceeded at Main Entrance',
            'timestamp': datetime.now().isoformat()
        })
    
    return jsonify({
        'alerts': alerts,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/yolo/status')
def get_status():
    """Get status"""
    return jsonify({
        'zones': [
            {
                'zone_id': 'zone1',
                'zone_name': 'Main Entrance - Video 3 (Real)',
                'status': 'active',
                'current_count': 0,
                'threshold': 21,
                'alert_active': False
            }
        ],
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 TRINETRA - YOLO SERVICE (Real Video 3)")
    print("="*70)
    print("\n📹 Using: temple_crowd_3.mp4")
    print("⚙️  Configuration:")
    print("   • Single zone (prevents threading conflicts)")
    print("   • Careful video handling")
    print("   • Threshold: 21 people")
    print("   • Detection confidence: 0.15\n")
    
    # Initialize
    print("🔄 Initializing YOLO model...")
    if initialize_yolo():
        print("🔄 Initializing video...")
        if initialize_video():
            print("\n✅ All systems ready!")
            print(f"📡 Server starting on http://0.0.0.0:5002\n")
            print("="*70 + "\n")
            
            app.run(
                host='0.0.0.0',
                port=5002,
                debug=False,
                threaded=True,
                use_reloader=False
            )
        else:
            print("\n❌ Video initialization failed!")
            print("Falling back to mock mode...")
    else:
        print("\n❌ YOLO initialization failed!")

