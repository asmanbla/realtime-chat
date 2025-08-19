const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomusers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'ChatBot';

// set static folder 
app.use(express.static(path.join(__dirname, 'public')));

// run when client connects 
io.on('connection', socket => {
        socket.on('joinRoom', ({ username, room }) => {
            const user = userJoin(socket.id, username, room);

            socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to the chatBoard!'));

        // broadcast when a user connects 
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        io.to(user.room).emit('roomUsers', {
            room: user.room, 
            users: getRoomusers(user.room)
        })
    });

    console.log('New WebSocket connection established');

    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        // broadcast pesan chat ke semua user di room
        io.to(user.room).emit('message', formatMessage(user.username, msg));

        // broadcast notifikasi ke semua user di room
        io.to(user.room).emit('sendNotification', {
            room: user.room,
            username: user.username, 
            text: msg
        });
    });

    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
        };

        io.to(user.room).emit('roomUsers', {
            room: user.room, 
            users: getRoomusers(user.room)
        })
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));