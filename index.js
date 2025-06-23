import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Connection from './connection/connection.js';
import setupSocket, { onlineUsers } from './modules/SocketsMManegar.js';
import login from './modules/login.js';
import register from './modules/signupapi.js';
import findusers from './modules/findusers.js';
import Chatroutes from './modules/chat/routes.js';
import  AudioData from './modules/Audiofiles/audiorecorde.js';
import  bookingReqquest from './modules/requestmodule/customerrequest.js'; // Adjust the path as needed
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
app.use((req, res, next) => {
  req.io = io; // attach io to every request
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('chat'));
app.use(express.urlencoded({ extended: true })); 
app.use('/api', register(io),express.static('public')); // Make sure the register function is returning a router
app.use('/api', login(io, onlineUsers),express.static('public')); // Make sure the login function is returning a router
app.use('/api', findusers); // Ensure this also returns an Express route
 // Same for userlocation
app.use('/api', Chatroutes,express.static('chat')); // Ensure Chatroutes returns a router
app.use('/api', AudioData); // Ensure Chatroutes returns a router
app.use('/api', bookingReqquest); // Ensure Chatroutes returns a router
app.get('/', (req, res) => res.send('Hello World!'));
setupSocket(io);
const port = 3000;
httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});