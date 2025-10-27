from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import cv2
import base64
import config
from video_processor import VideoProcessor
from yolo_detector import CrowdDetector

app = Flask(__name__)
CORS(app)

# Store video processors for each zone
processors = {}

def initialize_zones():
    """Initialize video processors for all zones"""
    print("\n🔄 Initializing YOLO Crowd Detection System...")
    
    for zone in config.TEMPLE_ZONES:
        zone_id = zone['id']
        video_file = zone['video']
        video_path = os.path.join(config.VIDEOS_DIR, video_file)
        
        if os.path.exists(video_path):
            try:
                processor = VideoProcessor(video_file, zone)
                processor.open_video()
                processors[zone_id] = processor
                print(f"  ✅ Zone '{zone['name']}' initialized")
            except Exception as e:
                print(f"  ⚠️  Zone '{zone['name']}' failed: {e}")
        else:
            print(f"  ⚠️  Video not found for zone '{zone['name']}': {video_file}")
    
    print(f"\n✨ {len(processors)} zone(s) ready for monitoring\n")

# Health check
@app.route('/api/yolo/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'YOLO Crowd Detection Service is running',
        'zones_active': len(processors),
        'zones_configured': len(config.TEMPLE_ZONES)
    })

# Get all zones info
@app.route('/api/yolo/zones', methods=['GET'])
def get_zones():
    zones_info = []
    for zone in config.TEMPLE_ZONES:
        zone_id = zone['id']
        is_active = zone_id in processors
        
        zones_info.append({
            'id': zone_id,
            'name': zone['name'],
            'video': zone['video'],
            'threshold': zone['threshold'],
            'status': 'active' if is_active else 'inactive'
        })
    
    return jsonify({'zones': zones_info})

