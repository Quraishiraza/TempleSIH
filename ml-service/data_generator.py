import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

class CrowdDataGenerator:
    """Generate realistic synthetic crowd data for temples"""
    
    def __init__(self):
        # Temple base capacities and avg daily visitors
        self.temples = {
            "1": {"name": "Somnath Temple", "base_visitors": 3500, "special_day": "Monday"},
            "2": {"name": "Dwarkadhish Temple", "base_visitors": 3200, "special_day": "Thursday"},
            "3": {"name": "Ambaji Temple", "base_visitors": 2800, "special_day": "Tuesday"},
            "4": {"name": "Pavagadh Temple", "base_visitors": 2500, "special_day": "Friday"}
        }
        
        # Load festivals data
        script_dir = os.path.dirname(os.path.abspath(__file__))
        festivals_path = os.path.join(script_dir, 'data', 'festivals.json')
        with open(festivals_path, 'r') as f:
            self.festivals = json.load(f)
    
    def get_seasonal_factor(self, date):
        """Get seasonal multiplier based on month"""
        month = date.month
        if month in [1, 2, 12]:  # Winter - Pleasant weather
            return 1.3
        elif month in [3, 4, 5]:  # Summer - Hot
            return 0.85
        elif month in [6, 7, 8, 9]:  # Monsoon - Rainy
            return 0.7
        else:  # Oct-Nov - Festival season
            return 1.5
    
    def get_weekday_factor(self, date, temple_id):
        """Get weekday multiplier"""
        weekday = date.strftime('%A')
        temple_info = self.temples[temple_id]
        
        # Weekend boost
        if weekday in ['Saturday', 'Sunday']:
            return 1.4
        # Special day for specific temple (e.g., Monday for Shiva)
        elif weekday == temple_info['special_day']:
            return 1.3
        # Friday is generally good for temples
        elif weekday == 'Friday':
            return 1.2
        # Weekdays
        else:
            return 0.85
    
    def get_festival_factor(self, date, temple_id):
        """Check if date is a festival and return impact"""
        year = str(date.year)
        if year not in self.festivals:
            return 1.0, None
        
        for festival in self.festivals[year]:
            festival_date = datetime.strptime(festival['date'], '%Y-%m-%d').date()
            
            # Check for multi-day festivals (like Navratri)
            duration = festival.get('duration', 1)
            festival_end = festival_date + timedelta(days=duration - 1)
            
            if festival_date <= date <= festival_end:
                # Check if festival is temple-specific
                if 'temples' in festival and temple_id not in festival['temples']:
                    return festival['impact'] * 0.5, festival['name']  # Partial impact
                return festival['impact'], festival['name']
        
        return 1.0, None
    
    def get_weather_factor(self):
        """Random weather impact"""
        weather_types = {
            'Sunny': 1.0,
            'Partly Cloudy': 1.05,
            'Cloudy': 0.95,
            'Light Rain': 0.8,
            'Heavy Rain': 0.5,
            'Pleasant': 1.15
        }
        weather = np.random.choice(list(weather_types.keys()), 
                                   p=[0.4, 0.25, 0.15, 0.1, 0.05, 0.05])
        return weather_types[weather], weather
    
    def get_holiday_factor(self, date):
        """Check if it's a holiday"""
        # Republic Day, Independence Day, Gandhi Jayanti
        if (date.month == 1 and date.day == 26) or \
           (date.month == 8 and date.day == 15) or \
           (date.month == 10 and date.day == 2):
            return 1.4, True
        
        # Gujarat Day
        if date.month == 5 and date.day == 1:
            return 1.5, True
        
        return 1.0, False
    
    def get_growth_factor(self, date, start_date):
        """Simulate year-over-year growth"""
        days_since_start = (date - start_date).days
        years_elapsed = days_since_start / 365.25
        # 8% annual growth with recent surge (15% in last 6 months)
        base_growth = 1 + (0.08 * years_elapsed)
        
        # Recent surge (making the problem more urgent!)
        if years_elapsed > 2.5:  # Last 6 months
            surge_factor = 1.15
        else:
            surge_factor = 1.0
        
        return base_growth * surge_factor
    
    def generate_hourly_distribution(self, total_visitors):
        """Generate realistic hourly distribution"""
        # Peak hours: 6-9 AM (35%), 4-7 PM (40%)
        distribution = {
            '4-6 AM': int(total_visitors * 0.12),
            '6-9 AM': int(total_visitors * 0.35),
            '9-12 PM': int(total_visitors * 0.20),
            '12-4 PM': int(total_visitors * 0.08),
            '4-7 PM': int(total_visitors * 0.40),
            '7-10 PM': int(total_visitors * 0.25)
        }
        
        # Adjust to match total
        current_sum = sum(distribution.values())
        if current_sum != total_visitors:
            distribution['6-9 AM'] += (total_visitors - current_sum)
        
        return distribution
    
    def generate_data(self, start_date, end_date, temple_id):
        """Generate crowd data for a temple"""
        data = []
        current_date = start_date
        temple_info = self.temples[temple_id]
        base_visitors = temple_info['base_visitors']
        
        while current_date <= end_date:
            # Calculate all factors
            seasonal = self.get_seasonal_factor(current_date)
            weekday = self.get_weekday_factor(current_date, temple_id)
            festival, festival_name = self.get_festival_factor(current_date, temple_id)
            weather, weather_type = self.get_weather_factor()
            holiday, is_holiday = self.get_holiday_factor(current_date)
            growth = self.get_growth_factor(current_date, start_date)
            
            # Random noise (±10%)
            noise = np.random.uniform(0.9, 1.1)
            
            # Calculate total visitors
            visitors = int(base_visitors * seasonal * weekday * festival * 
                          weather * holiday * growth * noise)
            
            # Ensure minimum visitors
            visitors = max(visitors, int(base_visitors * 0.3))
            
            # Generate hourly distribution
            hourly = self.generate_hourly_distribution(visitors)
            
            # Calculate occupancy percentage (assuming max capacity)
            max_capacity = temple_info['base_visitors'] * 1.5
            occupancy = min(100, int((visitors / max_capacity) * 100))
            
            # Determine crowd level
            if occupancy < 50:
                crowd_level = 'low'
            elif occupancy < 75:
                crowd_level = 'moderate'
            else:
                crowd_level = 'high'
            
            data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'temple_id': temple_id,
                'temple_name': temple_info['name'],
                'visitor_count': visitors,
                'occupancy_percentage': occupancy,
                'crowd_level': crowd_level,
                'day_of_week': current_date.strftime('%A'),
                'is_weekend': current_date.weekday() >= 5,
                'is_holiday': is_holiday,
                'festival_name': festival_name if festival_name else 'None',
                'is_festival': festival_name is not None,
                'weather': weather_type,
                'temperature': int(np.random.uniform(20, 38)),  # Celsius
                'season': self.get_season_name(current_date),
                'hourly_distribution': hourly,
                'factors': {
                    'seasonal': round(seasonal, 2),
                    'weekday': round(weekday, 2),
                    'festival': round(festival, 2),
                    'weather': round(weather, 2),
                    'holiday': round(holiday, 2),
                    'growth': round(growth, 2)
                }
            })
            
            current_date += timedelta(days=1)
        
        return data
    
    def get_season_name(self, date):
        """Get season name"""
        month = date.month
        if month in [1, 2, 12]:
            return 'Winter'
        elif month in [3, 4, 5]:
            return 'Summer'
        elif month in [6, 7, 8, 9]:
            return 'Monsoon'
        else:
            return 'Autumn'
    
    def generate_all_temples(self, start_date_str='2022-01-01', end_date_str='2024-12-31'):
        """Generate data for all temples"""
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        all_data = []
        
        print("🎯 Generating realistic crowd data...")
        print(f"📅 Date Range: {start_date} to {end_date}")
        print(f"🏛️ Temples: {len(self.temples)}")
        
        for temple_id, temple_info in self.temples.items():
            print(f"\n⏳ Generating data for {temple_info['name']}...")
            temple_data = self.generate_data(start_date, end_date, temple_id)
            all_data.extend(temple_data)
            print(f"✅ Generated {len(temple_data)} days of data")
        
        # Convert to DataFrame
        df = pd.DataFrame(all_data)
        
        # Save to CSV
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, 'data', 'historical_data.csv')
        df.to_csv(output_path, index=False)
        
        print(f"\n🎉 Total records generated: {len(all_data)}")
        print(f"💾 Saved to: {output_path}")
        
        # Print summary statistics
        print("\n📊 Summary Statistics:")
        print(df.groupby('temple_name')['visitor_count'].describe())
        
        return df

if __name__ == '__main__':
    generator = CrowdDataGenerator()
    df = generator.generate_all_temples()
    print("\n✅ Data generation complete!")

