import cv2
import os
import base64
from datetime import datetime
import config
from yolo_detector import CrowdDetector

class VideoProcessor:
    def __init__(self, video_path=None, zone_config=None):
        """Initialize video processor"""
        self.video_path = video_path
        self.zone_config = zone_config
        self.detector = CrowdDetector()
        self.cap = None
        self.frame_count = 0
        self.analytics_history = []
        self.frame_skip = 0  # Skip counter for faster playback
        self.skip_rate = 1  # Disabled frame skipping for stability
        
    def open_video(self, video_path=None):
        """Open video file or camera"""
        if video_path:
            self.video_path = video_path
        
        if not self.video_path:
            raise ValueError("No video source specified")
        
        # Check if file exists
        full_path = os.path.join(config.VIDEOS_DIR, self.video_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Video file not found: {full_path}")
        
        # Use FFMPEG backend for better compatibility with different video formats
        self.cap = cv2.VideoCapture(full_path, cv2.CAP_FFMPEG)
        if not self.cap.isOpened():
            # Fallback to default backend
            self.cap = cv2.VideoCapture(full_path)
        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open video: {full_path}")
        
        # Set buffer size to reduce lag
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        self.frame_count = 0
        print(f"✅ Video opened: {self.video_path}")
        
        return {
            'fps': int(self.cap.get(cv2.CAP_PROP_FPS)),
            'width': int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            'height': int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            'total_frames': int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        }
    
    def read_frame(self):
        """Read next frame from video"""
        if self.cap is None or not self.cap.isOpened():
            return None, False
        
        ret, frame = self.cap.read()
        if ret:
            self.frame_count += 1
        
        return frame, ret
    
    def process_video(self, max_frames=None, skip_frames=1, heatmap=False):
        """
        Process entire video and return analytics
        """
        if self.cap is None:
            self.open_video()
        
        max_frames = max_frames or config.MAX_FRAMES_TO_PROCESS
        analytics_data = []
        
        frame_num = 0
        while True:
            ret, frame = self.cap.read()
            if not ret or frame_num >= max_frames:
                break
            
            # Skip frames for efficiency
            if frame_num % skip_frames != 0:
                frame_num += 1
                continue
            
            # Process frame
            zone_threshold = self.zone_config.get('threshold') if self.zone_config else None
            processed_frame, analysis = self.detector.process_frame(
                frame,
                zone_threshold=zone_threshold,
                draw=False,
                heatmap=heatmap
            )
            
            analysis['frame_number'] = frame_num
            analytics_data.append(analysis)
            
            frame_num += 1
        
        self.analytics_history = analytics_data
        return analytics_data
    
    def get_single_frame_analysis(self, frame_number=None, heatmap=False):
        """
        Get analysis for a single frame
        """
        if self.cap is None:
            self.open_video()
        
        # If frame_number specified, seek to it
        if frame_number is not None:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        
        ret, frame = self.cap.read()
        if not ret:
            return None
        
        # Resize frame for faster processing (maintain aspect ratio)
        height, width = frame.shape[:2]
        if width > 960:  # Even smaller for speed
            scale = 960 / width
            frame = cv2.resize(frame, (960, int(height * scale)), interpolation=cv2.INTER_LINEAR)
        
        zone_threshold = self.zone_config.get('threshold') if self.zone_config else None
        processed_frame, analysis = self.detector.process_frame(
            frame,
            zone_threshold=zone_threshold,
            draw=True,
            heatmap=heatmap
        )
        
        # Convert frame to base64 for API response (with high compression for speed)
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 60]  # Lower quality for faster transmission
        _, buffer = cv2.imencode('.jpg', processed_frame, encode_param)
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            'frame': frame_base64,
            'analysis': analysis,
            'frame_number': frame_number or self.frame_count
        }
    
    def simulate_live_feed(self, callback=None, fps=10):
        """
        Simulate live camera feed by looping video
        """
        if self.cap is None:
            self.open_video()
        
        import time
        frame_delay = 1.0 / fps
        
        while True:
            ret, frame = self.cap.read()
            
            # Loop video when it ends
            if not ret:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
                if not ret:
                    break
            
            # Process frame
            zone_threshold = self.zone_config.get('threshold') if self.zone_config else None
            processed_frame, analysis = self.detector.process_frame(
                frame,
                zone_threshold=zone_threshold,
                draw=True,
                heatmap=False
            )
            
            # Convert to base64
            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            result = {
                'frame': frame_base64,
                'analysis': analysis,
                'timestamp': datetime.now().isoformat()
            }
            
            if callback:
                callback(result)
            
            time.sleep(frame_delay)
    
    def get_analytics_summary(self):
        """Get summary of analytics from processing"""
        if not self.analytics_history:
            return None
        
        counts = [a['count'] for a in self.analytics_history]
        alerts = [a for a in self.analytics_history if a['alerts']]
        
        return {
            'total_frames': len(self.analytics_history),
            'avg_count': round(sum(counts) / len(counts), 1),
            'max_count': max(counts),
            'min_count': min(counts),
            'peak_frame': counts.index(max(counts)),
            'total_alerts': len(alerts),
            'crowd_distribution': {
                'LOW': len([c for c in counts if c < 20]),
                'MODERATE': len([c for c in counts if 20 <= c < 50]),
                'HIGH': len([c for c in counts if 50 <= c < 100]),
                'CRITICAL': len([c for c in counts if c >= 100])
            }
        }
    
    def close(self):
        """Release video capture"""
        if self.cap is not None:
            self.cap.release()
            self.cap = None
            print("🔒 Video capture released")
    
    def __del__(self):
        """Cleanup"""
        self.close()

