import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import connectDB from './db/db';
import { initSocket } from './utils/socket';

const port: number = Number(process.env.PORT || 6001);

connectDB();

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
