import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';
import { createRepository } from './repos/firebaseRepository.js';
import { createOwnerRouter } from './routes/ownerRoutes.js';
import { createEmployeeRouter } from './routes/employeeRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Repository abstraction (could be switched to Firebase easily)
const repo = createRepository();

// REST API routes
app.use('/api/owner', createOwnerRouter(repo));
app.use('/api/employee', createEmployeeRouter(repo));

// Create HTTP + Socket.IO server
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*'}
});

io.on('connection', (socket) => {
  console.log('[Socket] connection', socket.id);
  socket.on('chat:message', (msg) => {
    console.log('[Socket] chat:message', msg);
    socket.broadcast.emit('chat:message', msg);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


