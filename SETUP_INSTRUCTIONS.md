# 🚀 Trinetra - Setup Instructions

Complete guide to set up and run the **Trinetra Smart Temple Management System** on your machine.

**Built for Smart India Hackathon 2025 - Problem Statement #25165**

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Running the Application](#running-the-application)
5. [Accessing the Application](#accessing-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)

---

## 🖥️ System Requirements

### Required Software:
- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **Python**: v3.10 or higher ([Download](https://www.python.org/))
- **Git**: Latest version ([Download](https://git-scm.com/))

### Operating System:
- macOS, Windows, or Linux

### Hardware:
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Processor**: Dual-core or better

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Quraishiraza/TempleSIH.git
cd TempleSIH

# 2. Checkout feature1 branch
git checkout feature1

# 3. Run setup script (Unix/Mac)
chmod +x setup.sh
./setup.sh

# For Windows, follow Detailed Setup below
```

---

## 🔧 Detailed Setup

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/Quraishiraza/TempleSIH.git

# Navigate to project directory
cd TempleSIH

# Switch to feature1 branch (contains all latest features)
git checkout feature1
```

---

### Step 2: Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Go back to root
cd ..
```

**Expected output:** `added XXX packages` without errors

---

### Step 3: Data Server Setup (Node.js)

```bash
# Navigate to data-server directory
cd data-server

# Install dependencies
npm install

# Go back to root
cd ..
```

---

### Step 4: ML Service Setup (Python)

```bash
# Navigate to ml-service directory
cd ml-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Deactivate virtual environment
deactivate

# Go back to root
cd ..
```

---

### Step 5: YOLO Service Setup (Python)

```bash
# Navigate to yolo-service directory
cd yolo-service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Deactivate virtual environment
deactivate

# Go back to root
cd ..
```

**Note:** First run will download YOLOv8 model (~6MB)

---

## 🎬 Running the Application

You need to run **4 services** in separate terminals:

### Terminal 1: Frontend (React)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
```

---

### Terminal 2: Data Server (Node.js)

```bash
cd data-server
node server.js
```

**Expected output:**
```
✅ Data Server running on http://localhost:5001
```

---

### Terminal 3: ML Service (Python)

```bash
cd ml-service
source venv/bin/activate  # Mac/Linux
# OR
# venv\Scripts\activate  # Windows

python app.py
```

**Expected output:**
```
🚀 TRINETRA - ML PREDICTION SERVICE
✅ Server running on http://0.0.0.0:5003
```

---

### Terminal 4: YOLO Service (Python)

```bash
cd yolo-service
source venv/bin/activate  # Mac/Linux
# OR
# venv\Scripts\activate  # Windows

python app_video3.py
```

**Expected output:**
```
🚀 TRINETRA - YOLO SERVICE (Real Video 3)
✅ YOLO model loaded successfully
✅ Video opened: temple_crowd_3.mp4
✅ Server running on http://0.0.0.0:5002
```

---

## 🌐 Accessing the Application

Once all 4 services are running:

### Main Application
```
http://localhost:3000
```

### Login Credentials
```
Email: al1@gamil.com
Password: password
```

### Available Pages:
- **Home Dashboard**: `/`
- **Temple Discovery**: `/temples`
- **Book Darshan**: `/book-darshan/:id`
- **Smart Parking**: `/parking`
- **Live Monitoring**: `/live-monitoring` ⭐ (YOLO Video)
- **Analytics Dashboard**: `/analytics` ⭐
- **Alerts Dashboard**: `/alerts` ⭐ (YOLO Alerts)
- **Emergency & Safety**: `/emergency` ⭐
- **User Profile**: `/profile`

⭐ = New features with AI/ML

---

## 🎯 Key Features to Demo

### 1. **Live Monitoring** (`/live-monitoring`)
- Real-time YOLO crowd detection
- Uses `temple_crowd_3.mp4` video
- Green/Red bounding boxes around people
- People count: 20-26 (varies by frame)
- Alert threshold: 21 people
- Auto-refresh every 1.5 seconds

### 2. **Alerts Dashboard** (`/alerts`)
- Shows YOLO crowd alerts
- Real-time updates
- Alert when crowd > 21 people
- Acknowledge/Resolve functionality

### 3. **Analytics Dashboard** (`/analytics`)
- Crowd flow visualization
- Historical trends
- Peak hours analysis
- Temple-wise statistics

### 4. **Multilingual Support**
- English, Hindi, Gujarati
- Language switcher in top-right corner

---

## 🔧 Troubleshooting

### Issue 1: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using the port
lsof -ti:3000  # Replace 3000 with your port

# Kill the process
kill -9 <PID>

# Or kill all on specific port
lsof -ti:3000 | xargs kill -9
```

---

### Issue 2: YOLO Service Not Working

**Error:** `Failed to connect to YOLO service`

**Solution:**
```bash
# Check if service is running
lsof -ti:5002

# If not running, restart:
cd yolo-service
source venv/bin/activate
python app_video3.py
```

---

### Issue 3: Python Dependencies Failed

**Error:** `error: externally-managed-environment`

**Solution:**
```bash
# Use virtual environment (already in setup)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Issue 4: Frontend Not Loading

**Solution:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Issue 5: Video Not Playing

**Possible Causes:**
- YOLO service not running
- Video files missing
- Browser cache

**Solution:**
```bash
# Check video files exist
ls -lh yolo-service/videos/

# Restart YOLO service
cd yolo-service
source venv/bin/activate
python app_video3.py

# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## 📁 Project Structure

```
TempleSIH/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # All page components
│   │   ├── components/      # Reusable components
│   │   ├── data/           # JSON data files
│   │   └── i18n/           # Translations (EN/HI/GU)
│   └── package.json
│
├── data-server/             # Node.js Express backend
│   ├── server.js           # Main server file
│   └── package.json
│
├── ml-service/              # Python ML prediction service
│   ├── app.py              # Flask API
│   ├── crowd_predictor.py  # ML predictor
│   ├── requirements.txt
│   └── venv/               # Virtual environment
│
├── yolo-service/            # Python YOLO detection service
│   ├── app_video3.py       # Main service (use this)
│   ├── yolo_detector.py    # YOLO detection logic
│   ├── video_processor.py  # Video handling
│   ├── config.py           # Configuration
│   ├── requirements.txt
│   ├── videos/             # Video files
│   │   └── temple_crowd_3.mp4
│   └── venv/               # Virtual environment
│
├── SETUP_INSTRUCTIONS.md    # This file
├── YOLO_SETUP_GUIDE.md     # YOLO-specific guide
└── README.md               # Project overview
```

---

## 🎨 Technology Stack

### Frontend:
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React i18next** - Internationalization

### Backend:
- **Node.js** - Data server
- **Express** - Web framework
- **Python Flask** - ML & YOLO services

### AI/ML:
- **YOLOv8n** - Person detection
- **OpenCV** - Video processing
- **NumPy** - Numerical operations
- **SimpleCrowdPredictor** - Crowd prediction

---

## 🚀 Quick Commands Reference

### Check All Services Running:
```bash
# Check ports
lsof -ti:3000  # Frontend
lsof -ti:5001  # Data Server
lsof -ti:5002  # YOLO Service
lsof -ti:5003  # ML Service
```

### Stop All Services:
```bash
# Kill all services
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
lsof -ti:5002 | xargs kill -9
lsof -ti:5003 | xargs kill -9
```

### Restart Everything:
```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd data-server && node server.js

# Terminal 3
cd ml-service && source venv/bin/activate && python app.py

# Terminal 4
cd yolo-service && source venv/bin/activate && python app_video3.py
```

---

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Data Server | 5001 | http://localhost:5001 |
| YOLO Service | 5002 | http://localhost:5002 |
| ML Service | 5003 | http://localhost:5003 |

---

## 🎯 For Hackathon Demo

### Before Demo:
1. ✅ Ensure all 4 services are running
2. ✅ Login with credentials
3. ✅ Open Live Monitoring in one tab
4. ✅ Open Alerts Dashboard in another tab
5. ✅ Test language switcher

### Key Demo Points:
1. **Real-time Detection**: Show `/live-monitoring` with video
2. **Alert System**: When count > 21, alert appears
3. **Analytics**: Show crowd trends at `/analytics`
4. **Multilingual**: Switch languages to show accessibility
5. **Emergency**: Show emergency contacts at `/emergency`

---

## 📞 Support

For issues or questions:
- Check `YOLO_SETUP_GUIDE.md` for YOLO-specific issues
- Check `YOLO_ALERT_SYSTEM_GUIDE.md` for alert system details
- Review troubleshooting section above

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend loads at `http://localhost:3000`
- [ ] Can login with provided credentials
- [ ] All navigation links work
- [ ] Live Monitoring shows video feed
- [ ] Alerts Dashboard shows YOLO alerts
- [ ] Analytics page displays charts
- [ ] Language switcher works (EN/HI/GU)
- [ ] No console errors in browser

---

## 🎉 You're All Set!

The application is now ready to run. Navigate to `http://localhost:3000` and explore!

**Good luck with your demo! 🚀**

---

**Built with ❤️ for Smart India Hackathon 2025**
