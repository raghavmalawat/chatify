var mongoose = require('mongoose') 
mongoose.connect('mongodb://localhost:27017/chatApp',{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
const {userSchema} = require('./../models/user');

var us = mongoose.model("us", userSchema,"users");

const {Rooms} = require('./rooms')
var ros = new Rooms();
  class Users {
    getUser (id,callback) {
        us.findOne({_id : id }, function(err,ans){
          callback(ans);
      });
    }

    addUser (id, name, room, color) {
      var newUser = new us({
        _id : id,
        name : name,
        room : room,
        color : color
      });
      newUser.save(function(err){
          if(err) throw err;
      });
      ros.getRoom(room,function(resp){
        if(resp && resp.name){
          ros.updateRoomAdd(name,room,resp.name);
        }
        else{
          ros.addRoom([name],room); 
        }
      });
    }

    removeUser (id,callback) {
      this.getUser(id,function(user){
        us.deleteOne({_id : id }, function(err,ans){
          if(user && user.room){
          ros.getRoom(user.room,function(resp){
            if(resp && (resp.name.length>1)){
              ros.updateRoomDel(user.name,user.room,resp.name);
            }
            else{
              ros.removeRoom(user.room,function(ans){
                console.log("Removed")
              }); 
            }
          });
        }
          callback(user);
        });
      });
    }
    
    getUserList (room,callback){
      us.find({room}, function(err,ans){
        ans = ans.map((ans) => ans.name)
        callback(ans);
        });
      }
    }
  
  module.exports = {Users};