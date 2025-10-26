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

app.listen(PORT, () => {
  console.log(`🚀 Data server running on http://localhost:${PORT}`);
});

