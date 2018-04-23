const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server=http.createServer(app);
var io=socketIO(server); 
 
app.use(express.static(publicPath));

io.on('connection',(socket)=>{
    console.log('New user connected');  
    
socket.emit('newMessage',{
    from:'Admin',
    text:'Welcome to the chat app'
});
    
socket.broadcast.emit('newMessage',{
    from:'Admin',
    text:'New User Joined',
    createdAt:new Date().getTime()
});

socket.on('createMessage',(message)=>{
    console.log('Create Message',message);  
    /*SENDNG TO ALL CONNECTED USERS(INCLUDING THE SENDER)
    io.emit('newMessage',{
        from:message.from,
        text:message.text,
        createdAt:new Date().getTime()
    });*/
    /*SENDNG TO ALL CONNECTED USERS(EXCLUDING THE SENDER)
    socket.broadcast.emit('newMessage',{
        from:message.from,
        text:message.text,
        createdAt:new Date().getTime()
    });*/
});

socket.on('disconnect',(socket)=>{
    console.log('User was disconnected');  
});
});
server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
