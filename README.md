# 🕉️ Trinetra - Smart Temple Management System

**Smart India Hackathon 2025 - Problem Statement #25165**  
**Team:** HexaCore@SBU

---

## 📋 Project Overview

Trinetra is a comprehensive web application designed for smart crowd management at major pilgrimage sites in Gujarat. The system uses real-time monitoring, AI/ML predictions, QR-based passes, and integrated parking management to enhance the visitor experience.

### ✨ Key Features

- 🏛️ **Temple Discovery** - Browse temples with real-time crowd data and occupancy levels
- 📅 **Darshan Booking System** - Book temple visits with QR code generation
- 🅿️ **Smart Parking** - Reserve parking spots with real-time availability tracking
- 👤 **User Management** - Complete authentication and profile management
- 📊 **Real-time Dashboard** - Visual analytics and statistics
- 📱 **QR Code Integration** - Contactless entry system

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Maps:** React Leaflet
- **QR Codes:** qrcode.react
- **Notifications:** React Hot Toast
- **Icons:** Heroicons

### Backend
- **Server:** Node.js + Express
- **Data Storage:** JSON Files (File-based system)
- **Port:** 3002

### Frontend Port
- **Development Server:** 3000

---

## 📁 Project Structure

```
sih01/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   └── Layout.jsx      # Main layout with navigation
│   │   ├── context/            # React Context providers
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── data/               # JSON data files
│   │   │   ├── users.json
│   │   │   ├── bookings.json
│   │   │   ├── parking-bookings.json
│   │   │   ├── temples.json
│   │   │   └── parking-zones.json
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Temples.jsx
│   │   │   ├── TempleDetails.jsx
│   │   │   ├── BookDarshan.jsx
│   │   │   ├── Parking.jsx
│   │   │   ├── BookParking.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── MyBookings.jsx
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── data-server/                 # Node.js data server
│   ├── server.js               # Express server
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
cd /Users/rabdin/Desktop/sih01
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Data Server Dependencies**
```bash
cd ../data-server
npm install
```

---

## 🎬 Running the Application

You need to run **both** the frontend and data server simultaneously.

### Terminal 1: Start Data Server

```bash
cd data-server
npm start
```

The data server will run on `http://localhost:3002`

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 🔐 Demo Credentials

### Option 1: Create New Account
- Go to the signup page and create a new account
- Fill in your details and start using the app

### Option 2: Use Test Account (if created)
- **Email:** test@example.com
- **Password:** password

---

## 📚 API Endpoints

The data server provides the following REST API endpoints:

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Darshan Bookings
- `GET /api/bookings` - Get all bookings (supports `?userId=` filter)
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Parking Bookings
- `GET /api/parking-bookings` - Get all parking bookings
- `GET /api/parking-bookings/user/:userId` - Get user's parking bookings
- `POST /api/parking-bookings` - Create new parking booking
- `PATCH /api/parking-bookings/:id/cancel` - Cancel parking booking

---

## 🏛️ Available Temples

The system includes 4 pre-populated temples in Gujarat:

1. **Somnath Temple** - One of the twelve Jyotirlinga shrines
2. **Dwarkadhish Temple** - Dedicated to Lord Krishna
3. **Ambaji Temple** - One of the 51 Shakti Peethas
4. **Pavagadh Temple** - UNESCO World Heritage Site

---

## 🎨 Features Walkthrough

### 1. Authentication
- Beautiful gradient login/signup pages
- Form validation
- Persistent user sessions

### 2. Dashboard (Home)
- Welcome section with user greeting
- Statistics cards (temples, bookings, parking, visits)
- Real-time occupancy bar chart
- Crowd status distribution pie chart
- Quick action buttons
- Popular temples showcase

### 3. Temple Discovery
- Search functionality
- Filter by crowd level
- Temple cards with images
- Real-time occupancy indicators
- Quick booking buttons

### 4. Temple Details
- High-quality temple images
- Detailed information
- Timings and facilities
- Interactive map with temple location
- Real-time occupancy stats
- Quick booking actions

### 5. Darshan Booking
- Date and time slot selection
- Number of people configuration
- Instant QR code generation
- Downloadable QR codes
- Booking confirmation modal

### 6. Smart Parking
- Multiple parking zones
- Real-time availability tracking
- Price comparison
- Vehicle type support
- Features and amenities display

### 7. Parking Booking
- Date and time selection
- Duration-based pricing
- Vehicle details input
- Automatic price calculation
- QR code generation

### 8. My Bookings
- Tabbed interface (Darshan / Parking)
- Booking history
- Status indicators
- QR code viewing
- Cancel functionality

### 9. Profile Management
- User information display
- Editable profile fields
- Account statistics
- Security settings

---

## 🎨 UI/UX Highlights

- **Modern Design:** Clean, professional interface with gradient backgrounds
- **Responsive:** Fully responsive design for all screen sizes
- **Smooth Animations:** Fade-in effects and smooth transitions
- **Color-Coded Status:** Visual indicators for crowd levels and booking status
- **Interactive Elements:** Hover effects and active states
- **Toast Notifications:** Real-time feedback for user actions
- **Loading States:** Proper loading indicators
- **Empty States:** Helpful messages when no data available
- **Modal Dialogs:** Elegant modals for confirmations and QR codes

### Color Scheme
- **Primary:** Orange (#f97316) - Represents spirituality and energy
- **Secondary:** Purple (#d946ef) - Represents devotion
- **Success:** Green - For confirmations
- **Warning:** Yellow - For moderate states
- **Danger:** Red - For high crowd or cancellations

---

## 🔧 Configuration

### Frontend Port
The frontend runs on port 3000 by default. To change it, modify `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3000  // Change this
  }
})
```

### Backend Port
The data server runs on port 3002. To change it, modify `data-server/server.js`:

```javascript
const PORT = 3002;  // Change this
```

**Note:** If you change the backend port, update the API URL in frontend components from `http://localhost:3002` to your new port.

---

## 📦 Data Storage

The application uses a **file-based JSON storage system** instead of a traditional database. Data is stored in the following files:

- `frontend/src/data/users.json` - User accounts
- `frontend/src/data/bookings.json` - Darshan bookings
- `frontend/src/data/parking-bookings.json` - Parking bookings
- `frontend/src/data/temples.json` - Temple information (static)
- `frontend/src/data/parking-zones.json` - Parking zones (static)

The data server handles all read/write operations to these files.

---

## 🛠️ Development

### Build for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/dist` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 🔮 Future Enhancements

- YOLO-powered CCTV analysis for real-time crowd detection
- AI/ML predictions for crowd patterns
- Multi-language support (English, Hindi, Gujarati)
- SMS/Email notifications
- Payment gateway integration
- Admin dashboard for temple management
- Mobile app (React Native)
- Real database integration (PostgreSQL/MongoDB)
- Weather-based recommendations
- Social media integration

---

## 👥 Team

**HexaCore@SBU**
- Smart India Hackathon 2025
- Problem Statement #25165

---

## 📄 License

This project is developed for Smart India Hackathon 2025.

---

## 🙏 Acknowledgments

- Smart India Hackathon 2025
- Gujarat Tourism
- All team members and contributors

---

## 📞 Support

For any queries or issues, please contact the development team.

---

**Built with ❤️ for Smart India Hackathon 2025**

