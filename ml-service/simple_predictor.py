"""
Simplified crowd predictor for demo purposes
Uses statistical patterns instead of Prophet to avoid complexity
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

class SimpleCrowdPredictor:
    """Simple statistical crowd predictor"""
    
    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(self.script_dir, 'data')
        
        # Load historical data
        data_path = os.path.join(self.data_dir, 'historical_data.csv')
        self.df = pd.read_csv(data_path)
        self.df['date'] = pd.to_datetime(self.df['date'])
        
        # Load festivals
        festivals_path = os.path.join(self.data_dir, 'festivals.json')
        with open(festivals_path, 'r') as f:
            self.festivals = json.load(f)
    
    def get_historical_average(self, temple_id, day_of_week, is_weekend):
        """Get average visitors for similar days"""
        temple_data = self.df[self.df['temple_id'] == int(temple_id)]
        
        # Filter by day type
        similar_days = temple_data[temple_data['is_weekend'] == is_weekend]
        
        if len(similar_days) > 10:
            return similar_days['visitor_count'].mean()
        else:
            return temple_data['visitor_count'].mean()
    
    def check_festival(self, date):
        """Check if date has a festival"""
        year_str = str(date.year)
        if year_str not in self.festivals:
            return None, 1.0
        
        for festival in self.festivals[year_str]:
            festival_date = datetime.strptime(festival['date'], '%Y-%m-%d').date()
            duration = festival.get('duration', 1)
            festival_end = festival_date + timedelta(days=duration - 1)
            
            if festival_date <= date <= festival_end:
                return festival['name'], festival['impact']
        
        return None, 1.0
    
    def predict(self, temple_id, days_ahead=7):
        """Generate predictions for next N days"""
        predictions = []
        today = datetime.now().date()
        
        for i in range(1, days_ahead + 1):
            future_date = today + timedelta(days=i)
            day_of_week = future_date.strftime('%A')
            is_weekend = future_date.weekday() >= 5
            is_holiday = self.is_holiday(future_date)
            
            # Get base prediction from historical average
            base_visitors = self.get_historical_average(temple_id, day_of_week, is_weekend)
            
            # Check for festival
            festival_name, festival_impact = self.check_festival(future_date)
            is_festival = festival_name is not None
            
            # Apply modifiers
            visitors = base_visitors * festival_impact
            
            if is_holiday and not is_festival:
                visitors *= 1.3
            
            # Add random noise (±5%)
            visitors *= np.random.uniform(0.95, 1.05)
            visitors = int(visitors)
            
            # Calculate occupancy
            max_capacity = base_visitors * 1.5
            occupancy = min(100, int((visitors / max_capacity) * 100))
            
            # Determine crowd level
            if occupancy < 50:
                crowd_level = 'low'
            elif occupancy < 75:
                crowd_level = 'moderate'
            else:
                crowd_level = 'high'
            
            # Confidence interval (±15%)
            lower_bound = int(visitors * 0.85)
            upper_bound = int(visitors * 1.15)
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'day_of_week': day_of_week,
                'predicted_visitors': visitors,
                'confidence_interval': {
                    'lower': lower_bound,
                    'upper': upper_bound
                },
                'occupancy_percentage': occupancy,
                'crowd_level': crowd_level,
                'is_weekend': is_weekend,
                'is_festival': is_festival,
                'festival_name': festival_name if festival_name else 'None',
                'is_holiday': is_holiday
            })
        
        # Identify peak days
        peak_days = sorted(predictions, key=lambda x: x['predicted_visitors'], reverse=True)[:3]
        peak_dates = [p['date'] for p in peak_days]
        
        # Best visit recommendations
        best_times = self.get_best_visit_times(predictions)
        
        return {
            'temple_id': temple_id,
            'predictions': predictions,
            'peak_days': peak_dates,
            'best_visit_times': best_times,
            'generated_at': datetime.now().isoformat(),
            'model_type': 'statistical_average'
        }
    
    def is_holiday(self, date):
        """Check if date is a holiday"""
        return (
            (date.month == 1 and date.day == 26) or  # Republic Day
            (date.month == 8 and date.day == 15) or  # Independence Day
            (date.month == 10 and date.day == 2) or  # Gandhi Jayanti
            (date.month == 5 and date.day == 1)      # Gujarat Day
        )
    
    def get_best_visit_times(self, predictions):
        """Recommend best times to visit"""
        if not predictions:
            return [
                "Morning 6-8 AM (Recommended)",
                "Avoid peak hours 4-7 PM",
                "Book in advance"
            ]
        
        # Find days with low crowd
        low_crowd_days = [p for p in predictions if p['crowd_level'] == 'low']
        
        if low_crowd_days:
            best_day = low_crowd_days[0]
            return [
                f"{best_day['day_of_week']}, {best_day['date']} (Low crowd expected)",
                "Morning 6-8 AM (Least crowded)",
                "Avoid afternoon 12-4 PM"
            ]
        else:
            # Find least crowded day
            sorted_days = sorted(predictions, key=lambda x: x['predicted_visitors'])
            if sorted_days:
                best_day = sorted_days[0]
                return [
                    f"{best_day['day_of_week']}, {best_day['date']} (Best option - {best_day['crowd_level']} crowd)",
                    "Early morning 4-6 AM (Recommended)",
                    "Avoid weekends if possible"
                ]
            else:
                return [
                    "Morning 6-8 AM (Recommended)",
                    "Avoid peak hours 4-7 PM",
                    "Book in advance"
                ]
    
    def batch_predict(self, days_ahead=7):
        """Get predictions for all temples"""
        all_predictions = {}
        temple_ids = ['1', '2', '3', '4']
        
        for temple_id in temple_ids:
            all_predictions[temple_id] = self.predict(temple_id, days_ahead)
        
        return all_predictions

if __name__ == '__main__':
    print("🔮 Simple Crowd Predictor")
    predictor = SimpleCrowdPredictor()
    
    print("\n📊 Generating predictions for Temple 1...")
    predictions = predictor.predict('1', days_ahead=7)
    
    print(f"✅ Generated {len(predictions['predictions'])} predictions")
    print(f"📈 Peak days: {predictions['peak_days']}")
    print(f"💡 Best times: {predictions['best_visit_times']}")
    
    print("\n📋 First 3 predictions:")
    for pred in predictions['predictions'][:3]:
        print(f"  {pred['date']} ({pred['day_of_week']}): {pred['predicted_visitors']} visitors - {pred['crowd_level'].upper()}")

