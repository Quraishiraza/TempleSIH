import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '../frontend/src/data');

// Helper function to read JSON file
async function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

// Helper function to write JSON file
async function writeJSON(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Data server is running' });
});

// User endpoints
app.get('/api/users', async (req, res) => {
  const users = await readJSON('users.json');
  if (users) {
    res.json(users);
  } else {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

app.post('/api/users', async (req, res) => {
  const users = await readJSON('users.json');
  if (!users) {
    return res.status(500).json({ error: 'Failed to read users' });
  }

  const newUser = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  const success = await writeJSON('users.json', users);

  if (success) {
    res.status(201).json(newUser);
  } else {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Booking endpoints
app.get('/api/bookings', async (req, res) => {
  const bookings = await readJSON('bookings.json');
  if (bookings) {
    const { userId } = req.query;
    if (userId) {
      const userBookings = bookings.filter(b => b.userId === userId);
      res.json(userBookings);
    } else {
      res.json(bookings);
    }
  } else {
    res.status(500).json({ error: 'Failed to read bookings' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const bookings = await readJSON('bookings.json');
  if (!bookings) {
    return res.status(500).json({ error: 'Failed to read bookings' });
  }

  const newBooking = {
    id: Date.now().toString(),
    ...req.body,
    status: 'confirmed',
    bookingDate: new Date().toISOString()
  };

  bookings.push(newBooking);
  const success = await writeJSON('bookings.json', bookings);

  if (success) {
    res.status(201).json(newBooking);
  } else {
    res.status(500).json({ error: 'Failed to save booking' });
  }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  const bookings = await readJSON('bookings.json');
  if (!bookings) {
    return res.status(500).json({ error: 'Failed to read bookings' });
  }

  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  bookings[bookingIndex].status = 'cancelled';
  const success = await writeJSON('bookings.json', bookings);

  if (success) {
    res.json(bookings[bookingIndex]);
  } else {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Parking booking endpoints
app.get('/api/parking-bookings', async (req, res) => {
  const parkingBookings = await readJSON('parking-bookings.json');
  if (parkingBookings) {
    res.json(parkingBookings);
  } else {
    res.status(500).json({ error: 'Failed to read parking bookings' });
  }
});

app.get('/api/parking-bookings/user/:userId', async (req, res) => {
  const parkingBookings = await readJSON('parking-bookings.json');
  if (!parkingBookings) {
    return res.status(500).json({ error: 'Failed to read parking bookings' });
  }

  const userBookings = parkingBookings.filter(pb => pb.userId === req.params.userId);
  res.json(userBookings);
});

app.post('/api/parking-bookings', async (req, res) => {
  const parkingBookings = await readJSON('parking-bookings.json');
  if (!parkingBookings) {
    return res.status(500).json({ error: 'Failed to read parking bookings' });
  }

  const newParkingBooking = {
    id: Date.now().toString(),
    ...req.body,
    status: 'active',
    bookingDate: new Date().toISOString()
  };

  parkingBookings.push(newParkingBooking);
  const success = await writeJSON('parking-bookings.json', parkingBookings);

  if (success) {
    res.status(201).json(newParkingBooking);
  } else {
    res.status(500).json({ error: 'Failed to save parking booking' });
  }
});

app.patch('/api/parking-bookings/:id/cancel', async (req, res) => {
  const parkingBookings = await readJSON('parking-bookings.json');
  if (!parkingBookings) {
    return res.status(500).json({ error: 'Failed to read parking bookings' });
  }

  const bookingIndex = parkingBookings.findIndex(pb => pb.id === req.params.id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Parking booking not found' });
  }

  parkingBookings[bookingIndex].status = 'cancelled';
  const success = await writeJSON('parking-bookings.json', parkingBookings);

  if (success) {
    res.json(parkingBookings[bookingIndex]);
  } else {
    res.status(500).json({ error: 'Failed to cancel parking booking' });
  }
});

// ==================== ANALYTICS API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Data server is running' });
});

// Get comprehensive analytics data
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const users = await readJSON('users.json');
    const bookings = await readJSON('bookings.json');
    const parkingBookings = await readJSON('parking-bookings.json');
    const temples = await readJSON('temples.json');
    const parkingZones = await readJSON('parking-zones.json');

    // Calculate statistics
    const totalUsers = users.length;
    const totalBookings = bookings.length;
    const totalParkingBookings = parkingBookings.length;
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const activeParkingBookings = parkingBookings.filter(b => b.status === 'active').length;

    // Revenue calculations (assuming base prices)
    const bookingRevenue = bookings.reduce((sum, b) => {
      const temple = temples.find(t => t.id === b.templeId);
      if (!temple) return sum;
      const price = temple.entryFee === 'Free' ? 0 : parseInt(temple.entryFee.replace(/[^0-9]/g, ''));
      return sum + (price * b.numberOfPeople);
    }, 0);

    const parkingRevenue = parkingBookings.reduce((sum, b) => sum + (b.fees || 0), 0);
    const totalRevenue = bookingRevenue + parkingRevenue;

    // Temple-wise statistics
    const templeStats = temples.map(temple => {
      const templeBookings = bookings.filter(b => b.templeId === temple.id);
      const totalVisitors = templeBookings.reduce((sum, b) => sum + b.numberOfPeople, 0);
      return {
        id: temple.id,
        name: temple.name,
        location: temple.location,
        totalBookings: templeBookings.length,
        totalVisitors,
        currentOccupancy: temple.currentOccupancy,
        crowdStatus: temple.crowdStatus,
        avgWaitTime: temple.estimatedWaitTime
      };
    });

    // Booking trends (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const bookingTrends = last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: bookings.filter(b => b.bookingDate?.startsWith(date)).length,
      parking: parkingBookings.filter(b => b.bookingDate?.startsWith(date)).length
    }));

    // Time slot distribution
    const timeSlotDistribution = {};
    bookings.forEach(b => {
      const slot = b.timeSlot || 'Unknown';
      timeSlotDistribution[slot] = (timeSlotDistribution[slot] || 0) + 1;
    });

    // User demographics
    const userDemographics = {
      total: totalUsers,
      roles: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      overview: {
        totalUsers,
        totalBookings,
        totalParkingBookings,
        activeBookings,
        activeParkingBookings,
        totalRevenue,
        bookingRevenue,
        parkingRevenue
      },
      templeStats,
      bookingTrends,
      timeSlotDistribution: Object.entries(timeSlotDistribution).map(([slot, count]) => ({
        slot,
        count
      })),
      userDemographics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get temple-specific analytics
app.get('/api/analytics/temple/:templeId', async (req, res) => {
  try {
    const { templeId } = req.params;
    const bookings = await readJSON('bookings.json');
    const temples = await readJSON('temples.json');
    
    const temple = temples.find(t => t.id === templeId);
    if (!temple) {
      return res.status(404).json({ error: 'Temple not found' });
    }

    const templeBookings = bookings.filter(b => b.templeId === templeId);
    const totalVisitors = templeBookings.reduce((sum, b) => sum + b.numberOfPeople, 0);
    
    // Date-wise bookings
    const dateWiseBookings = {};
    templeBookings.forEach(b => {
      const date = b.bookingDate?.split('T')[0] || 'Unknown';
      if (!dateWiseBookings[date]) {
        dateWiseBookings[date] = { bookings: 0, visitors: 0 };
      }
      dateWiseBookings[date].bookings += 1;
      dateWiseBookings[date].visitors += b.numberOfPeople;
    });

    // Time slot analysis
    const timeSlotAnalysis = {};
    templeBookings.forEach(b => {
      const slot = b.timeSlot || 'Unknown';
      if (!timeSlotAnalysis[slot]) {
        timeSlotAnalysis[slot] = { bookings: 0, visitors: 0 };
      }
      timeSlotAnalysis[slot].bookings += 1;
      timeSlotAnalysis[slot].visitors += b.numberOfPeople;
    });

    res.json({
      temple: {
        id: temple.id,
        name: temple.name,
        location: temple.location,
        currentOccupancy: temple.currentOccupancy,
        maxCapacity: temple.maxCapacity,
        crowdStatus: temple.crowdStatus
      },
      stats: {
        totalBookings: templeBookings.length,
        totalVisitors,
        avgVisitorsPerBooking: (totalVisitors / templeBookings.length || 0).toFixed(1)
      },
      dateWiseBookings: Object.entries(dateWiseBookings).map(([date, data]) => ({
        date,
        ...data
      })),
      timeSlotAnalysis: Object.entries(timeSlotAnalysis).map(([slot, data]) => ({
        slot,
        ...data
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get real-time crowd status for all temples
app.get('/api/analytics/crowd-status', async (req, res) => {
  try {
    const temples = await readJSON('temples.json');
    const crowdStatus = temples.map(temple => ({
      id: temple.id,
      name: temple.name,
      location: temple.location,
      currentOccupancy: temple.currentOccupancy,
      maxCapacity: temple.maxCapacity,
      currentVisitors: Math.floor(temple.maxCapacity * temple.currentOccupancy / 100),
      crowdStatus: temple.crowdStatus,
      estimatedWaitTime: temple.estimatedWaitTime
    }));

    res.json({ crowdStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parking analytics
app.get('/api/analytics/parking', async (req, res) => {
  try {
    const parkingZones = await readJSON('parking-zones.json');
    const parkingBookings = await readJSON('parking-bookings.json');

    const parkingStats = parkingZones.map(zone => {
      const zoneBookings = parkingBookings.filter(b => b.zoneId === zone.id);
      const activeBookings = zoneBookings.filter(b => b.status === 'active');
      const totalRevenue = zoneBookings.reduce((sum, b) => sum + (b.fees || 0), 0);

      return {
        id: zone.id,
        name: zone.name,
        totalSpots: zone.totalSpots,
        availableSpots: zone.availableSpots,
        occupancyRate: ((zone.totalSpots - zone.availableSpots) / zone.totalSpots * 100).toFixed(1),
        totalBookings: zoneBookings.length,
        activeBookings: activeBookings.length,
        totalRevenue,
        vehicleTypes: zone.vehicleTypes
      };
    });

    // Vehicle type distribution
    const vehicleTypeDistribution = {};
    parkingBookings.forEach(b => {
      const type = b.vehicleType || 'Unknown';
      vehicleTypeDistribution[type] = (vehicleTypeDistribution[type] || 0) + 1;
    });

    res.json({
      parkingStats,
      vehicleTypeDistribution: Object.entries(vehicleTypeDistribution).map(([type, count]) => ({
        type,
        count
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Data server running on http://localhost:${PORT}`);
});

