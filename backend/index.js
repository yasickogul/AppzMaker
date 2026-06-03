import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes/api.js';
import authRoutes from './routes/authRoutes.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'WorkForge Backend Service is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dataSource: 'MongoDB (auth) + in-memory store (workforce)',
    swagger: `http://localhost:${PORT}/api-docs`,
    timestamp: new Date(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRouter);

let swaggerSpec;
try {
  const mod = await import('./config/swagger.js');
  swaggerSpec = mod.default;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'WorkForge API Docs',
  }));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
} catch (err) {
  console.warn('⚠️  Swagger setup skipped:', err.message);
}

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`🚀 WorkForge Server running on port ${PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`🔐 Auth API:  http://localhost:${PORT}/api/auth/login`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env`);
      } else {
        console.error('❌ Failed to start server:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
