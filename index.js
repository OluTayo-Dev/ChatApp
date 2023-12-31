const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./public/utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./public/utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'SUA Track Room';

// Run when client connects
io.on('connection', socket => {
   socket.on('joinRoom', ({username, room }) =>{
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
 // Welcome current user
 socket.emit('message', formatMessage(botName, 'welcome to SUA Track Room!'));

 // Broadcast when a user connects
 socket.broadcast
 .to(user.room)
 .emit('message',
  formatMessage(botName,`${user.username} has joined the chat`));


  //Send users and room info
  io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
  });
})

// Runs when client disconnects
socket.on('disconnect', () =>{
    const user = userLeave(socket.id);

    if(user){
        io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`));
    }
  
  });

  //Listen for ChatMessage
  socket.on('chatMessage', msg =>{
    const user = getCurrentUser(socket.id);
     // console.log(msg);
      io.to(user.room)
      .emit('message', formatMessage('USER', msg));
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()  => console.log(`Server running on port ${PORT}`));
