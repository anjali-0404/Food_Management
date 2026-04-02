const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server-core');

dotenv.config();

const app = express();
let memoryMongoServer;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodbridge';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);

    if (process.env.DISABLE_IN_MEMORY_DB === 'true') {
      process.exit(1);
    }

    console.log('⚠️ Falling back to in-memory MongoDB for local development...');
    memoryMongoServer = await MongoMemoryServer.create({ instance: { dbName: 'foodbridge' } });
    const fallbackUri = memoryMongoServer.getUri();
    const conn = await mongoose.connect(fallbackUri);
    console.log(`✅ In-memory MongoDB Connected: ${conn.connection.host}`);
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/ngos',      require('./routes/ngos'));
app.use('/api/stats',     require('./routes/stats'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🍱 FoodBridge Server is Running',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ─── Static Files & SPA Support ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  // Serve any static files from the build folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 FoodBridge Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

process.on('SIGINT', async () => {
  if (memoryMongoServer) {
    await memoryMongoServer.stop();
  }
  process.exit(0);
});
