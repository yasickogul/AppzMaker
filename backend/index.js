import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './src/routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Main MVC API Router mount
app.use('/api', apiRouter);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'WorkForge Backend Service is running!',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 WorkForge Server running on port ${PORT}`);
});
