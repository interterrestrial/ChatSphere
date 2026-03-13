import http from 'http';
import app from './app';

import dotenv from 'dotenv';
dotenv.config();

const port: number = Number(process.env.PORT || 3001);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
