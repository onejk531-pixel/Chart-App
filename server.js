const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const chartRoutes = require('./routes/charts');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chartapp';
mongoose.connect(MONGO_URI)
  .then(()=> console.log('✅ MongoDB connected'))
  .catch(err=> console.error('MongoDB connection error', err));

app.use('/api/auth', authRoutes);
app.use('/api/charts', chartRoutes);

app.get('/', (req, res) => res.send('AI Chart Scanner Backend'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
