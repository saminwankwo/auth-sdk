require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./controllers/auth.routes');
const { connectDB } = require('./utils/db');

(async () => {
  await connectDB();
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use('/api/auth', rateLimit({ windowMs: 1 * 60 * 1000, max: 10 }));
  app.use('/api/auth', authRoutes);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Auth SDK running on port ${port}`));
})();