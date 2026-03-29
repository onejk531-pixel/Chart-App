const dotenv = require('dotenv');
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required. ' +
    'Copy .env.example to .env and set a strong secret.'
  );
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chartapp',
  PORT: process.env.PORT || 5000,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000/predict'
};
