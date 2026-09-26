require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

function sanitizeForMongo(value) {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForMongo(item));
  }

  if (typeof value === 'object') {
    const sanitized = {};
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) return;
      sanitized[key] = sanitizeForMongo(value[key]);
    });
    return sanitized;
  }

  return value;
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeForMongo(req.body);
  if (req.query) req.query = sanitizeForMongo(req.query);
  if (req.params) req.params = sanitizeForMongo(req.params);
  next();
});

const partyRoutes = require('./routes/party.routes.js');
const itemRoutes = require('./routes/item.routes.js');
const categoryRoutes = require('./routes/category.routes.js');
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.static(frontendPath));

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vyapar';

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ MongoDB CONNECTED SUCCESSFULLY');
  })
  .catch((err) => {
    console.log('⚠️ MongoDB connection failed. Starting app without DB connection.');
    console.log(err.message || err);
  });

app.use('/api/parties', partyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('*', (req, res) => {
  const safePath = req.path === '/' ? 'index.html' : req.path;
  const filePath = path.join(frontendPath, safePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(frontendPath, 'items.html'));
    }
  });
});

app.listen(port, () => {
  console.log(`>>> Server is running! Open at http://localhost:${port}`);
});

module.exports = app;
