"""
Simple YOLO Service - Stable version for testing alert system
Provides mock data when video fails
"""
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# Mock detection data generator
def generate_mock_detection(zone_id, zone_name, threshold=21):
    """Generate realistic mock detection data"""
    # Simulate varying crowd counts
    count = random.randint(5, 35)
    
    # Determine crowd level
    if count <= 20:
        crowd_level = 'LOW'
    elif count <= 50:
        crowd_level = 'MODERATE'
    elif count <= 100:
        crowd_level = 'HIGH'
    else:
        crowd_level = 'CRITICAL'
    
    # Generate alerts if threshold exceeded
    alerts = []
    if count > threshold:
        alerts.append({
            'type': 'threshold_exceeded',
            'message': f'Crowd threshold exceeded: {count} people detected (threshold: {threshold})',
            'level': crowd_level,
            'timestamp': datetime.now().isoformat()
        })
    
    density = count / 100.0  # Mock density
    
    return {
        'count': count,
        'crowd_level': crowd_level,
        'density': density,
        'alerts': alerts,
        'timestamp': datetime.now().isoformat(),
        'detections': [
            {'bbox': [100 + i*50, 100, 150 + i*50, 200], 'confidence': 0.85 + random.random() * 0.10}
            for i in range(min(count, 10))  # Show up to 10 boxes
        ]
    }

@app.route('/api/yolo/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'message': 'YOLO Crowd Detection Service is running (Mock Mode - Video 3)',
        'zones_active': 1,
        'zones_configured': 1,
        'mode': 'mock_data'
    })

@app.route('/api/yolo/zones')
def get_zones():
    """Get all zones - Only Zone 1 active with Video 3"""
    return jsonify({
        'zones': [
            {
                'id': 'zone1',
                'name': 'Main Entrance - Video 3',
                'status': 'active',
                'threshold': 21,
                'video': 'temple_crowd_3.mp4'
            }
        ]
    })

@app.route('/api/yolo/live/<zone_id>')
def get_live_frame(zone_id):
    """Get live frame with detection (mock data)"""
    zones = {
        'zone1': 'Main Entrance - Video 3'
    }
    
    if zone_id not in zones:
        return jsonify({'error': f'Zone {zone_id} not found. Only zone1 is active.'}), 404
    
    zone_name = zones[zone_id]
    threshold = 21
    
    # Generate mock detection
    analysis = generate_mock_detection(zone_id, zone_name, threshold)
    
    return jsonify({
        'zone_id': zone_id,
        'zone_name': zone_name,
        'frame': '',  # Empty frame (mock mode)
        'analysis': analysis,
        'timestamp': datetime.now().isoformat(),
        'mode': 'mock_data',
        'note': 'Using mock data due to video encoding issues'
    })

@app.route('/api/yolo/alerts')
def get_alerts():
    """Get all current alerts - Only Zone 1"""
    alerts = []
    
    zones = [
        {'id': 'zone1', 'name': 'Main Entrance - Video 3'}
    ]
    
    for zone in zones:
        count = random.randint(5, 35)
        threshold = 21
        
        if count > threshold:
            crowd_level = 'MODERATE' if count <= 30 else 'HIGH'
            alerts.append({
                'zone_id': zone['id'],
                'zone_name': zone['name'],
                'count': count,
                'threshold': threshold,
                'level': crowd_level,
                'message': f'Crowd threshold exceeded at {zone["name"]}',
                'timestamp': datetime.now().isoformat()
            })
    
    return jsonify({
        'alerts': alerts,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/yolo/status')
def get_status():
    """Get status of all zones - Only Zone 1"""
    zones_status = []
    
    for zone_id in ['zone1']:
        zone_names = {
            'zone1': 'Main Entrance - Video 3'
        }
        
        count = random.randint(5, 35)
        zones_status.append({
            'zone_id': zone_id,
            'zone_name': zone_names[zone_id],
            'status': 'active',
            'current_count': count,
            'threshold': 21,
            'alert_active': count > 21
        })
    
    return jsonify({
        'zones': zones_status,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("\n" + "="*70)
    print("🚀 TRINETRA - YOLO MOCK SERVICE (Stable)")
    print("="*70)
    print("\n⚠️  Running in MOCK MODE")
    print("   Reason: Video encoding issues with provided MP4 files")
    print("   Solution: Generating realistic mock detection data\n")
    print("📡 Server starting on http://0.0.0.0:5002\n")
    print("📋 Configuration:")
    print("   • Alert Threshold: 21 people")
    print("   • All 3 zones active")
    print("   • Mock crowd counts: 5-35 people")
    print("   • Alerts trigger when count > 21\n")
    print("✨ Ready to generate alerts!\n")
    print("="*70 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5002,
        debug=False,
        threaded=True,
        use_reloader=False
    )

