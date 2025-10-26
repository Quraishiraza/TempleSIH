import pandas as pd
import numpy as np
from prophet import Prophet
import joblib
import os
import json
from datetime import datetime, timedelta

class CrowdPredictor:
    """Prophet-based crowd prediction model"""
    
    def __init__(self):
        self.models = {}  # Store models for each temple
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.models_dir = os.path.join(self.script_dir, 'trained_models')
        self.data_dir = os.path.join(self.script_dir, 'data')
        
        # Create directories if they don't exist
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Load festivals for future predictions
        festivals_path = os.path.join(self.data_dir, 'festivals.json')
        with open(festivals_path, 'r') as f:
            self.festivals = json.load(f)
    
    def load_data(self):
        """Load historical data"""
        data_path = os.path.join(self.data_dir, 'historical_data.csv')
        
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Historical data not found at {data_path}")
        
        df = pd.read_csv(data_path)
        df['date'] = pd.to_datetime(df['date'])
        return df
    
    def prepare_prophet_data(self, df, temple_id):
        """Prepare data in Prophet format (ds, y)"""
        # Convert temple_id to int for comparison
        temple_id_int = int(temple_id)
        temple_data = df[df['temple_id'] == temple_id_int].copy()
        
        # Prophet requires 'ds' (datestamp) and 'y' (value) columns
        prophet_df = pd.DataFrame({
            'ds': temple_data['date'],
            'y': temple_data['visitor_count']
        })
        
        # Add additional regressors
        prophet_df['is_weekend'] = temple_data['is_weekend'].values
        prophet_df['is_festival'] = temple_data['is_festival'].values
        prophet_df['is_holiday'] = temple_data['is_holiday'].values
        
        return prophet_df
    
    def create_festival_dataframe(self, start_date, end_date):
        """Create festival dataframe for Prophet holidays parameter"""
        festivals_list = []
        
        for year_str in self.festivals.keys():
            year = int(year_str)
            if year < start_date.year or year > end_date.year:
                continue
            
            for festival in self.festivals[year_str]:
                festival_date = datetime.strptime(festival['date'], '%Y-%m-%d')
                
                # Add main festival day
                festivals_list.append({
                    'holiday': festival['name'],
                    'ds': festival_date,
                    'lower_window': 0,
                    'upper_window': festival.get('duration', 1) - 1
                })
        
        return pd.DataFrame(festivals_list) if festivals_list else None
    
    def train_model(self, temple_id, force_retrain=False):
        """Train Prophet model for a specific temple"""
        model_path = os.path.join(self.models_dir, f'temple_{temple_id}_model.pkl')
        
        # Check if model already exists
        if os.path.exists(model_path) and not force_retrain:
            print(f"✅ Loading existing model for temple {temple_id}")
            self.models[temple_id] = joblib.load(model_path)
            return {"status": "loaded", "temple_id": temple_id}
        
        print(f"🎯 Training new model for temple {temple_id}...")
        
        # Load and prepare data
        df = self.load_data()
        prophet_df = self.prepare_prophet_data(df, temple_id)
        
        if len(prophet_df) < 30:
            raise ValueError(f"Insufficient data for temple {temple_id}")
        
        # Create festivals dataframe
        start_date = prophet_df['ds'].min()
        end_date = prophet_df['ds'].max()
        festivals_df = self.create_festival_dataframe(start_date, end_date)
        
        # Initialize Prophet model with parameters
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            holidays=festivals_df,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0
        )
        
        # Add custom regressors
        model.add_regressor('is_weekend')
        model.add_regressor('is_festival')
        model.add_regressor('is_holiday')
        
        # Fit the model
        model.fit(prophet_df)
        
        # Save model
        joblib.dump(model, model_path)
        self.models[temple_id] = model
        
        print(f"✅ Model trained and saved for temple {temple_id}")
        
        # Calculate metrics on historical data
        forecast = model.predict(prophet_df)
        mae = np.mean(np.abs(forecast['yhat'] - prophet_df['y']))
        rmse = np.sqrt(np.mean((forecast['yhat'] - prophet_df['y']) ** 2))
        
        return {
            "status": "trained",
            "temple_id": temple_id,
            "data_points": len(prophet_df),
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "model_path": model_path
        }
    
    def predict(self, temple_id, days_ahead=7):
        """Generate predictions for future days"""
        # Load model if not in memory
        if temple_id not in self.models:
            model_path = os.path.join(self.models_dir, f'temple_{temple_id}_model.pkl')
            if not os.path.exists(model_path):
                raise ValueError(f"Model not found for temple {temple_id}. Train first!")
            self.models[temple_id] = joblib.load(model_path)
        
        model = self.models[temple_id]
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=days_ahead)
        
        # Add regressors to future dataframe
        future['is_weekend'] = future['ds'].dt.dayofweek >= 5
        
        # Check for festivals in future dates
        future['is_festival'] = False
        future['is_holiday'] = False
        
        for idx, row in future.iterrows():
            date = row['ds'].date()
            year_str = str(date.year)
            
            if year_str in self.festivals:
                for festival in self.festivals[year_str]:
                    festival_date = datetime.strptime(festival['date'], '%Y-%m-%d').date()
                    duration = festival.get('duration', 1)
                    festival_end = festival_date + timedelta(days=duration - 1)
                    
                    if festival_date <= date <= festival_end:
                        future.at[idx, 'is_festival'] = True
                        break
            
            # Check for holidays
            if (date.month == 1 and date.day == 26) or \
               (date.month == 8 and date.day == 15) or \
               (date.month == 10 and date.day == 2) or \
               (date.month == 5 and date.day == 1):
                future.at[idx, 'is_holiday'] = True
        
        # Make prediction
        forecast = model.predict(future)
        
        # Get only future predictions
        today = datetime.now().date()
        future_forecast = forecast[forecast['ds'].dt.date > today].copy()
        
        # Prepare response
        predictions = []
        for idx, row in future_forecast.head(days_ahead).iterrows():
            predicted_visitors = max(0, int(row['yhat']))
            lower_bound = max(0, int(row['yhat_lower']))
            upper_bound = int(row['yhat_upper'])
            
            # Determine crowd level based on capacity
            # Assuming max capacity is 1.5x base average
            base_capacity = 3500  # Average base
            max_capacity = base_capacity * 1.5
            occupancy = min(100, int((predicted_visitors / max_capacity) * 100))
            
            if occupancy < 50:
                crowd_level = 'low'
            elif occupancy < 75:
                crowd_level = 'moderate'
            else:
                crowd_level = 'high'
            
            predictions.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'day_of_week': row['ds'].strftime('%A'),
                'predicted_visitors': predicted_visitors,
                'confidence_interval': {
                    'lower': lower_bound,
                    'upper': upper_bound
                },
                'occupancy_percentage': occupancy,
                'crowd_level': crowd_level,
                'is_weekend': bool(row['is_weekend']),
                'is_festival': bool(row['is_festival']),
                'is_holiday': bool(row['is_holiday'])
            })
        
        # Identify peak days
        peak_days = sorted(predictions, key=lambda x: x['predicted_visitors'], reverse=True)[:3]
        peak_dates = [p['date'] for p in peak_days]
        
        # Best time recommendations
        best_times = self.get_best_visit_times(predictions)
        
        return {
            'temple_id': temple_id,
            'predictions': predictions,
            'peak_days': peak_dates,
            'best_visit_times': best_times,
            'generated_at': datetime.now().isoformat()
        }
    
    def get_best_visit_times(self, predictions):
        """Recommend best times to visit"""
        if not predictions or len(predictions) == 0:
            return [
                "Book in advance for best experience",
                "Morning 6-8 AM (Generally least crowded)",
                "Avoid weekends and festivals"
            ]
        
        # Find days with low crowd
        low_crowd_days = [p for p in predictions if p['crowd_level'] == 'low']
        
        if low_crowd_days:
            best_day = low_crowd_days[0]
            return [
                f"{best_day['day_of_week']}, {best_day['date']} (Low crowd)",
                "Morning 6-8 AM (Least crowded)",
                "Evening 7-9 PM (Moderate crowd)"
            ]
        else:
            # If no low crowd days, recommend least crowded
            sorted_days = sorted(predictions, key=lambda x: x['predicted_visitors'])
            if sorted_days:
                best_day = sorted_days[0]
                return [
                    f"{best_day['day_of_week']}, {best_day['date']} (Least crowded)",
                    "Early morning 4-6 AM (Best option)",
                    "Avoid weekend visits if possible"
                ]
            else:
                return [
                    "Morning 6-8 AM (Recommended)",
                    "Avoid peak hours 4-7 PM",
                    "Book in advance"
                ]
    
    def train_all_temples(self, force_retrain=False):
        """Train models for all temples"""
        temple_ids = ['1', '2', '3', '4']
        results = []
        
        for temple_id in temple_ids:
            try:
                result = self.train_model(temple_id, force_retrain)
                results.append(result)
            except Exception as e:
                import traceback
                error_msg = str(e)
                traceback.print_exc()
                results.append({
                    "status": "error",
                    "temple_id": temple_id,
                    "error": error_msg
                })
        
        return results
    
    def get_model_metrics(self):
        """Get performance metrics for all trained models"""
        metrics = []
        
        for temple_id in ['1', '2', '3', '4']:
            model_path = os.path.join(self.models_dir, f'temple_{temple_id}_model.pkl')
            if os.path.exists(model_path):
                metrics.append({
                    "temple_id": temple_id,
                    "status": "trained",
                    "model_size": f"{os.path.getsize(model_path) / 1024:.2f} KB"
                })
            else:
                metrics.append({
                    "temple_id": temple_id,
                    "status": "not_trained"
                })
        
        return metrics

if __name__ == '__main__':
    # Test the predictor
    predictor = CrowdPredictor()
    
    print("🎯 Training models for all temples...")
    results = predictor.train_all_temples(force_retrain=True)
    
    for result in results:
        print(f"\n✅ Temple {result['temple_id']}: {result['status']}")
        if 'mae' in result:
            print(f"   MAE: {result['mae']}, RMSE: {result['rmse']}")
    
    print("\n🔮 Generating predictions for Temple 1...")
    predictions = predictor.predict('1', days_ahead=7)
    print(f"✅ Generated {len(predictions['predictions'])} days of predictions")
    print(f"📊 Peak days: {predictions['peak_days']}")

