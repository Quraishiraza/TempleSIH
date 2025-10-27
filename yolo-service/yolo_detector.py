import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import config

class CrowdDetector:
    def __init__(self, model_path=None):
        """Initialize YOLO detector for crowd analysis"""
        if model_path is None:
            model_path = config.YOLO_MODEL
        
        print(f"🔄 Loading YOLO model: {model_path}")
        self.model = YOLO(model_path)
        print(f"✅ YOLO model loaded successfully")
        
        self.confidence_threshold = config.CONFIDENCE_THRESHOLD
        self.person_class_id = 0  # COCO dataset: person = 0
        
    def detect_people(self, frame):
        """
        Detect people in a frame
        Returns: list of detections with bounding boxes
        """
        results = self.model(
            frame,
            conf=self.confidence_threshold,
            iou=config.IOU_THRESHOLD,
            classes=[self.person_class_id],  # Only detect persons
            verbose=False,
            imgsz=416,  # Much smaller for faster processing (was 640)
            half=False,  # Use FP32 for better accuracy
            max_det=300,  # Allow up to 300 detections for large crowds
            agnostic_nms=True  # Better for dense crowds
        )
        
        detections = []
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                confidence = float(box.conf[0])
                
                detections.append({
                    'bbox': [int(x1), int(y1), int(x2), int(y2)],
                    'confidence': confidence,
                    'class': 'person'
                })
        
        return detections
    
    def count_people(self, detections):
        """Count number of people detected"""
        return len(detections)
    
    def get_crowd_level(self, count):
        """Determine crowd level based on count"""
        for level, (min_count, max_count) in config.CROWD_LEVELS.items():
            if min_count <= count < max_count:
                return level
        return 'CRITICAL'
    
    def calculate_density(self, detections, frame_shape):
        """Calculate crowd density (people per square meter - approximation)"""
        if len(detections) == 0:
            return 0.0
        
        height, width = frame_shape[:2]
        frame_area = (width * height) / 10000  # Convert to approximate square meters
        density = len(detections) / frame_area
        return round(density, 2)
    
    def generate_heatmap(self, frame, detections):
        """Generate crowd density heatmap"""
        height, width = frame.shape[:2]
        heatmap = np.zeros((height, width), dtype=np.float32)
        
        # Create heat around each detection
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            
            # Create circular heat
            cv2.circle(heatmap, (center_x, center_y), 50, 1.0, -1)
        
        # Normalize and apply colormap
        if heatmap.max() > 0:
            heatmap = (heatmap / heatmap.max() * 255).astype(np.uint8)
            heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
            
            # Blend with original frame
            output = cv2.addWeighted(frame, 0.6, heatmap_colored, 0.4, 0)
            return output
        
        return frame
    
    def draw_detections(self, frame, detections, count, crowd_level):
        """Draw bounding boxes and info on frame"""
        output = frame.copy()
        
        # Color based on crowd level
        if crowd_level == 'CRITICAL':
            box_color = config.COLORS['alert']
        elif crowd_level == 'HIGH':
            box_color = config.COLORS['warning']
        else:
            box_color = config.COLORS['person']
        
        # Draw bounding boxes (simplified for speed)
        for idx, det in enumerate(detections):
            x1, y1, x2, y2 = det['bbox']
            
            # Draw box (thinner for speed)
            cv2.rectangle(output, (x1, y1), (x2, y2), box_color, 1)
            
            # Only draw confidence for first 20 detections (speed optimization)
            if idx < 20:
                confidence = det['confidence']
                label = f"{confidence:.2f}"
                cv2.putText(output, label, (x1, y1 - 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, box_color, 1)
        
        # Draw info panel
        panel_height = 120
        panel = np.zeros((panel_height, output.shape[1], 3), dtype=np.uint8)
        panel[:] = (0, 0, 0)
        
        # Add text info
        texts = [
            f"People Count: {count}",
            f"Crowd Level: {crowd_level}",
            f"Status: {'ALERT!' if count > config.ALERT_THRESHOLD else 'Normal'}",
            f"Time: {datetime.now().strftime('%H:%M:%S')}"
        ]
        
        y_offset = 25
        for text in texts:
            color = config.COLORS['alert'] if 'ALERT' in text else config.COLORS['text']
            cv2.putText(panel, text, (10, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            y_offset += 25
        
        # Combine panel with frame
        output = np.vstack([panel, output])
        
        return output
    
    def check_alerts(self, count, zone_threshold=None):
        """Check if alerts should be triggered"""
        threshold = zone_threshold if zone_threshold else config.ALERT_THRESHOLD
        
        alerts = []
        
        if count > config.CRITICAL_THRESHOLD:
            alerts.append({
                'level': 'CRITICAL',
                'message': f'Critical crowd level detected: {count} people',
                'count': count,
                'timestamp': datetime.now().isoformat()
            })
        elif count > threshold:
            alerts.append({
                'level': 'HIGH',
                'message': f'High crowd alert: {count} people',
                'count': count,
                'timestamp': datetime.now().isoformat()
            })
        
        return alerts
    
    def process_frame(self, frame, zone_threshold=None, draw=True, heatmap=False):
        """
        Complete frame processing pipeline
        Returns: processed frame and analysis data
        """
        # Detect people
        detections = self.detect_people(frame)
        count = self.count_people(detections)
        crowd_level = self.get_crowd_level(count)
        density = self.calculate_density(detections, frame.shape)
        alerts = self.check_alerts(count, zone_threshold)
        
        # Generate output frame
        output_frame = frame
        if heatmap:
            output_frame = self.generate_heatmap(frame, detections)
        if draw:
            output_frame = self.draw_detections(output_frame, detections, count, crowd_level)
        
        # Analysis data
        analysis = {
            'count': count,
            'crowd_level': crowd_level,
            'density': density,
            'detections': len(detections),
            'alerts': alerts,
            'timestamp': datetime.now().isoformat()
        }
        
        return output_frame, analysis

