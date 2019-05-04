var mongoose = require('mongoose') 
mongoose.connect('mongodb://localhost:27017/chatApp',{ useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

const {roomSchema} = require('./../models/room');

var ros = mongoose.model("rooms", roomSchema,"rooms"); 

class Rooms {
    getRoom (room,callback) {
        ros.findOne({room}, function(err,ans){
          callback(ans);
      });
    }

    updateRoomAdd(name, room, temp)
    {
        temp.push(name)
        ros.findOneAndUpdate({room},{name:temp},function(resp){
        })
    }

    updateRoomDel(name, room, temp)
    {
      temp = temp.filter(function(value, index, arr){
        return(value!=name);
      });
      ros.findOneAndUpdate({room},{name:temp},function(resp){
      })
    }

    addRoom (nameList, room) {
      var newRoom = new ros({
        _id : mongoose.Types.ObjectId(),
        name : nameList,
        room : room
      });
      newRoom.save(function(err){
          if(err) throw err;
      });
    };
  

    removeRoom (room,callback) {
      this.getRoom(room,function(roomss){
        ros.deleteOne({room : room }, function(err,ans){
          callback(roomss);
        });
      });
    }
  }
  
  module.exports = {Rooms};