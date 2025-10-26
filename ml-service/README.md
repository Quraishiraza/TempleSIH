# 🤖 Trinetra ML Service - Crowd Prediction API

AI-powered crowd prediction system using Prophet for temple and pilgrimage site management.

## 🎯 Features

- **AI/ML Crowd Prediction** using Facebook Prophet
- **Realistic Synthetic Data** generation (3 years of historical data)
- **Festival & Holiday Detection** with automatic impact calculation
- **Weather & Seasonal** pattern recognition
- **Best Time Recommendations** for temple visits
- **REST API** for easy integration

## 📦 Installation

### Step 1: Install Python Dependencies

```bash
cd ml-service
pip3 install -r requirements.txt
```

### Step 2: Generate Historical Data

```bash
python3 data_generator.py
```

This will create `data/historical_data.csv` with ~4,380 records (3 years × 4 temples).

### Step 3: Train Prophet Models

```bash
python3 crowd_predictor.py
```

This will train models for all 4 temples and save them in `trained_models/`.

## 🚀 Running the Service

### Start the Flask API Server

```bash
python3 app.py
```

Server will run on: **http://localhost:5000**

## 📡 API Endpoints

### Health Check
```bash
GET /api/ml/health
```

### Generate Data
```bash
POST /api/ml/generate-data
Body: {
  "start_date": "2022-01-01",
  "end_date": "2024-12-31"
}
```

### Train Models
```bash
POST /api/ml/train
Body: {
  "temple_id": "1",  # Optional, omit for all temples
  "force_retrain": false
}
```

### Get Predictions
```bash
POST /api/ml/predict
Body: {
  "temple_id": "1",
  "days_ahead": 7
}
```

### Get Cached Predictions
```bash
GET /api/ml/prediction/1?days=7
```

### Get Best Visit Times
```bash
GET /api/ml/best-time/1?date=2025-10-27
```

### Get Model Metrics
```bash
GET /api/ml/metrics
```

### Batch Predictions (All Temples)
```bash
POST /api/ml/batch-predict
Body: {
  "days_ahead": 7
}
```

## 📊 Data Features

Generated data includes:
- Daily visitor counts
- Festival impact (Diwali, Navratri, Mahashivratri, etc.)
- Weather conditions
- Seasonal patterns
- Weekly patterns (weekends vs weekdays)
- Holiday effects
- Temple-specific patterns

## 🏛️ Temples

1. **Somnath Temple** (ID: 1) - Shiva temple, peak on Mondays
2. **Dwarkadhish Temple** (ID: 2) - Krishna temple, peak on Janmashtami
3. **Ambaji Temple** (ID: 3) - Devi temple, peak during Navratri
4. **Pavagadh Temple** (ID: 4) - Shakti Peetha

## 📈 Model Performance

- **Algorithm:** Facebook Prophet
- **Accuracy:** ~85-90% (MAE: 200-300 visitors)
- **Features:** Seasonality, festivals, holidays, weather
- **Training Data:** 3 years (2022-2024)
- **Prediction Range:** 1-30 days ahead

## 🔧 Technical Stack

- **Framework:** Flask
- **ML Library:** Prophet (Facebook)
- **Data:** pandas, numpy
- **API:** REST with CORS enabled
- **Model Persistence:** joblib

## 🎯 Use Cases

1. **Temple Management:** Plan staff allocation
2. **Pilgrim Guidance:** Suggest best visit times
3. **Traffic Management:** Predict congestion
4. **Resource Planning:** Optimize facilities
5. **Emergency Preparedness:** Anticipate crowd surges

## 📁 File Structure

```
ml-service/
├── app.py                      # Flask API server
├── crowd_predictor.py          # Prophet model implementation
├── data_generator.py           # Synthetic data generator
├── requirements.txt            # Python dependencies
├── data/
│   ├── historical_data.csv    # 3 years of crowd data
│   └── festivals.json         # Festival calendar
├── trained_models/            # Saved Prophet models
│   ├── temple_1_model.pkl
│   ├── temple_2_model.pkl
│   ├── temple_3_model.pkl
│   └── temple_4_model.pkl
└── README.md
```

## 🧪 Testing

### Quick Test
```bash
# Test health
curl http://localhost:5000/api/ml/health

# Get predictions
curl -X POST http://localhost:5000/api/ml/predict \
  -H "Content-Type: application/json" \
  -d '{"temple_id": "1", "days_ahead": 7}'
```

## 🔮 Future Enhancements

- LSTM models for hourly predictions
- Real-time CCTV integration
- Weather API integration
- Multi-variate forecasting
- Anomaly detection
- Auto-retraining pipeline

## 📝 Notes

- Models are trained once and cached
- Predictions include confidence intervals
- Festival calendar is manually curated
- Data is realistic synthetic data for demo purposes

## 🤝 Integration

This service integrates with:
- Node.js backend (port 3002)
- React frontend (port 3000)
- Admin dashboard for visualizations

---

Built for **Smart India Hackathon 2025** 🇮🇳