# Get current frame analysis for a zone
@app.route('/api/yolo/analyze/<zone_id>', methods=['GET'])
def analyze_zone(zone_id):
    if zone_id not in processors:
        return jsonify({'error': f'Zone {zone_id} not found or inactive'}), 404
    
    try:
        heatmap = request.args.get('heatmap', 'false').lower() == 'true'
        result = processors[zone_id].get_single_frame_analysis(heatmap=heatmap)
        
        if result is None:
            # Video ended, restart from beginning
            processors[zone_id].open_video()
            result = processors[zone_id].get_single_frame_analysis(heatmap=heatmap)
        
        return jsonify({
            'zone_id': zone_id,
            'zone_name': next((z['name'] for z in config.TEMPLE_ZONES if z['id'] == zone_id), 'Unknown'),
            **result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Process entire video for a zone
@app.route('/api/yolo/process/<zone_id>', methods=['POST'])
def process_zone_video(zone_id):
    if zone_id not in processors:
        return jsonify({'error': f'Zone {zone_id} not found or inactive'}), 404
    
    try:
        data = request.json or {}
        max_frames = data.get('max_frames', 100)
        skip_frames = data.get('skip_frames', 5)
        
        # Reset video to beginning
        processors[zone_id].open_video()
        
        # Process video
        analytics = processors[zone_id].process_video(
            max_frames=max_frames,
            skip_frames=skip_frames
        )
        
        # Get summary
        summary = processors[zone_id].get_analytics_summary()
        
        return jsonify({
            'zone_id': zone_id,
            'zone_name': next((z['name'] for z in config.TEMPLE_ZONES if z['id'] == zone_id), 'Unknown'),
            'analytics': analytics,
            'summary': summary
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get analytics summary for a zone
@app.route('/api/yolo/summary/<zone_id>', methods=['GET'])
def get_zone_summary(zone_id):
    if zone_id not in processors:
        return jsonify({'error': f'Zone {zone_id} not found or inactive'}), 404
    
    try:
        summary = processors[zone_id].get_analytics_summary()
        
        if summary is None:
            # Process video first
            processors[zone_id].open_video()
            processors[zone_id].process_video(max_frames=100, skip_frames=5)
            summary = processors[zone_id].get_analytics_summary()
        
        return jsonify({
            'zone_id': zone_id,
            'zone_name': next((z['name'] for z in config.TEMPLE_ZONES if z['id'] == zone_id), 'Unknown'),
            'summary': summary
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get all zones current status
@app.route('/api/yolo/status', methods=['GET'])
def get_all_status():
    statuses = []
    
    for zone in config.TEMPLE_ZONES:
        zone_id = zone['id']
        if zone_id in processors:
            try:
                result = processors[zone_id].get_single_frame_analysis(heatmap=False)
                if result:
                    statuses.append({
                        'zone_id': zone_id,
                        'zone_name': zone['name'],
                        'count': result['analysis']['count'],
                        'crowd_level': result['analysis']['crowd_level'],
                        'alerts': result['analysis']['alerts'],
                        'timestamp': result['analysis']['timestamp']
                    })
            except Exception as e:
                print(f"Error getting status for {zone_id}: {e}")
    
    return jsonify({'zones': statuses})

# Check for alerts across all zones
@app.route('/api/yolo/alerts', methods=['GET'])
def check_alerts():
    alerts = []
    
    for zone in config.TEMPLE_ZONES:
        zone_id = zone['id']
        if zone_id in processors:
            try:
                result = processors[zone_id].get_single_frame_analysis(heatmap=False)
                if result and result['analysis']['alerts']:
                    for alert in result['analysis']['alerts']:
                        alerts.append({
                            'zone_id': zone_id,
                            'zone_name': zone['name'],
                            **alert
                        })
            except Exception as e:
                print(f"Error checking alerts for {zone_id}: {e}")
    
    return jsonify({
        'total_alerts': len(alerts),
        'alerts': alerts
    })

# Simulate live feed for a zone (returns latest frame)
@app.route('/api/yolo/live/<zone_id>', methods=['GET'])
def get_live_frame(zone_id):
    """Get latest frame from simulated live feed"""
    if zone_id not in processors:
        return jsonify({'error': f'Zone {zone_id} not found or inactive'}), 404
    
    try:
        # Read next frame
        frame, ret = processors[zone_id].read_frame()
        
        # If video ended, loop back to start
        if not ret:
            processors[zone_id].open_video()
            frame, ret = processors[zone_id].read_frame()
        
        if not ret or frame is None:
            return jsonify({'error': 'Failed to read frame'}), 500
        
        # Resize frame for faster processing
        height, width = frame.shape[:2]
        if width > 960:  # Smaller for faster processing
            scale = 960 / width
            frame = cv2.resize(frame, (960, int(height * scale)), interpolation=cv2.INTER_LINEAR)
        
        # Process frame
        zone_config = next((z for z in config.TEMPLE_ZONES if z['id'] == zone_id), None)
        zone_threshold = zone_config['threshold'] if zone_config else None
        
        processed_frame, analysis = processors[zone_id].detector.process_frame(
            frame,
            zone_threshold=zone_threshold,
            draw=True,
            heatmap=False
        )
        
        # Convert to base64 with high compression
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 60]  # High compression for speed
        _, buffer = cv2.imencode('.jpg', processed_frame, encode_param)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'zone_id': zone_id,
            'zone_name': zone_config['name'] if zone_config else 'Unknown',
            'frame': frame_base64,
            'analysis': analysis
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 TRINETRA - YOLO CROWD DETECTION SERVICE")
    print("=" * 70)
    
    # Initialize zones
    initialize_zones()
    
    print(f"📡 Server starting on http://{config.API_HOST}:{config.API_PORT}")
    print("\n📋 Available Endpoints:")
    print("   GET  /api/yolo/health         - Health check")
    print("   GET  /api/yolo/zones          - List all zones")
    print("   GET  /api/yolo/analyze/<zone> - Analyze single frame")
    print("   POST /api/yolo/process/<zone> - Process entire video")
    print("   GET  /api/yolo/summary/<zone> - Get analytics summary")
    print("   GET  /api/yolo/status         - Get all zones status")
    print("   GET  /api/yolo/alerts         - Check all alerts")
    print("   GET  /api/yolo/live/<zone>    - Get live frame")
    print("\n✨ Ready to detect crowds!\n")
    print("=" * 70)
    
    # Disable debug mode and reloader to prevent OpenCV threading crashes
    app.run(
        host=config.API_HOST,
        port=config.API_PORT,
        debug=False,
        threaded=True,
        use_reloader=False
    )

