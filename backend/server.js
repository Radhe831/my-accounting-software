// backend/server.js (Error Free & Secure Code)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const mongoSanitize = require('mongo-sanitize');
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());


// Security: NoSQL Injection થી બચવા માટે
app.use((req, res, next) => {
    req.body = mongoSanitize(req.body);
    req.query = mongoSanitize(req.query);
    req.params = mongoSanitize(req.params);
    next();
});
const partyRoutes = require('./routes/party.routes.js');
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
})
.then(() => {
    console.log("✅ MongoDB CONNECTED SUCCESSFULLY");
})
.catch(err => {
    console.log("❌ ERROR:");
    console.log(err);
});


app.use('/api/parties', partyRoutes);





// Fallback Route
app.get('*', (req, res) => {
    const filePath = path.join(frontendPath, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(frontendPath, 'items.html'));
        }
    });
});

app.listen(port, () => {
    console.log(`>>> Server is running! Open at http://localhost:${port}`);
});