import http from 'node:http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { createSocketServer } from './sockets/index.js';

dotenv.config();

const port = process.env.PORT || 5000;
const app = createApp();
const server = http.createServer(app);

createSocketServer(server);

connectDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Aegis API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
