const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const _ = require('lodash');
import dotenv from 'dotenv';
const bodyParser = require('body-parser');
var mongoose = require('mongoose') 
require('dotenv').config();
mongoose.connect(process.env.MONGODB,{ useNewUrlParser: true });
//'mongodb://localhost:27017/chatApp',{ useNewUrlParser: true });

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const {getRandomColor} = require('./../public/js/libs/generate-color');
const {messSchema} = require('./models/mess');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));
//Models
var mess = mongoose.model("mess", messSchema,"messages"); 

io.on('connection', (socket) => {
  console.log('New user connected');
  var color=getRandomColor();

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    params.room=(params.room).charAt(0).toUpperCase() + (params.room).slice(1).toLowerCase();
    params.name=(params.name).charAt(0).toUpperCase() + (params.name).slice(1).toLowerCase();
    
    var request = new Promise(function(resolve,reject) {
      users.getUserList(params.room,function(res){
        if(res.includes(params.name)){
          reject();
          return callback('User with same name exists. Use another name.');
        }
        else{
          socket.join(params.room);
          users.addUser(socket.id, params.name, params.room, color)
          resolve();
      }
      })
    });
    request.catch(function(err) {
      if (err) {
        console.log('Same username')
      }
   }).then(function(){
          users.getUserList(params.room, function(res){
          io.to(params.room).emit('updateUserList',res);
          console.log(res);
          console.log('Updating List')
        });
      }).then(function(){
          socket.emit('newMessage', generateMessage('Admin', `Welcome to the chat app ${params.name}`,color));
          socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`,color));
          callback();
        })    
    });

  socket.on('createMessage', (message, callback) => {
    users.getUser(socket.id, function(user){
      if(user && isRealString(message.text)){
        io.to(user.room).emit('newMessage', z=generateMessage(user.name, message.text, color));
        var messa = new mess({
          _id :mongoose.Types.ObjectId(),
          userId:user.id,
          from:user.name,
          text:message.text,
          room:user.room,
          createdAt:z.createdAt,
          url:z.url
        });
        messa.save(function(err){
            if(err) throw err;
        });
      }
    callback();
    });   
  });
 
  socket.on('createLocationMessage', (coords) => {
    users.getUser(socket.id, function(user){
      if(user){
        io.to(user.room).emit('newLocationMessage', z=generateLocationMessage(user.name, coords.latitude, coords.longitude,color));
        var messa = new mess({
          _id :mongoose.Types.ObjectId(),
          userId:user.id,
          from:user.name,
          room:user.room,
          createdAt:z.createdAt,
          url:z.url
        });
        messa.save(function(err){
            if(err) throw err;
        });
      }
    });  
  });

  socket.on('disconnect', () => {
    users.removeUser(socket.id, function(use){
      if (use) {
        var request = new Promise(function(resolve,reject) {
          resolve(users.getUserList(use.room, function(ans){
            io.to(use.room).emit('updateUserList',ans);
          }));
        })
        request.then(function(){
          io.to(use.room).emit('newMessage', generateMessage('Admin', `${use.name} has left.`, color));
        })
        }
    });
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});