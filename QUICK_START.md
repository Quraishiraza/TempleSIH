# 🚀 Trinetra - Quick Start Guide

**For your friend to clone and run the project**

---

## 📱 Share These Instructions

### Repository URL:
```
https://github.com/Quraishiraza/TempleSIH.git
```

### Branch to Use:
```
feature1
```

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/Quraishiraza/TempleSIH.git
cd TempleSIH
git checkout feature1
```

### Step 2: Run Setup Script

**For Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

The script will automatically:
- ✅ Install all Node.js dependencies
- ✅ Create Python virtual environments
- ✅ Install Python packages
- ✅ Set up all 4 services

---

## 🎬 Running the Application

Open **4 terminal windows** and run these commands:

### Terminal 1: Frontend
```bash
cd frontend
npm run dev
```
**Opens at:** http://localhost:3000

### Terminal 2: Data Server
```bash
cd data-server
node server.js
```
**Runs on:** Port 5001

### Terminal 3: ML Service
```bash
cd ml-service
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate     # Windows
python app.py
```
**Runs on:** Port 5003

### Terminal 4: YOLO Service  
```bash
cd yolo-service
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate     # Windows
python app_video3.py
```
**Runs on:** Port 5002

---

## 🔑 Login Credentials

```
Email: al1@gamil.com
Password: password
```

---

## 🎯 Pages to Demo

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Dashboard overview |
| Temples | `/temples` | Browse temples |
| Live Monitoring | `/live-monitoring` | **YOLO Video Detection** 🌟 |
| Alerts | `/alerts` | **Real-time Alerts** 🌟 |
| Analytics | `/analytics` | **Crowd Analytics** 🌟 |
| Emergency | `/emergency` | Emergency contacts |
| Parking | `/parking` | Smart parking |

🌟 = AI/ML Features

---

## ✅ Verify Everything Works

1. Go to: http://localhost:3000
2. Login with credentials
3. Click "Live Monitoring" (should show video)
4. Click "Alerts" (should show YOLO alerts)
5. Try language switcher (top-right corner)

---

## 🆘 If Something Goes Wrong

### Services Not Starting?
```bash
# Check if ports are free
lsof -ti:3000  # Should be empty
lsof -ti:5001  # Should be empty
lsof -ti:5002  # Should be empty
lsof -ti:5003  # Should be empty

# If occupied, kill them:
lsof -ti:3000 | xargs kill -9
```

### YOLO Not Working?
```bash
# Restart YOLO service
cd yolo-service
source venv/bin/activate
python app_video3.py

# Should see:
# ✅ YOLO model loaded successfully
# ✅ Video opened: temple_crowd_3.mp4
```

### Frontend Blank Page?
```bash
# Hard refresh browser
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

---

## 📖 Full Documentation

For detailed instructions, see:
- **SETUP_INSTRUCTIONS.md** - Complete setup guide
- **YOLO_SETUP_GUIDE.md** - YOLO-specific guide
- **YOLO_ALERT_SYSTEM_GUIDE.md** - Alert system details

---

## 💡 Pro Tips

1. **First Run**: YOLO will download model (~6MB), be patient
2. **Video Quality**: Use good internet for GitHub clone (videos ~18MB)
3. **Browser**: Use Chrome/Edge for best performance
4. **RAM**: Close other apps if system is slow
5. **Demo**: Open Live Monitoring and Alerts in separate tabs

---

## 🎓 For Hackathon Judges

### Key Highlights:
1. **Real-time YOLO Detection** - Live video processing
2. **AI/ML Integration** - Crowd prediction & analytics
3. **Alert System** - Automatic threshold monitoring
4. **Multilingual** - EN/HI/GU support
5. **Production Ready** - Complete full-stack solution

### Tech Stack:
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **AI/ML**: YOLOv8n + Python Flask
- **Database**: JSON (can scale to MongoDB)

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB |
| Storage | 2GB | 5GB |
| CPU | Dual-core | Quad-core |
| Node.js | v18 | Latest |
| Python | 3.10 | 3.11+ |

---

## 🎉 You're Ready!

After running all 4 services, navigate to:
```
http://localhost:3000
```

**Good luck with your demo! 🚀**

---

## 📞 Need Help?

If you encounter issues:
1. Check `SETUP_INSTRUCTIONS.md` troubleshooting section
2. Ensure all 4 services are running
3. Check browser console for errors
4. Try restarting all services

---

**Built for Smart India Hackathon 2025**  
**Problem Statement #25165**  
**Trinetra - AI Powered Smart Crowd Management**

