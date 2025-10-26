# 🚀 Quick Start Guide

## 1️⃣ First Time Setup (One Time Only)

Run the setup script to install all dependencies:

```bash
cd /Users/rabdin/Desktop/sih01
./setup.sh
```

Or manually:

```bash
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd data-server
npm install
cd ..
```

---

## 2️⃣ Running the Application

You need **TWO** terminal windows running simultaneously.

### Option A: Using Scripts (Easier)

**Terminal 1 - Start Backend:**
```bash
cd /Users/rabdin/Desktop/sih01
./start-backend.sh
```

**Terminal 2 - Start Frontend:**
```bash
cd /Users/rabdin/Desktop/sih01
./start-frontend.sh
```

### Option B: Manual Commands

**Terminal 1 - Start Backend:**
```bash
cd /Users/rabdin/Desktop/sih01/data-server
npm start
```

**Terminal 2 - Start Frontend:**
```bash
cd /Users/rabdin/Desktop/sih01/frontend
npm run dev
```

---

## 3️⃣ Access the Application

Once both servers are running:

1. Open your browser
2. Go to: **http://localhost:3000**
3. Create a new account or login
4. Start exploring!

---

## ✅ Verification

### Check if Backend is Running:
Visit: http://localhost:3002/api/health

You should see:
```json
{
  "status": "ok",
  "message": "Data server is running"
}
```

### Check if Frontend is Running:
Visit: http://localhost:3000

You should see the login page.

---

## 🎯 First Steps After Login

1. **Explore Temples** - Browse available temples with real-time crowd data
2. **Book Darshan** - Select a temple and book your visit
3. **Reserve Parking** - Book a parking spot near your temple
4. **View Bookings** - Check all your bookings and download QR codes
5. **Update Profile** - Manage your personal information

---

## 🛑 Stopping the Application

Press `Ctrl + C` in both terminal windows to stop the servers.

---

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 or 3002 is already in use:

**For Frontend (Port 3000):**
- Edit `frontend/vite.config.js`
- Change the port number in server config

**For Backend (Port 3002):**
- Edit `data-server/server.js`
- Change `const PORT = 3002` to another port
- Update API URLs in frontend files

### Dependencies Issues

If you face dependency issues:

```bash
# Clean install frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clean install backend
cd ../data-server
rm -rf node_modules package-lock.json
npm install
```

### Cannot Connect to Backend

Make sure:
1. Backend server is running on port 3002
2. Frontend is making requests to http://localhost:3002
3. No firewall blocking the connection

---

## 📱 Demo Features to Try

### 1. User Registration
- Create a new account with your details
- Login with your credentials

### 2. Dashboard
- View temple statistics
- See crowd distribution charts
- Check occupancy levels

### 3. Temple Browsing
- Search temples by name
- Filter by crowd level
- View detailed information

### 4. Darshan Booking
- Select a temple
- Choose date and time slot
- Get instant QR code

### 5. Parking Booking
- Browse parking zones
- Check real-time availability
- Book with vehicle details
- Generate parking QR code

### 6. Booking Management
- View all bookings
- Download QR codes
- Cancel bookings

---

## 📊 Sample Data

The application comes with:
- **4 Temples** (Somnath, Dwarkadhish, Ambaji, Pavagadh)
- **9 Parking Zones** across different temples
- Real-time occupancy simulation

All your bookings and user data are stored in JSON files in `frontend/src/data/`

---

## 🎨 Browser Compatibility

Recommended browsers:
- ✅ Chrome (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)

---

## 💡 Tips

1. Keep both terminal windows open while using the app
2. QR codes can be downloaded and used for entry
3. All data persists in JSON files
4. You can view/edit JSON files directly in `frontend/src/data/`
5. Refresh the page if you encounter any issues

---

## 🎉 Enjoy Trinetra!

Happy temple visiting! 🙏

